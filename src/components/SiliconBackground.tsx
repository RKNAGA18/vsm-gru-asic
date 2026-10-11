import { useEffect, useRef } from "react";
import { useReducedMotion } from "../hooks/useReducedMotion";

export default function SiliconBackground() {
  const svgRef = useRef<SVGSVGElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || !svgRef.current) return;
    let raf: number;
    let offset = 0;
    const speed = 0.08;
    const pattern = svgRef.current.querySelector("pattern");
    const animFn = () => {
      offset += speed;
      if (pattern) {
        pattern.setAttribute("x", String((offset % 80).toFixed(2)));
        pattern.setAttribute("y", String((offset % 80).toFixed(2)));
      }
      raf = requestAnimationFrame(animFn);
    };
    raf = requestAnimationFrame(animFn);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  return (
    <svg
      ref={svgRef}
      className="silicon-bg"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="silicon-grid" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
          {/* Horizontal traces */}
          <line x1="0" y1="20" x2="80" y2="20" stroke="#2FE6FF" strokeWidth="0.4" opacity="0.35" />
          <line x1="0" y1="40" x2="80" y2="40" stroke="#F2A33A" strokeWidth="0.4" opacity="0.25" />
          <line x1="0" y1="60" x2="80" y2="60" stroke="#2FE6FF" strokeWidth="0.4" opacity="0.2" />
          {/* Vertical traces */}
          <line x1="20" y1="0" x2="20" y2="80" stroke="#2FE6FF" strokeWidth="0.4" opacity="0.3" />
          <line x1="40" y1="0" x2="40" y2="80" stroke="#F2A33A" strokeWidth="0.4" opacity="0.2" />
          <line x1="60" y1="0" x2="60" y2="80" stroke="#2FE6FF" strokeWidth="0.4" opacity="0.25" />
          {/* Via dots */}
          <circle cx="20" cy="20" r="1.5" fill="#2FE6FF" opacity="0.5" />
          <circle cx="60" cy="20" r="1.5" fill="#F2A33A" opacity="0.4" />
          <circle cx="20" cy="60" r="1.5" fill="#F2A33A" opacity="0.4" />
          <circle cx="60" cy="60" r="1.5" fill="#2FE6FF" opacity="0.5" />
          <circle cx="40" cy="40" r="1" fill="#7CFF6B" opacity="0.3" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#silicon-grid)" />
    </svg>
  );
}
