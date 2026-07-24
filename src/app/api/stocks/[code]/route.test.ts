/** @jest-environment node */

import { GET } from "@/app/api/stocks/[code]/route";

test("returns a requested stock", async () => {
  const response = await GET(new Request("http://localhost/api/stocks/AAPL"), {
    params: Promise.resolve({ code: "AAPL" }),
  });

  expect(response.status).toBe(200);
  await expect(response.json()).resolves.toMatchObject({ code: "AAPL" });
});

test("returns 404 for an unknown stock", async () => {
  const response = await GET(new Request("http://localhost/api/stocks/UNKNOWN"), {
    params: Promise.resolve({ code: "UNKNOWN" }),
  });

  expect(response.status).toBe(404);
  await expect(response.json()).resolves.toEqual({ error: "Stock not found" });
});
