import { X } from "lucide-react";

type VehicleForm = {
  plate_number: string;
  model: string;
  capacity: number;
};

type Props = {
  open: boolean;
  form: VehicleForm;
  setForm: React.Dispatch<React.SetStateAction<VehicleForm>>;
  onSave: () => void;
  onClose: () => void;
};

export function VehicleModal({
  open,
  form,
  setForm,
  onSave,
  onClose
}: Props) {

  if (!open) return null;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: name === "capacity" ? Number(value) : value
    });
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white p-6 rounded-xl w-[420px] space-y-4">

        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-lg">Vehicle</h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <input
          name="plate_number"
          value={form.plate_number}
          onChange={handleChange}
          placeholder="Plate Number"
          className="border p-2 rounded w-full"
        />

        <input
          name="model"
          value={form.model}
          onChange={handleChange}
          placeholder="Model"
          className="border p-2 rounded w-full"
        />

        <input
          name="capacity"
          type="number"
          value={form.capacity}
          onChange={handleChange}
          placeholder="Capacity"
          className="border p-2 rounded w-full"
        />

        <button
          onClick={onSave}
          className="w-full bg-blue-600 text-white py-2 rounded-lg"
        >
          Save Vehicle
        </button>

      </div>

    </div>
  );
}