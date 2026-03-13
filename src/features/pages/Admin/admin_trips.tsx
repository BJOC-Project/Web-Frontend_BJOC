import { useEffect, useState, useRef } from "react";
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

    const [vehicles, setVehicles] = useState<any[]>([]);
    const [activeTrips, setActiveTrips] = useState<any[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [routes, setRoutes] = useState<any[]>([]);

    const [dispatchOpen, setDispatchOpen] = useState(false);
    const [rescheduleOpen, setRescheduleOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
    const [selectedTrip, setSelectedTrip] = useState<any>(null);

    const [confirmAction, setConfirmAction] = useState<
        "cancel" | "end" | "reschedule" | null
    >(null);

    const loadingRef = useRef(false);

    const load = async () => {

        if (loadingRef.current) return;

        loadingRef.current = true;

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

                const waitingTrip = (a ?? []).find(
                    (t: any) => t.vehicle_id === veh.id && t.status === "waiting"
                );

                const ongoingTrip = (a ?? []).find(
                    (t: any) => t.vehicle_id === veh.id && t.status === "ongoing"
                );

                const tripsToday = (h ?? []).filter(
                    (t: any) => t.vehicle_id === veh.id
                ).length;

                return {
                    ...veh,
                    waiting: !!waitingTrip,
                    ongoing: !!ongoingTrip,
                    available: !waitingTrip && !ongoingTrip,
                    trips_today: tripsToday
                };

            });

            setVehicles(enriched);

        } catch (err) {

            console.error("Trips load error:", err);

        }

        loadingRef.current = false;

    };

    useEffect(() => {

        load();

        const interval = setInterval(load, 10000);

        return () => clearInterval(interval);

    }, []);

    const openDispatch = (vehicle: any) => {

        if (vehicle.waiting || vehicle.ongoing) return;

        setSelectedVehicle(vehicle);
        setDispatchOpen(true);

    };

    const cancelTrip = (trip: any) => {

        setSelectedTrip(trip);
        setConfirmAction("cancel");
        setConfirmOpen(true);

    };

    const endTrip = (trip: any) => {

        setSelectedTrip(trip);
        setConfirmAction("end");
        setConfirmOpen(true);

    };

    const rescheduleTrip = (trip: any) => {

        setSelectedTrip(trip);
        setRescheduleOpen(true);

    };

    return (

        <div className="p-3 h-[calc(100vh-80px)] flex flex-col">

            <h1 className="text-xl font-semibold mb-3">
                Trips / Operations
            </h1>

            <div className="grid grid-cols-[1.5fr_2fr_1fr] gap-4 flex-1 overflow-hidden">

                <div className="flex flex-col overflow-hidden">

                    <h2 className="font-medium mb-2">
                        Fleet Dispatch
                    </h2>

                    <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-2 gap-2 overflow-y-auto pr-1">

                        {vehicles.map(v => (
                            <FleetVehicleCard
                                key={v.id}
                                vehicle={v}
                                onDispatch={() => openDispatch(v)}
                            />
                        ))}

                    </div>

                </div>

                <ActiveTripsTable
                    trips={activeTrips}
                    onCancel={cancelTrip}
                    onEnd={endTrip}
                    onReschedule={rescheduleTrip}
                />

                <div className="flex flex-col overflow-hidden">

                    <h2 className="font-medium mb-2">
                        Trip History
                    </h2>

                    <div className="space-y-2 overflow-y-auto pr-1">

                        {history.map(t => (
                            <TripHistoryCard
                                key={t.id}
                                trip={t}
                            />
                        ))}

                    </div>

                </div>

            </div>

            <DispatchTripModal
                open={dispatchOpen}
                vehicle={selectedVehicle}
                routes={routes}
                onClose={() => setDispatchOpen(false)}
                onSuccess={load}
            />

            <RescheduleTripModal
                open={rescheduleOpen}
                trip={selectedTrip}
                onClose={() => setRescheduleOpen(false)}
                onSuccess={load}
            />

            <ConfirmTripModal
                open={confirmOpen}
                trip={selectedTrip}
                action={confirmAction}
                onClose={() => setConfirmOpen(false)}
                onSuccess={load}
            />

        </div>

    );

}