import api from "@/features/shared/services/api";

export const stopsService = {

  async getStopsByRoute(routeId: string) {
    const res = await api.get(`/stops/route/${routeId}`);
    return res.data;
  },

  async createStop(data: {
    route_id: string;
    stop_name: string;
    latitude: number;
    longitude: number;
    stop_order?: number;
  }) {
    const res = await api.post("/stops", data);
    return res.data;
  },

  async updateStop(id: string, data: any) {
    const res = await api.patch(`/stops/${id}`, data);
    return res.data;
  },

  async deleteStop(id: string) {
    const res = await api.delete(`/stops/${id}`);
    return res.data;
  },

  async toggleStopStatus(id: string, is_active: boolean) {
    const res = await api.patch(`/stops/${id}/status`, { is_active });
    return res.data;
  },

  /* -------------------------
     REORDER STOPS
  ------------------------- */

  async updateStopOrder(
    routeId: string,
    stops: { id: string; stop_order: number }[]
  ) {
    const res = await api.put(`/stops/route/${routeId}/order`, stops);
    return res.data;
  }

};