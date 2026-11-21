// Keeps the JWT (and a cached copy of the user profile) in localStorage.
// Every access is wrapped in try/catch because storage can be unavailable
// (private browsing, blocked cookies). The session then lasts only until the tab closes.

const TOKEN_KEY = 'alzikrayat_token';
const USER_KEY = 'alzikrayat_user';

let memoryToken = null; // fallback when localStorage cannot be used

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || memoryToken;
  } catch {
    return memoryToken;
  }
}

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
}

export function saveSession(token, user) {
  memoryToken = token;
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    /* ignore: memory fallback is already set */
  }
}

export function saveUser(user) {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    /* ignore */
  }
}

export function clearSession() {
  memoryToken = null;
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    /* ignore */
  }
}
