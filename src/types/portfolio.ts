import { StockCode, MoneyAmount, ShareCount } from "@/types/common";

/** 내 계좌 요약(목록 상단 카드) */
export interface MyAccountSummary {
	/** 현금성 자산 */
	cashBalance: MoneyAmount;
	/** 금일 손익(금액) */
	todayProfitMoney: MoneyAmount;
	/** 금일 손익(%) */
	todayProfitRate: number;
}

/** 목록 카드 한 줄(내가 가진 한 종목) */
export interface PortfolioListItem {
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
}

/** 목록 조회 응답 */
export interface PortfolioListResponse {
	account: MyAccountSummary;
	items: PortfolioListItem[];
	/** 응답 갱신 시각 */
	updatedAt: number;
}
