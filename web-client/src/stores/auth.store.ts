import { create } from 'zustand';
import type { User } from 'firebase/auth';
import type { AppUser, Entitlement } from '@/types';

interface AuthState {
  firebaseUser: User | null;
  appUser: AppUser | null;
  loading: boolean;
  setAuth: (firebaseUser: User, appUser: AppUser) => void;
  clearAuth: () => void;
  updateEntitlement: (entitlement: Entitlement) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  firebaseUser: null,
  appUser: null,
  loading: true,
  setAuth: (firebaseUser, appUser) => set({ firebaseUser, appUser, loading: false }),
  clearAuth: () => set({ firebaseUser: null, appUser: null, loading: false }),
  updateEntitlement: (entitlement) =>
    set((state) =>
      state.appUser ? { appUser: { ...state.appUser, entitlement } } : {},
    ),
}));
