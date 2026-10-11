import { useState, useEffect, useRef } from "react";
import project from "../../data/project.json";

export default function CyclePlayer() {
  const [cycle, setCycle] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(2); // cycle speed multiplier
  const animRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  const totalCycles = project.cycleTotal; // 1573

  // Phases mapping:
  // 0 - 1023: Pass 1 (P1)
  // 1024 - 1033: Drain 1 (D1) (10 cycles)
  // 1034 - 1545: Pass 2 (P2) (512 cycles)
  // 1546 - 1551: Drain 2 (D2) (6 cycles)
  // 1552 - 1567: Output Pass (PO) (16 cycles)
  // 1568 - 1572: Drain 3 (D3) (5 cycles)
  // 1573: IDLE / Complete
  const getFsmState = (c: number) => {
    if (c === 0) return { name: "IDLE", desc: "Awaiting 16-beat AXI-Stream frame; tready asserted" };
    if (c <= 1024) return { name: "P1", desc: "Pass 1: Computing z and r gate pre-activations (1024 MAC ops)" };
    if (c <= 1034) return { name: "D1", desc: "Drain 1: Pipeline flush for z, r activations & gating product" };
    if (c <= 1546) return { name: "P2", desc: "Pass 2: Computing candidate state n pre-activations (512 MAC ops)" };
    if (c <= 1552) return { name: "D2", desc: "Drain 2: Pipeline flush for n tanh & state blending" };
    if (c <= 1568) return { name: "PO", desc: "PO: Output layer projection (16 MAC ops)" };
    if (c <= 1572) return { name: "D3", desc: "Drain 3: Sigmoid LUT, EMA shift filter & alert hysteresis eval" };
    return { name: "IDLE", desc: "Frame complete. Score & alert registered. Ready for next frame." };
  };

  const currentState = getFsmState(cycle);

  useEffect(() => {
    if (!isPlaying) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      lastTimeRef.current = null;
      return;
    }

    const step = (time: number) => {
      if (lastTimeRef.current !== null) {
        const delta = time - lastTimeRef.current;
        // increment proportional to speed (cycles per frame)
        const cyclesToAdd = Math.max(1, Math.round((delta / 16) * playbackSpeed * 4));
        setCycle((prev) => {
          const next = prev + cyclesToAdd;
          if (next >= totalCycles) {
            setIsPlaying(false);
            return totalCycles;
          }
          return next;
        });
      }
      lastTimeRef.current = time;
      animRef.current = requestAnimationFrame(step);
    };

    animRef.current = requestAnimationFrame(step);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPlaying, playbackSpeed, totalCycles]);

  const p1Pct = (1024 / totalCycles) * 100;
  const p2Pct = (512 / totalCycles) * 100;
  const poPct = (16 / totalCycles) * 100;
  const drainPct = (21 / totalCycles) * 100;

  const currentProgress = (cycle / totalCycles) * 100;

  // Active datapath highlight based on cycle
  const isP1 = cycle > 0 && cycle <= 1024;
  const isD1 = cycle > 1024 && cycle <= 1034;
  const isP2 = cycle > 1034 && cycle <= 1546;
  const isD2 = cycle > 1546 && cycle <= 1552;
  const isPO = cycle > 1552 && cycle <= 1568;
  const isD3 = cycle > 1568 && cycle <= 1572;

  return (
    <div className="space-y-6">
      {/* Top Banner / Philosophy */}
      <div className="glass p-5 border-l-4 border-cyan/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-heading text-xl font-bold text-cyan">Cycle Sequencer & Frame Execution Timeline</h2>
          <p className="text-muted text-sm mt-1">
            Deterministic 1573-cycle pipeline driven by FSM sequencer. One shared MAC multiplexed across all gates.
          </p>
        </div>
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="glass px-3 py-1.5 border border-border">
            <span className="text-muted">Target: </span>
            <span className="text-lime font-bold">&lt; 1.0 ms</span>
          </div>
          <div className="glass px-3 py-1.5 border border-border">
            <span className="text-muted">@100MHz: </span>
            <span className="text-cyan font-bold">15.73 µs</span>
          </div>
          <div className="glass px-3 py-1.5 border border-border">
            <span className="text-muted">@15ns SDC: </span>
            <span className="text-amber font-bold">23.60 µs</span>
          </div>
        </div>
      </div>

      {/* Main Player Card */}
      <div className="glass p-6 space-y-6">
        {/* Controls & Counter */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/50 pb-5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (cycle >= totalCycles) setCycle(0);
                setIsPlaying(!isPlaying);
              }}
              className="btn-glow btn-copper px-5 py-2.5 flex items-center gap-2"
              aria-label={isPlaying ? "Pause cycle playback" : "Play cycle playback"}
            >
              <span>{isPlaying ? "⏸ Pause" : cycle >= totalCycles ? "↺ Replay" : "▶ Play"}</span>
            </button>
            <button
              onClick={() => {
                setIsPlaying(false);
                setCycle(0);
              }}
              className="btn-glow btn-cyan px-3 py-2 text-xs"
              aria-label="Reset to cycle 0"
            >
              Reset
            </button>
            <button
              onClick={() => {
                setIsPlaying(false);
                setCycle(totalCycles);
              }}
              className="btn-glow btn-lime px-3 py-2 text-xs"
              aria-label="Jump to cycle 1573"
            >
              Finish (1573)
            </button>
          </div>

          {/* Speed Selector */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-muted">Speed:</span>
            {[1, 2, 4, 8].map((s) => (
              <button
                key={s}
                onClick={() => setPlaybackSpeed(s)}
                className={`px-2.5 py-1 rounded border transition-colors ${
                  playbackSpeed === s
                    ? "border-cyan text-cyan bg-cyan/10 font-bold"
                    : "border-border text-muted hover:text-off-white"
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Live Counter Display */}
          <div className="flex items-baseline gap-2 font-mono bg-chip px-4 py-2 rounded-lg border border-border">
            <span className="text-muted text-xs">CYCLE:</span>
            <span className="text-2xl font-bold text-copper tracking-wider">
              {String(cycle).padStart(4, "0")}
            </span>
            <span className="text-muted text-sm">/ {totalCycles}</span>
          </div>
        </div>

        {/* Interactive Scrub Bar & Timeline */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-mono text-muted">
            <span>Pass 1 (1024 c)</span>
            <span>Pass 2 (512 c)</span>
            <span>Out (16 c)</span>
            <span>Drains (21 c)</span>
          </div>

          {/* Segmented Timeline */}
          <div className="relative h-7 rounded-lg overflow-hidden flex bg-chip border border-border/80">
            {/* Playhead marker */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-white z-20 shadow-[0_0_12px_#ffffff] transition-all pointer-events-none"
              style={{ left: `${currentProgress}%` }}
            />

            {/* Pass 1 Segment */}
            <div
              style={{ width: `${p1Pct}%` }}
              className={`h-full border-r border-border/40 flex items-center justify-center text-[11px] font-mono transition-colors ${
                isP1 ? "bg-cyan/30 text-cyan font-bold" : "bg-cyan/10 text-cyan/70"
              }`}
            >
              P1: z & r (1024)
            </div>

            {/* Pass 2 Segment */}
            <div
              style={{ width: `${p2Pct}%` }}
              className={`h-full border-r border-border/40 flex items-center justify-center text-[11px] font-mono transition-colors ${
                isP2 ? "bg-amber/30 text-amber font-bold" : "bg-amber/10 text-amber/70"
              }`}
            >
              P2: n gate (512)
            </div>

            {/* Output Segment */}
            <div
              style={{ width: `${poPct}%` }}
              className={`h-full border-r border-border/40 flex items-center justify-center text-[10px] font-mono transition-colors ${
                isPO ? "bg-lime/30 text-lime font-bold" : "bg-lime/10 text-lime/70"
              }`}
            >
              PO (16)
            </div>

            {/* Drain Segment */}
            <div
              style={{ width: `${drainPct}%` }}
              className={`h-full flex items-center justify-center text-[10px] font-mono transition-colors ${
                isD1 || isD2 || isD3 ? "bg-coral/30 text-coral font-bold" : "bg-coral/10 text-coral/70"
              }`}
            >
              Drain
            </div>
          </div>

          {/* Slider input for scrubbing */}
          <input
            type="range"
            min={0}
            max={totalCycles}
            value={cycle}
            onChange={(e) => {
              setIsPlaying(false);
              setCycle(Number(e.target.value));
            }}
            className="w-full h-2 bg-chip rounded-lg appearance-none cursor-pointer accent-copper"
            aria-label="Cycle scrub slider"
          />
        </div>

        {/* Current State Info Banner */}
        <div className="glass p-4 border border-border flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs px-2.5 py-1 rounded bg-copper/20 text-copper font-bold border border-copper/40">
              STATE: {currentState.name}
            </span>
            <span className="text-off-white text-sm font-body">{currentState.desc}</span>
          </div>
          <div className="text-muted text-xs font-mono">
            Elapsed at 100MHz: <span className="text-cyan">{(cycle * 0.01).toFixed(2)} µs</span> | at 15ns:{" "}
            <span className="text-amber">{(cycle * 0.015).toFixed(2)} µs</span>
          </div>
        </div>
      </div>

      {/* State Diagram with Active State Highlight */}
      <div className="glass p-6">
        <h3 className="font-heading text-lg font-bold text-copper mb-4">
          FSM Sequencer State Machine
        </h3>
        <p className="text-muted text-xs font-mono mb-4">
          Transitions automatically sequenced: IDLE → P1 → D1 → P2 → D2 → PO → D3 → IDLE.
          (flush resets immediately from any state; early tlast drops frame).
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            {
              id: "IDLE",
              label: "IDLE",
              cond: "16th beat accepted → P1",
              active: currentState.name === "IDLE",
              note: "tready = en & idle & ~flush",
            },
            {
              id: "P1",
              label: "P1 (Pass 1)",
              cond: "z & r gates done (1024 c)",
              active: currentState.name === "P1",
              note: "2 gates × 16 units × 32 MACs",
            },
            {
              id: "D1",
              label: "D1 (Drain 1)",
              cond: "pipeline drained → P2",
              active: currentState.name === "D1",
              note: "Latch z[16], r[16], r·h",
            },
            {
              id: "P2",
              label: "P2 (Pass 2)",
              cond: "n gate done (512 c)",
              active: currentState.name === "P2",
              note: "16 units × 32 MACs",
            },
            {
              id: "D2",
              label: "D2 (Drain 2)",
              cond: "pipeline drained → PO",
              active: currentState.name === "D2",
              note: "tanh & state blend h'",
            },
            {
              id: "PO",
              label: "PO (Output)",
              cond: "output pass done (16 c)",
              active: currentState.name === "PO",
              note: "16 MACs with h'",
            },
            {
              id: "D3",
              label: "D3 (Score)",
              cond: "score/EMA updated → IDLE",
              active: currentState.name === "D3",
              note: "Score sigmoid, EMA, alert",
            },
          ].map((st, i) => (
            <div
              key={st.id}
              className={`p-3 rounded-lg border flex flex-col justify-between transition-all ${
                st.active
                  ? "border-copper bg-copper/20 shadow-[0_0_15px_rgba(242,163,58,0.4)] scale-105"
                  : "border-border bg-chip/40 text-muted"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-mono text-xs font-bold ${st.active ? "text-copper" : "text-muted"}`}>
                    S{i}: {st.id}
                  </span>
                  {st.active && <span className="w-2 h-2 rounded-full bg-lime animate-ping" />}
                </div>
                <div className="text-[11px] text-off-white font-medium mb-2">{st.label}</div>
              </div>
              <div>
                <div className="text-[10px] font-mono text-cyan/90 border-t border-white/5 pt-1 mb-1">
                  {st.cond}
                </div>
                <div className="text-[9px] text-muted font-mono">{st.note}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Per-gate Datapath Strip */}
      <div className="glass p-6">
        <h3 className="font-heading text-lg font-bold text-cyan mb-2">
          Active Datapath Pipeline Execution
        </h3>
        <p className="text-muted text-xs font-mono mb-4">
          Visualizing active operands, computation stages, and writebacks for the current cycle:
        </p>

        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          {/* Stage 1: Operand Select */}
          <div
            className={`p-3 rounded border flex-1 min-w-[150px] transition-all ${
              isP1 || isP2 || isPO
                ? "border-cyan bg-cyan/15 text-off-white"
                : "border-border bg-chip/30 text-muted"
            }`}
          >
            <div className="text-[10px] text-cyan uppercase font-bold mb-1">1. Operand Select</div>
            <div className="text-[11px]">
              {isP1
                ? "k<16: x[k], k≥16: h[k]"
                : isP2
                ? "k<16: x[k], k≥16: (r⊙h)[k]"
                : isPO
                ? "Input: h'[k]"
                : "Inactive / Stalled"}
            </div>
          </div>

          <span className="text-muted font-bold">→</span>

          {/* Stage 2: Shared MAC */}
          <div
            className={`p-3 rounded border flex-1 min-w-[150px] transition-all ${
              isP1 || isP2 || isPO
                ? "border-copper bg-copper/15 text-off-white"
                : "border-border bg-chip/30 text-muted"
            }`}
          >
            <div className="text-[10px] text-copper uppercase font-bold mb-1">2. 16×8 Shared MAC</div>
            <div className="text-[11px]">
              {isP1 || isP2 || isPO
                ? "Act(16b) × W(8b) → Acc(32b Q.20)"
                : "Pipeline draining / idle"}
            </div>
          </div>

          <span className="text-muted font-bold">→</span>

          {/* Stage 3: Bias & Shift */}
          <div
            className={`p-3 rounded border flex-1 min-w-[150px] transition-all ${
              isP1 || isP2 || isPO || isD1 || isD2
                ? "border-amber bg-amber/15 text-off-white"
                : "border-border bg-chip/30 text-muted"
            }`}
          >
            <div className="text-[10px] text-amber uppercase font-bold mb-1">3. Bias + Shift + Sat</div>
            <div className="text-[11px]">
              +bias(&lt;&lt;6), &gt;&gt;&gt;6, sat [-8, 8)
            </div>
          </div>

          <span className="text-muted font-bold">→</span>

          {/* Stage 4: Activation LUT */}
          <div
            className={`p-3 rounded border flex-1 min-w-[150px] transition-all ${
              isD1 || isD2 || isD3
                ? "border-lime bg-lime/15 text-off-white"
                : "border-border bg-chip/30 text-muted"
            }`}
          >
            <div className="text-[10px] text-lime uppercase font-bold mb-1">4. 256-Entry LUT</div>
            <div className="text-[11px]">
              {isD1 ? "Sigmoid: z[j], r[j]" : isD2 ? "Tanh: n[j]" : isD3 ? "Sigmoid: score" : "Index: lsum[17:10]"}
            </div>
          </div>

          <span className="text-muted font-bold">→</span>

          {/* Stage 5: Gating Mult & Writeback */}
          <div
            className={`p-3 rounded border flex-1 min-w-[160px] transition-all ${
              isD1 || isD2 || isD3
                ? "border-coral bg-coral/15 text-off-white"
                : "border-border bg-chip/30 text-muted"
            }`}
          >
            <div className="text-[10px] text-coral uppercase font-bold mb-1">5. Gating Mult & Update</div>
            <div className="text-[11px]">
              {isD1
                ? "Write z[j], compute r·h"
                : isD2
                ? "h'[j] = h + z·(n - h)"
                : isD3
                ? "EMA avg' & alert irq"
                : "Wait for drain"}
            </div>
          </div>
        </div>
      </div>

      {/* EMA and Alert Hysteresis Conceptual Diagram */}
      <div className="glass p-6">
        <h3 className="font-heading text-lg font-bold text-off-white mb-2">
          EMA Smoothing & Hysteresis Alert Logic
        </h3>
        <p className="text-muted text-xs font-mono mb-4">
          Conceptual diagram showing alert assertion when avg &lt; THRESH and deassertion when avg &gt;= THRESH + HYST.
          Shift parameter k = 4 (window ≈ 16 frames).
        </p>

        <div className="relative h-44 w-full bg-chip/60 border border-border rounded-lg p-4 overflow-hidden">
          {/* Threshold Lines */}
          <div className="absolute left-0 right-0 top-12 border-b border-dashed border-coral/60 flex items-center justify-between px-3">
            <span className="text-[10px] font-mono text-coral font-bold bg-chip px-1">
              Clear Band: THRESH + HYST (10830 Q1.14)
            </span>
            <span className="text-[10px] font-mono text-coral/70">Alert Clears when avg ≥ this level</span>
          </div>

          <div className="absolute left-0 right-0 top-24 border-b border-dashed border-amber/60 flex items-center justify-between px-3">
            <span className="text-[10px] font-mono text-amber font-bold bg-chip px-1">
              Assert Threshold: THRESH (9830 Q1.14)
            </span>
            <span className="text-[10px] font-mono text-amber/70">Alert Triggers when avg &lt; this level</span>
          </div>

          {/* Conceptual Hysteresis Band */}
          <div className="absolute left-0 right-0 top-12 bottom-20 bg-amber/5 pointer-events-none flex items-center justify-center">
            <span className="text-[11px] font-mono text-muted/60 uppercase tracking-widest">
              Hysteresis Deadband (HYST = 1000) Prevents Chatter
            </span>
          </div>

          {/* Bottom Alert Status Indicators */}
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs font-mono border-t border-border pt-2">
            <span className="text-lime">Stable Voice Zone (Normal, Alert = 0)</span>
            <span className="text-amber">Hysteresis Zone (Maintains previous state)</span>
            <span className="text-coral">Instability Alert Zone (irq = 1 if irq_en)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
