import { describe, expect, it } from "vitest";

import { $Clock, $Date, $DateTime, $Month, $Time } from "../timestamp";

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

    it("$Clockで時刻を置換できる", () => {
      const base = new $DateTime("2024-04-10T12:30:00");
      base.setTime(new $Clock("23:45:10.123"));

      expect(base.toString("hh:mm:ss.SSS")).toBe("23:45:10.123");
    });

    it("$Clockで時刻のみ比較できる", () => {
      const base = new $DateTime("2024-04-10T12:30:00");

      expect(base.isBeforeTime(new $Clock("13:00:00"))).toBe(true);
      expect(base.isAfterTime(new $Clock("12:29:59"))).toBe(true);
      expect(base.isEqualTime(new $Clock("12:30:00"))).toBe(true);
    });
  });

  describe("$Time", () => {
    it("経過量として24時間超過を保持する", () => {
      const base = new $Time(25 * 60 * 60 * 1000 + 30 * 60 * 1000);

      expect(base.getHour()).toBe(25);
      expect(base.getMinute()).toBe(30);
      expect(base.toString()).toBe("25:30:00.000");
    });

    it("負の値でも加算を正しく扱う", () => {
      const base = new $Time(-1);
      base.addMillisecond(2);

      expect(base.getTime()).toBe(1);
      expect(base.isMinus()).toBe(false);
    });

    it("経過量として$Time同士を比較できる", () => {
      const a = new $Time(2000);
      const b = new $Time(3000);

      expect(a.isBeforeDuration(b)).toBe(true);
      expect(b.isAfterDuration(a)).toBe(true);
      expect(a.isEqualDuration(new $Time(2000))).toBe(true);
    });
  });

  describe("$Clock", () => {
    it("24時間を超える値を時計時刻として正規化する", () => {
      const clock = new $Clock(25 * 60 * 60 * 1000 + 90 * 1000);

      expect(clock.getHour()).toBe(1);
      expect(clock.getMinute()).toBe(1);
      expect(clock.getSecond()).toBe(30);
      expect(clock.toString()).toBe("01:01:30.000");
    });

    it("負の値を渡しても0以上24時間未満に正規化する", () => {
      const clock = new $Clock(-1);

      expect(clock.isMinus()).toBe(false);
      expect(clock.toString()).toBe("23:59:59.999");
    });

    it("加算時も常に時計時刻へ正規化する", () => {
      const clock = new $Clock("23:30:00");
      clock.addHour(2);

      expect(clock.toString()).toBe("01:30:00.000");
    });

    it("Timestampとも時刻比較できる", () => {
      const clock = new $Clock("12:30:00");

      expect(clock.isBefore(new $DateTime("2024-04-10T13:00:00"))).toBe(true);
      expect(clock.isAfter(new $DateTime("2024-04-10T12:00:00"))).toBe(true);
      expect(clock.isEqual(new $DateTime("2024-04-10T12:30:00"))).toBe(true);
    });

    it("$Clock同士で時刻比較できる", () => {
      const a = new $Clock("10:00:00");
      const b = new $Clock("11:00:00");

      expect(a.isBefore(b)).toBe(true);
      expect(b.isAfter(a)).toBe(true);
      expect(a.isEqual(new $Clock("10:00:00"))).toBe(true);
    });
  });
});
