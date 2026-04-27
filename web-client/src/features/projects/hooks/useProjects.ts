import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import type { Project } from "@/types";

export function useProjects() {
  const { user, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    const q = query(
      collection(db, "projects"),
      where("memberIds", "array-contains", user.uid),
    );
    return onSnapshot(
      q,
      (snap) => {
        setProjects(
          snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Project),
        );
        setLoading(false);
      },
      (error) => {
        console.error("useProjects snapshot error:", error);
        setLoading(false);
      },
    );
  }, [user?.uid, authLoading]);

  async function createProject(name: string) {
    if (!user) return;
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

  async function renameProject(projectId: string, newName: string) {
    const trimmed = newName.trim();
    if (!trimmed) return;
    await updateDoc(doc(db, "projects", projectId), { name: trimmed });
  }

  return { projects, loading, createProject, renameProject };
}

export function useProject(projectId: string | undefined) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return;
    }
    return onSnapshot(doc(db, "projects", projectId), (snap) => {
      setProject(
        snap.exists() ? ({ id: snap.id, ...snap.data() } as Project) : null,
      );
      setLoading(false);
    });
  }, [projectId]);

  return { project, loading };
}
