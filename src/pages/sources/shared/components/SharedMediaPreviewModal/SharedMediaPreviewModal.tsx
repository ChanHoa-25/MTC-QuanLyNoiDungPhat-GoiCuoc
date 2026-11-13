import { useEffect, useRef, useState } from "react";
import { Maximize, Pause, Play, Volume2, VolumeX, X } from "lucide-react";

import AppModal from "../../../../../components/common/AppModal";
import type { SharedMediaItem } from "../../types/sourceShared.types";
import "./SharedMediaPreviewModal.css";

interface SharedMediaPreviewModalProps {
  item: SharedMediaItem | null;
  onClose: () => void;
}

const TOTAL_SECONDS = 252; // 04:12
const INITIAL_SECONDS = 56; // 00:56 (khớp đúng ảnh Figma 00:56 / 04:12)

function formatSeconds(sec: number) {
  const clamped = Math.max(0, Math.min(TOTAL_SECONDS, Math.floor(sec)));
  const minutes = String(Math.floor(clamped / 60)).padStart(2, "0");
  const seconds = String(clamped % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function SharedMediaPreviewModal({
  item,
  onClose,
}: SharedMediaPreviewModalProps) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentSec, setCurrentSec] = useState(INITIAL_SECONDS);

  useEffect(() => {
    if (!item) {
      setIsPlaying(false);
      setCurrentSec(INITIAL_SECONDS);
    }
  }, [item]);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = window.setInterval(() => {
      setCurrentSec((prev) => {
        if (prev >= TOTAL_SECONDS) {
          setIsPlaying(false);
          return 0;
        }
        return prev + 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [isPlaying]);

  const progressPercent = (currentSec / TOTAL_SECONDS) * 100;

  const handleSeek = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width <= 0) return;
    const ratio = Math.max(
      0,
      Math.min(1, (event.clientX - rect.left) / rect.width),
    );
    setCurrentSec(Math.round(ratio * TOTAL_SECONDS));
  };

  const handleToggleFullscreen = () => {
    const el = stageRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else if (el.requestFullscreen) {
      void el.requestFullscreen();
    }
  };

  return (
    <AppModal
      open={Boolean(item)}
      title={null}
      width={720}
      footer={null}
      closable={false}
      onCancel={onClose}
      className="shared-media-preview-modal">
      <div ref={stageRef} className="shared-media-preview__stage">
        <button
          type="button"
          className="shared-media-preview__close"
          aria-label="Đóng trình phát"
          onClick={onClose}>
          <X size={20} />
        </button>

        <button
          type="button"
          className="shared-media-preview__center-play"
          aria-label={isPlaying ? "Tạm dừng" : "Phát"}
          onClick={() => setIsPlaying((prev) => !prev)}>
          {isPlaying ? (
            <Pause size={26} fill="currentColor" />
          ) : (
            <Play size={26} fill="currentColor" />
          )}
        </button>

        <div className="shared-media-preview__controls-wrap">
          <div
            className="shared-media-preview__progress"
            role="slider"
            tabIndex={0}
            aria-valuemin={0}
            aria-valuemax={TOTAL_SECONDS}
            aria-valuenow={currentSec}
            onClick={handleSeek}>
            <div
              className="shared-media-preview__progress-bar"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="shared-media-preview__controls">
            <div className="shared-media-preview__controls-left">
              <button
                type="button"
                className="shared-media-preview__ctrl-btn"
                aria-label={isPlaying ? "Tạm dừng" : "Phát"}
                onClick={() => setIsPlaying((prev) => !prev)}>
                {isPlaying ? (
                  <Pause size={15} fill="currentColor" />
                ) : (
                  <Play size={15} fill="currentColor" />
                )}
              </button>

              <button
                type="button"
                className="shared-media-preview__ctrl-btn"
                aria-label={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
                onClick={() => setIsMuted((prev) => !prev)}>
                {isMuted ? (
                  <VolumeX size={16} />
                ) : (
                  <Volume2 size={16} fill="currentColor" />
                )}
              </button>

              <span className="shared-media-preview__time">
                {formatSeconds(currentSec)} / {formatSeconds(TOTAL_SECONDS)}
              </span>
            </div>

            <button
              type="button"
              className="shared-media-preview__ctrl-btn"
              aria-label="Toàn màn hình"
              onClick={handleToggleFullscreen}>
              <Maximize size={15} />
            </button>
          </div>
        </div>
      </div>
    </AppModal>
  );
}

export default SharedMediaPreviewModal;
