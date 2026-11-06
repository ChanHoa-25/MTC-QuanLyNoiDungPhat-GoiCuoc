import { Checkbox, Dropdown } from "antd";
import type { MenuProps } from "antd";
import dayjs from "dayjs";
import {
  Download,
  Eye,
  Info,
  Loader2,
  MoreVertical,
  Play,
  Share2,
  SquarePen,
  Trash2,
} from "lucide-react";

import AppStatusTag from "../../../../../components/common/AppStatusTag";
import type { AppStatusVariant } from "../../../../../components/common/AppStatusTag";
import { DEFAULT_MEDIA_THUMBNAIL } from "../../data/sourceMedia.mock";
import type {
  SourceMediaApprovalStatus,
  SourceMediaItem,
} from "../../types/sourceMedia.types";

import "./SourceMediaCard.css";

interface SourceMediaCardProps {
  media: SourceMediaItem;
  selected: boolean;
  activePreview?: boolean;
  onSelect: (id: string, checked: boolean) => void;
  onPreview: (media: SourceMediaItem) => void;
  onOpenDetail: (media: SourceMediaItem) => void;
  onEdit?: (media: SourceMediaItem) => void;
  onShare?: (media: SourceMediaItem) => void;
  onDelete?: (media: SourceMediaItem) => void;
}

const APPROVAL_STATUS_MAP: Record<
  SourceMediaApprovalStatus,
  { label: string; variant: AppStatusVariant }
> = {
  approved: { label: "Đã duyệt", variant: "green" },
  pending: { label: "Chờ duyệt", variant: "yellow" },
  rejected: { label: "Từ chối duyệt", variant: "red" },
};

function SourceMediaCard({
  media,
  selected,
  activePreview = false,
  onSelect,
  onPreview,
  onOpenDetail,
  onEdit,
  onShare,
  onDelete,
}: SourceMediaCardProps) {
  const statusInfo = APPROVAL_STATUS_MAP[media.approvalStatus];
  const formattedCreatedAt = dayjs(media.createdAt).format("D/M/YYYY HH:mm");

  const menuItems: MenuProps["items"] = [
    {
      key: "detail",
      icon: <Info size={15} />,
      label: "Chi tiết file media",
    },
    {
      key: "preview",
      icon: <Eye size={15} />,
      label: "Xem nhanh thông tin",
    },
    {
      key: "edit",
      icon: <SquarePen size={15} />,
      label: "Cập nhật thông tin",
    },
    {
      key: "share",
      icon: <Share2 size={15} />,
      label: "Chia sẻ nguồn tin",
    },
    {
      key: "download",
      icon: <Download size={15} />,
      label: "Tải xuống",
    },
    {
      type: "divider",
    },
    {
      key: "delete",
      icon: <Trash2 size={15} />,
      label: "Xóa nguồn tin",
      danger: true,
    },
  ];

  const handleMenuClick: MenuProps["onClick"] = ({ key, domEvent }) => {
    domEvent.stopPropagation();

    switch (key) {
      case "detail":
        onOpenDetail(media);
        break;
      case "preview":
        onPreview(media);
        break;
      case "edit":
        onEdit?.(media);
        break;
      case "share":
        onShare?.(media);
        break;
      case "download":
        window.open(media.thumbnail, "_blank", "noopener,noreferrer");
        break;
      case "delete":
        onDelete?.(media);
        break;
      default:
        break;
    }
  };

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

        {media.isProcessing && (
          <span
            className="source-media-card__processing"
            title="Đang xử lý phiên bản">
            <Loader2 size={16} className="source-media-card__spinner" />
          </span>
        )}

        <button
          type="button"
          className="source-media-card__play"
          aria-label={`Phát thử ${media.title}`}
          onClick={(event) => {
            event.stopPropagation();
            onPreview(media);
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

      <div className="source-media-card__footer">
        <div className="source-media-card__info">
          <h3
            className="source-media-card__title"
            title={media.title}
            onClick={(event) => {
              event.stopPropagation();
              onOpenDetail(media);
            }}>
            {media.title}
          </h3>

          <p className="source-media-card__date">
            Ngày tạo: {formattedCreatedAt}
          </p>
        </div>

        <Dropdown
          menu={{ items: menuItems, onClick: handleMenuClick }}
          trigger={["click"]}
          placement="bottomRight">
          <button
            type="button"
            className="source-media-card__more"
            aria-label="Thao tác media"
            onClick={(event) => event.stopPropagation()}>
            <MoreVertical size={16} />
          </button>
        </Dropdown>
      </div>
    </article>
  );
}

export default SourceMediaCard;
