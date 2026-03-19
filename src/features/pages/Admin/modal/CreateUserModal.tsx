import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { userService, type UserRole } from "../services/userService";

type Props = {
  onClose: () => void;
  refresh: () => void;
};

export function CreateUserModal({ onClose, refresh }: Props) {

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<{
    first_name: string;
    middle_name: string;
    last_name: string;
    email: string;
    contact_number: string;
    role: UserRole;
    password: string;
    license_number: string;
  }>({
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    contact_number: "",
    role: "driver",
    password: "",
    license_number: ""
  });

  const [error, setError] = useState("");

  /* ESC CLOSE */
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  /* RESET DRIVER FIELD */
  useEffect(() => {
    if (form.role !== "driver") {
      setForm(prev => ({ ...prev, license_number: "" }));
    }
  }, [form.role]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {

    const { name, value } = e.target;

    setForm(prev => ({
      ...prev,
      [name]: name === "role" ? (value as UserRole) : value
    }));
  };

  const handleSubmit = async () => {

    if (!form.first_name || !form.last_name || !form.email || !form.password) {
      setError("First name, last name, email, and password are required.");
      return;
    }

    if (form.role === "driver" && !form.license_number) {
      setError("License number is required for drivers.");
      return;
    }

    try {

      setLoading(true);
      setError("");

      await userService.createUser(form);

      refresh();
      onClose();

    } catch (err: any) {

      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create user"
      );

    } finally {
      setLoading(false);
    }
  };

  return (

    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={onClose}>

      <div className="bg-white w-[420px] rounded-lg p-6 space-y-5" onClick={(e) => e.stopPropagation()}>

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Create User</h2>
          <button onClick={onClose}>
            <X size={18}/>
          </button>
        </div>

        {/* ERROR */}
        {error && <div className="text-sm text-red-500">{error}</div>}

        {/* FORM */}
        <div className="space-y-4">

          <div className="flex gap-2">
            <input name="first_name" placeholder="First name" value={form.first_name} onChange={handleChange} className="w-full border-b py-2 text-sm"/>
            <input name="middle_name" placeholder="Middle" value={form.middle_name} onChange={handleChange} className="w-full border-b py-2 text-sm"/>
          </div>

          <input name="last_name" placeholder="Last name" value={form.last_name} onChange={handleChange} className="w-full border-b py-2 text-sm"/>

          <input name="email" placeholder="Email" value={form.email} onChange={handleChange} className="w-full border-b py-2 text-sm"/>

          <input name="contact_number" placeholder="Contact number" value={form.contact_number} onChange={handleChange} className="w-full border-b py-2 text-sm"/>

          <select name="role" value={form.role} onChange={handleChange} className="w-full border-b py-2 text-sm">
            <option value="driver">Driver</option>
            <option value="operator">Operator</option>
            <option value="admin">Admin</option>
            <option value="passenger">Passenger</option>
          </select>

          {form.role === "driver" && (
            <input name="license_number" placeholder="License number" value={form.license_number} onChange={handleChange} className="w-full border-b py-2 text-sm"/>
          )}

          <input type="password" name="password" placeholder="Temporary password" value={form.password} onChange={handleChange} className="w-full border-b py-2 text-sm"/>

        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3 pt-4">
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleSubmit} disabled={loading}>
            {loading ? "Creating..." : "Create"}
          </button>
        </div>

      </div>
    </div>
  );
}