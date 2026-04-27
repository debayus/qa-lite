import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, addDoc, doc, serverTimestamp, updateDoc, } from "firebase/firestore";
import { db } from "@/lib/firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
export function useProjects() {
    const { user, loading: authLoading } = useAuth();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (authLoading)
            return;
        if (!user) {
            setLoading(false);
            return;
        }
        const q = query(collection(db, "projects"), where("memberIds", "array-contains", user.uid));
        return onSnapshot(q, (snap) => {
            setProjects(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
            setLoading(false);
        }, (error) => {
            console.error("useProjects snapshot error:", error);
            setLoading(false);
        });
    }, [user?.uid, authLoading]);
    async function createProject(name) {
        if (!user)
            return;
        await addDoc(collection(db, "projects"), {
            name,
            ownerId: user.uid,
            memberIds: [user.uid],
            members: { [user.uid]: "admin" },
            stats: {
                totalBugs: 0,
                openBugs: 0,
                totalTestCases: 0,
                passedTestCases: 0,
            },
            createdAt: serverTimestamp(),
        });
    }
    async function renameProject(projectId, newName) {
        const trimmed = newName.trim();
        if (!trimmed)
            return;
        await updateDoc(doc(db, "projects", projectId), { name: trimmed });
    }
    return { projects, loading, createProject, renameProject };
}
export function useProject(projectId) {
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (!projectId) {
            setLoading(false);
            return;
        }
        return onSnapshot(doc(db, "projects", projectId), (snap) => {
            setProject(snap.exists() ? { id: snap.id, ...snap.data() } : null);
            setLoading(false);
        });
    }, [projectId]);
    return { project, loading };
}
