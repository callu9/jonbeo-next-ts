import { delay, http, HttpResponse } from "msw";
import portfolioList from "../database/portfolio.json";

const API_BASE = "http://localhost:4000";

export const portfolioHandler = [
	// 목록 조회: GET /portfolio
	http.get(`${API_BASE}/portfolio`, async () => {
		// 네트워크 지연 모사 (선택)
		await delay(150);
		return HttpResponse.json(portfolioList);
	}),
];
