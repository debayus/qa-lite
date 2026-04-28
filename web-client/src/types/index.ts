export type UserRole = "admin" | "tester" | "viewer";
export type Entitlement = "free" | "pro";
export type TestCaseStatus =
  | "untested"
  | "passed"
  | "failed"
  | "blocked"
  | "skipped";
export type BugSeverity = "critical" | "major" | "minor" | "trivial";
export type BugStatus = "open" | "in_progress" | "resolved" | "closed";

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  entitlement: Entitlement;
  currentProjectId: string | null;
}

export interface ProjectStats {
  totalBugs: number;
  openBugs: number;
  totalTestCases: number;
  passedTestCases: number;
}

export interface Project {
  id: string;
  name: string;
  ownerId: string;
  members: Record<string, UserRole>;
  stats: ProjectStats;
  createdAt: Date;
}

export interface TestScenario {
  id: string;
  projectId: string;
  title: string;
  order?: number;
  createdBy: string;
  createdAt: Date;
}

export interface TestCase {
  id: string;
  projectId: string;
  scenarioId: string;
  title: string;
  steps: string[];
  status: TestCaseStatus;
  order?: number;
  createdBy: string;
  updatedAt: Date;
}

export interface Bug {
  id: string;
  projectId: string;
  testCaseId: string | null;
  title: string;
  description: string;
  severity: BugSeverity;
  status: BugStatus;
  attachments: string[];
  reportedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Test Run (Execution History) ────────────────────────────────────────────

export type RunStatus = "in_progress" | "completed";

export interface TestRunResult {
  title: string;
  status: TestCaseStatus;
  note?: string;
  steps?: string[];
}

export interface TestRunSummary {
  total: number;
  passed: number;
  failed: number;
  blocked: number;
  skipped: number;
  untested: number;
}

export interface TestRun {
  id: string;
  projectId: string;
  scenarioId: string;
  scenarioTitle: string;
  name: string;
  status: RunStatus;
  createdBy: string;
  createdAt: Date;
  completedAt?: Date | null;
  results: Record<string, TestRunResult>;
  summary: TestRunSummary;
}

// ─── Full (All-Scenarios) Test Run ────────────────────────────────────────────

export interface ScenarioRunData {
  scenarioTitle: string;
  results: Record<string, TestRunResult>;
  summary: TestRunSummary;
}

export interface FullTestRun {
  id: string;
  projectId: string;
  name: string;
  status: RunStatus;
  type: "full";
  scenarioOrder: string[];
  scenarioRuns: Record<string, ScenarioRunData>;
  overallSummary: TestRunSummary;
  createdBy: string;
  createdAt: Date;
  completedAt?: Date | null;
}
