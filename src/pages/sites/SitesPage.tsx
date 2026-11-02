import { useCallback, useEffect, useMemo, useState } from "react";
import type { Key } from "react";
import { message } from "antd";
import { Plus, Trash2, Volume2, RefreshCw } from "lucide-react";

import AppTabs from "../../components/common/AppTabs";
import AppConfirmModal from "../../components/common/AppConfirmModal";
import type { AppActionPanelItem } from "../../components/common/AppActionPanel";

import { useSiteContext } from "../../contexts/SiteContext";
import { useActionPanel } from "../../contexts/ActionPanelContext";

import LocationTree from "./components/LocationTree/LocationTree";
import SiteInfo from "./components/SiteInfo/SiteInfo";
import SiteFormModal from "./components/SiteFormModal";
import SiteUsers from "./components/SiteUsers";
import SiteDevices from "./components/SiteDevices";
import DeviceVolumeControl from "./components/DeviceVolumeControl/DeviceVolumeControl";
import SiteTemplates from "./components/SiteTemplates";
import SitePlaylists from "./components/SitePlaylists/SitePlaylists";

import type { SiteFormValues } from "./components/SiteFormModal";
import type { Site, SiteAction, SiteTab, SiteTabKey } from "./types/site.types";

import "./SitesPage.css";

const siteTabs: SiteTab[] = [
  { key: "info", label: "Thông tin cơ sở" },
  { key: "users", label: "Quản lý người dùng" },
  { key: "devices", label: "Thiết bị" },
  { key: "media", label: "Media" },
  { key: "templates", label: "Bản mẫu" },
  { key: "playlists", label: "Danh sách phát" },
];

const categoryOptions = [
  { label: "Cơ sở địa phương", value: "local" },
  { label: "Cơ sở trực thuộc", value: "direct" },
];

type SiteModalType = "create" | "edit" | "delete" | null;
type DeviceConfirmType = "restart" | "delete" | null;

function SitesPage() {
  const [messageApi, contextHolder] = message.useMessage();

  const { sites, selectedSiteId, setSelectedSiteId, selectedSite } =
    useSiteContext();

  const { setActions } = useActionPanel();

  const [activeTab, setActiveTab] = useState<SiteTabKey>("info");

  const [activeModal, setActiveModal] = useState<SiteModalType>(null);
  const [targetSite, setTargetSite] = useState<Site | null>(null);

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

  const [selectedTemplateKeys, setSelectedTemplateKeys] = useState<Key[]>([]);
  const [openCreateTemplate, setOpenCreateTemplate] = useState(false);
  const [openDeleteTemplate, setOpenDeleteTemplate] = useState(false);
  const [deleteTemplateRequestId, setDeleteTemplateRequestId] = useState(0);

  const [selectedPlaylistKeys, setSelectedPlaylistKeys] = useState<Key[]>([]);
  const [openCreatePlaylist, setOpenCreatePlaylist] = useState(false);
  const [openDeletePlaylist, setOpenDeletePlaylist] = useState(false);
  const [deletePlaylistRequestId, setDeletePlaylistRequestId] = useState(0);

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
  };

  const handleSelectSite = (site: Site) => {
    setSelectedSiteId(site.id);
    setActiveTab("info");
    resetTabState();
    setActiveModal(null);
    setTargetSite(null);
  };

  const handleSiteAction = (action: SiteAction, site: Site) => {
    setTargetSite(site);

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
        setTargetSite(null);
    }
  };

  const handleCloseModal = () => {
    setActiveModal(null);
    setTargetSite(null);
  };

  const handleSubmitSite = (values: SiteFormValues) => {
    if (!targetSite) return;

    if (activeModal === "create") {
      console.log("Thêm cơ sở trực thuộc", {
        parentSiteId: targetSite.id,
        values,
      });

      messageApi.info("Đã nhận thông tin thêm cơ sở. Chưa lưu vào danh sách.");
    } else if (activeModal === "edit") {
      console.log("Cập nhật thông tin cơ sở", {
        siteId: targetSite.id,
        values,
      });

      messageApi.info("Đã nhận thông tin cập nhật. Chưa lưu vào danh sách.");
    }

    handleCloseModal();
  };

  const handleDeleteSite = () => {
    if (!targetSite) return;

    console.log("Xóa cơ sở", {
      siteId: targetSite.id,
      siteName: targetSite.name,
    });

    messageApi.info("Đã xác nhận xóa cơ sở. Chưa xóa dữ liệu khỏi danh sách.");
    handleCloseModal();
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

  const handleChangeTab = (key: string) => {
    const nextTab = siteTabs.find((tab) => tab.key === key);

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
    if (!selectedSite) return [];

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
      case "templates":
        return [
          {
            key: "add-template",
            icon: <Plus />,
            tooltip: activeTab === "media" ? "Thêm media" : "Thêm bản mẫu",
            onClick: () => setOpenCreateTemplate(true),
          },
          {
            key: "delete-template",
            icon: <Trash2 />,
            tooltip:
              activeTab === "media"
                ? "Xóa media đã chọn"
                : "Xóa bản mẫu đã chọn",
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
    selectedSite,
    selectedUserKeys.length,
    selectedDeviceKeys.length,
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

  const initialValues: Partial<SiteFormValues> =
    activeModal === "create"
      ? {
          name: "",
          code: "",
          parentName: targetSite?.name ?? "",
          category: "",
        }
      : {
          name: targetSite?.name ?? "",
          code: "",
          parentName: "",
          category: "",
        };

  const renderTabContent = () => {
    if (!selectedSite) {
      return (
        <div className="sites-empty">
          Vui lòng chọn một cơ sở để xem thông tin.
        </div>
      );
    }

    switch (activeTab) {
      case "info":
        return <SiteInfo site={selectedSite} />;

      case "users":
        return (
          <SiteUsers
            site={selectedSite}
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
          <SiteDevices
            site={selectedSite}
            selectedRowKeys={selectedDeviceKeys}
            onSelectionChange={setSelectedDeviceKeys}
            openCreate={openCreateDevice}
            onCloseCreate={handleCloseCreateDevice}
            deleteRequestId={deleteDeviceRequestId}
            onDeleteComplete={() => setSelectedDeviceKeys([])}
          />
        );

      case "media":
      case "templates":
        return (
          <SiteTemplates
            site={selectedSite}
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
          <SitePlaylists
            site={selectedSite}
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
    <div className="sites-page">
      {contextHolder}

      <LocationTree
        sites={sites}
        selectedId={selectedSiteId}
        onSelect={handleSelectSite}
        onAction={handleSiteAction}
      />

      <main className="sites-main">
        <AppTabs
          items={siteTabs}
          activeKey={activeTab}
          onChange={handleChangeTab}
          className="sites-page-tabs"
          ariaLabel="Các chức năng quản lý cơ sở"
        />

        <div className="sites-content" role="tabpanel">
          {renderTabContent()}
        </div>
      </main>

      <SiteFormModal
        open={activeModal === "create" || activeModal === "edit"}
        mode={activeModal === "edit" ? "edit" : "create"}
        initialValues={initialValues}
        categoryOptions={categoryOptions}
        onCancel={handleCloseModal}
        onSubmit={handleSubmitSite}
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
        onConfirm={handleDeleteSite}
      />

      <AppConfirmModal
        open={openDeleteUser}
        type="delete"
        title="Xác nhận xóa tài khoản"
        description="Các tài khoản quản trị cơ sở được chọn sẽ bị xóa và không thể khôi phục."
        confirmText="Xác nhận"
        cancelText="Hủy"
        width={500}
        className="app-confirm-modal--site-users-delete"
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
    </div>
  );
}

export default SitesPage;
