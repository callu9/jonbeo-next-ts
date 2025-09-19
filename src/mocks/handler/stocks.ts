import { delay, http, HttpResponse } from "msw";
import stocks from "../database/stocks.json";
import { StockDetail } from "@/types/stock";

const API_BASE = "http://localhost:4001";

// 공통 에러 응답 헬퍼
const notFound = (message = "not found") =>
  HttpResponse.json({ error: { code: "NOT_FOUND", message } }, { status: 404 });

export const stocksHandler = [
  http.get(`${API_BASE}/stocks/:code`, async ({ params }) => {
    await delay(120);
    const code = String(params.code).toUpperCase();
    const detail = stocks.list.find((el) => el.code === code);
    if (!detail) return notFound(`stock code ${code} not found`);
    return HttpResponse.json(detail);
  }),
  http.post(`${API_BASE}/stocks/:code/target/:price`, async ({ params }) => {
    await delay(120);
    const code = String(params.code).toUpperCase();
    const price = Number(params.price).toFixed(2);
    let detail = stocks.list.find((el) => el.code === code) as StockDetail | undefined;
    if (!detail) return notFound(`stock code ${code} not found`);
    detail.targetAveragePrice = Number(price);
    return HttpResponse.json(detail);
  }),
];
