import { useState } from "react";
import project from "../data/project.json";
import MonitorFrame from "../components/MonitorFrame";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const TABS = [
  { id: "import",    label: "Import" },
  { id: "floorplan", label: "Floorplan" },
  { id: "power",     label: "Power" },
  { id: "clock",     label: "Clock tree" },
  { id: "route",     label: "Route" },
  { id: "antenna",   label: "Antenna" },
];

export default function Step08_PnR() {
  const [activeTab, setActiveTab] = useState("import");
  const { pnr } = project;
  const cts = pnr.cts;

  const skewData = [
    { corner: "Slow Corner",    skew: cts.skewNs.slow, color: "#FF5C6C" },
    { corner: "Typical Corner", skew: cts.skewNs.typ,  color: "#F2A33A" },
    { corner: "Fast Corner",    skew: cts.skewNs.fast, color: "#7CFF6B" },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb Flow */}
      <div className="glass p-3 overflow-x-auto">
        <div className="flex items-center gap-1.5 w-max">
          <span className="text-muted text-xs font-mono mr-2">Innovus Flow:</span>
          {pnr.flow.map((st, i) => (
            <div key={st} className="flex items-center gap-1.5">
              <span className="px-2.5 py-1 rounded bg-panel border border-border text-xs font-mono text-off-white">
                {st}
              </span>
              {i < pnr.flow.length - 1 && (
                <span className="text-copper text-xs font-bold" aria-hidden>›</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Sub-tabs Navigation */}
      <div className="flex gap-2 border-b border-border overflow-x-auto pb-1" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            role="tab"
            aria-selected={activeTab === t.id}
            className={`px-4 py-2 text-sm font-mono whitespace-nowrap transition-all rounded-t-lg border-b-2 ${
              activeTab === t.id
                ? "border-copper text-copper bg-copper/10 font-bold"
                : "border-transparent text-muted hover:text-off-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Panel Content */}
      <div role="tabpanel" className="space-y-4">
        {activeTab === "import" && (
          <div className="space-y-3">
            <MonitorFrame
              filename="fig03_innovus_design_import.jpeg"
              figNum={3}
              alt="Cadence Innovus design import UI displaying loaded synthesized netlist, LEF libraries, and design database setup"
              caption="Innovus design import with Genus netlist"
              source="Cadence Innovus 21.15"
            />
            <p className="text-muted text-sm glass p-3 rounded-lg font-mono text-xs">
              Design import: loaded synthesized netlist from Genus, 0.18 µm standard-cell LEF, and SDC constraints into Innovus.
            </p>
          </div>
        )}

        {activeTab === "floorplan" && (
          <div className="space-y-3">
            <MonitorFrame
              filename="fig04_floorplan_rows.jpeg"
              figNum={4}
              alt="Cadence Innovus floorplan row distribution showing core boundary, standard cell rows, and IO placement area"
              caption="Floorplan rows — utilisation 0.55"
              source="Cadence Innovus 21.15"
            />
            <p className="text-muted text-sm glass p-3 rounded-lg font-mono text-xs">
              Target floorplan utilisation: <strong className="text-copper">{pnr.floorplanUtilisation}</strong> (55%). Standard-cell rows configured with aspect ratio 1.0.
            </p>
          </div>
        )}

        {activeTab === "power" && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MonitorFrame
                filename="fig05_power_rings_stripes.jpeg"
                figNum={5}
                alt="Innovus power distribution showing core rings and vertical stripes"
                caption="Power rings and stripes"
                source="Cadence Innovus 21.15"
              />
              <MonitorFrame
                filename="fig06_power_grid_metal1.jpeg"
                figNum={6}
                alt="Innovus standard cell row power grid rails displayed on Metal1"
                caption="Power grid, Metal1 view"
                source="Cadence Innovus 21.15"
              />
              <MonitorFrame
                filename="fig07_power_grid_alt_layers.jpeg"
                figNum={7}
                alt="Innovus multi-layer power distribution straps across intermediate metal layers"
                caption="Power grid, alternate layer display"
                source="Cadence Innovus 21.15"
              />
            </div>
            <p className="text-muted text-sm glass p-3 rounded-lg font-mono text-xs">
              Comprehensive power grid structure: VDD/VSS rings on upper metal, interleaved core stripes, and standard cell rail connections on Metal1.
            </p>
          </div>
        )}

        {activeTab === "clock" && (
          <div className="space-y-4">
            <MonitorFrame
              filename="fig08_clock_tree_debugger.png"
              figNum={8}
              alt="Cadence Innovus Clock Tree Debugger showing synthesized clock tree buffer levels and sink arrival distribution on dc_slow"
              caption="Clock Tree Debugger, dc_slow corner"
              source="Cadence Innovus 21.15"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass p-4 font-mono text-xs space-y-2">
                <span className="text-muted block">Clock Tree Sinks</span>
                <span className="text-copper text-2xl font-bold font-heading">{cts.sinks.toLocaleString()}</span>
                <div className="border-t border-border pt-2 text-muted">
                  Insertion delay: <strong className="text-off-white">{cts.insertionNs} ns</strong>
                </div>
              </div>

              <div className="glass p-4">
                <span className="text-muted text-xs font-mono block mb-2">Clock Skew Across Corners (ns)</span>
                <div style={{ height: 120 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={skewData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <XAxis dataKey="corner" tick={{ fill: "#8A93A6", fontSize: 10 }} />
                      <YAxis tick={{ fill: "#8A93A6", fontSize: 10 }} domain={[0, 0.09]} />
                      <Tooltip
                        contentStyle={{ background: "#0a0d14", border: "1px solid rgba(47,230,255,0.3)" }}
                        formatter={(v: number) => `${v} ns`}
                      />
                      <Bar dataKey="skew" radius={[4, 4, 0, 0]}>
                        {skewData.map((d, i) => (
                          <Cell key={i} fill={d.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "route" && (
          <div className="space-y-3">
            <MonitorFrame
              filename="fig09_final_routed_layout.png"
              figNum={9}
              alt="Cadence Innovus final routed layout with 77,677 total instances including filler cells, clean routing tracks, and zero DRC errors"
              caption="Final routed layout — 77,677 instances incl. fillers"
              source="Cadence Innovus 21.15"
            />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 glass p-4 font-mono text-xs">
              <div>
                <span className="text-muted block">Instances (w/ fillers)</span>
                <span className="text-copper font-bold text-lg">77,677</span>
              </div>
              <div>
                <span className="text-muted block">Placement Density</span>
                <span className="text-off-white font-bold text-lg">55.486%</span>
              </div>
              <div>
                <span className="text-muted block">DRC Violations</span>
                <span className="chip chip-met mt-1">0 (Clean)</span>
              </div>
              <div>
                <span className="text-muted block">Connectivity</span>
                <span className="chip chip-met mt-1">Clean</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "antenna" && (
          <div className="space-y-3">
            <MonitorFrame
              filename="fig10_antenna_markers.jpeg"
              figNum={10}
              alt="Innovus antenna rule checking view highlighting 1 remaining violation marker on Metal4 net FE_OFN1357_n_9"
              caption="Antenna markers, first view — 1 violation remains"
              source="Cadence Innovus 21.15"
            />
            <div className="glass p-4 border-l-4 border-coral/60 bg-coral/5 font-mono text-xs space-y-1">
              <p className="text-coral font-bold">⚠ Antenna Check Status:</p>
              <p className="text-off-white">
                1 violation remains on 1 net (<code>FE_OFN1357_n_9</code>, Metal4). The initial run had 150 violations; antenna diodes and jumper routing resolved 149. LEF lacks antenna data for some library cells.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Innovus Metrics Table */}
      <div className="glass overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <h2 className="font-heading text-lg font-semibold text-off-white">Post-Route Implementation Metrics</h2>
          <p className="text-muted text-xs font-mono mt-0.5">{pnr.tool}</p>
        </div>
        <table className="mono-table">
          <tbody>
            {pnr.rows.map(([label, value]) => (
              <tr key={label}>
                <td className="text-muted text-xs font-mono">{label}</td>
                <td className="text-off-white font-semibold font-mono">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
