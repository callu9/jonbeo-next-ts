import { getStockDetail } from "@/apis/stocks";
import IconButton from "@/components/IconButton";
import { cn } from "@/utils/classNames";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StockStatusClient } from "./StockDetailClient";

// export const revalidate = 60; // ISR: 60초마다 재생성(선택)

export async function generateMetadata({
  params,
}: {
  params: { code: string };
}): Promise<Metadata> {
  const parameters = await params;
  const detail = await getStockDetail(parameters.code);
  if (!detail) {
    return { title: "종목을 찾을 수 없습니다" };
  }
  return {
    title: `${detail.name} 주가 상세 | MyStock`,
    description: `${detail.name} 현재가 ${detail.currentPrice}원, 오늘 손익률 ${detail.profitLossRate}%`,
    openGraph: {
      title: `${detail.name} 주식 정보`,
      description: `${detail.name}의 주가, 손익, 차트를 확인하세요.`,
    },
  };
}

export default async function StockDetailPage({ params }: { params: { code: string } }) {
  const parameters = await params;
  const detail = await getStockDetail(parameters.code);
  if (!detail) notFound();

  const { name, currentPrice, profitLossMoney, profitLossRate } = detail;

  return (
    <div className="grid items-stretch justify-stretch gap-1 pb-10">
      <div className="px-5 pt-8 pb-10">
        <Link href="/">
          <IconButton iconNm="back" />
        </Link>
      </div>
      <div className="grid">
        <div className="flex flex-col gap-2 px-5">
          <StockStatusClient {...{ name, currentPrice, profitLossMoney, profitLossRate }} />
        </div>
        <div className="flex-center relative mr-4 items-center self-stretch">
          <div className={cn("relative mt-10 min-h-dvw w-full")}>
            <Image
              className="object-fit bg-clip-content bg-blend-soft-light"
              src="/images/line-skeleton.svg"
              alt="주식 차트 스켈레톤 이미지"
              fill
            />
          </div>
          <div className={cn("h-4 w-4 rounded-full", "bg-red-500")} />
        </div>
      </div>
    </div>
  );
}
