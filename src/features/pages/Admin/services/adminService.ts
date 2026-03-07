import api from "@/features/shared/services/api";

export const adminService = {

    async getSystemSummary() {
        const res = await api.get("/admin/dashboard/summary");
        return res.data;
    },

    async getOperatorStats() {
        const res = await api.get("/admin/dashboard/operators");
        return res.data;
    },

    async getVehicleStats() {
        const res = await api.get("/admin/dashboard/vehicles");
        return res.data;
    },

    async getRecentActivity() {
        const res = await api.get("/admin/dashboard/activity");
        return res.data;
    },

  async getDrivers() {
    const res = await api.get("/drivers");
    return res.data;
  },

  async createDriver(data:any) {
    const res = await api.post("/drivers", data);
    return res.data;
  },

  async updateDriver(id:string,data:any) {
    const res = await api.put(`/drivers/${id}`, data);
    return res.data;
  },

  async deleteDriver(id:string) {
    const res = await api.delete(`/drivers/${id}`);
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