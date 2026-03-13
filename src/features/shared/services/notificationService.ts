import api from "@/features/shared/services/api";

export const notificationService = {

  async getNotifications(role: string) {
    const res = await api.get(`/notifications?role=${role}`);
    return res.data ?? [];
  },

  async markRead(id: string) {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data;
  },

  async markAllRead(role: string) {
    const res = await api.patch(`/notifications/read-all`, { role });
    return res.data;
  }

};