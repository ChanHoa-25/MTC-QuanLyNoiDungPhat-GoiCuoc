import type { FacilityRole, FacilityUser } from "../types/facilityUser.types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5006/api";

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("accessToken");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

export interface UserFilterParams {
  facilityId?: string;
  organizationId?: string;
  search?: string;
  roleId?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

export interface UserCreatePayload {
  username: string;
  password?: string;
  fullName: string;
  email?: string;
  phoneNumber?: string;
  organizationId?: string;
  facilityId?: string;
  roleId: string;
  isActive?: boolean;
}

export interface UserUpdatePayload {
  fullName: string;
  email?: string;
  phoneNumber?: string;
  organizationId?: string;
  facilityId?: string;
  roleId?: string;
  isActive?: boolean;
}

export interface ApiUserResult<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

async function parseResponse(response: Response): Promise<{ success: boolean; data?: any; message?: string; errors?: any }> {
  const text = await response.text();
  if (!text) {
    if (response.status === 401) {
      return { success: false, message: "Yêu cầu đăng nhập hoặc phiên làm việc đã hết hạn" };
    }
    return { success: response.ok, message: response.statusText };
  }
  try {
    return JSON.parse(text);
  } catch {
    return { success: response.ok, message: text || response.statusText };
  }
}

export const facilityUserService = {
  // 1. Lấy danh sách vai trò
  async getRoles(organizationId?: string): Promise<ApiUserResult<FacilityRole[]>> {
    try {
      const url = organizationId
        ? `${API_BASE_URL}/Roles?organizationId=${organizationId}`
        : `${API_BASE_URL}/Roles`;

      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });
      const result = await parseResponse(response);
      if (result.success && Array.isArray(result.data)) {
        return {
          success: true,
          data: result.data.map((r: any) => ({
            id: r.id,
            roleCode: r.roleCode,
            roleName: r.roleName,
            description: r.description,
          })),
        };
      }
      return { success: false, message: result.message || "Không thể tải danh sách vai trò" };
    } catch {
      return { success: false, message: "Không thể kết nối đến máy chủ" };
    }
  },

  // 2. Lấy danh sách người dùng theo cơ sở
  async getUsersByFacility(params: UserFilterParams): Promise<ApiUserResult<{ items: FacilityUser[]; totalCount: number }>> {
    try {
      const query = new URLSearchParams();
      if (params.facilityId) query.append("facilityId", params.facilityId);
      if (params.organizationId) query.append("organizationId", params.organizationId);
      if (params.search) query.append("search", params.search);
      if (params.roleId && params.roleId !== "all") query.append("roleId", params.roleId);
      if (params.isActive !== undefined) query.append("isActive", String(params.isActive));
      query.append("page", String(params.page || 1));
      query.append("pageSize", String(params.pageSize || 100));

      const response = await fetch(`${API_BASE_URL}/Users?${query.toString()}`, {
        headers: getAuthHeaders(),
      });
      const result = await parseResponse(response);

      if (result.success && result.data) {
        const rawItems = Array.isArray(result.data.items) ? result.data.items : [];
        const items: FacilityUser[] = rawItems.map((u: any) => ({
          id: u.id,
          facilityId: u.facilityId,
          facilityName: u.facilityName,
          organizationId: u.organizationId,
          organizationName: u.organizationName,
          username: u.username,
          fullName: u.fullName || "",
          email: u.email || "",
          phone: u.phoneNumber || "",
          phoneNumber: u.phoneNumber || "",
          roleId: u.roleId,
          roleCode: u.roleCode,
          roleName: u.roleName,
          role: u.roleName || u.roleCode || "Quản trị viên",
          isActive: u.isActive,
          status: u.isActive ? "active" : "inactive",
          updatedAt: u.createdAt
            ? new Date(u.createdAt).toLocaleString("vi-VN")
            : "—",
          createdAt: u.createdAt,
        }));

        return {
          success: true,
          data: {
            items,
            totalCount: result.data.totalCount ?? items.length,
          },
        };
      }

      return {
        success: false,
        message: result.message || "Không thể tải danh sách người dùng",
      };
    } catch {
      return { success: false, message: "Không thể kết nối đến máy chủ" };
    }
  },

  // 3. Tạo mới người dùng
  async createUser(payload: UserCreatePayload): Promise<ApiUserResult<FacilityUser>> {
    try {
      const response = await fetch(`${API_BASE_URL}/Users`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const result = await parseResponse(response);

      if (result.success && (response.ok || response.status === 201)) {
        return {
          success: true,
          message: result.message || "Thêm tài khoản thành công",
          data: result.data,
        };
      }

      const errorMsg =
        result.message ||
        (result.errors
          ? Array.isArray(result.errors)
            ? result.errors.join(", ")
            : JSON.stringify(result.errors)
          : `Lỗi từ máy chủ (Mã: ${response.status})`);

      return { success: false, message: errorMsg };
    } catch {
      return { success: false, message: "Không thể kết nối đến máy chủ" };
    }
  },

  // 4. Cập nhật người dùng
  async updateUser(id: string, payload: UserUpdatePayload): Promise<ApiUserResult> {
    try {
      const response = await fetch(`${API_BASE_URL}/Users/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const result = await parseResponse(response);

      if (result.success && response.ok) {
        return {
          success: true,
          message: result.message || "Cập nhật tài khoản thành công",
        };
      }

      const errorMsg =
        result.message ||
        (result.errors
          ? Array.isArray(result.errors)
            ? result.errors.join(", ")
            : JSON.stringify(result.errors)
          : `Lỗi từ máy chủ (Mã: ${response.status})`);

      return { success: false, message: errorMsg };
    } catch {
      return { success: false, message: "Không thể kết nối đến máy chủ" };
    }
  },

  // 5. Xóa người dùng
  async deleteUser(id: string): Promise<ApiUserResult> {
    try {
      const response = await fetch(`${API_BASE_URL}/Users/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const result = await parseResponse(response);

      if (result.success && response.ok) {
        return {
          success: true,
          message: result.message || "Xóa tài khoản thành công",
        };
      }

      const errorMsg =
        result.message ||
        (result.errors
          ? Array.isArray(result.errors)
            ? result.errors.join(", ")
            : JSON.stringify(result.errors)
          : `Lỗi từ máy chủ (Mã: ${response.status})`);

      return { success: false, message: errorMsg };
    } catch {
      return { success: false, message: "Không thể kết nối đến máy chủ" };
    }
  },
};
