import { getPortfolioData } from "@/data/portfolio";
import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json(getPortfolioData());
}
