import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Button, Dropdown, Input } from "antd";
import type { MenuProps } from "antd";
import { DownOutlined, UpOutlined } from "@ant-design/icons";
import { Bell, Grip, LogOut, Search, Settings } from "lucide-react";

import AppBreadcrumb from "./AppBreadcrumb";
import { ROUTES } from "../../constants/route.constants";

import vietnamFlag from "../../assets/images/vietnam-flag.png";
import ukFlag from "../../assets/images/uk-flag.png";
import avatarImage from "../../assets/images/avatar.png";

import "../MainLayout1.css";

type Language = "vi" | "en";

const languageItems: MenuProps["items"] = [
  {
    key: "vi",
    label: (
      <div className="language-option">
        <img src={vietnamFlag} alt="" />
        <span>VIE</span>
      </div>
    ),
  },
  {
    key: "en",
    label: (
      <div className="language-option">
        <img src={ukFlag} alt="" />
        <span>ENG</span>
      </div>
    ),
  },
];

const accountMenuItems: MenuProps["items"] = [
  {
    key: "profile",
    disabled: true,
    label: (
      <div className="account-profile">
        <img
          src={avatarImage}
          alt="Avatar"
          className="account-profile-avatar"
        />

        <div className="account-profile-info">
          <strong className="account-profile-name">Chinh.Nguyen</strong>
          <span className="account-profile-location">TP. Hồ Chí Minh</span>
          <span className="account-profile-role">Admin</span>
        </div>
      </div>
    ),
  },
  { type: "divider" },
  {
    key: "management",
    icon: (
      <span className="account-menu-icon-box">
        <Settings size={20} strokeWidth={2} />
      </span>
    ),
    label: <span className="account-menu-label">Quay lại trang quản lý</span>,
  },
  {
    key: "logout",
    icon: (
      <span className="account-menu-icon-box">
        <LogOut size={20} strokeWidth={2} />
      </span>
    ),
    label: <span className="account-menu-label">Đăng xuất</span>,
  },
];

function AppHeader() {
  const navigate = useNavigate();

  const [language, setLanguage] = useState<Language>("vi");
  const [languageOpen, setLanguageOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const currentFlag = language === "vi" ? vietnamFlag : ukFlag;
  const currentLanguage = language === "vi" ? "VIE" : "ENG";

  // Thay đổi ngôn ngữ hiển thị
  const handleLanguageChange: MenuProps["onClick"] = ({ key }) => {
    if (key === "vi" || key === "en") {
      setLanguage(key);
      setLanguageOpen(false);
    }
  };

  // Xử lý các thao tác trong menu tài khoản
  const handleAccountClick: MenuProps["onClick"] = ({ key }) => {
    setAccountOpen(false);

    switch (key) {
      case "management":
        navigate(ROUTES.DASHBOARD);
        break;

      case "logout":
        console.log("Chưa tích hợp chức năng đăng xuất");
        break;

      default:
        break;
    }
  };

  return (
    <div className="header-inner">
      {/* Breadcrumb */}
      <div className="header-breadcrumb">
        <AppBreadcrumb />
      </div>

      {/* Các chức năng bên phải Header */}
      <div className="header-actions">
        {/* Tìm kiếm */}
        <Input
          className="header-search"
          placeholder="Từ khóa..."
          suffix={<Search size={20} />}
          aria-label="Tìm kiếm"
        />

        {/* Chọn ngôn ngữ */}
        <Dropdown
          trigger={["click"]}
          placement="bottomRight"
          open={languageOpen}
          onOpenChange={setLanguageOpen}
          menu={{
            items: languageItems,
            selectable: true,
            selectedKeys: [language],
            onClick: handleLanguageChange,
          }}>
          <Button
            className="header-language"
            aria-label="Chọn ngôn ngữ"
            aria-expanded={languageOpen}>
            <img src={currentFlag} alt="" />
            <span>{currentLanguage}</span>
            {languageOpen ? <UpOutlined /> : <DownOutlined />}
          </Button>
        </Dropdown>

        {/* Ứng dụng */}
        <Button type="text" className="header-app" aria-label="Ứng dụng">
          <Grip size={25} />
        </Button>

        {/* Thông báo */}
        <Button
          type="text"
          className="header-icon-button notification-button"
          aria-label="Thông báo">
          <Badge count={9} size="small" offset={[-2, 2]}>
            <Bell size={24} />
          </Badge>
        </Button>

        {/* Tài khoản */}
        <Dropdown
          trigger={["click"]}
          placement="bottomRight"
          open={accountOpen}
          onOpenChange={setAccountOpen}
          menu={{
            items: accountMenuItems,
            onClick: handleAccountClick,
          }}
          popupRender={(menu) => (
            <div className="account-dropdown-panel">{menu}</div>
          )}>
          <button
            type="button"
            className="header-account"
            aria-label="Tài khoản"
            aria-expanded={accountOpen}>
            <img src={avatarImage} alt="" className="image-avatar" />

            <span className="icon-down">
              {accountOpen ? <UpOutlined /> : <DownOutlined />}
            </span>
          </button>
        </Dropdown>
      </div>
    </div>
  );
}

export default AppHeader;
