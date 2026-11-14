import dayjs from "dayjs";
import { Play } from "lucide-react";

import type { MediaApiItem } from "../../../api/mediaApi";
import AppStatusTag from "../../common/AppStatusTag";
import type { AppStatusVariant } from "../../common/AppStatusTag";

import "./MediaOverview.css";

/**
 * Dữ liệu hiển thị đã chuẩn hóa cho Source Media.
 * Trang Source chuyển dữ liệu từ store sang kiểu này trước khi truyền vào.
 */
export interface MediaOverviewDisplay {
  name: string;
  url?: string | null;
  fileType?: string | null;
  durationLabel?: string | null;
  sizeLabel?: string | null;
  approvalStatus?: string | null;
  rejectionReason?: string | null;
  resolutions?: string[];
  category?: string | null;
  attachmentOrLink?: string | null;
  createdBy?: string | null;
  createdAt?: string | null;
  approvedBy?: string | null;
  sharedArea?: string | null;
}

interface MediaOverviewProps {
  media: MediaApiItem | MediaOverviewDisplay;
}

function formatDuration(seconds: number | null | undefined): string {
  if (seconds == null || !Number.isFinite(seconds)) return "-";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remaining = Math.floor(seconds % 60);
  return [hours, minutes, remaining]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

function formatSize(bytes: number | null | undefined): string {
  if (bytes == null || !Number.isFinite(bytes) || bytes <= 0) return "-";
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getApprovalVariant(status: string): AppStatusVariant {
  const normalized = status.toLowerCase();
  if (normalized.includes("reject") || normalized.includes("từ chối"))
    return "red";
  if (normalized.includes("approved") || normalized.includes("đã duyệt"))
    return "green";
  return "orange";
}

function isApiMedia(
  media: MediaApiItem | MediaOverviewDisplay,
): media is MediaApiItem {
  return "mediaName" in media;
}

function normalizeMedia(
  media: MediaApiItem | MediaOverviewDisplay,
): MediaOverviewDisplay {
  if (!isApiMedia(media)) return media;

  return {
    name: media.mediaName,
    url: media.url || media.sourceUrl || "",
    fileType: media.fileType,
    durationLabel: formatDuration(media.durationSeconds),
    sizeLabel: formatSize(media.fileSize),
    approvalStatus: media.approvalStatus,
    rejectionReason: media.rejectionReason,
    category: media.categoryId || "Chưa có thông tin",
    attachmentOrLink:
      media.fileName || media.url || media.sourceUrl || "Chưa có",
    createdBy: media.createdBy,
    createdAt: media.createdAt,
  };
}

function MediaOverview({ media }: MediaOverviewProps) {
  const info = normalizeMedia(media);
  const mediaUrl = info.url || "";
  const fileType = (info.fileType || "").toLowerCase();

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
        : info.fileType || "MEDIA";

  return (
    <div className="media-overview">
      <div className="media-overview__main">
        <div className="media-overview__preview">
          {mediaUrl && isVideo ? (
            <video src={mediaUrl} controls preload="metadata" />
          ) : mediaUrl && isImage ? (
            <img src={mediaUrl} alt={info.name} />
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
            <span>{info.durationLabel || "-"}</span>
            <span>{info.sizeLabel || "-"}</span>
          </div>

          <h2 className="media-overview__name">{info.name}</h2>

          <div className="media-overview__status-group">
            {Boolean(info.resolutions?.length) && (
              <div className="media-overview__chips">
                {info.resolutions?.map((resolution) => (
                  <span key={resolution}>{resolution}</span>
                ))}
              </div>
            )}
            <div className="media-overview__approval">
              <AppStatusTag
                type="status"
                variant={getApprovalVariant(info.approvalStatus || "")}
                label={info.approvalStatus || "Chưa xác định"}
              />
            </div>
            {info.rejectionReason && (
              <div className="media-overview__reason">
                Lý do từ chối: {info.rejectionReason}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="media-overview__information">
        <div className="media-overview__info-item">
          <strong>Lĩnh vực:</strong>
          <span>{info.category || "Chưa có thông tin"}</span>
        </div>
        <div className="media-overview__info-item">
          <strong>File đính kèm hoặc link nội dung:</strong>
          <span className="media-overview__break">
            {info.attachmentOrLink || "Chưa có"}
          </span>
        </div>
        {info.approvedBy && (
          <div className="media-overview__info-item">
            <strong>Người duyệt:</strong>
            <span>{info.approvedBy}</span>
          </div>
        )}
        <div className="media-overview__info-item">
          <strong>Người tạo:</strong>
          <span>{info.createdBy || "Chưa có thông tin"}</span>
        </div>
        <div className="media-overview__info-item">
          <strong>Ngày tạo:</strong>
          <span>
            {info.createdAt && dayjs(info.createdAt).isValid()
              ? dayjs(info.createdAt).format("DD/MM/YYYY HH:mm:ss")
              : "-"}
          </span>
        </div>
        {info.sharedArea && (
          <div className="media-overview__info-item">
            <strong>Khu vực chia sẻ:</strong>
            <span>{info.sharedArea}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default MediaOverview;
