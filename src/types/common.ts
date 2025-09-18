export type StockCode = string; // 종목 코드 (예: "AAPL")
export type MoneyAmount = number; // 금액(달러 가정)
export type ShareCount = number; // 주식 수량(주)

/** 종목 기본 정보 */
export interface StockInfo {
	code: StockCode; // 종목 코드
	name: string; // 회사명(예: "애플")
	market?: string; // 거래소(예: "NASDAQ")
}

/** 차트(캔들) 한 구간 */
export interface PriceCandle {
	time: number; // timestamp(ms)
	open: MoneyAmount;
	high: MoneyAmount;
	low: MoneyAmount;
	close: MoneyAmount;
	volume?: number;
}

/** 호가(가격대별 대기 수량) */
export interface PriceLevel {
	price: MoneyAmount;
	shares: ShareCount;
}

/** 현재 호가판 */
export interface PriceBoard {
	code: StockCode;
	/** 매수(내림차순) */
	bids: PriceLevel[];
	/** 매도(오름차순) */
	asks: PriceLevel[];
	/** timestamp(ms) */
	updatedAt: number;
}
