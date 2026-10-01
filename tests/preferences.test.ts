import assert from "node:assert/strict";
import { test } from "node:test";
import { detectLocale, readPreferences, type Preferences } from "../lib/preferences.ts";

const fallback: Preferences = { locale: "zh-CN", theme: "dark" };
test("Chinese browser variants use Simplified Chinese; other locales use English", () => {
  for (const locale of ["zh", "zh-CN", "zh-TW", "ZH-hans"]) assert.equal(detectLocale([locale]), "zh-CN");
  assert.equal(detectLocale(["fr-FR", "en-US"]), "en");
  assert.equal(detectLocale([]), "en");
});
test("invalid stored values fall back independently", () => {
  for (const value of [null, [], "en", 42]) assert.deepEqual(readPreferences(value, fallback), fallback);
  assert.deepEqual(readPreferences({ locale: "en", theme: "sepia" }, fallback), { locale: "en", theme: "dark" });
  assert.deepEqual(readPreferences({ locale: "de", theme: "light", unrelated: true }, fallback), { locale: "zh-CN", theme: "light" });
  assert.deepEqual(readPreferences({ locale: "en", theme: "light" }, fallback), { locale: "en", theme: "light" });
});
