import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, DatePicker, Form, Switch, message } from "antd";
import { LogOut, SquarePen } from "lucide-react";

import AppHeader from "../../layouts/components/AppHeader";
import AppButton from "../../components/common/AppButton/AppButton";
import AppActionPanel from "../../components/common/AppActionPanel/AppActionPanel";
import AppConfirmModal from "../../components/common/AppConfirmModal";
import AppInput from "../../components/common/AppInput";
import AppSelect from "../../components/common/AppSelect";

import Logo from "../../assets/images/Logo.png";

import {
  mockAvatar,
  mockProfile,
  mockRoleOptions,
  mockSubscription,
  mockTimezoneOptions,
} from "./profile.mock";

import type { ProfileData } from "./profile.mock";

import "./ProfilePage.css";

function ProfilePage() {
  const navigate = useNavigate();

  const [messageApi, contextHolder] = message.useMessage();

  // Popup xác nhận đăng xuất
  const [openLogoutModal, setOpenLogoutModal] = useState(false);

  // Trạng thái gia hạn tự động
  const [autoRenew, setAutoRenew] = useState(mockSubscription.autoRenew);

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

    // TODO: Xóa phiên đăng nhập khi tích hợp xác thực.
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
              {mockProfile.firstName} {mockProfile.lastName}
            </h2>
          </section>

          {/* Form thông tin cá nhân */}
          <Form<ProfileData>
            layout="vertical"
            initialValues={mockProfile}
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
                      (item) => item.value === mockProfile.role,
                    )?.label ?? ""
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
                  <strong>{mockSubscription.capacity}</strong>

                  <span>{mockSubscription.cycle}</span>
                </div>
              </div>

              <div className="profile-package-details">
                {/* Thời gian hết hạn */}
                <div className="profile-package-row">
                  <span>Thời gian hết hạn:</span>

                  <strong>{mockSubscription.expirationDate}</strong>
                </div>

                {/* Gia hạn tự động */}
                <div className="profile-package-row">
                  <span>Gia hạn tự động:</span>

                  <Switch
                    size="small"
                    checked={autoRenew}
                    onChange={setAutoRenew}
                  />
                </div>

                {/* Gia hạn ngay */}
                <div className="profile-package-row">
                  <span>Gia hạn ngay:</span>

                  <AppButton
                    width={80}
                    height={36}
                    className="profile-package-button"
                    onClick={() =>
                      messageApi.info("Chưa tích hợp chức năng gia hạn")
                    }>
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
                    onClick={() =>
                      messageApi.info("Chưa tích hợp chức năng nâng cấp")
                    }>
                    Nâng cấp
                  </AppButton>
                </div>
              </div>
            </div>

            {/* Lịch sử gia hạn */}
            <AppButton
              width={132}
              height={36}
              className="profile-history-button"
              onClick={() => navigate("/profile/renewal-history")}>
              Lịch sử gia hạn
            </AppButton>
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
        type="restart"
        icon={<LogOut size={42} strokeWidth={2} />}
        title="Đăng xuất"
        description="Bạn có chắc chắn muốn đăng xuất khỏi hệ thống không?"
        confirmText="Đăng xuất"
        cancelText="Hủy"
        onConfirm={handleConfirmLogout}
        onCancel={handleCancelLogout}
      />

      {/* Footer */}
      <footer className="profile-footer">Powered by AltaSoftware</footer>
    </div>
  );
}

export default ProfilePage;
