import { setupWorker } from "msw/browser";
import { portfolioHandler } from "./handler/portfolio";
import { stocksHandler } from "./handler/stocks";

export const worker = setupWorker(...portfolioHandler, ...stocksHandler);
