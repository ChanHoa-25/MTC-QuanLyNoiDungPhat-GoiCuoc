import { useEffect, useState } from "react";
import { Maximize, Pause, Play, Volume2, VolumeX, X } from "lucide-react";

import AppModal from "../../../../../components/common/AppModal";
import type { SourceMediaItem } from "../../types/sourceMedia.types";

import "./SourceMediaPlayerModal.css";

interface SourceMediaPlayerModalProps {
  item: SourceMediaItem | null;
  onClose: () => void;
}

function SourceMediaPlayerModal({
  item,
  onClose,
}: SourceMediaPlayerModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(48);

  useEffect(() => {
    if (item) {
      setIsPlaying(false);
      setIsMuted(false);
      setProgress(48);
    }
  }, [item]);

  useEffect(() => {
    if (!item || !isPlaying) return;

    const timer = window.setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 1));
    }, 500);

    return () => window.clearInterval(timer);
  }, [item, isPlaying]);

  return (
    <AppModal
      open={Boolean(item)}
      onCancel={onClose}
      footer={null}
      closable={false}
      width={680}
      className="source-media-player-modal">
      {item && (
        <div className="source-media-player">
          <button
            type="button"
            className="source-media-player__close"
            aria-label="Đóng xem trước"
            onClick={onClose}>
            <X size={20} />
          </button>

          <div
            className="source-media-player__stage"
            onClick={() => setIsPlaying((prev) => !prev)}>
            <button
              type="button"
              className="source-media-player__center-btn"
              aria-label={isPlaying ? "Tạm dừng" : "Phát"}>
              {isPlaying ? (
                <Pause size={24} fill="currentColor" />
              ) : (
                <Play size={24} fill="currentColor" />
              )}
            </button>
          </div>

          <div className="source-media-player__controls-wrap">
            <div
              className="source-media-player__progress"
              role="slider"
              aria-label="Tiến trình phát"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
              onClick={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                const ratio = Math.min(
                  1,
                  Math.max(0, (event.clientX - rect.left) / rect.width),
                );
                setProgress(Math.round(ratio * 100));
              }}>
              <div
                className="source-media-player__progress-bar"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="source-media-player__toolbar">
              <div className="source-media-player__left-controls">
                <button
                  type="button"
                  className="source-media-player__ctrl-btn"
                  aria-label={isPlaying ? "Tạm dừng" : "Phát"}
                  onClick={() => setIsPlaying((prev) => !prev)}>
                  {isPlaying ? (
                    <Pause size={16} fill="currentColor" />
                  ) : (
                    <Play size={16} fill="currentColor" />
                  )}
                </button>

                <button
                  type="button"
                  className="source-media-player__ctrl-btn"
                  aria-label={isMuted ? "Bật tiếng" : "Tắt tiếng"}
                  onClick={() => setIsMuted((prev) => !prev)}>
                  {isMuted ? (
                    <VolumeX size={16} />
                  ) : (
                    <Volume2 size={16} fill="currentColor" />
                  )}
                </button>

                <span className="source-media-player__time">00:56 / 04:12</span>
              </div>

              <button
                type="button"
                className="source-media-player__ctrl-btn"
                aria-label="Toàn màn hình"
                onClick={(event) => {
                  const playerEl = event.currentTarget.closest(
                    ".source-media-player",
                  );
                  if (playerEl && document.fullscreenEnabled) {
                    if (!document.fullscreenElement) {
                      void playerEl.requestFullscreen().catch(() => undefined);
                    } else {
                      void document.exitFullscreen().catch(() => undefined);
                    }
                  }
                }}>
                <Maximize size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </AppModal>
  );
}

export default SourceMediaPlayerModal;
