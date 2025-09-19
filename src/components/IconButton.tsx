import Image from "next/image";
import { HTMLAttributes } from "react";

const Icons = {
  back: { url: "/icons/back.svg", alt: "뒤로가기" },
  adjust: { url: "/icons/adjust.svg", alt: "평단가 조정" },
  plus: { url: "/icons/plus.svg", alt: "더하기" },
  minus: { url: "/icons/minus.svg", alt: "빼기" },
  multiply: { url: "/icons/multiply.svg", alt: "곱하기" },
};

interface IconButtonProps extends HTMLAttributes<HTMLButtonElement> {
  iconNm: keyof typeof Icons;
}

export default function IconButton({ iconNm, ...props }: IconButtonProps) {
  return (
    <button className="cursor-pointer rounded-full border border-gray-400 bg-white p-2" {...props}>
      <Image
        src={Icons[iconNm].url}
        alt={`${Icons[iconNm].alt} 버튼 이미지`}
        width={20}
        height={20}
        draggable={false}
      />
    </button>
  );
}
