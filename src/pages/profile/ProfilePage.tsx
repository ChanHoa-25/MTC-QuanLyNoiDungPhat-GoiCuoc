import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, DatePicker, Form, Switch, message } from "antd";
import { LogOut, SquarePen, KeyRound, CreditCard } from "lucide-react";
import dayjs from "dayjs";

import AppHeader from "../../layouts/components/AppHeader";
import AppButton from "../../components/common/AppButton/AppButton";
import AppActionPanel from "../../components/common/AppActionPanel/AppActionPanel";
import AppConfirmModal from "../../components/common/AppConfirmModal";
import AppInput from "../../components/common/AppInput";
import AppSelect from "../../components/common/AppSelect";

import Logo from "../../assets/images/Logo.png";
import { useAuth } from "../../contexts/AuthContext";
import PackageRenewModal from "../packages/components/PackageRenewModal";
import PackageUpgradeModalCustomer from "../packages/components/PackageUpgradeModalCustomer";
import CardPaymentModal from "../packages/components/CardPaymentModal";
import ChangePasswordModal from "../../components/auth/ChangePasswordModal";

import {
  mockAvatar,
  mockRoleOptions,
  mockTimezoneOptions,
} from "./profile.mock";

import "./ProfilePage.css";

function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout, updateAutoRenew } = useAuth();

  const [messageApi, contextHolder] = message.useMessage();

  // Modals state
  const [openLogoutModal, setOpenLogoutModal] = useState(false);
  const [openRenewModal, setOpenRenewModal] = useState(false);
  const [openUpgradeModal, setOpenUpgradeModal] = useState(false);
  const [openCardModal, setOpenCardModal] = useState(false);
  const [openPasswordModal, setOpenPasswordModal] = useState(false);

  // Chuyển đến trang chỉnh sửa thông tin
  const handleEdit = () => {
    navigate("/profile/edit");
  };

  // Mở popup đăng xuất
  const handleLogout = () => {
    setOpenLogoutModal(true);
  };

  // Hủy đăng xuất
  const handleCancelLogout = () => {
    setOpenLogoutModal(false);
  };

  // Xác nhận đăng xuất
  const handleConfirmLogout = () => {
    setOpenLogoutModal(false);
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="profile-page">
      {contextHolder}

      {/* Header */}
      <header className="profile-page-header">
        <AppHeader variant="profile" />
      </header>

      {/* Logo và tiêu đề */}
      <div className="profile-heading">
        <img src={Logo} alt="MTC" className="profile-logo" />
        <h1>Thông tin cơ bản</h1>
      </div>

      {/* Nội dung chính */}
      <main className="profile-content">
        <div className="profile-card">
          {/* Thông tin avatar */}
          <section className="profile-user">
            <div className="profile-avatar-wrapper">
              <Avatar src={mockAvatar} className="profile-avatar" />
            </div>

            <h2>
              {user.firstName} {user.lastName}
            </h2>
            <div style={{ fontSize: 13, color: "#8C8C8C", marginTop: 4 }}>
              {user.orgName}
            </div>
          </section>

          {/* Form thông tin cá nhân */}
          <Form
            layout="vertical"
            initialValues={{
              lastName: user.lastName,
              firstName: user.firstName,
              birthday: user.birthday ? dayjs(user.birthday) : undefined,
              phone: user.phone,
              email: user.email,
              timezone: user.timezone,
            }}
            className="profile-form">
            <div className="profile-form-grid">
              {/* Họ */}
              <Form.Item label="Họ" name="lastName">
                <AppInput width="100%" height={48} disabled />
              </Form.Item>

              {/* Tên */}
              <Form.Item label="Tên" name="firstName">
                <AppInput width="100%" height={48} disabled />
              </Form.Item>

              {/* Ngày sinh */}
              <Form.Item label="Ngày sinh" name="birthday">
                <DatePicker
                  format="DD/MM/YYYY"
                  className="profile-date-picker"
                  disabled
                />
              </Form.Item>

              {/* Số điện thoại */}
              <Form.Item label="Số điện thoại" name="phone">
                <AppInput width="100%" height={48} disabled />
              </Form.Item>

              {/* Email */}
              <Form.Item
                label="Email"
                name="email"
                className="profile-form-full">
                <AppInput width="100%" height={48} disabled />
              </Form.Item>

              {/* Phân quyền - Input chỉ đọc */}
              <Form.Item label="Phân quyền">
                <AppInput
                  width="100%"
                  height={48}
                  value={
                    mockRoleOptions.find(
                      (item) => item.value === user.role,
                    )?.label ?? user.roleLabel
                  }
                  readOnly
                  disabled
                />
              </Form.Item>

              {/* Múi giờ - Select chỉ xem */}
              <Form.Item label="Múi giờ" name="timezone">
                <AppSelect
                  width="100%"
                  options={mockTimezoneOptions}
                  disabled
                />
              </Form.Item>
            </div>
          </Form>

          {/* Thông tin gói cước */}
          <section className="profile-subscription-area">
            <div className="profile-subscription">
              <div className="profile-package-header">
                <span>Gói cước hiện tại</span>

                <div className="profile-package-capacity">
                  <strong>{user.currentPackage.capacity}</strong>
                  <span>{user.currentPackage.cycle}</span>
                </div>
              </div>

              <div className="profile-package-details">
                {/* Thời gian hết hạn */}
                <div className="profile-package-row">
                  <span>Thời gian hết hạn:</span>
                  <strong style={{ color: user.currentPackage.isExpired ? "#FF4D4F" : "#2B2B2B" }}>
                    {user.currentPackage.expirationDate}
                  </strong>
                </div>

                {/* Dung lượng lưu trữ */}
                <div className="profile-package-row">
                  <span>Dung lượng đã dùng:</span>
                  <strong>
                    {(user.currentPackage.storageUsedMB / 1024).toFixed(1)} GB /{" "}
                    {(user.currentPackage.storageTotalMB / 1024).toFixed(0)} GB
                  </strong>
                </div>

                {/* Gia hạn tự động */}
                <div className="profile-package-row">
                  <span>Gia hạn tự động:</span>
                  <Switch
                    size="small"
                    checked={user.currentPackage.autoRenew}
                    onChange={(checked) => {
                      updateAutoRenew(checked);
                      messageApi.success(
                        checked
                          ? "Đã bật tự động gia hạn gói cước qua thẻ mặc định"
                          : "Đã tắt tự động gia hạn gói cước",
                      );
                    }}
                  />
                </div>

                {/* Gia hạn ngay */}
                <div className="profile-package-row">
                  <span>Gia hạn ngay:</span>
                  <AppButton
                    width={80}
                    height={36}
                    className="profile-package-button"
                    onClick={() => setOpenRenewModal(true)}>
                    Gia hạn
                  </AppButton>
                </div>

                {/* Nâng cấp gói cước */}
                <div className="profile-package-row">
                  <span>Nâng cấp gói cước:</span>
                  <AppButton
                    width={80}
                    height={36}
                    className="profile-package-button"
                    onClick={() => setOpenUpgradeModal(true)}>
                    Nâng cấp
                  </AppButton>
                </div>
              </div>
            </div>

            {/* Các nút quản lý truy cập và thanh toán */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
              <AppButton
                width={140}
                height={36}
                variant="outline"
                onClick={() => setOpenCardModal(true)}
                icon={<CreditCard size={14} />}>
                Thẻ thanh toán
              </AppButton>

              <AppButton
                width={132}
                height={36}
                className="profile-history-button"
                onClick={() => navigate("/profile/renewal-history")}>
                Lịch sử gia hạn
              </AppButton>
            </div>
          </section>
        </div>
      </main>

      {/* Các icon thao tác */}
      <AppActionPanel
        className="profile-action-panel"
        actions={[
          {
            key: "edit",
            icon: <SquarePen />,
            tooltip: "Chỉnh sửa thông tin",
            onClick: handleEdit,
          },
          {
            key: "password",
            icon: <KeyRound />,
            tooltip: "Đổi mật khẩu",
            onClick: () => setOpenPasswordModal(true),
          },
          {
            key: "logout",
            icon: <LogOut />,
            tooltip: "Đăng xuất",
            onClick: handleLogout,
          },
        ]}
      />

      {/* Popup xác nhận đăng xuất */}
      <AppConfirmModal
        open={openLogoutModal}
        type="delete"
        title="Đăng xuất"
        description="Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?"
        confirmText="Đăng xuất"
        onCancel={handleCancelLogout}
        onConfirm={handleConfirmLogout}
      />

      {/* Popup Gia hạn gói cước */}
      <PackageRenewModal
        open={openRenewModal}
        onClose={() => setOpenRenewModal(false)}
      />

      {/* Popup Nâng cấp gói cước */}
      <PackageUpgradeModalCustomer
        open={openUpgradeModal}
        onClose={() => setOpenUpgradeModal(false)}
      />

      {/* Popup Cấu hình thẻ thanh toán */}
      <CardPaymentModal
        open={openCardModal}
        onClose={() => setOpenCardModal(false)}
      />

      {/* Popup Đổi mật khẩu */}
      <ChangePasswordModal
        open={openPasswordModal}
        onClose={() => setOpenPasswordModal(false)}
      />
    </div>
  );
}

export default ProfilePage;
