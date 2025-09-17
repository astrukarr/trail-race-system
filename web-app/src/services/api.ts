// API Service for communicating with backend services
import axios from "axios";
import Cookies from "js-cookie";

const COMMAND_API_URL =
  process.env.NEXT_PUBLIC_COMMAND_API_URL || "http://localhost:3001";
const QUERY_API_URL =
  process.env.NEXT_PUBLIC_QUERY_API_URL || "http://localhost:3002";

// Create axios instances
const commandApi = axios.create({
  baseURL: COMMAND_API_URL,
  timeout: 10000,
});

const queryApi = axios.create({
  baseURL: QUERY_API_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
const addAuthToken = (config: any) => {
  const token = Cookies.get("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

commandApi.interceptors.request.use(addAuthToken);
queryApi.interceptors.request.use(addAuthToken);

// Response interceptor for error handling
const handleResponseError = (error: any) => {
  if (error.response?.status === 401) {
    // Token expired or invalid
    Cookies.remove("auth_token");
    window.location.href = "/login";
  }
  return Promise.reject(error);
};

commandApi.interceptors.response.use(
  (response) => response,
  handleResponseError
);

queryApi.interceptors.response.use((response) => response, handleResponseError);

// Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "Applicant" | "Administrator";
}

export interface Race {
  id: string;
  name: string;
  distance: "5k" | "10k" | "HalfMarathon" | "Marathon";
  createdAt: string;
  updatedAt: string;
}

export interface CreateRaceData {
  name: string;
  distance: "5k" | "10k" | "HalfMarathon" | "Marathon";
}

export interface UpdateRaceData {
  name?: string;
  distance?: "5k" | "10k" | "HalfMarathon" | "Marathon";
}

export interface Application {
  id: string;
  firstName: string;
  lastName: string;
  club?: string;
  raceId: string;
  raceName?: string;
  raceDistance?: string;
  userEmail?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "Applicant" | "Administrator";
}

export interface CreateRaceRequest {
  name: string;
  distance: "5k" | "10k" | "HalfMarathon" | "Marathon";
}

export interface UpdateRaceRequest {
  name?: string;
  distance?: "5k" | "10k" | "HalfMarathon" | "Marathon";
}

export interface CreateApplicationRequest {
  firstName: string;
  lastName: string;
  club?: string;
  raceId: string;
}

// Auth API
export const authApi = {
  login: async (data: LoginRequest) => {
    const response = await commandApi.post("/api/auth/login", data);
    return response.data;
  },

  register: async (data: RegisterRequest) => {
    const response = await commandApi.post("/api/auth/register", data);
    return response.data;
  },

  getMe: async () => {
    const response = await commandApi.get("/api/auth/me");
    return response.data;
  },
};

// Race API (Command Service - Write operations)
export const raceCommandApi = {
  create: async (data: CreateRaceRequest) => {
    const response = await commandApi.post("/api/races", data);
    return response.data;
  },

  update: async (id: string, data: UpdateRaceRequest) => {
    const response = await commandApi.put(`/api/races/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await commandApi.delete(`/api/races/${id}`);
    return response.data;
  },
};

// Race API (Query Service - Read operations)
export const raceQueryApi = {
  getAll: async () => {
    const response = await queryApi.get("/api/races");
    return response.data;
  },

  getById: async (id: string) => {
    const response = await queryApi.get(`/api/races/${id}`);
    return response.data;
  },
};

// Application API (Command Service - Write operations)
export const applicationCommandApi = {
  create: async (data: CreateApplicationRequest) => {
    const response = await commandApi.post("/api/applications", data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await commandApi.delete(`/api/applications/${id}`);
    return response.data;
  },
};

// Application API (Query Service - Read operations)
export const applicationQueryApi = {
  getAll: async () => {
    const response = await queryApi.get("/api/applications");
    return response.data;
  },

  getById: async (id: string) => {
    const response = await queryApi.get(`/api/applications/${id}`);
    return response.data;
  },
};

export default {
  authApi,
  raceCommandApi,
  raceQueryApi,
  applicationCommandApi,
  applicationQueryApi,
};
