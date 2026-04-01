import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpDown,
  Ban,
  Eye,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";

import { userService, getFullName, type User, type UserRole } from "./services/userService";
import {
  ConfirmDeleteModal,
  CreateUserModal,
  SuspendUserModal,
  UserDetailsModal,
} from "./modal";

function formatDateValue(value?: string | null) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleDateString();
}

function roleColor(role: UserRole) {
  const map: Record<UserRole, string> = {
    admin: "bg-violet-100 text-violet-700",
    driver: "bg-orange-100 text-orange-700",
    operator: "bg-sky-100 text-sky-700",
    passenger: "bg-slate-100 text-slate-700",
  };

  return map[role];
}

function statusColor(status?: string | null) {
  if (status === "suspended") {
    return "bg-rose-100 text-rose-700";
  }

  return "bg-emerald-100 text-emerald-700";
}

export function AdminUserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<UserRole | "">("");
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sort, setSort] = useState<"asc" | "desc">("desc");
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [openSuspend, setOpenSuspend] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);

  const stats = useMemo(() => {
    return {
      active: users.filter((user) => (user.status ?? "active") !== "suspended").length,
      suspended: users.filter((user) => user.status === "suspended").length,
      total: users.length,
    };
  }, [users]);

  async function fetchUsers() {
    try {
      setLoading(true);

      const data = await userService.getUsers({
        from: from || undefined,
        role: role || undefined,
        search: search || undefined,
        sort,
        status: status || undefined,
        to: to || undefined,
      });

      setUsers(data);
    } catch (error) {
      console.error("Fetch users error:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const debounce = window.setTimeout(() => {
      void fetchUsers();
    }, 300);

    return () => window.clearTimeout(debounce);
  }, [search, role, status, from, to, sort]);

  return (
    <div className="space-y-5">
      <section className="rounded-[28px] border border-emerald-950/10 bg-[linear-gradient(135deg,_#0f3f28,_#14532d_58%,_#1f7a45)] p-5 text-white shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-100/70">
              Admin Control
            </p>
            <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">User Management</h1>
            <p className="mt-2 text-sm text-emerald-50/80 sm:text-base">
              Review accounts, control access, and keep roles organized across the system.
            </p>
          </div>

          <button
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-medium text-emerald-950 shadow-sm transition hover:bg-emerald-50"
            onClick={() => setOpenCreate(true)}
            type="button"
          >
            <Plus size={16} />
            Add User
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <SummaryStat label="Total users" value={stats.total} />
          <SummaryStat label="Active users" value={stats.active} />
          <SummaryStat label="Suspended users" value={stats.suspended} />
        </div>
      </section>

      <section className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1.6fr)_repeat(5,minmax(0,1fr))]">
          <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
            <Search size={16} className="text-slate-400" />
            <input
              className="w-full bg-transparent text-sm outline-none"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search users..."
              value={search}
            />
          </label>

          <select
            className="rounded-2xl border border-slate-200 px-3 py-3 text-sm text-slate-700"
            onChange={(event) => setRole(event.target.value as UserRole | "")}
            value={role}
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="operator">Operator</option>
            <option value="driver">Driver</option>
            <option value="passenger">Passenger</option>
          </select>

          <select
            className="rounded-2xl border border-slate-200 px-3 py-3 text-sm text-slate-700"
            onChange={(event) => setStatus(event.target.value)}
            value={status}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>

          <input
            className="rounded-2xl border border-slate-200 px-3 py-3 text-sm text-slate-700"
            onChange={(event) => setFrom(event.target.value)}
            type="date"
            value={from}
          />

          <input
            className="rounded-2xl border border-slate-200 px-3 py-3 text-sm text-slate-700"
            onChange={(event) => setTo(event.target.value)}
            type="date"
            value={to}
          />

          <button
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-3 py-3 text-sm font-medium text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-900"
            onClick={() => setSort(sort === "asc" ? "desc" : "asc")}
            type="button"
          >
            <ArrowUpDown size={14} />
            {sort === "asc" ? "Oldest" : "Newest"}
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 sm:px-5">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Accounts</h2>
            <p className="text-sm text-slate-500">Responsive view for desktop and mobile admins.</p>
          </div>
          <div className="hidden rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500 sm:inline-flex">
            {stats.total} records
          </div>
        </div>

        <div className="md:hidden">
          {loading ? (
            <div className="px-4 py-10 text-center text-sm text-slate-400">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-slate-400">No users found.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {users.map((user) => (
                <article key={user.id} className="space-y-4 px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-slate-900">{getFullName(user)}</h3>
                      <p className="mt-1 truncate text-sm text-slate-500">{user.email ?? "-"}</p>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <button
                        className="rounded-xl border border-slate-200 p-2 text-sky-700 transition hover:bg-sky-50"
                        onClick={() => {
                          setSelectedUser(user);
                          setOpenDetails(true);
                        }}
                        type="button"
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        className="rounded-xl border border-slate-200 p-2 text-amber-700 transition hover:bg-amber-50"
                        onClick={() => {
                          setSelectedUser(user);
                          setOpenSuspend(true);
                        }}
                        type="button"
                      >
                        <Ban size={16} />
                      </button>

                      <button
                        className="rounded-xl border border-slate-200 p-2 text-rose-700 transition hover:bg-rose-50"
                        onClick={() => {
                          setSelectedUser(user);
                          setOpenDelete(true);
                        }}
                        type="button"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${roleColor(user.role)}`}>
                      {user.role}
                    </span>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColor(user.status)}`}>
                      {user.status ?? "active"}
                    </span>
                  </div>

                  <dl className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl bg-slate-50 px-3 py-2">
                      <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Created
                      </dt>
                      <dd className="mt-1 text-slate-700">{formatDateValue(user.created_at)}</dd>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-3 py-2">
                      <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Contact
                      </dt>
                      <dd className="mt-1 truncate text-slate-700">{user.contact_number ?? "-"}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="min-w-[760px] w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-5 py-4 font-medium">Name</th>
                <th className="px-5 py-4 font-medium">Email</th>
                <th className="px-5 py-4 font-medium">Role</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 font-medium">Created</th>
                <th className="px-5 py-4 text-center font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td className="px-5 py-10 text-center text-slate-400" colSpan={6}>
                    Loading users...
                  </td>
                </tr>
              )}

              {!loading && users.length === 0 && (
                <tr>
                  <td className="px-5 py-10 text-center text-slate-400" colSpan={6}>
                    No users found.
                  </td>
                </tr>
              )}

              {!loading &&
                users.map((user) => (
                  <tr key={user.id} className="border-t border-slate-100 transition hover:bg-slate-50/80">
                    <td className="px-5 py-4 font-medium text-slate-900">{getFullName(user)}</td>
                    <td className="px-5 py-4 text-slate-600">{user.email ?? "-"}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${roleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColor(user.status)}`}>
                        {user.status ?? "active"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{formatDateValue(user.created_at)}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          className="rounded-xl border border-slate-200 p-2 text-sky-700 transition hover:bg-sky-50"
                          onClick={() => {
                            setSelectedUser(user);
                            setOpenDetails(true);
                          }}
                          type="button"
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          className="rounded-xl border border-slate-200 p-2 text-amber-700 transition hover:bg-amber-50"
                          onClick={() => {
                            setSelectedUser(user);
                            setOpenSuspend(true);
                          }}
                          type="button"
                        >
                          <Ban size={16} />
                        </button>

                        <button
                          className="rounded-xl border border-slate-200 p-2 text-rose-700 transition hover:bg-rose-50"
                          onClick={() => {
                            setSelectedUser(user);
                            setOpenDelete(true);
                          }}
                          type="button"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>

      {openCreate && <CreateUserModal onClose={() => setOpenCreate(false)} refresh={fetchUsers} />}

      {openSuspend && selectedUser && (
        <SuspendUserModal
          onClose={() => {
            setOpenSuspend(false);
            setSelectedUser(null);
          }}
          refresh={fetchUsers}
          user={selectedUser}
        />
      )}

      {openDelete && selectedUser && (
        <ConfirmDeleteModal
          onClose={() => {
            setOpenDelete(false);
            setSelectedUser(null);
          }}
          refresh={fetchUsers}
          user={selectedUser}
        />
      )}

      {openDetails && selectedUser && (
        <UserDetailsModal
          onClose={() => {
            setOpenDetails(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
        />
      )}
    </div>
  );
}

type SummaryStatProps = {
  label: string;
  value: number;
};

function SummaryStat({ label, value }: SummaryStatProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-emerald-50/75">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
        </div>

        <div className="rounded-2xl bg-white/15 p-3 text-emerald-50">
          <Users size={18} />
        </div>
      </div>
    </div>
  );
}
