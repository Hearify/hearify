import { create } from 'zustand';
import * as amplitude from '@amplitude/analytics-browser';

import { SUBSCRIPTIONS } from '@v2/constants/subscription';

import type { Subscription } from '@v2/types/subscription';

export type User = {
  id: number;
  email: string;
  first_name?: string;
  surname?: string;
  birthdate?: string;
  role: string;
  credits: number;
  created_at: string;
  company: string;
  workplace: string;
  updated_at: string;
  subscription_id: string;
  enable_mailing: boolean;
  email_verified: boolean;
};

interface AuthStore {
  isLoggedIn: boolean;
  token: string | null;
  user: User | null;
  subscription: Subscription | null;

  setLogin: (token: string, user: User) => void;
  setLogout: () => void;
  setSubscription: (subscription: Subscription | null) => void;

  changeCredits: (sum: number) => void;

  login: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()((set, get) => ({
  user: null,
  token: null,
  subscription: null,
  isLoggedIn: false,
  setLogin: (token: string, user: User) => set({ token, user, isLoggedIn: true }),
  setSubscription: (subscription: Subscription | null) => set({ subscription }),
  setLogout: () => set({ token: null, user: null, isLoggedIn: false }),

  changeCredits: (sum) =>
    set((state) => {
      if (state.user) return { user: { ...state.user, credits: state.user.credits - sum } };
      return state;
    }),

  login: (token: string, user: User) => {
    const { setLogin, setSubscription } = get();
    setLogin(token, user);
    localStorage.setItem('@token', token);
    amplitude.setUserId(user.id.toString());

    const subscription = SUBSCRIPTIONS.find((item) => item.priceId === user.subscription_id);
    if (subscription) setSubscription(subscription);
  },

  logout: () => {
    const { setLogout, setSubscription } = get();

    setLogout();
    setSubscription(null);
    localStorage.removeItem('@token');

    localStorage.removeItem('uploadStep');
    localStorage.removeItem('uploadStepTab');
    localStorage.removeItem('customizeStep');
    localStorage.removeItem('customizeStepAuto');
  },
}));
