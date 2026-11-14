import { useState } from "react";
import { Input } from "antd";

import AppModal from "../../../components/common/AppModal";
import AppButton from "../../../components/common/AppButton";

import "./VerifyAuthenticatorModal.css";

interface VerifyAuthenticatorModalProps {
  open: boolean;
  loading?: boolean;
  onCancel: () => void;
  onBack: () => void;
  onConfirm: (code: string) => void;
}

function VerifyAuthenticatorModal({
  open,
  loading = false,
  onCancel,
  onBack,
  onConfirm,
}: VerifyAuthenticatorModalProps) {
  const [code, setCode] = useState("");

  const handleChange = (value: string) => {
    setCode(value.replace(/\D/g, "").slice(0, 6));
  };

  const handleCancel = () => {
    if (loading) return;

    setCode("");
    onCancel();
  };

  const handleBack = () => {
    if (loading) return;

    setCode("");
    onBack();
  };

  const handleConfirm = () => {
    if (code.length !== 6 || loading) return;

    onConfirm(code);
  };

  return (
    <AppModal
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={650}
      closable={!loading}
      className="verify-authenticator-modal">
      <h2>Thiết lập xác thực hai bước qua ứng dụng</h2>

      <p>Vui lòng nhập mã xác nhận trên ứng dụng bạn vừa kết nối.</p>

      <h3>Nhập mã xác thực trên ứng dụng để hoàn tất</h3>

      <Input.OTP
        length={6}
        value={code}
        onChange={handleChange}
        formatter={(value) => value.replace(/\D/g, "")}
        size="large"
        disabled={loading}
      />

      <div className="verify-authenticator-modal__actions">
        <AppButton
          variant="outline"
          width={150}
          height={52}
          disabled={loading}
          onClick={handleBack}>
          Quay lại
        </AppButton>

        <AppButton
          variant="primary"
          width="100%"
          height={52}
          disabled={code.length !== 6 || loading}
          onClick={handleConfirm}>
          {loading ? "Đang xác nhận..." : "Xác nhận"}
        </AppButton>
      </div>
    </AppModal>
  );
}

export default VerifyAuthenticatorModal;
