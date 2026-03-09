import { useEffect, useRef, useState } from "react";
import {
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
    const [assignMode, setAssignMode] = useState<"driver" | "vehicle" | null>(null);

    const [driverIndex, setDriverIndex] = useState(0);
    const [vehicleIndex, setVehicleIndex] = useState(0);

    const visibleDrivers = drivers.slice(driverIndex, driverIndex + 2);
    const visibleVehicles = vehicles.slice(vehicleIndex, vehicleIndex + 2);

    const [confirmModal, setConfirmModal] = useState({
        open: false,
        title: "",
        message: "",
        action: () => { }
    });

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

    function removeAssignmentByVehicle(vehicleId: string) {
        const vehicle = vehicles.find(v => v.id === vehicleId);
        if (!vehicle) return;
        if (!vehicle.driver_id) {
            setConfirmModal({
                open: true,
                title: "No Driver Assigned",
                message: "This vehicle has no driver assigned.",
                action: () => {
                    setConfirmModal(prev => ({ ...prev, open: false }));
                }
            });
            return;
        }
        setConfirmModal({
            open: true,
            title: "Remove Driver",
            message: `Remove driver from vehicle ${vehicle.plate_number}?`,
            action: async () => {
                await vehicleService.updateVehicle(vehicleId, { driver_id: null });
                loadVehicles();
                setConfirmModal(prev => ({ ...prev, open: false }));
            }
        });
    }

    function removeAssignmentByDriver(driverId: string) {
        const vehicle = vehicles.find(v => v.driver_id === driverId);
        if (!vehicle) {
            setConfirmModal({
                open: true,
                title: "No Vehicle Assigned",
                message: "This driver has no assigned vehicle.",
                action: () => {
                    setConfirmModal(prev => ({ ...prev, open: false }));
                }
            });
            return;
        }
        setConfirmModal({
            open: true,
            title: "Remove Vehicle",
            message: `Remove vehicle ${vehicle.plate_number} from this driver?`,
            action: async () => {
                await vehicleService.updateVehicle(vehicle.id, { driver_id: null });
                loadVehicles();
                setConfirmModal(prev => ({ ...prev, open: false }));
            }
        });
    }
    function deleteDriver(id: string) {
        setConfirmModal({
            open: true,
            title: "Delete Driver",
            message: "Are you sure you want to delete this driver?",
            action: async () => {
                await driverService.deleteDriver(id);
                loadDrivers();
                setConfirmModal({ ...confirmModal, open: false });
            }
        });

    }

    function deleteVehicle(id: string) {
        setConfirmModal({
            open: true,
            title: "Delete Vehicle",
            message: "Are you sure you want to delete this vehicle?",
            action: async () => {
                await vehicleService.deleteVehicle(id);
                loadVehicles();
                setConfirmModal(prev => ({ ...prev, open: false }));
            }
        });
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

        if (
            !driverForm.first_name.trim() ||
            !driverForm.last_name.trim() ||
            !driverForm.email.trim() ||
            !driverForm.contact_number.trim() ||
            !driverForm.license_number.trim()
        ) {
            setConfirmModal({
                open: true,
                title: "Missing Fields",
                message: "Please fill in all required fields.",
                action: () => {
                    setConfirmModal(prev => ({ ...prev, open: false }));
                }
            });
        }

        if (!editingDriver) {

            if (!driverForm.password || !driverForm.confirm_password) {
                setConfirmModal({
                    open: true,
                    title: "Password Required",
                    message: "Please enter password and confirm password.",
                    action: () => {
                        setConfirmModal(prev => ({ ...prev, open: false }));
                    }
                });
            }

            if (driverForm.password !== driverForm.confirm_password) {
                setConfirmModal({
                    open: true,
                    title: "Password Mismatch",
                    message: "Passwords do not match.",
                    action: () => {
                        setConfirmModal(prev => ({ ...prev, open: false }));
                    }
                }); alert("Passwords do not match.");
                return;
            }
        }

        if (editingDriver) {
            setConfirmModal({
                open: true,
                title: "Update Driver",
                message: "Are you sure you want to update this driver?",
                action: async () => {
                    await driverService.updateDriver(editingDriver.id, driverForm);
                    loadDrivers();
                    setShowDriverModal(false);
                    setEditingDriver(null);
                    setConfirmModal({ ...confirmModal, open: false });
                }
            });

            return;
        } else {
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
            setConfirmModal({
                open: true,
                title: "Incomplete Selection",
                message: "Please select both a driver and vehicle.",
                action: () => {
                    setConfirmModal(prev => ({ ...prev, open: false }));
                }
            });

            return;
        }
        const driver = drivers.find(d => d.id === assignForm.driver_id);
        const vehicle = vehicles.find(v => v.id === assignForm.vehicle_id);

        if (!driver || !vehicle) return;

        const existingVehicle = vehicles.find(
            v => v.driver_id === assignForm.driver_id
        );

        if (existingVehicle) {

            setConfirmModal({
                open: true,
                title: "Driver Already Assigned",
                message: `${driver.first_name} ${driver.last_name} is already assigned to vehicle ${existingVehicle.plate_number}. Reassign driver?`,
                action: async () => {
                    await vehicleService.updateVehicle(existingVehicle.id, {
                        driver_id: null
                    });
                    await vehicleService.updateVehicle(assignForm.vehicle_id, {
                        driver_id: assignForm.driver_id
                    });
                    setAssignForm({
                        driver_id: "",
                        vehicle_id: ""
                    });
                    setShowAssignModal(false);
                    loadVehicles();
                    setConfirmModal(prev => ({ ...prev, open: false }));
                }
            });
            return;
        }

        if (vehicle.driver_id) {
            const assignedDriver = drivers.find(d => d.id === vehicle.driver_id);
            setConfirmModal({
                open: true,
                title: "Vehicle Already Assigned",
                message: `Vehicle ${vehicle.plate_number} already has driver ${assignedDriver?.first_name ?? ""}. Replace driver?`,
                action: async () => {
                    await vehicleService.updateVehicle(assignForm.vehicle_id, {
                        driver_id: assignForm.driver_id
                    });

                    setAssignForm({
                        driver_id: "",
                        vehicle_id: ""
                    });

                    setShowAssignModal(false);
                    loadVehicles();
                    setConfirmModal(prev => ({ ...prev, open: false }));
                }
            });
            return;

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
        <div className="p-2">
            <div className="bg-green-100 shadow-lg rounded-xl p-4 h-[400px]">
                <h2 className="text-lg font-semibold mb-3">Fleet Map</h2>
                <div className="w-full h-[330px] rounded-xl overflow-hidden relative z-0">
                    <SharedMap
                        initialCenter={defaultCenter}
                        bearing={100}
                        initialZoom={11.5}
                        vehicles={vehicleLocations}
                    />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4 ">
                <div className="bg-green-100 border rounded-xl py-6 px-4 shadow-lg">
                    <div className="flex justify-between mb-4">
                        <h2 className="font-semibold">
                            Drivers ({drivers.length})
                        </h2>
                        <button
                            onClick={() => {
                                setEditingDriver(null);
                                setDriverForm({
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
                                setShowDriverModal(true);
                            }}
                            className="flex items-center gap-2 bg-orange-600 text-white px-4 py-1 rounded-lg hover:bg-orange-700 transition shadow-sm hover:shadow-md"
                        >
                            <UserPlus size={18} />
                            Add Driver
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">

                        {visibleDrivers.map((driver: Driver) => (

                            <div key={driver.id} className="rounded-xl p-6 bg-white/50 backdrop-blur-lg border border-white/20 shadow-xl">

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
                                                setDriverForm({
                                                    first_name: driver.first_name ?? "",
                                                    middle_name: driver.middle_name ?? "",
                                                    last_name: driver.last_name ?? "",
                                                    email: driver.email ?? "",
                                                    contact_number: driver.contact_number ?? "",
                                                    password: "",
                                                    confirm_password: "",
                                                    license_number: driver.license_number ?? "",
                                                    status: driver.status ?? "offline"
                                                });
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

                                <div className="flex gap-2 mt-3">
                                    <button
                                        onClick={() => {
                                            setAssignMode("driver");

                                            setAssignForm({
                                                driver_id: driver.id,
                                                vehicle_id: ""
                                            });

                                            setShowAssignModal(true);
                                        }}
                                        className="flex items-center gap-1 text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
                                    >
                                        <Car size={14} />
                                        Assign Vehicle
                                    </button>

                                    <button
                                        onClick={() => removeAssignmentByDriver(driver.id)}
                                        className="flex items-center gap-1 text-xs bg-yellow-500 text-white px-3 py-1 rounded"
                                    >
                                        <UserMinus size={14} />
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-4">
                        <button
                            onClick={() => setDriverIndex((prev) => Math.max(prev - 2, 0))}
                            className="px-3 py-1 border bg-gray-50 rounded hover:shadow-xl transition"
                        >
                            Prev
                        </button>

                        <button
                            onClick={() =>
                                setDriverIndex((prev) =>
                                    prev + 2 < drivers.length ? prev + 2 : prev
                                )
                            }
                            className="px-3 py-1 border bg-gray-50 rounded hover:shadow-xl transition"
                        >
                            Next
                        </button>
                    </div>
                </div>

                <div className="bg-green-100 border rounded-xl py-6 px-4 shadow-lg">
                    <div className="flex justify-between mb-4">
                        <h2 className="font-semibold">
                            Vehicles ({vehicles.length})
                        </h2>
                        <button
                            onClick={() => {
                                setEditingVehicle(null);
                                setVehicleForm({
                                    plate_number: "",
                                    model: "",
                                    capacity: 20
                                });
                                setShowVehicleModal(true);
                            }}
                            className="flex items-center gap-2 bg-green-600 text-white px-4 py-1 rounded-lg
                                        hover:bg-green-700 transition shadow-sm hover:shadow-md"
                        >
                            <Car size={18} />
                            Add Vehicle
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {visibleVehicles.map(vehicle => (
                            <div key={vehicle.id} className="rounded-xl p-6 bg-white/50 backdrop-blur-lg border border-white/20 shadow-xl">
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
                                                setVehicleForm({
                                                    plate_number: vehicle.plate_number ?? "",
                                                    model: vehicle.model ?? "",
                                                    capacity: vehicle.capacity ?? 16
                                                });
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

                                <div className="flex gap-2 mt-3">

                                    <button
                                        onClick={() => {
                                            setAssignMode("vehicle");

                                            setAssignForm({
                                                driver_id: "",
                                                vehicle_id: vehicle.id
                                            });

                                            setShowAssignModal(true);
                                        }}
                                        className="flex items-center gap-1 text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
                                    >
                                        <UserPlus size={14} />
                                        Assign Driver
                                    </button>

                                    <button
                                        onClick={() => removeAssignmentByVehicle(vehicle.id)}
                                        className="flex items-center gap-1 text-xs bg-yellow-500 text-white px-3 py-1 rounded"
                                    >
                                        <UserMinus size={14} />
                                        Remove
                                    </button>

                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-4">
                        <button
                            onClick={() => setVehicleIndex((prev) => Math.max(prev - 2, 0))}
                            className="px-3 py-1 border bg-gray-50 rounded hover:shadow-xl transition"
                        >
                            Prev
                        </button>

                        <button
                            onClick={() =>
                                setVehicleIndex((prev) =>
                                    prev + 2 < vehicles.length ? prev + 2 : prev
                                )
                            }
                            className="px-3 py-1 border bg-gray-50 rounded hover:shadow-xl transition"
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
                        {editingDriver && (
                            <>
                                <input
                                    name="password"
                                    value={driverForm.password}
                                    onChange={handleDriverChange}
                                    type="password"
                                    placeholder="New Password (optional)"
                                    className="border p-2 rounded w-full"
                                />

                                <input
                                    name="confirm_password"
                                    value={driverForm.confirm_password}
                                    onChange={handleDriverChange}
                                    type="password"
                                    placeholder="Confirm New Password"
                                    className="border p-2 rounded w-full"
                                />
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
                        <div className="flex justify-between items-center">
                            <h2 className="font-semibold text-lg">
                                Assign
                            </h2>
                            <button onClick={() => setShowAssignModal(false)}>
                                <X />
                            </button>
                        </div>

                        {assignMode === "driver" && (() => {
                            const driver = drivers.find(d => d.id === assignForm.driver_id);
                            if (!driver) return null;
                            return (
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                                        {driver.first_name.charAt(0)}
                                    </div>

                                    <div>
                                        <div className="font-medium">
                                            {driver.first_name} {driver.last_name}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            License: {driver.license_number}
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        {assignMode === "vehicle" && (() => {

                            const vehicle = vehicles.find(v => v.id === assignForm.vehicle_id);
                            if (!vehicle) return null;

                            return (
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                                    <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center">
                                        <Car size={18} />
                                    </div>
                                    <div>
                                        <div className="font-medium">
                                            {vehicle.plate_number}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {vehicle.model} • Capacity {vehicle.capacity}
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        {assignMode === "vehicle" && (

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
                        )}

                        {assignMode === "driver" && (

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
                        )}
                        <button
                            onClick={assignDriver}
                            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                        >
                            Assign
                        </button>
                    </div>
                </div>
            )}
            {confirmModal.open && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

                    <div className="bg-white rounded-xl shadow-xl w-[400px] p-6 space-y-4">

                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-semibold">{confirmModal.title}</h2>
                            <button
                                onClick={() =>
                                    setConfirmModal({ ...confirmModal, open: false })
                                }
                            >
                                <X />
                            </button>
                        </div>

                        <p className="text-sm text-gray-600">
                            {confirmModal.message}
                        </p>

                        <div className="flex justify-end gap-3 pt-2">

                            <button
                                onClick={() =>
                                    setConfirmModal({ ...confirmModal, open: false })
                                }
                                className="px-4 py-1.5 border rounded-lg hover:bg-gray-100"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={confirmModal.action}
                                className="px-4 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
