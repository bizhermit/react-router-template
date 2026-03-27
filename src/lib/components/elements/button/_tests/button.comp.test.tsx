import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Button } from "../button";

afterEach(() => {
  cleanup();
});

describe("Button (component)", () => {
  it("有効状態でクリックすると onClick を呼び出す", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(
      <Button onClick={onClick}>
        実行
      </Button>,
    );

    await user.click(screen.getByRole("button", { name: "実行" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("disabled=true のときクリックしても onClick を呼び出さない", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(
      <Button
        disabled
        onClick={onClick}
      >
        実行
      </Button>,
    );

    await user.click(screen.getByRole("button", { name: "実行" }));

    expect(onClick).not.toHaveBeenCalled();
  });

  it("非同期処理中は連続クリックしても onClick を 1 回だけ呼び出す", async () => {
    const onClick = vi.fn(() => new Promise<void>(() => { }));
    const user = userEvent.setup();

    render(
      <Button onClick={onClick}>
        実行
      </Button>,
    );

    const button = screen.getByRole("button", { name: "実行" });
    await user.click(button);
    await user.click(button);

    expect(onClick).toHaveBeenCalledTimes(1);
    expect((button as HTMLButtonElement).disabled).toBe(true);
  });
});
