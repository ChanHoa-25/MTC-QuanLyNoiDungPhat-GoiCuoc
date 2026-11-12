import axiosInstance from "./axiosInstance";
import type { ApiResponse } from "./authApi";

export interface Permission {
  id: string;
  permissionCode: string;
  permissionName: string;
  moduleGroup: string;
  isAssigned: boolean;
}

export interface Role {
  id: string;
  roleCode: string;
  roleName: string;
  description: string | null;
  organizationId: string | null;
  isSystemRole: boolean;
  userCount: number;
}

export interface RoleDetail extends Role {
  permissions: Permission[];
}

function unwrapResponse<T>(response: ApiResponse<T>): T {
  if (!response.success || response.data === null) {
    throw new Error(response.message || "Yêu cầu thất bại.");
  }

  return response.data;
}

export const rolesApi = {
  // Lấy danh sách vai trò
  getRoles: async (organizationId?: string | null): Promise<Role[]> => {
    const response = await axiosInstance.get<ApiResponse<Role[]>>("/Roles", {
      params: organizationId ? { organizationId } : undefined,
    });

    return unwrapResponse(response.data);
  },

  // Lấy chi tiết vai trò và danh sách quyền
  getRoleById: async (id: string): Promise<RoleDetail> => {
    const response = await axiosInstance.get<ApiResponse<RoleDetail>>(
      `/Roles/${encodeURIComponent(id)}`,
    );

    return unwrapResponse(response.data);
  },

  // Lấy toàn bộ danh mục quyền
  getPermissions: async (): Promise<Permission[]> => {
    const response =
      await axiosInstance.get<ApiResponse<Permission[]>>("/Roles/permissions");

    return unwrapResponse(response.data);
  },
};
