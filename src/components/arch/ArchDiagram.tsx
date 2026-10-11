import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

type WireMode = "data" | "control" | "both";

interface Block {
  id: string;
  label: string;
  sub?: string;
  x: number; y: number; w: number; h: number;
  color: string;
}

interface DrawerInfo {
  title: string;
  purpose: string;
  details: string[];
}

const BLOCKS: Block[] = [
  { id: "axi",    label: "AXI-Stream In", sub: "tdata[7:0], tvalid, tlast", x: 20,  y: 120, w: 130, h: 55, color: "#2FE6FF" },
  { id: "regbus", label: "Register Bus",  sub: "reg_wr, reg_rd, addr[7:0]", x: 20,  y: 215, w: 130, h: 55, color: "#F2A33A" },
  { id: "regs",   label: "vsm_regs",      sub: "CTRL THRESH HYST WINDOW…",  x: 220, y: 215, w: 130, h: 55, color: "#F2A33A" },
  { id: "wmem",   label: "vsm_wmem",      sub: "1552 INT8 + 49 INT16 biases",x:220, y: 310, w: 130, h: 55, color: "#FFB020" },
  { id: "fbuf",   label: "Frame Buffer",  sub: "x[16] INT8",                x: 420, y: 80,  w: 120, h: 50, color: "#2FE6FF" },
  { id: "fsm",    label: "Sequencer FSM", sub: "IDLE P1 D1 P2 D2 PO D3",   x: 420, y: 170, w: 120, h: 55, color: "#F2A33A" },
  { id: "state",  label: "State Regs",    sub: "h[16] z[16] rh[16] Q1.14",  x: 420, y: 265, w: 120, h: 55, color: "#2FE6FF" },
  { id: "mac",    label: "Shared MAC",    sub: "16b×8b→24b→32b acc",        x: 600, y: 170, w: 120, h: 55, color: "#7CFF6B" },
  { id: "bias",   label: "Bias+Shift+Sat",sub: "18-bit Q.14, sat ±8",       x: 600, y: 265, w: 120, h: 55, color: "#7CFF6B" },
  { id: "lut",    label: "Sigmoid/Tanh",  sub: "256-entry LUTs each",        x: 600, y: 358, w: 120, h: 55, color: "#7CFF6B" },
  { id: "gate",   label: "Gating Mult",   sub: "17×18 bit: r·h or z·(n-h)", x: 420, y: 358, w: 120, h: 55, color: "#7CFF6B" },
  { id: "score",  label: "Score+EMA+IRQ", sub: "shift EMA, hysteresis alert",x: 420, y: 455, w: 120, h: 55, color: "#FF5C6C" },
  { id: "out",    label: "Outputs",        sub: "score_valid score avg irq",  x: 600, y: 455, w: 120, h: 50, color: "#2FE6FF" },
];

const DRAWER_INFO: Record<string, DrawerInfo> = {
  axi:    { title: "AXI-Stream Input", purpose: "Receives 16 bytes per frame (one INT8 feature per beat). tready = en AND idle AND NOT flush. Early tlast drops the frame.", details: ["tdata[7:0]: one feature per clock", "tvalid / tready handshake", "tlast: last byte of 16-feature frame", "16 beats per complete frame"] },
  regbus: { title: "Register Bus", purpose: "APB-like interface for configuration reads/writes and status polling.", details: ["reg_wr, reg_rd: strobe signals", "reg_addr[7:0]: byte address", "reg_wdata[31:0] / reg_rdata[31:0]", "Weight loading via WADDR/WDATA with auto-increment"] },
  regs:   { title: "vsm_regs", purpose: "10 configuration and status registers accessible over the register bus.", details: ["CTRL: en, flush (self-clearing), irq_en", "THRESH / HYST: alert hysteresis band Q1.14", "WINDOW: EMA shift k (default 4)", "STATUS: busy, alert, frame_done", "SCORE / AVG: latest output values", "WADDR / WDATA: weight write port"] },
  wmem:   { title: "vsm_wmem", purpose: "Weight and bias storage. All values are flop arrays — no SRAM macro.", details: ["1536 INT8 weights (GRU layers)", "16 INT8 output weights (indices 1536–1551)", "49 INT16 biases (bz 0–15, br 16–31, bn 32–47, bo 48)", "Total: 13,200 bits ≈ 92% of design flip-flops", "A memory macro was not tried (limitation)"] },
  fbuf:   { title: "Frame Buffer x[16]", purpose: "Holds the 16 INT8 input features for one complete frame during GRU computation.", details: ["16 × 8-bit registers", "Loaded sequentially from AXI-Stream", "Read by MAC as x[k] during Pass 1 and Pass 2"] },
  fsm:    { title: "Sequencer FSM", purpose: "Controls all 1573 compute cycles for one frame.", details: ["IDLE → P1 (on 16th AXI beat)", "P1: 1024 cycles — z and r gates (2 × 16 × 32 MACs)", "D1: drain pipeline", "P2: 512 cycles — n gate (16 × 32 MACs)", "D2: drain", "PO: 16 cycles — output layer", "D3: score, EMA update, alert", "flush signal returns to IDLE from any state"] },
  state:  { title: "State Registers h/z/rh[16]", purpose: "Persistent GRU hidden state updated every frame.", details: ["h[16]: hidden state, INT16 Q1.14", "z[16]: update gate activations, INT16 Q1.14", "rh[16]: r·h intermediate (reset gate applied), INT16 Q1.14", "16384 = 1.0 in Q1.14 format", "Written back by gating multiplier"] },
  mac:    { title: "Shared MAC", purpose: "Single multiply-accumulate unit time-multiplexed over all 1573 cycles. Saves area at the cost of latency.", details: ["16-bit activation × 8-bit weight", "24-bit product, 32-bit accumulator (Q.20)", "1 MAC shared over 1573 cycles/frame", "Design philosophy: spend cycles to save area"] },
  bias:   { title: "Bias Add / Shift / Saturate", purpose: "Converts the 32-bit accumulator to the 18-bit pre-activation range.", details: ["Adds INT16 bias (Q.14)", "Arithmetic right-shift to align", "Saturate to [-8, 8) — 18-bit Q.14", "Feeds LUT address as lsum[17:10] (upper 8 bits)"] },
  lut:    { title: "Sigmoid & Tanh LUTs", purpose: "Piecewise-constant nonlinearities avoiding division hardware.", details: ["256 entries each, over input [-8, 8)", "Bin centre address: lsum[17:10]", "Output: Q1.14", "Sigmoid max error: 0.0078; Tanh max error: 0.03107"] },
  gate:   { title: "Shared Gating Multiplier", purpose: "Computes either r·h (for the n gate) or z·(n−h) (for the hidden update).", details: ["17 × 18 bit signed multiplier", "Result scaled back to Q1.14", "Critical path endpoint (per Genus report)"] },
  score:  { title: "Score + Shift EMA + Hysteresis Alert", purpose: "Post-processes the output layer result into a running score and alert.", details: ["score = σ(Wo·h + bo)", "avg′ = avg + ((score − avg) >>> k)", "alert asserts when avg < THRESH", "alert clears when avg ≥ THRESH + HYST (hysteresis)", "irq = alert AND irq_en", "Updates vsm_regs STATUS, SCORE, AVG, FRAMES"] },
  out:    { title: "Outputs", purpose: "External signals driven by vsm_top.", details: ["score_valid: pulses one cycle when new score is ready", "score[15:0]: latest output score", "avg[15:0]: running average", "irq: interrupt, gated by irq_en"] },
};

type SVGArrow = { id: string; d: string; mode: "data" | "control" | "both" };

const ARROWS: SVGArrow[] = [
  { id: "axi-fbuf",    d: "M 150 147 H 420",                         mode: "data" },
  { id: "regbus-regs", d: "M 150 242 H 220",                         mode: "control" },
  { id: "regs-fsm",   d: "M 285 215 V 197 H 420",                   mode: "control" },
  { id: "regs-wmem",  d: "M 285 242 V 338 H 220",                   mode: "control" },
  { id: "wmem-mac",   d: "M 350 338 H 370 V 197 H 600",             mode: "data" },
  { id: "fbuf-mac",   d: "M 420 105 H 560 V 197 H 600",            mode: "data" },
  { id: "fsm-mac",    d: "M 540 197 H 600",                          mode: "control" },
  { id: "state-mac",  d: "M 540 292 H 570 V 225 H 600",            mode: "data" },
  { id: "mac-bias",   d: "M 660 225 V 265",                          mode: "data" },
  { id: "bias-lut",   d: "M 660 320 V 358",                          mode: "data" },
  { id: "lut-gate",   d: "M 600 385 H 540",                          mode: "data" },
  { id: "gate-state", d: "M 480 358 V 320",                          mode: "data" },
  { id: "score-regs", d: "M 420 482 H 310 V 270 H 285",            mode: "data" },
  { id: "lut-score",  d: "M 660 413 V 440 H 480 V 455",            mode: "data" },
  { id: "score-out",  d: "M 540 482 H 600",                          mode: "data" },
  { id: "fsm-score",  d: "M 480 225 V 455",                          mode: "control" },
];

function wireColor(mode: WireMode, arrow: SVGArrow): string {
  if (mode === "both") return arrow.mode === "data" ? "#2FE6FF" : "#F2A33A";
  if (mode === "data")    return arrow.mode === "data" ? "#2FE6FF" : "transparent";
  return arrow.mode === "control" ? "#F2A33A" : "transparent";
}

export default function ArchDiagram() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [drawer, setDrawer] = useState<string | null>(null);
  const [wireMode, setWireMode] = useState<WireMode>("both");

  const drawerInfo = drawer ? DRAWER_INFO[drawer] : null;

  const handleBlockClick = useCallback((id: string) => {
    setDrawer((d) => (d === id ? null : id));
  }, []);

  return (
    <div className="space-y-4">
      {/* Wire mode toggle */}
      <div className="flex gap-2 items-center flex-wrap">
        <span className="text-muted text-xs font-mono">Show wires:</span>
        {(["both", "data", "control"] as WireMode[]).map((m) => (
          <button
            key={m}
            onClick={() => setWireMode(m)}
            className={`px-3 py-1 rounded-full text-xs font-mono border transition-all ${
              wireMode === m
                ? m === "data" ? "border-cyan text-cyan bg-cyan/10"
                  : m === "control" ? "border-copper text-copper bg-copper/10"
                  : "border-off-white/40 text-off-white bg-white/5"
                : "border-border text-muted hover:text-off-white"
            }`}
            aria-pressed={wireMode === m}
          >
            {m === "both" ? "Both" : m === "data" ? "Data (cyan)" : "Control (gold)"}
          </button>
        ))}
      </div>

      <div className="flex gap-4 flex-col lg:flex-row">
        {/* SVG diagram */}
        <div className="glass overflow-x-auto flex-1 min-w-0">
          <svg
            viewBox="0 0 760 560"
            width="100%"
            style={{ minWidth: 520, maxWidth: 760 }}
            aria-label="VSM-GRU architecture block diagram"
            role="img"
          >
            {/* vsm_top outline */}
            <rect x="390" y="50" width="360" height="490" rx="10"
              fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" strokeDasharray="6 3" />
            <text x="400" y="68" fill="#8A93A6" fontSize="11" fontFamily="JetBrains Mono">vsm_top</text>

            {/* vsm_core outline */}
            <rect x="400" y="65" width="340" height="360" rx="8"
              fill="rgba(124,255,107,0.02)" stroke="rgba(124,255,107,0.15)" strokeWidth="1" strokeDasharray="4 2" />
            <text x="410" y="82" fill="#7CFF6B" fontSize="10" fontFamily="JetBrains Mono">vsm_core</text>

            {/* Animated signal arrows */}
            <defs>
              <marker id="arrowhead-data" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0 L0,6 L6,3 z" fill="#2FE6FF" />
              </marker>
              <marker id="arrowhead-ctrl" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0 L0,6 L6,3 z" fill="#F2A33A" />
              </marker>
            </defs>

            {ARROWS.map((arrow) => {
              const color = wireColor(wireMode, arrow);
              const isData = arrow.mode === "data";
              const isConnected =
                (hovered && arrow.id.includes(hovered)) ||
                (drawer && arrow.id.includes(drawer));

              return (
                <path
                  key={arrow.id}
                  d={arrow.d}
                  fill="none"
                  stroke={isConnected ? (isData ? "#2FE6FF" : "#F2A33A") : color}
                  strokeWidth={color === "transparent" ? 0 : isConnected ? 2.5 : 1.5}
                  strokeDasharray="8 4"
                  className={color !== "transparent" ? "wire-animated" : undefined}
                  markerEnd={
                    color === "transparent" ? undefined
                      : isData ? "url(#arrowhead-data)" : "url(#arrowhead-ctrl)"
                  }
                  opacity={color === "transparent" ? 0 : isConnected ? 1.0 : 0.7}
                  filter={isConnected ? (isData ? "drop-shadow(0 0 4px #2FE6FF)" : "drop-shadow(0 0 4px #F2A33A)") : undefined}
                  style={{ transition: "opacity 0.2s, stroke-width 0.2s" }}
                />
              );
            })}

            {/* Blocks */}
            {BLOCKS.map((b) => {
              const isHovered = hovered === b.id;
              const isDrawer  = drawer  === b.id;
              return (
                <g
                  key={b.id}
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() => setHovered(b.id)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => handleBlockClick(b.id)}
                  role="button"
                  aria-label={`${b.label} — click for details`}
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleBlockClick(b.id); }}
                >
                  <rect
                    x={b.x} y={b.y} width={b.w} height={b.h} rx="6"
                    fill={isHovered || isDrawer ? `${b.color}25` : "rgba(255,255,255,0.04)"}
                    stroke={isHovered || isDrawer ? b.color : "rgba(255,255,255,0.15)"}
                    strokeWidth={isHovered || isDrawer ? 2 : 1}
                    style={{ transition: "all 0.2s" }}
                    filter={isDrawer ? `drop-shadow(0 0 8px ${b.color}80)` : undefined}
                  />
                  <text x={b.x + b.w / 2} y={b.y + 18} textAnchor="middle"
                    fill={isHovered || isDrawer ? b.color : "#E8ECF4"}
                    fontSize="12" fontFamily="Space Grotesk" fontWeight="600"
                    style={{ transition: "fill 0.2s" }}>
                    {b.label}
                  </text>
                  {b.sub && (
                    <text x={b.x + b.w / 2} y={b.y + 32} textAnchor="middle"
                      fill="#8A93A6" fontSize="9" fontFamily="JetBrains Mono">
                      {b.sub}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Drawer */}
        <AnimatePresence>
          {drawerInfo && (
            <motion.aside
              key={drawer}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
              className="glass p-5 w-full lg:w-72 shrink-0 self-start"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-heading text-base font-bold text-copper">{drawerInfo.title}</h3>
                <button onClick={() => setDrawer(null)} className="text-muted hover:text-off-white ml-2" aria-label="Close">✕</button>
              </div>
              <p className="text-off-white text-sm leading-relaxed mb-4">{drawerInfo.purpose}</p>
              <ul className="space-y-2">
                {drawerInfo.details.map((d) => (
                  <li key={d} className="flex items-start gap-2 text-sm">
                    <span className="text-cyan mt-0.5 shrink-0">›</span>
                    <span className="text-muted font-mono text-xs leading-relaxed">{d}</span>
                  </li>
                ))}
              </ul>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {!drawer && (
        <p className="text-muted text-xs font-mono text-center">Click any block for details · Hover to highlight</p>
      )}
    </div>
  );
}
