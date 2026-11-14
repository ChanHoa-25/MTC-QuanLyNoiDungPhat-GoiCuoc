import axiosInstance from "./axiosInstance";

export interface UserDto {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  isActive: boolean;
  twoFactorEnabled: boolean;
  organizationId: string | null;
  organizationName: string | null;
  facilityId: string | null;
  facilityName: string | null;
  roleId: string | null;
  roleCode: string | null;
  roleName: string | null;
  lastLoginAt: string | null;
  lastActivityAt: string | null;
  createdAt: string;
}
export interface CreateUserDto {
  username: string;
  password: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  organizationId: string;
  facilityId: string;
  roleId: string;
  isActive: boolean;
}
export interface UpdateUserDto {
  fullName: string;
  email: string;
  phoneNumber: string;
  organizationId: string;
  facilityId: string;
  roleId: string;
  isActive: boolean;
}

export interface UserQueryParams {
  Search?: string;
  OrganizationId?: string;
  FacilityId?: string;
  RoleId?: string;
  IsActive?: boolean;
  Page?: number;
  PageSize?: number;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  errors: unknown;
}

export const userApi = {
  getAll: async (
    params: UserQueryParams = {},
  ): Promise<PagedResult<UserDto>> => {
    const response = await axiosInstance.get<ApiResponse<PagedResult<UserDto>>>(
      "/Users",
      { params },
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.message || "Không thể tải danh sách tài khoản",
      );
    }

    return response.data.data;
  },
  create: async (data: CreateUserDto): Promise<void> => {
    const response = await axiosInstance.post<ApiResponse<unknown>>(
      "/Users",
      data,
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Không thể tạo tài khoản");
    }
  },
  update: async (id: string, data: UpdateUserDto): Promise<void> => {
    const response = await axiosInstance.put<ApiResponse<unknown>>(
      `/Users/${id}`,
      data,
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Không thể cập nhật tài khoản");
    }
  },
  remove: async (id: string): Promise<void> => {
    const response = await axiosInstance.delete<ApiResponse<unknown>>(
      `/Users/${id}`,
    );

    if (response.data?.success === false) {
      throw new Error(response.data.message || "Không thể xóa tài khoản");
    }
  },
};
