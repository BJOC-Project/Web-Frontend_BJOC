import { useEffect, useState } from "react";
import { X } from "lucide-react";
import SharedMap from "@/features/shared/components/layout/SharedMap";

import { driverService } from "./services/driverService";
import { vehicleService } from "./services/vehicleService";

import {
    DriverCard,
    VehicleCard,
    DriverModal,
    VehicleModal,
    AssignModal,
    ConfirmModal
} from "@/features";

export type Driver = {
    id: string;
    first_name: string;
    last_name: string;
    license_number: string;
    contact_number: string;
    email: string;
    status: string;
};

export type Vehicle = {
    id: string;
    plate_number: string;
    model: string;
    capacity: number;
    driver_id?: string | null;
    status: string;
};

export function AdminDriverVehicleOversight() {

    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);

    const [vehicleLocations, setVehicleLocations] = useState<any[]>([]);

    const [showDriverModal, setShowDriverModal] = useState(false);
    const [showVehicleModal, setShowVehicleModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showMapModal, setShowMapModal] = useState(false);

    const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
    const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

    const [assignMode, setAssignMode] = useState<"driver" | "vehicle" | null>(null);

    const [assignForm, setAssignForm] = useState({
        driver_id: "",
        vehicle_id: ""
    });

    const [driverForm, setDriverForm] = useState({
        first_name: "",
        last_name: "",
        email: "",
        contact_number: "",
        license_number: "",
        password: "",
        confirm_password: "",
        status: "offline"
    });

    const [vehicleForm, setVehicleForm] = useState({
        plate_number: "",
        model: "",
        capacity: 16
    });

    const [confirmModal, setConfirmModal] = useState({
        open: false,
        title: "",
        message: "",
        action: () => { }
    });

    const defaultCenter = {
        latitude: 14.41263339062224,
        longitude: 120.95675506640023
    };

    async function loadDrivers() {
        const data = await driverService.getDrivers();
        setDrivers(data);
    }

    async function loadVehicles() {
        const data = await vehicleService.getVehicles();
        setVehicles(data);
    }

    async function loadVehicleLocations() {
        const data = await vehicleService.getVehicleLocations();
        setVehicleLocations(data);
    }

    useEffect(() => {
        loadDrivers();
        loadVehicles();
        loadVehicleLocations();

        const interval = setInterval(loadVehicleLocations, 3000);
        return () => clearInterval(interval);
    }, []);

    function confirm(title: string, message: string, action: () => void) {
        setConfirmModal({
            open: true,
            title,
            message,
            action
        });
    }

    function deleteDriver(id: string) {
        confirm(
            "Delete Driver",
            "Are you sure you want to delete this driver?",
            async () => {
                await driverService.deleteDriver(id);
                loadDrivers();
            }
        );
    }

    function deleteVehicle(id: string) {
        confirm(
            "Delete Vehicle",
            "Are you sure you want to delete this vehicle?",
            async () => {
                await vehicleService.deleteVehicle(id);
                loadVehicles();
            }
        );
    }

    async function saveDriver() {

        if (editingDriver) {
            await driverService.updateDriver(editingDriver.id, driverForm);
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

        await vehicleService.updateVehicle(assignForm.vehicle_id, {
            driver_id: assignForm.driver_id
        });

        setAssignForm({ driver_id: "", vehicle_id: "" });
        setShowAssignModal(false);

        loadVehicles();
    }

    return (

        <div className="p-4 h-full flex flex-col">

            <div className="grid grid-cols-[1fr_1fr_0.6fr] gap-3 h-full">

                {/* DRIVERS PANEL */}
                <div className="bg-white border rounded-xl p-2 flex flex-col">
                    <div className="flex justify-between m-2 justify-center">
                        <h2 className="font-semibold">
                            Drivers ({drivers.length})
                        </h2>
                        <button
                            onClick={() => {
                                setEditingDriver(null);
                                setDriverForm({
                                    first_name: "",
                                    last_name: "",
                                    email: "",
                                    contact_number: "",
                                    license_number: "",
                                    password: "",
                                    confirm_password: "",
                                    status: "offline"
                                });
                                setShowDriverModal(true);
                            }}
                            className="bg-orange-600 text-white px-3 py-1 rounded hover:bg-orange-700"
                        >
                            Add Driver
                        </button>

                    </div>

                    <div className="flex flex-col gap-3 overflow-y-auto pr-1 p-2">

                        {drivers.map(driver => (
                            <DriverCard
                                key={driver.id}
                                driver={driver}
                                vehicles={vehicles}
                                onEdit={() => {
                                    setEditingDriver(driver);
                                    setDriverForm({
                                        first_name: driver.first_name,
                                        last_name: driver.last_name,
                                        email: driver.email,
                                        contact_number: driver.contact_number,
                                        license_number: driver.license_number,
                                        password: "",
                                        confirm_password: "",
                                        status: driver.status
                                    });
                                    setShowDriverModal(true);
                                }}
                                onDelete={() => deleteDriver(driver.id)}
                                onAssign={() => {
                                    setAssignMode("driver");
                                    setAssignForm({ driver_id: driver.id, vehicle_id: "" });
                                    setShowAssignModal(true);
                                }}
                            />
                        ))}

                    </div>

                </div>

                {/* VEHICLES PANEL */}
                <div className="bg-white border rounded-xl p-2 flex flex-col">
                    <div className="flex justify-between m-2 justify-center">
                        <h2 className="font-semibold">
                            Vehicles ({vehicles.length})
                        </h2>

                        <button
                            onClick={() => {
                                setEditingVehicle(null);
                                setVehicleForm({
                                    plate_number: "",
                                    model: "",
                                    capacity: 16
                                });
                                setShowVehicleModal(true);
                            }}
                            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                        >
                            Add Vehicle
                        </button>

                    </div>

                    <div className="flex flex-col gap-3 overflow-y-auto pr-1 p-2">

                        {vehicles.map(vehicle => (
                            <VehicleCard
                                key={vehicle.id}
                                vehicle={vehicle}
                                drivers={drivers}
                                onEdit={() => {
                                    setEditingVehicle(vehicle);
                                    setVehicleForm({
                                        plate_number: vehicle.plate_number,
                                        model: vehicle.model,
                                        capacity: vehicle.capacity
                                    });
                                    setShowVehicleModal(true);
                                }}
                                onDelete={() => deleteVehicle(vehicle.id)}
                                onAssign={() => {
                                    setAssignMode("vehicle");
                                    setAssignForm({ driver_id: "", vehicle_id: vehicle.id });
                                    setShowAssignModal(true);
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* MINI MAP PANEL */}
                <div className="bg-white border rounded-xl p-1 flex flex-col">

                    <h2 className="font-semibold m-1 text-center">
                        FLEET MAP
                    </h2>

                    <div
                        className="relative flex-1 w-full rounded-xl overflow-hidden cursor-pointer group"
                        onClick={() => setShowMapModal(true)}
                    >

                        <div className="absolute inset-0">

                            <SharedMap
                                initialCenter={defaultCenter}
                                initialZoom={11}
                                vehicles={vehicleLocations}
                            />

                        </div>

                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">

                            <span className="text-white bg-black/60 px-4 py-2 rounded-lg text-sm">
                                Click to expand map
                            </span>

                        </div>

                    </div>

                </div>
            </div>

            {showMapModal && (

                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

                    <div className="bg-white rounded-xl p-4 w-[95%] h-[90%] flex flex-col">

                        <div className="flex justify-between items-center mb-3">

                            <h2 className="font-semibold text-lg">
                                Fleet Map
                            </h2>

                            <button onClick={() => setShowMapModal(false)}>
                                <X />
                            </button>

                        </div>

                        <div className="flex-1 rounded-xl overflow-hidden">
                            <SharedMap
                                initialCenter={defaultCenter}
                                bearing={100}
                                initialZoom={12}
                                vehicles={vehicleLocations}
                            />
                        </div>
                    </div>
                </div>
            )}

            <DriverModal
                open={showDriverModal}
                form={driverForm}
                setForm={setDriverForm}
                onSave={saveDriver}
                onClose={() => setShowDriverModal(false)}
            />

            <VehicleModal
                open={showVehicleModal}
                form={vehicleForm}
                setForm={setVehicleForm}
                onSave={saveVehicle}
                onClose={() => setShowVehicleModal(false)}
            />

            <AssignModal
                open={showAssignModal}
                drivers={drivers}
                vehicles={vehicles}
                mode={assignMode}
                form={assignForm}
                setForm={setAssignForm}
                onAssign={assignDriver}
                onClose={() => setShowAssignModal(false)}
            />

            <ConfirmModal
                modal={confirmModal}
                setModal={setConfirmModal}
            />

        </div>

    );
}