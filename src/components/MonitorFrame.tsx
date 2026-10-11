import { useContext } from "react";
import { LightboxContext } from "../App";
import { imgUrl } from "../utils/assets";

interface Props {
  filename: string;
  figNum: number;
  alt: string;
  caption: string;
  source?: string;
  className?: string;
}

export default function MonitorFrame({ filename, figNum, alt, caption, source, className = "" }: Props) {
  const { open } = useContext(LightboxContext);
  const src = imgUrl(filename);

  return (
    <figure className={`monitor-frame ${className}`}>
      {/* Top bar mimicking a monitor chrome */}
      <div className="flex items-center gap-2 px-3 py-2 bg-black/40 border-b border-cyan/20">
        <span className="w-3 h-3 rounded-full bg-coral/70" />
        <span className="w-3 h-3 rounded-full bg-amber/70" />
        <span className="w-3 h-3 rounded-full bg-lime/70" />
        <span className="ml-2 text-muted font-mono text-xs">Fig. {figNum}</span>
        {source && <span className="ml-auto text-muted font-mono text-xs opacity-60">{source}</span>}
      </div>

      <button
        onClick={() => open({ src, alt, caption: `Fig. ${figNum} · ${caption}` })}
        className="block w-full cursor-zoom-in"
        aria-label={`Open full-size: Fig. ${figNum} — ${alt}`}
      >
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="w-full object-contain bg-[#0a0d14] max-h-[480px]"
        />
      </button>

      <figcaption className="px-4 py-3 bg-black/20 border-t border-white/5">
        <span className="font-mono text-copper text-xs mr-2">Fig. {figNum}</span>
        <span className="text-muted text-sm">{caption}</span>
        <span className="ml-2 text-xs text-white/20 font-mono">· click to zoom</span>
      </figcaption>
    </figure>
  );
}
