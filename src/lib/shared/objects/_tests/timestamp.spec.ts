import { describe, expect, it } from "vitest";

import { $Date, $DateTime, $Month } from "../timestamp";

describe("timestamp", () => {
  describe("$Date", () => {
    it("日付単位で前後を比較する", () => {
      const base = new $Date("2024-04-10");

      expect(base.isBefore(new $DateTime("2024-04-11T00:00:00"))).toBe(true);
      expect(base.isBefore(new $DateTime("2024-04-10T23:59:59"))).toBe(false);
      expect(base.isAfter(new $DateTime("2024-04-09T23:59:59"))).toBe(true);
      expect(base.isAfter(new $DateTime("2024-04-10T00:00:00"))).toBe(false);
    });
  });

  describe("$Month", () => {
    it("月単位で前後を比較する", () => {
      const base = new $Month("2024-04-01");

      expect(base.isBefore(new $DateTime("2024-05-01T00:00:00"))).toBe(true);
      expect(base.isBefore(new $DateTime("2024-04-30T23:59:59"))).toBe(false);
      expect(base.isAfter(new $DateTime("2024-03-31T23:59:59"))).toBe(true);
      expect(base.isAfter(new $DateTime("2024-04-01T00:00:00"))).toBe(false);
    });
  });

  describe("$DateTime", () => {
    it("日時単位で前後を比較する", () => {
      const base = new $DateTime("2024-04-10T12:30:00");

      expect(base.isBefore(new $DateTime("2024-04-10T12:30:01"))).toBe(true);
      expect(base.isBefore(new $DateTime("2024-04-10T12:30:00"))).toBe(false);
      expect(base.isAfter(new $DateTime("2024-04-10T12:29:59"))).toBe(true);
      expect(base.isAfter(new $DateTime("2024-04-10T12:30:00"))).toBe(false);
    });

    it("日付のみで前後を比較する", () => {
      const base = new $DateTime("2024-04-10T12:30:00");

      expect(base.isBeforeDate(new $DateTime("2024-04-11T00:00:00"))).toBe(true);
      expect(base.isBeforeDate(new $DateTime("2024-04-10T23:59:59"))).toBe(false);
      expect(base.isAfterDate(new $DateTime("2024-04-09T23:59:59"))).toBe(true);
      expect(base.isAfterDate(new $DateTime("2024-04-10T00:00:00"))).toBe(false);
    });

    it("時刻のみで前後を比較する", () => {
      const base = new $DateTime("2024-04-10T12:30:00");

      expect(base.isBeforeTime(new $DateTime("2024-04-01T13:00:00"))).toBe(true);
      expect(base.isBeforeTime(new $DateTime("2024-04-01T12:30:00"))).toBe(false);
      expect(base.isAfterTime(new $DateTime("2024-04-20T12:29:59"))).toBe(true);
      expect(base.isAfterTime(new $DateTime("2024-04-20T12:30:00"))).toBe(false);
    });
  });
});
