function isValidUrl(val: string | null | undefined): boolean {
  if (!val) return false;
  const trimmed = val.trim();
  if (!/^https?:\/\/[^\s]+$/i.test(trimmed)) return false;
  try {
    const u = new URL(trimmed);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    try {
      const fromStorage = localStorage.getItem('TRAVELAI_FASTAPI_URL')?.trim();
      if (fromStorage) {
        if (isValidUrl(fromStorage)) {
          return fromStorage.replace(/\/+$/, '');
        }
        localStorage.removeItem('TRAVELAI_FASTAPI_URL');
      }
    } catch {
      // localStorage may fail in private mode
    }
  }

  const fromEnv = (import.meta.env?.VITE_FASTAPI_URL || import.meta.env?.VITE_API_URL)?.trim();
  if (isValidUrl(fromEnv)) {
    return fromEnv.replace(/\/+$/, '');
  }

  return 'http://127.0.0.1:8001';
}
