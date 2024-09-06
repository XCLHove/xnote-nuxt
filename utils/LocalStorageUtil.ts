export enum LocalStorageKey {
  TOKEN = 'token',
}

export default {
  get: (key: LocalStorageKey) => localStorage.getItem(key),
  set: (key: LocalStorageKey, value: string) =>
    localStorage.setItem(key, value),
  remove: (key: LocalStorageKey) => localStorage.removeItem(key),
  clear: () => localStorage.clear(),
}
