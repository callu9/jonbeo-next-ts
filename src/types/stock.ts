import { StockCode, MoneyAmount, ShareCount, PriceCandle, PriceBoard } from "@/types/common";

/** 내가 가진 특정 종목 상세 */
export interface StockDetail {
  code: StockCode;
  name: string;

  /** 보유 수량 */
  shares: ShareCount;
  /** 매입평균가 */
  avgBuyPrice: MoneyAmount;
  /** 현재가 */
  currentPrice: MoneyAmount;

  /** 평가손익(금액) */
  profitLossMoney: MoneyAmount;
  /** 평가손익(%) */
  profitLossRate: number;

  /** 금일 변동액(선택, 모의 데이터) */
  todayChangeMoney?: MoneyAmount;
  /** 금일 변동률(%) */
  todayChangeRate?: number;

  /**
   * TODO: 제거 및 분리
   * 차트(선택)
   */
  recentCandles?: PriceCandle[];
  /** 호가(선택) */
  priceBoard?: PriceBoard;

  /** 가장 최근 선택한 평단가 */
  targetAveragePrice?: MoneyAmount;

  /** 갱신 시각 */
  updatedAt: number;
}
