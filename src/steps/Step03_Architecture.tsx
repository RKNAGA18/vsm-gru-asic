import ArchDiagram from "../components/arch/ArchDiagram";

export default function Step03_Architecture() {
  return (
    <div className="space-y-4">
      <div className="glass p-4 border-l-4 border-copper/60">
        <p className="text-copper font-heading font-semibold">
          Design philosophy: <span className="text-off-white font-normal">Spend cycles to save area — one shared MAC instead of many parallel multipliers.</span>
        </p>
      </div>
      <ArchDiagram />
    </div>
  );
}
