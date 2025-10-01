"use client";

import { useOverlayStore } from "@/store/overlayStore";
import { AnimatePresence } from "motion/react";
import * as motion from "motion/react-m";
import { useEffect } from "react";

export const SuccessToastProvider = ({ children }: { children?: React.ReactNode }) => {
  const { toastFg, closeToast } = useOverlayStore();

  useEffect(() => {
    toastFg && setTimeout(() => closeToast(), 3_000);
  }, [toastFg]);

  return (
    <>
      {children}
      <div className="fixed right-0 bottom-10 left-0 z-10 flex justify-center">
        <AnimatePresence>
          {toastFg && (
            <motion.div
              className="rounded-md bg-green-500 px-4 py-2 text-white"
              key={Number(toastFg)}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              평단 저장완료 👍
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};
