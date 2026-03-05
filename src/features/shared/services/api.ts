import axios from "axios";
import { getAccessToken, clearAuth } from "./secureTokenManager";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

/* =========================
   REQUEST INTERCEPTOR
   Attach JWT token
========================= */
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);


/* =========================
   RESPONSE INTERCEPTOR
   Handle auth errors
========================= */
api.interceptors.response.use(
  (response) => response,

  (error) => {

    if (error.response?.status === 401) {
      clearAuth();

      // redirect to login
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;