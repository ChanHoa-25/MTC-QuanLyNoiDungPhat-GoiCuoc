import { useState } from "react";
import { message } from "antd";
import { QrCode, Trash2 } from "lucide-react";
import axios from "axios";

import AppButton from "../../../components/common/AppButton";
import { authApi } from "../../../api/authApi";
import type { TwoFactorSetupResponse } from "../../../api/authApi";

import DisableAuthenticatorModal from "./DisableAuthenticatorModal";
import SetupAuthenticatorModal from "./SetupAuthenticatorModal";
import VerifyAuthenticatorModal from "./VerifyAuthenticatorModal";

import "./TwoFactorDetails.css";
import BackupCodesModal from "../components/BackupCodesModal";

function AuthenticatorAppPage() {
  const [messageApi, contextHolder] = message.useMessage();

  const [connected, setConnected] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [openBackupCodesModal, setOpenBackupCodesModal] = useState(false);
  const [openDisableModal, setOpenDisableModal] = useState(false);
  const [openSetupModal, setOpenSetupModal] = useState(false);
  const [openVerifyModal, setOpenVerifyModal] = useState(false);
  const [disableLoading, setDisableLoading] = useState(false);

  const [setupData, setSetupData] = useState<TwoFactorSetupResponse | null>(
    null,
  );
  const [setupLoading, setSetupLoading] = useState(false);

  const handleSetup = async () => {
    if (setupLoading) return;

    try {
      setSetupLoading(true);

      const data = await authApi.setup2FA();

      setSetupData(data);
      setOpenSetupModal(true);
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message ||
          "Không thể thiết lập ứng dụng xác thực."
        : error instanceof Error
          ? error.message
          : "Không thể thiết lập ứng dụng xác thực.";

      messageApi.error(errorMessage);
    } finally {
      setSetupLoading(false);
    }
  };

  const handleNext = () => {
    if (!setupData) {
      messageApi.error("Chưa có thông tin thiết lập xác thực.");
      return;
    }

    setOpenSetupModal(false);
    setOpenVerifyModal(true);
  };

  const handleBack = () => {
    setOpenVerifyModal(false);
    setOpenSetupModal(true);
  };

  const handleVerify = async (code: string) => {
    if (!/^\d{6}$/.test(code)) {
      messageApi.error("Vui lòng nhập mã xác thực gồm 6 chữ số.");
      return;
    }

    if (verifyLoading) return;

    try {
      setVerifyLoading(true);

      const result = await authApi.enable2FA({ code });

      if (!result.isSuccess) {
        messageApi.error(result.message || "Kích hoạt 2FA thất bại.");
        return;
      }

      setConnected(true);
      setOpenVerifyModal(false);
      setSetupData(null);
      setBackupCodes(result.backupCodes);
      setOpenBackupCodesModal(true);

      messageApi.success("Kích hoạt xác thực hai bước thành công.");
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || "Mã xác thực không hợp lệ."
        : error instanceof Error
          ? error.message
          : "Không thể kích hoạt xác thực hai bước.";

      messageApi.error(errorMessage);
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleDisable = async (values: { password: string; code: string }) => {
    if (disableLoading) return;

    try {
      setDisableLoading(true);

      const result = await authApi.disable2FA(values);

      if (!result) {
        messageApi.error("Không thể tắt xác thực hai bước.");
        return;
      }

      setConnected(false);
      setOpenDisableModal(false);
      setSetupData(null);

      messageApi.success("Đã tắt xác thực hai bước thành công.");
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || "Không thể tắt xác thực hai bước."
        : error instanceof Error
          ? error.message
          : "Không thể tắt xác thực hai bước.";

      messageApi.error(errorMessage);
    } finally {
      setDisableLoading(false);
    }
  };

  const handleCancelSetup = () => {
    setOpenSetupModal(false);
    setSetupData(null);
  };

  const handleCancelVerify = () => {
    setOpenVerifyModal(false);
    setSetupData(null);
  };

  return (
    <div className="account-detail-page">
      {contextHolder}

      <div className="account-detail-page__card">
        <div className="tf-details">
          <p className="tf-details__description">
            Xác thực bằng cách lấy mã xác minh từ một ứng dụng xác thực. Ứng
            dụng này hoạt động ngay cả khi điện thoại của bạn không có kết nối
            mạng.
            <br />
            Trước tiên, hãy tải ứng dụng Google Authenticator xuống từ{" "}
            <a
              href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2"
              target="_blank"
              rel="noopener noreferrer">
              cửa hàng Google Play
            </a>{" "}
            hoặc{" "}
            <a
              href="https://apps.apple.com/"
              target="_blank"
              rel="noopener noreferrer">
              App Store trên thiết bị iOS
            </a>
            .
          </p>

          {connected ? (
            <section className="tf-details__section">
              <div className="tf-details__authenticator-card">
                <h2>Ứng dụng Authenticator của bạn</h2>

                <div className="tf-details__item">
                  <div className="tf-details__item-icon">
                    <QrCode size={32} strokeWidth={1.8} />
                  </div>

                  <div className="tf-details__item-info">
                    <h3>Authenticator</h3>
                    <p>Đã thêm vừa xong</p>

                    <button
                      type="button"
                      className="tf-details__link"
                      onClick={handleSetup}>
                      Thay đổi ứng dụng xác thực
                    </button>
                  </div>

                  <button
                    type="button"
                    className="tf-details__delete"
                    aria-label="Tắt ứng dụng xác thực"
                    onClick={() => setOpenDisableModal(true)}>
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </section>
          ) : (
            <AppButton
              variant="primary"
              width={368}
              height={38}
              className="tf-details__setup-button"
              disabled={setupLoading}
              onClick={handleSetup}>
              {setupLoading
                ? "Đang thiết lập..."
                : "Thiết lập ứng dụng xác thực"}
            </AppButton>
          )}
        </div>
      </div>

      <SetupAuthenticatorModal
        open={openSetupModal}
        setupData={setupData}
        onCancel={handleCancelSetup}
        onConfirm={handleNext}
      />

      <VerifyAuthenticatorModal
        open={openVerifyModal}
        loading={verifyLoading}
        onCancel={handleCancelVerify}
        onBack={handleBack}
        onConfirm={handleVerify}
      />

      <DisableAuthenticatorModal
        open={openDisableModal}
        loading={disableLoading}
        onCancel={() => setOpenDisableModal(false)}
        onConfirm={handleDisable}
      />
      <BackupCodesModal
        open={openBackupCodesModal}
        codes={backupCodes}
        onClose={() => {
          setOpenBackupCodesModal(false);
          setBackupCodes([]);
        }}
      />
    </div>
  );
}

export default AuthenticatorAppPage;
