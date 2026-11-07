import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import type {
  Facility,
  FacilityFormValues,
} from "../pages/facilities/types/facility.types";

import {
  findFacilityById,
  findFacilityPath,
} from "../pages/facilities/utils/facility.utils";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5006/api";

export interface FacilityResult {
  success: boolean;
  message?: string;
}

interface FacilityContextType {
  facilities: Facility[];
  setFacilities: (facilities: Facility[]) => void;

  selectedFacilityId: string | null;
  setSelectedFacilityId: (id: string | null) => void;

  selectedFacility: Facility | null;
  selectedFacilityPath: Facility[];

  loading: boolean;
  refreshFacilities: () => Promise<void>;

  addFacility: (parentId: string | null, values: FacilityFormValues) => Promise<FacilityResult>;
  updateFacility: (id: string, values: FacilityFormValues) => Promise<FacilityResult>;
  deleteFacility: (id: string) => Promise<FacilityResult>;
}

const FacilityContext = createContext<FacilityContextType | undefined>(undefined);

interface FacilityProviderProps {
  children: ReactNode;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

export function FacilityProvider({ children }: FacilityProviderProps) {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [orgId, setOrgId] = useState<string>("");

  // 1. Tải cây cơ sở từ Backend
  const loadFacilities = async () => {
    try {
      setLoading(true);
      const userStr = localStorage.getItem("currentUser");
      const user = userStr ? JSON.parse(userStr) : null;

      let currentOrgId = user?.organizationId;
      if (!currentOrgId) {
        const orgRes = await fetch(`${API_BASE_URL}/Organizations`, {
          headers: getAuthHeaders(),
        });
        const orgData = await orgRes.json();
        currentOrgId = orgData.data?.[0]?.id;
      }

      if (!currentOrgId) return;
      setOrgId(currentOrgId);

      const res = await fetch(`${API_BASE_URL}/Facilities/tree/${currentOrgId}`, {
        headers: getAuthHeaders(),
      });
      const result = await res.json();

      if (result.success && Array.isArray(result.data)) {
        setFacilities(result.data);
        if (result.data.length > 0) {
          setSelectedFacilityId((prev) => {
            if (prev && findFacilityById(result.data, prev)) return prev;
            return result.data[0].id;
          });
        }
      }
    } catch (err) {
      console.error("Lỗi nạp cây cơ sở:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFacilities();
  }, []);

  const selectedFacility = useMemo(() => {
    if (!selectedFacilityId) return null;
    return findFacilityById(facilities, selectedFacilityId);
  }, [facilities, selectedFacilityId]);

  const selectedFacilityPath = useMemo(() => {
    if (!selectedFacilityId) return [];
    return findFacilityPath(facilities, selectedFacilityId);
  }, [facilities, selectedFacilityId]);

  // 2. Thêm cơ sở
  const addFacility = async (parentId: string | null, values: FacilityFormValues): Promise<FacilityResult> => {
    try {
      const response = await fetch(`${API_BASE_URL}/Facilities`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          organizationId: orgId,
          facilityCode: values.facilityCode.trim(),
          facilityName: values.facilityName.trim(),
          parentId: parentId || null,
        }),
      });
      const result = await response.json();
      if (result.success) {
        await loadFacilities();
        if (result.data?.id) {
          setSelectedFacilityId(result.data.id);
        }
        return { success: true, message: result.message || "Thêm cơ sở thành công" };
      }
      return { success: false, message: result.message || "Thêm cơ sở thất bại" };
    } catch {
      return { success: false, message: "Không thể kết nối đến máy chủ" };
    }
  };

  // 3. Cập nhật cơ sở
  const updateFacility = async (id: string, values: FacilityFormValues): Promise<FacilityResult> => {
    try {
      const response = await fetch(`${API_BASE_URL}/Facilities/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          facilityName: values.facilityName.trim(),
          isActive: values.isActive,
        }),
      });
      const result = await response.json();
      if (result.success) {
        await loadFacilities();
        return { success: true, message: result.message || "Cập nhật cơ sở thành công" };
      }
      return { success: false, message: result.message || "Cập nhật cơ sở thất bại" };
    } catch {
      return { success: false, message: "Không thể kết nối đến máy chủ" };
    }
  };

  // 4. Xóa cơ sở
  const deleteFacility = async (id: string): Promise<FacilityResult> => {
    try {
      const response = await fetch(`${API_BASE_URL}/Facilities/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const result = await response.json();
      if (result.success) {
        await loadFacilities();
        return { success: true, message: result.message || "Xóa cơ sở thành công" };
      }
      return { success: false, message: result.message || "Xóa cơ sở thất bại" };
    } catch {
      return { success: false, message: "Không thể kết nối đến máy chủ" };
    }
  };

  return (
    <FacilityContext.Provider
      value={{
        facilities,
        setFacilities,
        selectedFacilityId,
        setSelectedFacilityId,
        selectedFacility,
        selectedFacilityPath,
        loading,
        refreshFacilities: loadFacilities,
        addFacility,
        updateFacility,
        deleteFacility,
      }}>
      {children}
    </FacilityContext.Provider>
  );
}

export function useFacilityContext() {
  const context = useContext(FacilityContext);

  if (!context) {
    throw new Error(
      "useFacilityContext phải được sử dụng trong FacilityProvider",
    );
  }

  return context;
}
