import { describe, expect, it } from "vitest";
import { Button$ } from "..";

describe("Button$ (unit)", () => {
  it("配色と任意クラスを結合した className を生成する", () => {
    const element = Button$({
      color: "primary",
      className: "extra",
      children: "保存",
    });

    expect(element.props.className).toContain("_btn");
    expect(element.props.className).toContain("var-color-primary");
    expect(element.props.className).toContain("extra");
  });

  it("appearance 未指定時は outline を設定する", () => {
    const element = Button$({
      children: "保存",
    });

    expect(element.props["data-appearance"]).toBe("outline");
  });

  it("processing=true のとき disabled を true にする", () => {
    const element = Button$({
      processing: true,
      children: "保存",
    });

    expect(element.props.disabled).toBe(true);
    expect(element.props["data-processing"]).toBe(true);
  });
});
