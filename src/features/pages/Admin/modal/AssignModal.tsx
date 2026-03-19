import { X } from "lucide-react";
import type { Driver, Vehicle } from "@/features";

type AssignForm = {
  driver_id: string;
  vehicle_id: string;
};

type Props = {
  open: boolean;
  drivers: Driver[];
  vehicles: Vehicle[];
  mode: "driver" | "vehicle" | null;
  form: AssignForm;
  setForm: React.Dispatch<React.SetStateAction<AssignForm>>;
  onAssign: () => void;
  onClose: () => void;
};

export function AssignModal({
  open,
  drivers,
  vehicles,
  mode,
  form,
  setForm,
  onAssign,
  onClose
}: Props) {

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

      <div className="bg-white p-6 rounded-xl w-[300px] space-y-4">

        <div className="flex justify-between items-center">

          <h2 className="font-semibold text-lg">
            Assign
          </h2>

          <button onClick={onClose}>
            <X />
          </button>

        </div>

        {mode === "driver" && (

          <select
            className="border p-2 rounded w-full"
            value={form.vehicle_id}
            onChange={(e) =>
              setForm({
                ...form,
                vehicle_id: e.target.value
              })
            }
          >
            <option value="">Select Vehicle</option>

            {vehicles.map(v => (
              <option key={v.id} value={v.id}>
                {v.plate_number} - {v.model}
              </option>
            ))}

          </select>

        )}

        {mode === "vehicle" && (

          <select
            className="border p-2 rounded w-full"
            value={form.driver_id}
            onChange={(e) =>
              setForm({
                ...form,
                driver_id: e.target.value
              })
            }
          >
            <option value="">Select Driver</option>

            {drivers.map(d => (
              <option key={d.id} value={d.id} className="border p-2 rounded w-full">
                {d.first_name} {d.last_name}
              </option>
            ))}
          </select>
        )}

        <button
          onClick={onAssign}
          className="w-full bg-blue-600 text-white py-2 rounded-lg"
        >
          Assign
        </button>

      </div>

    </div>
  );
}