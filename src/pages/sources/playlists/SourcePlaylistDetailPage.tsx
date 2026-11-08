import { useState, useEffect } from "react";
import type { Key } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { message } from "antd";

import AppTabs from "../../../components/common/AppTabs";
import type { AppTabItem } from "../../../components/common/AppTabs";
import AppSearch from "../../../components/common/AppSearch";
import { useActionPanel } from "../../../contexts/ActionPanelContext";
import SourceUsedNewsPanel from "../components/SourceUsedNewsPanel";
import type { SourceUsedNewsAction } from "../types/sourceUsedNews.types";

import type { PlaylistEntry, SourcePlaylistItem } from "./types/sourcePlaylist.types";
import { useSourcePlaylistsStore } from "./data/sourcePlaylists.store";
import { MOCK_PLAYLIST_USED_NEWS } from "./data/sourcePlaylists.mock";
import PlaylistEntriesTable from "./components/PlaylistEntriesTable";
import PlaylistPreviewModal from "./components/PlaylistPreviewModal";
import "./SourcePlaylistDetailPage.css";

const DETAIL_TABS: AppTabItem[] = [
  { key: "info", label: "Thông tin danh sách phát" },
  { key: "used_news", label: "Bản tin sử dụng" },
];

export default function SourcePlaylistDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const { setActions } = useActionPanel();
  const { getPlaylistById } = useSourcePlaylistsStore();

  const [activeTab, setActiveTab] = useState("info");
  const [playlist, setPlaylist] = useState<SourcePlaylistItem | null>(null);

  // Tìm kiếm nguồn phát trong tab thông tin
  const [entryKeyword, setEntryKeyword] = useState("");

  // Preview popup (nghe thử)
  const [previewEntry, setPreviewEntry] = useState<PlaylistEntry | null>(null);

  // Tab 2: Danh sách bản tin sử dụng (mock data, tái sử dụng SourceUsedNewsPanel)
  const [newsList, setNewsList] = useState(MOCK_PLAYLIST_USED_NEWS);
  const [selectedNewsKeys, setSelectedNewsKeys] = useState<Key[]>([]);
  const [newsAction, setNewsAction] = useState<SourceUsedNewsAction | null>(null);

  useEffect(() => {
    if (id) {
      const found = getPlaylistById(id);
      if (found) {
        setPlaylist(found);
      } else {
        messageApi.error("Không tìm thấy danh sách phát!");
        navigate("/sources/playlists");
      }
    }
  }, [id, getPlaylistById, navigate, messageApi]);

  // Cấu hình ActionPanel khi ở Tab 2
  useEffect(() => {
    if (activeTab === "used_news") {
      setActions([
        {
          key: "delete-news",
          icon: <span style={{ fontSize: 16 }}>🗑️</span>,
          tooltip: "Xóa bản tin đã chọn",
          danger: true,
          disabled: selectedNewsKeys.length === 0,
          onClick: () => setNewsAction("delete"),
        },
        {
          key: "cancel-news",
          icon: <span style={{ fontSize: 16 }}>🚫</span>,
          tooltip: "Hủy bản tin đã chọn",
          disabled: selectedNewsKeys.length === 0,
          onClick: () => setNewsAction("cancel"),
        },
      ]);
    } else {
      setActions([]);
    }

    return () => setActions([]);
  }, [setActions, activeTab, selectedNewsKeys.length]);

  if (!playlist) return null;

  const filteredEntries = playlist.entries.filter((entry) =>
    !entryKeyword ? true : entry.name.toLowerCase().includes(entryKeyword.trim().toLowerCase())
  );

  return (
    <div className="source-playlist-detail-page">
      {contextHolder}

      {/* Tabs đầu trang */}
      <div className="playlist-detail-top-tabs">
        <AppTabs
          items={DETAIL_TABS}
          activeKey={activeTab}
          onChange={(k: string) => setActiveTab(k)}
        />
      </div>

      {/* TAB 1: THÔNG TIN DANH SÁCH PHÁT */}
      {activeTab === "info" && (
        <div className="playlist-detail-card">
          <div className="playlist-detail-layout">
            {/* Cột trái: Thông tin thuộc tính */}
            <div className="playlist-detail-left">
              <h2 className="detail-pane-title">Chi tiết danh sách phát</h2>

              <div className="detail-field">
                <label className="detail-field-label">Tên danh sách phát:</label>
                <div className="detail-field-value">{playlist.name}</div>
              </div>

              <div className="detail-field">
                <label className="detail-field-label">Lĩnh vực:</label>
                <div className="detail-field-value">{playlist.category}</div>
              </div>

              <div className="detail-field">
                <label className="detail-field-label">Người tạo:</label>
                <div className="detail-field-value">{playlist.createdBy}</div>
              </div>

              <div className="detail-field">
                <label className="detail-field-label">Ngày tạo:</label>
                <div className="detail-field-value">{playlist.createdAt}</div>
              </div>

              <div className="detail-field">
                <label className="detail-field-label">Mô tả:</label>
                <div className="detail-field-value detail-field-value--multiline">
                  {playlist.description || "Không có mô tả"}
                </div>
              </div>
            </div>

            {/* Cột phải: Bảng danh sách nguồn thông tin */}
            <div className="playlist-detail-right">
              <div className="detail-right-header">
                <h2 className="detail-pane-title">Danh sách các nguồn thông tin</h2>
                <AppSearch
                  placeholder="Nhập tên bản mẫu / media"
                  value={entryKeyword}
                  onChange={(val) => setEntryKeyword(val)}
                  onSearch={(val) => setEntryKeyword(val)}
                  width={320}
                />
              </div>

              <div className="detail-right-table">
                <PlaylistEntriesTable
                  entries={filteredEntries}
                  readOnly
                  onPreviewEntry={(entry) => setPreviewEntry(entry)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BẢN TIN SỬ DỤNG (Tái sử dụng SourceUsedNewsPanel) */}
      {activeTab === "used_news" && (
        <SourceUsedNewsPanel
          title="Danh sách bản tin sử dụng danh sách phát"
          items={newsList}
          onItemsChange={setNewsList}
          selectedKeys={selectedNewsKeys}
          onSelectedKeysChange={setSelectedNewsKeys}
          pendingAction={newsAction}
          onPendingActionChange={setNewsAction}
        />
      )}

      {/* Popup nghe thử */}
      <PlaylistPreviewModal
        entry={previewEntry}
        onClose={() => setPreviewEntry(null)}
      />
    </div>
  );
}

