import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Button$ } from "..";

describe("Button$ (component)", () => {
  it("children と className を含む HTML を出力する", () => {
    const html = renderToStaticMarkup(
      <Button$
        className="extra"
        color="secondary"
      >
        保存
      </Button$>,
    );

    expect(html).toContain(">保存<");
    expect(html).toContain("_btn");
    expect(html).toContain("var-color-secondary");
    expect(html).toContain("extra");
  });

  it("processing=true のとき disabled と data-processing を出力する", () => {
    const html = renderToStaticMarkup(
      <Button$ processing>
        保存
      </Button$>,
    );

    expect(html).toContain("disabled");
    expect(html).toContain("data-processing=\"true\"");
  });

  it("appearance と round の属性が反映される", () => {
    const html = renderToStaticMarkup(
      <Button$
        appearance="fill"
        round
      >
        保存
      </Button$>,
    );

    expect(html).toContain("data-appearance=\"fill\"");
    expect(html).toContain("data-round=\"true\"");
  });
});
