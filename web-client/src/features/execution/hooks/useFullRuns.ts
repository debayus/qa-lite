import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import type {
  TestScenario,
  TestCase,
  TestCaseStatus,
  TestRunResult,
  TestRunSummary,
  RunStatus,
  FullTestRun,
  ScenarioRunData,
} from "@/types";

function computeSummary(
  results: Record<string, TestRunResult>,
): TestRunSummary {
  const vals = Object.values(results);
  return {
    total: vals.length,
    passed: vals.filter((r) => r.status === "passed").length,
    failed: vals.filter((r) => r.status === "failed").length,
    blocked: vals.filter((r) => r.status === "blocked").length,
    skipped: vals.filter((r) => r.status === "skipped").length,
    untested: vals.filter((r) => r.status === "untested").length,
  };
}

function mergeOverallSummary(
  scenarioRuns: Record<string, ScenarioRunData>,
): TestRunSummary {
  const all = Object.values(scenarioRuns).flatMap((sr) =>
    Object.values(sr.results),
  );
  return {
    total: all.length,
    passed: all.filter((r) => r.status === "passed").length,
    failed: all.filter((r) => r.status === "failed").length,
    blocked: all.filter((r) => r.status === "blocked").length,
    skipped: all.filter((r) => r.status === "skipped").length,
    untested: all.filter((r) => r.status === "untested").length,
  };
}

export function useFullRuns(projectId: string | undefined) {
  const { user } = useAuth();
  const [fullRuns, setFullRuns] = useState<FullTestRun[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) {
      setFullRuns([]);
      setLoading(false);
      return;
    }
    const q = query(
      collection(db, "test_suite_runs"),
      where("projectId", "==", projectId),
    );
    return onSnapshot(q, (snap) => {
      const data = snap.docs.map(
        (d) => ({ id: d.id, ...d.data() }) as FullTestRun,
      );
      data.sort((a, b) => {
        const aTime = (a.createdAt as any)?.toMillis?.() ?? 0;
        const bTime = (b.createdAt as any)?.toMillis?.() ?? 0;
        return bTime - aTime;
      });
      setFullRuns(data);
      setLoading(false);
    });
  }, [projectId]);

  async function createFullRun(name: string, scenarios: TestScenario[]) {
    if (!user || !projectId || scenarios.length === 0) return;

    const scenarioRuns: Record<string, ScenarioRunData> = {};

    for (const scenario of scenarios) {
      const q = query(
        collection(db, "test_cases"),
        where("projectId", "==", projectId),
        where("scenarioId", "==", scenario.id),
      );
      const snap = await getDocs(q);
      const tcs = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as TestCase);
      tcs.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

      const results: Record<string, TestRunResult> = {};
      tcs.forEach((tc) => {
        results[tc.id] = { title: tc.title, status: "untested" };
      });

      scenarioRuns[scenario.id] = {
        scenarioTitle: scenario.title,
        results,
        summary: computeSummary(results),
      };
    }

    await addDoc(collection(db, "test_suite_runs"), {
      projectId,
      name,
      status: "in_progress" as RunStatus,
      type: "full",
      scenarioOrder: scenarios.map((s) => s.id),
      scenarioRuns,
      overallSummary: mergeOverallSummary(scenarioRuns),
      createdBy: user.uid,
      createdAt: serverTimestamp(),
      completedAt: null,
    });
  }

  async function updateResult(
    runId: string,
    scenarioId: string,
    testCaseId: string,
    status: TestCaseStatus,
    note?: string,
  ) {
    const run = fullRuns.find((r) => r.id === runId);
    if (!run) return;

    const updates: Record<string, unknown> = {
      [`scenarioRuns.${scenarioId}.results.${testCaseId}.status`]: status,
    };
    if (note !== undefined) {
      updates[`scenarioRuns.${scenarioId}.results.${testCaseId}.note`] = note;
    }

    // Recompute per-scenario summary and overall summary optimistically
    const updatedScenarioRuns: Record<string, ScenarioRunData> = JSON.parse(
      JSON.stringify(run.scenarioRuns),
    );
    updatedScenarioRuns[scenarioId].results[testCaseId].status = status;
    if (note !== undefined) {
      updatedScenarioRuns[scenarioId].results[testCaseId].note = note;
    }
    updates[`scenarioRuns.${scenarioId}.summary`] = computeSummary(
      updatedScenarioRuns[scenarioId].results,
    );
    updates["overallSummary"] = mergeOverallSummary(updatedScenarioRuns);

    await updateDoc(doc(db, "test_suite_runs", runId), updates);
  }

  async function completeFullRun(runId: string) {
    const run = fullRuns.find((r) => r.id === runId);
    if (!run) return;

    const updatedScenarioRuns: Record<string, ScenarioRunData> = {};
    Object.entries(run.scenarioRuns).forEach(([scId, scData]) => {
      const updatedResults: Record<string, TestRunResult> = {};
      Object.entries(scData.results).forEach(([tcId, r]) => {
        updatedResults[tcId] =
          r.status === "untested" ? { ...r, status: "skipped" } : r;
      });
      updatedScenarioRuns[scId] = {
        ...scData,
        results: updatedResults,
        summary: computeSummary(updatedResults),
      };
    });

    await updateDoc(doc(db, "test_suite_runs", runId), {
      status: "completed" as RunStatus,
      completedAt: serverTimestamp(),
      scenarioRuns: updatedScenarioRuns,
      overallSummary: mergeOverallSummary(updatedScenarioRuns),
    });
  }

  async function deleteFullRun(runId: string) {
    await deleteDoc(doc(db, "test_suite_runs", runId));
  }

  const activeFullRun =
    fullRuns.find((r) => r.status === "in_progress") ?? null;
  const completedFullRuns = fullRuns.filter((r) => r.status === "completed");

  return {
    fullRuns,
    activeFullRun,
    completedFullRuns,
    loading,
    createFullRun,
    updateResult,
    completeFullRun,
    deleteFullRun,
  };
}
