import { describe, expect, it } from "vitest";
import { DateTime } from "../date";

describe("datetime", () => {
  describe("new DateTime", () => {
    it("yyyy", () => {
      const dt = new DateTime("2024");
      expect(dt.toDateString()).toBe("2024-01-01");
      expect(dt.toTimeString()).toBe("00:00:00");
    });

    it("yyyyMM", () => {
      const dt = new DateTime("202402");
      expect(dt.toDateString()).toBe("2024-02-01");
      expect(dt.toTimeString()).toBe("00:00:00");
    });

    it("yyyy-MM", () => {
      const dt = new DateTime("2024-03");
      expect(dt.toDateString()).toBe("2024-03-01");
      expect(dt.toTimeString()).toBe("00:00:00");
    });

    it("yyyy-M", () => {
      const dt = new DateTime("2024-3");
      expect(dt.toDateString()).toBe("2024-03-01");
      expect(dt.toTimeString()).toBe("00:00:00");
    });

    it("yyyy/MM", () => {
      const dt = new DateTime("2024/03");
      expect(dt.toDateString()).toBe("2024-03-01");
      expect(dt.toTimeString()).toBe("00:00:00");
    });

    it("yyyy/M", () => {
      const dt = new DateTime("2024/3");
      expect(dt.toDateString()).toBe("2024-03-01");
      expect(dt.toTimeString()).toBe("00:00:00");
    });

    it("yyyyMMdd", () => {
      const dt = new DateTime("20240307");
      expect(dt.toDateString()).toBe("2024-03-07");
      expect(dt.toTimeString()).toBe("00:00:00");
    });

    it("yyyy-MM-dd", () => {
      const dt = new DateTime("2024-03-07");
      expect(dt.toDateString()).toBe("2024-03-07");
      expect(dt.toTimeString()).toBe("00:00:00");
    });

    it("yyyy/MM/dd", () => {
      const dt = new DateTime("2024/03/07");
      expect(dt.toDateString()).toBe("2024-03-07");
      expect(dt.toTimeString()).toBe("00:00:00");
    });

    it("yyyy-MM-ddThh", () => {
      const dt = new DateTime("2024-04-23T04");
      expect(dt.toDateString()).toBe("2024-04-23");
      expect(dt.toTimeString()).toBe("04:00:00");
    });

    it("yyyy-MM-ddThh:mm", () => {
      const dt = new DateTime("2024-05-21T07:31");
      expect(dt.toDateString()).toBe("2024-05-21");
      expect(dt.toTimeString()).toBe("07:31:00");
    });

    it("yyyy-MM-ddThh:mm:ss", () => {
      const dt = new DateTime("2024-05-21T09:59:01");
      expect(dt.toDateString()).toBe("2024-05-21");
      expect(dt.toTimeString()).toBe("09:59:01");
    });

    it("yyyy-MM-ddT:hh:mm:ss.SSS", () => {
      const dt = new DateTime("2024-06-19T12:34:56.789");
      expect(dt.toString("yyyy-MM-dd hh:mm:ss.SSS")).toBe("2024-06-19 12:34:56.789");
    });

    it("yyyy-MM-ddThh:mm:ss.SSSZ", () => {
      const dt = new DateTime("2024-01-01T12:34:56.789Z", "UTC");
      expect(dt.toString()).toBe("2024-01-01T12:34:56.789Z");
      expect(dt.getTimezoneOffset()).toBe(0);
    });

    it("yyyy-MM-ddThh:mm:ss.SSS+09:00", () => {
      const dt = new DateTime("2024-01-01T12:34:56.789+09:00");
      expect(dt.toString()).toBe("2024-01-01T12:34:56.789+09:00");
      expect(dt.getTimezoneOffset()).toBe(-540);
      expect(dt.toISOString()).toBe("2024-01-01T03:34:56.789Z");
    });
  });

  describe("timezone", () => {
    it("Asia/Tokyo", () => {
      const dt = new DateTime("2024-01-01T12:00:00+09:00");
      expect(dt.toString()).toBe("2024-01-01T12:00:00.000+09:00");
    });

    it("set Asia/Tokyo", () => {
      const dt = new DateTime("2024-01-01T12:00:00Z");
      dt.setTimezone("Asia/Tokyo");
      expect(dt.toString()).toBe("2024-01-01T21:00:00.000+09:00");
    });

    it("set LA", () => {
      const dt = new DateTime("2024-01-01T12:00:00Z");
      dt.setTimezone("America/Los_Angeles");
      expect(dt.toString()).toBe("2024-01-01T04:00:00.000-08:00");
    });
  });

  describe("set", () => {
    it("set Date", () => {
      const dt = new DateTime("2024-04-04T12:00:00.000-08:00", "-08:00");
      expect(dt.toString()).toBe("2024-04-04T12:00:00.000-08:00");
      dt.set(new Date("2024-07-10T12:00:00.000Z"));
      expect(dt.toString()).toBe("2024-07-10T04:00:00.000-08:00");
    });
  });

  describe("set date / time", () => {
    it("date / time fullset", () => {
      const dt = new DateTime().setDateTime({
        date: "2024-09-12",
        time: 540,
        timeUnit: "m",
        timezone: "Asia/Tokyo",
      });
      expect(dt.toString()).toBe("2024-09-12T09:00:00.000+09:00");
    });

    it("date", () => {
      const dt = new DateTime().setDateTime({
        date: "2024-09-21",
        timezone: "Z",
      });
      expect(dt.toString()).toBe("2024-09-21T00:00:00.000Z");
      dt.setTimezone("Asia/Tokyo");
      expect(dt.toString()).toBe("2024-09-21T09:00:00.000+09:00");
    });

    it("date / time (no timeUnit)", () => {
      const dt = new DateTime().setDateTime({
        date: "2024-09-21",
        time: 720,
        timezone: "Z",
      });
      expect(dt.toString()).toBe("2024-09-21T12:00:00.000Z");
      dt.setTimezone("America/Los_Angeles");
      expect(dt.toString()).toBe("2024-09-21T04:00:00.000-08:00");
    });
  });

  describe("calc", () => {
    it("first date at year", () => {
      const dt = new DateTime("2024-05-12");
      dt.setFirstDateAtYear();
      expect(dt.toDateString()).toBe("2024-01-01");
    });

    it("last date at year", () => {
      const dt = new DateTime("2024-05-12");
      dt.setLastDateAtYear();
      expect(dt.toDateString()).toBe("2024-12-31");
    });

    it("fist date at month", () => {
      const dt = new DateTime("2024-08-11");
      dt.setFirstDateAtMonth();
      expect(dt.toDateString()).toBe("2024-08-01");
    });

    it("last date at month", () => {
      const dt = new DateTime("2024-08-11");
      dt.setLastDateAtMonth();
      expect(dt.toDateString()).toBe("2024-08-31");
    });

    it("add year", () => {
      const dt = new DateTime("2024-02-29");
      dt.addYear(1);
      expect(dt.toDateString()).toBe("2025-02-28");
      dt.set("2024-02-29");
      dt.addYear(2);
      expect(dt.toDateString()).toBe("2026-02-28");
      dt.set("2024-02-29");
      dt.addYear(4);
      expect(dt.toDateString()).toBe("2028-02-29");
      dt.set("2024-02-29");
      dt.addYear(-1);
      expect(dt.toDateString()).toBe("2023-02-28");
      dt.set("2024-02-29");
      dt.addYear(-2);
      expect(dt.toDateString()).toBe("2022-02-28");
      dt.set("2024-02-29");
      dt.addYear(-4);
      expect(dt.toDateString()).toBe("2020-02-29");
      dt.set("2024-01-31");
      dt.addYear(3);
      expect(dt.toDateString()).toBe("2027-01-31");
      dt.set("2024-01-31");
      dt.addYear(-6);
      expect(dt.toDateString()).toBe("2018-01-31");
    });

    it("add month", () => {
      const dt = new DateTime("2024-01-31");
      dt.addMonth(1);
      expect(dt.toDateString()).toBe("2024-02-29");
      dt.set("2024-03-31");
      dt.addMonth(-1);
      expect(dt.toDateString()).toBe("2024-02-29");
      dt.set("2023-12-31");
      dt.addMonth(2);
      expect(dt.toDateString()).toBe("2024-02-29");
      dt.set("2024-04-30");
      dt.addMonth(-2);
      expect(dt.toDateString()).toBe("2024-02-29");
      dt.set("2024-04-30");
      dt.addMonth(-3);
      expect(dt.toDateString()).toBe("2024-01-30");
      dt.set("2024-08-31");
      dt.addMonth(-6);
      expect(dt.toDateString()).toBe("2024-02-29");
      dt.set("2024-01-31");
      dt.addMonth(2);
      expect(dt.toDateString()).toBe("2024-03-31");
      dt.set("2024-01-31");
      dt.addMonth(3);
      expect(dt.toDateString()).toBe("2024-04-30");
    });

    it("prev year", () => {
      const dt = new DateTime("2024-02-29");
      dt.setPrevYear();
      expect(dt.toDateString()).toBe("2023-02-28");
      dt.setPrevYear();
      expect(dt.toDateString()).toBe("2022-02-28");
    });

    it("next year", () => {
      const dt = new DateTime("2024-02-29");
      dt.setNextYear();
      expect(dt.toDateString()).toBe("2025-02-28");
      dt.setNextYear();
      expect(dt.toDateString()).toBe("2026-02-28");
    });

    it("prev month", () => {
      const dt = new DateTime("2024-03-31");
      dt.setPrevMonth();
      expect(dt.toDateString()).toBe("2024-02-29");
      dt.setPrevMonth();
      expect(dt.toDateString()).toBe("2024-01-29");
      dt.setPrevMonth();
      expect(dt.toDateString()).toBe("2023-12-29");
    });

    it("next month", () => {
      const dt = new DateTime("2024-01-31");
      dt.setNextMonth();
      expect(dt.toDateString()).toBe("2024-02-29");
      dt.setNextMonth();
      expect(dt.toDateString()).toBe("2024-03-29");
      dt.setMonth(11);
      dt.setNextMonth();
      expect(dt.toDateString()).toBe("2025-01-29");
    });
  });
});
