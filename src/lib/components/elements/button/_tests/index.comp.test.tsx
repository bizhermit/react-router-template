import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Button$ } from "..";

afterEach(() => {
  cleanup();
});

describe("Button$ (component)", () => {
  it("有効状態でクリックすると onClick を呼び出す", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(
      <Button$ onClick={onClick}>
        保存
      </Button$>,
    );

    await user.click(screen.getByRole("button", { name: "保存" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("disabled=true のときクリックしても onClick を呼び出さない", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(
      <Button$
        disabled
        onClick={onClick}
      >
        保存
      </Button$>,
    );

    await user.click(screen.getByRole("button", { name: "保存" }));

    expect(onClick).not.toHaveBeenCalled();
    const button = screen.getByRole("button", { name: "保存" }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it("processing=true のとき disabled 属性と data-processing が反映される", () => {
    render(
      <Button$ processing>
        保存
      </Button$>,
    );

    const button = screen.getByRole("button", { name: "保存" });
    expect((button as HTMLButtonElement).disabled).toBe(true);
    expect(button.getAttribute("data-processing")).toBe("true");
  });
});
