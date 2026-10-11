import project from "../data/project.json";
import MonitorFrame from "../components/MonitorFrame";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

const DONUT_DATA = [
  { name: "Flip-Flops (Weight Mem + States)", value: 76.5, color: "#F2A33A" },
  { name: "Combinational Logic & LUTs", value: 23.5, color: "#2FE6FF" },
];

export default function Step07_Synthesis() {
  const { synthesis } = project;
  return (
    <div className="space-y-6">
      {/* Genus Schematic Screenshot */}
      <MonitorFrame
        filename="fig02_genus_schematic.jpeg"
        figNum={2}
        alt="Cadence Genus 21.1 synthesis schematic showing synthesized gate-level hierarchy with 30,970 leaf standard cells and multi-bit register arrays"
        caption="Genus schematic — 30,970 leaf cells"
        source="Cadence Genus 21.1"
      />

      {/* Critical Path Callout */}
      <div className="glass p-4 border-l-4 border-amber/60 bg-amber/5">
        <div className="flex items-center gap-2">
          <span className="text-amber font-mono font-bold">⚠ Critical Path Note:</span>
          <span className="text-off-white font-mono text-sm">
            Critical timing path {synthesis.criticalPath}.
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Synthesis Rows Table */}
        <div className="glass overflow-hidden">
          <div className="px-5 py-3 border-b border-border">
            <h2 className="font-heading text-lg font-semibold text-off-white">Synthesis Summary</h2>
            <p className="text-muted text-xs font-mono mt-0.5">{synthesis.tool}</p>
          </div>
          <table className="mono-table">
            <tbody>
              {synthesis.rows.map(([label, value]) => (
                <tr key={label}>
                  <td className="text-muted text-xs font-mono">{label}</td>
                  <td className="text-off-white font-semibold font-mono">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Flop Share Donut Chart */}
        <div className="glass p-5 flex flex-col justify-between">
          <div>
            <h2 className="font-heading text-lg font-semibold text-off-white mb-1">
              Cell Area Distribution
            </h2>
            <p className="text-muted text-xs font-mono mb-4">
              Flops share 76.5% of total cell area due to flip-flop based weight storage
            </p>
          </div>

          <div style={{ height: 210 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={DONUT_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  dataKey="value"
                  label={({ value }) => `${value}%`}
                  labelLine={false}
                >
                  {DONUT_DATA.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Legend wrapperStyle={{ color: "#8A93A6", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: "#0a0d14", border: "1px solid rgba(242,163,58,0.3)" }}
                  formatter={(v: number) => `${v}% of cell area`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="text-center font-mono text-xs text-muted mt-2 border-t border-border pt-2">
            13,200 of 14,398 sequential cells belong to weight memory (~92%)
          </div>
        </div>
      </div>
    </div>
  );
}
