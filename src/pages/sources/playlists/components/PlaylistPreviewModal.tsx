import { useMemo } from "react";

import AppModal from "../../../../components/common/AppModal";
import { useSourceMediaStore } from "../../media/data/sourceMedia.store";
import { useSourceTemplatesStore } from "../../templates/data/sourceTemplates.store";
import SourceTemplateCanvas from "../../templates/components/SourceTemplateCanvas";
import type { PlaylistEntry } from "../types/sourcePlaylist.types";
import "./PlaylistPreviewModal.css";

interface PlaylistPreviewModalProps {
  entry: Pick<PlaylistEntry, "sourceId" | "sourceType" | "name" | "thumbnail" | "mediaType"> | null;
  onClose: () => void;
}

/** Chỉ phát khi có URL hợp lệ (dữ liệu mock hiện chưa có tệp thật). */
function toPlayableUrl(value: string | undefined) {
  if (!value) return undefined;
  return /^https?:\/\//i.test(value) ? value : undefined;
}

/**
 * Popup "Nghe thử" một nguồn phát trong danh sách phát.
 * - Media video / âm thanh: dùng trình phát gốc của trình duyệt.
 * - Media hình ảnh: hiển thị ảnh.
 * - Bản mẫu: hiển thị bố cục bản mẫu (canvas chỉ đọc).
 */
export default function PlaylistPreviewModal({ entry, onClose }: PlaylistPreviewModalProps) {
  const { getMediaById } = useSourceMediaStore();
  const { getTemplateById } = useSourceTemplatesStore();

  const media = entry?.sourceType === "media" ? getMediaById(entry.sourceId) : undefined;
  const template = entry?.sourceType === "template" ? getTemplateById(entry.sourceId) : null;
  const playableUrl = toPlayableUrl(media?.attachmentOrLink);
  const mediaType = media?.type ?? entry?.mediaType;
  const poster = media?.thumbnail ?? entry?.thumbnail;

  const content = useMemo(() => {
    if (!entry) return null;

    if (entry.sourceType === "template") {
      return template ? (
        <div className="playlist-preview__template">
          <SourceTemplateCanvas
            zones={template.zones}
            activeZoneId={null}
            onSelectZone={() => undefined}
            readOnly
          />
        </div>
      ) : (
        <p className="playlist-preview__note">Không tìm thấy bản mẫu.</p>
      );
    }

    if (mediaType === "image") {
      return poster ? <img className="playlist-preview__image" src={poster} alt={entry.name} /> : null;
    }

    if (mediaType === "audio") {
      return (
        <div className="playlist-preview__audio">
          {poster && <img className="playlist-preview__image" src={poster} alt={entry.name} />}
          <audio controls src={playableUrl} className="playlist-preview__audio-player" />
        </div>
      );
    }

    return (
      <video
        className="playlist-preview__video"
        controls
        poster={poster}
        src={playableUrl}
      />
    );
  }, [entry, template, mediaType, poster, playableUrl]);

  return (
    <AppModal
      open={!!entry}
      onCancel={onClose}
      width={900}
      title={null}
      className="playlist-preview-modal"
    >
      <div className="playlist-preview">
        <p className="playlist-preview__title">{entry?.name}</p>
        <div className="playlist-preview__stage">{content}</div>
        {entry?.sourceType === "media" && mediaType !== "image" && !playableUrl && (
          <p className="playlist-preview__note">
            Dữ liệu mock chưa có tệp media thật để phát thử. Khi kết nối API sẽ phát theo đường dẫn của media.
          </p>
        )}
      </div>
    </AppModal>
  );
}

