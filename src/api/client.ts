import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { env } from "@/config/env";
import { camelizeKeys, decamelizeKeys } from "@/lib/caseTransform";
import { useAuthStore } from "@/stores/auth.store";

export function resolveApiBaseUrl(): string {
  const rawUrl = env.API_URL;
  if (
    Platform.OS !== "web" &&
    (rawUrl.includes("localhost") || rawUrl.includes("127.0.0.1"))
  ) {
    const hostUri = Constants.expoConfig?.hostUri;
    if (hostUri) {
      const hostIp = hostUri.split(":")[0];
      if (hostIp) {
        return rawUrl.replace(/localhost|127\.0\.0\.1/, hostIp);
      }
    }
  }
  return rawUrl;
}

export const apiClient = axios.create({
  baseURL: resolveApiBaseUrl(),
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: attach bearer token, resolve dynamic baseURL, and decamelize payload
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    config.baseURL = resolveApiBaseUrl();

    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data && !(config.data instanceof FormData)) {
      config.data = decamelizeKeys(config.data);
    }
    if (config.params) {
      config.params = decamelizeKeys(config.params);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: unwrap response and camelize keys to camelCase
apiClient.interceptors.response.use(
  (response) => {
    const body = response.data;
    if (body && typeof body === "object") {
      if ("data" in body) {
        response.data = camelizeKeys(body.data);
      } else {
        response.data = camelizeKeys(body);
      }
    }
    return response;
  },
  (error: AxiosError<{ error?: string; message?: string }>) => {
    const isLoginEndpoint = error.config?.url?.includes("/auth/login");

    // Only force global logout if a protected route receives 401, not the login form itself
    if (error.response?.status === 401 && !isLoginEndpoint) {
      useAuthStore.getState().logout();
    }

    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "Unable to connect to TurfSlot server";

    const customError = new Error(message);
    (customError as any).status = error.response?.status;
    return Promise.reject(customError);
  }
);
