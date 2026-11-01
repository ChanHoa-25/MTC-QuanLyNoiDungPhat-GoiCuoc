import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { Avatar, DatePicker, Form, message } from "antd";
import { useNavigate } from "react-router-dom";
import { Camera } from "lucide-react";

import AppHeader from "../../layouts/components/AppHeader";
import AppButton from "../../components/common/AppButton/AppButton";
import AppIconButton from "../../components/common/AppIconButton";
import AppInput from "../../components/common/AppInput";
import AppSelect from "../../components/common/AppSelect";

import Logo from "../../assets/images/Logo.png";

import { mockAvatar, mockProfile, mockTimezoneOptions } from "./profile.mock";

import type { ProfileData } from "./profile.mock";

import "./EditProfile.css";

function EditProfile() {
  const navigate = useNavigate();

  const [form] = Form.useForm<ProfileData>();
  const [messageApi, contextHolder] = message.useMessage();

  const [avatar, setAvatar] = useState(mockAvatar);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      messageApi.error("Vui lòng chọn tệp hình ảnh");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      messageApi.error("Ảnh đại diện không được vượt quá 2MB");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAvatar(reader.result);
      }
    };

    reader.onerror = () => {
      messageApi.error("Không thể đọc ảnh đã chọn");
    };

    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleCancel = () => {
    navigate("/profile");
  };

  const handleSave = (values: ProfileData) => {
    // TODO: Gọi API cập nhật thông tin khi tích hợp backend.
    console.log("Thông tin cập nhật:", values);
    console.log("Ảnh đại diện:", avatar);

    messageApi.success("Đã lưu thông tin trên giao diện");
    navigate("/profile");
  };

  return (
    <div className="edit-profile-page">
      {contextHolder}

      <header className="edit-profile-header">
        <AppHeader variant="profile" />
      </header>

      <div className="edit-profile-heading">
        <img src={Logo} alt="MTC" className="edit-profile-logo" />

        <h1>Thông tin cơ bản</h1>
      </div>

      <main className="edit-profile-content">
        <div className="edit-profile-card">
          <section className="edit-profile-user">
            <div className="edit-profile-avatar-wrapper">
              <Avatar src={avatar} className="edit-profile-avatar" />

              <div className="edit-profile-camera-position">
                <AppIconButton
                  icon={<Camera size={30} />}
                  tooltip="Thay đổi ảnh đại diện"
                  size={45}
                  iconSize={30}
                  className="edit-profile-camera-button"
                  onClick={handleAvatarClick}
                />
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="edit-profile-file-input"
              onChange={handleAvatarChange}
            />

            <h2>
              {mockProfile.firstName} {mockProfile.lastName}
            </h2>
          </section>

          <Form<ProfileData>
            form={form}
            layout="vertical"
            initialValues={mockProfile}
            onFinish={handleSave}
            className="edit-profile-form">
            <div className="edit-profile-form-grid">
              <Form.Item
                label="Họ"
                name="lastName"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập họ",
                  },
                ]}>
                <AppInput width="100%" height={48} placeholder="Nhập họ" />
              </Form.Item>

              <Form.Item
                label="Tên"
                name="firstName"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập tên",
                  },
                ]}>
                <AppInput width="100%" height={48} placeholder="Nhập tên" />
              </Form.Item>

              <Form.Item label="Ngày sinh" name="birthday">
                <DatePicker
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày sinh"
                  className="edit-profile-date-picker"
                />
              </Form.Item>

              <Form.Item label="Số điện thoại" name="phone">
                <AppInput
                  width="100%"
                  height={48}
                  placeholder="Nhập số điện thoại"
                />
              </Form.Item>

              <Form.Item
                label="Email"
                name="email"
                className="edit-profile-form-full"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập email",
                  },
                  {
                    type: "email",
                    message: "Email không hợp lệ",
                  },
                ]}>
                <AppInput width="100%" height={48} placeholder="Nhập email" />
              </Form.Item>

              <Form.Item label="Phân quyền" name="role">
                <AppInput
                  width="100%"
                  height={48}
                  value="Quản trị viên tổ chức"
                  readOnly
                  disabled
                />
              </Form.Item>

              <Form.Item
                label="Múi giờ"
                name="timezone"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn múi giờ",
                  },
                ]}>
                <AppSelect
                  width="100%"
                  options={mockTimezoneOptions}
                  placeholder="Chọn múi giờ"
                />
              </Form.Item>
            </div>
          </Form>
        </div>

        <div className="edit-profile-actions">
          <AppButton
            variant="outline"
            width={158}
            height={44}
            onClick={handleCancel}>
            Hủy
          </AppButton>

          <AppButton
            variant="primary"
            width={166}
            height={44}
            onClick={() => form.submit()}>
            Lưu thay đổi
          </AppButton>
        </div>
      </main>

      <footer className="edit-profile-footer">Powered by AltaSoftware</footer>
    </div>
  );
}

export default EditProfile;
