import { useCallback, useEffect, useState } from "react";
import { Form, Input, message } from "antd";
import axios from "axios";
import { Download, RefreshCw, Trash2 } from "lucide-react";

import AppModal from "../../../components/common/AppModal";
import AppButton from "../../../components/common/AppButton";
import { authApi } from "../../../api/authApi";

import "./TwoFactorDetails.css";

interface PasswordFormValues {
  password: string;
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || fallback;
  }

  return error instanceof Error ? error.message : fallback;
}

function RecoveryCodesPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm<PasswordFormValues>();

  const [remainingCount, setRemainingCount] = useState<number | null>(null);
  const [codes, setCodes] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  const [openRegenerateModal, setOpenRegenerateModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  // Lấy số lượng mã dự phòng từ Backend
  const loadCount = useCallback(async () => {
    try {
      setLoading(true);

      const count = await authApi.getBackupCodesCount();
      setRemainingCount(count);
    } catch (error) {
      messageApi.error(
        getErrorMessage(error, "Không thể lấy số lượng mã dự phòng."),
      );
    } finally {
      setLoading(false);
    }
  }, [messageApi]);

  useEffect(() => {
    void loadCount();
  }, [loadCount]);

  // Mở popup tạo lại mã
  const handleOpenRegenerate = () => {
    form.resetFields();
    setOpenRegenerateModal(true);
  };

  // Đóng popup tạo lại mã
  const handleCloseRegenerate = () => {
    if (regenerating) return;

    form.resetFields();
    setOpenRegenerateModal(false);
  };

  // Tạo lại mã dự phòng
  const handleRegenerate = async (values: PasswordFormValues) => {
    if (regenerating) return;

    try {
      setRegenerating(true);

      const newCodes = await authApi.regenerateBackupCodes(values.password);

      if (!Array.isArray(newCodes) || newCodes.length === 0) {
        messageApi.error("Backend không trả về mã dự phòng mới.");
        return;
      }

      // Hiển thị trực tiếp danh sách mã trên trang
      setCodes(newCodes);
      setRemainingCount(newCodes.length);

      setOpenRegenerateModal(false);
      form.resetFields();

      messageApi.success("Đã tạo mã dự phòng mới thành công.");

      // Đồng bộ số lượng từ Backend
      void loadCount();
    } catch (error) {
      messageApi.error(
        getErrorMessage(error, "Không thể tạo lại mã dự phòng."),
      );
    } finally {
      setRegenerating(false);
    }
  };

  // Tải mã dự phòng xuống file TXT
  const handleDownload = () => {
    if (codes.length === 0) {
      messageApi.warning("Không có mã dự phòng để tải xuống.");
      return;
    }

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

  // Mở popup xóa mã
  const handleOpenDelete = () => {
    setOpenDeleteModal(true);
  };

  // Đóng popup xóa mã
  const handleCloseDelete = () => {
    setOpenDeleteModal(false);
  };

  // Xóa mã dự phòng - chờ Backend bổ sung API
  const handleDelete = () => {
    messageApi.warning(
      "Backend chưa hỗ trợ xóa mã dự phòng. Vui lòng bổ sung API xóa.",
    );
  };

  const hasBackupCodes = remainingCount !== null && remainingCount > 0;

  return (
    <div className="account-detail-page">
      {contextHolder}

      <div className="account-detail-page__card">
        <div className="tf-details">
          <p className="tf-details__description">
            Tải xuống mã dự phòng để nhập vào khi cần đăng nhập, giữ các mã dự
            phòng này ở nơi an toàn nhưng có thể lấy được.
          </p>

          {loading && remainingCount === null ? (
            <p>Đang tải thông tin mã dự phòng...</p>
          ) : remainingCount === null ? (
            <AppButton
              variant="outline"
              width={165}
              height={42}
              onClick={() => void loadCount()}>
              Thử lại
            </AppButton>
          ) : hasBackupCodes ? (
            <section className="tf-details__recovery">
              <h2 className="tf-details__recovery-title">
                Mã dự phòng của bạn
              </h2>

              <div className="tf-details__recovery-header">
                <div className="tf-details__recovery-info">
                  <h3>Còn {remainingCount} mã dự phòng</h3>

                  <p>
                    {codes.length > 0
                      ? "Mã dự phòng vừa được tạo. Hãy tải xuống và lưu giữ an toàn."
                      : "Các mã đã tạo trước đó không thể xem lại."}
                  </p>
                </div>

                <div className="tf-details__recovery-actions">
                  {/* Nút tạo lại mã */}
                  <button
                    type="button"
                    aria-label="Tạo lại mã dự phòng"
                    title="Tạo lại mã dự phòng"
                    onClick={handleOpenRegenerate}
                    disabled={regenerating}>
                    <RefreshCw size={20} />
                  </button>

                  {/* Nút xóa mã */}
                  <button
                    type="button"
                    aria-label="Xóa mã dự phòng"
                    title="Xóa mã dự phòng"
                    onClick={handleOpenDelete}>
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

              {/* Danh sách mã vừa tạo */}
              {codes.length > 0 && (
                <>
                  <div className="tf-details__codes">
                    {codes.map((code) => (
                      <div className="tf-details__code" key={code}>
                        {code}
                      </div>
                    ))}
                  </div>

                  <div className="tf-details__recovery-footer">
                    <AppButton
                      variant="outline"
                      width={165}
                      height={42}
                      icon={<Download size={18} />}
                      onClick={handleDownload}>
                      Tải mã xuống
                    </AppButton>
                  </div>
                </>
              )}
            </section>
          ) : (
            <AppButton
              variant="primary"
              width={368}
              height={38}
              className="tf-details__generate-button"
              onClick={handleOpenRegenerate}>
              Nhận mã dự phòng
            </AppButton>
          )}
        </div>
      </div>

      {/* Popup tạo lại mã dự phòng */}
      <AppModal
        open={openRegenerateModal}
        onCancel={handleCloseRegenerate}
        footer={null}
        width={650}
        className="recovery-delete-modal"
        centered
        destroyOnHidden
        closable={!regenerating}
        maskClosable={!regenerating}>
        <h2 className="recovery-delete-modal__title">
          {hasBackupCodes ? "Tạo lại mã dự phòng" : "Nhận mã dự phòng"}
        </h2>

        <p className="recovery-delete-modal__description">
          {hasBackupCodes
            ? "Các mã dự phòng cũ sẽ bị vô hiệu hóa. Nhập mật khẩu để xác nhận tạo mã mới."
            : "Nhập mật khẩu để tạo bộ mã dự phòng mới."}
        </p>

        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={handleRegenerate}>
          <Form.Item
            label="Mật khẩu hiện tại"
            name="password"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập mật khẩu.",
              },
            ]}>
            <Input.Password
              size="large"
              placeholder="Nhập mật khẩu hiện tại"
              disabled={regenerating}
            />
          </Form.Item>

          <div className="recovery-delete-modal__actions">
            <AppButton
              variant="outline"
              width={150}
              height={52}
              disabled={regenerating}
              onClick={handleCloseRegenerate}>
              Quay lại
            </AppButton>

            <AppButton
              variant="primary"
              width="100%"
              height={52}
              disabled={regenerating}
              onClick={() => form.submit()}>
              {regenerating ? "Đang xử lý..." : "Xác nhận"}
            </AppButton>
          </div>
        </Form>
      </AppModal>

      {/* Popup xác nhận xóa mã dự phòng - theo Figma */}
      <AppModal
        open={openDeleteModal}
        onCancel={handleCloseDelete}
        footer={null}
        width={650}
        className="recovery-delete-modal"
        centered
        destroyOnHidden>
        <h2 className="recovery-delete-modal__title">Xóa mã dự phòng</h2>

        <p className="recovery-delete-modal__description">
          Bạn sẽ không thể sử dụng những mã dự phòng này để đăng nhập.
        </p>

        <div className="recovery-delete-modal__actions">
          <AppButton
            variant="outline"
            width={150}
            height={52}
            onClick={handleCloseDelete}>
            Quay lại
          </AppButton>

          <AppButton
            variant="primary"
            width="100%"
            height={52}
            onClick={handleDelete}>
            Xác nhận
          </AppButton>
        </div>
      </AppModal>
    </div>
  );
}

export default RecoveryCodesPage;
