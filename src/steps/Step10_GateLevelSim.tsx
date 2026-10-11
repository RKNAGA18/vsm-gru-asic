import project from "../data/project.json";

export default function Step10_GateLevelSim() {
  const v = project.verification;
  const glsRow = v.regression[v.regression.length - 1]; // Gate-level test row

  return (
    <div className="space-y-6">
      {/* Caveat Banner */}
      <div className="glass p-4 border-l-4 border-amber/60 bg-amber/5">
        <p className="text-amber font-mono text-sm leading-relaxed">
          ⚠ <strong>Methodology Caveat:</strong> Gate-level simulation was run with the post-route netlist in <strong>functional mode only</strong> — SDF back-annotated interconnect delays were NOT applied. Full timing validation was accomplished via Tempus STA signoff.
        </p>
      </div>

      {/* Gate Level Sim Table */}
      <div className="glass overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <h2 className="font-heading text-lg font-semibold text-off-white">Gate-Level Simulation Result</h2>
          <p className="text-muted text-xs font-mono mt-0.5">Cadence ncsim simulation using post-route Verilog netlist</p>
        </div>
        <table className="mono-table">
          <thead>
            <tr>
              <th>Simulation Suite</th>
              <th>Frames Processed</th>
              <th>Mismatches</th>
              <th>Latency / Mode</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="text-off-white font-semibold">{glsRow[0]}</td>
              <td className="text-lime font-bold">{glsRow[1]}</td>
              <td className="text-lime font-bold">{glsRow[2]}</td>
              <td className="text-muted font-mono text-xs">
                {glsRow[3]}
                <span className="chip chip-warn ml-2">functional only — no SDF</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* SAIF to Power Generation Flow Graphic */}
      <div className="glass p-6">
        <h2 className="font-heading text-lg font-semibold text-off-white mb-2">
          Dynamic SAIF → Tempus Signoff Flow
        </h2>
        <p className="text-muted text-xs font-mono mb-6">
          How real switching activity was recorded and applied to signoff power calculation:
        </p>

        <div className="flex flex-wrap items-center justify-between gap-3">
          {[
            { step: "1. Post-Route Netlist", desc: "Innovus output Verilog" },
            { step: "2. ncsim Simulation", desc: "200 frames testbench execution" },
            { step: "3. vsm.saif Generation", desc: "Switching activity file dump" },
            { step: "4. Tempus Power Engine", desc: "Read SAIF on slow.lib (1.62 V)" },
            { step: "5. 23.88 mW Signoff", desc: "Accurate dynamic power metric" },
          ].map((item, i, arr) => (
            <div key={item.step} className="flex items-center gap-3">
              <div className="glass p-3.5 rounded-lg border border-border min-w-[140px] text-center">
                <span className="text-xs font-mono text-cyan font-bold block mb-1">{item.step}</span>
                <span className="text-[11px] text-muted font-mono">{item.desc}</span>
              </div>
              {i < arr.length - 1 && (
                <span className="text-copper font-bold text-lg hidden sm:inline" aria-hidden>→</span>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 glass p-3 border border-border/40 font-mono text-xs text-muted">
          {project.signoff.note}
        </div>
      </div>

      {/* Latency Reminder */}
      <div className="glass p-4 border-l-4 border-cyan/60">
        <p className="text-cyan font-mono text-sm">
          Latency validation: Measured <strong>1573 cycles/frame</strong> across RTL and Gate-level simulations. Equivalent to <strong>15.73 µs</strong> (at 100 MHz assumption) and <strong>23.6 µs</strong> (at 15 ns SDC clock period). Both far exceed the requirement of &lt; 1 ms.
        </p>
      </div>
    </div>
  );
}
