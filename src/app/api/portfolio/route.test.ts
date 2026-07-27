/** @jest-environment node */

import { GET } from "@/app/api/portfolio/route";

test("returns the portfolio response", async () => {
  const response = await GET();

  await expect(response.json()).resolves.toMatchObject({
    account: { cashBalance: 22829.13 },
    stocks: expect.any(Array),
  });
});
