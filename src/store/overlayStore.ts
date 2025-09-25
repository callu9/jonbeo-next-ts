import { create } from "zustand";

interface OverlayStore {
  modalFg?: boolean;
  openModal: () => void;
  closeModal: () => void;
  toastFg?: boolean;
  openToast: () => void;
  closeToast: () => void;
}
export const useOverlayStore = create<OverlayStore>()((set) => ({
  modalFg: false,
  toastFg: false,
  openModal: () => set({ modalFg: true }),
  closeModal: () => set({ modalFg: false }),
  openToast: () => set({ toastFg: true }),
  closeToast: () => set({ toastFg: undefined }),
}));
