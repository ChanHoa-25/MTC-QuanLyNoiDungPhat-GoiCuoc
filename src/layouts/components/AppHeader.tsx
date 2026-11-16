import { Button } from "antd";
import { Grip } from "lucide-react";

import AppBreadcrumb from "./AppBreadcrumb";
import AppSearch from "../../components/common/AppSearch/AppSearch";
import AppLanguage from "../../components/common/AppLanguage/AppLanguage";
import AppAccount from "../../components/common/AppAccount/AppAccount";
import AppNotification from "../../components/common/AppNotification/AppNotification";

import "../MainLayout.css";

interface AppHeaderProps {
  variant?: "default" | "profile" | "system-user";
}

function AppHeader({ variant = "default" }: AppHeaderProps) {
  const isProfile = variant === "profile";
  const isSystemUser = variant === "system-user";

  return (
    <div className={`header-inner ${isProfile ? "header-inner--profile" : ""}`}>
      {/* Breadcrumb */}
      {!isProfile && (
        <div className="header-breadcrumb">
          <AppBreadcrumb />
        </div>
      )}

      {/* Các chức năng bên phải Header */}
      <div className="header-actions">
        {/* Tìm kiếm: chỉ End User mặc định */}
        {!isProfile && !isSystemUser && <AppSearch />}

        {/* Chọn ngôn ngữ */}
        <AppLanguage className="header-language" />

        {/* Ứng dụng */}
        <Button type="text" className="header-app" aria-label="Ứng dụng">
          <Grip size={25} />
        </Button>

        {/* Thông báo */}
        <AppNotification />

        {/* Tài khoản: System User hiển thị ở Sidebar */}
        {!isSystemUser && <AppAccount />}
      </div>
    </div>
  );
}

export default AppHeader;
