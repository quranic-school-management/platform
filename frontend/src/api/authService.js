import { api, setToken, getToken } from './client.js';

/** Map backend user shape to frontend shape (add `name` alias). */
function mapUser(u) {
  if (!u) return u;
  return { ...u, name: u.full_name || u.name, active: u.is_active ?? u.active };
}

export async function login(username, password) {
  const result = await api.post('/auth/login', { username, password });
  // Backend returns { token, user } (after envelope unwrap)
  setToken(result.token);
  return mapUser(result.user);
}
export async function restore() {
  if (!getToken()) return null;
  try { return mapUser(await api.get('/auth/me')); } catch { setToken(null); return null; }
}
export async function logout() {
  // Backend has no /auth/logout endpoint — just clear the token
  setToken(null);
}

export async function changePassword(currentPassword, newPassword) {
  const result = await api.post('/auth/change-password', {
    current_password: currentPassword,
    new_password: newPassword,
  });
  // Backend returns a fresh JWT with updated must_change_password claim
  if (result.token) setToken(result.token);
}
