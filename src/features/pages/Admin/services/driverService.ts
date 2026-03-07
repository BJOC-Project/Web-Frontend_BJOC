import api from "@/features/shared/services/api";

export const driverService = {

  async getDrivers() {

    const res = await api.get("/drivers");

    return res.data;

  },

  async createDriver(data: {
    first_name: string;
    middle_name?: string;
    last_name: string;
    email: string;
    password: string;
    contact_number?: string;
    license_number: string;
  }) {

    const res = await api.post("/drivers", data);

    return res.data;

  },

  async updateDriver(id: string, data: any) {

    const res = await api.put(`/drivers/${id}`, data);

    return res.data;

  },

  async deleteDriver(id: string) {

    const res = await api.delete(`/drivers/${id}`);

    return res.data;

  }

};
