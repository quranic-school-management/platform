import { ApiError } from './errors.js';

const BASE = import.meta.env.VITE_API_URL || '/api';
const KEY = 'qms_token';
const store = () => (typeof sessionStorage !== 'undefined' ? sessionStorage : null);

let token = store()?.getItem(KEY) || null;
export const getToken = () => token;
export function setToken(t) {
  token = t;
  if (t) store()?.setItem(KEY, t); else store()?.removeItem(KEY);
}

async function request(method, url, body) {
  const res = await fetch(BASE + url, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const raw = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, raw?.error || raw?.message || 'حدث خطأ غير متوقع');
  return raw?.data !== undefined ? raw.data : raw;
}

export const api = {
  get: (u) => request('GET', u),
  post: (u, b) => request('POST', u, b ?? {}),
  put: (u, b) => request('PUT', u, b ?? {}),
  patch: (u, b) => request('PATCH', u, b ?? {}),
  delete: (u) => request('DELETE', u),
};
export { ApiError };
