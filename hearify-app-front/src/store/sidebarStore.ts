import { create } from 'zustand';

interface SidebarStore {
  clickedIndexSidebar: number;

  setClickedIndexSidebar: (index: number) => void;
}

const useStore = create<SidebarStore>((set) => ({
  clickedIndexSidebar: 0,
  setClickedIndexSidebar: (index) => set({ clickedIndexSidebar: index }),
}));

export default useStore;
