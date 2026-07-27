jest.mock("motion/react", () => ({
  domAnimation: { name: "domAnimation" },
  domMax: { name: "domMax" },
}));

it("exports the animation-only Motion feature bundle", async () => {
  const { default: features } = await import("./feature");

  expect(features).toEqual({ name: "domAnimation" });
});
