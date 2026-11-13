import { Checkbox } from "antd";
import dayjs from "dayjs";
import {
  Download,
  Info,
  Network,
  Play,
  Share2,
  SquarePen,
} from "lucide-react";

import AppIconButton from "../../../../../components/common/AppIconButton";
import AppStatusTag from "../../../../../components/common/AppStatusTag";
import type { AppStatusVariant } from "../../../../../components/common/AppStatusTag";
import { DEFAULT_MEDIA_THUMBNAIL } from "../../data/sourceMedia.mock";
import type {
  SourceMediaApprovalStatus,
  SourceMediaItem,
  SourceMediaType,
} from "../../types/sourceMedia.types";

import "./SourceMediaCard.css";

interface SourceMediaCardProps {
  media: SourceMediaItem;
  selected: boolean;
  activePreview?: boolean;
  onSelect: (id: string, checked: boolean) => void;
  onPreview: (media: SourceMediaItem) => void;
  onPlayModal: (media: SourceMediaItem) => void;
  onOpenDetail: (media: SourceMediaItem) => void;
  onEdit: (media: SourceMediaItem) => void;
  onShare: (media: SourceMediaItem) => void;
  onDownload: (media: SourceMediaItem) => void;
}

const APPROVAL_STATUS_MAP: Record<
  SourceMediaApprovalStatus,
  { label: string; variant: AppStatusVariant }
> = {
  approved: { label: "Đã duyệt", variant: "green" },
  pending: { label: "Chờ duyệt", variant: "yellow" },
  rejected: { label: "Từ chối duyệt", variant: "red" },
};

const MEDIA_TYPE_LABEL: Record<SourceMediaType, string> = {
  video: "Video",
  audio: "Âm thanh",
  image: "Hình ảnh",
};

function SourceMediaCard({
  media,
  selected,
  activePreview = false,
  onSelect,
  onPreview,
  onPlayModal,
  onOpenDetail,
  onEdit,
  onShare,
  onDownload,
}: SourceMediaCardProps) {
  const statusInfo = media.isProcessing
    ? { label: "Đang xử lý", variant: "blue" as AppStatusVariant }
    : APPROVAL_STATUS_MAP[media.approvalStatus];

  const formattedCreatedAt = dayjs(media.createdAt).format("D/M/YYYY");
  const isApproved = media.approvalStatus === "approved";

  return (
    <article
      className={[
        "source-media-card",
        selected ? "source-media-card--selected" : "",
        activePreview ? "source-media-card--active" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={() => onPreview(media)}
      onDoubleClick={() => onOpenDetail(media)}>
      <div className="source-media-card__thumb">
        <img
          src={media.thumbnail}
          alt={media.title}
          className="source-media-card__image"
          onError={(event) => {
            event.currentTarget.src = DEFAULT_MEDIA_THUMBNAIL;
          }}
        />

        <div
          className="source-media-card__checkbox"
          onClick={(event) => event.stopPropagation()}>
          <Checkbox
            checked={selected}
            onChange={(event) => onSelect(media.id, event.target.checked)}
          />
        </div>

        <span
          className="source-media-card__network-badge"
          title="Nguồn thông tin cơ sở">
          <Network size={14} />
        </span>

        <button
          type="button"
          className="source-media-card__play"
          aria-label={`Phát thử ${media.title}`}
          onClick={(event) => {
            event.stopPropagation();
            onPlayModal(media);
          }}>
          <Play size={14} fill="currentColor" />
        </button>

        <span className="source-media-card__size">{media.sizeMB} MB</span>

        <div className="source-media-card__status">
          <AppStatusTag
            variant={statusInfo.variant}
            label={statusInfo.label}
          />
        </div>
      </div>

      <div className="source-media-card__content">
        <h3
          className="source-media-card__title"
          title={media.title}
          onClick={(event) => {
            event.stopPropagation();
            onOpenDetail(media);
          }}>
          {media.title}
        </h3>

        <div className="source-media-card__body">
          <div className="source-media-card__details">
            <div className="source-media-card__detail-row">
              <span className="source-media-card__detail-label">
                Người tạo:
              </span>
              <span className="source-media-card__detail-value">
                {media.createdBy}
              </span>
            </div>

            <div className="source-media-card__detail-row">
              <span className="source-media-card__detail-label">Ngày tạo:</span>
              <span className="source-media-card__detail-value">
                {formattedCreatedAt}
              </span>
            </div>

            <div className="source-media-card__detail-row">
              <span className="source-media-card__detail-label">
                Loại media:
              </span>
              <span className="source-media-card__detail-value">
                {MEDIA_TYPE_LABEL[media.type]}
              </span>
            </div>
          </div>

          <div
            className="source-media-card__actions"
            onClick={(event) => event.stopPropagation()}>
            {!media.isProcessing && (
              <>
                <AppIconButton
                  icon={<Download size={16} />}
                  tooltip="Tải xuống"
                  size={24}
                  iconSize={16}
                  onClick={() => onDownload(media)}
                />

                <AppIconButton
                  icon={
                    isApproved ? (
                      <Share2 size={16} />
                    ) : (
                      <SquarePen size={16} />
                    )
                  }
                  tooltip={
                    isApproved ? "Chia sẻ nguồn thông tin" : "Cập nhật file media"
                  }
                  size={24}
                  iconSize={16}
                  onClick={() => (isApproved ? onShare(media) : onEdit(media))}
                />
              </>
            )}

            <AppIconButton
              icon={<Info size={16} />}
              tooltip="Chi tiết file media"
              size={24}
              iconSize={16}
              onClick={() => onOpenDetail(media)}
            />
          </div>
        </div>
      </div>
    </article>
  );
}

export default SourceMediaCard;
