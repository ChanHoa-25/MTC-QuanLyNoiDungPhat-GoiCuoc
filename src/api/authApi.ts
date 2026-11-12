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

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  errors: unknown;
}

export interface RefreshTokenRequest {
  accessToken: string;
  refreshToken: string;
}

export interface Verify2FARequest {
  userId: string;
  code: string;
}

export interface UpdateProfileRequest {
  fullName: string;
  phoneNumber: string;
  email: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface TwoFactorSetupResponse {
  secretKey: string;
  manualEntryKey: string;
  qrCodeDataUrl: string;
  otpAuthUrl: string;
}

export interface Enable2FARequest {
  code: string;
}

export interface Enable2FAResponse {
  isSuccess: boolean;
  message: string;
  backupCodes: string[];
}

export interface Disable2FARequest {
  password: string;
  code: string;
}

// Đường dẫn API Backend, sử dụng proxy khi chạy CRA
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "/api";

// Axios riêng cho các API không yêu cầu Access Token
const authClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Xử lý dữ liệu trả về từ Backend
function unwrapResponse<T>(response: ApiResponse<T>): T {
  if (!response.success || response.data === null) {
    throw new Error(response.message || "Yêu cầu thất bại.");
  }

  return response.data;
}

export const authApi = {
  // Đăng nhập
  login: async (payload: LoginRequest): Promise<LoginResponse> => {
    const response = await authClient.post<ApiResponse<LoginResponse>>(
      "/Auth/login",
      payload,
    );

    return unwrapResponse(response.data);
  },

  // Làm mới Access Token
  refreshToken: async (
    payload: RefreshTokenRequest,
  ): Promise<LoginResponse> => {
    const response = await authClient.post<ApiResponse<LoginResponse>>(
      "/Auth/refresh-token",
      payload,
    );

    return unwrapResponse(response.data);
  },

  // Lấy thông tin tài khoản hiện tại
  getMe: async (): Promise<AuthUser> => {
    const response = await axiosInstance.get<ApiResponse<AuthUser>>("/Auth/me");

    return unwrapResponse(response.data);
  },

  // Cập nhật thông tin tài khoản
  updateProfile: async (payload: UpdateProfileRequest): Promise<AuthUser> => {
    const response = await axiosInstance.put<ApiResponse<AuthUser>>(
      "/Auth/profile",
      payload,
    );

    return unwrapResponse(response.data);
  },

  // Đổi mật khẩu
  changePassword: async (payload: ChangePasswordRequest): Promise<boolean> => {
    const response = await axiosInstance.put<ApiResponse<boolean>>(
      "/Auth/change-password",
      payload,
    );

    return unwrapResponse(response.data);
  },

  // Đăng xuất
  logout: async (refreshToken: string): Promise<boolean> => {
    const response = await axiosInstance.post<ApiResponse<boolean>>(
      "/Auth/logout",
      null,
      {
        params: {
          token: refreshToken,
        },
      },
    );

    return unwrapResponse(response.data);
  },

  // Xác minh mã 2FA khi đăng nhập
  verify2FA: async (payload: Verify2FARequest): Promise<LoginResponse> => {
    const response = await authClient.post<ApiResponse<LoginResponse>>(
      "/Auth/verify-2fa",
      payload,
    );

    return unwrapResponse(response.data);
  },

  // Thiết lập ứng dụng xác thực 2FA
  setup2FA: async (): Promise<TwoFactorSetupResponse> => {
    const response =
      await axiosInstance.post<ApiResponse<TwoFactorSetupResponse>>(
        "/Auth/2fa/setup",
      );

    return unwrapResponse(response.data);
  },

  // Bật xác thực hai bước
  enable2FA: async (payload: Enable2FARequest): Promise<Enable2FAResponse> => {
    const response = await axiosInstance.post<ApiResponse<Enable2FAResponse>>(
      "/Auth/2fa/enable",
      payload,
    );

    return unwrapResponse(response.data);
  },

  // Tắt xác thực hai bước
  disable2FA: async (payload: Disable2FARequest): Promise<boolean> => {
    const response = await axiosInstance.post<ApiResponse<boolean>>(
      "/Auth/2fa/disable",
      payload,
    );

    return unwrapResponse(response.data);
  },

  // Lấy số lượng mã dự phòng còn lại
  getBackupCodesCount: async (): Promise<number> => {
    const response = await axiosInstance.get<ApiResponse<number>>(
      "/Auth/2fa/backup-codes/count",
    );

    return unwrapResponse(response.data);
  },

  // Tạo lại mã dự phòng
  regenerateBackupCodes: async (password: string): Promise<string[]> => {
    const response = await axiosInstance.post<ApiResponse<string[]>>(
      "/Auth/2fa/backup-codes/regenerate",
      { password },
    );

    return unwrapResponse(response.data);
  },
};
