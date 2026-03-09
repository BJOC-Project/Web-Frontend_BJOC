import api from "@/features/shared/services/api";

export const tripsService = {

  async getActiveTrips() {
    const res = await api.get("/trips/active");
    return res.data ?? [];
  },

  async getTripHistory() {
    const res = await api.get("/trips/history");
    return res.data ?? [];
  },

  async startTrip(payload: {
    vehicle_id: string;
    route_id: string;
    route_direction?: string;
    scheduled_departure_time?: string;
  }) {

    const res = await api.post("/trips/start", payload);

    return res.data;

  },

  async endTrip(id: string) {

    const res = await api.put(`/trips/${id}/end`);

    return res.data;

  }

};