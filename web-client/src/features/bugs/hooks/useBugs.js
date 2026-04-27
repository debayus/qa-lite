import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, getDoc, } from "firebase/firestore";
import { db } from "@/lib/firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
export function useBugs(projectId) {
    const { user } = useAuth();
    const [bugs, setBugs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userMap, setUserMap] = useState({});
    useEffect(() => {
        if (!projectId)
            return;
        const q = query(collection(db, "bugs"), where("projectId", "==", projectId));
        return onSnapshot(q, async (snap) => {
            const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            setBugs(data);
            setLoading(false);
            const uids = [...new Set(data.map((b) => b.reportedBy).filter(Boolean))];
            const newMap = {};
            await Promise.all(uids.map(async (uid) => {
                const userSnap = await getDoc(doc(db, "users", uid));
                if (userSnap.exists()) {
                    const d = userSnap.data();
                    newMap[uid] = d.displayName ?? d.email ?? uid;
                }
                else {
                    newMap[uid] = uid;
                }
            }));
            setUserMap(newMap);
        });
    }, [projectId]);
    async function createBug(input) {
        if (!user || !projectId)
            return;
        await addDoc(collection(db, "bugs"), {
            projectId,
            title: input.title,
            description: input.description,
            severity: input.severity,
            testCaseId: input.testCaseId ?? null,
            status: "open",
            attachments: [],
            reportedBy: user.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
    }
    async function updateBugStatus(bugId, status) {
        await updateDoc(doc(db, "bugs", bugId), {
            status,
            updatedAt: serverTimestamp(),
        });
    }
    async function deleteBug(bugId) {
        await deleteDoc(doc(db, "bugs", bugId));
    }
    return { bugs, loading, createBug, updateBugStatus, deleteBug, userMap };
}
