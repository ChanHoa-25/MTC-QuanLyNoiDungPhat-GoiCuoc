import { useEffect, useMemo, useState } from "react";
import type { Key } from "react";
import { message } from "antd";
import { Plus, Trash2, Volume2, RefreshCw } from "lucide-react";

import AppTabs from "../../components/common/AppTabs";
import AppConfirmModal from "../../components/common/AppConfirmModal";

import { useSiteContext } from "../../contexts/SiteContext";
import { useActionPanel } from "../../contexts/ActionPanelContext";

import LocationTree from "./components/LocationTree/LocationTree";
import SiteInfo from "./components/SiteInfo/SiteInfo";
import SiteFormModal from "./components/SiteFormModal";
import SiteUsers from "./components/SiteUsers";
import SiteDevices from "./components/SiteDevices";
import DeviceVolumeControl from "./components/DeviceVolumeControl/DeviceVolumeControl";

import type { SiteFormValues } from "./components/SiteFormModal";
import type { Site, SiteAction, SiteTab, SiteTabKey } from "./types/site.types";

import type { AppActionPanelItem } from "../../components/common/AppActionPanel";

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

  // Tab hiện tại
  const [activeTab, setActiveTab] = useState<SiteTabKey>("info");

  // Quản lý cơ sở
  const [activeModal, setActiveModal] = useState<SiteModalType>(null);

  const [targetSite, setTargetSite] = useState<Site | null>(null);

  // Quản lý người dùng
  const [selectedUserKeys, setSelectedUserKeys] = useState<Key[]>([]);

  const [openCreateUser, setOpenCreateUser] = useState(false);
  const [openDeleteUser, setOpenDeleteUser] = useState(false);

  const [deleteUserRequestId, setDeleteUserRequestId] = useState(0);

  // Quản lý thiết bị
  const [selectedDeviceKeys, setSelectedDeviceKeys] = useState<Key[]>([]);

  const [openCreateDevice, setOpenCreateDevice] = useState(false);

  const [deleteDeviceRequestId, setDeleteDeviceRequestId] = useState(0);

  const [deviceConfirmType, setDeviceConfirmType] =
    useState<DeviceConfirmType>(null);

  // Điều chỉnh âm lượng
  const [volumePopoverOpen, setVolumePopoverOpen] = useState(false);

  const [deviceVolume, setDeviceVolume] = useState(50);

  // Chọn cơ sở
  const handleSelectSite = (site: Site) => {
    setSelectedSiteId(site.id);
    setActiveTab("info");

    setSelectedUserKeys([]);
    setSelectedDeviceKeys([]);

    setOpenCreateUser(false);
    setOpenDeleteUser(false);

    setOpenCreateDevice(false);
    setDeviceConfirmType(null);
    setVolumePopoverOpen(false);
  };

  // Thêm / cập nhật / xóa cơ sở
  const handleSiteAction = (action: SiteAction, site: Site) => {
    switch (action) {
      case "create":
        setTargetSite(site);
        setActiveModal("create");
        break;

      case "edit":
        setTargetSite(site);
        setActiveModal("edit");
        break;

      case "delete":
        setTargetSite(site);
        setActiveModal("delete");
        break;

      default:
        break;
    }
  };

  const handleCloseModal = () => {
    setActiveModal(null);
    setTargetSite(null);
  };

  const handleSubmitSite = (values: SiteFormValues) => {
    if (!targetSite) return;

    if (activeModal === "create") {
      console.log("Thêm cơ sở trực thuộc");
      console.log("ID cơ sở cha:", targetSite.id);
      console.log("Dữ liệu thêm mới:", values);

      messageApi.info("Đã nhận thông tin thêm cơ sở. Chưa lưu vào danh sách.");
    }

    if (activeModal === "edit") {
      console.log("Cập nhật thông tin cơ sở");
      console.log("ID cơ sở:", targetSite.id);
      console.log("Dữ liệu cập nhật:", values);

      messageApi.info("Đã nhận thông tin cập nhật. Chưa lưu vào danh sách.");
    }

    handleCloseModal();
  };

  const handleDeleteSite = () => {
    if (!targetSite) return;

    console.log("ID cơ sở cần xóa:", targetSite.id);
    console.log("Tên cơ sở cần xóa:", targetSite.name);

    messageApi.info("Đã xác nhận xóa cơ sở. Chưa xóa dữ liệu khỏi danh sách.");

    handleCloseModal();
  };

  // Xóa tài khoản quản trị
  const handleCloseDeleteUser = () => {
    setOpenDeleteUser(false);
  };

  const handleConfirmDeleteUser = () => {
    if (selectedUserKeys.length === 0) {
      setOpenDeleteUser(false);
      return;
    }

    setDeleteUserRequestId((previousId) => previousId + 1);
    setOpenDeleteUser(false);
  };

  const handleDeleteUserComplete = () => {
    setOpenDeleteUser(false);
  };

  // Thêm thiết bị
  const handleAddDevice = () => {
    setOpenCreateDevice(true);
    setVolumePopoverOpen(false);
  };

  const handleCloseCreateDevice = () => {
    setOpenCreateDevice(false);
  };

  // Thay đổi âm lượng
  const handleVolumeChange = (value: number) => {
    setDeviceVolume(value);

    console.log("Âm lượng:", value);
    console.log("Thiết bị được chọn:", selectedDeviceKeys);
  };

  // Mở popup khởi động lại thiết bị
  const handleOpenRestartDevice = () => {
    if (selectedDeviceKeys.length === 0) {
      messageApi.warning("Vui lòng chọn thiết bị cần khởi động lại.");
      return;
    }

    setVolumePopoverOpen(false);
    setDeviceConfirmType("restart");
  };

  // Mở popup xóa thiết bị
  const handleOpenDeleteDevice = () => {
    if (selectedDeviceKeys.length === 0) {
      messageApi.warning("Vui lòng chọn thiết bị cần xóa.");
      return;
    }

    setVolumePopoverOpen(false);
    setDeviceConfirmType("delete");
  };

  const handleCloseDeviceConfirm = () => {
    setDeviceConfirmType(null);
  };

  // Xác nhận khởi động lại hoặc xóa thiết bị
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
      setDeleteDeviceRequestId((previousId) => previousId + 1);
    }

    setDeviceConfirmType(null);
  };

  // Dữ liệu ban đầu của form cơ sở
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

  // Chuyển tab
  const handleChangeTab = (key: string) => {
    const selectedTab = siteTabs.find((tab) => tab.key === key);

    if (selectedTab) {
      setActiveTab(selectedTab.key);

      setSelectedUserKeys([]);
      setSelectedDeviceKeys([]);

      setOpenCreateUser(false);
      setOpenDeleteUser(false);

      setOpenCreateDevice(false);
      setDeviceConfirmType(null);
      setVolumePopoverOpen(false);
    }
  };

  // Đóng Popover khi không còn thiết bị được chọn
  useEffect(() => {
    if (selectedDeviceKeys.length === 0) {
      setVolumePopoverOpen(false);
    }
  }, [selectedDeviceKeys.length]);

  // Các nút chức năng trên AppActionPanel
  const tabActions = useMemo<AppActionPanelItem[]>(() => {
    if (!selectedSite) {
      return [];
    }

    switch (activeTab) {
      case "users":
        return [
          {
            key: "add",
            icon: <Plus />,
            tooltip: "Thêm tài khoản quản trị",
            onClick: () => {
              setOpenCreateUser(true);
            },
          },
          {
            key: "delete",
            icon: <Trash2 />,
            tooltip: "Xóa tài khoản đã chọn",
            danger: true,
            disabled: selectedUserKeys.length === 0,
            onClick: () => {
              setOpenDeleteUser(true);
            },
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

      case "info":
      case "media":
      case "templates":
      case "playlists":
      default:
        return [];
    }
  }, [
    activeTab,
    selectedSite,
    selectedUserKeys,
    selectedDeviceKeys,
    volumePopoverOpen,
    deviceVolume,
  ]);

  // Cập nhật ActionPanel theo tab
  useEffect(() => {
    setActions(tabActions);
  }, [setActions, tabActions]);

  useEffect(() => {
    return () => {
      setActions([]);
    };
  }, [setActions]);

  // Nội dung từng tab
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
      case "playlists":
        return (
          <div className="sites-placeholder">
            <h2 className="sites-placeholder-title">
              {siteTabs.find((tab) => tab.key === activeTab)?.label}
            </h2>

            <p className="sites-placeholder-description">
              Nội dung của chức năng này sẽ được triển khai trong các bước tiếp
              theo.
            </p>
          </div>
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

      {/* Form thêm / cập nhật cơ sở */}
      <SiteFormModal
        open={activeModal === "create" || activeModal === "edit"}
        mode={activeModal === "edit" ? "edit" : "create"}
        initialValues={initialValues}
        categoryOptions={categoryOptions}
        onCancel={handleCloseModal}
        onSubmit={handleSubmitSite}
      />

      {/* Xác nhận xóa cơ sở */}
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

      {/* Xác nhận xóa tài khoản */}
      <AppConfirmModal
        open={openDeleteUser}
        type="delete"
        title="Xác nhận xóa tài khoản"
        description="Các tài khoản quản trị cơ sở được chọn sẽ bị xóa và không thể khôi phục."
        confirmText="Xác nhận"
        cancelText="Hủy"
        width={500}
        className="app-confirm-modal--site-users-delete"
        onCancel={handleCloseDeleteUser}
        onConfirm={handleConfirmDeleteUser}
      />

      {/* Xác nhận khởi động lại thiết bị */}
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

      {/* Xác nhận xóa thiết bị */}
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
    </div>
  );
}

export default SitesPage;
