import axios from "axios";
import axiosInstance from "./axiosInstance";

export interface LoginRequest {
  username: string;
  password: string;
  rememberMe: boolean;
}

export interface AuthUser {
  userId: string;
  username: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
  organizationId: string | null;
  organizationName: string | null;
  facilityId: string | null;
  facilityName: string | null;
  isSuperAdmin: boolean;
}

export interface LoginResponse {
  accessToken: string | null;
  refreshToken: string | null;
  tokenType: string | null;
  expiresAt: string | null;
  requires2FA: boolean;
  user: AuthUser;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  errors: unknown;
}

export interface RefreshTokenRequest {
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  login: async (payload: LoginRequest): Promise<LoginResponse> => {
    const response = await axiosInstance.post<ApiResponse<LoginResponse>>(
      "/Auth/login",
      payload,
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Đăng nhập thất bại");
    }

    return response.data.data;
  },

  refreshToken: async (
    payload: RefreshTokenRequest,
  ): Promise<LoginResponse> => {
    const response = await axios.post<ApiResponse<LoginResponse>>(
      `${process.env.REACT_APP_API_BASE_URL || "/api"}/Auth/refresh-token`,
      payload,
      { timeout: 10000 },
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Làm mới token thất bại");
    }

    return response.data.data;
  },
};
