import axios from "axios";

export const API_BASE_URL = 'http://mga.local/';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
  },
});

/**
 * LOGIN
 */
export function loginUser(credentials: { name: string; password: string }) {
  return api.post("/api_solutions/user/login", credentials);
}