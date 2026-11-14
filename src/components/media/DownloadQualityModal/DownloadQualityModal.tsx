import { useEffect, useState } from "react";
import { Modal, Radio } from "antd";
import type { RadioChangeEvent } from "antd";

import "./DownloadQualityModal.css";

export type DownloadQuality = "HD" | "FHD" | "QHD" | "UHD";

export interface DownloadQualityOption {
  value: DownloadQuality;
  resolution: string;
  size?: string;
}

interface DownloadQualityModalProps {
  open: boolean;
  onClose: () => void;
  onDownload: (quality: DownloadQuality) => void | Promise<void>;
  loading?: boolean;
  options?: DownloadQualityOption[];
  defaultQuality?: DownloadQuality;
}

const DEFAULT_QUALITY_OPTIONS: DownloadQualityOption[] = [
  {
    value: "HD",
    resolution: "1280 x 720",
  },
  {
    value: "FHD",
    resolution: "1920 x 1080",
  },
  {
    value: "QHD",
    resolution: "2560 x 1440",
  },
  {
    value: "UHD",
    resolution: "3840 x 2160",
  },
];

function DownloadQualityModal({
  open,
  onClose,
  onDownload,
  loading = false,
  options = DEFAULT_QUALITY_OPTIONS,
  defaultQuality = "UHD",
}: DownloadQualityModalProps) {
  const [quality, setQuality] = useState<DownloadQuality | null>(null);

  useEffect(() => {
    if (!open) return;

    const hasDefaultQuality = options.some(
      (option) => option.value === defaultQuality,
    );

    const initialQuality = hasDefaultQuality
      ? defaultQuality
      : (options[0]?.value ?? null);

    setQuality(initialQuality);
  }, [open, options, defaultQuality]);

  const handleChange = (event: RadioChangeEvent) => {
    setQuality(event.target.value as DownloadQuality);
  };

  const handleClose = () => {
    if (loading) return;

    onClose();
  };

  const handleDownload = () => {
    if (!quality || loading) return;

    const isAvailable = options.some((option) => option.value === quality);

    if (!isAvailable) return;

    void onDownload(quality);
  };

  const canDownload =
    !loading &&
    quality !== null &&
    options.some((option) => option.value === quality);

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      width={435}
      centered
      destroyOnHidden
      maskClosable={!loading}
      closable={!loading}
      className="download-quality-modal">
      <h2 className="download-quality-modal__title">Chất lượng tải xuống</h2>

      {options.length > 0 ? (
        <Radio.Group value={quality} onChange={handleChange} disabled={loading}>
          {options.map((option) => (
            <Radio key={option.value} value={option.value}>
              <span className="download-quality-modal__option">
                <span className="download-quality-modal__resolution">
                  <strong>{option.value}</strong> {option.resolution}
                </span>

                <span className="download-quality-modal__size">
                  {option.size ?? "—"}
                </span>
              </span>
            </Radio>
          ))}
        </Radio.Group>
      ) : (
        <p className="download-quality-modal__empty">
          Media này chưa có phiên bản chất lượng để tải xuống.
        </p>
      )}

      <div className="download-quality-modal__footer">
        <button
          type="button"
          className="download-quality-modal__cancel"
          onClick={handleClose}
          disabled={loading}>
          Hủy
        </button>

        <button
          type="button"
          className="download-quality-modal__download"
          onClick={handleDownload}
          disabled={!canDownload}>
          {loading ? "Đang tải..." : "Tải xuống"}
        </button>
      </div>
    </Modal>
  );
}

export default DownloadQualityModal;
