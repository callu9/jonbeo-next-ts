import { setupWorker } from "msw/browser";
import { portfolioHandler } from "./handler/portfolio";
import { stocksHandler } from "./handler/stocks";

// 브라우저에서 MSW 실행
export const worker = setupWorker(...portfolioHandler, ...stocksHandler);
