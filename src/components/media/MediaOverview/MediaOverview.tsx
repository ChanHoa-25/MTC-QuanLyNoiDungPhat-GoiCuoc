import dayjs from "dayjs";
import { Play } from "lucide-react";

import type { MediaApiItem } from "../../../api/mediaApi";
import AppStatusTag from "../../common/AppStatusTag";
import type { AppStatusVariant } from "../../common/AppStatusTag";

import "./MediaOverview.css";

interface MediaOverviewProps {
  media: MediaApiItem;
}

function formatDuration(seconds: number | null) {
  if (seconds == null) return "-";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remaining = Math.floor(seconds % 60);

  return [hours, minutes, remaining]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

function formatSize(bytes: number) {
  if (!bytes || bytes <= 0) return "-";

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getApprovalVariant(status: string): AppStatusVariant {
  const normalized = status.toLowerCase();

  if (normalized.includes("reject") || normalized.includes("từ chối")) {
    return "red";
  }

  if (normalized.includes("approved") || normalized.includes("đã duyệt")) {
    return "green";
  }

  return "orange";
}

function MediaOverview({ media }: MediaOverviewProps) {
  const mediaUrl = media.url || media.sourceUrl || "";
  const fileType = media.fileType?.toLowerCase() || "";

  const isVideo =
    fileType.includes("video") || /\.(mp4|webm|ogg)(\?|$)/i.test(mediaUrl);

  const isImage =
    fileType.includes("image") ||
    /\.(png|jpe?g|gif|webp)(\?|$)/i.test(mediaUrl);

  const isAudio =
    fileType.includes("audio") || /\.(mp3|wav|m4a)(\?|$)/i.test(mediaUrl);

  const mediaType = isVideo
    ? "VIDEO"
    : isImage
      ? "IMAGE"
      : isAudio
        ? "AUDIO"
        : media.fileType || "MEDIA";

  return (
    <div className="media-overview">
      <div className="media-overview__main">
        <div className="media-overview__preview">
          {mediaUrl && isVideo ? (
            <video src={mediaUrl} controls preload="metadata" />
          ) : mediaUrl && isImage ? (
            <img src={mediaUrl} alt={media.mediaName} />
          ) : mediaUrl && isAudio ? (
            <audio src={mediaUrl} controls />
          ) : (
            <div className="media-overview__placeholder">
              <Play size={28} />
              <span>Chưa có bản xem trước</span>
            </div>
          )}
        </div>

        <div className="media-overview__summary">
          <div className="media-overview__chips">
            <span>{mediaType}</span>
            <span>{formatDuration(media.durationSeconds)}</span>
            <span>{formatSize(media.fileSize)}</span>
          </div>

          <h2 className="media-overview__name">{media.mediaName}</h2>

          <div className="media-overview__status-group">
            {/* Chưa hiển thị 4K, 2K, FHD, HD
                vì API hiện tại chưa cung cấp dữ liệu
                về các phiên bản chất lượng Media. */}

            <div className="media-overview__approval">
              <AppStatusTag
                type="status"
                variant={getApprovalVariant(media.approvalStatus || "")}
                label={media.approvalStatus || "Chưa xác định"}
              />
            </div>

            {media.rejectionReason && (
              <div className="media-overview__reason">
                Lý do từ chối: {media.rejectionReason}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="media-overview__information">
        <div className="media-overview__info-item">
          <strong>Lĩnh vực:</strong>
          <span>{media.categoryId || "Chưa có thông tin"}</span>
        </div>

        <div className="media-overview__info-item">
          <strong>File đính kèm hoặc link nội dung:</strong>
          <span className="media-overview__break">
            {media.fileName || mediaUrl || "Chưa có"}
          </span>
        </div>

        <div className="media-overview__info-item">
          <strong>Người tạo:</strong>
          <span>{media.createdBy || "Chưa có thông tin"}</span>
        </div>

        <div className="media-overview__info-item">
          <strong>Ngày tạo:</strong>
          <span>
            {media.createdAt
              ? dayjs(media.createdAt).format("DD/MM/YYYY HH:mm:ss")
              : "-"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default MediaOverview;
