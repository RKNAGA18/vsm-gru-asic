import project from "../data/project.json";
import HeadlineMetricCard from "./HeadlineMetric";
import DownloadButtons from "./DownloadButtons";

export default function TopBar() {
  const { team, event, title, subtitle, headline } = project;

  return (
    <header className="relative z-20 border-b border-border bg-chip/80 backdrop-blur-md sticky top-0">
      <div className="flex items-center justify-between gap-4 px-4 md:px-8 py-3 flex-wrap">
        {/* Wordmark */}
        <div>
          <div className="flex items-baseline gap-2">
            <span className="font-heading text-2xl font-bold text-copper tracking-tight">VSM-GRU</span>
            <span className="text-muted font-mono text-sm hidden sm:inline">RTL → GDSII · 0.18 µm</span>
          </div>
          <div className="text-muted text-xs font-mono mt-0.5">
            Team {team.number} · {team.name} ·{" "}
            {team.members.map((m, i) => (
              <span key={m.roll}>
                {m.name} ({m.roll}){i < team.members.length - 1 ? " · " : ""}
              </span>
            ))}
          </div>
          <div className="text-muted/60 text-xs font-mono mt-0.5 hidden lg:block">{event}</div>
        </div>

        {/* CTA Buttons — hidden on mobile (shown in sticky bottom bar) */}
        <div className="hidden md:block">
          <DownloadButtons />
        </div>
      </div>

      {/* Headline metrics strip */}
      <div
        id="metrics-strip"
        className="flex overflow-x-auto gap-3 px-4 md:px-8 py-3 border-t border-border/50 scrollbar-thin"
        aria-label="Key project metrics"
      >
        {headline.map((m, i) => (
          <HeadlineMetricCard key={m.label} metric={m} index={i} />
        ))}
        {/* Latency disambiguation */}
        <div className="glass px-4 py-3 flex flex-col gap-1 min-w-[180px] border-l-2 border-amber/40">
          <span className="text-muted text-xs font-mono uppercase tracking-wider">Latency</span>
          <span className="text-amber font-heading text-lg font-bold">15.73 µs</span>
          <span className="text-muted text-xs">@100 MHz assumption</span>
          <span className="text-coral text-xs font-mono">23.6 µs @15 ns SDC clock</span>
        </div>
      </div>
    </header>
  );
}
