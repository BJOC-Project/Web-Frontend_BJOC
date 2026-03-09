import api from "@/features/shared/services/api";

export type Route = {
  id: string;
  route_name: string;
  start_location?: string;
  end_location?: string;
  start_lat?: number;
  start_lng?: number;
};

export const routesService = {

  async getRoutes(): Promise<Route[]> {
    const res = await api.get("/routes");
    return res.data;
  },

  async updateRoute(
    id: string,
    data: { route_name?: string; start_location?: string; end_location?: string }
  ) {
    const res = await api.patch(`/routes/${id}`, data);
    return res.data;
  },

  async createRoute(data: {
    route_name: string;
    start_location?: string;
    end_location?: string;
  }) {
    const res = await api.post("/routes", data);
    return res.data;
  },

  async deleteRoute(id: string) {
    const res = await api.delete(`/routes/${id}`);
    return res.data;
  },

  async publishRoute(id: string) {
    const res = await api.post(`/routes/${id}/publish`);
    return res.data;
  }

};