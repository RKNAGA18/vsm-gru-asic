import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface Props {
  src: string;
  alt: string;
  caption: string;
  onClose: () => void;
}

export default function Lightbox({ src, alt, caption, onClose }: Props) {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const lastPos  = useRef({ x: 0, y: 0 });

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setScale((s) => Math.max(0.5, Math.min(5, s - e.deltaY * 0.002)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging.current) return;
    setOffset((o) => ({
      x: o.x + e.clientX - lastPos.current.x,
      y: o.y + e.clientY - lastPos.current.y,
    }));
    lastPos.current = { x: e.clientX, y: e.clientY };
  };
  const handleMouseUp = () => { dragging.current = false; };

  return (
    <motion.div
      className="lightbox-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={`Image lightbox: ${alt}`}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 text-off-white bg-black/60 rounded-full w-10 h-10 flex items-center justify-center text-xl hover:bg-copper/30 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-copper"
        aria-label="Close lightbox"
      >
        ✕
      </button>

      {/* Zoom controls */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-3 glass px-4 py-2 rounded-full">
        <button
          onClick={() => setScale((s) => Math.max(0.5, s - 0.25))}
          className="text-off-white hover:text-copper text-lg px-2"
          aria-label="Zoom out"
        >−</button>
        <span className="text-muted font-mono text-sm self-center w-12 text-center">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={() => setScale((s) => Math.min(5, s + 0.25))}
          className="text-off-white hover:text-copper text-lg px-2"
          aria-label="Zoom in"
        >+</button>
        <button
          onClick={() => { setScale(1); setOffset({ x: 0, y: 0 }); }}
          className="text-muted hover:text-copper text-sm px-2 font-mono"
          aria-label="Reset zoom"
        >1:1</button>
      </div>

      {/* Image */}
      <div
        className="overflow-hidden flex items-center justify-center w-full h-full"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: dragging.current ? "grabbing" : "grab" }}
      >
        <img
          src={src}
          alt={alt}
          style={{
            transform: `scale(${scale}) translate(${offset.x / scale}px, ${offset.y / scale}px)`,
            transition: dragging.current ? "none" : "transform 0.15s",
            maxWidth: "90vw",
            maxHeight: "85vh",
            objectFit: "contain",
            borderRadius: "8px",
            userSelect: "none",
          }}
          draggable={false}
        />
      </div>

      {/* Caption */}
      {caption && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 glass px-4 py-2 rounded-lg text-center">
          <p className="text-muted text-sm font-mono">{caption}</p>
        </div>
      )}
    </motion.div>
  );
}
