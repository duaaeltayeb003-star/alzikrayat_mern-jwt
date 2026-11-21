import axios from 'axios';
import { clearSession, getToken } from './tokenStorage.js';

// One Axios instance for the whole app. Requests go to /api, which the Vite dev proxy
// forwards to the Express server.
const http = axios.create({ baseURL: '/api' });

// REQUEST interceptor: attaches "Authorization: Bearer <token>" to every request
// automatically, so pages never handle the token themselves.
http.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// RESPONSE interceptor:
//  - 401 while holding a token means it expired or is invalid, so the session is cleared
//    and the app is told (AuthContext listens for this event and logs the user out)
//  - server error messages are turned into plain Error objects for the pages to display
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401 && getToken()) {
      clearSession();
      window.dispatchEvent(new Event('auth:expired'));
    }

    const message =
      (error.response && error.response.data && error.response.data.message) ||
      (error.request
        ? 'Cannot reach the server. Make sure the API is running.'
        : error.message);

    return Promise.reject(new Error(message));
  }
);

// Same small interface as before, so pages and hooks did not need to change.
// For FormData uploads Axios sets the multipart Content-Type by itself.
export const api = {
  get: (path) => http.get(path).then((res) => res.data),
  post: (path, body) => http.post(path, body).then((res) => res.data),
  upload: (path, form) => http.post(path, form).then((res) => res.data),
  delete: (path) => http.delete(path).then((res) => res.data || null),
};

export const imageUrl = (fileName) => `/uploads/${fileName}`;
