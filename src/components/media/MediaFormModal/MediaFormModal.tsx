import { useEffect, useState } from "react";
import { Form, Input, Upload, message } from "antd";
import type { UploadProps } from "antd";
import { Trash2, UploadCloud } from "lucide-react";

import AppModal from "../../common/AppModal";
import AppButton from "../../common/AppButton";
import AppSelect from "../../common/AppSelect";

import "./MediaFormModal.css";

export type MediaContentType = "file" | "url" | "live" | "frequency";

export type MediaFileType = "Image" | "Audio" | "Video";

export interface MediaFormInitialValues {
  title: string;
  category: string;
  contentType?: MediaContentType;
  contentValue?: string;
  fileType?: string;
  frequencyHz?: number | null;
  sourceUrl?: string | null;
  url?: string;
  thumbnail?: string;
  mimeType?: string;
  type?: "image" | "audio" | "video";
  fileName?: string;
  sizeMB?: number;
}

export interface MediaFormValues {
  title: string;
  category: string;
  contentType: MediaContentType;
  contentValue?: string;
  file?: File | null;
  fileType?: MediaFileType;
}

interface MediaFormModalProps {
  open: boolean;
  mode?: "create" | "edit";
  initialValues?: MediaFormInitialValues | null;
  categories: string[];
  loading?: boolean;
  onCancel: () => void;
  onSubmit: (values: MediaFormValues) => void | Promise<void>;
}

interface Fields {
  title: string;
  category: string;
  contentType: MediaContentType;
  contentValue?: string;
  fileType?: MediaFileType;
  description?: string;
}

const MAX_MB = 200;

const fileTypes = [
  { label: "Hình ảnh", value: "Image" },
  { label: "Âm thanh", value: "Audio" },
  { label: "Video", value: "Video" },
];

function MediaFormModal({
  open,
  mode = "create",
  initialValues,
  categories,
  loading = false,
  onCancel,
  onSubmit,
}: MediaFormModalProps) {
  const [form] = Form.useForm<Fields>();

  const isEdit = mode === "edit";

  const [contentType, setContentType] = useState<MediaContentType>("file");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [previewUrl, setPreviewUrl] = useState("");

  const [fileMode, setFileMode] = useState<"file" | "url">("file");

  useEffect(() => {
    if (!open) return;

    form.resetFields();
    setSelectedFile(null);

    const type = isEdit ? (initialValues?.contentType ?? "file") : "file";

    setContentType(type);
    setFileMode(type === "url" ? "url" : "file");

    const existingType = initialValues?.fileType;

    const fileType: MediaFileType | undefined =
      existingType === "Image" ||
      existingType === "Audio" ||
      existingType === "Video"
        ? existingType
        : undefined;

    form.setFieldsValue({
      title: isEdit ? (initialValues?.title ?? "") : "",
      category: isEdit ? (initialValues?.category ?? "") : "",
      contentType: type,
      fileType,
      contentValue: isEdit
        ? type === "frequency"
          ? String(
              initialValues?.frequencyHz ?? initialValues?.contentValue ?? "",
            )
          : type === "url"
            ? (initialValues?.sourceUrl ?? initialValues?.contentValue ?? "")
            : type === "live"
              ? (initialValues?.url ?? initialValues?.contentValue ?? "")
              : ""
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

  const beforeUpload: UploadProps["beforeUpload"] = (file) => {
    if (file.size > MAX_MB * 1024 * 1024) {
      message.error(`Dung lượng file không được vượt quá ${MAX_MB} MB`);
      return Upload.LIST_IGNORE;
    }

    setSelectedFile(file);
    return false;
  };

  const setMode = (type: MediaContentType) => {
    if (isEdit) return;

    setContentType(type);
    form.setFieldValue("contentType", type);
    form.setFieldValue("contentValue", "");
    form.setFieldValue("fileType", undefined);
    setSelectedFile(null);
  };

  const handleFinish = async (values: Fields) => {
    const type = isEdit ? (initialValues?.contentType ?? "file") : contentType;

    if (isEdit && type === "file") {
      message.warning("Chức năng cập nhật file đang chờ API upload.");
      return;
    }

    if (type === "file" && !selectedFile) {
      message.error("Vui lòng chọn file media");
      return;
    }

    const contentValue = values.contentValue?.trim() ?? "";

    if (type !== "file" && !contentValue) {
      message.error("Vui lòng nhập nội dung media");
      return;
    }

    if (
      (type === "live" || type === "url") &&
      !/^https?:\/\//i.test(contentValue)
    ) {
      message.error("Liên kết phải bắt đầu bằng http:// hoặc https://");
      return;
    }

    if (
      type === "url" &&
      !["Image", "Audio", "Video"].includes(values.fileType ?? "")
    ) {
      message.error("Vui lòng chọn loại media");
      return;
    }

    if (type === "frequency" && !(Number(contentValue) > 0)) {
      message.error("Tần số phải lớn hơn 0");
      return;
    }

    try {
      await onSubmit({
        title: values.title.trim(),
        category: values.category,
        contentType: type,
        contentValue: type === "file" ? undefined : contentValue,
        file: selectedFile,
        fileType: type === "url" ? values.fileType : undefined,
      });
    } catch (error) {
      console.error("Lỗi khi lưu Media:", error);
    }
  };

  const existingUrl =
    initialValues?.thumbnail ||
    initialValues?.sourceUrl ||
    initialValues?.url ||
    "";

  const mediaUrl = selectedFile ? previewUrl : isEdit ? existingUrl : "";

  const mime = selectedFile?.type || initialValues?.mimeType || "";

  const isImage =
    mime.startsWith("image/") ||
    (!selectedFile && initialValues?.type === "image");

  const isVideo =
    mime.startsWith("video/") ||
    (!selectedFile && initialValues?.type === "video");

  const isAudio =
    mime.startsWith("audio/") ||
    (!selectedFile && initialValues?.type === "audio");

  const showFile = contentType === "file";

  const showLink = contentType === "url" || contentType === "live";

  return (
    <AppModal
      open={open}
      title={isEdit ? "Cập nhật file media" : "Thêm file media"}
      width={917}
      className={`media-form-modal ${isEdit ? "media-form-modal--edit" : ""}`}
      onCancel={() => {
        if (!loading) onCancel();
      }}
      footer={null}>
      <Form
        form={form}
        layout="vertical"
        requiredMark
        onFinish={handleFinish}
        className="media-form-modal__form">
        <div className="media-form-modal__columns">
          <section className="media-form-modal__column">
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
                options={categories.map((category) => ({
                  label: category,
                  value: category,
                }))}
              />
            </Form.Item>

            <Form.Item label="Mô tả" name="description">
              <Input.TextArea rows={6} placeholder="Nhập mô tả" />
            </Form.Item>

            <p className="media-form-modal__required-note">
              <span>*</span> là những trường thông tin bắt buộc
            </p>
          </section>

          <section className="media-form-modal__column">
            <div className="media-form-modal__field-label">
              Nội dung <span>*</span>
            </div>

            {!isEdit ? (
              <div
                className="media-form-modal__content-tabs"
                role="group"
                aria-label="Loại nội dung">
                <button
                  type="button"
                  className={`media-form-modal__content-tab ${
                    contentType !== "live"
                      ? "media-form-modal__content-tab--active"
                      : ""
                  }`}
                  onClick={() => setMode(fileMode)}>
                  File/Link
                </button>

                <button
                  type="button"
                  className={`media-form-modal__content-tab ${
                    contentType === "live"
                      ? "media-form-modal__content-tab--active"
                      : ""
                  }`}
                  onClick={() => setMode("live")}>
                  Phát trực tiếp
                </button>
              </div>
            ) : (
              <p className="media-form-modal__content-kind">
                {showFile ? "Tệp tin" : showLink ? "Liên kết" : "Tần số"}
              </p>
            )}

            {!isEdit && contentType !== "live" && (
              <div className="media-form-modal__source-switch">
                <button
                  type="button"
                  className={fileMode === "file" ? "active" : ""}
                  onClick={() => {
                    setFileMode("file");
                    setMode("file");
                  }}>
                  Tải tệp
                </button>

                <button
                  type="button"
                  className={fileMode === "url" ? "active" : ""}
                  onClick={() => {
                    setFileMode("url");
                    setMode("url");
                  }}>
                  Dùng liên kết
                </button>
              </div>
            )}

            {showFile && (
              <div className="media-form-modal__upload-area">
                {mediaUrl ? (
                  <div className="media-form-modal__file-card">
                    <div className="media-form-modal__preview">
                      {isImage ? (
                        <img
                          src={mediaUrl}
                          alt="Xem trước media"
                          className="media-form-modal__preview-image"
                        />
                      ) : isVideo ? (
                        <video
                          src={mediaUrl}
                          controls
                          preload="metadata"
                          className="media-form-modal__video"
                        />
                      ) : isAudio ? (
                        <div className="media-form-modal__audio">
                          <audio src={mediaUrl} controls />
                        </div>
                      ) : (
                        <div className="media-form-modal__no-preview">
                          Chưa có bản xem trước
                        </div>
                      )}
                    </div>

                    <div className="media-form-modal__file-details">
                      <strong>Tên tệp</strong>

                      <div
                        className="media-form-modal__filename"
                        title={
                          selectedFile?.name ||
                          initialValues?.fileName ||
                          initialValues?.title
                        }>
                        {selectedFile?.name ||
                          initialValues?.fileName ||
                          initialValues?.title ||
                          "—"}
                      </div>

                      <div className="media-form-modal__file-meta">
                        <span>
                          Dung lượng
                          <br />
                          {selectedFile
                            ? `${(selectedFile.size / 1024 / 1024).toFixed(
                                2,
                              )} MB`
                            : `${initialValues?.sizeMB ?? 0} MB`}
                        </span>

                        {!isEdit && (
                          <button
                            type="button"
                            className="media-form-modal__delete-file"
                            onClick={() => setSelectedFile(null)}
                            aria-label="Xóa tệp">
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : isEdit ? (
                  <div className="media-form-modal__no-file">
                    Chưa có nội dung xem trước
                  </div>
                ) : (
                  <Upload.Dragger
                    showUploadList={false}
                    beforeUpload={beforeUpload}
                    multiple={false}
                    className="media-form-modal__dragger">
                    <UploadCloud size={26} color="var(--color-primary)" />

                    <div>
                      <span>Chọn tệp</span> hoặc kéo thả vào đây
                    </div>

                    <small>Tối đa {MAX_MB} MB</small>
                  </Upload.Dragger>
                )}

                {isEdit && (
                  <p className="media-form-modal__hint">
                    Thay tệp cần API upload từ Backend.
                  </p>
                )}
              </div>
            )}

            {showLink && (
              <div className="media-form-modal__link-fields">
                {contentType === "url" && (
                  <Form.Item
                    label="Loại media"
                    name="fileType"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn loại media",
                      },
                    ]}>
                    <AppSelect
                      width="100%"
                      placeholder="Chọn loại media"
                      options={fileTypes}
                    />
                  </Form.Item>
                )}

                <Form.Item
                  name="contentValue"
                  rules={[
                    {
                      required: true,
                      whitespace: true,
                      message: "Vui lòng nhập liên kết",
                    },
                    {
                      type: "url",
                      message: "Liên kết không hợp lệ",
                    },
                  ]}>
                  <Input placeholder="Nhập liên kết" />
                </Form.Item>
              </div>
            )}

            {contentType === "frequency" && (
              <Form.Item
                name="contentValue"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập tần số",
                  },
                ]}>
                <Input
                  type="number"
                  min={0}
                  step="any"
                  placeholder="Nhập tần số Hz"
                />
              </Form.Item>
            )}
          </section>
        </div>

        <div className="media-form-modal__actions">
          <AppButton
            variant="outline"
            width={120}
            height={44}
            disabled={loading}
            onClick={onCancel}>
            Hủy
          </AppButton>

          <AppButton
            width={120}
            height={44}
            htmlType="submit"
            loading={loading}
            disabled={isEdit && contentType === "file"}>
            {isEdit ? "Lưu" : "Tiếp tục"}
          </AppButton>
        </div>
      </Form>
    </AppModal>
  );
}

export default MediaFormModal;
