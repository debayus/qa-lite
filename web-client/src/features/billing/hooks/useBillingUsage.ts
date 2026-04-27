import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import { useProjects } from "@/features/projects/hooks/useProjects";

export interface BillingUsage {
  projectCount: number;
  memberCount: number;
  testCasesThisMonth: number;
  cycleLabel: string;
  loading: boolean;
}

export function useBillingUsage(): BillingUsage {
  const { user } = useAuth();
  const { projects, loading: projectsLoading } = useProjects();
  const [testCasesThisMonth, setTestCasesThisMonth] = useState(0);
  const [loadingUsage, setLoadingUsage] = useState(true);

  useEffect(() => {
    if (!user) return;
    const ref = doc(db, "usage", user.uid);
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    return onSnapshot(ref, (snap) => {
      if (!snap.exists()) {
        setTestCasesThisMonth(0);
      } else {
        const data = snap.data();
        if (data.cycleYear === year && data.cycleMonth === month) {
          setTestCasesThisMonth(data.testCasesThisMonth ?? 0);
        } else {
          // Stale billing cycle — treat as 0 until next write resets it
          setTestCasesThisMonth(0);
        }
      }
      setLoadingUsage(false);
    });
  }, [user?.uid]);

  const projectCount = projects.length;
  // For Starter plan (max 1 project), member count comes from the first project
  const memberCount = Object.keys(projects[0]?.members ?? {}).length;

  const now = new Date();
  const cycleLabel = now.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  return {
    projectCount,
    memberCount,
    testCasesThisMonth,
    cycleLabel,
    loading: projectsLoading || loadingUsage,
  };
}
