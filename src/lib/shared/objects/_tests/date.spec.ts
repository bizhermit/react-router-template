import { describe, expect, it } from "vitest";
import {
  DateTime,
  WEEK,
  addDay,
  addMonth,
  addYear,
  formatDate,
  getFirstDateAtMonth,
  getLastDateAtMonth,
  getNextDate,
  getNextMonthDate,
  getNextWeekDate,
  getNextYearDate,
  getPrevDate,
  getPrevMonthDate,
  getPrevWeekDate,
  getPrevYearDate,
  parseDate,
  parseOffsetString,
  parseTimezoneOffset,
} from "../date";

describe("date", () => {
  describe("parseTimezoneOffset", () => {
    it("resolves named timezones", () => {
      expect(parseTimezoneOffset("Asia/Tokyo")).toBe(-540);
      expect(parseTimezoneOffset("UTC")).toBe(0);
    });

    it("parses explicit offsets", () => {
      expect(parseTimezoneOffset("+09:30")).toBe(-570);
      expect(parseTimezoneOffset("-0300")).toBe(180);
    });
  });

  describe("parseOffsetString", () => {
    it("returns Z for zero offset", () => {
      expect(parseOffsetString(0)).toBe("Z");
    });

    it("converts minutes to signed hh:mm", () => {
      expect(parseOffsetString(-540)).toBe("+09:00");
      expect(parseOffsetString(90)).toBe("-01:30");
    });
  });

  describe("parseDate", () => {
    it("parses ISO strings with timezone adjustments", () => {
      const parsed = parseDate("2024-05-10T12:34:56+09:00");
      expect(parsed?.getTime()).toBe(Date.UTC(2024, 4, 10, 3, 34, 56));
    });

    it("handles numeric and Date inputs", () => {
      const timestamp = Date.UTC(2024, 0, 1, 0, 0, 0);
      expect(parseDate(timestamp)?.getTime()).toBe(timestamp);
      const original = new Date(timestamp);
      expect(parseDate(original)).toBe(original);
    });

    it("throws for invalid strings", () => {
      expect(() => parseDate("not-a-date")).toThrow(/Invalid date string/);
    });
  });

  describe("formatDate", () => {
    it("formats with pattern replacements and custom week labels", () => {
      const sample = new Date(Date.UTC(2024, 0, 2, 3, 4, 5, 6));
      const result = formatDate(sample, "yyyy/MM/dd hh:mm:ss.SSS w", WEEK.en_s);
      const pad = (n: number) => `0${n}`.slice(-2);
      const expected = [
        `${sample.getFullYear()}/${pad(sample.getMonth() + 1)}/${pad(sample.getDate())}`,
        `${pad(sample.getHours())}:${pad(sample.getMinutes())}:${pad(sample.getSeconds())}.${`00${sample.getMilliseconds()}`.slice(-3)}`,
        WEEK.en_s[sample.getDay()],
      ].join(" ");
      expect(result).toBe(expected);
    });

    it("returns undefined for nullish input", () => {
      expect(formatDate(null)).toBeUndefined();
    });
  });

  describe("Datetime", () => {
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

  describe("helpers", () => {
    it("addMonth adjusts for shorter months", () => {
      const date = new Date(2023, 0, 31);
      addMonth(date, 1);
      expect(date.getFullYear()).toBe(2023);
      expect(date.getMonth()).toBe(1);
      expect(date.getDate()).toBe(28);
    });

    it("addDay rolls over to next month", () => {
      const date = new Date(2024, 0, 31);
      addDay(date, 1);
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(1);
      expect(date.getDate()).toBe(1);
    });

    it("addYear keeps end-of-month semantics", () => {
      const date = new Date(2024, 1, 29);
      addYear(date, 1);
      expect(date.getFullYear()).toBe(2025);
      expect(date.getMonth()).toBe(1);
      expect(date.getDate()).toBe(28);
    });

    it("getFirstDateAtMonth returns first day", () => {
      const first = getFirstDateAtMonth(new Date(2024, 5, 15));
      expect(first.getFullYear()).toBe(2024);
      expect(first.getMonth()).toBe(5);
      expect(first.getDate()).toBe(1);
    });

    it("getLastDateAtMonth returns last day", () => {
      const last = getLastDateAtMonth(new Date(2024, 1, 10));
      expect(last.getFullYear()).toBe(2024);
      expect(last.getMonth()).toBe(1);
      expect(last.getDate()).toBe(29);
    });

    it("getPrevDate and getNextDate shift by one day", () => {
      const base = new Date(2024, 0, 1);
      const prev = getPrevDate(base);
      expect(prev.getFullYear()).toBe(2023);
      expect(prev.getMonth()).toBe(11);
      expect(prev.getDate()).toBe(31);
      const next = getNextDate(base);
      expect(next.getFullYear()).toBe(2024);
      expect(next.getMonth()).toBe(0);
      expect(next.getDate()).toBe(2);
    });

    it("getPrevWeekDate and getNextWeekDate shift by seven days", () => {
      const base = new Date(2024, 5, 15);
      const prev = getPrevWeekDate(base);
      expect(prev.getDate()).toBe(8);
      const next = getNextWeekDate(base);
      expect(next.getDate()).toBe(22);
    });

    it("getPrevMonthDate and getNextMonthDate respect month lengths", () => {
      const prev = getPrevMonthDate(new Date(2024, 2, 31));
      expect(prev.getFullYear()).toBe(2024);
      expect(prev.getMonth()).toBe(1);
      expect(prev.getDate()).toBe(29);
      const next = getNextMonthDate(new Date(2024, 0, 31));
      expect(next.getFullYear()).toBe(2024);
      expect(next.getMonth()).toBe(1);
      expect(next.getDate()).toBe(29);
    });

    it("getPrevYearDate and getNextYearDate maintain day when possible", () => {
      const prev = getPrevYearDate(new Date(2024, 1, 29));
      expect(prev.getFullYear()).toBe(2023);
      expect(prev.getMonth()).toBe(1);
      expect(prev.getDate()).toBe(28);
      const next = getNextYearDate(new Date(2024, 1, 29));
      expect(next.getFullYear()).toBe(2025);
      expect(next.getMonth()).toBe(1);
      expect(next.getDate()).toBe(28);
    });
  });
});
