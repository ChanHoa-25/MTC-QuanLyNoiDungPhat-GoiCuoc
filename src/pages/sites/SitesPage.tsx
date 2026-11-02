import { useEffect, useMemo, useState } from "react";
import type { Key } from "react";
import { message } from "antd";
import { Plus, Trash2 } from "lucide-react";

import AppTabs from "../../components/common/AppTabs";
import AppConfirmModal from "../../components/common/AppConfirmModal";

import { useSiteContext } from "../../contexts/SiteContext";
import { useActionPanel } from "../../contexts/ActionPanelContext";

import LocationTree from "./components/LocationTree/LocationTree";
import SiteInfo from "./components/SiteInfo/SiteInfo";
import SiteFormModal from "./components/SiteFormModal";
import SiteUsers from "./components/SiteUsers";

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

  const handleSelectSite = (site: Site) => {
    setSelectedSiteId(site.id);
    setActiveTab("info");
    setSelectedUserKeys([]);
    setOpenCreateUser(false);
    setOpenDeleteUser(false);
  };

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

  const handleChangeTab = (key: string) => {
    const selectedTab = siteTabs.find((tab) => tab.key === key);

    if (selectedTab) {
      setActiveTab(selectedTab.key);
      setSelectedUserKeys([]);
      setOpenCreateUser(false);
      setOpenDeleteUser(false);
    }
  };

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

      case "info":
      case "devices":
      case "media":
      case "templates":
      case "playlists":
      default:
        return [];
    }
  }, [activeTab, selectedSite, selectedUserKeys]);

  useEffect(() => {
    setActions(tabActions);
  }, [setActions, tabActions]);

  useEffect(() => {
    return () => {
      setActions([]);
    };
  }, [setActions]);

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
        onCancel={handleCloseDeleteUser}
        onConfirm={handleConfirmDeleteUser}
      />
    </div>
  );
}

export default SitesPage;
