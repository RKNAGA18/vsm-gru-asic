import project from "../data/project.json";
import KaTeXRenderer from "../components/KaTeXRenderer";

const GRU_EQUATIONS = [
  { label: "Update gate",   tex: "z = \\sigma(W_z \\cdot x + U_z \\cdot h + b_z)" },
  { label: "Reset gate",    tex: "r = \\sigma(W_r \\cdot x + U_r \\cdot h + b_r)" },
  { label: "New gate",      tex: "n = \\tanh(W_n \\cdot x + U_n \\cdot (r \\odot h) + b_n)" },
  { label: "Hidden update", tex: "h' = h + z \\odot (n - h)" },
  { label: "Output score",  tex: "score = \\sigma(W_o \\cdot h' + b_o)" },
  { label: "Shift EMA",     tex: "\\text{avg}' = \\text{avg} + ((score - \\text{avg}) \\gg\\gg k)" },
];

const PIPELINE = [
  { file: "train_qat.py",     desc: "Quantisation-aware training (numpy), generates weights" },
  { file: "gen_lut.py",       desc: "256-entry sigmoid/tanh LUTs" },
  { file: "gen_vectors.py",   desc: "weights.hex, bias.hex, frames.hex, expect.hex" },
  { file: "error_analysis.py",desc: "Quantisation & LUT error reporting" },
  { file: "long_stream.py",   desc: "360,000-frame continuity test (model only)" },
];

export default function Step02_Algorithm() {
  const { wordLengths } = project;
  return (
    <div className="space-y-6">
      {/* Pipeline */}
      <div className="glass p-5">
        <h2 className="font-heading text-xl font-bold text-copper mb-4">Python Golden Model Pipeline</h2>
        <div className="flex flex-wrap gap-3 items-center">
          {PIPELINE.map((p, i) => (
            <div key={p.file} className="flex items-center gap-2">
              <div className="glass px-3 py-2 rounded-lg">
                <p className="font-mono text-cyan text-sm">{p.file}</p>
                <p className="text-muted text-xs mt-0.5">{p.desc}</p>
              </div>
              {i < PIPELINE.length - 1 && (
                <span className="text-copper text-lg font-bold" aria-hidden>→</span>
              )}
            </div>
          ))}
        </div>
        <p className="text-muted text-xs font-mono mt-4 italic">
          Note: feature labels (MOS, PESQ, jitter, SNR etc.) are synthetic — feature 0 jitter, 1 packet-loss flag, 2 energy, 3 SNR estimate, 4–15 spectral.
        </p>
      </div>

      {/* GRU equations */}
      <div className="glass p-5">
        <h2 className="font-heading text-xl font-bold text-copper mb-4">GRU Equations (fixed-point)</h2>
        <div className="space-y-3">
          {GRU_EQUATIONS.map((eq) => (
            <div key={eq.label} className="flex items-baseline gap-4 border-b border-border/40 pb-3">
              <span className="text-muted text-sm w-32 shrink-0 font-mono">{eq.label}</span>
              <KaTeXRenderer tex={eq.tex} className="text-off-white" />
            </div>
          ))}
        </div>
      </div>

      {/* Word lengths table */}
      <div className="glass overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <h2 className="font-heading text-lg font-semibold text-off-white">Fixed-Point Word Lengths</h2>
        </div>
        <table className="mono-table">
          <thead><tr><th>Signal / Data</th><th>Format</th></tr></thead>
          <tbody>
            {wordLengths.map(([signal, format]) => (
              <tr key={signal}>
                <td className="text-off-white">{signal}</td>
                <td className="text-cyan">{format}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
