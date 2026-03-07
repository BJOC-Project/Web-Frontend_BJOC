import { useEffect, useRef, useState } from "react";
import {
    Plus,
    UserPlus,
    X,
    MoreVertical,
    Pencil,
    Trash2,
    UserMinus,
    Car
} from "lucide-react";
import { driverService } from "./services/driverService";
import { vehicleService } from "./services/vehicleService";
import SharedMap from "@/features/shared/components/layout/SharedMap";


type Driver = {
    id: string;
    first_name: string;
    middle_name?: string;
    last_name: string;
    email: string;
    contact_number: string;
    license_number: string;
    status: string;
};

type Vehicle = {
    id: string;
    plate_number: string;
    model: string;
    capacity: number;
    status: string;
    driver_id?: string | null;
};

export function AdminDriverVehicleOversight() {

    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);

    const [showDriverModal, setShowDriverModal] = useState(false);
    const [showVehicleModal, setShowVehicleModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);

    const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
    const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
    const [vehicleLocations, setVehicleLocations] = useState<any[]>([]);
    
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [driverMenuOpen, setDriverMenuOpen] = useState<string | null>(null);
    const [vehicleMenuOpen, setVehicleMenuOpen] = useState<string | null>(null);

    const [driverIndex, setDriverIndex] = useState(0);
    const [vehicleIndex, setVehicleIndex] = useState(0);

    const visibleDrivers = drivers.slice(driverIndex, driverIndex + 2);
    const visibleVehicles = vehicles.slice(vehicleIndex, vehicleIndex + 2);

    const defaultCenter = {
        latitude: 14.438853366233266,
        longitude: 120.9607039176618,
    };

    const [driverForm, setDriverForm] = useState({
        first_name: "",
        middle_name: "",
        last_name: "",
        email: "",
        contact_number: "",
        password: "",
        confirm_password: "",
        license_number: "",
        status: "offline"
    });

    const [vehicleForm, setVehicleForm] = useState({
        plate_number: "",
        model: "",
        capacity: 16
    });

    const [assignForm, setAssignForm] = useState({
        driver_id: "",
        vehicle_id: ""
    });

    async function loadDrivers() {
        const data = await driverService.getDrivers();
        setDrivers(data);
    }

    async function loadVehicles() {
        const data = await vehicleService.getVehicles();
        setVehicles(data);
    }

    useEffect(() => {
        loadDrivers();
        loadVehicles();
    }, []);

    async function loadData() {
        try {
          await loadVehicleLocations();
        } catch (error) {
          console.error("Page load error:", error);
        }
      }

    async function loadVehicleLocations() {
        try {
          const locations = await vehicleService.getVehicleLocations();
          setVehicleLocations(locations);
        } catch (error) {
          console.error("Vehicle location load error:", error);
        }
      }

    useEffect(() => {
        loadData();
        const interval = setInterval(loadVehicleLocations, 3000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        function handleClickOutside(event: any) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDriverMenuOpen(null);
                setVehicleMenuOpen(null);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);


    function statusColor(status: string) {

        switch (status) {
            case "driving":
                return "bg-green-500";
            case "offline":
                return "bg-gray-400";
            default:
                return "bg-yellow-500";
        }

    }

    function getAssignedVehicle(driverId: string) {
        const vehicle = vehicles.find(v => v.driver_id === driverId);
        return vehicle
            ? `${vehicle.plate_number} (${vehicle.model})`
            : "No assigned vehicle yet";

    }

    function getAssignedDriver(vehicle: Vehicle) {
        if (!vehicle.driver_id) return "No driver assigned";
        const driver = drivers.find(d => d.id === vehicle.driver_id);
        return driver
            ? `${driver.first_name} ${driver.last_name}`
            : "No driver assigned";

    }

    async function removeAssignmentByVehicle(vehicleId: string) {
        const vehicle = vehicles.find(v => v.id === vehicleId);
        if (!vehicle) return;

        if (!vehicle.driver_id) {
            alert("This vehicle has no driver assigned.");
            return;
        }
        const confirmRemove = confirm(
            `Remove driver from vehicle ${vehicle.plate_number}?`
        );

        if (!confirmRemove) return;
        await vehicleService.updateVehicle(vehicleId, { driver_id: null });
        loadVehicles();

    }

    async function removeAssignmentByDriver(driverId: string) {
        const vehicle = vehicles.find(v => v.driver_id === driverId);
        if (!vehicle) {
            alert("This driver has no assigned vehicle.");
            return;
        }
        const confirmRemove = confirm(
            `Remove vehicle ${vehicle.plate_number} from this driver?`
        );
        if (!confirmRemove) return;
        await vehicleService.updateVehicle(vehicle.id, { driver_id: null });
        loadVehicles();
    }
    async function deleteDriver(id: string) {
        const confirmDelete = confirm("Delete this driver?");
        if (!confirmDelete) return;
        await driverService.deleteDriver(id);
        loadDrivers();
    }

    async function deleteVehicle(id: string) {
        const confirmDelete = confirm("Delete this vehicle?");
        if (!confirmDelete) return;
        await vehicleService.deleteVehicle(id);
        loadVehicles();
    }

    const handleDriverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDriverForm({
            ...driverForm,
            [e.target.name]: e.target.value
        });
    };

    const handleVehicleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setVehicleForm({
            ...vehicleForm,
            [name]: name === "capacity" ? Number(value) : value
        });

    };

    async function saveDriver() {
        if (editingDriver) {
            await driverService.updateDriver(editingDriver.id, driverForm);

        } else {
            if (driverForm.password !== driverForm.confirm_password) {
                alert("Passwords do not match");
                return;
            }
            await driverService.createDriver(driverForm);
        }
        setShowDriverModal(false);
        setEditingDriver(null);
        loadDrivers();
    }

    async function saveVehicle() {
        if (editingVehicle) {
            await vehicleService.updateVehicle(editingVehicle.id, vehicleForm);
        } else {
            await vehicleService.createVehicle(vehicleForm);
        }
        setShowVehicleModal(false);
        setEditingVehicle(null);
        loadVehicles();
    }

    async function assignDriver() {
        if (!assignForm.driver_id || !assignForm.vehicle_id) {
            alert("Please select both a driver and vehicle.");
            return;
        }
        const driver = drivers.find(d => d.id === assignForm.driver_id);
        const vehicle = vehicles.find(v => v.id === assignForm.vehicle_id);

        if (!driver || !vehicle) return;

        const existingVehicle = vehicles.find(
            v => v.driver_id === assignForm.driver_id
        );

        if (existingVehicle) {
            const confirmReplace = confirm(
                `${driver.first_name} ${driver.last_name} is already assigned to vehicle ${existingVehicle.plate_number}. Reassign driver?`
            );
            if (!confirmReplace) return;
            await vehicleService.updateVehicle(existingVehicle.id, {
                driver_id: null
            });
        }

        if (vehicle.driver_id) {
            const assignedDriver = drivers.find(d => d.id === vehicle.driver_id);
            const confirmReplace = confirm(
                `Vehicle ${vehicle.plate_number} already has driver ${assignedDriver?.first_name ?? ""
                }. Replace driver?`
            );

            if (!confirmReplace) return;

        }

        await vehicleService.updateVehicle(assignForm.vehicle_id, {
            driver_id: assignForm.driver_id
        });
        setAssignForm({
            driver_id: "",
            vehicle_id: ""
        });
        setShowAssignModal(false);
        loadVehicles();
    }

    return (
        <div className="p-2 space-y-6">
            <div className="bg-white shadow rounded-xl p-4 h-[400px]">
                <h2 className="text-lg font-semibold mb-3">Fleet Map</h2>

                <div className="w-full h-[330px] rounded overflow-hidden">
                    <SharedMap
                        initialCenter={defaultCenter}
                        bearing={100}
                        initialZoom={11.5}
                        vehicles={vehicleLocations}
                    />
                </div>
            </div>
            <button
                onClick={() => setShowAssignModal(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg"
            >
                <UserPlus size={18} />
                Assign Driver to Modern Jeepney
            </button>
            <div className="grid grid-cols-2 gap-6">
                <div className="bg-white border rounded-xl p-6">
                    <div className="flex justify-between mb-4">
                        <h2 className="font-semibold">
                            Drivers ({drivers.length})
                        </h2>
                        <button
                            onClick={() => {
                                setEditingDriver(null);
                                setShowDriverModal(true);
                            }}
                            className="flex items-center gap-2 border px-3 py-1 rounded"
                        >
                            <Plus size={16} /> Add Driver
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">

                        {visibleDrivers.map(driver => (

                            <div key={driver.id} className="border rounded-xl p-4 relative shadow-sm">

                                <button
                                    className="absolute top-2 right-2"
                                    onClick={() =>
                                        setDriverMenuOpen(driverMenuOpen === driver.id ? null : driver.id)
                                    }
                                >
                                    <MoreVertical size={18} />
                                </button>

                                {driverMenuOpen === driver.id && (
                                    <div
                                        ref={dropdownRef}
                                        className="absolute right-2 top-8 bg-white border rounded-lg shadow-md z-10 w-44"
                                    >
                                        <button
                                            onClick={() => {
                                                setEditingDriver(driver);
                                                setShowDriverModal(true);
                                                setDriverMenuOpen(null);
                                            }}
                                            className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-gray-100"
                                        >
                                            <Pencil size={16} />
                                            Edit Driver
                                        </button>

                                        <button
                                            onClick={() => {
                                                removeAssignmentByDriver(driver.id);
                                                setDriverMenuOpen(null);
                                            }}
                                            className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-yellow-100"
                                        >
                                            <Car size={16} />
                                            Remove Vehicle
                                        </button>

                                        <button
                                            onClick={() => {
                                                deleteDriver(driver.id);
                                                setDriverMenuOpen(null);
                                            }}
                                            className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-red-100 text-red-600"
                                        >
                                            <Trash2 size={16} />
                                            Delete Driver
                                        </button>

                                    </div>
                                )}
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`w-3 h-3 rounded-full ${statusColor(driver.status)}`}></span>
                                    <span className="font-medium">
                                        {driver.first_name} {driver.last_name}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-500">
                                    License: {driver.license_number}
                                </div>
                                <div className="text-sm text-gray-500">
                                    Contact: {driver.contact_number}
                                </div>
                                <div className="text-sm text-gray-500">
                                    Vehicle: {getAssignedVehicle(driver.id)}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-4">
                        <button
                            onClick={() => setDriverIndex((prev) => Math.max(prev - 2, 0))}
                            className="px-3 py-1 border rounded"
                        >
                            Prev
                        </button>

                        <button
                            onClick={() =>
                                setDriverIndex((prev) =>
                                    prev + 2 < drivers.length ? prev + 2 : prev
                                )
                            }
                            className="px-3 py-1 border rounded"
                        >
                            Next
                        </button>
                    </div>
                </div>

                <div className="bg-white border rounded-xl p-6">
                    <div className="flex justify-between mb-4">
                        <h2 className="font-semibold">
                            Vehicles ({vehicles.length})
                        </h2>
                        <button
                            onClick={() => {
                                setEditingVehicle(null);
                                setShowVehicleModal(true);
                            }}
                            className="flex items-center gap-2 border px-3 py-1 rounded"
                        >
                            <Plus size={16} /> Add Vehicle
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {visibleVehicles.map(vehicle => (
                            <div key={vehicle.id} className="border rounded-xl p-4 shadow-sm relative">
                                <button
                                    className="absolute top-2 right-2"
                                    onClick={() =>
                                        setVehicleMenuOpen(vehicleMenuOpen === vehicle.id ? null : vehicle.id)
                                    }
                                >
                                    <MoreVertical size={18} />
                                </button>

                                {vehicleMenuOpen === vehicle.id && (
                                    <div
                                        ref={dropdownRef}
                                        className="absolute right-2 top-8 bg-white border rounded-lg shadow-md z-10 w-44"
                                    >
                                        <button
                                            onClick={() => {
                                                setEditingVehicle(vehicle);
                                                setShowVehicleModal(true);
                                                setVehicleMenuOpen(null);
                                            }}
                                            className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-gray-100"
                                        >
                                            <Pencil size={16} />
                                            Edit Vehicle
                                        </button>

                                        <button
                                            onClick={() => {
                                                removeAssignmentByVehicle(vehicle.id);
                                                setVehicleMenuOpen(null);
                                            }}
                                            className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-yellow-100"
                                        >
                                            <UserMinus size={16} />
                                            Remove Driver
                                        </button>
                                        <button
                                            onClick={() => {
                                                deleteVehicle(vehicle.id);
                                                setVehicleMenuOpen(null);
                                            }}
                                            className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-red-100 text-red-600"
                                        >
                                            <Trash2 size={16} />
                                            Delete Vehicle
                                        </button>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`w-3 h-3 rounded-full ${statusColor(vehicle.status)}`}></span>
                                    <span className="font-medium">
                                        {vehicle.plate_number}
                                    </span>
                                </div>

                                <div className="text-sm text-gray-500">
                                    Model: {vehicle.model}
                                </div>
                                <div className="text-sm text-gray-500">
                                    Capacity: {vehicle.capacity}
                                </div>
                                <div className="text-sm text-gray-500">
                                    Driver: {getAssignedDriver(vehicle)}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-4">
                        <button
                            onClick={() => setVehicleIndex((prev) => Math.max(prev - 2, 0))}
                            className="px-3 py-1 border rounded"
                        >
                            Prev
                        </button>

                        <button
                            onClick={() =>
                                setVehicleIndex((prev) =>
                                    prev + 2 < vehicles.length ? prev + 2 : prev
                                )
                            }
                            className="px-3 py-1 border rounded"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
            {showDriverModal && (

                <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-xl w-[450px] space-y-4">
                        <div className="flex justify-between">
                            <h2 className="font-semibold text-lg">
                                {editingDriver ? "Edit Driver" : "Create Driver"}
                            </h2>
                            <button onClick={() => setShowDriverModal(false)}>
                                <X />
                            </button>
                        </div>
                        <input name="first_name" value={driverForm.first_name} onChange={handleDriverChange} placeholder="First Name" className="border p-2 rounded w-full" />
                        <input name="middle_name" value={driverForm.middle_name} onChange={handleDriverChange} placeholder="Middle Name" className="border p-2 rounded w-full" />
                        <input name="last_name" value={driverForm.last_name} onChange={handleDriverChange} placeholder="Last Name" className="border p-2 rounded w-full" />
                        <input name="email" value={driverForm.email} onChange={handleDriverChange} placeholder="Email" className="border p-2 rounded w-full" />
                        <input name="contact_number" value={driverForm.contact_number} onChange={handleDriverChange} placeholder="Contact Number" className="border p-2 rounded w-full" />
                        {!editingDriver && (
                            <>
                                <input name="password" value={driverForm.password} onChange={handleDriverChange} type="password" placeholder="Password" className="border p-2 rounded w-full" />
                                <input name="confirm_password" value={driverForm.confirm_password} onChange={handleDriverChange} type="password" placeholder="Confirm Password" className="border p-2 rounded w-full" />
                            </>
                        )}
                        <input name="license_number" value={driverForm.license_number} onChange={handleDriverChange} placeholder="License Number" className="border p-2 rounded w-full" />

                        <button
                            onClick={saveDriver}
                            className="w-full bg-blue-600 text-white py-2 rounded-lg"
                        >
                            {editingDriver ? "Update Driver" : "Create Driver"}
                        </button>
                    </div>
                </div>
            )}
            {showVehicleModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-xl w-[420px] space-y-4">
                        <div className="flex justify-between">
                            <h2 className="font-semibold text-lg">
                                {editingVehicle ? "Edit Vehicle" : "Create Vehicle"}
                            </h2>
                            <button onClick={() => setShowVehicleModal(false)}>
                                <X />
                            </button>
                        </div>
                        <input name="plate_number" value={vehicleForm.plate_number} onChange={handleVehicleChange} placeholder="Plate Number" className="border p-2 rounded w-full" />
                        <input name="model" value={vehicleForm.model} onChange={handleVehicleChange} placeholder="Model" className="border p-2 rounded w-full" />
                        <input name="capacity" value={vehicleForm.capacity} onChange={handleVehicleChange} type="number" placeholder="Capacity" className="border p-2 rounded w-full" />
                        <button
                            onClick={saveVehicle}
                            className="w-full bg-blue-600 text-white py-2 rounded-lg"
                        >
                            {editingVehicle ? "Update Vehicle" : "Create Vehicle"}
                        </button>
                    </div>
                </div>
            )}
            {showAssignModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-xl w-[420px] space-y-4">
                        <div className="flex justify-between">
                            <h2 className="font-semibold">Assign Driver</h2>
                            <button onClick={() => setShowAssignModal(false)}>
                                <X />
                            </button>
                        </div>

                        <select
                            className="border p-2 rounded w-full"
                            value={assignForm.driver_id}
                            onChange={(e) =>
                                setAssignForm({ ...assignForm, driver_id: e.target.value })
                            }
                        >
                            <option value="">Select Driver</option>

                            {drivers.map(d => (
                                <option key={d.id} value={d.id}>
                                    {d.first_name} {d.last_name}
                                </option>
                            ))}

                        </select>

                        <select
                            className="border p-2 rounded w-full"
                            value={assignForm.vehicle_id}
                            onChange={(e) =>
                                setAssignForm({ ...assignForm, vehicle_id: e.target.value })
                            }
                        >
                            <option value="">Select Vehicle</option>

                            {vehicles.map(v => (
                                <option key={v.id} value={v.id}>
                                    {v.plate_number} - {v.model}
                                </option>
                            ))}

                        </select>

                        <button
                            onClick={assignDriver}
                            className="w-full bg-blue-600 text-white py-2 rounded-lg"
                        >
                            Assign
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
