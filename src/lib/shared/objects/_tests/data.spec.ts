import { describe, expect, it, vi } from "vitest";
import {
  getArrayIndex,
  getArrayIndexOrName,
  getRelativeName,
  ProxyData,
  splitName,
} from "../data";

describe("data", () => {
  describe("name", () => {
    it("single name", () => {
      expect(splitName("hoge"))
        .toStrictEqual(["hoge"]);
    });
    it("nested name", () => {
      expect(splitName("hoge.fuga"))
        .toStrictEqual(["hoge", "fuga"]);
    });
    it("double nested name", () => {
      expect(splitName("hoge.fuga.piyo"))
        .toStrictEqual(["hoge", "fuga", "piyo"]);
    });
    it("array name", () => {
      expect(splitName("hoge[0]"))
        .toStrictEqual(["hoge", "[0]"]);
    });
    it("nested array name", () => {
      expect(splitName("hoge.fuga[1]"))
        .toStrictEqual(["hoge", "fuga", "[1]"]);
    });
    it("array name use dot", () => {
      expect(splitName("hoge.[2]"))
        .toStrictEqual(["hoge", "[2]"]);
    });
    it("no array name", () => {
      expect(splitName("hoge[3"))
        .toStrictEqual(["hoge[3"]);
    });
  });

  describe("getArrayIndex", () => {
    it("returns matches for array tokens", () => {
      const match = getArrayIndex("[42]");
      expect(match).not.toBeNull();
      expect(match && match[1]).toBe("42");
    });

    it("returns null when not an array token", () => {
      expect(getArrayIndex("foo")).toBeNull();
    });
  });

  describe("getArrayIndexOrName", () => {
    it("converts array tokens to numbers", () => {
      expect(getArrayIndexOrName("[7]")).toBe(7);
    });

    it("keeps non array tokens as strings", () => {
      expect(getArrayIndexOrName("foo")).toBe("foo");
    });

    it("returns NaN for empty array tokens", () => {
      const value = getArrayIndexOrName("[]");
      expect(typeof value).toBe("number");
      expect(Number.isNaN(value as number)).toBe(true);
    });
  });

  describe("getRelativeName", () => {
    it("navigates up one level", () => {
      expect(getRelativeName("user.profile.email", ".name"))
        .toBe("user.profile.name");
    });

    it("navigates up multiple levels", () => {
      expect(getRelativeName("user.address.city", "..age"))
        .toBe("user.age");
    });

    it("returns original when not relative", () => {
      expect(getRelativeName("user.name", "nickname"))
        .toBe("nickname");
    });
  });

  describe("ProxyData", () => {
    it("reads nested dot and array paths", () => {
      const data = new ProxyData({
        user: { addresses: [{ city: "Tokyo" }] },
      }, () => undefined);
      expect(data.get("user.addresses[0].city")).toBe("Tokyo");
      expect(data.hasProperty("user.addresses[0].city")).toBe(true);
    });

    it("does not mutate original data", () => {
      const original = { user: { name: "Alice" } };
      const data = new ProxyData(original, () => undefined);
      data.set("user.name", "Bob");
      expect(original.user.name).toBe("Alice");
    });

    it("triggers callback only when value changes", () => {
      const callback = vi.fn();
      const data = new ProxyData({}, callback);
      expect(data.set("user.name", "Alice")).toBe(true);
      expect(callback).toHaveBeenCalledWith({ items: [{ name: "user.name", value: "Alice" }] });
      callback.mockClear();
      expect(data.set("user.name", "Alice")).toBe(false);
      expect(callback).not.toHaveBeenCalled();
    });

    it("supports relative lookups", () => {
      const data = new ProxyData({
        user: {
          address: { city: "Tokyo" },
          zip: "100-0001",
        },
      }, () => undefined);
      expect(data.get("user.address.city", "..zip")).toBe("100-0001");
    });

    it("bulkSet reports only changed fields", () => {
      const callback = vi.fn();
      const data = new ProxyData({ profile: { name: "Alice" } }, callback);
      data.bulkSet([
        { name: "profile.name", value: "Alice" },
        { name: "profile.age", value: 30 },
      ]);
      expect(callback).toHaveBeenCalledWith({
        items: [{ name: "profile.age", value: 30 }],
      });
    });

    it("bulk queue defers effects until executed", () => {
      const callback = vi.fn();
      const data = new ProxyData({}, callback);
      data.bulkPush("items[0]", "foo").bulkPush("items[1]", "bar");
      expect(data.hasBulkQueue()).toBe(true);
      expect(callback).not.toHaveBeenCalled();
      const changed = data.bulkExec();
      expect(changed).toBe(true);
      expect(callback).toHaveBeenCalledWith({
        items: [
          { name: "items[0]", value: "foo" },
          { name: "items[1]", value: "bar" },
        ],
      });
      expect(data.hasBulkQueue()).toBe(false);
      expect(data.get("items[0]")).toBe("foo");
      expect(data.get("items[1]")).toBe("bar");
    });
  });
});
