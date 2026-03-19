
import { X } from "lucide-react";
import { useState } from "react";

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

  const [errors,setErrors] = useState<any>({});

  if (!open) return null;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {

    const { name, value } = e.target;

    setForm({
      ...form,
      [name]:
        name === "capacity"
          ? Number(value)
          : name === "plate_number"
          ? value.toUpperCase()
          : value
    });

    setErrors((prev:any)=>({
      ...prev,
      [name]: ""
    }));

  }

  function validate(){

    const newErrors:any = {};

    if(!form.plate_number)
      newErrors.plate_number = "Plate number required";

    if(!form.model)
      newErrors.model = "Vehicle model required";

    if(!form.capacity || form.capacity <= 0)
      newErrors.capacity = "Capacity must be greater than 0";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;

  }

  function handleSave(){

    if(!validate()) return;

    onSave();

  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-[300px] space-y-6">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-lg">
            Vehicle Details
          </h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>
        <div className="space-y-4">

          <div>

            <input
              name="plate_number"
              value={form.plate_number}
              onChange={handleChange}
              placeholder="Plate Number"
              className="border-b border-gray-300 focus:border-green-500 outline-none py-2 w-full"
            />

            <p className="text-xs text-red-500">
              {errors.plate_number}
            </p>

          </div>

          <div>

            <input
              name="model"
              value={form.model}
              onChange={handleChange}
              placeholder="Vehicle Model"
              className="border-b border-gray-300 focus:border-green-500 outline-none py-2 w-full"
            />

            <p className="text-xs text-red-500">
              {errors.model}
            </p>

          </div>

          <div>

            <input
              name="capacity"
              type="number"
              value={form.capacity}
              onChange={handleChange}
              placeholder="Passenger Capacity"
              className="border-b border-gray-300 focus:border-green-500 outline-none py-2 w-full"
            />

            <p className="text-xs text-red-500">
              {errors.capacity}
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          className="w-full bg-green-900 hover:bg-green-700 text-white py-2 rounded-lg"
        >
          Save Vehicle
        </button>

      </div>

    </div>
  );
}
