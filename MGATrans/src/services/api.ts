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

/**
 * Sign up user
 */
export function registerUser(credentials: { 
  name: string; 
  password: string; 
  field_phone?: string;
}) {
  const payload = { ...credentials };
  
  // Supprimer field_phone s'il est undefined ou vide
  if (!payload.field_phone) {
    delete payload.field_phone;
  }
  
  return api.post("/api_solutions/user/register", payload);
}