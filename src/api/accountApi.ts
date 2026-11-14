import axiosInstance from "./axiosInstance";

export interface AccountProfile {
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

export interface UpdateAccountProfile {
  fullName: string;
  phoneNumber: string;
  email: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: unknown;
}

export const accountApi = {
  getMe: async (): Promise<AccountProfile> => {
    const response =
      await axiosInstance.get<ApiResponse<AccountProfile>>("/Auth/me");

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.message || "Không thể lấy thông tin tài khoản.",
      );
    }

    return response.data.data;
  },

  updateProfile: async (
    data: UpdateAccountProfile,
  ): Promise<AccountProfile> => {
    const response = await axiosInstance.put<ApiResponse<AccountProfile>>(
      "/Auth/profile",
      data,
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Không thể cập nhật tài khoản.");
    }

    return response.data.data;
  },
};
