import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { phNow } from "@/lib/time";
import { tripsService } from "../services/tripsService";

type Props = {
    open: boolean;
    trip: any;
    onClose: () => void;
    onSuccess: () => void;
};

export function RescheduleTripModal({
    open,
    trip,
    onClose,
    onSuccess
}: Props) {

    const [time, setTime] = useState<Date | null>(phNow());

    useEffect(() => {

        if (trip?.scheduled_departure_time) {
            setTime(new Date(trip.scheduled_departure_time));
        }

    }, [trip]);

    if (!open || !trip) return null;

    const save = async () => {

        if (!time) return;

        if (time < phNow()) {
            alert("New schedule must be later than current time.");
            return;
        }

        await tripsService.rescheduleTrip(trip.id, {
            scheduled_departure_time: time.toISOString()
        });

        onSuccess();
        onClose();

    };

    return (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">

            <div className="bg-white p-6 rounded-lg w-[360px] space-y-4">

                <h3 className="font-semibold">
                    Reschedule Trip - {trip.vehicle}
                </h3>

                <DatePicker
                    selected={time}
                    onChange={(date: Date | null) => setTime(date)}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={5}
                    dateFormat="h:mm aa"
                    minTime={phNow()}
                    maxTime={new Date(new Date().setHours(23, 59, 59, 999))}
                    className="border rounded px-3 py-2 w-full"
                />

                <div className="flex justify-end gap-2">

                    <button
                        onClick={onClose}
                        className="border px-3 py-1 rounded"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={save}
                        className="bg-blue-600 text-white px-3 py-1 rounded"
                    >
                        Save
                    </button>

                </div>

            </div>

        </div>

    );

}