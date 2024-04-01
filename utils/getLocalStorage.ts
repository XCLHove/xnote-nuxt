export default function getLocalStorage(key: string, autoRemove = false): any {
  const value: any = localStorage.getItem(key);
  if (autoRemove) localStorage.removeItem(key);
  return value;
}
