import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "../hooks/useReducedMotion";
import type { HeadlineMetric } from "../data/types";

interface Props { metric: HeadlineMetric; index: number }

export default function HeadlineMetricCard({ metric, index }: Props) {
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced) { setVisible(true); return; }
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.3 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [reduced]);

  return (
    <div
      ref={ref}
      className="glass px-4 py-3 flex flex-col gap-1 min-w-[140px]"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : "translateY(8px)",
        transition: reduced ? "none" : `opacity 0.4s ${index * 0.08}s, transform 0.4s ${index * 0.08}s`,
      }}
    >
      <span className="text-muted text-xs font-mono uppercase tracking-wider">
        {metric.label}
      </span>
      <span className="text-copper font-heading text-xl font-bold">
        {metric.value}
      </span>
      <span className="text-muted text-xs">{metric.note}</span>
    </div>
  );
}
