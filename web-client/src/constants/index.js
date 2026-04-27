export const ROUTES = {
    LOGIN: "/login",
    SIGNUP: "/signup",
    DASHBOARD: "/",
    PROJECTS: "/projects",
    BILLING: "/billing",
};
export const projectRoutes = {
    scenarios: (id) => `/projects/${id}/scenarios`,
    execution: (id) => `/projects/${id}/execution`,
    bugs: (id) => `/projects/${id}/bugs`,
    reports: (id) => `/projects/${id}/reports`,
    members: (id) => `/projects/${id}/members`,
};
export const SEVERITY_COLOR = {
    critical: "bg-red-100 text-red-700",
    major: "bg-orange-100 text-orange-700",
    minor: "bg-yellow-100 text-yellow-700",
    trivial: "bg-gray-100 text-gray-600",
};
export const TEST_STATUS_COLOR = {
    passed: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
    blocked: "bg-orange-100 text-orange-700",
    skipped: "bg-gray-100 text-gray-600",
    untested: "bg-blue-50 text-blue-600",
};
export const TEST_STATUS_LABEL = {
    untested: "Not Run",
    passed: "Passed",
    failed: "Failed",
    blocked: "Blocked",
    skipped: "Skipped",
};
export const STARTER_LIMITS = {
    maxProjects: 1,
    maxMembers: 3,
    maxTestCasesPerMonth: 200,
    storageMB: 100,
};
// ─── Bug domain constants ────────────────────────────────────────────────────
export const BUG_STATUS_LABEL = {
    open: "Open",
    in_progress: "In Progress",
    resolved: "Resolved",
    closed: "Closed",
};
/** Dot/badge color for each bug status (Tailwind bg class). */
export const BUG_STATUS_COLOR = {
    open: "bg-red-500",
    in_progress: "bg-yellow-400",
    resolved: "bg-blue-500",
    closed: "bg-gray-400",
};
/** Workflow: the next logical status after the current one, or null if terminal. */
export const BUG_NEXT_STATUS = {
    open: "in_progress",
    in_progress: "resolved",
    resolved: "closed",
    closed: null,
};
/** Ordered list of available bug severities. */
export const BUG_SEVERITIES = [
    "critical",
    "major",
    "minor",
    "trivial",
];
// ─── Member / role constants ─────────────────────────────────────────────────
export const ROLE_COLOR = {
    admin: "bg-indigo-100 text-indigo-700",
    tester: "bg-green-100 text-green-700",
    viewer: "bg-gray-100 text-gray-600",
};
// ─── Shared input styling ────────────────────────────────────────────────────
export const INPUT_CLASS = "w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-colors";
export const TEXTAREA_CLASS = "w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-colors resize-none";
// ─── Shared button classes ────────────────────────────────────────────────────
export const BTN_PRIMARY = "flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm";
/** Full-width primary button — used in form submit actions (auth, etc). */
export const BTN_SUBMIT = "w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm";
export const BTN_DANGER = "flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm";
export const BTN_SECONDARY = "px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors";
/** Small secondary button — used for Export CSV, secondary toolbar actions. */
export const BTN_SM_SECONDARY = "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors";
/** Small indigo ghost button — used for Import CSV, secondary toolbar actions. */
export const BTN_SM_PRIMARY = "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors";
// ─── Shared card / container class ───────────────────────────────────────────
export const CARD_CLASS = "bg-white border border-gray-200 rounded-xl";
// ─── Avatar background per role ──────────────────────────────────────────────
export const ROLE_AVATAR_BG = {
    admin: "bg-indigo-500",
    tester: "bg-green-500",
    viewer: "bg-gray-400",
};
