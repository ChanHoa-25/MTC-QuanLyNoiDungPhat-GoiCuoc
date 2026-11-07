import { useCallback, useEffect, useMemo, useState } from "react";
import type { Key } from "react";
import { message } from "antd";
import {
  Plus,
  Trash2,
  Volume2,
  RefreshCw,
  FileCheckCorner,
} from "lucide-react";
import AppTabs from "../../components/common/AppTabs";
import AppConfirmModal from "../../components/common/AppConfirmModal";
import type { AppActionPanelItem } from "../../components/common/AppActionPanel";
import { useFacilityContext } from "../../contexts/FacilityContext";
import { useActionPanel } from "../../contexts/ActionPanelContext";
import LocationTree from "./components/LocationTree/LocationTree";
import FacilityInfo from "./components/FacilityInfo/FacilityInfo";
import FacilityFormModal from "./components/FacilityFormModal";
import FacilityUsers from "./components/FacilityUsers";
import FacilityDevices from "./components/FacilityDevices";
import DeviceVolumeControl from "./components/DeviceVolumeControl/DeviceVolumeControl";
import FacilityTemplates from "./components/FacilityTemplates";
import FacilityPlaylists from "./components/FacilityPlaylists/FacilityPlaylists";
import FacilityMedia from "./components/FacilityMedia";
import type { FacilityFormValues } from "./types/facility.types";
import type {
  Facility,
  FacilityAction,
  FacilityTab,
  FacilityTabKey,
} from "./types/facility.types";
import FacilitiesShareModal from "./components/FacilitiesShareModal";
import { findFacilityById } from "./utils/facility.utils";
import "./FacilitiesPage.css";
const facilityTabs: FacilityTab[] = [
  { key: "info", label: "Thông tin cơ sở" },
  { key: "users", label: "Quản lý người dùng" },
  { key: "devices", label: "Thiết bị" },
  { key: "media", label: "Media" },
  { key: "templates", label: "Bản mẫu" },
  { key: "playlists", label: "Danh sách phát" },
];
type FacilityModalType = "create" | "edit" | "delete" | null;
type DeviceConfirmType = "restart" | "delete" | null;

function FacilitiesPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const {
    facilities,
    selectedFacilityId,
    setSelectedFacilityId,
    selectedFacility,
    addFacility,
    updateFacility,
    deleteFacility,
  } = useFacilityContext();
  const { setActions } = useActionPanel();
  const [activeTab, setActiveTab] = useState<FacilityTabKey>("info");
  const [activeModal, setActiveModal] = useState<FacilityModalType>(null);
  const [targetFacility, setTargetFacility] = useState<Facility | null>(null);
  const [selectedUserKeys, setSelectedUserKeys] = useState<Key[]>([]);
  const [openCreateUser, setOpenCreateUser] = useState(false);
  const [openDeleteUser, setOpenDeleteUser] = useState(false);
  const [deleteUserRequestId, setDeleteUserRequestId] = useState(0);
  const [selectedDeviceKeys, setSelectedDeviceKeys] = useState<Key[]>([]);
  const [openCreateDevice, setOpenCreateDevice] = useState(false);
  const [deleteDeviceRequestId, setDeleteDeviceRequestId] = useState(0);
  const [deviceConfirmType, setDeviceConfirmType] =
    useState<DeviceConfirmType>(null);
  const [volumePopoverOpen, setVolumePopoverOpen] = useState(false);
  const [deviceVolume, setDeviceVolume] = useState(50);
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>([]);
  const [openCreateMedia, setOpenCreateMedia] = useState(false);
  const [openDeleteMedia, setOpenDeleteMedia] = useState(false);
  const [deleteMediaRequestId, setDeleteMediaRequestId] = useState(0);
  const [approveMediaRequestId, setApproveMediaRequestId] = useState(0);
  const [selectedTemplateKeys, setSelectedTemplateKeys] = useState<Key[]>([]);
  const [openCreateTemplate, setOpenCreateTemplate] = useState(false);
  const [openDeleteTemplate, setOpenDeleteTemplate] = useState(false);
  const [deleteTemplateRequestId, setDeleteTemplateRequestId] = useState(0);
  const [selectedPlaylistKeys, setSelectedPlaylistKeys] = useState<Key[]>([]);
  const [openCreatePlaylist, setOpenCreatePlaylist] = useState(false);
  const [openDeletePlaylist, setOpenDeletePlaylist] = useState(false);
  const [deletePlaylistRequestId, setDeletePlaylistRequestId] = useState(0);
  const [shareOpen, setShareOpen] = useState(false);
  const resetTabState = () => {
    setSelectedUserKeys([]);
    setSelectedDeviceKeys([]);
    setSelectedTemplateKeys([]);
    setSelectedPlaylistKeys([]);
    setOpenCreateUser(false);
    setOpenDeleteUser(false);
    setOpenCreateDevice(false);
    setDeviceConfirmType(null);
    setVolumePopoverOpen(false);
    setOpenCreateTemplate(false);
    setOpenDeleteTemplate(false);
    setOpenCreatePlaylist(false);
    setOpenDeletePlaylist(false);
    setSelectedMediaIds([]);
    setOpenCreateMedia(false);
    setOpenDeleteMedia(false);
  };

  const handleSelectFacility = (facility: Facility) => {
    setSelectedFacilityId(facility.id);
    setActiveTab("info");
    resetTabState();
    setActiveModal(null);
    setTargetFacility(null);
  };
  const handleFacilityAction = (action: FacilityAction, facility: Facility) => {
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
  };
  const handleCloseModal = () => {
    setActiveModal(null);
    setTargetFacility(null);
  };
  const handleSubmitFacility = async (values: FacilityFormValues) => {
    if (!targetFacility) return;
    if (activeModal === "create") {
      const res = await addFacility(targetFacility.id, values);
      if (res.success) {
        messageApi.success(res.message || "Thêm cơ sở thành công!");
        handleCloseModal();
      } else {
        messageApi.error(res.message);
      }
    } else if (activeModal === "edit") {
      const res = await updateFacility(targetFacility.id, values);
      if (res.success) {
        messageApi.success(res.message || "Cập nhật thông tin cơ sở thành công!");
        handleCloseModal();
      } else {
        messageApi.error(res.message);
      }
    }
  };
  const handleDeleteFacility = async () => {
    if (!targetFacility) return;
    const res = await deleteFacility(targetFacility.id);
    if (res.success) {
      messageApi.success(res.message || "Xóa cơ sở thành công!");
      handleCloseModal();
    } else {
      messageApi.error(res.message);
    }
  };
  const handleConfirmDeleteUser = () => {
    if (selectedUserKeys.length > 0) {
      setDeleteUserRequestId((previous) => previous + 1);
    }
    setOpenDeleteUser(false);
  };
  const handleDeleteUserComplete = () => {
    setOpenDeleteUser(false);
    setSelectedUserKeys([]);
  };
  const handleAddDevice = useCallback(() => {
    setOpenCreateDevice(true);
    setVolumePopoverOpen(false);
  }, []);
  const handleCloseCreateDevice = () => {
    setOpenCreateDevice(false);
  };
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
  const handleOpenRestartDevice = useCallback(() => {
    if (selectedDeviceKeys.length === 0) {
      messageApi.warning("Vui lòng chọn thiết bị cần khởi động lại.");
      return;
    }
    setVolumePopoverOpen(false);
    setDeviceConfirmType("restart");
  }, [messageApi, selectedDeviceKeys]);
  const handleOpenDeleteDevice = useCallback(() => {
    if (selectedDeviceKeys.length === 0) {
      messageApi.warning("Vui lòng chọn thiết bị cần xóa.");
      return;
    }
    setVolumePopoverOpen(false);
    setDeviceConfirmType("delete");
  }, [messageApi, selectedDeviceKeys]);
  const handleCloseDeviceConfirm = () => {
    setDeviceConfirmType(null);
  };
  const handleConfirmDeviceAction = () => {
    if (selectedDeviceKeys.length === 0) {
      setDeviceConfirmType(null);
      return;
    }
    if (deviceConfirmType === "restart") {
      console.log("Yêu cầu khởi động lại thiết bị:", selectedDeviceKeys);
      messageApi.info(
        "Đã xác nhận yêu cầu khởi động lại. Chưa gửi lệnh đến thiết bị.",
      );
    }
    if (deviceConfirmType === "delete") {
      setDeleteDeviceRequestId((previous) => previous + 1);
    }
    setDeviceConfirmType(null);
  };
  const handleConfirmDeleteTemplate = () => {
    if (selectedTemplateKeys.length > 0) {
      setDeleteTemplateRequestId((previous) => previous + 1);
    }
    setOpenDeleteTemplate(false);
  };
  const handleConfirmDeletePlaylist = () => {
    if (selectedPlaylistKeys.length > 0) {
      setDeletePlaylistRequestId((previous) => previous + 1);
    }
    setOpenDeletePlaylist(false);
  };
  const handleConfirmDeleteMedia = () => {
    if (selectedMediaIds.length === 0) return;
    setDeleteMediaRequestId((previous) => previous + 1);
    setOpenDeleteMedia(false);
  };
  const handleApproveMedia = () => {
    setApproveMediaRequestId((previous) => previous + 1);
  };
  const handleChangeTab = (key: string) => {
    const nextTab = facilityTabs.find((tab) => tab.key === key);
    if (!nextTab) return;
    setActiveTab(nextTab.key);
    resetTabState();
  };
  useEffect(() => {
    if (selectedDeviceKeys.length === 0) {
      setVolumePopoverOpen(false);
    }
  }, [selectedDeviceKeys.length]);
  const tabActions = useMemo<AppActionPanelItem[]>(() => {
    if (!selectedFacility) return [];
    switch (activeTab) {
      case "users":
        return [
          {
            key: "add-user",
            icon: <Plus />,
            tooltip: "Thêm tài khoản quản trị",
            onClick: () => setOpenCreateUser(true),
          },
          {
            key: "delete-user",
            icon: <Trash2 />,
            tooltip: "Xóa tài khoản đã chọn",
            danger: true,
            disabled: selectedUserKeys.length === 0,
            onClick: () => setOpenDeleteUser(true),
          },
        ];
      case "devices":
        return [
          {
            key: "add-device",
            icon: <Plus />,
            tooltip: "Thêm thiết bị",
            onClick: handleAddDevice,
          },
          {
            key: "volume-device",
            icon: <Volume2 />,
            tooltip: "Điều chỉnh âm lượng",
            disabled: selectedDeviceKeys.length === 0,
            popover: (
              <DeviceVolumeControl
                initialValue={deviceVolume}
                onChange={handleVolumeChange}
              />
            ),
            popoverOpen: volumePopoverOpen,
            onPopoverOpenChange: (open) => {
              setVolumePopoverOpen(open && selectedDeviceKeys.length > 0);
            },
          },
          {
            key: "restart-device",
            icon: <RefreshCw />,
            tooltip: "Khởi động lại thiết bị",
            disabled: selectedDeviceKeys.length === 0,
            onClick: handleOpenRestartDevice,
          },
          {
            key: "delete-device",
            icon: <Trash2 />,
            tooltip: "Xóa thiết bị đã chọn",
            danger: true,
            disabled: selectedDeviceKeys.length === 0,
            onClick: handleOpenDeleteDevice,
          },
        ];
      case "media":
        return [
          {
            key: "add-media",
            icon: <Plus />,
            tooltip: "Thêm Media",
            onClick: () => setOpenCreateMedia(true),
          },
          {
            key: "delete-media",
            icon: <Trash2 />,
            tooltip: "Xóa Media đã chọn",
            danger: true,
            disabled: selectedMediaIds.length === 0,
            onClick: () => setOpenDeleteMedia(true),
          },
          {
            key: "approve-media",
            icon: <FileCheckCorner />,
            tooltip: "Duyệt Media đã chọn",
            disabled: selectedMediaIds.length === 0,
            onClick: handleApproveMedia,
          },
        ];
      case "templates":
        return [
          {
            key: "add-template",
            icon: <Plus />,
            tooltip: "Thêm bản mẫu",
            onClick: () => setOpenCreateTemplate(true),
          },
          {
            key: "delete-template",
            icon: <Trash2 />,
            tooltip: "Xóa bản mẫu đã chọn",
            danger: true,
            disabled: selectedTemplateKeys.length === 0,
            onClick: () => setOpenDeleteTemplate(true),
          },
        ];
      case "playlists":
        return [
          {
            key: "add-playlist",
            icon: <Plus />,
            tooltip: "Thêm danh sách phát",
            onClick: () => setOpenCreatePlaylist(true),
          },
          {
            key: "delete-playlist",
            icon: <Trash2 />,
            tooltip: "Xóa danh sách phát đã chọn",
            danger: true,
            disabled: selectedPlaylistKeys.length === 0,
            onClick: () => setOpenDeletePlaylist(true),
          },
        ];
      case "info":
      default:
        return [];
    }
  }, [
    activeTab,
    selectedFacility,
    selectedUserKeys.length,
    selectedDeviceKeys.length,
    selectedMediaIds.length,
    selectedTemplateKeys.length,
    selectedPlaylistKeys.length,
    handleAddDevice,
    handleVolumeChange,
    handleOpenRestartDevice,
    handleOpenDeleteDevice,
    deviceVolume,
    volumePopoverOpen,
  ]);
  useEffect(() => {
    setActions(tabActions);
  }, [setActions, tabActions]);
  useEffect(() => {
    return () => {
      setActions([]);
    };
  }, [setActions]);

  const parentFacility =
    activeModal === "edit" && targetFacility?.parentId
      ? findFacilityById(facilities, targetFacility.parentId)
      : null;

  const initialValues = {
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
  };

  const renderTabContent = () => {
    if (!selectedFacility) {
      return (
        <div className="facilities-empty">
          Vui lòng chọn một cơ sở để xem thông tin.
        </div>
      );
    }
    switch (activeTab) {
      case "info":
        return <FacilityInfo facility={selectedFacility} />;
      case "users":
        return (
          <FacilityUsers
            facility={selectedFacility}
            selectedRowKeys={selectedUserKeys}
            onSelectionChange={setSelectedUserKeys}
            openCreate={openCreateUser}
            onCloseCreate={() => setOpenCreateUser(false)}
            deleteRequestId={deleteUserRequestId}
            onDeleteComplete={handleDeleteUserComplete}
          />
        );
      case "devices":
        return (
          <FacilityDevices
            facility={selectedFacility}
            selectedRowKeys={selectedDeviceKeys}
            onSelectionChange={setSelectedDeviceKeys}
            openCreate={openCreateDevice}
            onCloseCreate={handleCloseCreateDevice}
            deleteRequestId={deleteDeviceRequestId}
            onDeleteComplete={() => setSelectedDeviceKeys([])}
          />
        );
      case "media":
        return (
          <FacilityMedia
            facilityId={selectedFacility.id}
            selectedIds={selectedMediaIds}
            onSelectionChange={setSelectedMediaIds}
            openCreate={openCreateMedia}
            onCloseCreate={() => setOpenCreateMedia(false)}
            deleteRequestId={deleteMediaRequestId}
            approveRequestId={approveMediaRequestId}
            onShare={() => setShareOpen(true)}
          />
        );
      case "templates":
        return (
          <FacilityTemplates
            facility={selectedFacility}
            selectedRowKeys={selectedTemplateKeys}
            onSelectionChange={setSelectedTemplateKeys}
            openCreate={openCreateTemplate}
            onCloseCreate={() => setOpenCreateTemplate(false)}
            deleteRequestId={deleteTemplateRequestId}
            onDeleteComplete={() => setSelectedTemplateKeys([])}
          />
        );
      case "playlists":
        return (
          <FacilityPlaylists
            facility={selectedFacility}
            selectedRowKeys={selectedPlaylistKeys}
            onSelectionChange={setSelectedPlaylistKeys}
            openCreate={openCreatePlaylist}
            onCloseCreate={() => setOpenCreatePlaylist(false)}
            deleteRequestId={deletePlaylistRequestId}
            onDeleteComplete={() => setSelectedPlaylistKeys([])}
          />
        );
      default:
        return null;
    }
  };
  return (
    <div className="facilities-page">
      {contextHolder}
      <LocationTree
        facilities={facilities}
        selectedId={selectedFacilityId}
        onSelect={handleSelectFacility}
        onAction={handleFacilityAction}
      />
      <main className="facilities-main">
        <AppTabs
          items={facilityTabs}
          activeKey={activeTab}
          onChange={handleChangeTab}
          className="facilities-page-tabs"
          ariaLabel="Các chức năng quản lý cơ sở"
        />
        <div className="facilities-content" role="tabpanel">
          {renderTabContent()}
        </div>
      </main>
      <FacilityFormModal
        open={activeModal === "create" || activeModal === "edit"}
        mode={activeModal === "edit" ? "edit" : "create"}
        initialValues={initialValues}
        onCancel={handleCloseModal}
        onSubmit={handleSubmitFacility}
      />
      <AppConfirmModal
        open={activeModal === "delete"}
        type="delete"
        title="Xác nhận xóa cơ sở"
        description="Cơ sở này sẽ bị xóa và không thể khôi phục."
        confirmText="Xác nhận"
        cancelText="Hủy"
        width={500}
        onCancel={handleCloseModal}
        onConfirm={handleDeleteFacility}
      />
      <AppConfirmModal
        open={openDeleteUser}
        type="delete"
        title="Xác nhận xóa tài khoản"
        description="Các tài khoản quản trị cơ sở được chọn sẽ bị xóa và không thể khôi phục."
        confirmText="Xác nhận"
        cancelText="Hủy"
        width={500}
        className="app-confirm-modal--facility-users-delete"
        onCancel={() => setOpenDeleteUser(false)}
        onConfirm={handleConfirmDeleteUser}
      />
      <AppConfirmModal
        open={deviceConfirmType === "restart"}
        type="restart"
        title="Xác nhận khởi động lại thiết bị"
        description={`Bạn có chắc chắn muốn khởi động lại ${selectedDeviceKeys.length} thiết bị đã chọn?`}
        confirmText="Xác nhận"
        cancelText="Hủy"
        width={500}
        onCancel={handleCloseDeviceConfirm}
        onConfirm={handleConfirmDeviceAction}
      />
      <AppConfirmModal
        open={deviceConfirmType === "delete"}
        type="delete"
        title="Xác nhận xóa thiết bị"
        description={`Bạn có chắc chắn muốn xóa ${selectedDeviceKeys.length} thiết bị đã chọn?`}
        confirmText="Xác nhận"
        cancelText="Hủy"
        width={500}
        onCancel={handleCloseDeviceConfirm}
        onConfirm={handleConfirmDeviceAction}
      />
      <AppConfirmModal
        open={openDeleteTemplate}
        type="delete"
        title="Xác nhận xóa bản mẫu"
        description={`Bạn có chắc chắn muốn xóa ${selectedTemplateKeys.length} bản mẫu đã chọn?`}
        confirmText="Xác nhận"
        cancelText="Hủy"
        width={500}
        onCancel={() => setOpenDeleteTemplate(false)}
        onConfirm={handleConfirmDeleteTemplate}
      />
      <AppConfirmModal
        open={openDeletePlaylist}
        type="delete"
        title="Xác nhận xóa danh sách phát"
        description={`Bạn có chắc chắn muốn xóa ${selectedPlaylistKeys.length} danh sách phát đã chọn?`}
        confirmText="Xác nhận"
        cancelText="Hủy"
        width={500}
        onCancel={() => setOpenDeletePlaylist(false)}
        onConfirm={handleConfirmDeletePlaylist}
      />
      <AppConfirmModal
        open={openDeleteMedia}
        type="delete"
        title="Xác nhận xóa Media"
        description={`Bạn có chắc chắn muốn xóa ${selectedMediaIds.length} Media đã chọn?`}
        confirmText="Xác nhận"
        cancelText="Hủy"
        width={500}
        onCancel={() => setOpenDeleteMedia(false)}
        onConfirm={handleConfirmDeleteMedia}
      />
      <FacilitiesShareModal
        open={shareOpen}
        onCancel={() => setShareOpen(false)}
        onShare={(selectedIds) => {
          console.log("Cơ sở được chia sẻ:", selectedIds);
          setShareOpen(false);
        }}
      />
    </div>
  );
}
export default FacilitiesPage;
