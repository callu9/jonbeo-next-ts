import { getPortfolio } from "@/apis/portfolio";
import { AccountSummaryClient, StockListClient } from "./PorfolioClient";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "나의 존버금 현황 보기 | MyPortfolio",
    description: "나의 계좌 잔액, 수익금, 수익률을 통해 존버금 현황을 확인하세요.",
    openGraph: {
      title: "존버금 현황",
      description: "나의 수익률을 확인하세요.",
    },
  };
}

export default async function PortfolioPage() {
  const portfolio = await getPortfolio();

  return (
    <>
      <div className="border-b-1 border-gray-300 px-5 py-3 dark:border-gray-700">
        <h1 className="text-lg md:text-2xl">포트폴리오</h1>
      </div>
      <div className="flex flex-col gap-6 px-5 pt-16 pb-8">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg text-gray-600 dark:text-gray-400">
            나의 <strong>존버금 현황</strong>은?
          </h2>
          <AccountSummaryClient accountSummary={portfolio?.account} />
        </div>
        <StockListClient stocks={portfolio?.stocks} />
      </div>
    </>
  );
}
