import { useEffect, useState } from "react";
import { Checkbox, Dropdown } from "antd";
import type { MenuProps } from "antd";

import {
  Ban,
  CheckCheck,
  Download,
  EllipsisVertical,
  Info,
  Play,
  RefreshCcw,
  Share2,
  SquarePen,
  Image as ImageIcon,
  Music2,
  Video,
} from "lucide-react";

import AppStatusTag from "../../common/AppStatusTag";
import type { MediaItem } from "../../../types/media.types";

import "./MediaCard.css";

export interface MediaCardProps<T extends MediaItem = MediaItem> {
  media: T;
  selected?: boolean;
  onSelect?: (id: string, checked: boolean) => void;
  onPreview?: (media: T) => void;
  onView?: (media: T) => void;
  onEdit?: (media: T) => void;
  onApprove?: (media: T) => void;
  onReject?: (media: T) => void;
  onShare?: (media: T) => void;
  onDownload?: (media: T) => void;
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
  onSelect,
  onPreview,
  onView,
  onEdit,
  onApprove,
  onReject,
  onShare,
  onDownload,
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

  const menuItems: MenuProps["items"] = [
    {
      key: "detail",
      label: "Xem chi tiết",
      icon: <Info size={18} />,
      disabled: !onView,
      onClick: () => onView?.(media),
    },
  ];

  if (media.status === "pending") {
    menuItems.push(
      {
        key: "approve",
        label: "Duyệt",
        icon: <CheckCheck size={18} />,
        disabled: !onApprove,
        onClick: () => onApprove?.(media),
      },
      {
        key: "reject",
        label: "Từ chối duyệt",
        icon: <Ban size={18} />,
        disabled: !onReject,
        onClick: () => onReject?.(media),
      },
      {
        key: "edit",
        label: "Chỉnh sửa",
        icon: <SquarePen size={18} />,
        disabled: !onEdit,
        onClick: () => onEdit?.(media),
      },
    );
  }

  if (media.status === "approved") {
    menuItems.push({
      key: "share",
      label: "Chia sẻ",
      icon: <Share2 size={18} />,
      disabled: !onShare,
      onClick: () => onShare?.(media),
    });
  }

  if (
    media.status === "approved" ||
    media.status === "pending" ||
    media.status === "rejected"
  ) {
    menuItems.push({
      key: "download",
      label: "Tải xuống",
      icon: <Download size={18} />,
      disabled: !onDownload,
      onClick: () => onDownload?.(media),
    });
  }

  if (media.status === "approved") {
    menuItems.push({
      key: "convert",
      label: "Chuyển đổi chất lượng",
      icon: <RefreshCcw size={18} />,
      disabled: true,
    });
  }

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

        <Dropdown
          menu={{ items: menuItems }}
          trigger={["click"]}
          placement="bottomRight"
          overlayClassName="media-card-dropdown">
          <button
            type="button"
            className="media-card__menu-trigger"
            aria-label={`Thao tác với ${media.title}`}>
            <EllipsisVertical size={18} />
          </button>
        </Dropdown>
      </div>
    </article>
  );
}

export default MediaCard;
