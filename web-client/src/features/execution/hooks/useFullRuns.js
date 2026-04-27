import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, getDocs, serverTimestamp, } from "firebase/firestore";
import { db } from "@/lib/firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
function computeSummary(results) {
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
function mergeOverallSummary(scenarioRuns) {
    const all = Object.values(scenarioRuns).flatMap((sr) => Object.values(sr.results));
    return {
        total: all.length,
        passed: all.filter((r) => r.status === "passed").length,
        failed: all.filter((r) => r.status === "failed").length,
        blocked: all.filter((r) => r.status === "blocked").length,
        skipped: all.filter((r) => r.status === "skipped").length,
        untested: all.filter((r) => r.status === "untested").length,
    };
}
export function useFullRuns(projectId) {
    const { user } = useAuth();
    const [fullRuns, setFullRuns] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (!projectId) {
            setFullRuns([]);
            setLoading(false);
            return;
        }
        const q = query(collection(db, "test_suite_runs"), where("projectId", "==", projectId));
        return onSnapshot(q, (snap) => {
            const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            data.sort((a, b) => {
                const aTime = a.createdAt?.toMillis?.() ?? 0;
                const bTime = b.createdAt?.toMillis?.() ?? 0;
                return bTime - aTime;
            });
            setFullRuns(data);
            setLoading(false);
        });
    }, [projectId]);
    async function createFullRun(name, scenarios) {
        if (!user || !projectId || scenarios.length === 0)
            return;
        const scenarioRuns = {};
        for (const scenario of scenarios) {
            const q = query(collection(db, "test_cases"), where("projectId", "==", projectId), where("scenarioId", "==", scenario.id));
            const snap = await getDocs(q);
            const tcs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            tcs.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
            const results = {};
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
            status: "in_progress",
            type: "full",
            scenarioOrder: scenarios.map((s) => s.id),
            scenarioRuns,
            overallSummary: mergeOverallSummary(scenarioRuns),
            createdBy: user.uid,
            createdAt: serverTimestamp(),
            completedAt: null,
        });
    }
    async function updateResult(runId, scenarioId, testCaseId, status, note) {
        const run = fullRuns.find((r) => r.id === runId);
        if (!run)
            return;
        const updates = {
            [`scenarioRuns.${scenarioId}.results.${testCaseId}.status`]: status,
        };
        if (note !== undefined) {
            updates[`scenarioRuns.${scenarioId}.results.${testCaseId}.note`] = note;
        }
        // Recompute per-scenario summary and overall summary optimistically
        const updatedScenarioRuns = JSON.parse(JSON.stringify(run.scenarioRuns));
        updatedScenarioRuns[scenarioId].results[testCaseId].status = status;
        if (note !== undefined) {
            updatedScenarioRuns[scenarioId].results[testCaseId].note = note;
        }
        updates[`scenarioRuns.${scenarioId}.summary`] = computeSummary(updatedScenarioRuns[scenarioId].results);
        updates["overallSummary"] = mergeOverallSummary(updatedScenarioRuns);
        await updateDoc(doc(db, "test_suite_runs", runId), updates);
    }
    async function completeFullRun(runId) {
        const run = fullRuns.find((r) => r.id === runId);
        if (!run)
            return;
        const updatedScenarioRuns = {};
        Object.entries(run.scenarioRuns).forEach(([scId, scData]) => {
            const updatedResults = {};
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
            status: "completed",
            completedAt: serverTimestamp(),
            scenarioRuns: updatedScenarioRuns,
            overallSummary: mergeOverallSummary(updatedScenarioRuns),
        });
    }
    async function deleteFullRun(runId) {
        await deleteDoc(doc(db, "test_suite_runs", runId));
    }
    const activeFullRun = fullRuns.find((r) => r.status === "in_progress") ?? null;
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
