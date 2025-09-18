import { setupServer } from "msw/node";
import { portfolioHandler } from "./handler/portfolio";
import { stocksHandler } from "./handler/stocks";

export const server = setupServer(...portfolioHandler, ...stocksHandler);
