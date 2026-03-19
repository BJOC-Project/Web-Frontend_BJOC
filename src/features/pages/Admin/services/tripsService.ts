import api from "@/features/shared/services/api";

export const tripsService = {

  /* -------------------------
     GET SCHEDULED + ACTIVE TRIPS
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
     ADMIN: SCHEDULE TRIP
  --------------------------*/
  async scheduleTrip(payload: {
    vehicle_id: string;
    route_id: string;
    trip_date: string;
    scheduled_departure_time: string;
  }) {

    const res = await api.post("/trips/schedule", payload);

    return res.data;

  },

  /* -------------------------
     DRIVER: START TRIP
  --------------------------*/
  async startTrip(id: string) {

    const res = await api.patch(`/trips/${id}/start`);

    return res.data;

  },

  /* -------------------------
     DRIVER: END TRIP
  --------------------------*/
  async endTrip(id: string) {

    const res = await api.patch(`/trips/${id}/end`);

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