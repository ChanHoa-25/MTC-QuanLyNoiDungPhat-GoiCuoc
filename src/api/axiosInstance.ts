import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

import { authStorage } from "../utils/authStorage";
import { authApi } from "./authApi";

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

let refreshPromise: Promise<string> | null = null;

axiosInstance.interceptors.request.use((config) => {
  const accessToken = authStorage.getAccessToken();

  if (accessToken) {
    config.headers.set("Authorization", `Bearer ${accessToken}`);
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as RetryConfig | undefined;

    const isAuthRequest =
      originalRequest?.url?.includes("/Auth/login") ||
      originalRequest?.url?.includes("/Auth/refresh-token") ||
      originalRequest?.url?.includes("/Auth/logout");

    if (
      !originalRequest ||
      error.response?.status !== 401 ||
      originalRequest._retry ||
      isAuthRequest
    ) {
      return Promise.reject(error);
    }

    const refreshToken = authStorage.getRefreshToken();
    const accessToken = authStorage.getAccessToken();

    if (!refreshToken || !accessToken) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const requestToken = originalRequest.headers.get("Authorization");
      const currentAuthorization = `Bearer ${accessToken}`;

      if (
        typeof requestToken === "string" &&
        requestToken !== currentAuthorization
      ) {
        originalRequest.headers.set("Authorization", currentAuthorization);

        return axiosInstance(originalRequest);
      }

      if (!refreshPromise) {
        refreshPromise = (async () => {
          const result = await authApi.refreshToken({
            accessToken,
            refreshToken,
          });

          if (!result.accessToken || !result.refreshToken) {
            throw new Error("Backend không trả về token mới.");
          }

          if (authStorage.getRefreshToken() !== refreshToken) {
            throw new Error("Phiên đăng nhập đã thay đổi.");
          }

          authStorage.setTokens(result.accessToken, result.refreshToken);

          return result.accessToken;
        })().finally(() => {
          refreshPromise = null;
        });
      }

      const newAccessToken = await refreshPromise;

      originalRequest.headers.set("Authorization", `Bearer ${newAccessToken}`);

      return axiosInstance(originalRequest);
    } catch (refreshError) {
      if (authStorage.getRefreshToken() === refreshToken) {
        authStorage.clearTokens();

        if (window.location.pathname !== "/login") {
          window.location.replace("/login");
        }
      }

      return Promise.reject(refreshError);
    }
  },
);

export default axiosInstance;
