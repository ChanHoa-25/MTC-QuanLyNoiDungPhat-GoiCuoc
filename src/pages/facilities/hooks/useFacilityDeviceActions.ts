import { useCallback, useEffect, useState } from "react";
import type { Key } from "react";

type DeviceConfirmType = "restart" | "delete" | null;

interface UseFacilityDeviceActionsProps {
  selectedDeviceKeys: Key[];
  deviceConfirmType: DeviceConfirmType;
  setDeviceConfirmType: (type: DeviceConfirmType) => void;
  onWarning: (content: string) => void;
  onInfo: (content: string) => void;
}

export function useFacilityDeviceActions({
  selectedDeviceKeys,
  deviceConfirmType,
  setDeviceConfirmType,
  onWarning,
  onInfo,
}: UseFacilityDeviceActionsProps) {
  const [openCreateDevice, setOpenCreateDevice] = useState(false);

  const [deleteDeviceRequestId, setDeleteDeviceRequestId] = useState(0);

  const [volumePopoverOpen, setVolumePopoverOpen] = useState(false);

  const [deviceVolume, setDeviceVolume] = useState(50);

  const handleAddDevice = useCallback(() => {
    setOpenCreateDevice(true);
    setVolumePopoverOpen(false);
  }, []);

  const handleCloseCreateDevice = useCallback(() => {
    setOpenCreateDevice(false);
  }, []);

  const handleVolumeChange = useCallback(
    (value: number) => {
      setDeviceVolume(value);

      console.log("Cập nhật âm lượng", {
        volume: value,
        deviceKeys: selectedDeviceKeys,
      });
    },
    [selectedDeviceKeys],
  );

  const handleVolumePopoverOpenChange = useCallback(
    (open: boolean) => {
      setVolumePopoverOpen(open && selectedDeviceKeys.length > 0);
    },
    [selectedDeviceKeys.length],
  );

  const handleOpenRestartDevice = useCallback(() => {
    if (selectedDeviceKeys.length === 0) {
      onWarning("Vui lòng chọn thiết bị cần khởi động lại.");
      return;
    }

    setVolumePopoverOpen(false);
    setDeviceConfirmType("restart");
  }, [selectedDeviceKeys, onWarning, setDeviceConfirmType]);

  const handleOpenDeleteDevice = useCallback(() => {
    if (selectedDeviceKeys.length === 0) {
      onWarning("Vui lòng chọn thiết bị cần xóa.");
      return;
    }

    setVolumePopoverOpen(false);
    setDeviceConfirmType("delete");
  }, [selectedDeviceKeys, onWarning, setDeviceConfirmType]);

  const handleCloseDeviceConfirm = useCallback(() => {
    setDeviceConfirmType(null);
  }, [setDeviceConfirmType]);

  const handleConfirmDeviceAction = useCallback(() => {
    if (selectedDeviceKeys.length === 0) {
      setDeviceConfirmType(null);
      return;
    }

    if (deviceConfirmType === "restart") {
      console.log("Yêu cầu khởi động lại thiết bị:", selectedDeviceKeys);

      onInfo("Đã xác nhận yêu cầu khởi động lại. Chưa gửi lệnh đến thiết bị.");
    }

    if (deviceConfirmType === "delete") {
      setDeleteDeviceRequestId((previous) => previous + 1);
    }

    setDeviceConfirmType(null);
  }, [selectedDeviceKeys, deviceConfirmType, setDeviceConfirmType, onInfo]);

  useEffect(() => {
    if (selectedDeviceKeys.length === 0) {
      setVolumePopoverOpen(false);
    }
  }, [selectedDeviceKeys.length]);

  const resetDeviceState = useCallback(() => {
    setOpenCreateDevice(false);
    setDeviceConfirmType(null);
    setVolumePopoverOpen(false);
  }, [setDeviceConfirmType]);

  return {
    openCreateDevice,
    deleteDeviceRequestId,
    volumePopoverOpen,
    deviceVolume,

    handleAddDevice,
    handleCloseCreateDevice,
    handleVolumeChange,
    handleVolumePopoverOpenChange,
    handleOpenRestartDevice,
    handleOpenDeleteDevice,
    handleCloseDeviceConfirm,
    handleConfirmDeviceAction,

    resetDeviceState,
  };
}
