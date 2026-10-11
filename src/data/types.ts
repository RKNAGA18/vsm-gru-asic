// ─── Project data types (mirrors src/data/project.json) ──────────────────────

export interface TeamMember { name: string; roll: string; }

export interface HeadlineMetric {
  label: string;
  value: string;
  note: string;
}

export interface CyclePhase {
  phase: string;
  work: string;
  cycles: number;
}

export type WordLengthRow = [string, string];
export type RegisterRow   = [string, string, string, string]; // addr, name, desc, reset
export type PortRow       = [string, string];

export interface VerificationData {
  regression: [string, string, string, string][];
  directed:   string[];
  longStream: {
    frames: number; duration: string; hMax: string;
    alertAssertions: number; continuity: string; note: string;
  };
  error: [string, number, number, number][];   // label, max, mean, rms
  lut:   { sigmoidMax: number; sigmoidMean: number; tanhMax: number; tanhMean: number };
  correlation: {
    scoreFloatVsRtl: number; avgVsLabel: number;
    target: number; alertDecisionsDiffering: string;
  };
  notRun: string[];
}

export interface SynthesisData {
  tool: string;
  rows: [string, string][];
  criticalPath: string;
}

export interface PnRData {
  tool: string;
  floorplanUtilisation: number;
  flow: string[];
  rows: [string, string][];
  cts: { sinks: number; insertionNs: string; skewNs: { slow: number; typ: number; fast: number } };
}

export interface SignoffData {
  tool: string;
  rows: [string, string][];
  powerBreakdownMw: { internal: number; switching: number; leakage: number };
  note: string;
}

export interface ComplianceRow {
  requirement: string;
  criterion:   string;
  actual:       string;
  status:       "met" | "above target" | "partial" | "not met" | "not done";
}

export interface ProjectData {
  team: { number: number; name: string; members: TeamMember[] };
  event: string;
  title: string;
  subtitle: string;
  repo: string;
  headline: HeadlineMetric[];
  cycleSchedule: CyclePhase[];
  cycleTotal: number;
  wordLengths: WordLengthRow[];
  registers: RegisterRow[];
  ports: PortRow[];
  verification: VerificationData;
  synthesis: SynthesisData;
  pnr: PnRData;
  signoff: SignoffData;
  powerCompare: [string, number][];
  compliance: [string, string, string, string][];
  limitations: string[];
}
