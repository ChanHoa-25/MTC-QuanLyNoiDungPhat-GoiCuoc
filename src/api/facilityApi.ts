import axiosInstance from "./axiosInstance";
import type { ApiResponse } from "../types/api.types";
import type {
  Facility,
  FacilityTreeNode,
  CreateFacilityDto,
  UpdateFacilityDto,
} from "../types/facility.types";

export const facilityApi = {
  // Lấy danh sách cơ sở theo tổ chức
  getByOrganization: async (
    organizationId: string,
  ): Promise<ApiResponse<Facility[]>> => {
    const response = await axiosInstance.get<ApiResponse<Facility[]>>(
      `/Facilities/organization/${organizationId}`,
    );

    return response.data;
  },

  // Lấy cây cơ sở phân cấp
  getTree: async (
    organizationId: string,
  ): Promise<ApiResponse<FacilityTreeNode[]>> => {
    const response = await axiosInstance.get<ApiResponse<FacilityTreeNode[]>>(
      `/Facilities/tree/${organizationId}`,
    );

    return response.data;
  },

  // Lấy chi tiết cơ sở
  getById: async (id: string): Promise<ApiResponse<Facility>> => {
    const response = await axiosInstance.get<ApiResponse<Facility>>(
      `/Facilities/${id}`,
    );

    return response.data;
  },

  // Thêm mới cơ sở
  create: async (data: CreateFacilityDto): Promise<ApiResponse<Facility>> => {
    const response = await axiosInstance.post<ApiResponse<Facility>>(
      "/Facilities",
      data,
    );

    return response.data;
  },

  // Cập nhật cơ sở
  update: async (
    id: string,
    data: UpdateFacilityDto,
  ): Promise<ApiResponse<Facility>> => {
    const response = await axiosInstance.put<ApiResponse<Facility>>(
      `/Facilities/${id}`,
      data,
    );

    return response.data;
  },

  // Xóa cơ sở
  delete: async (id: string): Promise<ApiResponse<boolean>> => {
    const response = await axiosInstance.delete<ApiResponse<boolean>>(
      `/Facilities/${id}`,
    );

    return response.data;
  },
};
