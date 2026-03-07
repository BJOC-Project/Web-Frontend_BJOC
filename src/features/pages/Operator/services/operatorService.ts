import api from "@/features/shared/services/api";

export const operatorService = {

  /* ---------------------------
     VEHICLES
  --------------------------- */

  async getVehicles() {
    const res = await api.get("/operators/vehicles");
    return res.data;
  },

  async addVehicle(data: {
    plate_number: string;
    model?: string;
    capacity: number;
  }) {
    const res = await api.post("/operators/vehicles", data);
    return res.data;
  },

  async updateVehicle(id: string, data: any) {
    const res = await api.put(`/operators/vehicles/${id}`, data);
    return res.data;
  },

  async deleteVehicle(id: string) {
    const res = await api.delete(`/operators/vehicles/${id}`);
    return res.data;
  },


  /* ---------------------------
     DRIVERS
  --------------------------- */

  async getDrivers() {
    const res = await api.get("/operators/drivers");
    return res.data;
  },

  async addDriver(data: {
    first_name: string;
    last_name: string;
    contact_number: string;
    license_number: string;
  }) {
    const res = await api.post("/operators/drivers", data);
    return res.data;
  },

  async updateDriver(id: string, data: any) {
    const res = await api.put(`/operators/drivers/${id}`, data);
    return res.data;
  },

  async deleteDriver(id: string) {
    const res = await api.delete(`/operators/drivers/${id}`);
    return res.data;
  },


  /* ---------------------------
     DRIVER ASSIGNMENT
  --------------------------- */

  async assignDriver(vehicle_id: string, driver_id: string) {
    const res = await api.post("/operators/assign-driver", {
      vehicle_id,
      driver_id,
    });

    return res.data;
  },


  /* ---------------------------
     DASHBOARD DATA
  --------------------------- */

  async getFleetSummary() {
    const res = await api.get("/operators/dashboard/fleet-summary");
    return res.data;
  },

  async getJeepneys() {
    const res = await api.get("/operators/dashboard/jeepneys");
    return res.data;
  },

  async getStopPopularity() {
    const res = await api.get("/operators/dashboard/stop-popularity");
    return res.data;
  },

  async getLoadSummary() {
    const res = await api.get("/operators/dashboard/load-summary");
    return res.data;
  },

  async getActiveStops() {
    const res = await api.get("/operators/dashboard/active-stops");
    return res.data;
  },

  async getOverallSummary() {
    const res = await api.get("/operators/dashboard/overall");
    return res.data;
  },

  /* ---------------------------
     VEHICLE LOCATIONS (MAP)
  --------------------------- */

  async getVehicleLocations() {
    const res = await api.get("/operators/vehicle-locations");
    return res.data;
  },

};