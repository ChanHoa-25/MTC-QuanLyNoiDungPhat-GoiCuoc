import { useCallback, useMemo, useRef, useState } from "react";
import axios from "axios";

import { facilityApi } from "../../../api/facilityApi";

import type {
  Facility,
  FacilityAction,
  FacilityFormValues,
} from "../types/facility.types";

import { findFacilityById } from "../utils/facility.utils";

type FacilityModalType = "create" | "edit" | "delete" | null;

interface UseFacilityCrudProps {
  facilities: Facility[];
  activeModal: FacilityModalType;
  setActiveModal: (value: FacilityModalType) => void;

  targetFacility: Facility | null;
  setTargetFacility: (facility: Facility | null) => void;

  closeFacilityModal: () => void;
  refreshFacilities: () => Promise<void>;

  onInfo: (content: string) => void;
  onSuccess: (content: string) => void;
  onError: (content: string) => void;
}

// Lấy thông báo lỗi từ Axios hoặc API.
function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | {
          message?: string;
          errors?: unknown;
        }
      | undefined;

    if (data?.message) {
      return data.message;
    }

    if (Array.isArray(data?.errors)) {
      const messages = data.errors.filter(
        (item): item is string => typeof item === "string",
      );

      if (messages.length > 0) {
        return messages.join(", ");
      }
    }

    if (error.response?.status === 409) {
      return "Dữ liệu đã tồn tại hoặc bị trùng.";
    }

    if (error.response?.status === 400) {
      return "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.";
    }

    if (error.response?.status === 401) {
      return "Phiên đăng nhập không hợp lệ.";
    }

    if (error.response?.status === 403) {
      return "Bạn không có quyền thực hiện thao tác này.";
    }

    if (error.response?.status === 500) {
      return "Máy chủ gặp lỗi. Vui lòng kiểm tra dữ liệu hoặc liên hệ Back-end.";
    }

    if (!error.response) {
      return "Không thể kết nối đến máy chủ.";
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export function useFacilityCrud({
  facilities,
  activeModal,
  setActiveModal,
  targetFacility,
  setTargetFacility,
  closeFacilityModal,
  refreshFacilities,
  onInfo,
  onSuccess,
  onError,
}: UseFacilityCrudProps) {
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);

  const handleFacilityAction = useCallback(
    (action: FacilityAction, facility: Facility) => {
      if (submittingRef.current) return;

      setTargetFacility(facility);

      switch (action) {
        case "create":
          setActiveModal("create");
          break;

        case "edit":
          setActiveModal("edit");
          break;

        case "delete":
          setActiveModal("delete");
          break;
      }
    },
    [setActiveModal, setTargetFacility],
  );

  const handleCloseModal = useCallback(() => {
    if (submittingRef.current) return;
    closeFacilityModal();
  }, [closeFacilityModal]);

  const reloadAfterSuccess = useCallback(async () => {
    try {
      await refreshFacilities();
    } catch {
      onError(
        "Thao tác đã thành công nhưng không thể tải lại danh sách cơ sở.",
      );
    }
  }, [refreshFacilities, onError]);

  const handleSubmitFacility = useCallback(
    async (values: FacilityFormValues) => {
      if (
        !targetFacility ||
        submittingRef.current ||
        (activeModal !== "create" && activeModal !== "edit")
      ) {
        return;
      }

      submittingRef.current = true;
      setSubmitting(true);

      try {
        if (activeModal === "create") {
          const response = await facilityApi.create({
            organizationId: targetFacility.organizationId,
            facilityCode: values.facilityCode.trim(),
            facilityName: values.facilityName.trim(),
            parentId: targetFacility.id,
          });

          if (!response.success) {
            throw new Error(response.message || "Không thể thêm cơ sở");
          }

          closeFacilityModal();
          onSuccess(response.message || "Thêm cơ sở thành công");

          await reloadAfterSuccess();
        } else {
          const response = await facilityApi.update(targetFacility.id, {
            facilityName: values.facilityName.trim(),
            isActive: values.isActive,
          });

          if (!response.success) {
            throw new Error(response.message || "Không thể cập nhật cơ sở");
          }

          closeFacilityModal();
          onSuccess(response.message || "Cập nhật cơ sở thành công");

          await reloadAfterSuccess();
        }
      } catch (error) {
        console.error("Lỗi lưu cơ sở:", error);

        onError(getErrorMessage(error, "Không thể lưu thông tin cơ sở"));
      } finally {
        submittingRef.current = false;
        setSubmitting(false);
      }
    },
    [
      targetFacility,
      activeModal,
      closeFacilityModal,
      onSuccess,
      onError,
      reloadAfterSuccess,
    ],
  );

  const handleDeleteFacility = useCallback(async () => {
    if (!targetFacility || submittingRef.current) return;

    submittingRef.current = true;
    setSubmitting(true);

    try {
      const response = await facilityApi.delete(targetFacility.id);

      if (!response.success) {
        throw new Error(response.message || "Không thể xóa cơ sở");
      }

      closeFacilityModal();
      onSuccess(response.message || "Xóa cơ sở thành công");

      await reloadAfterSuccess();
    } catch (error) {
      console.error("Lỗi xóa cơ sở:", error);

      onError(getErrorMessage(error, "Không thể xóa cơ sở"));
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }, [
    targetFacility,
    closeFacilityModal,
    onSuccess,
    onError,
    reloadAfterSuccess,
  ]);

  const parentFacility = useMemo(() => {
    if (activeModal !== "edit" || !targetFacility?.parentId) {
      return null;
    }

    return findFacilityById(facilities, targetFacility.parentId);
  }, [activeModal, targetFacility, facilities]);

  const initialValues = useMemo(
    () => ({
      facilityName:
        activeModal === "create" ? "" : (targetFacility?.facilityName ?? ""),

      facilityCode:
        activeModal === "create" ? "" : (targetFacility?.facilityCode ?? ""),

      isActive:
        activeModal === "create" ? true : (targetFacility?.isActive ?? true),

      parentName:
        activeModal === "create"
          ? (targetFacility?.facilityName ?? "")
          : (parentFacility?.facilityName ?? ""),
    }),
    [activeModal, targetFacility, parentFacility],
  );

  // Giữ tương thích với interface hook hiện tại.
  void onInfo;

  return {
    handleFacilityAction,
    handleCloseModal,
    handleSubmitFacility,
    handleDeleteFacility,
    initialValues,
    submitting,
  };
}
