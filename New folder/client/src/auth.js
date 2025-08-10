export function setToken(token) { localStorage.setItem("token", token); }
export function getToken() { return localStorage.getItem("token"); }
export function logout() { localStorage.removeItem("token"); }
export function getRole() {
  const t = getToken(); if (!t) return null;
  try {
    const payload = JSON.parse(atob(t.split(".")[1]));
    return payload.role || null;
  } catch { return null; }
}
export function isAuthed() { return !!getToken(); }
