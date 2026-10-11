import { useEffect, useState } from "react";
import { dlUrl } from "../utils/assets";

interface Toast { msg: string }

export default function DownloadButtons({ size = "md" }: { size?: "md" | "lg" }) {
  const [toast, setToast] = useState<Toast | null>(null);
  const [pptReady, setPptReady] = useState(true);

  const pptUrl = dlUrl("Team18_Presentation.pptx");
  const reportUrl = dlUrl("Team18_Design_Report.docx");

  useEffect(() => {
    fetch(pptUrl, { method: "HEAD" })
      .then((r) => {
        const ct = r.headers.get("content-type") || "";
        if (!r.ok || ct.includes("text/html")) setPptReady(false);
      })
      .catch(() => setPptReady(false));
  }, [pptUrl]);

  const showToast = (msg: string) => {
    setToast({ msg });
    setTimeout(() => setToast(null), 5000);
  };

  const handlePptClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!pptReady) {
      e.preventDefault();
      showToast("Presentation file not added yet. Put Team18_Presentation.pptx in /public/downloads/");
    }
  };

  const large = size === "lg";

  return (
    <div className="relative">
      <div className={`flex flex-wrap gap-3 ${large ? "gap-4" : ""}`}>
        {/* Report */}
        <a
          href={reportUrl}
          download="Team18_Design_Report.docx"
          className={`btn-glow btn-copper btn-pulse ${large ? "px-6 py-3 text-base" : ""}`}
          aria-label="Download Design Report (DOCX)"
        >
          <span aria-hidden="true">📄</span>
          {large ? "Download Design Report" : "Design Report"}
        </a>

        {/* PPT */}
        <a
          href={pptUrl}
          download="Team18_Presentation.pptx"
          onClick={handlePptClick}
          className={`btn-glow btn-cyan ${large ? "px-6 py-3 text-base" : ""} ${!pptReady ? "opacity-70" : ""}`}
          aria-label="Download Presentation (PPTX)"
        >
          <span aria-hidden="true">📊</span>
          {large ? "Download Presentation" : "Presentation"}{!pptReady && " ⚠"}
        </a>

        {/* GitHub */}
        <a
          href="https://github.com/RKNAGA18/vsm-gru-asic"
          target="_blank"
          rel="noopener noreferrer"
          className={`btn-glow btn-lime ${large ? "px-6 py-3 text-base" : ""}`}
          aria-label="Open GitHub repository in new tab"
        >
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
          </svg>
          GitHub
        </a>
      </div>

      {/* Toast notification */}
      {toast && (
        <div
          role="alert"
          aria-live="assertive"
          className="absolute top-full mt-3 left-0 right-0 glass border border-amber/40 text-amber text-sm font-mono px-4 py-3 rounded-lg z-50"
        >
          ⚠ {toast.msg}
        </div>
      )}
    </div>
  );
}
