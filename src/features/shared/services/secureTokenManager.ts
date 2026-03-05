import type { UserInfo } from "@/features/types/auth";

const ACCESS_TOKEN_KEY = "bjoc_access_token";
const USER_INFO_KEY = "bjoc_user_info";

/* ACCESS TOKEN */

export const setAccessToken = (token: string) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

export const getAccessToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const clearAccessToken = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
};

/* USER INFO */

export const setUserInfo = (user: UserInfo) => {
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(user));
};

export const getUserInfo = (): UserInfo | null => {
  const data = localStorage.getItem(USER_INFO_KEY);
  return data ? JSON.parse(data) : null;
};

export const clearUserInfo = () => {
  localStorage.removeItem(USER_INFO_KEY);
};

/* CLEAR AUTH */

export const clearAuth = () => {
  clearAccessToken();
  clearUserInfo();
};