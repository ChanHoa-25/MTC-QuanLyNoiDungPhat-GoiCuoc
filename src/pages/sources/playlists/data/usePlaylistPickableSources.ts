/**
 * Nguồn có thể thêm vào danh sách phát.
 *
 * SRS 4.3.2: Danh sách phát được tạo từ media ĐÃ DUYỆT (và bản mẫu - vốn được tạo từ
 * media đã duyệt). Không đưa media phát trực tiếp / tần số FM vào danh sách phát:
 * module media hiện chỉ có video, âm thanh, hình ảnh nên chưa phải lọc thêm.
 *
 * Dữ liệu lấy qua store của module Media và Bản mẫu (hiện là mock). Khi có API,
 * thay bằng API lấy media đã duyệt / bản mẫu theo phạm vi cơ sở của người dùng.
 */

import { useMemo } from "react";
import dayjs from "dayjs";

import { useSourceMediaStore } from "../../media/data/sourceMedia.store";
import { useSourceTemplatesStore } from "../../templates/data/sourceTemplates.store";
import type { PlaylistPickableSource } from "../types/sourcePlaylist.types";

const DEFAULT_TEMPLATE_DURATION = "00:00:30";

export function usePlaylistPickableSources() {
  const { mediaItems } = useSourceMediaStore();
  const { templates } = useSourceTemplatesStore();

  const approvedMedia = useMemo<PlaylistPickableSource[]>(
    () =>
      mediaItems
        .filter((media) => media.approvalStatus === "approved")
        .map((media) => ({
          sourceId: media.id,
          sourceType: "media",
          name: media.title,
          duration: media.duration,
          category: media.category,
          mediaType: media.type,
          thumbnail: media.thumbnail,
          createdBy: media.createdBy,
          createdAt: dayjs(media.createdAt).format("DD/MM/YYYY"),
        })),
    [mediaItems],
  );

  const templateSources = useMemo<PlaylistPickableSource[]>(
    () =>
      templates.map((template) => ({
        sourceId: template.id,
        sourceType: "template",
        name: template.name,
        duration: template.duration ?? DEFAULT_TEMPLATE_DURATION,
        thumbnail: template.zones.find((zone) => zone.mediaThumbnail)?.mediaThumbnail,
        createdBy: template.createdBy,
        createdAt: template.createdAt.split(" ")[0] ?? template.createdAt,
      })),
    [templates],
  );

  return { approvedMedia, templateSources };
}

