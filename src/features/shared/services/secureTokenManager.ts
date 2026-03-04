const ACCESS_TOKEN_KEY = "bjoc_access_token";
const USER_INFO_KEY = "bjoc_user_info";

export const setAccessToken = (token: string) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

export const getAccessToken = () => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const clearAccessToken = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
};

export const setUserInfo = (user: {
  email: string;
  fullName: string;
  role: string;
}) => {
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(user));
};

export const getUserInfo = () => {
  const data = localStorage.getItem(USER_INFO_KEY);
  return data ? JSON.parse(data) : null;
};

export const clearUserInfo = () => {
  localStorage.removeItem(USER_INFO_KEY);
};