import { AlertTriangle } from "lucide-react";

import { tripsService } from "../services/tripsService";

type Props = {
  action: "cancel" | "end" | "reschedule" | null;
  onClose: () => void;
  onSuccess: () => void;
  open: boolean;
  trip: any;
};

export function ConfirmTripModal({ open, trip, action, onClose, onSuccess }: Props) {
  if (!open || !trip || !action) {
    return null;
  }

  async function confirm() {
    if (action === "cancel") {
      await tripsService.cancelTrip(trip.id);
    }

    if (action === "end") {
      await tripsService.endTrip(trip.id);
    }

    onSuccess();
    onClose();
  }

  const actionText = action === "cancel" ? "Cancel this scheduled trip?" : "End this trip now?";

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-[28px] bg-white p-5 shadow-2xl sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start gap-3">
          <div className="rounded-2xl bg-rose-100 p-3 text-rose-700">
            <AlertTriangle size={18} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-900">Confirm Action</h3>
            <p className="mt-1 text-sm text-slate-500">{actionText}</p>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-700">
          <p>
            <span className="font-medium text-slate-500">Vehicle:</span> {trip.vehicle || "-"}
          </p>
          <p className="mt-2">
            <span className="font-medium text-slate-500">Route:</span> {trip.route || "-"}
          </p>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-rose-700"
            onClick={() => void confirm()}
            type="button"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
