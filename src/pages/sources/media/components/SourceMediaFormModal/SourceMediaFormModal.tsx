import { useEffect, useState } from "react";
import { Form, Input, Upload, message } from "antd";
import type { UploadProps } from "antd";
import {
  Maximize,
  MoveUpRight,
  Pause,
  Play,
  Trash2,
  Upload as UploadIcon,
  UploadCloud,
  Volume2,
  VolumeX,
} from "lucide-react";

import AppButton from "../../../../../components/common/AppButton";
import AppModal from "../../../../../components/common/AppModal";
import AppSelect from "../../../../../components/common/AppSelect";
import type {
  SourceMediaContentType,
  SourceMediaFormValues,
  SourceMediaItem,
} from "../../types/sourceMedia.types";

import "./SourceMediaFormModal.css";

interface SourceMediaFormModalProps {
  open: boolean;
  mode: "create" | "edit";
  initialValues?: SourceMediaItem | null;
  categories: string[];
  onCancel: () => void;
  onSubmit: (values: SourceMediaFormValues) => void;
  onStorageFull?: () => void;
}

interface FormFields {
  title: string;
  category: string;
  contentType: SourceMediaContentType;
  contentValue?: string;
}

const CONTENT_TYPE_OPTIONS: Array<{
  label: string;
  value: SourceMediaContentType;
}> = [
  { label: "Tệp tin", value: "file" },
  { label: "Liên kết phát trực tiếp", value: "live" },
  { label: "Tải từ đường dẫn", value: "url" },
  { label: "Tần số kênh (Hz)", value: "frequency" },
];

const MAX_STORAGE_FILE_MB = 200;

function formatFileSizeKb(bytes: number): string {
  const kb = bytes / 1024;
  return `${kb.toFixed(2)} kb`;
}

function getFileExtensionBadge(fileName: string): string {
  const parts = fileName.split(".");
  const ext = parts.length > 1 ? parts[parts.length - 1].toUpperCase() : "MP4";
  return ext.slice(0, 4);
}

function SourceMediaFormModal({
  open,
  mode,
  initialValues,
  categories,
  onCancel,
  onSubmit,
  onStorageFull,
}: SourceMediaFormModalProps) {
  const [form] = Form.useForm<FormFields>();
  const isEdit = mode === "edit";

  const [contentType, setContentType] =
    useState<SourceMediaContentType>("file");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(52);

  useEffect(() => {
    if (!open) return;

    form.resetFields();
    setSelectedFile(null);
    setIsPlaying(false);
    setIsMuted(false);
    setProgress(52);

    const nextType = initialValues?.contentType ?? "file";
    setContentType(isEdit ? nextType : "file");

    form.setFieldsValue({
      title: isEdit ? (initialValues?.title ?? "") : "",
      category: isEdit ? (initialValues?.category ?? undefined) : undefined,
      contentType: isEdit ? nextType : "file",
      contentValue: isEdit ? (initialValues?.attachmentOrLink ?? "") : "",
    });
  }, [open, isEdit, initialValues, form]);

  const handleChooseFile: UploadProps["beforeUpload"] = (file) => {
    if (file.size > MAX_STORAGE_FILE_MB * 1024 * 1024) {
      onStorageFull?.();
      return Upload.LIST_IGNORE;
    }

    setSelectedFile(file);
    if (!form.getFieldValue("title")) {
      const baseName = file.name.replace(/\.[^/.]+$/, "");
      form.setFieldValue("title", baseName);
    }
    return false;
  };

  const handleFinish = (values: FormFields) => {
    if (!isEdit && contentType === "file" && !selectedFile) {
      message.warning("Vui lòng chọn tệp tin tải lên");
      return;
    }

    onSubmit({
      title: values.title.trim(),
      category: values.category,
      contentType: isEdit ? (initialValues?.contentType ?? "file") : contentType,
      contentValue: values.contentValue?.trim(),
      file: selectedFile,
    });
  };

  const renderCreateContentField = () => {
    switch (contentType) {
      case "file":
        return (
          <div className="source-media-form-modal__upload-wrap">
            {selectedFile ? (
              <div className="source-media-form-modal__uploaded-box">
                <div className="source-media-form-modal__file-badge">
                  <span>{getFileExtensionBadge(selectedFile.name)}</span>
                </div>

                <div className="source-media-form-modal__file-meta">
                  <span className="source-media-form-modal__file-name">
                    {selectedFile.name}
                  </span>
                  <span className="source-media-form-modal__file-size">
                    {formatFileSizeKb(selectedFile.size)}
                  </span>
                </div>

                <button
                  type="button"
                  className="source-media-form-modal__file-remove"
                  aria-label="Xóa tệp đã chọn"
                  onClick={() => setSelectedFile(null)}>
                  <Trash2 size={16} />
                </button>
              </div>
            ) : (
              <Upload.Dragger
                showUploadList={false}
                beforeUpload={handleChooseFile}
                multiple={false}
                accept="video/*,audio/*,image/*"
                className="source-media-form-modal__dragger">
                <UploadCloud size={22} color="#9aa4bf" />
                <div className="source-media-form-modal__dragger-text">
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
            className="source-media-form-modal__sub-input"
            rules={[
              {
                required: true,
                whitespace: true,
                message: "Vui lòng nhập liên kết phát trực tiếp",
              },
            ]}>
            <Input
              placeholder="Nhập liên kết phát trực tiếp"
              suffix={
                <UploadIcon
                  size={16}
                  color="#FF7506"
                  style={{ cursor: "pointer" }}
                />
              }
            />
          </Form.Item>
        );

      case "url":
        return (
          <Form.Item
            name="contentValue"
            className="source-media-form-modal__sub-input"
            rules={[
              {
                required: true,
                whitespace: true,
                message: "Vui lòng nhập đường dẫn",
              },
            ]}>
            <Input
              placeholder="Nhập đường dẫn"
              suffix={
                <UploadIcon
                  size={16}
                  color="#FF7506"
                  style={{ cursor: "pointer" }}
                />
              }
            />
          </Form.Item>
        );

      case "frequency":
        return (
          <Form.Item
            name="contentValue"
            className="source-media-form-modal__sub-input"
            rules={[
              {
                required: true,
                whitespace: true,
                message: "Vui lòng nhập tần số Hz",
              },
            ]}>
            <Input placeholder="Nhập tần số Hz" />
          </Form.Item>
        );
    }
  };

  return (
    <AppModal
      open={open}
      onCancel={onCancel}
      title={isEdit ? "Cập nhật file media" : "Thêm file media"}
      width={440}
      footer={null}
      destroyOnHidden
      className={[
        "source-media-form-modal",
        isEdit ? "source-media-form-modal--edit" : "",
      ]
        .filter(Boolean)
        .join(" ")}>
      <Form
        form={form}
        layout="vertical"
        requiredMark
        onFinish={handleFinish}
        className="source-media-form-modal__form">
        <div className="source-media-form-modal__fields">
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
            <Input placeholder="Nhập tên file" maxLength={200} />
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
              options={categories.map((cat) => ({
                label: cat,
                value: cat,
              }))}
            />
          </Form.Item>

          {isEdit ? (
            <div className="source-media-form-modal__edit-media">
              <div className="source-media-form-modal__custom-label">
                File đính kèm hoặc link nội dung <span>*</span>
              </div>

              <div className="source-media-form-modal__player">
                <button
                  type="button"
                  className="source-media-form-modal__player-popout"
                  aria-label="Mở rộng"
                  onClick={() => setIsPlaying((prev) => !prev)}>
                  <MoveUpRight size={13} />
                </button>

                <div
                  className="source-media-form-modal__player-stage"
                  onClick={() => setIsPlaying((prev) => !prev)}>
                  <button
                    type="button"
                    className="source-media-form-modal__player-center"
                    aria-label={isPlaying ? "Tạm dừng" : "Phát"}>
                    {isPlaying ? (
                      <Pause size={16} fill="currentColor" />
                    ) : (
                      <Play size={16} fill="currentColor" />
                    )}
                  </button>
                </div>

                <div className="source-media-form-modal__player-bottom">
                  <div
                    className="source-media-form-modal__player-progress"
                    onClick={(event) => {
                      const rect = event.currentTarget.getBoundingClientRect();
                      const ratio = Math.min(
                        1,
                        Math.max(0, (event.clientX - rect.left) / rect.width),
                      );
                      setProgress(Math.round(ratio * 100));
                    }}>
                    <div
                      className="source-media-form-modal__player-progress-bar"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="source-media-form-modal__player-toolbar">
                    <div className="source-media-form-modal__player-left">
                      <button
                        type="button"
                        className="source-media-form-modal__player-btn"
                        onClick={() => setIsPlaying((prev) => !prev)}>
                        {isPlaying ? (
                          <Pause size={12} fill="currentColor" />
                        ) : (
                          <Play size={12} fill="currentColor" />
                        )}
                      </button>

                      <button
                        type="button"
                        className="source-media-form-modal__player-btn"
                        onClick={() => setIsMuted((prev) => !prev)}>
                        {isMuted ? (
                          <VolumeX size={12} />
                        ) : (
                          <Volume2 size={12} fill="currentColor" />
                        )}
                      </button>

                      <span className="source-media-form-modal__player-time">
                        00:56 / 04:12
                      </span>
                    </div>

                    <button
                      type="button"
                      className="source-media-form-modal__player-btn"
                      aria-label="Toàn màn hình">
                      <Maximize size={12} />
                    </button>
                  </div>
                </div>
              </div>

              {selectedFile && (
                <div className="source-media-form-modal__selected-hint">
                  Đã chọn tệp mới: <strong>{selectedFile.name}</strong> (
                  {formatFileSizeKb(selectedFile.size)})
                </div>
              )}

              <Upload
                showUploadList={false}
                beforeUpload={handleChooseFile}
                accept="video/*,audio/*,image/*">
                <button
                  type="button"
                  className="source-media-form-modal__replace-btn">
                  Chọn lại file
                </button>
              </Upload>
            </div>
          ) : (
            <>
              <Form.Item
                label="Nội dung"
                name="contentType"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn loại nội dung",
                  },
                ]}>
                <AppSelect
                  width="100%"
                  options={CONTENT_TYPE_OPTIONS}
                  onChange={(val) => {
                    setContentType(val as SourceMediaContentType);
                    setSelectedFile(null);
                    form.setFieldValue("contentValue", "");
                  }}
                />
              </Form.Item>

              {renderCreateContentField()}
            </>
          )}

          <div className="source-media-form-modal__required-note">
            <span>*</span> là những trường thông tin bắt buộc
          </div>
        </div>

        <div className="source-media-form-modal__actions">
          <AppButton
            variant="outline"
            width={116}
            height={40}
            onClick={onCancel}>
            Hủy
          </AppButton>

          <AppButton variant="primary" width={116} height={40} htmlType="submit">
            Lưu
          </AppButton>
        </div>
      </Form>
    </AppModal>
  );
}

export default SourceMediaFormModal;
