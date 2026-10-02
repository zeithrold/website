import assert from "node:assert/strict";
import { test } from "node:test";
import { createPreferencesStore } from "../lib/preferences-store.ts";

test("preferences stay deterministic until subscription and restore only once", () => {
  let loads = 0;
  const store = createPreferencesStore(() => {
    loads++;
    return { locale: "zh-CN", theme: "dark" };
  });
  const serverSnapshot = store.getSnapshot();
  assert.deepEqual(serverSnapshot, { preferences: { locale: "en", theme: "light" }, ready: false });
  assert.equal(store.getSnapshot(), serverSnapshot);
  assert.equal(loads, 0);
  const unsubscribe = store.subscribe(() => {});
  assert.deepEqual(store.getSnapshot(), { preferences: { locale: "zh-CN", theme: "dark" }, ready: true });
  unsubscribe();
  const unsubscribeAgain = store.subscribe(() => {});
  assert.equal(loads, 1);
  unsubscribeAgain();
});

test("preference updates merge fields, replace snapshots and notify only active subscribers", () => {
  const store = createPreferencesStore(() => ({ locale: "zh-CN", theme: "dark" }));
  const observed: unknown[] = [];
  const unsubscribe = store.subscribe(() => { observed.push(store.getSnapshot()); });
  const restored = store.getSnapshot();
  store.update({ locale: "en" });
  assert.deepEqual(store.getSnapshot(), { preferences: { locale: "en", theme: "dark" }, ready: true });
  assert.notEqual(store.getSnapshot(), restored);
  assert.deepEqual(restored.preferences, { locale: "zh-CN", theme: "dark" });
  assert.equal(observed.length, 2);
  unsubscribe();
  store.update({ theme: "light" });
  assert.equal(observed.length, 2);
  assert.deepEqual(store.getSnapshot(), { preferences: { locale: "en", theme: "light" }, ready: true });
});

test("separate providers never share preference snapshots", () => {
  const first = createPreferencesStore(() => ({ locale: "en", theme: "light" }));
  const second = createPreferencesStore(() => ({ locale: "zh-CN", theme: "dark" }));
  const unsubscribe = first.subscribe(() => {});
  first.update({ theme: "dark" });
  assert.deepEqual(second.getSnapshot(), { preferences: { locale: "en", theme: "light" }, ready: false });
  unsubscribe();
});
