import { describe, expect, it } from "vitest";
import { parseNumber } from "../numeric";

describe("numeric", () => {
  describe("parseNumber", () => {
    it("handles nullish and empty values", () => {
      expect(parseNumber(null)).toStrictEqual([undefined, true]);
      expect(parseNumber(undefined)).toStrictEqual([undefined, true]);
      expect(parseNumber("")).toStrictEqual([undefined, true]);
    });

    it("returns the same number when input is numeric", () => {
      expect(parseNumber(123)).toStrictEqual([123, true]);
    });

    it("rejects NaN numbers", () => {
      expect(parseNumber(Number.NaN)).toStrictEqual([undefined, false]);
    });

    it("parses trimmed decimal strings", () => {
      expect(parseNumber("  456.78  ")).toStrictEqual([456.78, true]);
    });

    it("parses comma separated numbers", () => {
      expect(parseNumber("1,234,567")).toStrictEqual([1234567, true]);
    });

    it("parses fullwidth digits and symbols", () => {
      expect(parseNumber("＋１２３，４５６．７８９")).toStrictEqual([123456.789, true]);
      expect(parseNumber("－９９９")).toStrictEqual([-999, true]);
      expect(parseNumber("ー５")).toStrictEqual([-5, true]);
    });

    it("rejects non numeric strings", () => {
      expect(parseNumber("abc")).toStrictEqual([undefined, false]);
    });

    it("rejects whitespace only strings", () => {
      expect(parseNumber("   ")).toStrictEqual([undefined, false]);
    });
  });
});
