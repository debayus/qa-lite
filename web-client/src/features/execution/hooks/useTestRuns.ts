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
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import type {
  TestCase,
  TestCaseStatus,
  TestRun,
  TestRunResult,
  TestRunSummary,
  RunStatus,
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

export function useTestRuns(
  projectId: string | undefined,
  scenarioId: string | undefined,
) {
  const { user } = useAuth();
  const [runs, setRuns] = useState<TestRun[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId || !scenarioId) {
      setRuns([]);
      setLoading(false);
      return;
    }
    const q = query(
      collection(db, "test_runs"),
      where("projectId", "==", projectId),
      where("scenarioId", "==", scenarioId),
    );
    return onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as TestRun);
      data.sort((a, b) => {
        const aTime = (a.createdAt as any)?.toMillis?.() ?? 0;
        const bTime = (b.createdAt as any)?.toMillis?.() ?? 0;
        return bTime - aTime;
      });
      setRuns(data);
      setLoading(false);
    });
  }, [projectId, scenarioId]);

  async function createRun(
    scenarioId: string,
    scenarioTitle: string,
    testCases: TestCase[],
    runName: string,
  ) {
    if (!user || !projectId) return;
    const results: Record<string, TestRunResult> = {};
    testCases.forEach((tc) => {
      results[tc.id] = { title: tc.title, status: "untested" };
    });
    await addDoc(collection(db, "test_runs"), {
      projectId,
      scenarioId,
      scenarioTitle,
      name: runName,
      status: "in_progress" as RunStatus,
      results,
      summary: computeSummary(results),
      createdBy: user.uid,
      createdAt: serverTimestamp(),
      completedAt: null,
    });
  }

  async function updateResult(
    runId: string,
    testCaseId: string,
    status: TestCaseStatus,
    note?: string,
  ) {
    const updates: Record<string, unknown> = {
      [`results.${testCaseId}.status`]: status,
    };
    if (note !== undefined) {
      updates[`results.${testCaseId}.note`] = note;
    }
    await updateDoc(doc(db, "test_runs", runId), updates);
  }

  async function completeRun(runId: string) {
    const run = runs.find((r) => r.id === runId);
    if (!run) return;
    const updatedResults: Record<string, TestRunResult> = {};
    Object.entries(run.results).forEach(([id, r]) => {
      updatedResults[id] =
        r.status === "untested" ? { ...r, status: "skipped" } : r;
    });
    await updateDoc(doc(db, "test_runs", runId), {
      status: "completed" as RunStatus,
      completedAt: serverTimestamp(),
      results: updatedResults,
      summary: computeSummary(updatedResults),
    });
  }

  async function deleteRun(runId: string) {
    await deleteDoc(doc(db, "test_runs", runId));
  }

  const activeRun = runs.find((r) => r.status === "in_progress") ?? null;
  const completedRuns = runs.filter((r) => r.status === "completed");

  return {
    runs,
    activeRun,
    completedRuns,
    loading,
    createRun,
    updateResult,
    completeRun,
    deleteRun,
  };
}
