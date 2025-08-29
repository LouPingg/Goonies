// src/lib/api.js
import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:4000";
console.log("API baseURL =", baseURL); // 👀 vérifie dans la console navigateur
const api = axios.create({ baseURL });

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("goonies_token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export default api;
