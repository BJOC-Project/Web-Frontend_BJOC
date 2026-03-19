import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { useLoading } from "@/features/shared/context/LoadingContext";

import { vehicleService } from "./services/vehicleService";
import { tripsService } from "./services/tripsService";
import { routesService } from "./services/routesService";

import { FleetVehicleCard } from "./modal/FleetVehicleCard";
import { ActiveTripsTable } from "./modal/ActiveTripsTable";
import { TripHistoryCard } from "./modal/TripHistoryCard";
import { DispatchTripModal } from "./modal/DispatchTripModal";
import { RescheduleTripModal } from "./modal/RescheduleTripModal";
import { ConfirmTripModal } from "./modal/ConfirmTripModal";

export function AdminTrips() {

    const navigate = useNavigate();
    const { showLoading, hideLoading } = useLoading();

    const [vehicles, setVehicles] = useState<any[]>([]);
    const [activeTrips, setActiveTrips] = useState<any[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [routes, setRoutes] = useState<any[]>([]);

    const [dispatchOpen, setDispatchOpen] = useState(false);
    const [rescheduleOpen, setRescheduleOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
    const [selectedTrip, setSelectedTrip] = useState<any>(null);

    const [confirmScheduleOpen, setConfirmScheduleOpen] = useState(false);
    const [pendingVehicle, setPendingVehicle] = useState<any>(null);

    const [confirmAction, setConfirmAction] = useState<
        "cancel" | "reschedule" | null
    >(null);

    const loadingRef = useRef(false);

    const load = async (withLoading = false) => {

        if (loadingRef.current) return;

        loadingRef.current = true;

        if (withLoading) showLoading();

        try {

            const [v, a, h, r] = await Promise.all([
                vehicleService.getVehicles(),
                tripsService.getActiveTrips(),
                tripsService.getTripHistory(),
                routesService.getRoutes()
            ]);

            setRoutes(r ?? []);
            setActiveTrips(a ?? []);
            setHistory(h ?? []);

            const enriched = (v ?? []).map((veh: any) => {

                const scheduledTrip = (a ?? []).find(
                    (t: any) =>
                        t.vehicle_id === veh.id &&
                        t.status === "scheduled"
                );

                const ongoingTrip = (a ?? []).find(
                    (t: any) =>
                        t.vehicle_id === veh.id &&
                        t.status === "ongoing"
                );

                const tripsToday = (h ?? []).filter(
                    (t: any) => t.vehicle_id === veh.id
                ).length;

                return {
                    ...veh,
                    scheduled: !!scheduledTrip,
                    ongoing: !!ongoingTrip,
                    available: !scheduledTrip && !ongoingTrip,
                    trips_today: tripsToday
                };

            });

            setVehicles(enriched);

        } catch (err) {

            console.error("Trips load error:", err);

        } finally {

            if (withLoading) hideLoading();

            loadingRef.current = false;

        }

    };

    useEffect(() => {

        load(true);

        const interval = setInterval(() => load(false), 15000);

        return () => clearInterval(interval);

    }, []);

    const openDispatch = (vehicle: any) => {

        if (vehicle.ongoing) {
            alert("Vehicle is currently on a trip.");
            return;
        }

        if (vehicle.scheduled) {

            setPendingVehicle(vehicle);
            setConfirmScheduleOpen(true);
            return;

        }

        setSelectedVehicle(vehicle);
        setDispatchOpen(true);

    };

    const cancelTrip = (trip: any) => {
        setSelectedTrip(trip);
        setConfirmAction("cancel");
        setConfirmOpen(true);
    };

    const rescheduleTrip = (trip: any) => {

        setSelectedTrip(trip);
        setRescheduleOpen(true);

    };

    return (

        <div className="p-3 h-[calc(90vh-80px)] flex flex-col">
            <div className="flex flex-col">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="font-medium">
                        Recent Trip History
                    </h2>
                    <button
                        onClick={() => navigate("/admin/trips/history")}
                        className="text-xs text-blue-600 hover:underline"
                    >
                        View All
                    </button>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2">

                    {history.length === 0 && (
                        <p className="text-xs text-gray-400">
                            No trip history yet
                        </p>
                    )}

                    {history.slice(0, 10).map(t => (
                        <div key={t.id} className="min-w-[320px]">
                            <TripHistoryCard trip={t} />
                        </div>
                    ))}

                </div>

            </div>

            <div className="grid grid-cols-[1.5fr_2.5fr] gap-4 flex-1 overflow-hidden mt-2">

                {/* TRIP SCHEDULING */}
                <div className="flex flex-col overflow-hidden">

                    <h2 className="font-medium mb-2">
                        Trip Scheduling
                    </h2>

                    <div className="grid grid-cols-2 gap-2 overflow-y-auto pr-1">

                        {vehicles.length === 0 && (
                            <p className="text-xs text-gray-400">
                                No vehicles available
                            </p>
                        )}

                        {vehicles.map(v => (
                            <FleetVehicleCard
                                key={v.id}
                                vehicle={v}
                                onDispatch={openDispatch}
                            />
                        ))}

                    </div>

                </div>

                {/* ACTIVE TRIPS */}
                <ActiveTripsTable
                    trips={activeTrips}
                    onCancel={cancelTrip}
                    onReschedule={rescheduleTrip}
                />

            </div>

            {/* MODALS */}

            <DispatchTripModal
                open={dispatchOpen}
                vehicle={selectedVehicle}
                routes={routes}
                onClose={() => setDispatchOpen(false)}
                onSuccess={() => load(false)}
            />

            <RescheduleTripModal
                open={rescheduleOpen}
                trip={selectedTrip}
                onClose={() => setRescheduleOpen(false)}
                onSuccess={() => load(false)}
            />

            <ConfirmTripModal
                open={confirmOpen}
                trip={selectedTrip}
                action={confirmAction}
                onClose={() => setConfirmOpen(false)}
                onSuccess={() => load(false)}
            />
            {confirmScheduleOpen && pendingVehicle && (

                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">

                    <div className="bg-white p-6 rounded-lg w-[360px] space-y-4">

                        <h3 className="font-semibold text-sm">
                            Vehicle Already Scheduled
                        </h3>

                        <p className="text-xs text-gray-600">
                            This vehicle already has a scheduled trip.
                            Do you want to create another schedule?
                        </p>

                        <div className="flex justify-end gap-2">

                            <button
                                onClick={() => {
                                    setConfirmScheduleOpen(false);
                                    setPendingVehicle(null);
                                }}
                                className="border px-3 py-1 rounded text-sm"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={() => {

                                    setConfirmScheduleOpen(false);
                                    setSelectedVehicle(pendingVehicle);
                                    setDispatchOpen(true);
                                    setPendingVehicle(null);

                                }}
                                className="bg-orange-600 text-white px-3 py-1 rounded text-sm"
                            >
                                Continue
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>

    );

}