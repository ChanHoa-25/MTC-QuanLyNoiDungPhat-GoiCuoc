import { Button } from "antd";
import { Grip } from "lucide-react";

import AppBreadcrumb from "./AppBreadcrumb";
import AppSearch from "../../components/common/AppSearch/AppSearch";
import AppLanguage from "../../components/common/AppLanguage/AppLanguage";
import AppAccount from "../../components/common/AppAccount/AppAccount";
import AppNotification from "../../components/common/AppNotification/AppNotification";

import "../MainLayout.css";

interface AppHeaderProps {
  variant?: "default" | "profile";
}

function AppHeader({ variant = "default" }: AppHeaderProps) {
  const isProfile = variant === "profile";

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
        {/* Tìm kiếm */}
        {!isProfile && <AppSearch />}

        {/* Chọn ngôn ngữ */}
        <AppLanguage className="header-language" />

        {/* Ứng dụng */}
        <Button type="text" className="header-app" aria-label="Ứng dụng">
          <Grip size={25} />
        </Button>

        {/* Thông báo */}
        <AppNotification />

        {/* Tài khoản */}
        <AppAccount />
      </div>
    </div>
  );
}

export default AppHeader;
