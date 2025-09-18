import { setupServer } from "msw/node";
import { portfolioHandler } from "./handler/portfolio";
import { stocksHandler } from "./handler/stocks";

// MSW 서버를 설정합니다.
export const server = setupServer(...portfolioHandler, ...stocksHandler);
