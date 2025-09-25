"use client";

import { useOverlayStore } from "@/store/overlayStore";
import { formatDollar } from "@/utils/common";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function PriceModal({ price }: { price: number }) {
  const router = useRouter();
  const { closeModal } = useOverlayStore();

  function handleModalClose() {
    // TODO
    router.push("/");
    closeModal();
  }
  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-[rgba(0,0,0,0.2)]">
      <AnimatePresence>
        <motion.div
          className="flex flex-col items-center justify-center gap-6 rounded-lg bg-[#e4e4e4] p-2 pb-8 dark:bg-[#171717]"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex w-full justify-end">
            <button onClick={closeModal}>
              <Image
                src="/icons/multiply.svg"
                width={24}
                height={24}
                alt="평단가 저장 모달 닫기 버튼 이미지"
              />
            </button>
          </div>
          <div className="flex min-w-[300px] flex-col items-center justify-center gap-1">
            <h3 className="text-2xl font-bold">${formatDollar(price)}</h3>
            <div className="text-lg">평단을 저장하시겠습니까?</div>
          </div>
          <button className="rounded-full bg-white px-4 py-2 font-bold" onClick={handleModalClose}>
            저장하기
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
