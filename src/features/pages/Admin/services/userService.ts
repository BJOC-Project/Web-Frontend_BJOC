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

interface BackendEnvelope<T> {
  data: T;
  meta?: Record<string, unknown>;
  success: boolean;
}

interface BackendUser {
  contact?: string | null;
  createdAt: string | null;
  email: string | null;
  firstName: string;
  id: string;
  lastName: string;
  middleName?: string | null;
  role: "admin" | "driver" | "passenger" | "staff";
  status: string | null;
  suspendedUntil?: string | null;
  suspensionReason?: string | null;
}

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

const cleanObject = (obj: Record<string, unknown>) => {
  return Object.fromEntries(
    Object.entries(obj).filter(
      (entry) => {
        const value = entry[1];

        return value !== undefined && value !== null && value !== "";
      },
    ),
  );
};

function extractApiData<T>(payload: BackendEnvelope<T>) {
  return payload.data;
}

function mapBackendRole(role: BackendUser["role"]): UserRole {
  if (role === "staff") {
    return "operator";
  }

  return role;
}

function mapRoleFilter(role?: string) {
  if (role === "operator") {
    return "staff";
  }

  return role;
}

function mapBackendUser(user: BackendUser): User {
  return {
    contact_number: user.contact ?? null,
    created_at: user.createdAt,
    email: user.email,
    first_name: user.firstName,
    id: user.id,
    last_name: user.lastName,
    middle_name: user.middleName ?? null,
    role: mapBackendRole(user.role),
    status: user.status,
    suspended_until: user.suspendedUntil ?? null,
    suspension_reason: user.suspensionReason ?? null,
  };
}

function applyClientSideFilters(
  users: User[],
  params?: GetUsersParams,
) {
  let nextUsers = [...users];

  if (params?.from) {
    const fromDate = new Date(params.from);

    nextUsers = nextUsers.filter((user) => {
      if (!user.created_at) {
        return false;
      }

      return new Date(user.created_at) >= fromDate;
    });
  }

  if (params?.to) {
    const toDate = new Date(params.to);
    toDate.setHours(23, 59, 59, 999);

    nextUsers = nextUsers.filter((user) => {
      if (!user.created_at) {
        return false;
      }

      return new Date(user.created_at) <= toDate;
    });
  }

  if (params?.sort) {
    const direction = params.sort === "asc" ? 1 : -1;

    nextUsers.sort((left, right) => {
      const leftTime = left.created_at ? new Date(left.created_at).getTime() : 0;
      const rightTime = right.created_at ? new Date(right.created_at).getTime() : 0;

      return (leftTime - rightTime) * direction;
    });
  }

  return nextUsers;
}

/* ---------------------------
   SERVICE
---------------------------- */

export const userService = {

  /* CREATE USER */
  createUser: async (payload: CreateUserPayload): Promise<User> => {

    const res = await api.post<BackendEnvelope<BackendUser>>("/users", cleanObject(payload));

    return mapBackendUser(extractApiData(res.data));
  },

  /* GET USERS */
  getUsers: async (params?: GetUsersParams): Promise<User[]> => {

    const cleanParams = cleanObject({
      role: mapRoleFilter(params?.role),
      search: params?.search,
      status: params?.status,
    });
    const res = await api.get<BackendEnvelope<BackendUser[]>>("/admin/users", {
      params: cleanParams,
    });
    const rawUsers = res.data?.data ?? [];
    const mappedUsers = rawUsers.map((user) => mapBackendUser(user));

    return applyClientSideFilters(mappedUsers, params);
  },

  /* GET USER BY ID */
  getUserById: async (id: string): Promise<User> => {

    const res = await api.get<BackendEnvelope<BackendUser>>(`/users/${id}`);

    return mapBackendUser(extractApiData(res.data));
  },

  /* UPDATE USER */
  updateUser: async (id: string, payload: UpdateUserPayload): Promise<User> => {

    const res = await api.patch<BackendEnvelope<BackendUser>>(
      `/users/${id}`,
      cleanObject(payload),
    );

    return mapBackendUser(extractApiData(res.data));
  },

  /* DELETE USER */
  deleteUser: async (id: string) => {

    const res = await api.delete<BackendEnvelope<{ id: string }>>(`/users/${id}`);

    return extractApiData(res.data);
  },

  /* SUSPEND USER */
  suspendUser: async (id: string, payload: SuspendUserPayload): Promise<User> => {

    const res = await api.patch<BackendEnvelope<BackendUser>>(`/users/${id}/suspend`, payload);

    return mapBackendUser(extractApiData(res.data));
  },

  /* UNSUSPEND USER */
  unsuspendUser: async (id: string): Promise<User> => {

    const res = await api.patch<BackendEnvelope<BackendUser>>(`/users/${id}/unsuspend`);

    return mapBackendUser(extractApiData(res.data));
  },

};
