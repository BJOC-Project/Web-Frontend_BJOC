import api from "@/features/shared/services/api";

export const tripsService = {

  /* -------------------------
     GET ACTIVE TRIPS
  --------------------------*/
  async getActiveTrips() {
    const res = await api.get("/trips/active");
    return res.data ?? [];
  },

  /* -------------------------
     GET TRIP HISTORY
  --------------------------*/
  async getTripHistory() {
    const res = await api.get("/trips/history");
    return res.data ?? [];
  },

  /* -------------------------
     CREATE SCHEDULED TRIP
  --------------------------*/
  async startTrip(payload: {
    vehicle_id: string;
    route_id: string;
    scheduled_departure_time?: string;
  }) {

    const res = await api.post("/trips/start", payload);

    return res.data;

  },

  /* -------------------------
     END TRIP
  --------------------------*/
  async endTrip(id: string) {

    const res = await api.put(`/trips/${id}/end`);

    return res.data;

  },

  /* -------------------------
     CANCEL TRIP
  --------------------------*/
  async cancelTrip(id: string) {

    const res = await api.patch(`/trips/${id}/cancel`);

    return res.data;

  },

  /* -------------------------
     RESCHEDULE TRIP
  --------------------------*/
  async rescheduleTrip(
    id: string,
    payload: { scheduled_departure_time: string }
  ) {

    const res = await api.patch(`/trips/${id}/reschedule`, payload);

    return res.data;

  }

};