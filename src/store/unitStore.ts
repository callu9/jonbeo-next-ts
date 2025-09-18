import { create } from "zustand";

interface UnitStore {
  isWon?: boolean;
  setUnitToWon: () => void;
  setUnitToDollar: () => void;
}
export const useUnitStore = create<UnitStore>()((set) => ({
  isWon: false,
  setUnitToWon: () => set({ isWon: true }),
  setUnitToDollar: () => set({ isWon: false }),
}));
