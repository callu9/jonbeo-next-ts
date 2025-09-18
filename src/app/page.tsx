"use client";

import { getPortfolio } from "@/apis/portfolio";
import AmountChange from "@/components/AmountChange";
import StockListItem from "@/components/StockListItem";
import { PortfolioListResponse } from "@/types/portfolio";
import { useEffect, useState } from "react";

export default function Portfolio() {
  const [portfolio, setPortfolio] = useState<PortfolioListResponse | undefined>();

  async function getPortfolioData() {
    const data = await getPortfolio();
    if (data) setPortfolio(data);
  }
  useEffect(() => {
    getPortfolioData();
  }, []);

  return (
    <>
      <div className="border-b-1 border-gray-300 px-5 py-3 dark:border-gray-700">
        <h1 className="text-lg md:text-2xl">포트폴리오</h1>
      </div>
      <div className="flex flex-col gap-6 px-5 pt-16 pb-8">
        <div className="flex flex-col gap-2">
          <h2 className="text-gray-700 dark:text-gray-300">
            나의 <strong>존버금 현황</strong>은?
          </h2>
          {portfolio?.account && <AmountChange {...portfolio?.account} />}
        </div>
        <div className="divide-y divide-gray-300 dark:divide-gray-700">
          {portfolio?.stocks?.map((stock) => (
            <StockListItem key={stock.code} {...stock} />
          ))}
        </div>
      </div>
    </>
  );
}
