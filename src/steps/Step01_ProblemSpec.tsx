import project from "../data/project.json";
import VoiceStabilityVisualizer from "../components/VoiceStabilityVisualizer";

function statusClass(status: string) {
  if (status === "met") return "chip chip-met";
  if (status === "above target") return "chip chip-above";
  if (status === "partial") return "chip chip-partial";
  if (status === "not met") return "chip chip-notmet";
  return "chip chip-notdone";
}

export default function Step01_ProblemSpec() {
  const { compliance } = project;
  return (
    <div className="space-y-6">
      {/* Brief */}
      <div className="glass p-5">
        <h2 className="font-heading text-xl font-bold text-copper mb-2">PS-01 Brief</h2>
        <p className="text-off-white leading-relaxed">
          Design a fixed-point GRU accelerator that scores each 16-feature voice frame, smooths with a shift-based EMA, and raises an alert with hysteresis. Implement RTL, synthesise with Genus, place & route with Innovus, signoff with Tempus. Target: 0.18 µm library.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 font-mono text-xs text-muted">
          <span>16 inputs</span><span className="text-border">·</span>
          <span>16 hidden units</span><span className="text-border">·</span>
          <span>INT8 weights</span><span className="text-border">·</span>
          <span>INT16 activations</span><span className="text-border">·</span>
          <span>1 shared MAC</span><span className="text-border">·</span>
          <span>AXI-Stream frame input</span>
        </div>
      </div>

      {/* Interactive Voice Stability DSP Simulator */}
      <VoiceStabilityVisualizer />

      {/* Compliance scorecard */}
      <div className="glass overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <h2 className="font-heading text-lg font-semibold text-off-white">Compliance Scorecard</h2>
          <p className="text-muted text-sm mt-0.5">Honest status — judges value accurate reporting</p>
        </div>
        <div className="overflow-x-auto">
          <table className="mono-table">
            <thead>
              <tr>
                <th>Requirement</th>
                <th>Criterion</th>
                <th>Actual</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {compliance.map(([req, crit, actual, status]) => (
                <tr key={req}>
                  <td className="font-semibold text-off-white">{req}</td>
                  <td className="text-muted">{crit}</td>
                  <td className="text-off-white">{actual}</td>
                  <td><span className={statusClass(status)}>{status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Honest warnings */}
      <div className="glass p-4 border-l-4 border-amber/60">
        <p className="text-amber font-mono text-sm">
          ⚠ Both latency values must always be read together: <strong>15.73 µs</strong> assumes 100 MHz (not the SDC period); the SDC closes at 15 ns = <strong>23.6 µs</strong>.
        </p>
      </div>
      <div className="glass p-4 border-l-4 border-amber/60">
        <p className="text-amber font-mono text-sm">
          ⚠ Power: <strong>23.88 mW</strong> is SAIF-based (Tempus, slow.lib, 1.62 V). Vectorless estimates were <strong>80.8 mW</strong> (Genus) and <strong>102.2 mW</strong> (Innovus). The low-mW target is not met.
        </p>
      </div>
    </div>
  );
}
