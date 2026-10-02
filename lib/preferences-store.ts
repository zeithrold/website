import type { Preferences } from "./preferences";

export type PreferencesSnapshot = { preferences: Preferences; ready: boolean };
export type PreferencesStore = {
  getSnapshot: () => PreferencesSnapshot;
  subscribe: (listener: () => void) => () => void;
  update: (values: Partial<Preferences>) => void;
};

/** Restore after subscription, keeping the server and first hydration render identical. */
export function createPreferencesStore(load: () => Preferences): PreferencesStore {
  let snapshot: PreferencesSnapshot = { preferences: { locale: "en", theme: "light" }, ready: false };
  const listeners = new Set<() => void>();
  const publish = (next: PreferencesSnapshot): void => {
    snapshot = next;
    for (const listener of listeners) {
      listener();
    }
  };
  return {
    getSnapshot: () => snapshot,
    subscribe: (listener) => {
      listeners.add(listener);
      if (!snapshot.ready) {
        publish({ preferences: load(), ready: true });
      }
      return () => { listeners.delete(listener); };
    },
    update: (values) => {
      publish({ ...snapshot, preferences: { ...snapshot.preferences, ...values } });
    },
  };
}
