import "@testing-library/jest-dom/vitest";

// Node 26 exposes an incomplete experimental localStorage global that can
// shadow JSDOM's implementation unless a persistence file is configured.
if (Object.getOwnPropertyDescriptor(window, "localStorage")?.value === undefined) {
  const values = new Map<string, string>();
  const localStorage: Storage = {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => [...values.keys()][index] ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, String(value)),
  };

  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: localStorage,
  });
}
