interface Props { currentIdx: number; total: number }
export default function ProgressBar({ currentIdx, total }: Props) {
  const pct = ((currentIdx + 1) / total) * 100;
  return (
    <div
      id="progress-bar"
      style={{ width: `${pct}%` }}
      role="progressbar"
      aria-valuenow={currentIdx + 1}
      aria-valuemin={1}
      aria-valuemax={total}
      aria-label={`Step ${currentIdx + 1} of ${total}`}
    />
  );
}
