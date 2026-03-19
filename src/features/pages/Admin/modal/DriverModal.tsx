
import { X, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
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

  const [errors,setErrors] = useState<any>({});
  const [showPassword,setShowPassword] = useState(false);
  const [showConfirm,setShowConfirm] = useState(false);

  if (!open) return null;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {

    setForm({
      ...form,
      [e.target.name]: e.target.value
    });

    setErrors((prev:any)=>({
      ...prev,
      [e.target.name]: ""
    }));

  }

  function validate(){

    const newErrors:any = {};

    if(!form.first_name) newErrors.first_name = "First name is required";
    if(!form.last_name) newErrors.last_name = "Last name is required";

    if(!form.email) newErrors.email = "Email is required";
    else if(!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "Invalid email format";

    if(!form.contact_number)
      newErrors.contact_number = "Contact number required";

    if(!form.license_number)
      newErrors.license_number = "License number required";

    if(!form.password)
      newErrors.password = "Password required";

    if(form.password !== form.confirm_password)
      newErrors.confirm_password = "Passwords do not match";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;

  }

  function handleConfirm(){

    if(!validate()) return;

    onClose();

    openModal("verifyAccount",{
      email: form.email,
      phone: form.contact_number,
      onVerified: onSave
    });

  }

  return (

    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white p-6 rounded-xl w-[350px] space-y-6">

        {/* HEADER */}

        <div className="flex justify-between items-center">

          <h2 className="font-semibold text-lg">
            Driver Details
          </h2>

          <button onClick={onClose}>
            <X/>
          </button>

        </div>


        {/* FORM */}

        <div className="grid grid-cols-2 gap-4">

          {/* FIRST NAME */}

          <div>
            <input
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              placeholder="First Name"
              className="border-b border-gray-300 focus:border-orange-500 outline-none py-2 w-full"
            />
            <p className="text-xs text-red-500">{errors.first_name}</p>
          </div>


          {/* LAST NAME */}

          <div>
            <input
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              placeholder="Last Name"
              className="border-b border-gray-300 focus:border-orange-500 outline-none py-2 w-full"
            />
            <p className="text-xs text-red-500">{errors.last_name}</p>
          </div>


          {/* EMAIL */}

          <div className="col-span-2">
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              className="border-b border-gray-300 focus:border-orange-500 outline-none py-2 w-full"
            />
            <p className="text-xs text-red-500">{errors.email}</p>
          </div>


          {/* CONTACT */}

          <div>
            <input
              name="contact_number"
              value={form.contact_number}
              onChange={handleChange}
              placeholder="Contact No."
              className="border-b border-gray-300 focus:border-orange-500 outline-none py-2 w-full"
            />
            <p className="text-xs text-red-500">{errors.contact_number}</p>
          </div>


          {/* LICENSE */}

          <div>
            <input
              name="license_number"
              value={form.license_number}
              onChange={handleChange}
              placeholder="Licence No."
              className="border-b border-gray-300 focus:border-orange-500 outline-none py-2 w-full"
            />
            <p className="text-xs text-red-500">{errors.license_number}</p>
          </div>


          {/* PASSWORD */}

          <div className="col-span-2 relative">

            <input
              name="password"
              value={form.password}
              onChange={handleChange}
              type={showPassword ? "text":"password"}
              placeholder="Password"
              className="border-b border-gray-300 focus:border-orange-500 outline-none py-2 w-full pr-8"
            />

            <span
              className="absolute right-1 top-2 cursor-pointer text-gray-400"
              onClick={()=>setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
            </span>

            <p className="text-xs text-red-500">{errors.password}</p>

          </div>


          {/* CONFIRM PASSWORD */}

          <div className="col-span-2 relative">

            <input
              name="confirm_password"
              value={form.confirm_password}
              onChange={handleChange}
              type={showConfirm ? "text":"password"}
              placeholder="Confirm Password"
              className="border-b border-gray-300 focus:border-orange-500 outline-none py-2 w-full pr-8"
            />

            <span
              className="absolute right-1 top-2 cursor-pointer text-gray-400"
              onClick={()=>setShowConfirm(!showConfirm)}
            >
              {showConfirm ? <EyeOff size={16}/> : <Eye size={16}/>}
            </span>

            <p className="text-xs text-red-500">{errors.confirm_password}</p>

          </div>

        </div>


        {/* BUTTON */}

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
