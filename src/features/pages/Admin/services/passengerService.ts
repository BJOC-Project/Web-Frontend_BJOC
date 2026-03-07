import api from "@/features/shared/services/api";

export const passengerService = {

  async getPassengers() {
    const res = await api.get("/passengers");
    return res.data;
  },

  async createPassenger(data: {
    first_name: string;
    middle_name?: string;
    last_name: string;
    username?: string;
    contact_number?: string;
    email: string;
    password: string;
    status?: string;
  }) {
    const res = await api.post("/passengers", data);
    return res.data;
  },

  async updatePassenger(id: string, data: {
    first_name?: string;
    middle_name?: string;
    last_name?: string;
    username?: string;
    contact_number?: string;
    email?: string;
    status?: string;
  }) {
    const res = await api.put(`/passengers/${id}`, data);
    return res.data;
  },

  async deletePassenger(id: string) {
    const res = await api.delete(`/passengers/${id}`);
    return res.data;
  }

};