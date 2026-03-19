import { X } from "lucide-react";
import { useEffect } from "react";
import type { User, UserRole } from "../services/userService";
import { getFullName } from "../services/userService";

type Props = {
  user: User;
  onClose: () => void;
};

export function UserDetailsModal({ user, onClose }: Props) {

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const statusColor =
    user.status === "suspended"
      ? "bg-red-100 text-red-600"
      : user.status === "deleted"
      ? "bg-gray-100 text-gray-500"
      : "bg-green-100 text-green-600";

  const roleColors: Record<UserRole, string> = {
    admin: "bg-purple-100 text-purple-600",
    operator: "bg-blue-100 text-blue-600",
    driver: "bg-orange-100 text-orange-600",
    passenger: "bg-gray-100 text-gray-600"
  };

  return (

    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={onClose}>

      <div className="bg-white w-[420px] rounded-lg p-6 space-y-5" onClick={(e) => e.stopPropagation()}>

        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">User Details</h2>
          <button onClick={onClose}>
            <X size={18}/>
          </button>
        </div>

        <div className="space-y-4">

          <div>
            <label className="text-sm text-gray-500">Name</label>
            <div className="border-b py-2 text-sm">
              {getFullName(user)}
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-500">Email</label>
            <div className="border-b py-2 text-sm">
              {user.email ?? "—"}
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-500">Contact Number</label>
            <div className="border-b py-2 text-sm">
              {user.contact_number ?? "—"}
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-500">Role</label>
            <span className={`px-2 py-1 text-xs rounded ${roleColors[user.role]}`}>
              {user.role}
            </span>
          </div>

          <div>
            <label className="text-sm text-gray-500">Status</label>
            <span className={`px-2 py-1 text-xs rounded ${statusColor}`}>
              {user.status ?? "active"}
            </span>
          </div>

          <div>
            <label className="text-sm text-gray-500">Created At</label>
            <div className="border-b py-2 text-sm">
              {user.created_at
                ? new Date(user.created_at).toLocaleString()
                : "—"}
            </div>
          </div>

        </div>

        <div className="flex justify-end">
          <button onClick={onClose}>Close</button>
        </div>

      </div>
    </div>
  );
}