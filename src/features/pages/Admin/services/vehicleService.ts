import api from "@/features/shared/services/api";

export const vehicleService = {

  /* =========================
     GET VEHICLES
  ========================= */

  async getVehicles() {

    const res = await api.get("/vehicles");

    const vehicles = res.data ?? [];

    return vehicles.map((v: any) => ({

      id: v.id,
      plate_number: v.plate_number,
      model: v.model,
      capacity: v.capacity,
      driver_id: v.driver_id ?? null,
      driver: v.driver ?? null

    }));

  },

  /* =========================
     CREATE VEHICLE
  ========================= */

  async createVehicle(data: {
    plate_number: string;
    model: string;
    capacity: number;
  }) {

    const res = await api.post("/vehicles", data);
    return res.data;

  },

  /* =========================
     UPDATE VEHICLE
  ========================= */

  async updateVehicle(id: string, data: any) {

    const res = await api.put(`/vehicles/${id}`, data);
    return res.data;

  },

  /* =========================
     DELETE VEHICLE
  ========================= */

  async deleteVehicle(id: string) {

    const res = await api.delete(`/vehicles/${id}`);
    return res.data;

  },

  /* =========================
     VEHICLE MAP LOCATIONS
  ========================= */

  async getVehicleLocations() {

    const res = await api.get("/vehicles/vehicle-locations");
    return res.data ?? [];

  }

};
