import api from "@/features/shared/services/api";

/* ---------------------------
   TYPES
---------------------------- */

export type UserRole = "admin" | "operator" | "driver" | "passenger";

export type User = {
  id: string;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  email: string | null;
  contact_number?: string | null;
  role: UserRole;
  status: string | null;
  created_at: string | null;
  suspended_until?: string | null;
  suspension_reason?: string | null;
};

/* OPTIONAL: helper */
export const getFullName = (user: User) => {
  return `${user.first_name} ${user.middle_name ?? ""} ${user.last_name}`.trim();
};

type GetUsersParams = {
  search?: string;
  role?: string;
  status?: string;
  from?: string;
  to?: string;
  sort?: "asc" | "desc";
};

/* ---------------------------
   PAYLOADS
---------------------------- */

type CreateUserPayload = {
  email: string;
  password: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  contact_number?: string;
  role: UserRole;
  license_number?: string;
};

type UpdateUserPayload = {
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  role?: UserRole;
};

type SuspendUserPayload = {
  days: number;
  reason: string;
};

/* ---------------------------
   HELPERS
---------------------------- */

const cleanObject = (obj: Record<string, any>) =>
  Object.fromEntries(
    Object.entries(obj).filter(
      ([_, v]) => v !== undefined && v !== null && v !== ""
    )
  );

/* ---------------------------
   SERVICE
---------------------------- */

export const userService = {

  /* CREATE USER */
  createUser: async (payload: CreateUserPayload) => {

    const res = await api.post("/users", cleanObject(payload));

    return res.data;
  },

  /* GET USERS */
  getUsers: async (params?: GetUsersParams): Promise<User[]> => {

    const cleanParams = cleanObject(params || {});

    const res = await api.get("/users", { params: cleanParams });

    // ✅ ensure always array
    return Array.isArray(res.data) ? res.data : res.data?.data ?? [];
  },

  /* GET USER BY ID */
  getUserById: async (id: string): Promise<User> => {

    const res = await api.get<User>(`/users/${id}`);

    return res.data;
  },

  /* UPDATE USER */
  updateUser: async (id: string, payload: UpdateUserPayload) => {

    const res = await api.patch(
      `/users/${id}`,
      cleanObject(payload)
    );

    return res.data;
  },

  /* DELETE USER */
  deleteUser: async (id: string) => {

    const res = await api.delete(`/users/${id}`);

    return res.data;
  },

  /* SUSPEND USER */
  suspendUser: async (id: string, payload: SuspendUserPayload) => {

    const res = await api.patch(`/users/${id}/suspend`, payload);

    return res.data;
  },

  /* UNSUSPEND USER */
  unsuspendUser: async (id: string) => {

    const res = await api.patch(`/users/${id}/unsuspend`);

    return res.data;
  }

};