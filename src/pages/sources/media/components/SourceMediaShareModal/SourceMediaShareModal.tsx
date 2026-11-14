import { useEffect, useState } from "react";
import { Checkbox } from "antd";
import {
  ChevronDown,
  ChevronUp,
  Maximize,
  MoveUpRight,
  Pause,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";

import AppButton from "../../../../../components/common/AppButton";
import AppModal from "../../../../../components/common/AppModal";
import type { SourceMediaItem } from "../../types/sourceMedia.types";

import "./SourceMediaShareModal.css";

interface ShareFacilityOption {
  id: string;
  name: string;
}

interface SourceMediaShareModalProps {
  media: SourceMediaItem | null;
  onCancel: () => void;
  onShare: (media: SourceMediaItem, facilityIds: string[]) => void;
}

const SHARE_FACILITY_OPTIONS: ShareFacilityOption[] = [
  { id: "quan-1", name: "Quận 1" },
  { id: "quan-2", name: "Quận 2" },
  { id: "quan-3", name: "Quận 3" },
  { id: "quan-4", name: "Quận 4" },
  { id: "quan-5", name: "Quận 5" },
  { id: "quan-6", name: "Quận 6" },
  { id: "tan-binh", name: "Quận Tân Bình" },
  { id: "binh-thanh", name: "Quận Bình Thạnh" },
];

function getFormatLabel(media: SourceMediaItem): string {
  if (media.type === "audio") return "Audi - mp3";
  if (media.type === "image") return "Hình ảnh - png";
  return "Audi - mp3";
}

function SourceMediaShareModal({
  media,
  onCancel,
  onShare,
}: SourceMediaShareModalProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(["quan-5"]);
  const [expanded, setExpanded] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(55);

  useEffect(() => {
    if (media) {
      setSelectedIds(
        media.sharedFacilityIds && media.sharedFacilityIds.length > 0
          ? [...media.sharedFacilityIds]
          : ["quan-5"],
      );
      setExpanded(true);
      setIsPlaying(false);
      setIsMuted(false);
      setProgress(55);
    }
  }, [media]);

  const handleToggleFacility = (id: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...new Set([...prev, id])] : prev.filter((x) => x !== id),
    );
  };

  const handleConfirmShare = () => {
    if (!media || selectedIds.length === 0) return;
    onShare(media, selectedIds);
  };

  return (
    <AppModal
      open={Boolean(media)}
      onCancel={onCancel}
      title="Chia sẻ nguồn thông tin"
      width={780}
      footer={null}
      destroyOnHidden
      className="source-media-share-modal">
      {media && (
        <>
          <div className="source-media-share-modal__layout">
            <section className="source-media-share-modal__left">
              <h3 className="source-media-share-modal__section-title">
                Chọn cơ sở để chia sẻ
              </h3>

              <div className="source-media-share-modal__tree">
                <button
                  type="button"
                  className="source-media-share-modal__tree-header"
                  aria-expanded={expanded}
                  onClick={() => setExpanded((prev) => !prev)}>
                  <span className="source-media-share-modal__tree-root">
                    <span className="source-media-share-modal__root-badge">
                      {expanded ? "−" : "+"}
                    </span>
                    <span>Tp. Hồ Chí Minh</span>
                  </span>

                  {expanded ? (
                    <ChevronUp size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  )}
                </button>

                {expanded && (
                  <div className="source-media-share-modal__tree-list">
                    {SHARE_FACILITY_OPTIONS.map((facility) => {
                      const checked = selectedIds.includes(facility.id);
                      return (
                        <label
                          key={facility.id}
                          className={[
                            "source-media-share-modal__tree-item",
                            checked ? "is-selected" : "",
                          ]
                            .filter(Boolean)
                            .join(" ")}>
                          <Checkbox
                            checked={checked}
                            onChange={(event) =>
                              handleToggleFacility(
                                facility.id,
                                event.target.checked,
                              )
                            }
                          />
                          <span>{facility.name}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            <section className="source-media-share-modal__right">
              <h3 className="source-media-share-modal__section-title">
                Thông tin file media:
              </h3>

              <div className="source-media-share-modal__info-grid">
                <div className="source-media-share-modal__info-field">
                  <span className="source-media-share-modal__info-label">
                    Tên file media:
                  </span>
                  <span className="source-media-share-modal__info-value">
                    {media.title === "Thông tin buổi sáng"
                      ? "Tin tức buổi sáng"
                      : media.title}
                  </span>
                </div>

                <div className="source-media-share-modal__info-field">
                  <span className="source-media-share-modal__info-label">
                    Định dạng file - Loại file:
                  </span>
                  <span className="source-media-share-modal__info-value">
                    {getFormatLabel(media)}
                  </span>
                </div>

                <div className="source-media-share-modal__info-field">
                  <span className="source-media-share-modal__info-label">
                    Lĩnh vực:
                  </span>
                  <span className="source-media-share-modal__info-value">
                    {media.category}
                  </span>
                </div>

                <div className="source-media-share-modal__info-field">
                  <span className="source-media-share-modal__info-label">
                    Thời lượng phát:
                  </span>
                  <span className="source-media-share-modal__info-value">
                    {media.duration}
                  </span>
                </div>
              </div>

              <div className="source-media-share-modal__player">
                <button
                  type="button"
                  className="source-media-share-modal__player-popout"
                  aria-label="Mở rộng trình phát"
                  onClick={() => setIsPlaying((prev) => !prev)}>
                  <MoveUpRight size={13} />
                </button>

                <div
                  className="source-media-share-modal__player-stage"
                  onClick={() => setIsPlaying((prev) => !prev)}>
                  <button
                    type="button"
                    className="source-media-share-modal__player-center"
                    aria-label={isPlaying ? "Tạm dừng" : "Phát"}>
                    {isPlaying ? (
                      <Pause size={16} fill="currentColor" />
                    ) : (
                      <Play size={16} fill="currentColor" />
                    )}
                  </button>
                </div>

                <div className="source-media-share-modal__player-bottom">
                  <div
                    className="source-media-share-modal__player-progress"
                    onClick={(event) => {
                      const rect = event.currentTarget.getBoundingClientRect();
                      const ratio = Math.min(
                        1,
                        Math.max(0, (event.clientX - rect.left) / rect.width),
                      );
                      setProgress(Math.round(ratio * 100));
                    }}>
                    <div
                      className="source-media-share-modal__player-progress-bar"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="source-media-share-modal__player-toolbar">
                    <div className="source-media-share-modal__player-left">
                      <button
                        type="button"
                        className="source-media-share-modal__player-btn"
                        onClick={() => setIsPlaying((prev) => !prev)}>
                        {isPlaying ? (
                          <Pause size={12} fill="currentColor" />
                        ) : (
                          <Play size={12} fill="currentColor" />
                        )}
                      </button>

                      <button
                        type="button"
                        className="source-media-share-modal__player-btn"
                        onClick={() => setIsMuted((prev) => !prev)}>
                        {isMuted ? (
                          <VolumeX size={12} />
                        ) : (
                          <Volume2 size={12} fill="currentColor" />
                        )}
                      </button>

                      <span className="source-media-share-modal__player-time">
                        00:56 / 04:12
                      </span>
                    </div>

                    <button
                      type="button"
                      className="source-media-share-modal__player-btn"
                      aria-label="Toàn màn hình">
                      <Maximize size={12} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="source-media-share-modal__actions">
                <AppButton
                  variant="outline"
                  width={120}
                  height={40}
                  onClick={onCancel}>
                  Hủy
                </AppButton>

                <AppButton
                  variant="primary"
                  width={120}
                  height={40}
                  disabled={selectedIds.length === 0}
                  onClick={handleConfirmShare}>
                  Chia sẻ
                </AppButton>
              </div>
            </section>
          </div>
        </>
      )}
    </AppModal>
  );
}

export default SourceMediaShareModal;
