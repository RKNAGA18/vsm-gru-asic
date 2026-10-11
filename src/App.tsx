import React, { useState, useEffect, useCallback, Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { STEPS, getStepByHash } from "./data/steps";
import { useKeyPress } from "./hooks/useKeyPress";
import { useReducedMotion } from "./hooks/useReducedMotion";
import SiliconBackground from "./components/SiliconBackground";
import TopBar from "./components/TopBar";
import FlowStepper from "./components/FlowStepper";
import Lightbox from "./components/Lightbox";
import Footer from "./components/Footer";
import ProgressBar from "./components/ProgressBar";

export interface LightboxState { src: string; alt: string; caption: string }
export const LightboxContext = React.createContext<{
  open: (s: LightboxState) => void;
  close: () => void;
}>({ open: () => {}, close: () => {} });

function StepLoader() {
  return (
    <div className="flex items-center justify-center h-64 text-muted text-sm font-mono animate-pulse">
      Loading step…
    </div>
  );
}

export default function App() {
  const reduced = useReducedMotion();

  const getActive = () => getStepByHash(window.location.hash);
  const [activeStep, setActiveStep] = useState(getActive);
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);
  const [presenter, setPresenter] = useState(false);

  // Hash navigation
  useEffect(() => {
    const onHash = () => setActiveStep(getStepByHash(window.location.hash));
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const goToIndex = useCallback((idx: number) => {
    const clamped = Math.max(0, Math.min(STEPS.length - 1, idx));
    window.location.hash = STEPS[clamped].hash;
  }, []);

  const currentIdx = STEPS.findIndex((s) => s.id === activeStep.id);

  // Keyboard shortcuts
  useKeyPress(["ArrowLeft", "ArrowRight", "j", "k", "J", "K"], (e) => {
    if (lightbox) return;
    const dir = e.key === "ArrowRight" || e.key === "j" || e.key === "J" ? 1 : -1;
    goToIndex(currentIdx + dir);
  }, [currentIdx, lightbox]);

  useKeyPress("Escape", () => { if (lightbox) setLightbox(null); }, [lightbox]);

  useKeyPress("f", (e) => {
    e.preventDefault();
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen();
  }, []);

  useKeyPress("p", () => setPresenter((p) => !p), []);

  const ActiveComponent = activeStep.component;

  return (
    <LightboxContext.Provider value={{ open: setLightbox, close: () => setLightbox(null) }}>
      <div className={`relative min-h-screen flex flex-col${presenter ? " presenter-mode" : ""}`}>
        <SiliconBackground />
        <ProgressBar currentIdx={currentIdx} total={STEPS.length} />

        <TopBar />

        {/* Main layout */}
        <div className="relative z-10 flex flex-1 overflow-hidden">
          {/* Left stepper — hidden on mobile, shown on md+ */}
          <aside className="hidden md:flex flex-col w-72 xl:w-80 flex-shrink-0 border-r border-border overflow-y-auto py-6 px-4">
            <FlowStepper
              steps={STEPS}
              activeId={activeStep.id}
              onSelect={(id) => {
                const s = STEPS.find((x) => x.id === id);
                if (s) window.location.hash = s.hash;
              }}
            />
          </aside>

          {/* Right viewer */}
          <main
            id="step-viewer"
            className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10"
            aria-live="polite"
            aria-label="Step content"
          >
            {/* Mobile chip bar */}
            <div className="md:hidden mb-4 overflow-x-auto pb-2">
              <div className="flex gap-2 w-max">
                {STEPS.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => { window.location.hash = s.hash; }}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-mono border transition-all ${
                      s.id === activeStep.id
                        ? "border-copper text-copper bg-copper/10"
                        : "border-border text-muted bg-panel"
                    }`}
                    aria-label={`Go to step ${i + 1}: ${s.label}`}
                    aria-pressed={s.id === activeStep.id}
                  >
                    {s.icon} {i + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Step title */}
            <div className="mb-6">
              <p className="text-muted font-mono text-xs mb-1">
                Step {currentIdx + 1} of {STEPS.length}
              </p>
              <h1 className="font-heading text-2xl md:text-3xl font-bold text-off-white">
                {activeStep.icon} {activeStep.label}
              </h1>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep.id}
                initial={reduced ? undefined : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? undefined : { opacity: 0, y: -16 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="step-viewer-page"
              >
                <Suspense fallback={<StepLoader />}>
                  <ActiveComponent />
                </Suspense>
              </motion.div>
            </AnimatePresence>

            {/* Prev / Next navigation */}
            <div className="flex justify-between mt-10 pt-6 border-t border-border">
              <button
                onClick={() => goToIndex(currentIdx - 1)}
                disabled={currentIdx === 0}
                className="btn-glow btn-copper disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Previous step"
              >
                ← Prev
              </button>
              <span className="text-muted text-sm font-mono self-center">
                {currentIdx + 1} / {STEPS.length}
              </span>
              <button
                onClick={() => goToIndex(currentIdx + 1)}
                disabled={currentIdx === STEPS.length - 1}
                className="btn-glow btn-copper disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Next step"
              >
                Next →
              </button>
            </div>
          </main>
        </div>

        <Footer />

        {/* Mobile sticky bottom bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-border flex justify-around items-center py-2 px-1">
          <a
            href={`${import.meta.env.BASE_URL}downloads/Team18_Design_Report.docx`}
            download
            aria-label="Download Design Report"
            className="flex flex-col items-center gap-0.5 text-copper text-xs font-mono p-2"
          >
            <span className="text-lg">📄</span>Report
          </a>
          <a
            href={`${import.meta.env.BASE_URL}downloads/Team18_Presentation.pptx`}
            download
            aria-label="Download Presentation"
            className="flex flex-col items-center gap-0.5 text-cyan text-xs font-mono p-2"
          >
            <span className="text-lg">📊</span>PPT
          </a>
          <a
            href="https://github.com/RKNAGA18/vsm-gru-asic"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub Repository"
            className="flex flex-col items-center gap-0.5 text-lime text-xs font-mono p-2"
          >
            <span className="text-lg">🐙</span>GitHub
          </a>
        </div>

        {/* Lightbox */}
        <AnimatePresence>
          {lightbox && (
            <Lightbox
              src={lightbox.src}
              alt={lightbox.alt}
              caption={lightbox.caption}
              onClose={() => setLightbox(null)}
            />
          )}
        </AnimatePresence>

        {/* Keyboard hint (shown once, 5 s) */}
        <div
          className="fixed bottom-6 right-6 z-40 text-muted text-xs font-mono glass px-3 py-2 rounded-lg opacity-60 hidden md:block"
          role="complementary"
          aria-label="Keyboard shortcuts"
        >
          ←/→ navigate &nbsp;·&nbsp; F fullscreen &nbsp;·&nbsp; P presenter &nbsp;·&nbsp; Esc close
        </div>
      </div>
    </LightboxContext.Provider>
  );
}
