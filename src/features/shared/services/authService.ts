import api from "./api";

export const authService = {
  login: (data: { email: string; password: string }) => {
    return api.post("/auth/login", data);
  },

  logout: () => {
    return api.post("/auth/logout");
  },

  getProfile: () => {
    return api.get("/auth/me");
  },
};