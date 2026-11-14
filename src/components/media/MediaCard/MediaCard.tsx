import { useEffect, useState } from "react";
import { Checkbox } from "antd";

import {
  EllipsisVertical,
  Play,
  Image as ImageIcon,
  Music2,
  Video,
} from "lucide-react";

import AppStatusTag from "../../common/AppStatusTag";
import MediaActionMenu from "../MediaActionMenu/MediaActionMenu";

import type {
  MediaAction,
  MediaMenuVariant,
} from "../MediaActionMenu/MediaActionMenu";

import type { MediaItem } from "../../../types/media.types";

import "./MediaCard.css";

export interface MediaCardProps<T extends MediaItem = MediaItem> {
  media: T;
  selected?: boolean;
  menuVariant?: MediaMenuVariant;
  onSelect?: (id: string, checked: boolean) => void;
  onPreview?: (media: T) => void;
  onView?: (media: T) => void;
  onEdit?: (media: T) => void;
  onApprove?: (media: T) => void;
  onReject?: (media: T) => void;
  onShare?: (media: T) => void;
  onDownload?: (media: T) => void;
  onConvert?: (media: T) => void;
  onDelete?: (media: T) => void;
  onCreateNews?: (media: T) => void;
  onCreatePlaylist?: (media: T) => void;
  onCreateTemplate?: (media: T) => void;
}

const mediaStatusConfig = {
  approved: {
    variant: "green",
    label: "Đã duyệt",
  },
  pending: {
    variant: "yellow",
    label: "Chờ duyệt",
  },
  rejected: {
    variant: "red",
    label: "Từ chối duyệt",
  },
  processing: {
    variant: "blue",
    label: "Đang xử lý",
  },
} as const;

function MediaCard<T extends MediaItem>({
  media,
  selected = false,
  menuVariant = "detail",
  onSelect,
  onPreview,
  onView,
  onEdit,
  onApprove,
  onReject,
  onShare,
  onDownload,
  onConvert,
  onDelete,
  onCreateNews,
  onCreatePlaylist,
  onCreateTemplate,
}: MediaCardProps<T>) {
  const [imageError, setImageError] = useState(false);

  const isImage = media.type === "image";
  const isVideo = media.type === "video";
  const isAudio = media.type === "audio";

  const imageUrl =
    media.thumbnail || (isImage ? media.sourceUrl || media.url : undefined);

  useEffect(() => {
    setImageError(false);
  }, [imageUrl]);

  const showImage = Boolean(imageUrl) && !imageError;

  const status = mediaStatusConfig[media.status];

  const createdDate = new Date(media.createdAt);

  const formattedDate = Number.isNaN(createdDate.getTime())
    ? "—"
    : createdDate.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

  const visibleActions: MediaAction[] = [];

  if (onView) {
    visibleActions.push("view");
  }

  if (media.status === "pending") {
    if (onApprove) visibleActions.push("approve");
    if (onReject) visibleActions.push("reject");
    if (onEdit) visibleActions.push("edit");
  }

  if (media.status === "approved") {
    if (onShare) visibleActions.push("share");
    if (onConvert) visibleActions.push("convert");

    if (menuVariant === "create") {
      if (onCreateNews) visibleActions.push("createNews");
      if (onCreatePlaylist) visibleActions.push("createPlaylist");
      if (onCreateTemplate) visibleActions.push("createTemplate");
    }
  }

  if (
    media.status === "approved" ||
    media.status === "pending" ||
    media.status === "rejected"
  ) {
    if (onDownload) visibleActions.push("download");
  }

  if (onDelete) {
    visibleActions.push("delete");
  }

  const handleMenuAction = (action: MediaAction) => {
    switch (action) {
      case "view":
        onView?.(media);
        break;

      case "edit":
        onEdit?.(media);
        break;

      case "approve":
        onApprove?.(media);
        break;

      case "reject":
        onReject?.(media);
        break;

      case "share":
        onShare?.(media);
        break;

      case "download":
        onDownload?.(media);
        break;

      case "convert":
        onConvert?.(media);
        break;

      case "delete":
        onDelete?.(media);
        break;

      case "createNews":
        onCreateNews?.(media);
        break;

      case "createPlaylist":
        onCreatePlaylist?.(media);
        break;

      case "createTemplate":
        onCreateTemplate?.(media);
        break;

      default:
        break;
    }
  };

  return (
    <article
      className={["media-card", selected ? "media-card--selected" : ""]
        .filter(Boolean)
        .join(" ")}>
      <div className="media-card__thumbnail">
        {showImage ? (
          <img
            src={imageUrl}
            alt={media.title}
            className="media-card__image"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="media-card__placeholder">
            {isVideo ? (
              <Video size={40} strokeWidth={1.5} />
            ) : isAudio ? (
              <Music2 size={40} strokeWidth={1.5} />
            ) : (
              <ImageIcon size={40} strokeWidth={1.5} />
            )}
          </div>
        )}

        <Checkbox
          className="media-card__checkbox"
          checked={selected}
          disabled={!onSelect}
          onChange={(event) => onSelect?.(media.id, event.target.checked)}
          aria-label={`Chọn ${media.title}`}
        />

        {isVideo && (
          <button
            type="button"
            className="media-card__preview"
            onClick={() => onPreview?.(media)}
            disabled={!onPreview}
            aria-label={`Xem trước ${media.title}`}>
            <Play size={18} fill="currentColor" />
          </button>
        )}

        <span className="media-card__size">{media.sizeMB} MB</span>

        <div className="media-card__status">
          <AppStatusTag variant={status.variant} label={status.label} />
        </div>
      </div>

      <div className="media-card__content">
        <div className="media-card__information">
          <h3 className="media-card__title" title={media.title}>
            <button
              type="button"
              className="media-card__title-button"
              onClick={() => onPreview?.(media)}
              disabled={!onPreview}>
              {media.title}
            </button>
          </h3>

          <p className="media-card__date">
            <span className="media-card__date-label">Ngày tạo:</span>{" "}
            <span>{formattedDate}</span>
          </p>
        </div>

        {visibleActions.length > 0 && (
          <MediaActionMenu
            variant={menuVariant}
            visibleActions={visibleActions}
            onAction={handleMenuAction}>
            <button
              type="button"
              className="media-card__menu-trigger"
              aria-label={`Thao tác với ${media.title}`}>
              <EllipsisVertical size={18} />
            </button>
          </MediaActionMenu>
        )}
      </div>
    </article>
  );
}

export default MediaCard;
