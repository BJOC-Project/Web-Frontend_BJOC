import { useEffect, useState } from "react";
import { adminService } from "./services/adminService";

type Driver = {
  id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  license_number: string;
  contact_number: string;
  vehicle?: string;
  route?: string;
  load?: number;
  status: "online" | "offline";
};

export function AdminDriverManagement() {

  const [drivers,setDrivers] = useState<Driver[]>([]);
  const [editingDriver,setEditingDriver] = useState<Driver | null>(null);
  const [showModal,setShowModal] = useState(false);

  const [form,setForm] = useState({
    first_name:"",
    middle_name:"",
    last_name:"",
    license_number:"",
    contact_number:"",
    email:"",
    password:""
  });

  useEffect(()=>{
    loadDrivers();
  },[]);

  async function loadDrivers(){
    const data = await adminService.getDrivers();
    setDrivers(data);
  }

  function resetForm(){
    setForm({
      first_name:"",
      middle_name:"",
      last_name:"",
      license_number:"",
      contact_number:"",
      email:"",
      password:""
    });
    setEditingDriver(null);
  }

  function openAddModal(){
    resetForm();
    setShowModal(true);
  }

  function handleEdit(driver:Driver){

    setEditingDriver(driver);

    setForm({
      first_name:driver.first_name,
      middle_name:driver.middle_name || "",
      last_name:driver.last_name,
      license_number:driver.license_number,
      contact_number:driver.contact_number,
      email:"",
      password:""
    });

    setShowModal(true);
  }

  async function handleSubmit(){

    try{

      if(editingDriver){

        await adminService.updateDriver(editingDriver.id,{
          first_name:form.first_name,
          middle_name:form.middle_name,
          last_name:form.last_name,
          license_number:form.license_number,
          contact_number:form.contact_number
        });

      }else{

        await adminService.createDriver(form);

      }

      setShowModal(false);
      resetForm();
      loadDrivers();

    }catch(err){
      console.error("Save driver failed",err);
    }

  }

  async function deleteDriver(id:string){

    if(!confirm("Delete this driver?")) return;

    try{
      await adminService.deleteDriver(id);
      loadDrivers();
    }catch(err){
      console.error("Delete failed",err);
    }
  }

  return (
    <div className="p-6 grid grid-cols-4 gap-6 h-full">

      {/* DRIVER CARDS */}
      <div className="col-span-1 bg-green-900 rounded-xl p-4 overflow-y-auto max-h-[80vh]">

        <h2 className="text-white font-semibold mb-4">
          Drivers
        </h2>

        <div className="space-y-3">

          {drivers.map(driver=>(
            <div
              key={driver.id}
              className="bg-white rounded-lg p-3 flex justify-between items-center shadow hover:shadow-md transition"
            >

              <div className="text-sm">

                <div className="font-semibold">
                  {driver.first_name} {driver.last_name}
                </div>

                <div className="text-gray-500 text-xs">
                  License: {driver.license_number}
                </div>

                <div className="text-gray-500 text-xs">
                  Vehicle: {driver.vehicle ?? "No Vehicle"}
                </div>

                <div className="text-gray-500 text-xs">
                  Route: {driver.route ?? "-"}
                </div>

                <div className="text-gray-500 text-xs">
                  Load: {driver.load ?? 0}%
                </div>

              </div>

              <div
                className={`w-3 h-3 rounded-full ${
                  driver.status==="online"
                  ? "bg-green-500"
                  : "bg-red-500"
                }`}
              />

            </div>
          ))}

        </div>
      </div>


      {/* RIGHT SIDE */}
      <div className="col-span-3 flex flex-col gap-6">

        {/* DRIVER TABLE */}
        <div className="bg-green-900 rounded-xl p-5">

          <div className="flex justify-between items-center mb-4">

            <h2 className="text-white text-lg font-semibold">
              Driver List
            </h2>

            <button
              onClick={openAddModal}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              + Add Driver
            </button>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full bg-white rounded-lg overflow-hidden text-sm">

              <thead className="bg-gray-100">
                <tr className="text-left">
                  <th className="p-3">Status</th>
                  <th className="p-3">Driver</th>
                  <th className="p-3">License</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3">Vehicle</th>
                  <th className="p-3">Route</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>

              <tbody>

                {drivers.map(driver=>(
                  <tr
                    key={driver.id}
                    className="border-b hover:bg-gray-50"
                  >

                    <td className="p-3">
                      <span
                        className={`w-3 h-3 rounded-full inline-block ${
                          driver.status==="online"
                          ? "bg-green-500"
                          : "bg-red-500"
                        }`}
                      />
                    </td>

                    <td className="p-3 font-medium">
                      {driver.first_name} {driver.last_name}
                    </td>

                    <td className="p-3">
                      {driver.license_number}
                    </td>

                    <td className="p-3">
                      {driver.contact_number}
                    </td>

                    <td className="p-3">
                      {driver.vehicle ?? "-"}
                    </td>

                    <td className="p-3">
                      {driver.route ?? "-"}
                    </td>

                    <td className="p-3 flex justify-center gap-4">

                      <button
                        onClick={()=>handleEdit(driver)}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </button>

                      <button
                        onClick={()=>deleteDriver(driver.id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>

                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        </div>


        {/* ATTENDANCE PANEL */}
        <div className="bg-green-900 rounded-xl p-6 flex flex-col items-center justify-center text-white h-[220px]">

          <button className="bg-yellow-400 text-black px-5 py-2 rounded-lg mb-4 hover:bg-yellow-500">
            Check Attendance
          </button>

          <h2 className="font-semibold text-lg">
            Attendance Overview
          </h2>

          <p className="text-sm opacity-70 mt-2">
            Monitor driver login and activity
          </p>

        </div>

      </div>


      {/* MODAL */}
      {showModal && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white w-[440px] rounded-xl p-6 space-y-4">

            <h2 className="text-xl font-semibold">
              {editingDriver ? "Edit Driver" : "Add Driver"}
            </h2>

            <div className="grid grid-cols-2 gap-3">

              <input
                placeholder="First Name"
                className="border p-2 rounded"
                value={form.first_name}
                onChange={(e)=>setForm({...form,first_name:e.target.value})}
              />

              <input
                placeholder="Middle Name"
                className="border p-2 rounded"
                value={form.middle_name}
                onChange={(e)=>setForm({...form,middle_name:e.target.value})}
              />

              <input
                placeholder="Last Name"
                className="border p-2 rounded"
                value={form.last_name}
                onChange={(e)=>setForm({...form,last_name:e.target.value})}
              />

              <input
                placeholder="License Number"
                className="border p-2 rounded"
                disabled={!!editingDriver}
                value={form.license_number}
                onChange={(e)=>setForm({...form,license_number:e.target.value})}
              />

              <input
                placeholder="Contact Number"
                className="border p-2 rounded col-span-2"
                value={form.contact_number}
                onChange={(e)=>setForm({...form,contact_number:e.target.value})}
              />

            </div>

            {!editingDriver && (

              <div className="grid grid-cols-2 gap-3">

                <input
                  placeholder="Email"
                  className="border p-2 rounded"
                  value={form.email}
                  onChange={(e)=>setForm({...form,email:e.target.value})}
                />

                <input
                  type="password"
                  placeholder="Password"
                  className="border p-2 rounded"
                  value={form.password}
                  onChange={(e)=>setForm({...form,password:e.target.value})}
                />

              </div>

            )}

            <div className="flex justify-end gap-3 pt-2">

              <button
                onClick={()=>{
                  setShowModal(false);
                  resetForm();
                }}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                {editingDriver ? "Update" : "Save"}
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}