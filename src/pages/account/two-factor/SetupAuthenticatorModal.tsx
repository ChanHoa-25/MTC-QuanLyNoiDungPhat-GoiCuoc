import AppModal from "../../../components/common/AppModal";
import AppButton from "../../../components/common/AppButton";

import type { TwoFactorSetupResponse } from "../../../api/authApi";

import "./SetupAuthenticatorModal.css";

interface SetupAuthenticatorModalProps {
  open: boolean;
  setupData: TwoFactorSetupResponse | null;
  onCancel: () => void;
  onConfirm: () => void;
}

function SetupAuthenticatorModal({
  open,
  setupData,
  onCancel,
  onConfirm,
}: SetupAuthenticatorModalProps) {
  const handleCopy = async () => {
    if (!setupData) return;

    try {
      await navigator.clipboard.writeText(setupData.secretKey);
    } catch {
      return;
    }
  };

  return (
    <AppModal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={760}
      className="setup-authenticator-modal">
      <h2>Thiết lập xác thực hai bước qua ứng dụng</h2>

      <div className="setup-authenticator-modal__content">
        <h3>1. Tải xuống ứng dụng xác thực</h3>

        <p>Tải xuống Google Authenticator nếu bạn chưa cài đặt.</p>

        <h3>2. Quét mã QR hoặc sao chép khóa</h3>

        <p>
          Quét mã QR này trong ứng dụng xác thực hoặc sao chép mã khóa phía dưới
          QR và dán vào trong ứng dụng xác thực.
        </p>

        <div className="setup-authenticator-modal__qr">
          {setupData?.qrCodeDataUrl ? (
            <img
              src={setupData.qrCodeDataUrl}
              alt="Mã QR thiết lập xác thực hai bước"
              className="setup-authenticator-modal__qr-image"
            />
          ) : (
            <p>Không có mã QR để hiển thị.</p>
          )}
        </div>

        {setupData?.manualEntryKey && (
          <div className="setup-authenticator-modal__manual-key">
            <span>{setupData.manualEntryKey}</span>

            <AppButton
              variant="outline"
              width={100}
              height={36}
              onClick={handleCopy}>
              Sao chép
            </AppButton>
          </div>
        )}

        <h3>3. Sao chép và nhập mã 6 chữ số</h3>

        <p>
          Sau khi quét mã QR hoặc nhập khóa, ứng dụng xác thực sẽ tạo ra một mã
          6 chữ số. Sao chép mã này và quay lại đây chọn “Xác nhận” để nhập vào
          ở bước tiếp theo.
        </p>
      </div>

      <div className="setup-authenticator-modal__actions">
        <AppButton variant="outline" width={150} height={52} onClick={onCancel}>
          Quay lại
        </AppButton>

        <AppButton
          variant="primary"
          width="100%"
          height={52}
          disabled={!setupData}
          onClick={onConfirm}>
          Xác nhận
        </AppButton>
      </div>
    </AppModal>
  );
}

export default SetupAuthenticatorModal;
