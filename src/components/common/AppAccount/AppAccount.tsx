import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dropdown } from "antd";
import type { MenuProps } from "antd";
import { DownOutlined, UpOutlined } from "@ant-design/icons";
import { LogOut, Settings, Package } from "lucide-react";

import { ROUTES } from "../../../constants/route.constants";
import avatarImage from "../../../assets/images/avatar.png";
import { useAuth } from "../../../contexts/AuthContext";
import AppConfirmModal from "../AppConfirmModal";

import "./AppAccount.css";

function AppAccount() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [accountOpen, setAccountOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Xử lý các thao tác trong menu tài khoản
  const handleAccountClick: MenuProps["onClick"] = ({ key }) => {
    setAccountOpen(false);

    switch (key) {
      case "profile":
        navigate(ROUTES.PROFILE);
        break;

      case "packages":
        navigate(ROUTES.PACKAGES);
        break;

      case "management":
        navigate(ROUTES.DASHBOARD);
        break;

      case "logout":
        setShowLogoutModal(true);
        break;

      default:
        break;
    }
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    logout();
    navigate(ROUTES.LOGIN);
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
            <strong className="account-profile-name">{user.fullName || user.username}</strong>
            <span className="account-profile-location">{user.orgName}</span>
            <span className="account-profile-role">{user.roleLabel}</span>
          </div>
        </div>
      ),
    },
    {
      type: "divider",
    },
    {
      key: "packages",
      icon: (
        <span className="account-menu-icon-box">
          <Package size={20} strokeWidth={2} color="#F26D21" />
        </span>
      ),
      label: <span className="account-menu-label">Quản lý gói cước & dịch vụ</span>,
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
          <LogOut size={20} strokeWidth={2} color="#FF4D4F" />
        </span>
      ),
      label: <span className="account-menu-label" style={{ color: "#FF4D4F" }}>Đăng xuất</span>,
    },
  ];

  return (
    <>
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

      {/* Popup xác nhận đăng xuất */}
      <AppConfirmModal
        open={showLogoutModal}
        type="delete"
        title="Đăng xuất"
        description="Bạn có chắc chắn muốn đăng xuất khỏi hệ thống MTC?"
        confirmText="Đăng xuất"
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
      />
    </>
  );
}

export default AppAccount;
