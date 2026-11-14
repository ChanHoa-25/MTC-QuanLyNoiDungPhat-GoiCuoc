import axiosInstance from "./axiosInstance";
import type { ApiResponse } from "../types/api.types";

export interface MediaApiItem {
  id: string;
  mediaName: string;
  fileName: string | null;
  fileType: string | null;
  sourceType: number;
  fileSize: number;
  durationSeconds: number | null;
  approvalStatus: string;
  rejectionReason: string | null;
  url: string | null;
  sourceUrl: string | null;
  frequencyHz: number | null;
  categoryId: string | null;
  organizationId: string | null;
  facilityId: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string | null;
}
export interface CreateMediaRequest {
  mediaName: string;
  fileType: string;
  sourceType: number;
  facilityId: string;
  sourceUrl?: string | null;
  url?: string | null;
  frequencyHz?: number | null;
  categoryId?: string | null;
}
export interface UpdateMediaRequest {
  mediaName: string;
  fileType: string;
  sourceType: number;
  facilityId: string;
  sourceUrl?: string | null;
  url?: string | null;
  frequencyHz?: number | null;
  categoryId?: string | null;
}
//Chưa có xóa
export interface RejectMediaRequest {
  rejectionReason: string;
}
type MediaListResponse = ApiResponse<MediaApiItem[]>;
type MediaDetailResponse = ApiResponse<MediaApiItem>;

const checkResult = <T>(result: ApiResponse<T>): T => {
  if (!result.success) {
    throw new Error(result.message || "Không thể tải dữ liệu Media");
  }

  return result.data;
};

const mediaApi = {
  getAll: async (): Promise<MediaApiItem[]> => {
    const response = await axiosInstance.get<MediaListResponse>("/media");
    return checkResult(response.data);
  },

  getById: async (id: string): Promise<MediaApiItem> => {
    const response = await axiosInstance.get<MediaDetailResponse>(
      `/media/${encodeURIComponent(id)}`,
    );

    return checkResult(response.data);
  },
  create: async (data: CreateMediaRequest): Promise<MediaApiItem> => {
    const response = await axiosInstance.post<ApiResponse<MediaApiItem>>(
      "/media",
      data,
    );

    return checkResult(response.data);
  },
  update: async (
    id: string,
    data: UpdateMediaRequest,
  ): Promise<MediaApiItem> => {
    const response = await axiosInstance.put<ApiResponse<MediaApiItem>>(
      `/media/${encodeURIComponent(id)}`,
      data,
    );

    return checkResult(response.data);
  },
  approve: async (id: string): Promise<MediaApiItem> => {
    const response = await axiosInstance.post<ApiResponse<MediaApiItem>>(
      `/media/${encodeURIComponent(id)}/approve`,
    );

    return checkResult(response.data);
  },
  reject: async (
    id: string,
    data: RejectMediaRequest,
  ): Promise<MediaApiItem> => {
    const response = await axiosInstance.post<ApiResponse<MediaApiItem>>(
      `/media/${encodeURIComponent(id)}/reject`,
      data,
    );

    return checkResult(response.data);
  },
};

export default mediaApi;
