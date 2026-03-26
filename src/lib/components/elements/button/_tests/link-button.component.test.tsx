import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router";
import { afterEach, describe, expect, it } from "vitest";
import { LinkButton } from "../link-button";

afterEach(() => {
  cleanup();
});

function LocationText() {
  const location = useLocation();
  return <span>{location.pathname}</span>;
}

describe("LinkButton (component)", () => {
  it("disabled=false のときクリックすると遷移する", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/"]}>
        <LinkButton to="/next">
          移動
        </LinkButton>
        <LocationText />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: "移動" }));

    expect(screen.getByText("/next")).toBeTruthy();
  });

  it("disabled=true のときクリックしても遷移しない", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/"]}>
        <LinkButton
          to="/next"
          disabled
        >
          移動
        </LinkButton>
        <LocationText />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: "移動" }));

    expect(screen.getByText("/")).toBeTruthy();
  });

  it("role と aria-disabled を正しく出力する", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LinkButton
          to="/next"
          disabled
        >
          移動
        </LinkButton>
      </MemoryRouter>,
    );

    const button = screen.getByRole("button", { name: "移動" });
    expect(button.getAttribute("role")).toBe("button");
    expect(button.getAttribute("aria-disabled")).toBe("true");
  });
});
