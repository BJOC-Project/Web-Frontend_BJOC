import api from "@/features/shared/services/api";

export const adminService = {

    async getSystemSummary() {
        const res = await api.get("/api/admin/dashboard/summary");
        return res.data;
    },

    async getOperatorStats() {
        const res = await api.get("/api/admin/dashboard/operators");
        return res.data;
    },

    async getVehicleStats() {
        const res = await api.get("/api/admin/dashboard/vehicles");
        return res.data;
    },

    async getRecentActivity() {
        const res = await api.get("/api/admin/dashboard/activity");
        return res.data;
    },

  async getDrivers() {
    const res = await api.get("/api/drivers");
    return res.data;
  },

  async createDriver(data:any) {
    const res = await api.post("/api/drivers", data);
    return res.data;
  },

  async updateDriver(id:string,data:any) {
    const res = await api.put(`/api/drivers/${id}`, data);
    return res.data;
  },

  async deleteDriver(id:string) {
    const res = await api.delete(`/api/drivers/${id}`);
    return res.data;
  },

};