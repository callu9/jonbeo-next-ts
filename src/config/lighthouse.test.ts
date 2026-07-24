import fs from "node:fs";

test("Lighthouse script measures a production server", () => {
  const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
  const script = fs.readFileSync("lighthouse-run.sh", "utf8");

  expect(packageJson.scripts.lighthouse).toBe("bash ./lighthouse-run.sh");
  expect(script).toContain("npm run build");
  expect(script).toContain("npm run start");
  expect(script).not.toContain("npm run dev");
});
