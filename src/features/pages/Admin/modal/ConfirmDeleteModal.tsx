import { useState, useEffect } from "react";
import api from "@/features/shared/services/api";

type Props = {
  user: any;
  onClose: () => void;
  refresh: () => void;
};

export function ConfirmDeleteModal({ user, onClose, refresh }: Props) {

  const [loading, setLoading] = useState(false);

  // ESC key close
  useEffect(() => {

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("keydown", handleEsc);
    };

  }, [onClose]);


  const handleDelete = async () => {

    try {

      setLoading(true);

      await api.delete(`/users/${user.id}`);

      refresh();
      onClose();

    } catch (error) {

      console.error("Delete user failed", error);

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
        className="bg-white w-[360px] rounded-lg p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >

        {/* TITLE */}

        <h2 className="text-lg font-semibold text-red-600">
          Delete User
        </h2>


        {/* MESSAGE */}

        <p className="text-sm text-gray-500 leading-relaxed">
          Are you sure you want to delete
          <span className="font-medium text-gray-700"> {user.name}</span>?
          <br />
          This action cannot be undone.
        </p>


        {/* ACTIONS */}

        <div className="flex justify-end gap-3 pt-3">

          <button
            onClick={onClose}
            disabled={loading}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>

          <button
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>

        </div>

      </div>

    </div>

  );

}