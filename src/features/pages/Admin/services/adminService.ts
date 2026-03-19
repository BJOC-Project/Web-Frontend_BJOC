import axios from "axios";

const API = "http://localhost:5000/api/admin";

const api = axios.create({
  baseURL: API,
  timeout: 10000
});

export const adminService = {

  /* ---------------- DASHBOARD SUMMARY ---------------- */

  async getDashboardSummary(filter?: string) {

    const res = await api.get("/dashboard-summary", {
      params: { filter }
    });

    return res.data;

  },


  /* ---------------- VEHICLE STATUS ---------------- */

  async getVehicleStatus() {

    const res = await api.get("/vehicle-status");

    return res.data;

  },


  /* ---------------- ROUTES ---------------- */

  async getRoutes() {

    const res = await api.get("/routes");

    return res.data;

  },


  /* ---------------- PASSENGER WAITING TREND ---------------- */

  async getWaitingStops(routeId: string, filter?: string) {

    const res = await api.get("/waiting-stops", {
      params: {
        routeId,
        filter
      }
    });

    return res.data;

  },


  /* ---------------- DRIVER PERFORMANCE ---------------- */

  async getDriverPerformance(filter?: string) {

    const res = await api.get("/driver-performance", {
      params: { filter }
    });

    return res.data;

  },


  /* ---------------- ALERTS ---------------- */

  async getLatestAlerts() {

    const res = await api.get("/alerts");

    return res.data;

  },


  /* ---------------- NOTIFICATIONS ---------------- */

  async getLatestNotifications() {

    const res = await api.get("/notifications");

    return res.data;

  },


  /* ---------------- APP RATINGS ---------------- */

  async getAppRatings(filter?: string) {

    const res = await api.get("/app-ratings", {
      params: { filter }
    });

    return res.data;

  },


  /* ---------------- SUGGESTIONS ---------------- */

  async getSuggestions(filter?: string) {

    const res = await api.get("/suggestions", {
      params: { filter }
    });

    return res.data;

  },


  /* ---------------- LIVE VEHICLE MAP ---------------- */

  async getLiveMap() {

    const res = await api.get("/live-map");

    return res.data;

  }

};