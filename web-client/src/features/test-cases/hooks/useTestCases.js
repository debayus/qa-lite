import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, writeBatch, getDoc, setDoc, increment, } from "firebase/firestore";
import { db } from "@/lib/firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
/** Increment (or reset-then-set) the monthly test-case counter for a user. */
async function incrementMonthlyUsage(uid, count) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const ref = doc(db, "usage", uid);
    const snap = await getDoc(ref);
    if (!snap.exists() ||
        snap.data().cycleYear !== year ||
        snap.data().cycleMonth !== month) {
        await setDoc(ref, {
            testCasesThisMonth: count,
            cycleYear: year,
            cycleMonth: month,
        });
    }
    else {
        await updateDoc(ref, { testCasesThisMonth: increment(count) });
    }
}
export function useTestCases(projectId, scenarioId) {
    const { user } = useAuth();
    const [testCases, setTestCases] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (!projectId || !scenarioId)
            return;
        const q = query(collection(db, "test_cases"), where("projectId", "==", projectId), where("scenarioId", "==", scenarioId));
        return onSnapshot(q, (snap) => {
            const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
            setTestCases(items);
            setLoading(false);
        });
    }, [projectId, scenarioId]);
    async function createTestCase(title) {
        if (!user || !projectId || !scenarioId)
            return;
        const result = await addDoc(collection(db, "test_cases"), {
            projectId,
            scenarioId,
            title,
            steps: [],
            status: "untested",
            order: testCases.length,
            createdBy: user.uid,
            updatedAt: serverTimestamp(),
        });
        await incrementMonthlyUsage(user.uid, 1);
        return result;
    }
    async function updateTestCase(id, data) {
        await updateDoc(doc(db, "test_cases", id), {
            ...data,
            updatedAt: serverTimestamp(),
        });
    }
    async function deleteTestCase(id) {
        await deleteDoc(doc(db, "test_cases", id));
    }
    async function bulkCreateTestCases(items) {
        if (!user || !projectId || !scenarioId || items.length === 0)
            return;
        const batch = writeBatch(db);
        const startOrder = testCases.length;
        items.forEach((item, i) => {
            const ref = doc(collection(db, "test_cases"));
            batch.set(ref, {
                projectId,
                scenarioId,
                title: item.title,
                steps: item.steps,
                status: item.status,
                order: startOrder + i,
                createdBy: user.uid,
                updatedAt: serverTimestamp(),
            });
        });
        await batch.commit();
        await incrementMonthlyUsage(user.uid, items.length);
    }
    async function moveTestCase(id, direction) {
        const idx = testCases.findIndex((tc) => tc.id === id);
        const swapIdx = direction === "up" ? idx - 1 : idx + 1;
        if (idx < 0 || swapIdx < 0 || swapIdx >= testCases.length)
            return;
        // Normalize all orders then swap the two positions
        const batch = writeBatch(db);
        testCases.forEach((tc, i) => {
            let newOrder = i;
            if (i === idx)
                newOrder = swapIdx;
            else if (i === swapIdx)
                newOrder = idx;
            batch.update(doc(db, "test_cases", tc.id), { order: newOrder });
        });
        await batch.commit();
    }
    return {
        testCases,
        loading,
        createTestCase,
        bulkCreateTestCases,
        updateTestCase,
        deleteTestCase,
        moveTestCase,
    };
}
