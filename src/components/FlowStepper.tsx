import { useRef, useEffect } from "react";
import type { StepDef } from "../data/steps";

interface Props {
  steps: StepDef[];
  activeId: string;
  onSelect: (id: string) => void;
}

export default function FlowStepper({ steps, activeId, onSelect }: Props) {
  const activeIdx = steps.findIndex((s) => s.id === activeId);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  // Scroll active step into view
  useEffect(() => {
    refs.current[activeIdx]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [activeIdx]);

  const handleKey = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      const next = Math.min(idx + 1, steps.length - 1);
      refs.current[next]?.focus();
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      const prev = Math.max(idx - 1, 0);
      refs.current[prev]?.focus();
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(steps[idx].id);
    }
  };

  return (
    <nav aria-label="Flow steps" role="navigation">
      <div className="mb-4">
        <h2 className="text-muted text-xs font-mono uppercase tracking-widest">Flow</h2>
      </div>
      <ol role="list" className="relative">
        {/* Connecting line */}
        <div
          className="absolute left-[17px] top-4 bottom-4 w-0.5 z-0"
          style={{
            background: `linear-gradient(to bottom, #7CFF6B ${(activeIdx / (steps.length - 1)) * 100}%, rgba(255,255,255,0.1) ${(activeIdx / (steps.length - 1)) * 100}%)`,
          }}
          aria-hidden="true"
        />

        {steps.map((step, idx) => {
          const isActive = step.id === activeId;
          const isDone   = idx < activeIdx;
          return (
            <li key={step.id} className="relative flex items-start gap-3 mb-1 z-10">
              <button
                ref={(el) => { refs.current[idx] = el; }}
                onClick={() => onSelect(step.id)}
                onKeyDown={(e) => handleKey(e, idx)}
                tabIndex={isActive ? 0 : -1}
                aria-current={isActive ? "step" : undefined}
                aria-label={`Step ${idx + 1}: ${step.label}${isDone ? " (completed)" : ""}${isActive ? " (current)" : ""}`}
                className={`step-node ${isActive ? "active" : isDone ? "done" : ""} focus-visible:outline focus-visible:outline-2 focus-visible:outline-copper`}
              >
                {isDone ? "✓" : idx + 1}
              </button>
              <button
                onClick={() => onSelect(step.id)}
                tabIndex={-1}
                aria-hidden="true"
                className={`flex-1 text-left py-1 px-2 rounded text-sm transition-colors leading-snug ${
                  isActive
                    ? "text-copper font-semibold"
                    : isDone
                    ? "text-lime/80"
                    : "text-muted hover:text-off-white"
                }`}
              >
                <span className="mr-1 text-xs">{step.icon}</span>
                {step.label}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
