import Providers from "@/providers/providers";
import { render, screen } from "@testing-library/react";

jest.mock("motion/react", () => ({
  LazyMotion: ({ children }: { children: React.ReactNode }) => children,
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

test("renders page content without waiting for a mock worker", () => {
  render(
    <Providers>
      <main>portfolio content</main>
    </Providers>
  );

  expect(screen.getByText("portfolio content")).toBeInTheDocument();
});
