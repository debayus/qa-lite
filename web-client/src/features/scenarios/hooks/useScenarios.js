import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, writeBatch, getDocs, } from "firebase/firestore";
import { db } from "@/lib/firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
export function useScenarios(projectId) {
    const { user } = useAuth();
    const [scenarios, setScenarios] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (!projectId)
            return;
        const q = query(collection(db, "test_scenarios"), where("projectId", "==", projectId));
        return onSnapshot(q, (snap) => {
            const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            docs.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
            setScenarios(docs);
            setLoading(false);
        });
    }, [projectId]);
    async function createScenario(title) {
        if (!user || !projectId)
            return;
        await addDoc(collection(db, "test_scenarios"), {
            projectId,
            title,
            order: scenarios.length,
            createdBy: user.uid,
            createdAt: serverTimestamp(),
        });
    }
    async function deleteScenario(scenarioId) {
        await deleteDoc(doc(db, "test_scenarios", scenarioId));
    }
    async function bulkDeleteScenarios(ids) {
        if (ids.length === 0)
            return;
        const batch = writeBatch(db);
        ids.forEach((id) => batch.delete(doc(db, "test_scenarios", id)));
        await batch.commit();
    }
    async function bulkCreateScenarios(titles) {
        if (!user || !projectId || titles.length === 0)
            return;
        const batch = writeBatch(db);
        const startOrder = scenarios.length;
        titles.forEach((title, i) => {
            const ref = doc(collection(db, "test_scenarios"));
            batch.set(ref, {
                projectId,
                title,
                order: startOrder + i,
                createdBy: user.uid,
                createdAt: serverTimestamp(),
            });
        });
        await batch.commit();
    }
    async function bulkCreateScenariosWithTestCases(data) {
        if (!user || !projectId || data.length === 0)
            return;
        const batch = writeBatch(db);
        const startOrder = scenarios.length;
        data.forEach(({ title, testCases }, i) => {
            const scenarioRef = doc(collection(db, "test_scenarios"));
            batch.set(scenarioRef, {
                projectId,
                title,
                order: startOrder + i,
                createdBy: user.uid,
                createdAt: serverTimestamp(),
            });
            testCases.forEach((tc, j) => {
                const tcRef = doc(collection(db, "test_cases"));
                batch.set(tcRef, {
                    projectId,
                    scenarioId: scenarioRef.id,
                    title: tc.title,
                    steps: tc.steps,
                    status: tc.status,
                    order: j,
                    createdBy: user.uid,
                    updatedAt: serverTimestamp(),
                });
            });
        });
        await batch.commit();
    }
    async function mergeImportScenariosWithTestCases(data) {
        if (!user || !projectId || data.length === 0)
            return;
        // Fetch all existing test cases for this project in one query
        const existingTcsSnap = await getDocs(query(collection(db, "test_cases"), where("projectId", "==", projectId)));
        const tcCountByScenario = new Map();
        existingTcsSnap.docs.forEach((d) => {
            const sid = d.data().scenarioId;
            tcCountByScenario.set(sid, (tcCountByScenario.get(sid) ?? 0) + 1);
        });
        const batch = writeBatch(db);
        let newScenarioOrder = scenarios.length;
        for (const { title, testCases } of data) {
            const existing = scenarios.find((s) => s.title.toLowerCase() === title.toLowerCase());
            let scenarioId;
            if (existing) {
                scenarioId = existing.id;
            }
            else {
                const scenarioRef = doc(collection(db, "test_scenarios"));
                batch.set(scenarioRef, {
                    projectId,
                    title,
                    order: newScenarioOrder++,
                    createdBy: user.uid,
                    createdAt: serverTimestamp(),
                });
                scenarioId = scenarioRef.id;
            }
            if (testCases.length > 0) {
                const startOrder = tcCountByScenario.get(scenarioId) ?? 0;
                testCases.forEach((tc, j) => {
                    const tcRef = doc(collection(db, "test_cases"));
                    batch.set(tcRef, {
                        projectId,
                        scenarioId,
                        title: tc.title,
                        steps: tc.steps,
                        status: tc.status,
                        order: startOrder + j,
                        createdBy: user.uid,
                        updatedAt: serverTimestamp(),
                    });
                });
            }
        }
        await batch.commit();
    }
    async function fetchAllTestCases() {
        if (!projectId)
            return [];
        const q = query(collection(db, "test_cases"), where("projectId", "==", projectId));
        const snap = await getDocs(q);
        return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    }
    async function moveScenario(id, direction) {
        const idx = scenarios.findIndex((s) => s.id === id);
        const swapIdx = direction === "up" ? idx - 1 : idx + 1;
        if (idx < 0 || swapIdx < 0 || swapIdx >= scenarios.length)
            return;
        const batch = writeBatch(db);
        scenarios.forEach((s, i) => {
            let newOrder = i;
            if (i === idx)
                newOrder = swapIdx;
            else if (i === swapIdx)
                newOrder = idx;
            batch.update(doc(db, "test_scenarios", s.id), { order: newOrder });
        });
        await batch.commit();
    }
    return {
        scenarios,
        loading,
        createScenario,
        bulkCreateScenarios,
        bulkCreateScenariosWithTestCases,
        mergeImportScenariosWithTestCases,
        fetchAllTestCases,
        deleteScenario,
        bulkDeleteScenarios,
        moveScenario,
    };
}
