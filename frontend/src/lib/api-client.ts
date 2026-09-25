import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

import { getAccessToken, setAccessToken } from "./token-store";
import type { ApiErrorShape } from "@/types";

export const API_URL: string =
  (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:4000";

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  try {
    const response = await axios.post<{ accessToken: string }>(
      `${API_URL}/auth/refresh`,
      {},
      { withCredentials: true }
    );
    setAccessToken(response.data.accessToken);
    return response.data.accessToken;
  } catch {
    setAccessToken(null);
    return null;
  }
}

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableConfig | undefined;

    const isAuthRoute = originalRequest?.url?.includes("/auth/login") ||
      originalRequest?.url?.includes("/auth/refresh");

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthRoute
    ) {
      originalRequest._retry = true;

      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }

      const newToken = await refreshPromise;
      if (newToken) {
        originalRequest.headers.set("Authorization", `Bearer ${newToken}`);
        return apiClient(originalRequest);
      }

      window.dispatchEvent(new CustomEvent("auth:session-expired"));
    }

    return Promise.reject(error);
  }
);

export function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorShape>(error)) {
    return error.response?.data?.error?.message ?? error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Something went wrong";
}
