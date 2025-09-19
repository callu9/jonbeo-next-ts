import { getStockDetail } from "@/apis/stocks";
import IconButton from "@/components/IconButton";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  StockDetailGraphClient,
  StockStatusClient,
} from "../../../components/stocks/StockDetailClient";

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
      <div className="grid gap-8">
        <div className="flex flex-col px-5">
          <StockStatusClient {...{ name, currentPrice, profitLossMoney, profitLossRate }} />
        </div>
        <div className="self-stretch">
          <StockDetailGraphClient {...detail} />
        </div>
      </div>
    </div>
  );
}
