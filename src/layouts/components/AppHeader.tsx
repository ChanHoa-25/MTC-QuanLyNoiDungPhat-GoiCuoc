import { Badge, Button, Dropdown, Input, type MenuProps } from "antd";
import { DownOutlined, UpOutlined } from "@ant-design/icons";
import { Bell, Grip, LogOut, Search, Settings } from "lucide-react";
import AppBreadcrumb from "./AppBreadcrumb";
import vietnamFlag from "../../assets/images/vietnam-flag.png";
import ukFlag from "../../assets/images/uk-flag.png";
import avatarImage from "../../assets/images/avatar.png";
import { useState } from "react";
import "../MainLayout.css";

function AppHeader() {
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
      disabled: false,
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
  const [language, setLanguage] = useState<"vi" | "en">("vi");
  const currentFlag = language === "vi" ? vietnamFlag : ukFlag;
  const currentLanguage = language === "vi" ? "VIE" : "ENG";
  const [languageOpen, setLanguageOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  return (
    <div className="header-inner">
      <div className="header-breadcrumb">
        <AppBreadcrumb />
      </div>
      <div className="header-actions">
        <Input
          className="header-search"
          placeholder="Từ khóa..."
          suffix={<Search size={20} />}
        />

        <Dropdown
          trigger={["click"]}
          placement="bottomRight"
          open={languageOpen}
          onOpenChange={setLanguageOpen}
          menu={{
            items: languageItems,
            selectable: true,
            selectedKeys: [language],
            onClick: ({ key }) => {
              if (key === "vi" || key === "en") {
                setLanguage(key);
              }
            },
          }}>
          <Button className="header-language">
            <img src={currentFlag} alt="" />
            <span>{currentLanguage}</span>
            {languageOpen ? <UpOutlined /> : <DownOutlined />}
          </Button>
        </Dropdown>
        <Button type="text" className="header-app" aria-label="Ứng dụng">
          <Grip size={25} />
        </Button>

        <Button
          type="text"
          className="header-icon-button notification-button"
          aria-label="Thông báo">
          <Badge count={9} size="small" offset={[-2, 2]}>
            <Bell size={24} />
          </Badge>
        </Button>

        <Dropdown
          trigger={["click"]}
          placement="bottomRight"
          open={accountOpen}
          onOpenChange={setAccountOpen}
          menu={{
            items: accountMenuItems,
            onClick: ({ key }) => {
              switch (key) {
                case "management":
                  console.log("Quay lại trang quản lý");
                  break;

                case "logout":
                  console.log("Đăng xuất");
                  break;
              }
            },
          }}
          popupRender={(menu) => (
            <div className="account-dropdown-panel">{menu}</div>
          )}>
          <button
            type="button"
            className="header-account"
            aria-label="Tài khoản">
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
