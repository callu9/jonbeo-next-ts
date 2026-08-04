import { act, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { useUnitStore } from "@/store/unitStore";
import AmountTransition from "./AmountTransition";

jest.mock("motion/react", () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock("motion/react-m", () => ({
  span: ({ children, initial, exit, transition, ...props }: React.ComponentProps<"span"> & {
    initial?: { y: number } | false;
    exit?: { y: number };
    transition?: { duration: number };
  }) => (
    <span
      {...props}
      data-duration={transition?.duration ?? "none"}
      data-exit-y={exit?.y ?? "none"}
      data-initial-y={typeof initial === "object" ? initial.y : "none"}
      data-motion="true"
    >
      {children}
    </span>
  ),
}));

describe("AmountTransition", () => {
  beforeEach(() => useUnitStore.setState({ isWon: false }));

  it("renders the server amount as a plain span", () => {
    const markup = renderToStaticMarkup(
      <AmountTransition id="total" fontStyle="text-4xl">
        $1,234
      </AmountTransition>,
    );

    expect(markup).toContain('<span class="inline-block text-4xl">$1,234</span>');
    expect(markup).not.toContain("data-motion");
  });

  it("keeps a same-unit rerender static after hydration", () => {
    const { rerender } = render(<AmountTransition id="total">$1,234</AmountTransition>);
    rerender(<AmountTransition id="total">$1,235</AmountTransition>);

    expect(screen.getByText("$1,235")).not.toHaveAttribute("data-motion");
  });

  it.each([
    [false, true, 1, 50, -50],
    [true, false, -1, -50, 50],
  ])("animates unit change from %s to %s using multiplier %i", (from, to, multiplier, initialY, exitY) => {
    useUnitStore.setState({ isWon: from });
    render(
      <AmountTransition id="total" multiplier={multiplier}>
        amount
      </AmountTransition>,
    );

    act(() => useUnitStore.setState({ isWon: to }));

    const amount = screen.getByText("amount");
    expect(amount).toHaveAttribute("data-motion", "true");
    expect(amount).toHaveAttribute("data-initial-y", String(initialY));
    expect(amount).toHaveAttribute("data-exit-y", String(exitY));
  });
});
