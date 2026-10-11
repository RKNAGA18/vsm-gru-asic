import { lazy } from "react";

export interface StepDef {
  id:        string;
  label:     string;
  hash:      string;
  icon:      string;
  component: React.LazyExoticComponent<() => JSX.Element>;
}

export const STEPS: StepDef[] = [
  { id: "problem-spec",    label: "Problem & Spec (PS-01)",        hash: "#problem-spec",    icon: "📋", component: lazy(() => import("../steps/Step01_ProblemSpec")) },
  { id: "algorithm",       label: "Algorithm & Golden Model",       hash: "#algorithm",       icon: "🧮", component: lazy(() => import("../steps/Step02_Algorithm")) },
  { id: "architecture",    label: "Architecture",                   hash: "#architecture",    icon: "🏗️", component: lazy(() => import("../steps/Step03_Architecture")) },
  { id: "how-it-works",   label: "How It Works",                   hash: "#how-it-works",   icon: "▶️", component: lazy(() => import("../steps/Step04_HowItWorks")) },
  { id: "rtl-regmap",     label: "RTL & Register Map",             hash: "#rtl-regmap",     icon: "📝", component: lazy(() => import("../steps/Step05_RtlRegMap")) },
  { id: "rtl-verify",     label: "RTL Verification",               hash: "#rtl-verify",     icon: "✅", component: lazy(() => import("../steps/Step06_RtlVerification")) },
  { id: "synthesis",       label: "Synthesis (Genus)",              hash: "#synthesis",       icon: "⚙️", component: lazy(() => import("../steps/Step07_Synthesis")) },
  { id: "pnr",             label: "Place & Route (Innovus)",        hash: "#pnr",             icon: "🗺️", component: lazy(() => import("../steps/Step08_PnR")) },
  { id: "signoff",         label: "Signoff (Tempus)",               hash: "#signoff",         icon: "🏁", component: lazy(() => import("../steps/Step09_Signoff")) },
  { id: "gate-sim",        label: "Gate-Level Sim & Power",         hash: "#gate-sim",        icon: "🔬", component: lazy(() => import("../steps/Step10_GateLevelSim")) },
  { id: "limitations",     label: "Limitations & Next Steps",       hash: "#limitations",     icon: "⚠️", component: lazy(() => import("../steps/Step11_Limitations")) },
  { id: "get-files",       label: "Get the Files",                  hash: "#get-files",       icon: "📦", component: lazy(() => import("../steps/Step12_GetFiles")) },
];

export function getStepByHash(hash: string): StepDef {
  return STEPS.find((s) => s.hash === hash) ?? STEPS[0];
}
