import { describe, expect, it } from "vitest";
import { getLength } from "../string";

describe("string", () => {
  describe("getLength", () => {
    it("returns 0 for nullish or empty input", () => {
      expect(getLength(null)).toBe(0);
      expect(getLength(undefined)).toBe(0);
      expect(getLength("")).toBe(0);
    });

    it("counts basic latin characters", () => {
      expect(getLength("hello")).toBe(5);
    });

    it("counts cjk characters", () => {
      expect(getLength("ありがとう")).toBe(5);
    });

    it("treats single emoji as one grapheme", () => {
      expect(getLength("👍")).toBe(1);
    });

    it("treats emoji with modifiers as one grapheme", () => {
      expect(getLength("👍🏽")).toBe(1);
    });

    it("treats zwj sequences as one grapheme", () => {
      expect(getLength("👨‍👩‍👧‍👦")).toBe(1);
    });

    it("treats combining sequences as one grapheme", () => {
      expect(getLength("e\u0301")).toBe(1);
    });

    it("handles mixed content", () => {
      expect(getLength("a👍🏽b")).toBe(3);
    });
  });
});
