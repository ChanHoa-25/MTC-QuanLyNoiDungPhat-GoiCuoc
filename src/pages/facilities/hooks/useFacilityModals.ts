import { useState } from "react";

import type { Facility } from "../types/facility.types";

export type FacilityModalType = "create" | "edit" | "delete" | null;

export type DeviceConfirmType = "restart" | "delete" | null;

export function useFacilityModals() {
  const [activeModal, setActiveModal] = useState<FacilityModalType>(null);

  const [targetFacility, setTargetFacility] = useState<Facility | null>(null);

  const [openDeleteUser, setOpenDeleteUser] = useState(false);

  const [deviceConfirmType, setDeviceConfirmType] =
    useState<DeviceConfirmType>(null);

  const [openDeleteMedia, setOpenDeleteMedia] = useState(false);

  const [openDeleteTemplate, setOpenDeleteTemplate] = useState(false);

  const [openDeletePlaylist, setOpenDeletePlaylist] = useState(false);

  const closeFacilityModal = () => {
    setActiveModal(null);
    setTargetFacility(null);
  };

  const resetModals = () => {
    closeFacilityModal();
    setOpenDeleteUser(false);
    setDeviceConfirmType(null);
    setOpenDeleteMedia(false);
    setOpenDeleteTemplate(false);
    setOpenDeletePlaylist(false);
  };

  return {
    activeModal,
    setActiveModal,
    targetFacility,
    setTargetFacility,

    openDeleteUser,
    setOpenDeleteUser,

    deviceConfirmType,
    setDeviceConfirmType,

    openDeleteMedia,
    setOpenDeleteMedia,

    openDeleteTemplate,
    setOpenDeleteTemplate,

    openDeletePlaylist,
    setOpenDeletePlaylist,

    closeFacilityModal,
    resetModals,
  };
}
