import { useCallback, useMemo } from "react";

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
  onInfo: (content: string) => void;
}

export function useFacilityCrud({
  facilities,
  activeModal,
  setActiveModal,
  targetFacility,
  setTargetFacility,
  closeFacilityModal,
  onInfo,
}: UseFacilityCrudProps) {
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
    (values: FacilityFormValues) => {
      if (!targetFacility) return;

      if (activeModal === "create") {
        console.log("Thêm cơ sở trực thuộc", {
          parentFacilityId: targetFacility.id,
          values,
        });

        onInfo("Đã nhận thông tin thêm cơ sở. Chưa lưu vào danh sách.");
      } else if (activeModal === "edit") {
        console.log("Cập nhật thông tin cơ sở", {
          facilityId: targetFacility.id,
          values,
        });

        onInfo("Đã nhận thông tin cập nhật. Chưa lưu vào danh sách.");
      }

      handleCloseModal();
    },
    [targetFacility, activeModal, onInfo, handleCloseModal],
  );

  // Xác nhận xóa cơ sở
  const handleDeleteFacility = useCallback(() => {
    if (!targetFacility) return;

    console.log("Xóa cơ sở", {
      facilityId: targetFacility.id,
      facilityName: targetFacility.facilityName,
    });

    onInfo("Đã xác nhận xóa cơ sở. Chưa xóa dữ liệu khỏi danh sách.");

    handleCloseModal();
  }, [targetFacility, onInfo, handleCloseModal]);

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
          : (parentFacility?.facilityName ?? ""),
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
