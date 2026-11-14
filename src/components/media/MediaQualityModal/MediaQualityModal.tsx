import { useEffect, useState } from "react";
import { Checkbox, Modal, Spin } from "antd";

import "./MediaQualityModal.css";

export type MediaQuality = "2K" | "HD" | "FHD";

export interface MediaQualityItem {
  title: string;
  category?: string | null;
  type?: string | null;
  thumbnail?: string | null;
  sourceUrl?: string | null;
  url?: string | null;
  fileName?: string | null;
  sizeMB?: number | null;
  originalResolution?: string | null;
}

interface QualityOption {
  value: MediaQuality;
  label: string;
  description: string;
}

const QUALITY_OPTIONS: QualityOption[] = [
  {
    value: "2K",
    label: "2K",
    description: "1440p",
  },
  {
    value: "HD",
    label: "HD",
    description: "720p (Tương thích với nhiều thiết bị)",
  },
  {
    value: "FHD",
    label: "FHD",
    description: "1080p (Tiêu chuẩn phổ biến)",
  },
];

const EMPTY_QUALITIES: MediaQuality[] = [];

interface MediaQualityModalProps {
  open: boolean;
  media: MediaQualityItem | null;
  processing?: boolean;
  saving?: boolean;
  availableQualities?: MediaQuality[];
  initialQualities?: MediaQuality[];
  onSave: (qualities: MediaQuality[]) => void | Promise<void>;
  onSkip: () => void;
  onBackToList: () => void;
  onCancel: () => void;
}

function MediaQualityModal({
  open,
  media,
  processing = false,
  saving = false,
  availableQualities = EMPTY_QUALITIES,
  initialQualities = EMPTY_QUALITIES,
  onSave,
  onSkip,
  onBackToList,
  onCancel,
}: MediaQualityModalProps) {
  const [selected, setSelected] = useState<MediaQuality[]>([]);

  useEffect(() => {
    if (open) {
      setSelected(initialQualities);
    }
  }, [open, initialQualities]);

  const toggleQuality = (value: MediaQuality, checked: boolean) => {
    setSelected((previous) =>
      checked
        ? [...previous.filter((item) => item !== value), value]
        : previous.filter((item) => item !== value),
    );
  };

  const previewUrl =
    media?.thumbnail ||
    (media?.type === "image" ? media.sourceUrl || media.url : undefined);

  const isVideo = media?.type === "video";
  const fileName = media?.fileName || media?.title || "—";

  const validSelected = selected.filter((quality) =>
    availableQualities.includes(quality),
  );

  const canSave =
    Boolean(media) && isVideo && !saving && validSelected.length > 0;

  return (
    <Modal
      open={open}
      width={917}
      centered
      title="Tùy chọn chuyển đổi chất lượng"
      footer={null}
      onCancel={onCancel}
      closable={!saving}
      maskClosable={false}
      className="media-quality-modal"
      destroyOnHidden>
      {processing ? (
        <div
          className="media-quality-modal__processing"
          role="status"
          aria-live="polite">
          <Spin size="large" />

          <h3>Media của bạn đang được xử lý</h3>

          <p>
            Bạn có thể chờ để tiếp tục chuyển đổi thêm chất lượng, hoặc quay lại
            danh sách để thực hiện sau và thực hiện các thao tác khác.
          </p>

          <button
            type="button"
            className="media-quality-modal__outline"
            onClick={onBackToList}
            disabled={saving}>
            Quay lại danh sách
          </button>
        </div>
      ) : (
        <>
          <div className="media-quality-modal__columns">
            <section className="media-quality-modal__media">
              <div className="media-quality-modal__image">
                {previewUrl ? (
                  <img src={previewUrl} alt={media?.title || "Media"} />
                ) : (
                  <span>Chưa có ảnh xem trước</span>
                )}
              </div>

              <div className="media-quality-modal__info">
                <div className="media-quality-modal__field">
                  <strong>Tên tệp</strong>
                  <span title={fileName}>{fileName}</span>
                </div>

                <div className="media-quality-modal__details">
                  <div className="media-quality-modal__field">
                    <strong>Tên media file</strong>
                    <span title={media?.title}>{media?.title || "—"}</span>
                  </div>

                  <div className="media-quality-modal__field">
                    <strong>Lĩnh vực</strong>
                    <span>{media?.category || "—"}</span>
                  </div>

                  <div className="media-quality-modal__field">
                    <strong>Độ phân giải gốc</strong>
                    <span>
                      {media?.originalResolution || "Chưa có dữ liệu"}
                    </span>
                  </div>

                  <div className="media-quality-modal__field">
                    <strong>Dung lượng</strong>
                    <span>
                      {media?.sizeMB != null ? `${media.sizeMB} MB` : "—"}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <section className="media-quality-modal__options">
              <h3>Tùy chọn chuyển đổi chất lượng hiển thị</h3>

              {QUALITY_OPTIONS.map((option) => {
                const enabled =
                  isVideo && availableQualities.includes(option.value);

                const checked = enabled && selected.includes(option.value);

                return (
                  <label
                    key={option.value}
                    className={`media-quality-modal__option ${
                      checked ? "media-quality-modal__option--checked" : ""
                    }`}>
                    <Checkbox
                      checked={checked}
                      disabled={!enabled || saving}
                      onChange={(event) =>
                        toggleQuality(option.value, event.target.checked)
                      }
                    />

                    <strong>{option.label}</strong>
                    <span>{option.description}</span>
                  </label>
                );
              })}

              {!isVideo && (
                <p className="media-quality-modal__hint">
                  Chuyển đổi độ phân giải chỉ áp dụng cho video.
                </p>
              )}

              {isVideo && availableQualities.length === 0 && (
                <p className="media-quality-modal__hint">
                  Chưa có thông tin về các chất lượng Backend hỗ trợ.
                </p>
              )}
            </section>
          </div>

          <div className="media-quality-modal__actions">
            <button
              type="button"
              className="media-quality-modal__outline"
              onClick={onSkip}
              disabled={saving}>
              Bỏ qua
            </button>

            <button
              type="button"
              className="media-quality-modal__primary"
              disabled={!canSave}
              onClick={() => {
                if (canSave) {
                  void onSave(validSelected);
                }
              }}>
              {saving ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}

export default MediaQualityModal;
