import localFont from "next/font/local";

export const pretendard = localFont({
  src: "./node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2",
  display: "swap", // 로딩 전 시스템 폰트 적용하여, 렌더링 시 깜빡임 방지
  weight: "45 920", // Variable Font의 가변 범위
});
