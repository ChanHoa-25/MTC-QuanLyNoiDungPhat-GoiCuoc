import { useMemo } from "react";
import dayjs from "dayjs";

import { useSourceMediaStore } from "../../media/data/sourceMedia.store";
import { useSourceTemplatesStore } from "../../templates/data/sourceTemplates.store";

import type { PlaylistPickableSource } from "../types/sourcePlaylist.types";

const DEFAULT_TEMPLATE_DURATION = "00:00:30";

export function usePlaylistPickableSources() {
  const { mediaItems } = useSourceMediaStore();
  const { templates } = useSourceTemplatesStore();

  // Media đã duyệt
  const approvedMedia = useMemo<PlaylistPickableSource[]>(
    () =>
      mediaItems
        .filter((media) => media.status === "approved")
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

  // Bản mẫu sử dụng cấu trúc layers mới
  const templateSources = useMemo<PlaylistPickableSource[]>(
    () =>
      templates.map((template) => {
        const firstLayer = template.layers.find((layer) => layer.sourceId);

        const sourceMedia = mediaItems.find(
          (media) => media.id === firstLayer?.sourceId,
        );

        return {
          sourceId: template.id,
          sourceType: "template",
          name: template.name,
          duration: template.duration || DEFAULT_TEMPLATE_DURATION,
          thumbnail: sourceMedia?.thumbnail,
          createdBy: template.createdBy,
          createdAt: dayjs(template.createdAt).isValid()
            ? dayjs(template.createdAt).format("DD/MM/YYYY")
            : template.createdAt,
        };
      }),
    [templates, mediaItems],
  );

  return {
    approvedMedia,
    templateSources,
  };
}
