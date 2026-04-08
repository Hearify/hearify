import { create } from 'zustand';

interface SideNavigation {
  sideNavigationPosition: number;

  setSideNavigationPosition: (index: number) => void;
}

export const useSideNavigationStore = create<SideNavigation>((set) => ({
  sideNavigationPosition: 0,
  setSideNavigationPosition: (index) => set({ sideNavigationPosition: index }),
}));
