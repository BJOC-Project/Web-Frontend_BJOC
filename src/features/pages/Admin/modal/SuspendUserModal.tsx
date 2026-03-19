import { useState, useEffect } from "react";
import api from "@/features/shared/services/api";

type Props = {
  user: any;
  onClose: () => void;
  refresh: () => void;
};

export function SuspendUserModal({ user, onClose, refresh }: Props) {

  const [days, setDays] = useState(3);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Close modal with ESC
  useEffect(() => {

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("keydown", handleEsc);
    };

  }, [onClose]);


  const handleSuspend = async () => {

    if (!reason.trim()) {
      setError("Suspension reason is required.");
      return;
    }

    try {

      setLoading(true);
      setError("");

      await api.patch(`/users/${user.id}/suspend`, {
        days,
        reason
      });

      refresh();
      onClose();

    } catch (err: any) {

      setError(err?.response?.data?.message || "Failed to suspend user");

    } finally {

      setLoading(false);

    }

  };


  return (

    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
      onClick={onClose}
    >

      <div
        className="bg-white w-[380px] rounded-lg p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >

        {/* HEADER */}

        <h2 className="text-lg font-semibold">
          Suspend User
        </h2>

        <p className="text-sm text-gray-500">
          Select how long <span className="font-medium">{user.name}</span>'s account will be suspended.
        </p>


        {/* ERROR */}

        {error && (
          <div className="text-sm text-red-500">
            {error}
          </div>
        )}


        {/* DURATION */}

        <div className="space-y-2">

          {[1, 3, 7, 30].map((d) => (

            <label
              key={d}
              className="flex items-center gap-2 text-sm cursor-pointer"
            >

              <input
                type="radio"
                checked={days === d}
                onChange={() => setDays(d)}
              />

              {d} day{d > 1 && "s"}

            </label>

          ))}

        </div>


        {/* REASON */}

        <div>

          <label className="text-sm text-gray-500">
            Reason
          </label>

          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className="w-full border rounded mt-1 p-2 text-sm outline-none"
            placeholder="Enter suspension reason..."
          />

        </div>


        {/* ACTIONS */}

        <div className="flex justify-end gap-3 pt-3">

          <button
            onClick={onClose}
            disabled={loading}
            className="text-sm text-gray-500 hover:text-black"
          >
            Cancel
          </button>

          <button
            onClick={handleSuspend}
            disabled={loading}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded text-sm"
          >
            {loading ? "Suspending..." : "Suspend"}
          </button>

        </div>

      </div>

    </div>

  );

}