import { useState, useEffect, useRef } from "react";
import { useReducedMotion } from "../hooks/useReducedMotion";

export default function VoiceStabilityVisualizer() {
  const reduced = useReducedMotion();
  const [mode, setMode] = useState<"stable" | "jitter" | "drop">("stable");
  const [isPlaying, setIsPlaying] = useState(true);

  // Fixed point thresholds
  // THRESH = 9830 (0.60 in Q1.14), HYST = 1000 (~0.06 in Q1.14) -> Clear at 10830 (0.66)
  const [score, setScore] = useState(15500); // Q1.14 (starts ~0.94)
  const [avg, setAvg] = useState(15500);
  const [alert, setAlert] = useState(false);
  const [frameNum, setFrameNum] = useState(0);

  // 16 feature values (INT8 representation -128 to 127)
  const [features, setFeatures] = useState<number[]>(new Array(16).fill(0));

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setFrameNum((f) => f + 1);

      // Generate 16 features based on mode
      const newFeats = new Array(16).fill(0).map((_, i) => {
        if (i === 0) {
          // Feature 0: Jitter
          return mode === "stable" ? Math.floor(Math.random() * 8) : mode === "jitter" ? 95 + Math.floor(Math.random() * 30) : 10;
        }
        if (i === 1) {
          // Feature 1: Packet loss flag
          return mode === "drop" ? 120 : mode === "jitter" && Math.random() > 0.6 ? 100 : 0;
        }
        if (i === 2) {
          // Feature 2: Energy
          return mode === "drop" ? -80 : 40 + Math.floor(Math.random() * 40);
        }
        if (i === 3) {
          // Feature 3: SNR estimate
          return mode === "stable" ? 60 + Math.floor(Math.random() * 20) : mode === "jitter" ? -20 : -50;
        }
        // Features 4-15: Spectral harmonics
        const freqAmp = Math.sin((frameNum * 0.2) + i) * (mode === "drop" ? 10 : 50);
        return Math.floor(freqAmp + (Math.random() * 20 - 10));
      });
      setFeatures(newFeats);

      // Emulate fixed-point GRU scoring logic:
      // High jitter & packet loss lowers score
      const jitterPen = (newFeats[0] / 128) * 8000;
      const dropPen = (newFeats[1] / 128) * 6000;
      const snrBonus = (newFeats[3] / 128) * 2000;

      let rawScore = 15800 - jitterPen - dropPen + snrBonus;
      rawScore = Math.max(2000, Math.min(16200, Math.round(rawScore)));
      setScore(rawScore);

      // Fixed point EMA update:
      // avg' = avg + ((score - avg) >>> k) where k = 4 (WINDOW reg)
      setAvg((prevAvg) => {
        const diff = rawScore - prevAvg;
        const shiftDelta = Math.floor(diff / 16); // arithmetic shift right 4
        const nextAvg = prevAvg + shiftDelta;

        // Hysteresis alert logic from RTL:
        // alert asserts when avg < THRESH (9830)
        // alert clears when avg >= THRESH + HYST (9830 + 1000 = 10830)
        setAlert((prevAlert) => {
          if (!prevAlert && nextAvg < 9830) return true;
          if (prevAlert && nextAvg >= 10830) return false;
          return prevAlert;
        });

        return nextAvg;
      });
    }, 120);

    return () => clearInterval(interval);
  }, [isPlaying, mode, frameNum]);

  // Canvas visualizer for waveform & audio spectrum
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reduced) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let phase = 0;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;

      // Draw subtle grid
      ctx.strokeStyle = "rgba(47, 230, 255, 0.08)";
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Draw 16 audio feature bars at the bottom
      const barWidth = w / 16 - 4;
      features.forEach((feat, idx) => {
        const barHeight = Math.abs(feat) * 0.4 + 4;
        const bx = idx * (barWidth + 4) + 2;
        const by = h - barHeight - 4;
        ctx.fillStyle =
          idx === 0
            ? "#FF5C6C" // Jitter
            : idx === 1
            ? "#FFB020" // Packet loss
            : idx < 4
            ? "#2FE6FF" // Energy/SNR
            : "rgba(242, 163, 58, 0.6)"; // Spectral
        ctx.fillRect(bx, by, barWidth, barHeight);
      });

      // Draw voice stability oscilloscope waveform curve
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = alert ? "#FF5C6C" : mode === "stable" ? "#7CFF6B" : "#2FE6FF";
      ctx.shadowBlur = alert ? 10 : 6;
      ctx.shadowColor = alert ? "#FF5C6C" : "#2FE6FF";

      for (let x = 0; x < w; x += 3) {
        const freq = mode === "stable" ? 0.04 : 0.12;
        const amp = (mode === "stable" ? 18 : 28) * (alert ? 0.6 : 1);
        const y = h * 0.38 + Math.sin(x * freq + phase) * amp + (Math.random() * (mode === "jitter" ? 12 : 2) - (mode === "jitter" ? 6 : 1));
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      phase += mode === "stable" ? 0.08 : 0.18;
      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [features, mode, alert, reduced]);

  const scoreFloat = (score / 16384).toFixed(3);
  const avgFloat = (avg / 16384).toFixed(3);

  return (
    <div className="glass p-5 border border-cyan/30 relative overflow-hidden space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan animate-pulse" />
          <h3 className="font-heading text-base font-bold text-off-white tracking-wide">
            Live Voice Stability DSP Monitor & Hysteresis Emulator
          </h3>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-muted">Frame: #{frameNum}</span>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-2 py-0.5 rounded bg-chip border border-border text-muted hover:text-off-white"
          >
            {isPlaying ? "Pause DSP" : "Resume DSP"}
          </button>
        </div>
      </div>

      {/* Interactive Signal Injection Controls */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
        <span className="text-muted mr-1">Inject Condition:</span>
        <button
          onClick={() => setMode("stable")}
          className={`px-3 py-1.5 rounded-full border transition-all ${
            mode === "stable"
              ? "border-lime text-lime bg-lime/10 font-bold shadow-[0_0_10px_rgba(124,255,107,0.3)]"
              : "border-border text-muted hover:text-off-white"
          }`}
        >
          ✓ Clean Stable Voice
        </button>
        <button
          onClick={() => setMode("jitter")}
          className={`px-3 py-1.5 rounded-full border transition-all ${
            mode === "jitter"
              ? "border-coral text-coral bg-coral/10 font-bold shadow-[0_0_10px_rgba(255,92,108,0.3)]"
              : "border-border text-muted hover:text-off-white"
          }`}
        >
          ⚡ High Jitter & Jolt
        </button>
        <button
          onClick={() => setMode("drop")}
          className={`px-3 py-1.5 rounded-full border transition-all ${
            mode === "drop"
              ? "border-amber text-amber bg-amber/10 font-bold shadow-[0_0_10px_rgba(255,176,32,0.3)]"
              : "border-border text-muted hover:text-off-white"
          }`}
        >
          ⚠ Packet Drop Surge
        </button>
      </div>

      {/* Oscilloscope Canvas */}
      <div className="relative rounded-lg overflow-hidden border border-border bg-[#070b12]">
        <canvas
          ref={canvasRef}
          width={640}
          height={130}
          className="w-full h-32 block"
          aria-label="Real-time voice stability waveform and 16-channel feature spectrum display"
        />

        {/* Feature labels legend */}
        <div className="absolute top-2 left-3 flex gap-3 text-[10px] font-mono text-muted/70 bg-chip/80 px-2 py-0.5 rounded">
          <span className="text-coral">■ F0 Jitter</span>
          <span className="text-amber">■ F1 Loss</span>
          <span className="text-cyan">■ F2-3 Energy/SNR</span>
          <span className="text-copper">■ F4-15 Spectral</span>
        </div>

        {/* Live Alert Watermark */}
        {alert && (
          <div className="absolute top-2 right-3 flex items-center gap-1.5 bg-coral/20 border border-coral text-coral px-2.5 py-1 rounded text-xs font-mono font-bold animate-pulse">
            <span>⚠ ALERT ASSERTED (irq = 1)</span>
          </div>
        )}
      </div>

      {/* Real-time Hardware Register Readout */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        <div className="glass p-3 border border-border">
          <span className="text-muted block text-[11px]">Latest SCORE (0x14)</span>
          <span className="text-cyan text-base font-bold">{score}</span>
          <span className="text-muted block text-[10px]">({scoreFloat} Q1.14)</span>
        </div>

        <div className="glass p-3 border border-border">
          <span className="text-muted block text-[11px]">Running AVG (0x18)</span>
          <span className="text-copper text-base font-bold">{avg}</span>
          <span className="text-muted block text-[10px]">({avgFloat} Q1.14)</span>
        </div>

        <div className="glass p-3 border border-border">
          <span className="text-muted block text-[11px]">THRESH / HYST</span>
          <span className="text-off-white text-base font-bold">9830 / 1000</span>
          <span className="text-muted block text-[10px]">Clear: ≥10830</span>
        </div>

        <div
          className={`glass p-3 border transition-colors ${
            alert ? "border-coral bg-coral/10" : "border-lime bg-lime/10"
          }`}
        >
          <span className="text-muted block text-[11px]">STATUS (0x10)</span>
          <span className={`text-base font-bold ${alert ? "text-coral" : "text-lime"}`}>
            {alert ? "ALERT (bit1=1)" : "STABLE (bit1=0)"}
          </span>
          <span className="text-muted block text-[10px]">
            {alert ? "irq active (avg < 9830)" : "avg in safe band"}
          </span>
        </div>
      </div>
    </div>
  );
}
