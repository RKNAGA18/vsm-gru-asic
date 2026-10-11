import project from "../data/project.json";
import MonitorFrame from "../components/MonitorFrame";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function Step06_RtlVerification() {
  const v = project.verification;
  const errorData = v.error.map(([source, max, mean, rms]) => ({
    source,
    max,
    mean,
    rms,
  }));

  return (
    <div className="space-y-6">
      {/* Waveform screenshot */}
      <MonitorFrame
        filename="fig01_rtl_waveform_simvision.jpeg"
        figNum={1}
        alt="Cadence SimVision RTL waveform display demonstrating 16-beat AXI-Stream frame transactions, GRU hidden state progressions, score updates, and alert assertions over 1573 cycles per frame"
        caption="SimVision RTL testbench waveform — 1573 cycles/frame"
        source="Cadence SimVision"
      />

      {/* Regression Results Table */}
      <div className="glass overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <h2 className="font-heading text-lg font-semibold text-off-white">Regression Summary</h2>
          <p className="text-muted text-xs font-mono mt-0.5">Testbench runs across multiple pseudo-random seeds</p>
        </div>
        <table className="mono-table">
          <thead>
            <tr>
              <th>Testbench Run</th>
              <th>Frames Processed</th>
              <th>Mismatches</th>
              <th>Measured Latency</th>
            </tr>
          </thead>
          <tbody>
            {v.regression.map(([test, frames, errors, latency]) => (
              <tr key={test}>
                <td className="text-off-white font-semibold">{test}</td>
                <td className="text-lime">{frames}</td>
                <td className="text-lime font-bold">{errors}</td>
                <td className="text-muted font-mono text-xs">
                  {latency}
                  {test.includes("Gate-level") && (
                    <span className="chip chip-warn ml-2">functional only — no SDF</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Directed Tests Chips */}
      <div className="glass p-5">
        <h2 className="font-heading text-lg font-semibold text-off-white mb-2">Directed Edge-Case Tests</h2>
        <p className="text-muted text-xs font-mono mb-4">Corner-case and fault injection scenarios verified in simulation</p>
        <div className="flex flex-wrap gap-2">
          {v.directed.map((t) => (
            <span key={t} className="chip chip-met text-xs">
              ✓ {t}
            </span>
          ))}
        </div>
      </div>

      {/* Error Analysis Bar Chart */}
      <div className="glass p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="font-heading text-lg font-semibold text-off-white">Quantisation & RTL Error Analysis</h2>
            <p className="text-muted text-xs font-mono mt-0.5">Fixed-point vs 64-bit float golden model error metrics</p>
          </div>
        </div>
        <div style={{ height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={errorData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
              <XAxis dataKey="source" tick={{ fill: "#8A93A6", fontSize: 11 }} />
              <YAxis tick={{ fill: "#8A93A6", fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: "#0a0d14", border: "1px solid rgba(47,230,255,0.3)" }}
                labelStyle={{ color: "#E8ECF4", fontWeight: "bold" }}
              />
              <Legend wrapperStyle={{ color: "#8A93A6", fontSize: 12 }} />
              <Bar dataKey="max" name="Max Error" fill="#FF5C6C" radius={[4, 4, 0, 0]} />
              <Bar dataKey="mean" name="Mean Error" fill="#F2A33A" radius={[4, 4, 0, 0]} />
              <Bar dataKey="rms" name="RMS Error" fill="#2FE6FF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* LUT Accuracy & Correlation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LUT Error Card */}
        <div className="glass p-5">
          <h2 className="font-heading text-base font-semibold text-off-white mb-3">256-Entry Activation LUT Accuracy</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="glass p-3 border border-border">
              <p className="text-muted text-xs font-mono">Sigmoid Max Error</p>
              <p className="text-lime text-xl font-bold font-heading">{v.lut.sigmoidMax}</p>
            </div>
            <div className="glass p-3 border border-border">
              <p className="text-muted text-xs font-mono">Sigmoid Mean Error</p>
              <p className="text-lime text-xl font-bold font-heading">{v.lut.sigmoidMean}</p>
            </div>
            <div className="glass p-3 border border-border">
              <p className="text-muted text-xs font-mono">Tanh Max Error</p>
              <p className="text-lime text-xl font-bold font-heading">{v.lut.tanhMax}</p>
            </div>
            <div className="glass p-3 border border-border">
              <p className="text-muted text-xs font-mono">Tanh Mean Error</p>
              <p className="text-lime text-xl font-bold font-heading">{v.lut.tanhMean}</p>
            </div>
          </div>
        </div>

        {/* Correlation Callouts */}
        <div className="glass p-5">
          <h2 className="font-heading text-base font-semibold text-off-white mb-3">Correlation Metrics</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center glass p-3 border border-border">
              <div>
                <p className="text-off-white font-mono text-sm">Score: Float vs RTL</p>
                <p className="text-muted text-xs font-mono">Alert decisions differing: {v.correlation.alertDecisionsDiffering}</p>
              </div>
              <span className="text-lime font-heading text-2xl font-bold">{v.correlation.scoreFloatVsRtl}</span>
            </div>
            <div className="flex justify-between items-center glass p-3 border border-border">
              <div>
                <p className="text-off-white font-mono text-sm">Avg vs Label <span className="text-amber text-xs">(synthetic labels)</span></p>
                <p className="text-muted text-xs font-mono">Declared Target: &gt; {v.correlation.target}</p>
              </div>
              <span className="text-lime font-heading text-2xl font-bold">{v.correlation.avgVsLabel}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Long-Stream Card */}
      <div className="glass p-5">
        <h2 className="font-heading text-base font-semibold text-off-white mb-3">Long-Stream Stress Test</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono text-xs">
          <div className="glass p-3">
            <span className="text-muted block">Frames</span>
            <span className="text-copper text-lg font-bold">{v.longStream.frames.toLocaleString()}</span>
          </div>
          <div className="glass p-3">
            <span className="text-muted block">Call Duration</span>
            <span className="text-off-white text-sm font-bold">{v.longStream.duration}</span>
          </div>
          <div className="glass p-3">
            <span className="text-muted block">Hidden State Peak</span>
            <span className="text-off-white text-sm font-bold">{v.longStream.hMax}</span>
          </div>
          <div className="glass p-3">
            <span className="text-muted block">Alert Assertions</span>
            <span className="text-amber text-lg font-bold">{v.longStream.alertAssertions}</span>
          </div>
          <div className="glass p-3">
            <span className="text-muted block">Continuity</span>
            <span className="chip chip-met mt-1">{v.longStream.continuity}</span>
          </div>
        </div>
        <p className="text-amber text-xs font-mono mt-3">
          ⚠ {v.longStream.note}
        </p>
      </div>

      {/* Small italic disclaimer */}
      <div className="glass p-3 border-l-2 border-coral/50">
        <p className="text-coral text-xs font-mono italic">
          Not run: {v.notRun.join(", ")}
        </p>
      </div>
    </div>
  );
}
