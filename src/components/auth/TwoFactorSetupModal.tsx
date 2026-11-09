import React, { useState } from "react";
import { Form, Input, message, Steps } from "antd";
import { ShieldCheck, QrCode, KeyRound, Copy, Check } from "lucide-react";
import AppModal from "../common/AppModal";
import AppButton from "../common/AppButton";
import { useAuth } from "../../contexts/AuthContext";

interface TwoFactorSetupModalProps {
  open: boolean;
  onClose: () => void;
}

export const TwoFactorSetupModal: React.FC<TwoFactorSetupModalProps> = ({
  open,
  onClose,
}) => {
  const { enable2FA } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [otpCode, setOtpCode] = useState("");
  const [copied, setCopied] = useState(false);
  const secretKey = "MTC-7X8A-9K2P-4L9Z-2026";

  const handleCopy = () => {
    navigator.clipboard?.writeText(secretKey);
    setCopied(true);
    message.success("Đã sao chép Secret Key vào bộ nhớ tạm");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = () => {
    if (otpCode.length !== 6) {
      message.error("Vui lòng nhập đủ 6 chữ số mã xác thực OTP");
      return;
    }
    const success = enable2FA(otpCode);
    if (success) {
      message.success("Thiết lập xác thực 2 bước (2FA) thành công!");
      setCurrentStep(2);
    } else {
      message.error("Mã xác thực không hợp lệ. Vui lòng thử lại!");
    }
  };

  const handleFinish = () => {
    setCurrentStep(0);
    setOtpCode("");
    onClose();
  };

  return (
    <AppModal
      open={open}
      onCancel={onClose}
      width={560}
      title="Thiết lập xác thực hai bước (2FA)"
      footer={null}>
      <div style={{ paddingTop: 8 }}>
        <Steps
          current={currentStep}
          size="small"
          style={{ marginBottom: 24 }}
          items={[
            { title: "Quét mã QR" },
            { title: "Nhập mã OTP" },
            { title: "Hoàn tất" },
          ]}
        />

        {currentStep === 0 && (
          <div style={{ textAlign: "center" }}>
            <p style={{ color: "#595959", fontSize: 14, marginBottom: 16 }}>
              Sử dụng ứng dụng <strong>Google Authenticator</strong> hoặc{" "}
              <strong>Microsoft Authenticator</strong> trên điện thoại để quét mã bên dưới:
            </p>

            {/* Simulated QR Code SVG */}
            <div
              style={{
                width: 180,
                height: 180,
                background: "#FFFFFF",
                border: "2px solid #E8E8E8",
                borderRadius: 12,
                margin: "0 auto 16px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: 12,
              }}>
              <QrCode size={140} color="#2B2B2B" strokeWidth={1.5} />
            </div>

            <div
              style={{
                background: "#F5F5F5",
                borderRadius: 6,
                padding: "8px 14px",
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 24,
              }}>
              <span style={{ fontSize: 12, color: "#8C8C8C" }}>Secret Key:</span>
              <strong style={{ fontSize: 13, letterSpacing: 1 }}>{secretKey}</strong>
              <button
                type="button"
                onClick={handleCopy}
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  color: copied ? "#52C41A" : "#F26D21",
                  display: "flex",
                  alignItems: "center",
                }}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <AppButton variant="outline" width={110} onClick={onClose}>
                Hủy
              </AppButton>
              <AppButton variant="primary" width={150} onClick={() => setCurrentStep(1)}>
                Tiếp tục
              </AppButton>
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  background: "#FFF1E8",
                  color: "#F26D21",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 12px",
                }}>
                <KeyRound size={28} />
              </div>
              <p style={{ color: "#595959", fontSize: 14 }}>
                Nhập mã xác thực gồm 6 chữ số đang hiển thị trên ứng dụng xác thực của bạn:
              </p>
            </div>

            <Form.Item style={{ textAlign: "center", marginBottom: 24 }}>
              <Input
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                style={{
                  fontSize: 26,
                  textAlign: "center",
                  letterSpacing: 10,
                  fontWeight: 700,
                  width: 220,
                  height: 52,
                  borderColor: "#F26D21",
                }}
              />
            </Form.Item>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <AppButton variant="outline" width={110} onClick={() => setCurrentStep(0)}>
                Quay lại
              </AppButton>
              <AppButton variant="primary" width={150} onClick={handleVerify}>
                Xác nhận
              </AppButton>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div style={{ textAlign: "center", padding: "12px 0" }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "#F6FFED",
                color: "#52C41A",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}>
              <ShieldCheck size={40} />
            </div>

            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#2B2B2B", marginBottom: 8 }}>
              Kích hoạt 2FA thành công!
            </h3>
            <p style={{ color: "#595959", fontSize: 14, marginBottom: 24 }}>
              Tài khoản của bạn hiện đã được bảo vệ bởi lớp bảo mật 2 bước. Mỗi khi đăng nhập, hệ thống sẽ yêu cầu mã OTP từ ứng dụng của bạn.
            </p>

            <AppButton variant="primary" width={160} onClick={handleFinish}>
              Hoàn tất
            </AppButton>
          </div>
        )}
      </div>
    </AppModal>
  );
};

export default TwoFactorSetupModal;
