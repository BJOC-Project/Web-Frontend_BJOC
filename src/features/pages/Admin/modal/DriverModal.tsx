import { X } from "lucide-react";
import { useGlobalModal } from "@/features/shared/context/GlobalModalContext";

type DriverForm = {
  first_name: string;
  last_name: string;
  email: string;
  contact_number: string;
  license_number: string;
  password: string;
  confirm_password: string;
  status: string;
};

type Props = {
  open: boolean;
  form: DriverForm;
  setForm: React.Dispatch<React.SetStateAction<DriverForm>>;
  onSave: () => void;
  onClose: () => void;
};

export function DriverModal({
  open,
  form,
  setForm,
  onSave,
  onClose
}: Props) {

  const { openModal } = useGlobalModal();

  if (!open) return null;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  }

  function handleConfirm() {

    onClose();

    openModal("verifyAccount", {
      email: form.email,
      phone: form.contact_number,
      onVerified: onSave
    });

  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white p-6 rounded-xl w-[450px] space-y-5">

        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-lg">Driver Details</h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <input
          name="first_name"
          value={form.first_name}
          onChange={handleChange}
          placeholder="First Name"
          className="border-b border-gray-300 focus:border-orange-500 outline-none py-2 w-full"
        />

        <input
          name="last_name"
          value={form.last_name}
          onChange={handleChange}
          placeholder="Last Name"
          className="border-b border-gray-300 focus:border-orange-500 outline-none py-2 w-full"
        />

        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          className="border-b border-gray-300 focus:border-orange-500 outline-none py-2 w-full"
        />

        <input
          name="contact_number"
          value={form.contact_number}
          onChange={handleChange}
          placeholder="Phone Number"
          className="border-b border-gray-300 focus:border-orange-500 outline-none py-2 w-full"
        />

        <input
          name="license_number"
          value={form.license_number}
          onChange={handleChange}
          placeholder="License Number"
          className="border-b border-gray-300 focus:border-orange-500 outline-none py-2 w-full"
        />

        <input
          name="password"
          value={form.password}
          onChange={handleChange}
          type="password"
          placeholder="Password"
          className="border-b border-gray-300 focus:border-orange-500 outline-none py-2 w-full"
        />

        <input
          name="confirm_password"
          value={form.confirm_password}
          onChange={handleChange}
          type="password"
          placeholder="Confirm Password"
          className="border-b border-gray-300 focus:border-orange-500 outline-none py-2 w-full"
        />

        <button
          onClick={handleConfirm}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg"
        >
          Confirm Details
        </button>

      </div>

    </div>
  );
}
