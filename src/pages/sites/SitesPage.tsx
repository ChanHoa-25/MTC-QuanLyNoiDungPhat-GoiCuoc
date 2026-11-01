import { useState } from "react";
import { message } from "antd";

import AppTabs from "../../components/common/AppTabs";
import AppConfirmModal from "../../components/common/AppConfirmModal";

import { useSiteContext } from "../../contexts/SiteContext";

import LocationTree from "./components/LocationTree/LocationTree";
import SiteInfo from "./components/SiteInfo/SiteInfo";
import SiteFormModal from "./components/SiteFormModal";

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

// Dữ liệu tạm để kiểm tra dropdown.
// Thay bằng dữ liệu nghiệp vụ thật sau.
const categoryOptions = [
  { label: "Cơ sở địa phương", value: "local" },
  { label: "Cơ sở trực thuộc", value: "direct" },
];

// Chế độ popup
type SiteModalType = "create" | "edit" | "delete" | null;

function SitesPage() {
  const [messageApi, contextHolder] = message.useMessage();

  const { sites, selectedSiteId, setSelectedSiteId, selectedSite } =
    useSiteContext();

  const [activeTab, setActiveTab] = useState<SiteTabKey>("info");

  // Popup đang được mở
  const [activeModal, setActiveModal] = useState<SiteModalType>(null);

  // Cơ sở đang được thao tác
  const [targetSite, setTargetSite] = useState<Site | null>(null);

  // Chọn cơ sở trên cây
  const handleSelectSite = (site: Site) => {
    setSelectedSiteId(site.id);
    setActiveTab("info");
  };

  // Xử lý menu ba chấm
  const handleSiteAction = (action: SiteAction, site: Site) => {
    switch (action) {
      case "create":
        // Thêm cơ sở trực thuộc
        setTargetSite(site);
        setActiveModal("create");
        break;

      case "edit":
        // Cập nhật thông tin cơ sở
        setTargetSite(site);
        setActiveModal("edit");
        break;

      case "delete":
        // Xóa cơ sở
        setTargetSite(site);
        setActiveModal("delete");
        break;

      default:
        break;
    }
  };

  // Đóng popup
  const handleCloseModal = () => {
    setActiveModal(null);
    setTargetSite(null);
  };

  // Xử lý thêm / cập nhật cơ sở
  const handleSubmitSite = (values: SiteFormValues) => {
    if (!targetSite) return;

    if (activeModal === "create") {
      console.log("Thêm cơ sở trực thuộc");
      console.log("ID cơ sở cha:", targetSite.id);
      console.log("Dữ liệu thêm mới:", values);

      // TODO: Thêm cơ sở vào SiteContext hoặc gọi API.

      messageApi.info("Đã nhận thông tin thêm cơ sở. Chưa lưu vào danh sách.");
    }

    if (activeModal === "edit") {
      console.log("Cập nhật thông tin cơ sở");
      console.log("ID cơ sở:", targetSite.id);
      console.log("Dữ liệu cập nhật:", values);

      // TODO: Cập nhật cơ sở trong SiteContext hoặc gọi API.

      messageApi.info("Đã nhận thông tin cập nhật. Chưa lưu vào danh sách.");
    }

    handleCloseModal();
  };

  // Xác nhận xóa cơ sở
  const handleDeleteSite = () => {
    if (!targetSite) return;

    console.log("ID cơ sở cần xóa:", targetSite.id);
    console.log("Tên cơ sở cần xóa:", targetSite.name);

    // TODO: Gọi API hoặc hàm xóa trong SiteContext
    // để xóa cơ sở khỏi danh sách.

    messageApi.info("Đã xác nhận xóa cơ sở. Chưa xóa dữ liệu khỏi danh sách.");

    handleCloseModal();
  };

  // Dữ liệu ban đầu của popup
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
    }
  };

  // Nội dung tab
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

      {/* Popup thêm / cập nhật cơ sở */}
      <SiteFormModal
        open={activeModal === "create" || activeModal === "edit"}
        mode={activeModal === "edit" ? "edit" : "create"}
        initialValues={initialValues}
        categoryOptions={categoryOptions}
        onCancel={handleCloseModal}
        onSubmit={handleSubmitSite}
      />

      {/* Popup xác nhận xóa cơ sở */}
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
    </div>
  );
}

export default SitesPage;
