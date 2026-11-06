import { useEffect, useState } from "react";
import { Form, Input, Upload, message } from "antd";
import type { UploadProps } from "antd";
import { FileVideo, Trash2, UploadCloud } from "lucide-react";

import AppModal from "../../../../components/common/AppModal";
import AppButton from "../../../../components/common/AppButton";
import AppSelect from "../../../../components/common/AppSelect";

import type {
  FacilityMediaItem,
  FacilityMediaFormValues,
  MediaContentType,
} from "../../types/facilityMedia.types";

import "./FacilityMediaFormModal.css";

interface FacilityMediaFormModalProps {
  open: boolean;
  mode?: "create" | "edit";
  initialValues?: FacilityMediaItem | null;
  categories: string[];
  loading?: boolean;
  onCancel: () => void;
  onSubmit: (values: FacilityMediaFormValues) => void | Promise<void>;
}

interface FormFields {
  title: string;
  category: string;
  contentType: MediaContentType;
  contentValue?: string;
}

const contentOptions = [
  { label: "Tệp tin", value: "file" },
  { label: "Liên kết phát trực tiếp", value: "live" },
  { label: "Tải từ đường dẫn", value: "url" },
  { label: "Tần số kênh (Hz)", value: "frequency" },
];

const MAX_FILE_SIZE_MB = 200;

function FacilityMediaFormModal({
  open,
  mode = "create",
  initialValues,
  categories,
  loading = false,
  onCancel,
  onSubmit,
}: FacilityMediaFormModalProps) {
  const [form] = Form.useForm<FormFields>();

  const isEdit = mode === "edit";

  const [contentType, setContentType] = useState<MediaContentType>("file");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [removeExisting, setRemoveExisting] = useState(false);

  const [previewUrl, setPreviewUrl] = useState("");

  const existingUrl = isEdit ? (initialValues?.url ?? "") : "";

  const currentPreviewUrl = selectedFile
    ? previewUrl
    : removeExisting
      ? ""
      : existingUrl;

  useEffect(() => {
    if (!open) return;

    form.resetFields();
    setSelectedFile(null);
    setRemoveExisting(false);

    const nextContentType = initialValues?.contentType ?? "file";

    setContentType(isEdit ? nextContentType : "file");

    form.setFieldsValue({
      title: isEdit ? (initialValues?.title ?? "") : "",
      category: isEdit ? (initialValues?.category ?? "") : "",
      contentType: isEdit ? nextContentType : "file",
      contentValue: isEdit
        ? (initialValues?.contentValue ??
          (nextContentType !== "file" ? (initialValues?.url ?? "") : ""))
        : "",
    });
  }, [open, isEdit, initialValues, form]);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl("");
      return;
    }

    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  const handleChooseFile: UploadProps["beforeUpload"] = (file) => {
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      message.error(
        `Dung lượng file không được vượt quá ${MAX_FILE_SIZE_MB} MB`,
      );
      return Upload.LIST_IGNORE;
    }

    setSelectedFile(file);
    setRemoveExisting(false);

    return false;
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setRemoveExisting(true);
  };

  const handleSubmit = async (values: FormFields) => {
    const type = isEdit
      ? (initialValues?.contentType ?? "file")
      : values.contentType;

    const contentValue = values.contentValue?.trim() ?? "";

    if (type === "file") {
      if (!selectedFile && !currentPreviewUrl) {
        message.error("Vui lòng chọn file media");
        return;
      }
    } else if (!contentValue) {
      message.error("Vui lòng nhập nội dung media");
      return;
    }

    await onSubmit({
      title: values.title.trim(),
      category: values.category,
      contentType: type,
      contentValue: type === "file" ? undefined : contentValue,
      file: selectedFile,
    });
  };

  const handleFinish = (values: FormFields) => {
    void handleSubmit(values);
  };

  const handleCancel = () => {
    if (loading) return;
    onCancel();
  };

  const renderPreview = () => {
    if (!currentPreviewUrl) {
      return (
        <div className="facility-media-modal__no-preview">
          Chưa có nội dung xem trước
        </div>
      );
    }

    const mediaType = selectedFile
      ? selectedFile.type
      : (initialValues?.mimeType ??
        (initialValues?.type === "video"
          ? "video/mp4"
          : initialValues?.type === "audio"
            ? "audio/mpeg"
            : "image/jpeg"));

    if (mediaType.startsWith("video/")) {
      return (
        <video
          className="facility-media-modal__video"
          src={currentPreviewUrl}
          controls
          preload="metadata"
        />
      );
    }

    if (mediaType.startsWith("audio/")) {
      return (
        <div className="facility-media-modal__audio">
          <audio src={currentPreviewUrl} controls />
        </div>
      );
    }

    if (mediaType.startsWith("image/")) {
      return (
        <img
          src={currentPreviewUrl}
          alt="Xem trước media"
          className="facility-media-modal__preview-image"
        />
      );
    }

    return (
      <div className="facility-media-modal__no-preview">
        Không hỗ trợ xem trước định dạng này
      </div>
    );
  };

  const renderCreateContent = () => {
    switch (contentType) {
      case "file":
        return (
          <div className="facility-media-modal__upload-area">
            {selectedFile ? (
              <div className="facility-media-modal__uploaded-file">
                <FileVideo size={30} color="#F26D21" />

                <div className="facility-media-modal__file-info">
                  <span>{selectedFile.name}</span>
                  <small>{(selectedFile.size / 1024).toFixed(2)} KB</small>
                </div>

                <button
                  type="button"
                  className="facility-media-modal__delete-file"
                  onClick={handleRemoveFile}
                  aria-label="Xóa file đã chọn">
                  <Trash2 size={18} />
                </button>
              </div>
            ) : (
              <Upload.Dragger
                showUploadList={false}
                beforeUpload={handleChooseFile}
                multiple={false}
                className="facility-media-modal__dragger">
                <UploadCloud size={24} color="#A7AFC4" />
                <div>
                  <span>Chọn</span> hoặc kéo tệp vào đây
                </div>
              </Upload.Dragger>
            )}
          </div>
        );

      case "live":
        return (
          <Form.Item
            name="contentValue"
            rules={[
              {
                required: true,
                whitespace: true,
                message: "Vui lòng nhập liên kết phát trực tiếp",
              },
              {
                type: "url",
                message: "Liên kết không hợp lệ",
              },
            ]}>
            <Input size="large" placeholder="Nhập liên kết phát trực tiếp" />
          </Form.Item>
        );

      case "url":
        return (
          <Form.Item
            name="contentValue"
            rules={[
              {
                required: true,
                whitespace: true,
                message: "Vui lòng nhập đường dẫn",
              },
              {
                type: "url",
                message: "Đường dẫn không hợp lệ",
              },
            ]}>
            <Input size="large" placeholder="Nhập đường dẫn" />
          </Form.Item>
        );

      case "frequency":
        return (
          <Form.Item
            name="contentValue"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập tần số",
              },
              {
                validator: async (_, value) => {
                  if (!value) return;

                  const frequency = Number(value);

                  if (!Number.isFinite(frequency) || frequency <= 0) {
                    throw new Error("Tần số phải lớn hơn 0");
                  }
                },
              },
            ]}>
            <Input
              size="large"
              type="number"
              min={0}
              step="any"
              placeholder="Nhập tần số Hz"
            />
          </Form.Item>
        );
    }
  };

  return (
    <AppModal
      open={open}
      title={isEdit ? "Cập nhật file media" : "Thêm file media"}
      width={470}
      className={`facility-media-modal ${
        isEdit ? "facility-media-modal--edit" : ""
      }`}
      onCancel={handleCancel}
      footer={null}>
      <Form
        form={form}
        layout="vertical"
        requiredMark
        onFinish={handleFinish}
        className="facility-media-modal__form">
        <div className="facility-media-modal__fields">
          <Form.Item
            label="Tên media file"
            name="title"
            rules={[
              {
                required: true,
                whitespace: true,
                message: "Vui lòng nhập tên media file",
              },
            ]}>
            <Input size="large" placeholder="Nhập tên file" maxLength={200} />
          </Form.Item>

          <Form.Item
            label="Lĩnh vực"
            name="category"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn lĩnh vực",
              },
            ]}>
            <AppSelect
              width="100%"
              placeholder="Chọn lĩnh vực"
              options={categories.map((category) => ({
                value: category,
                label: category,
              }))}
            />
          </Form.Item>

          {isEdit ? (
            <>
              <div className="facility-media-modal__field-label">
                File đính kèm hoặc link nội dung
                <span>*</span>
              </div>

              <div className="facility-media-modal__preview">
                {selectedFile || !removeExisting ? (
                  renderPreview()
                ) : (
                  <div className="facility-media-modal__no-preview">
                    Đã xóa nội dung hiện tại
                  </div>
                )}

                {currentPreviewUrl && (
                  <button
                    type="button"
                    className="facility-media-modal__preview-close"
                    onClick={handleRemoveFile}
                    aria-label="Xóa nội dung hiện tại">
                    ×
                  </button>
                )}
              </div>

              <Upload
                showUploadList={false}
                beforeUpload={handleChooseFile}
                accept="image/*,video/*,audio/*">
                <button
                  type="button"
                  className="facility-media-modal__replace-button">
                  Chọn lại file
                </button>
              </Upload>
            </>
          ) : (
            <>
              <Form.Item
                label="Nội dung"
                name="contentType"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn nội dung",
                  },
                ]}>
                <AppSelect
                  width="100%"
                  options={contentOptions}
                  onChange={(value) => {
                    setContentType(value as MediaContentType);
                    setSelectedFile(null);
                    form.setFieldValue("contentValue", "");
                  }}
                />
              </Form.Item>

              {renderCreateContent()}
            </>
          )}

          <div className="facility-media-modal__required-note">
            <span>*</span> là những trường thông tin bắt buộc
          </div>
        </div>

        <div className="facility-media-modal__actions">
          <AppButton
            variant="outline"
            width={120}
            height={44}
            disabled={loading}
            onClick={handleCancel}>
            Hủy
          </AppButton>

          <AppButton
            width={120}
            height={44}
            htmlType="submit"
            loading={loading}>
            Lưu
          </AppButton>
        </div>
      </Form>
    </AppModal>
  );
}

export default FacilityMediaFormModal;
