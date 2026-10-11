import project from "../data/project.json";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, LabelList } from "recharts";

export default function Step09_Signoff() {
  const { signoff, powerCompare } = project;
  const pb = signoff.powerBreakdownMw;

  const pieData = [
    { name: "Internal Power", value: pb.internal, color: "#F2A33A" },
    { name: "Switching Power", value: pb.switching, color: "#2FE6FF" },
    { name: "Leakage Power", value: pb.leakage, color: "#8A93A6" },
  ];

  const compareData = powerCompare.map(([label, val]) => ({
    label,
    value: val,
  }));

  return (
    <div className="space-y-6">
      {/* Signoff Status Alert */}
      <div className="glass p-4 border-l-4 border-lime/60 bg-lime/5">
        <p className="text-lime font-mono text-sm">
          ✓ Timing signoff achieved: Zero setup and hold violators across slow and fast corners. Power evaluated with dynamic simulation switching (SAIF).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Signoff Timing & Power Metrics */}
        <div className="glass overflow-hidden">
          <div className="px-5 py-3 border-b border-border">
            <h2 className="font-heading text-lg font-semibold text-off-white">Timing & Power Signoff</h2>
            <p className="text-muted text-xs font-mono mt-0.5">{signoff.tool}</p>
          </div>
          <table className="mono-table">
            <tbody>
              {signoff.rows.map(([label, value]) => {
                const isSlack = label.toLowerCase().includes("slack") || label.toLowerCase().includes("setup") || label.toLowerCase().includes("hold");
                return (
                  <tr key={label}>
                    <td className="text-muted text-xs font-mono">{label}</td>
                    <td className="text-off-white font-mono text-sm">
                      {isSlack ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-lime/15 text-lime border border-lime/30 font-bold">
                          {value}
                        </span>
                      ) : (
                        value
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Dynamic Power Breakdown Donut */}
        <div className="glass p-5 flex flex-col justify-between">
          <div>
            <h2 className="font-heading text-lg font-semibold text-off-white mb-1">
              Power Breakdown (SAIF Method)
            </h2>
            <p className="text-muted text-xs font-mono mb-4">
              Total 23.88 mW (Tempus, slow.lib, 1.62 V) — Registers account for 73.9%
            </p>
          </div>

          <div style={{ height: 210 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  dataKey="value"
                  label={({ value }) => `${value} mW`}
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Legend wrapperStyle={{ color: "#8A93A6", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: "#0a0d14", border: "1px solid rgba(47,230,255,0.3)" }}
                  formatter={(v: number) => `${v} mW`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="text-center font-mono text-xs text-muted mt-2 border-t border-border pt-2">
            Sequential: 17.65 mW (73.9%) | Combinational: 6.23 mW (26.1%)
          </div>
        </div>
      </div>

      {/* Cross-Tool Power Comparison */}
      <div className="glass p-5">
        <h2 className="font-heading text-lg font-semibold text-off-white mb-1">
          Power Methodology Comparison
        </h2>
        <p className="text-muted text-xs font-mono mb-4">
          {signoff.note}
        </p>

        <div style={{ height: 180 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={compareData}
              layout="vertical"
              margin={{ top: 5, right: 75, left: 20, bottom: 5 }}
            >
              <XAxis type="number" tick={{ fill: "#8A93A6", fontSize: 11 }} unit=" mW" />
              <YAxis
                type="category"
                dataKey="label"
                tick={{ fill: "#E8ECF4", fontSize: 12 }}
                width={150}
              />
              <Tooltip
                contentStyle={{ background: "#0a0d14", border: "1px solid rgba(242,163,58,0.3)" }}
                formatter={(v: number) => `${v} mW`}
              />
              <Bar dataKey="value" fill="#F2A33A" radius={[0, 4, 4, 0]}>
                <LabelList
                  dataKey="value"
                  position="right"
                  style={{ fill: "#F2A33A", fontSize: 12, fontFamily: "JetBrains Mono", fontWeight: "bold" }}
                  formatter={(v: number) => `${v} mW`}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <p className="text-muted text-xs font-mono mt-3 italic">
          Vectorless estimations assume statistical toggle default rates; SAIF captures actual switching activity from ncsim gate-level vector simulation.
        </p>
      </div>
    </div>
  );
}
