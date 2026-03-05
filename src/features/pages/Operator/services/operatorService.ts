import api from "@/features/shared/services/api";

export const operatorService = {

  /* ---------------------------
     VEHICLES
  --------------------------- */

  async getVehicles() {
    const res = await api.get("/operator/vehicles");
    return res.data;
  },

  async addVehicle(data: {
    plate_number: string;
    model?: string;
    capacity: number;
  }) {
    const res = await api.post("/operator/vehicles", data);
    return res.data;
  },

  async updateVehicle(id: string, data: any) {
    const res = await api.put(`/operator/vehicles/${id}`, data);
    return res.data;
  },

  async deleteVehicle(id: string) {
    const res = await api.delete(`/operator/vehicles/${id}`);
    return res.data;
  },


  /* ---------------------------
     DRIVERS
  --------------------------- */

  async getDrivers() {
    const res = await api.get("/operator/drivers");
    return res.data;
  },

  async addDriver(data: {
    first_name: string;
    last_name: string;
    contact_number: string;
    license_number: string;
  }) {
    const res = await api.post("/operator/drivers", data);
    return res.data;
  },

  async updateDriver(id: string, data: any) {
    const res = await api.put(`/operator/drivers/${id}`, data);
    return res.data;
  },

  async deleteDriver(id: string) {
    const res = await api.delete(`/operator/drivers/${id}`);
    return res.data;
  },


  /* ---------------------------
     DRIVER ASSIGNMENT
  --------------------------- */

  async assignDriver(vehicle_id: string, driver_id: string) {
    const res = await api.post("/operator/assign-driver", {
      vehicle_id,
      driver_id,
    });

    return res.data;
  },


  /* ---------------------------
     DASHBOARD DATA
  --------------------------- */

  async getFleetSummary() {
    const res = await api.get("/operator/dashboard/fleet-summary");
    return res.data;
  },

  async getJeepneys() {
    const res = await api.get("/operator/dashboard/jeepneys");
    return res.data;
  },

  async getStopPopularity() {
    const res = await api.get("/operator/dashboard/stop-popularity");
    return res.data;
  },

  async getLoadSummary() {
    const res = await api.get("/operator/dashboard/load-summary");
    return res.data;
  },

  async getActiveStops() {
    const res = await api.get("/operator/dashboard/active-stops");
    return res.data;
  },

  async getOverallSummary() {
    const res = await api.get("/operator/dashboard/overall");
    return res.data;
  },

};