import { QRCodeSVG } from "qrcode.react";
import project from "../data/project.json";
import DownloadButtons from "../components/DownloadButtons";

export default function Step12_GetFiles() {
  return (
    <div className="space-y-8">
      {/* Download Action Card */}
      <div className="glass p-8 text-center space-y-4">
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-copper">
          Get the Complete Project Artefacts
        </h2>
        <p className="text-muted text-sm max-w-xl mx-auto">
          Download the comprehensive design report, slide presentation, or clone the full repository with all scripts, netlists, and reports.
        </p>
        <div className="pt-4 flex justify-center">
          <DownloadButtons size="lg" />
        </div>
      </div>

      {/* QR Code & Repository Details */}
      <div className="glass p-8 flex flex-col items-center text-center">
        <h3 className="font-heading text-lg font-semibold text-off-white mb-2">
          Scan to Access GitHub Repository
        </h3>
        <p className="text-muted text-xs font-mono mb-6">
          Direct link to RTL, Genus scripts, Innovus config, Tempus signoff reports
        </p>

        <div className="p-4 bg-white rounded-2xl shadow-[0_0_30px_rgba(47,230,255,0.2)]">
          <QRCodeSVG
            value={project.repo}
            size={200}
            bgColor="#ffffff"
            fgColor="#05070d"
            level="M"
          />
        </div>

        <p className="font-mono text-cyan text-sm mt-5 select-all">{project.repo}</p>

        <a
          href={project.repo}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-glow btn-cyan mt-4 text-xs font-mono"
        >
          Open GitHub Repository ↗
        </a>
      </div>
    </div>
  );
}
