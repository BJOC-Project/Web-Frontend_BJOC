import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Eye,
  Ban,
  Trash2,
  ArrowUpDown
} from "lucide-react";

import { userService, getFullName, type User, type UserRole } from "./services/userService";

import {
  CreateUserModal,
  SuspendUserModal,
  ConfirmDeleteModal,
  UserDetailsModal
} from "./modal";

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

  /* -----------------------------
     FETCH USERS
  ------------------------------ */

  const fetchUsers = async () => {
    try {

      setLoading(true);

      const data = await userService.getUsers({
        search: search || undefined,
        role: role || undefined,
        status: status || undefined,
        from: from || undefined,
        to: to || undefined,
        sort
      });

      setUsers(data);

    } catch (error) {

      console.error("Fetch users error:", error);
      setUsers([]);

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(fetchUsers, 300);
    return () => clearTimeout(debounce);
  }, [search, role, status, from, to, sort]);

  /* -----------------------------
     BADGES
  ------------------------------ */

  const roleColor = (role: UserRole) => {
    const map: Record<UserRole, string> = {
      admin: "bg-purple-100 text-purple-600",
      operator: "bg-blue-100 text-blue-600",
      driver: "bg-orange-100 text-orange-600",
      passenger: "bg-gray-100 text-gray-600"
    };
    return map[role];
  };

  const statusColor = (status?: string | null) => {
    if (status === "suspended") return "bg-red-100 text-red-600";
    if (status === "deleted") return "bg-gray-200 text-gray-500";
    return "bg-green-100 text-green-600";
  };

  return (

    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">User Management</h1>
          <p className="text-sm text-gray-500">
            Manage system users and permissions
          </p>
        </div>

        <button
          onClick={() => setOpenCreate(true)}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
        >
          <Plus size={16} />
          Add User
        </button>
      </div>

      {/* FILTERS */}
      <div className="bg-white border rounded-lg p-4 flex flex-wrap gap-3 items-center">

        <div className="flex items-center border rounded-lg px-3 py-2 w-64">
          <Search size={16} className="text-gray-400 mr-2" />
          <input
            placeholder="Search users..."
            className="outline-none w-full text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="border rounded-lg px-3 py-2 text-sm"
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole | "")}
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="operator">Operator</option>
          <option value="driver">Driver</option>
          <option value="passenger">Passenger</option>
        </select>

        <select
          className="border rounded-lg px-3 py-2 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="deleted">Deleted</option>
        </select>

        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        />

        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        />

        <button
          onClick={() => setSort(sort === "asc" ? "desc" : "asc")}
          className="flex items-center gap-2 border px-3 py-2 rounded-lg text-sm"
        >
          <ArrowUpDown size={14} />
          {sort === "asc" ? "Oldest" : "Newest"}
        </button>

      </div>

      {/* TABLE */}
      <div className="bg-white border rounded-lg overflow-hidden">

        <table className="w-full text-sm">

          <thead className="bg-gray-50 text-left">
            <tr className="text-gray-500">
              <th className="p-3 font-medium">Name</th>
              <th className="p-3 font-medium">Email</th>
              <th className="p-3 font-medium">Role</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium">Created</th>
              <th className="p-3 font-medium text-center">Actions</th>
            </tr>
          </thead>

          <tbody>

            {loading && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-400">
                  Loading users...
                </td>
              </tr>
            )}

            {!loading && users.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-400">
                  No users found
                </td>
              </tr>
            )}

            {!loading && users.map((user) => (
              <tr key={user.id} className="border-t hover:bg-gray-50">

                <td className="p-3 font-medium">
                  {getFullName(user)}
                </td>

                <td className="p-3">
                  {user.email ?? "—"}
                </td>

                <td className="p-3">
                  <span className={`px-2 py-1 text-xs rounded ${roleColor(user.role)}`}>
                    {user.role}
                  </span>
                </td>

                <td className="p-3">
                  <span className={`px-2 py-1 text-xs rounded ${statusColor(user.status)}`}>
                    {user.status ?? "active"}
                  </span>
                </td>

                <td className="p-3">
                  {user.created_at
                    ? new Date(user.created_at).toLocaleDateString()
                    : "—"}
                </td>

                <td className="p-3">
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setOpenDetails(true);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Eye size={18} />
                    </button>

                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setOpenSuspend(true);
                      }}
                      className="text-yellow-600 hover:text-yellow-800"
                    >
                      <Ban size={18} />
                    </button>

                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setOpenDelete(true);
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

      {/* MODALS */}
      {openCreate && (
        <CreateUserModal
          onClose={() => setOpenCreate(false)}
          refresh={fetchUsers}
        />
      )}

      {openSuspend && selectedUser && (
        <SuspendUserModal
          user={selectedUser}
          onClose={() => {
            setOpenSuspend(false);
            setSelectedUser(null);
          }}
          refresh={fetchUsers}
        />
      )}

      {openDelete && selectedUser && (
        <ConfirmDeleteModal
          user={selectedUser}
          onClose={() => {
            setOpenDelete(false);
            setSelectedUser(null);
          }}
          refresh={fetchUsers}
        />
      )}

      {openDetails && selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => {
            setOpenDetails(false);
            setSelectedUser(null);
          }}
        />
      )}

    </div>
  );
}