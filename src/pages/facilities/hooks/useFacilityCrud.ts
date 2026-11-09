import { useCallback, useMemo } from "react";

import type {
  Facility,
  FacilityAction,
  FacilityFormValues,
} from "../types/facility.types";

import { findFacilityById } from "../utils/facility.utils";
import {
  useFacilityContext,
  type FacilityResult,
} from "../../../contexts/FacilityContext";

type FacilityModalType = "create" | "edit" | "delete" | null;

interface UseFacilityCrudProps {
  facilities?: Facility[];
  activeModal: FacilityModalType;
  setActiveModal: (value: FacilityModalType) => void;
  targetFacility: Facility | null;
  setTargetFacility: (facility: Facility | null) => void;
  closeFacilityModal: () => void;
  onSuccess?: (content: string) => void;
  onError?: (content: string) => void;
  onInfo?: (content: string) => void;
  addFacility?: (parentId: string | null, values: FacilityFormValues) => Promise<FacilityResult>;
  updateFacility?: (id: string, values: FacilityFormValues) => Promise<FacilityResult>;
  deleteFacility?: (id: string) => Promise<FacilityResult>;
}

export function useFacilityCrud({
  facilities: propFacilities,
  activeModal,
  setActiveModal,
  targetFacility,
  setTargetFacility,
  closeFacilityModal,
  onSuccess,
  onError,
  onInfo,
  addFacility: propAddFacility,
  updateFacility: propUpdateFacility,
  deleteFacility: propDeleteFacility,
}: UseFacilityCrudProps) {
  const context = useFacilityContext();
  const facilities = propFacilities ?? context.facilities;
  const addFacility = propAddFacility ?? context.addFacility;
  const updateFacility = propUpdateFacility ?? context.updateFacility;
  const deleteFacility = propDeleteFacility ?? context.deleteFacility;

  const notifySuccess = onSuccess ?? onInfo ?? console.log;
  const notifyError = onError ?? onInfo ?? console.error;

  // Mở modal thêm, sửa hoặc xóa cơ sở
  const handleFacilityAction = useCallback(
    (action: FacilityAction, facility: Facility) => {
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

        default:
          setActiveModal(null);
          setTargetFacility(null);
      }
    },
    [setActiveModal, setTargetFacility],
  );

  // Đóng modal
  const handleCloseModal = closeFacilityModal;

  // Xác nhận thêm hoặc sửa cơ sở
  const handleSubmitFacility = useCallback(
    async (values: FacilityFormValues) => {
      if (!targetFacility) return;

      if (activeModal === "create") {
        const res = await addFacility(targetFacility.id, values);
        if (res.success) {
          notifySuccess(res.message || "Thêm cơ sở thành công!");
          handleCloseModal();
        } else {
          notifyError(res.message || "Thêm cơ sở thất bại");
        }
      } else if (activeModal === "edit") {
        const res = await updateFacility(targetFacility.id, values);
        if (res.success) {
          notifySuccess(res.message || "Cập nhật thông tin cơ sở thành công!");
          handleCloseModal();
        } else {
          notifyError(res.message || "Cập nhật cơ sở thất bại");
        }
      }
    },
    [
      targetFacility,
      activeModal,
      addFacility,
      updateFacility,
      notifySuccess,
      notifyError,
      handleCloseModal,
    ],
  );

  // Xác nhận xóa cơ sở
  const handleDeleteFacility = useCallback(async () => {
    if (!targetFacility) return;

    const res = await deleteFacility(targetFacility.id);
    if (res.success) {
      notifySuccess(res.message || "Xóa cơ sở thành công!");
      handleCloseModal();
    } else {
      notifyError(res.message || "Xóa cơ sở thất bại");
    }
  }, [
    targetFacility,
    deleteFacility,
    notifySuccess,
    notifyError,
    handleCloseModal,
  ]);

  // Tìm cơ sở cha khi sửa
  const parentFacility = useMemo(() => {
    if (activeModal !== "edit" || !targetFacility?.parentId) {
      return null;
    }

    return findFacilityById(facilities, targetFacility.parentId);
  }, [activeModal, targetFacility, facilities]);

  // Dữ liệu ban đầu cho form
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
          : (parentFacility?.facilityName ?? "—"),
    }),
    [activeModal, targetFacility, parentFacility],
  );

  return {
    handleFacilityAction,
    handleCloseModal,
    handleSubmitFacility,
    handleDeleteFacility,
    initialValues,
  };
}
