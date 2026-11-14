import { useCallback, useEffect, useRef, useState } from "react";
import type { Key } from "react";
import axios from "axios";

import deviceCommandApi from "../../../api/deviceCommandApi";

type DeviceConfirmType = "restart" | "delete" | null;

interface UseFacilityDeviceActionsProps {
  selectedDeviceKeys: Key[];
  deviceConfirmType: DeviceConfirmType;
  setDeviceConfirmType: (type: DeviceConfirmType) => void;
  onWarning: (content: string) => void;
  onInfo: (content: string) => void;
}

function getCommandError(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; errors?: string[] | null }
      | undefined;

    return (
      data?.errors?.filter(Boolean).join("; ") || data?.message || fallback
    );
  }

  return error instanceof Error ? error.message : fallback;
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
  const [commandLoading, setCommandLoading] = useState(false);

  const volumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const commandInProgressRef = useRef(false);

  const selectedIds = selectedDeviceKeys.map(String);
  const selectedIdsKey = selectedIds.join(",");

  const clearVolumeTimer = useCallback(() => {
    if (volumeTimerRef.current !== null) {
      clearTimeout(volumeTimerRef.current);
      volumeTimerRef.current = null;
    }
  }, []);

  // Hủy lệnh âm lượng đang chờ khi thay đổi lựa chọn
  // hoặc khi component bị unmount.
  useEffect(() => {
    return () => {
      clearVolumeTimer();
    };
  }, [selectedIdsKey, clearVolumeTimer]);

  const handleAddDevice = useCallback(() => {
    clearVolumeTimer();
    setOpenCreateDevice(true);
    setVolumePopoverOpen(false);
  }, [clearVolumeTimer]);

  const handleCloseCreateDevice = useCallback(() => {
    setOpenCreateDevice(false);
  }, []);

  const handleVolumeChange = useCallback(
    (value: number) => {
      if (selectedIds.length === 0) {
        onWarning("Vui lòng chọn thiết bị cần điều chỉnh âm lượng.");
        return;
      }

      if (!Number.isInteger(value) || value < 0 || value > 100) {
        onWarning("Âm lượng phải nằm trong khoảng 0 đến 100.");
        return;
      }

      setDeviceVolume(value);
      clearVolumeTimer();

      const ids = [...selectedIds];

      // Chỉ gửi sau khi ngừng thay đổi 500ms.
      volumeTimerRef.current = setTimeout(async () => {
        volumeTimerRef.current = null;

        if (commandInProgressRef.current) {
          onWarning("Đang xử lý lệnh thiết bị, vui lòng thử lại.");
          return;
        }

        commandInProgressRef.current = true;
        setCommandLoading(true);

        try {
          if (ids.length === 1) {
            await deviceCommandApi.setVolume(ids[0], value);
          } else {
            await deviceCommandApi.setVolumeMany(ids, value);
          }

          onInfo("Đã gửi lệnh điều chỉnh âm lượng.");
        } catch (error) {
          onWarning(getCommandError(error, "Không thể điều chỉnh âm lượng."));
        } finally {
          commandInProgressRef.current = false;
          setCommandLoading(false);
        }
      }, 500);
    },
    [selectedIdsKey, clearVolumeTimer, onWarning, onInfo],
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

    if (commandInProgressRef.current) {
      onWarning("Đang xử lý lệnh thiết bị.");
      return;
    }

    clearVolumeTimer();
    setVolumePopoverOpen(false);
    setDeviceConfirmType("restart");
  }, [
    selectedDeviceKeys.length,
    onWarning,
    clearVolumeTimer,
    setDeviceConfirmType,
  ]);

  const handleOpenDeleteDevice = useCallback(() => {
    if (selectedDeviceKeys.length === 0) {
      onWarning("Vui lòng chọn thiết bị cần xóa.");
      return;
    }

    clearVolumeTimer();
    setVolumePopoverOpen(false);
    setDeviceConfirmType("delete");
  }, [
    selectedDeviceKeys.length,
    onWarning,
    clearVolumeTimer,
    setDeviceConfirmType,
  ]);

  const handleCloseDeviceConfirm = useCallback(() => {
    if (commandInProgressRef.current) return;
    setDeviceConfirmType(null);
  }, [setDeviceConfirmType]);

  const handleConfirmDeviceAction = useCallback(async () => {
    const ids = selectedDeviceKeys.map(String);

    if (ids.length === 0) {
      setDeviceConfirmType(null);
      return;
    }

    // Giữ nguyên luồng xóa đã hoạt động.
    if (deviceConfirmType === "delete") {
      setDeleteDeviceRequestId((previous) => previous + 1);
      setDeviceConfirmType(null);
      return;
    }

    if (deviceConfirmType !== "restart") return;

    if (commandInProgressRef.current) return;

    clearVolumeTimer();
    commandInProgressRef.current = true;
    setCommandLoading(true);

    try {
      if (ids.length === 1) {
        await deviceCommandApi.reboot(ids[0]);
      } else {
        await deviceCommandApi.rebootMany(ids);
      }

      onInfo("Đã gửi lệnh khởi động lại thiết bị.");
      setDeviceConfirmType(null);
    } catch (error) {
      onWarning(getCommandError(error, "Không thể gửi lệnh khởi động lại."));
    } finally {
      commandInProgressRef.current = false;
      setCommandLoading(false);
    }
  }, [
    selectedDeviceKeys,
    deviceConfirmType,
    setDeviceConfirmType,
    clearVolumeTimer,
    onInfo,
    onWarning,
  ]);

  useEffect(() => {
    if (selectedDeviceKeys.length === 0) {
      setVolumePopoverOpen(false);
    }
  }, [selectedDeviceKeys.length]);

  const resetDeviceState = useCallback(() => {
    clearVolumeTimer();
    setOpenCreateDevice(false);
    setDeviceConfirmType(null);
    setVolumePopoverOpen(false);
  }, [clearVolumeTimer, setDeviceConfirmType]);

  return {
    openCreateDevice,
    deleteDeviceRequestId,
    volumePopoverOpen,
    deviceVolume,
    commandLoading,

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
