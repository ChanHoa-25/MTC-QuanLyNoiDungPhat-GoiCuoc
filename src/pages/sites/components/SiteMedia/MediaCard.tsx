import { Checkbox } from "antd";
import {
  Download,
  FilePenLine,
  Info,
  Play,
  Share2,
  Network,
} from "lucide-react";

import AppIconButton from "../../../../components/common/AppIconButton";
import AppStatusTag from "../../../../components/common/AppStatusTag";

import type { SiteMediaItem } from "../../types/siteMedia.types";

import "./MediaCard.css";

interface MediaCardProps {
  media: SiteMediaItem;
  selected?: boolean;
  onSelect?: (id: string, checked: boolean) => void;
  onView?: (media: SiteMediaItem) => void;
  onEdit?: (media: SiteMediaItem) => void;
  onShare?: (media: SiteMediaItem) => void;
  onDownload?: (media: SiteMediaItem) => void;
}

const mediaTypeLabels = {
  video: "Video",
  image: "Hình ảnh",
  audio: "Âm thanh",
};

function MediaCard({
  media,
  selected = false,
  onSelect,
  onView,
  onEdit,
  onShare,
  onDownload,
}: MediaCardProps) {
  const isApproved = media.status === "approved";

  const formattedDate = new Date(media.createdAt).toLocaleDateString("vi-VN");

  return (
    <div className="media-card">
      <div className="media-card__thumbnail">
        <img
          src={media.thumbnail}
          alt={media.title}
          className="media-card__image"
        />

        <Checkbox
          className="media-card__checkbox"
          checked={selected}
          onChange={(event) => onSelect?.(media.id, event.target.checked)}
        />

        <span className="media-card__share-indicator">
          <Network size={16} />
        </span>

        {media.type === "video" && (
          <button
            type="button"
            className="media-card__preview"
            onClick={() => onView?.(media)}
            aria-label={`Xem trước ${media.title}`}>
            <Play size={18} fill="currentColor" />
          </button>
        )}

        <span className="media-card__size">{media.sizeMB} MB</span>

        <div className="media-card__status">
          <AppStatusTag
            variant={isApproved ? "green" : "yellow"}
            label={isApproved ? "Đã duyệt" : "Chờ duyệt"}
          />
        </div>
      </div>

      <div className="media-card__content">
        <h3 className="media-card__title" title={media.title}>
          {media.title}
        </h3>

        <div className="media-card__body">
          <div className="media-card__details">
            <div className="media-card__detail">
              <span>Người tạo:</span>
              <span>{media.createdBy}</span>
            </div>

            <div className="media-card__detail">
              <span>Ngày tạo:</span>
              <span>{formattedDate}</span>
            </div>

            <div className="media-card__detail">
              <span>Loại media:</span>
              <span>{mediaTypeLabels[media.type]}</span>
            </div>
          </div>

          <div className="media-card__actions">
            <AppIconButton
              icon={<Download size={18} />}
              tooltip="Tải xuống"
              size={24}
              iconSize={18}
              onClick={() => onDownload?.(media)}
            />

            <AppIconButton
              icon={
                isApproved ? <Share2 size={18} /> : <FilePenLine size={18} />
              }
              tooltip={isApproved ? "Chia sẻ" : "Chỉnh sửa"}
              size={24}
              iconSize={18}
              onClick={() => (isApproved ? onShare?.(media) : onEdit?.(media))}
            />

            <AppIconButton
              icon={<Info size={18} />}
              tooltip="Thông tin chi tiết"
              size={24}
              iconSize={18}
              onClick={() => onView?.(media)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default MediaCard;
