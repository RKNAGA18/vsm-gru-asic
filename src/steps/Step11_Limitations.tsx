import project from "../data/project.json";

const WHAT_NEXT = [
  "Clock Gating: Implement enable-based latch gating or custom ICG cell (none in library; 0/14,398 gated)",
  "Memory Architecture: Replace the 13,200-flop array with an SRAM or register file memory macro",
  "Timing Alignment: Harmonize SDC constraint (15.0 ns period = 66.7 MHz) with 100 MHz target",
  "Tape-Out Signoff: Obtain foundry layer map and perform standard-cell GDS merge for DRC/LVS signoff",
  "Reset Tree: Integrate dedicated reset synchronizer cell for clean rst_n deassertion",
  "Buffer Optimization: Buffer the 497 high-fanout nets exceeding the limit of 32",
  "Real Audio Datasets: Train on genuine voice quality data (MOS / PESQ / jitter recordings) rather than synthetic labels",
  "Verification Completeness: Execute code/toggle coverage analysis and fault-injection regressions",
];

export default function Step11_Limitations() {
  const { limitations } = project;

  return (
    <div className="space-y-6">
      <div className="glass p-5">
        <h2 className="font-heading text-xl font-bold text-copper mb-2">Honest Engineering Limitations</h2>
        <p className="text-muted text-sm font-mono">
          Transparent accounting of design trade-offs, tool constraints, and open items as reported to judges:
        </p>
      </div>

      {/* Limitations 2-column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {limitations.map((lim, i) => {
          const isCritical =
            lim.toLowerCase().includes("not tape-out") ||
            lim.toLowerCase().includes("no clock gating") ||
            lim.toLowerCase().includes("1 antenna") ||
            lim.toLowerCase().includes("497 nets");

          return (
            <div
              key={i}
              className={`glass p-4 border-l-4 flex items-start gap-3 ${
                isCritical ? "border-coral/70 bg-coral/5" : "border-amber/70 bg-amber/5"
              }`}
            >
              <span className={`text-base font-bold ${isCritical ? "text-coral" : "text-amber"}`}>
                {isCritical ? "✗" : "⚠"}
              </span>
              <p className="text-off-white text-xs font-mono leading-relaxed">{lim}</p>
            </div>
          );
        })}
      </div>

      {/* What We Would Do Next Box */}
      <div className="glass p-6 border border-cyan/30">
        <h2 className="font-heading text-lg font-semibold text-cyan mb-3">
          Roadmap: What We Would Do Next
        </h2>
        <p className="text-muted text-xs font-mono mb-4">
          Derived strictly from the identified limitations to advance the design toward tape-out readiness:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {WHAT_NEXT.map((item, idx) => (
            <div key={idx} className="flex items-start gap-2.5 glass p-3 border border-border/40">
              <span className="text-lime font-mono text-sm">→</span>
              <span className="text-off-white text-xs font-mono leading-relaxed">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
