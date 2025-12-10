import { create } from 'zustand';
import { useToast } from '@/hooks/use-toast';

interface ScoreState {
  isModalOpen: boolean;
  isAdmin: boolean;
  openModal: () => void;
  closeModal: () => void;
  setAdmin: (isAdmin: boolean) => void;
  authError: () => void;
}

export const useScoreStore = create<ScoreState>((set) => ({
  isModalOpen: false,
  isAdmin: false,
  openModal: () => set({ isModalOpen: true }),
  closeModal: () => set({ isModalOpen: false }),
  setAdmin: (isAdmin) => set({ isAdmin }),
  authError: () => {
    useToast.getState().toast({
      title: "Clave incorrecta",
      description: "La clave de acceso de administrador no es válida.",
      variant: "destructive",
    });
    set({ isAdmin: false });
  },
}));
