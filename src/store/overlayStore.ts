import { JSX } from "react";
import { create } from "zustand";

interface OverlayStore {
  modalFg?: boolean;
  openModal: (modal?: JSX.Element) => void;
  closeModal: () => void;
  toast?: JSX.Element;
  openToast: (toast?: JSX.Element) => void;
  closeToast: () => void;
}
export const useOverlayStore = create<OverlayStore>()((set) => ({
  modalFg: false,
  openModal: () => set({ modalFg: true }),
  closeModal: () => set({ modalFg: false }),
  openToast: (toast) => set({ toast }),
  closeToast: () => set({ toast: undefined }),
}));
