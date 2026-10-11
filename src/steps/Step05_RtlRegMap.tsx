import { useState } from "react";
import project from "../data/project.json";

const MODULE_TREE = [
  { indent: 0, name: "vsm_top", desc: "Top-level chip wrapper" },
  { indent: 1, name: "vsm_regs", desc: "Configuration & status registers (CTRL, THRESH, HYST, WINDOW, STATUS, SCORE, AVG, FRAMES, WADDR, WDATA)" },
  { indent: 1, name: "vsm_wmem", desc: "Weight & bias storage flop arrays — 1552 INT8 weights + 49 INT16 biases = 13,200 bits" },
  { indent: 1, name: "vsm_core", desc: "Recurrent compute engine" },
  { indent: 2, name: "Frame buffer x[16]", desc: "INT8, stores 16-feature voice frame from AXI-Stream" },
  { indent: 2, name: "Sequencer FSM", desc: "Controls 1573-cycle execution (IDLE, P1, D1, P2, D2, PO, D3)" },
  { indent: 2, name: "State registers h, z, rh[16]", desc: "INT16 Q1.14 hidden state & activation registers" },
  { indent: 2, name: "Shared MAC", desc: "Time-multiplexed 16-bit act × 8-bit weight → 24-bit product → 32-bit acc" },
  { indent: 2, name: "Bias add / shift / saturate", desc: "Saturates to ±8 (18-bit Q.14 pre-activation)" },
  { indent: 2, name: "Sigmoid & tanh LUTs", desc: "256 entries each, [-8, 8) bin-centre input, Q1.14 output" },
  { indent: 2, name: "Shared gating multiplier", desc: "17 × 18 bit multiplier: computes r·h or z·(n - h)" },
  { indent: 2, name: "Score + EMA + Hysteresis Alert", desc: "Smooths score with shift EMA and drives interrupt irq" },
];

export default function Step05_RtlRegMap() {
  const { ports, registers } = project;
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(text);
      setTimeout(() => setCopied(null), 1500);
    });
  };

  return (
    <div className="space-y-6">
      {/* Module hierarchy */}
      <div className="glass p-5">
        <h2 className="font-heading text-xl font-bold text-copper mb-4">Module Hierarchy & Storage Architecture</h2>
        <div className="space-y-1.5 font-mono text-sm">
          {MODULE_TREE.map((m) => (
            <div
              key={m.name + m.indent}
              className="flex items-baseline gap-2 py-0.5"
              style={{ paddingLeft: `${m.indent * 24}px` }}
            >
              <span className="text-muted text-xs">
                {m.indent === 0 ? "■ " : m.indent === 1 ? "├── " : "│   └── "}
              </span>
              <span className="text-cyan font-bold">{m.name}</span>
              <span className="text-muted text-xs font-body font-normal">— {m.desc}</span>
            </div>
          ))}
        </div>

        {/* Storage Note Callout */}
        <div className="mt-5 glass p-4 border-l-4 border-copper/60 bg-copper/5">
          <h3 className="font-heading text-sm font-bold text-copper mb-1">Storage Organization Note:</h3>
          <p className="text-off-white text-xs font-mono leading-relaxed">
            1552 INT8 weights + 49 INT16 biases = <strong>13,200 bits</strong> implemented as standard flip-flop arrays, indexed via &#123;g, j, k&#125;. Output weights stored at indices 1536–1551. Biases arranged as bz 0–15, br 16–31, bn 32–47, bo 48.
          </p>
        </div>
      </div>

      {/* Ports table */}
      <div className="glass overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <h2 className="font-heading text-lg font-semibold text-off-white">Top-Level Ports</h2>
        </div>
        <table className="mono-table">
          <thead>
            <tr>
              <th className="w-1/3">Port Group</th>
              <th>Signals</th>
            </tr>
          </thead>
          <tbody>
            {ports.map(([group, signals]) => (
              <tr key={group}>
                <td className="text-copper font-semibold">{group}</td>
                <td className="text-cyan">{signals}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Register map table with click-to-copy */}
      <div className="glass overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex justify-between items-center">
          <div>
            <h2 className="font-heading text-lg font-semibold text-off-white">Register Map</h2>
            <p className="text-muted text-xs font-mono mt-0.5">Click any hex offset to copy to clipboard</p>
          </div>
          {copied && (
            <span className="text-xs font-mono text-lime bg-lime/10 px-2.5 py-1 rounded border border-lime/30">
              Copied {copied}!
            </span>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="mono-table">
            <thead>
              <tr>
                <th className="w-24">Offset</th>
                <th className="w-28">Name</th>
                <th>Description</th>
                <th className="w-24">Reset</th>
              </tr>
            </thead>
            <tbody>
              {registers.map(([addr, name, desc, reset]) => (
                <tr key={addr}>
                  <td>
                    <button
                      onClick={() => copy(addr)}
                      className="text-copper hover:text-lime transition-colors cursor-pointer font-bold font-mono px-1.5 py-0.5 rounded hover:bg-white/5"
                      title={`Copy ${addr}`}
                      aria-label={`Copy address ${addr}`}
                    >
                      {addr}
                    </button>
                  </td>
                  <td className="text-cyan font-bold">{name}</td>
                  <td className="text-muted text-xs font-mono">{desc}</td>
                  <td className="text-off-white font-mono">{reset}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
