import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api/backend",
  timeout: 120_000,
  headers: { Accept: "application/json" },
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string") error.message = detail;
    else if (!error.response) error.message = "The Pharmacy Intelligence API is unavailable.";
    return Promise.reject(error);
  },
);

