import axios from "axios";

const API = "http://localhost:5000/api";

export const authService = {

  async login(payload: { email: string; password: string }) {

    const res = await axios.post(`${API}/auth/login`, payload);

    return res.data;

  },

};