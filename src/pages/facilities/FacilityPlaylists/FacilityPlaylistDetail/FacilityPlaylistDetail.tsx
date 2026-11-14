import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Empty } from "antd";

import PlaylistDetail from "../../../../components/playlists/PlaylistDetail/PlaylistDetail";
import type {
  PlaylistDetailInfo,
  PlaylistSource,
} from "../../../../components/playlists/PlaylistDetail/PlaylistDetail";

import { createFacilityPlaylistsMock } from "../../data/facilitiesPlaylists.mock";
import type { FacilityPlaylist } from "../../types/facilityPlaylist.types";

import FacilityPlaylistUsedNews from "../FacilityPlaylistUsedNews";

const mockSources: PlaylistSource[] = [
  { id: 1, order: 1, name: "Bản mẫu 1", duration: "00:05:30", source: "Media" },
  { id: 2, order: 2, name: "Bản mẫu 2", duration: "00:05:30", source: "Media" },
  { id: 3, order: 3, name: "Bản mẫu 3", duration: "00:05:30", source: "Media" },
  { id: 4, order: 4, name: "Bản mẫu 4", duration: "00:05:30", source: "Media" },
  {
    id: 5,
    order: 5,
    name: "Bản mẫu 5",
    duration: "00:05:30",
    source: "Bản mẫu",
  },
  {
    id: 6,
    order: 6,
    name: "Bản mẫu 6",
    duration: "00:05:30",
    source: "Bản mẫu",
  },
  {
    id: 7,
    order: 7,
    name: "Bản mẫu 6",
    duration: "00:05:30",
    source: "Bản mẫu",
  },
  {
    id: 8,
    order: 8,
    name: "Bản mẫu 6",
    duration: "00:05:30",
    source: "Bản mẫu",
  },
  {
    id: 9,
    order: 9,
    name: "Bản mẫu 6",
    duration: "00:05:30",
    source: "Bản mẫu",
  },
  {
    id: 10,
    order: 10,
    name: "Bản mẫu 6",
    duration: "00:05:30",
    source: "Bản mẫu",
  },
];

function FacilityPlaylistDetail() {
  const navigate = useNavigate();

  const { facilityId, playlistId } = useParams<{
    facilityId: string;
    playlistId: string;
  }>();

  const playlist = useMemo<FacilityPlaylist | undefined>(() => {
    if (!facilityId || !playlistId) return undefined;

    return createFacilityPlaylistsMock(facilityId).find(
      (item) => String(item.id) === playlistId,
    );
  }, [facilityId, playlistId]);

  if (!playlist || !playlistId) {
    return (
      <div className="playlist-detail__not-found">
        <Empty description="Không tìm thấy danh sách phát" />

        <button type="button" onClick={() => navigate("/facilities")}>
          Quay lại quản lý cơ sở
        </button>
      </div>
    );
  }

  const playlistInfo: PlaylistDetailInfo = {
    id: playlist.id,
    name: playlist.name,
    category: playlist.category,
    createdBy: playlist.createdBy,
    createdAt: playlist.createdAt,
    description:
      "description" in playlist && typeof playlist.description === "string"
        ? playlist.description
        : undefined,
  };

  return (
    <PlaylistDetail
      key={playlistId}
      playlist={playlistInfo}
      sources={mockSources}
      usedNewsContent={<FacilityPlaylistUsedNews playlistId={playlistId} />}
    />
  );
}

export default FacilityPlaylistDetail;
