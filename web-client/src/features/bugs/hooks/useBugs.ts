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
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import type { Bug, BugSeverity, BugStatus } from "@/types";

export type CreateBugInput = {
  title: string;
  description: string;
  severity: BugSeverity;
  testCaseId?: string;
};

export function useBugs(projectId: string | undefined) {
  const { user } = useAuth();
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [loading, setLoading] = useState(true);
  const [userMap, setUserMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!projectId) return;
    const q = query(
      collection(db, "bugs"),
      where("projectId", "==", projectId),
    );
    return onSnapshot(q, async (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Bug);
      setBugs(data);
      setLoading(false);

      const uids = [...new Set(data.map((b) => b.reportedBy).filter(Boolean))];
      const newMap: Record<string, string> = {};
      await Promise.all(
        uids.map(async (uid) => {
          const userSnap = await getDoc(doc(db, "users", uid));
          if (userSnap.exists()) {
            const d = userSnap.data();
            newMap[uid] = d.displayName ?? d.email ?? uid;
          } else {
            newMap[uid] = uid;
          }
        }),
      );
      setUserMap(newMap);
    });
  }, [projectId]);

  async function createBug(input: CreateBugInput) {
    if (!user || !projectId) return;
    await addDoc(collection(db, "bugs"), {
      projectId,
      title: input.title,
      description: input.description,
      severity: input.severity,
      testCaseId: input.testCaseId ?? null,
      status: "open" as BugStatus,
      attachments: [],
      reportedBy: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  async function updateBugStatus(bugId: string, status: BugStatus) {
    await updateDoc(doc(db, "bugs", bugId), {
      status,
      updatedAt: serverTimestamp(),
    });
  }

  async function deleteBug(bugId: string) {
    await deleteDoc(doc(db, "bugs", bugId));
  }

  return { bugs, loading, createBug, updateBugStatus, deleteBug, userMap };
}
