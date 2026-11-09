import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Dropdown } from "antd";
import type { MenuProps } from "antd";
import { DownOutlined, UpOutlined } from "@ant-design/icons";
import { LogOut, Settings, ArrowLeftRight } from "lucide-react";

import { ROUTES } from "../../../constants/route.constants";
import avatarImage from "../../../assets/images/avatar.png";

import "./AppAccount.css";

function AppAccount() {
  const navigate = useNavigate();
  const location = useLocation();

  const [accountOpen, setAccountOpen] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const isQueryAdmin = searchParams.get("role") === "admin";
  const isStoredAdmin =
    typeof window !== "undefined" && localStorage.getItem("mtc_role") === "admin";
  const isPathAdmin = location.pathname.startsWith("/admin");
  const isAdmin = isQueryAdmin || isStoredAdmin || isPathAdmin;

  // Xử lý các thao tác trong menu tài khoản
  const handleAccountClick: MenuProps["onClick"] = ({ key }) => {
    setAccountOpen(false);

    switch (key) {
      case "switch-role": {
        const nextRole = isAdmin ? "user" : "admin";
        if (typeof window !== "undefined") {
          localStorage.setItem("mtc_role", nextRole);
        }
        if (nextRole === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate(ROUTES.DASHBOARD);
        }
        break;
      }

      case "profile":
        navigate(ROUTES.PROFILE);
        break;

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

  // Danh sách menu tài khoản
  const accountMenuItems: MenuProps["items"] = [
    {
      key: "profile",
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

            <span className="account-profile-role">{isAdmin ? "Admin" : "User"}</span>
          </div>
        </div>
      ),
    },
    {
      type: "divider",
    },
    {
      key: "switch-role",
      icon: (
        <span className="account-menu-icon-box">
          <ArrowLeftRight size={20} strokeWidth={2} />
        </span>
      ),
      label: (
        <span className="account-menu-label">
          {isAdmin ? "Chuyển sang giao diện User" : "Chuyển sang giao diện Admin"}
        </span>
      ),
    },
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

  return (
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
  );
}

export default AppAccount;
