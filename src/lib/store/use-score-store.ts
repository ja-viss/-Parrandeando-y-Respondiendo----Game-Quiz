import { create } from 'zustand';

interface ScoreState {
  isModalOpen: boolean;
  isAdmin: boolean;
  openModal: () => void;
  closeModal: () => void;
  setAdmin: (isAdmin: boolean) => void;
}

export const useScoreStore = create<ScoreState>((set) => ({
  isModalOpen: false,
  isAdmin: false,
  openModal: () => set({ isModalOpen: true }),
  closeModal: () => set({ isModalOpen: false }),
  setAdmin: (isAdmin) => set({ isAdmin }),
}));
