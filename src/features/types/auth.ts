export type Role = "admin" | "operator";

export type UserInfo = {
  email: string;
  fullName: string;
  role: Role;
};