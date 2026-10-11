import project from "../data/project.json";
import DownloadButtons from "./DownloadButtons";

export default function Footer() {
  const { team, event } = project;
  return (
    <footer className="relative z-10 border-t border-border bg-chip/80 backdrop-blur-md px-4 md:px-8 py-6">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-6">
        <div>
          <p className="font-heading text-lg font-bold text-copper">VSM-GRU · RTL→GDSII</p>
          <p className="text-muted font-mono text-xs mt-1">{event}</p>
          <p className="text-muted font-mono text-xs">
            Team {team.number} · {team.name} ·{" "}
            {team.members.map((m) => `${m.name} (${m.roll})`).join(" · ")}
          </p>
        </div>
        <DownloadButtons />
      </div>
    </footer>
  );
}
