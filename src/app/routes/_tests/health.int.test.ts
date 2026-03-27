import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loader } from "../health";

describe("health loader (integration)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01T00:00:00.000Z"));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("現在時刻を ISO 8601 形式で返す", async () => {
    process.env.NODE_ENV = "test";
    const result = await loader();
    const data = (result as any).data as { now: string; };
    expect(data.now).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    expect(data.now).toBeDefined();
  });

  it("ログに環境情報を出力（秘密情報は含まない）", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => { });
    process.env.NODE_ENV = "test";
    await loader();
    expect(logSpy).toHaveBeenCalled();
    const logCall = logSpy.mock.calls[0][0] as string;
    expect(logCall).toContain("healthcheck");
    expect(logCall).toContain(process.version);
    expect(logCall).toContain("test");
    expect(logCall).not.toContain("SECRET");
    expect(logCall).not.toContain("KEY");
  });

  it("loader() の戻り値は DataWithResponseInit 構造である", async () => {
    const result = await loader();
    const obj = result as any;
    expect(obj.type).toBe("DataWithResponseInit");
    expect(obj.data).toBeDefined();
    expect(obj.data.now).toBeDefined();
    expect(typeof obj.data.now).toBe("string");
  });

  it("NODE_ENV が異なる場合でも動作する", async () => {
    const envs = ["development", "production", "staging"];
    for (const env of envs) {
      process.env.NODE_ENV = env;
      const result = await loader();
      const data = (result as any).data as { now: string; };
      expect(data.now).toBeDefined();
    }
  });

  it("複数回呼び出しても常に now データを返す", async () => {
    for (let i = 0; i < 3; i++) {
      const result = await loader();
      const data = (result as any).data as { now: string; };
      expect(data.now).toBeDefined();
    }
  });

  it("軽量処理である（非同期待機なし）", async () => {
    const startTime = performance.now();
    await loader();
    const endTime = performance.now();
    expect(endTime - startTime).toBeLessThan(100);
  });
});
