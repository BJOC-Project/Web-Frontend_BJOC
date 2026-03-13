import { tripsService } from "../services/tripsService";

type Props = {
  open: boolean;
  trip: any;
  action: "cancel" | "end" | "reschedule" | null;
  onClose: () => void;
  onSuccess: () => void;
};

export function ConfirmTripModal({
  open,
  trip,
  action,
  onClose,
  onSuccess
}: Props){

if(!open || !trip || !action) return null;

const confirm = async()=>{

if(action==="cancel"){
await tripsService.cancelTrip(trip.id);
}

if(action==="end"){
await tripsService.endTrip(trip.id);
}

onSuccess();
onClose();

};

return(

<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">

<div className="bg-white p-6 rounded-lg w-[320px] space-y-4">

<h3 className="font-semibold text-lg">
Confirm Action
</h3>

<p className="text-sm text-gray-600">

{action==="cancel" && "Cancel this scheduled trip?"}
{action==="end" && "End this trip now?"}

</p>

<div className="text-sm bg-gray-50 p-3 rounded">

Vehicle: {trip.vehicle} <br/>
Route: {trip.route}

</div>

<div className="flex justify-end gap-2">

<button
onClick={onClose}
className="border px-3 py-1 rounded"
>
Cancel
</button>

<button
onClick={confirm}
className="bg-red-600 text-white px-3 py-1 rounded"
>
Confirm
</button>

</div>

</div>

</div>

);

}