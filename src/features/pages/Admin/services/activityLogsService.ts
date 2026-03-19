import api from "@/features/shared/services/api";

export const activityLogsService = {

  async getLogs() {

    const res = await api.get("/activity-logs");

    return res.data;

  }

};