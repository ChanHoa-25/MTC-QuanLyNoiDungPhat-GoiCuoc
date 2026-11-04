import { useEffect, useRef, useState } from "react";
import { Slider } from "antd";
import { Volume2, VolumeX } from "lucide-react";

import AppModal from "../../../../components/common/AppModal";
import AppButton from "../../../../components/common/AppButton";

import "./DeviceVolumeModal.css";

interface DeviceVolumeModalProps {
  open: boolean;
  initialVolume?: number;
  onCancel: () => void;
  onConfirm: (volume: number) => void;
}

// Giới hạn âm lượng trong khoảng 0 - 100
function normalizeVolume(value: number): number {
  if (!Number.isFinite(value)) return 0;

  return Math.min(100, Math.max(0, Math.round(value)));
}

function DeviceVolumeModal({
  open,
  initialVolume = 0,
  onCancel,
  onConfirm,
}: DeviceVolumeModalProps) {
  const [volume, setVolume] = useState(() => normalizeVolume(initialVolume));

  // Lưu mức âm lượng trước khi tắt tiếng
  const previousVolume = useRef(normalizeVolume(initialVolume) || 50);

  // Đồng bộ âm lượng khi mở popup
  useEffect(() => {
    if (open) {
      const nextVolume = normalizeVolume(initialVolume);

      setVolume(nextVolume);

      previousVolume.current = nextVolume || 50;
    }
  }, [open, initialVolume]);

  // Bật hoặc tắt tiếng
  const handleToggleMute = () => {
    if (volume === 0) {
      setVolume(previousVolume.current);
    } else {
      previousVolume.current = volume;
      setVolume(0);
    }
  };

  // Thay đổi âm lượng bằng Slider
  const handleVolumeChange = (value: number) => {
    const nextVolume = normalizeVolume(value);

    setVolume(nextVolume);

    if (nextVolume > 0) {
      previousVolume.current = nextVolume;
    }
  };

  // Xác nhận âm lượng
  const handleConfirm = () => {
    onConfirm(volume);
  };

  return (
    <AppModal
      open={open}
      width={500}
      onCancel={onCancel}
      footer={null}
      closable={false}
      maskClosable={false}
      destroyOnHidden
      className="device-volume-modal">
      {/* Icon loa */}
      <div className="device-volume-modal__icon">
        <Volume2 size={40} strokeWidth={2} />
      </div>

      {/* Nội dung popup */}
      <div className="device-volume-modal__content">
        <h2 className="device-volume-modal__title">
          Điều chỉnh âm lượng của thiết bị được chọn
        </h2>

        {/* Thanh điều chỉnh âm lượng */}
        <div className="device-volume-modal__control">
          <button
            type="button"
            className="device-volume-modal__mute"
            onClick={handleToggleMute}
            aria-label={volume === 0 ? "Bật âm lượng" : "Tắt âm lượng"}
            aria-pressed={volume === 0}>
            {volume === 0 ? <VolumeX size={22} /> : <Volume2 size={22} />}
          </button>

          <Slider
            min={0}
            max={100}
            step={1}
            value={volume}
            onChange={handleVolumeChange}
            tooltip={{
              formatter: (value) => `${value ?? 0}%`,
            }}
            className="device-volume-modal__slider"
          />

          <span className="device-volume-modal__value">{volume}%</span>
        </div>

        {/* Nút thao tác */}
        <div className="device-volume-modal__actions">
          <AppButton variant="outline" width={120} onClick={onCancel}>
            Hủy
          </AppButton>

          <AppButton variant="primary" width={120} onClick={handleConfirm}>
            Xác nhận
          </AppButton>
        </div>
      </div>
    </AppModal>
  );
}

export default DeviceVolumeModal;
