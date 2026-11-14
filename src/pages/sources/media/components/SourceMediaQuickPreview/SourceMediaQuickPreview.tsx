import dayjs from "dayjs";
import { Play, X } from "lucide-react";

import AppIconButton from "../../../../../components/common/AppIconButton";
import AppStatusTag from "../../../../../components/common/AppStatusTag";
import type { AppStatusVariant } from "../../../../../components/common/AppStatusTag";
import { DEFAULT_MEDIA_THUMBNAIL } from "../../data/sourceMedia.mock";
import MediaResolutionsTag from "../MediaResolutionsTag";
import type {
  SourceMediaApprovalStatus,
  SourceMediaItem,
  SourceMediaType,
} from "../../types/sourceMedia.types";

import "./SourceMediaQuickPreview.css";

interface SourceMediaQuickPreviewProps {
  media: SourceMediaItem;
  onClose: () => void;
  onOpenDetail: (media: SourceMediaItem) => void;
  onPlayModal?: (media: SourceMediaItem) => void;
}

const APPROVAL_MAP: Record<
  SourceMediaApprovalStatus,
  { label: string; variant: AppStatusVariant }
> = {
  approved: { label: "Đã duyệt", variant: "green" },
  pending: { label: "Chờ duyệt", variant: "yellow" },
  rejected: { label: "Từ chối duyệt", variant: "red" },
};

const TYPE_BADGE_MAP: Record<SourceMediaType, string> = {
  video: "VIDEO",
  audio: "AUDIO",
  image: "IMAGE",
};

function SourceMediaQuickPreview({
  media,
  onClose,
  onOpenDetail,
  onPlayModal,
}: SourceMediaQuickPreviewProps) {
  const statusInfo = media.isProcessing
    ? { label: "Đang xử lý", variant: "blue" as AppStatusVariant }
    : APPROVAL_MAP[media.approvalStatus];
  const formattedCreatedAt = dayjs(media.createdAt).format(
    "DD/MM/YYYY HH:mm:ss",
  );

  return (
    <aside className="source-media-preview" aria-label="Thông tin nhanh media">
      <div className="source-media-preview__top-bar">
        <AppIconButton
          icon={<X size={20} />}
          tooltip="Đóng xem nhanh"
          size={28}
          iconSize={20}
          className="source-media-preview__close"
          onClick={onClose}
        />
      </div>

      <div
        className="source-media-preview__player"
        onClick={() => onOpenDetail(media)}
        title="Nhấn để xem chi tiết file media">
        <img
          src={DEFAULT_MEDIA_THUMBNAIL}
          alt={media.fileName}
          className="source-media-preview__image"
        />

        <button
          type="button"
          className="source-media-preview__play"
          aria-label="Phát xem trước"
          onClick={(event) => {
            event.stopPropagation();
            if (onPlayModal) {
              onPlayModal(media);
            } else {
              onOpenDetail(media);
            }
          }}>
          <Play size={16} fill="currentColor" />
        </button>

        <div className="source-media-preview__overlay-tags">
          <span>{TYPE_BADGE_MAP[media.type]}</span>
          <span>{media.duration}</span>
          <span>{media.detailSizeLabel}</span>
        </div>
      </div>

      <h3
        className="source-media-preview__filename"
        onClick={() => onOpenDetail(media)}
        title="Mở trang Chi tiết file media">
        {media.fileName}
      </h3>

      <div className="source-media-preview__status-row">
        <MediaResolutionsTag
          resolutions={media.resolutions}
          processingNote={media.processingNote}
        />

        <div className="source-media-preview__approval">
          <AppStatusTag
            variant={statusInfo.variant}
            label={statusInfo.label}
          />
        </div>
      </div>

      <div className="source-media-preview__divider" />

      <dl className="source-media-preview__meta">
        <div className="source-media-preview__meta-item">
          <dt>Lĩnh vực:</dt>
          <dd>{media.category}</dd>
        </div>

        <div className="source-media-preview__meta-item">
          <dt>File đính kèm hoặc link nội dung:</dt>
          <dd>{media.attachmentOrLink}</dd>
        </div>

        <div className="source-media-preview__meta-item">
          <dt>Người phê duyệt:</dt>
          <dd>{media.approvedBy}</dd>
        </div>

        <div className="source-media-preview__meta-item">
          <dt>Người tạo:</dt>
          <dd>{media.createdBy}</dd>
        </div>

        <div className="source-media-preview__meta-item">
          <dt>Ngày tạo:</dt>
          <dd>{formattedCreatedAt}</dd>
        </div>

        <div className="source-media-preview__meta-item">
          <dt>Địa bàn chia sẻ:</dt>
          <dd>{media.sharedArea}</dd>
        </div>
      </dl>
    </aside>
  );
}

export default SourceMediaQuickPreview;
