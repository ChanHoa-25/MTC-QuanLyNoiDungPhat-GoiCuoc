import { useEffect, useState } from "react";
import { Avatar, Form, message, Spin } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { SquarePen } from "lucide-react";
import axios from "axios";

import { mockAvatar } from "../profile/profile.mock";
import { authApi } from "../../api/authApi";
import type { AuthUser, UpdateProfileRequest } from "../../api/authApi";

import AppButton from "../../components/common/AppButton/AppButton";
import AppInput from "../../components/common/AppInput";
import AppForm from "../../components/common/AppForm";
import AppActionPanel from "../../components/common/AppActionPanel/AppActionPanel";

import AccountSidebar from "./components/AccountSidebar";
import type { AccountTab } from "./components/AccountSidebar";
import AccountSecurity from "./components/AccountSecurity";

import "./AccountPage.css";
import ChangePasswordModal from "./components/ChangePasswordModal";

interface AccountData {
  fullName: string;
  username: string;
  identityNumber: string;
  phoneNumber: string;
  email: string;
  role: string;
}

interface AccountLocationState {
  activeTab?: AccountTab;
}

const emptyAccount: AccountData = {
  fullName: "",
  username: "",
  identityNumber: "",
  phoneNumber: "",
  email: "",
  role: "",
};

const mapAccountData = (user: AuthUser): AccountData => ({
  fullName: user.fullName ?? "",
  username: user.username ?? "",
  identityNumber: "",
  phoneNumber: user.phoneNumber ?? "",
  email: user.email ?? "",
  role: user.role ?? "",
});

function AccountPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [form] = Form.useForm<AccountData>();
  const [messageApi, contextHolder] = message.useMessage();

  const locationState = location.state as AccountLocationState | null;

  const [activeTab, setActiveTab] = useState<AccountTab>(
    locationState?.activeTab === "security" ? "security" : "information",
  );

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [account, setAccount] = useState<AccountData>(emptyAccount);
  const [loaded, setLoaded] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  useEffect(() => {
    let active = true;

    const fetchAccount = async () => {
      setLoading(true);

      try {
        const user = await authApi.getMe();

        if (!active) return;

        const accountData = mapAccountData(user);

        setAccount(accountData);
        form.setFieldsValue(accountData);
        setLoaded(true);
      } catch (error) {
        if (!active) return;

        setLoaded(false);

        const errorMessage = axios.isAxiosError(error)
          ? error.response?.data?.message ||
            "Không thể tải thông tin tài khoản."
          : error instanceof Error
            ? error.message
            : "Không thể tải thông tin tài khoản.";

        messageApi.error(errorMessage);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchAccount();

    return () => {
      active = false;
    };
  }, [form, messageApi]);

  const handleChangeTab = (tab: AccountTab) => {
    if (saving) return;

    if (editing) {
      form.setFieldsValue(account);
      setEditing(false);
    }

    setActiveTab(tab);
  };

  const handleEdit = () => {
    if (!loaded || loading || saving) return;

    form.setFieldsValue(account);
    setActiveTab("information");
    setEditing(true);
  };

  const handleCancelEdit = () => {
    if (saving) return;

    form.setFieldsValue(account);
    setEditing(false);
  };

  const handleSave = async (values: AccountData) => {
    if (!loaded || saving) return;

    const payload: UpdateProfileRequest = {
      fullName: values.fullName.trim(),
      phoneNumber: values.phoneNumber.trim(),
      email: values.email.trim(),
    };

    try {
      setSaving(true);

      const updatedUser = await authApi.updateProfile(payload);
      const updatedAccount = mapAccountData(updatedUser);

      setAccount(updatedAccount);
      form.setFieldsValue(updatedAccount);
      setEditing(false);

      messageApi.success("Cập nhật thông tin tài khoản thành công.");
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message ||
          "Không thể cập nhật thông tin tài khoản."
        : error instanceof Error
          ? error.message
          : "Không thể cập nhật thông tin tài khoản.";

      messageApi.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleTwoFactor = () => {
    navigate("/account/two-factor");
  };

  const handleChangePassword = () => {
    setChangePasswordOpen(true);
  };

  const handleLoginActivity = () => {
    messageApi.info("Chức năng hoạt động đăng nhập đang được phát triển.");
  };

  return (
    <div className="account-page">
      {contextHolder}

      <div className="account-page__layout">
        <AccountSidebar activeTab={activeTab} onChange={handleChangeTab} />

        <div className="account-page__main">
          {activeTab === "information" ? (
            <>
              <h2 className="account-page__section-title">
                Thông tin tài khoản
              </h2>

              {loading ? (
                <Spin size="large" />
              ) : !loaded ? (
                <div>Không thể tải thông tin tài khoản.</div>
              ) : (
                <div className="account-page__information">
                  <section className="account-page__profile">
                    <Avatar src={mockAvatar} className="account-page__avatar" />

                    <h3>{account.fullName}</h3>
                  </section>

                  <AppForm<AccountData>
                    form={form}
                    layout="vertical"
                    initialValues={emptyAccount}
                    onFinish={handleSave}
                    className="account-page__form">
                    <div className="account-page__form-grid">
                      <Form.Item
                        label="Họ và tên"
                        name="fullName"
                        rules={[
                          {
                            required: true,
                            whitespace: true,
                            message: "Vui lòng nhập họ và tên",
                          },
                        ]}>
                        <AppInput
                          width="100%"
                          height={48}
                          disabled={!editing || saving}
                        />
                      </Form.Item>

                      <Form.Item label="Tên đăng nhập" name="username">
                        <AppInput width="100%" height={48} disabled />
                      </Form.Item>

                      <Form.Item label="CMND/CCCD" name="identityNumber">
                        <AppInput width="100%" height={48} disabled />
                      </Form.Item>

                      <Form.Item label="Số điện thoại" name="phoneNumber">
                        <AppInput
                          width="100%"
                          height={48}
                          disabled={!editing || saving}
                        />
                      </Form.Item>

                      <Form.Item
                        label="Email"
                        name="email"
                        className="account-page__form-full"
                        rules={[
                          {
                            type: "email",
                            message: "Email không hợp lệ",
                          },
                        ]}>
                        <AppInput
                          width="100%"
                          height={48}
                          disabled={!editing || saving}
                        />
                      </Form.Item>

                      <Form.Item
                        label="Phân quyền"
                        name="role"
                        className="account-page__form-full">
                        <AppInput width="100%" height={48} disabled />
                      </Form.Item>
                    </div>

                    {editing && (
                      <div className="account-page__form-actions">
                        <AppButton
                          variant="outline"
                          width={158}
                          height={44}
                          disabled={saving}
                          onClick={handleCancelEdit}>
                          Hủy
                        </AppButton>

                        <AppButton
                          variant="primary"
                          width={166}
                          height={44}
                          disabled={saving}
                          onClick={() => form.submit()}>
                          {saving ? "Đang lưu..." : "Lưu thay đổi"}
                        </AppButton>
                      </div>
                    )}
                  </AppForm>
                </div>
              )}
            </>
          ) : (
            <AccountSecurity
              onChangePassword={handleChangePassword}
              onTwoFactor={handleTwoFactor}
              onLoginActivity={handleLoginActivity}
            />
          )}
        </div>

        {activeTab === "information" && (
          <AppActionPanel
            className="account-page__actions"
            actions={[
              {
                key: "edit",
                icon: <SquarePen />,
                tooltip: "Chỉnh sửa thông tin",
                onClick: handleEdit,
              },
            ]}
          />
        )}
        <ChangePasswordModal
          open={changePasswordOpen}
          onClose={() => setChangePasswordOpen(false)}
        />
      </div>
    </div>
  );
}

export default AccountPage;
