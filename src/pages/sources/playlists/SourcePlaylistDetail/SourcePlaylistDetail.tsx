import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Empty } from "antd";

import PlaylistDetail from "../../../../components/playlists/PlaylistDetail/PlaylistDetail";
import type {
  PlaylistDetailInfo,
  PlaylistSource,
} from "../../../../components/playlists/PlaylistDetail/PlaylistDetail";

import {
  getPlaylistById,
  useSourcePlaylistsStore,
} from "../data/sourcePlaylists.store";

import type { SourcePlaylistItem } from "../types/sourcePlaylist.types";

import SourcePlaylistUsedNews from "../SourcePlaylistUsedNews";

function SourcePlaylistDetail() {
  const navigate = useNavigate();

  const { playlistId } = useParams<{
    playlistId: string;
  }>();

  const { playlists } = useSourcePlaylistsStore();

  const playlist = useMemo<SourcePlaylistItem | null>(() => {
    if (!playlistId) return null;

    return getPlaylistById(playlistId);
  }, [playlistId, playlists]);

  if (!playlist || !playlistId) {
    return (
      <div className="playlist-detail__not-found">
        <Empty description="Không tìm thấy danh sách phát" />

        <button type="button" onClick={() => navigate("/sources/playlists")}>
          Quay lại danh sách phát
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
    description: playlist.description,
  };

  const sources: PlaylistSource[] = playlist.entries.map((entry, index) => ({
    id: index + 1,
    order: index + 1,
    name: entry.name,
    duration: entry.duration,
    source: entry.sourceType === "media" ? "Media" : "Bản mẫu",
  }));

  return (
    <PlaylistDetail
      key={playlistId}
      playlist={playlistInfo}
      sources={sources}
      usedNewsContent={<SourcePlaylistUsedNews playlistId={playlistId} />}
    />
  );
}

export default SourcePlaylistDetail;
