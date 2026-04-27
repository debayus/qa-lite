import { create } from 'zustand';
export const useAuthStore = create((set) => ({
    firebaseUser: null,
    appUser: null,
    loading: true,
    setAuth: (firebaseUser, appUser) => set({ firebaseUser, appUser, loading: false }),
    clearAuth: () => set({ firebaseUser: null, appUser: null, loading: false }),
    updateEntitlement: (entitlement) => set((state) => state.appUser ? { appUser: { ...state.appUser, entitlement } } : {}),
}));
