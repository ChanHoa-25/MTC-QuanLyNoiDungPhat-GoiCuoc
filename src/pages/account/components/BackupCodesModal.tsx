import { useState } from "react";
import { message } from "antd";

import AppModal from "../../../components/common/AppModal";
import AppButton from "../../../components/common/AppButton";

import "./BackupCodesModal.css";

interface BackupCodesModalProps {
  open: boolean;
  codes: string[];
  mode?: "enable" | "regenerate";
  onClose: () => void;
}

function BackupCodesModal({
  open,
  codes,
  mode = "enable",
  onClose,
}: BackupCodesModalProps) {
  const [messageApi, contextHolder] = message.useMessage();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (codes.length === 0) return;

    try {
      await navigator.clipboard.writeText(codes.join("\n"));
      setCopied(true);
      messageApi.success("Đã sao chép mã dự phòng.");
    } catch {
      messageApi.error("Không thể sao chép mã dự phòng.");
    }
  };

  const handleDownload = () => {
    if (codes.length === 0) return;

    const blob = new Blob([codes.join("\n")], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "mtc-recovery-codes.txt";

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    messageApi.success("Đã tải mã dự phòng.");
  };

  const handleClose = () => {
    setCopied(false);
    onClose();
  };

  return (
    <>
      {contextHolder}

      <AppModal
        open={open}
        onCancel={handleClose}
        footer={null}
        width={550}
        className="backup-codes-modal"
        maskClosable={false}>
        <h2>Mã dự phòng xác thực hai bước</h2>

        <p>
          {mode === "enable"
            ? "Xác thực hai bước đã được kích hoạt thành công. Hãy lưu các mã dự phòng ở nơi an toàn. Mỗi mã chỉ sử dụng được một lần."
            : "Đã tạo lại mã dự phòng thành công. Các mã cũ không còn hiệu lực. Hãy lưu các mã mới ở nơi an toàn. Mỗi mã chỉ sử dụng được một lần."}
        </p>

        <div className="backup-codes-modal__list">
          {codes.map((code) => (
            <div key={code} className="backup-codes-modal__item">
              {code}
            </div>
          ))}
        </div>

        <div className="backup-codes-modal__actions">
          <AppButton
            variant="outline"
            width={120}
            height={44}
            disabled={codes.length === 0}
            onClick={handleCopy}>
            {copied ? "Đã sao chép" : "Sao chép"}
          </AppButton>

          <AppButton
            variant="outline"
            width={120}
            height={44}
            disabled={codes.length === 0}
            onClick={handleDownload}>
            Tải xuống
          </AppButton>

          <AppButton
            variant="primary"
            width={120}
            height={44}
            onClick={handleClose}>
            Hoàn tất
          </AppButton>
        </div>
      </AppModal>
    </>
  );
}

export default BackupCodesModal;
