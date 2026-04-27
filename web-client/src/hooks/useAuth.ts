import { useEffect } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/firestore";
import { onAuthChange } from "@/lib/firebase/auth";
import { initRevenueCat, getEntitlement } from "@/lib/revenuecat";
import { useAuthStore } from "@/stores/auth.store";
import type { AppUser } from "@/types";

export function useAuthInit() {
  const { setAuth, clearAuth } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (!firebaseUser) {
        clearAuth();
        return;
      }

      try {
        initRevenueCat(firebaseUser.uid);

        const userRef = doc(db, "users", firebaseUser.uid);
        const snap = await getDoc(userRef);

        let appUser: AppUser;
        if (snap.exists()) {
          appUser = snap.data() as AppUser;
        } else {
          appUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email ?? "",
            displayName:
              firebaseUser.displayName ?? firebaseUser.email ?? "User",
            entitlement: "free",
            currentProjectId: null,
          };
          await setDoc(userRef, { ...appUser, createdAt: serverTimestamp() });
        }

        const entitlement = await getEntitlement();
        setAuth(firebaseUser, { ...appUser, entitlement });
      } catch (e) {
        console.error("Auth init error:", e);
        clearAuth();
      }
    });

    return unsubscribe;
  }, [setAuth, clearAuth]);
}

export function useAuth() {
  return useAuthStore((state) => ({
    user: state.appUser,
    firebaseUser: state.firebaseUser,
    loading: state.loading,
    isAuthenticated: state.firebaseUser !== null && !state.loading,
    updateEntitlement: state.updateEntitlement,
  }));
}
