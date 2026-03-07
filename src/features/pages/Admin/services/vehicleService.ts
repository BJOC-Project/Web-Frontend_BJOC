import api from "@/features/shared/services/api";

export const vehicleService = {

  async getVehicles() {
    const res = await api.get("/vehicles");
    return res.data;

  },

  async createVehicle(data: {
    plate_number: string;
    model: string;
    capacity: number;
  }) {

    const res = await api.post("/vehicles", data);
    return res.data;

  },

  async updateVehicle(id: string, data: any) {
    const res = await api.put(`/vehicles/${id}`, data);
    return res.data;
  },

  async deleteVehicle(id: string) {
    const res = await api.delete(`/vehicles/${id}`);
    return res.data;
  },

  async getVehicleLocations() {
    const res = await api.get("/vehicles/vehicle-locations");
    return res.data;
  },

};