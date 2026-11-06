import { useMemo } from "react";
import {
  Plus,
  Trash2,
  Volume2,
  RefreshCw,
  FileCheckCorner,
} from "lucide-react";

import type { AppActionPanelItem } from "../../../components/common/AppActionPanel";
import DeviceVolumeControl from "../FacilityDevices/DeviceVolumeControl/DeviceVolumeControl";

type FacilityTabKey =
  | "info"
  | "users"
  | "devices"
  | "media"
  | "templates"
  | "playlists";

interface UseFacilityActionsProps {
  activeTab: FacilityTabKey;
  hasSelectedFacility: boolean;

  selectedUserCount: number;
  selectedDeviceCount: number;
  selectedMediaCount: number;
  selectedTemplateCount: number;
  selectedPlaylistCount: number;

  deviceVolume: number;
  volumePopoverOpen: boolean;
  onVolumeChange: (value: number) => void;
  onVolumePopoverOpenChange: (open: boolean) => void;

  onAddUser: () => void;
  onDeleteUser: () => void;

  onAddDevice: () => void;
  onRestartDevice: () => void;
  onDeleteDevice: () => void;

  onAddMedia: () => void;
  onDeleteMedia: () => void;
  onApproveMedia: () => void;

  onAddTemplate: () => void;
  onDeleteTemplate: () => void;

  onAddPlaylist: () => void;
  onDeletePlaylist: () => void;
}

export function useFacilityActions({
  activeTab,
  hasSelectedFacility,

  selectedUserCount,
  selectedDeviceCount,
  selectedMediaCount,
  selectedTemplateCount,
  selectedPlaylistCount,

  deviceVolume,
  volumePopoverOpen,
  onVolumeChange,
  onVolumePopoverOpenChange,

  onAddUser,
  onDeleteUser,

  onAddDevice,
  onRestartDevice,
  onDeleteDevice,

  onAddMedia,
  onDeleteMedia,
  onApproveMedia,

  onAddTemplate,
  onDeleteTemplate,

  onAddPlaylist,
  onDeletePlaylist,
}: UseFacilityActionsProps): AppActionPanelItem[] {
  return useMemo(() => {
    if (!hasSelectedFacility) return [];

    switch (activeTab) {
      case "users":
        return [
          {
            key: "add-user",
            icon: <Plus />,
            tooltip: "Thêm tài khoản quản trị",
            onClick: onAddUser,
          },
          {
            key: "delete-user",
            icon: <Trash2 />,
            tooltip: "Xóa tài khoản đã chọn",
            danger: true,
            disabled: selectedUserCount === 0,
            onClick: onDeleteUser,
          },
        ];

      case "devices":
        return [
          {
            key: "add-device",
            icon: <Plus />,
            tooltip: "Thêm thiết bị",
            onClick: onAddDevice,
          },
          {
            key: "volume-device",
            icon: <Volume2 />,
            tooltip: "Điều chỉnh âm lượng",
            disabled: selectedDeviceCount === 0,
            popover: (
              <DeviceVolumeControl
                initialValue={deviceVolume}
                onChange={onVolumeChange}
              />
            ),
            popoverOpen: volumePopoverOpen,
            onPopoverOpenChange: onVolumePopoverOpenChange,
          },
          {
            key: "restart-device",
            icon: <RefreshCw />,
            tooltip: "Khởi động lại thiết bị",
            disabled: selectedDeviceCount === 0,
            onClick: onRestartDevice,
          },
          {
            key: "delete-device",
            icon: <Trash2 />,
            tooltip: "Xóa thiết bị đã chọn",
            danger: true,
            disabled: selectedDeviceCount === 0,
            onClick: onDeleteDevice,
          },
        ];

      case "media":
        return [
          {
            key: "add-media",
            icon: <Plus />,
            tooltip: "Thêm Media",
            onClick: onAddMedia,
          },
          {
            key: "delete-media",
            icon: <Trash2 />,
            tooltip: "Xóa Media đã chọn",
            danger: true,
            disabled: selectedMediaCount === 0,
            onClick: onDeleteMedia,
          },
          {
            key: "approve-media",
            icon: <FileCheckCorner />,
            tooltip: "Duyệt Media đã chọn",
            disabled: selectedMediaCount === 0,
            onClick: onApproveMedia,
          },
        ];

      case "templates":
        return [
          {
            key: "add-template",
            icon: <Plus />,
            tooltip: "Thêm bản mẫu",
            onClick: onAddTemplate,
          },
          {
            key: "delete-template",
            icon: <Trash2 />,
            tooltip: "Xóa bản mẫu đã chọn",
            danger: true,
            disabled: selectedTemplateCount === 0,
            onClick: onDeleteTemplate,
          },
        ];

      case "playlists":
        return [
          {
            key: "add-playlist",
            icon: <Plus />,
            tooltip: "Thêm danh sách phát",
            onClick: onAddPlaylist,
          },
          {
            key: "delete-playlist",
            icon: <Trash2 />,
            tooltip: "Xóa danh sách phát đã chọn",
            danger: true,
            disabled: selectedPlaylistCount === 0,
            onClick: onDeletePlaylist,
          },
        ];

      case "info":
      default:
        return [];
    }
  }, [
    activeTab,
    hasSelectedFacility,
    selectedUserCount,
    selectedDeviceCount,
    selectedMediaCount,
    selectedTemplateCount,
    selectedPlaylistCount,
    deviceVolume,
    volumePopoverOpen,
    onVolumeChange,
    onVolumePopoverOpenChange,
    onAddUser,
    onDeleteUser,
    onAddDevice,
    onRestartDevice,
    onDeleteDevice,
    onAddMedia,
    onDeleteMedia,
    onApproveMedia,
    onAddTemplate,
    onDeleteTemplate,
    onAddPlaylist,
  ]);
}
