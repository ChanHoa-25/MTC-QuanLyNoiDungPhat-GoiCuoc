import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { TableColumnsType } from "antd";
import { Empty } from "antd";
import { Play } from "lucide-react";
import dayjs from "dayjs";

import AppTabs from "../../../../components/common/AppTabs";
import AppTable from "../../../../components/common/AppTable";
import AppSearch from "../../../../components/common/AppSearch";

import { createFacilityPlaylistsMock } from "../../data/facilitiesPlaylists.mock";

import type { FacilityPlaylist } from "../../types/facilityPlaylist.types";
import FacilityPlaylistUsedNews from "../FacilityPlaylistUsedNews";

import "./FacilityPlaylistDetail.css";

type DetailTab = "information" | "news";

interface PlaylistSource {
  id: number;
  order: number;
  name: string;
  duration: string;
  source: string;
  audioUrl?: string;
}

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

  const [activeTab, setActiveTab] = useState<DetailTab>("information");
  const [keyword, setKeyword] = useState("");

  // Lấy danh sách phát theo cơ sở và ID
  const playlist = useMemo<FacilityPlaylist | undefined>(() => {
    if (!facilityId || !playlistId) return undefined;

    return createFacilityPlaylistsMock(facilityId).find(
      (item) => String(item.id) === playlistId,
    );
  }, [facilityId, playlistId]);

  // Lọc danh sách nguồn thông tin
  const filteredSources = useMemo(() => {
    const search = keyword.trim().toLowerCase();

    if (!search) return mockSources;

    return mockSources.filter((item) =>
      item.name.toLowerCase().includes(search),
    );
  }, [keyword]);

  const columns: TableColumnsType<PlaylistSource> = [
    {
      title: "Thứ tự phát",
      dataIndex: "order",
      key: "order",
      width: 125,
      align: "center",
    },
    {
      title: "Tên nguồn phát",
      dataIndex: "name",
      key: "name",
      ellipsis: true,
    },
    {
      title: "Thời lượng",
      dataIndex: "duration",
      key: "duration",
      width: 170,
    },
    {
      title: "Nguồn thông tin",
      dataIndex: "source",
      key: "source",
      width: 180,
    },
    {
      title: "Nghe thử",
      key: "preview",
      width: 125,
      align: "center",
      render: (_, record) => (
        <button
          type="button"
          className="playlist-detail__play"
          aria-label={`Nghe thử ${record.name}`}
          disabled={!record.audioUrl}
          title={
            record.audioUrl
              ? `Nghe thử ${record.name}`
              : "Chưa có tệp âm thanh để nghe thử"
          }
          onClick={() => {
            if (!record.audioUrl) return;

            const audio = new Audio(record.audioUrl);
            void audio.play();
          }}>
          <Play size={20} />
        </button>
      ),
    },
  ];

  if (!playlist) {
    return (
      <div className="playlist-detail__not-found">
        <Empty description="Không tìm thấy danh sách phát" />

        <button type="button" onClick={() => navigate("/facilities")}>
          Quay lại quản lý cơ sở
        </button>
      </div>
    );
  }

  return (
    <div className="playlist-detail">
      {/* Tabs */}
      <AppTabs
        className="playlist-detail__tabs"
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as DetailTab)}
        items={[
          {
            key: "information",
            label: "Thông tin danh sách phát",
          },
          {
            key: "news",
            label: "Bản tin sử dụng",
          },
        ]}
      />

      {/* Nội dung tab thông tin */}
      {activeTab === "information" && (
        <div className="playlist-detail__content">
          {/* Thông tin bên trái */}
          <aside className="playlist-detail__info">
            <h2>Chi tiết danh sách phát</h2>

            <div className="playlist-detail__info-item">
              <strong>Tên danh sách phát:</strong>
              <span>{playlist.name}</span>
            </div>

            <div className="playlist-detail__info-item">
              <strong>Lĩnh vực:</strong>
              <span>{playlist.category || "-"}</span>
            </div>

            <div className="playlist-detail__info-item">
              <strong>Người tạo:</strong>
              <span>{playlist.createdBy || "-"}</span>
            </div>

            <div className="playlist-detail__info-item">
              <strong>Ngày tạo:</strong>
              <span>
                {playlist.createdAt
                  ? dayjs(playlist.createdAt).format("DD/MM/YYYY HH:mm:ss")
                  : "-"}
              </span>
            </div>

            <div className="playlist-detail__info-item">
              <strong>Mô tả:</strong>
              <span>
                {"description" in playlist &&
                typeof playlist.description === "string"
                  ? playlist.description
                  : "-"}
              </span>
            </div>
          </aside>

          {/* Bảng nguồn thông tin bên phải */}
          <section className="playlist-detail__sources">
            <h2>Danh sách các nguồn thông tin</h2>

            <div className="playlist-detail__filter">
              <label htmlFor="playlist-source-search">Từ khóa</label>

              <AppSearch
                id="playlist-source-search"
                width={344}
                value={keyword}
                onChange={setKeyword}
                placeholder="Nhập tên bản mẫu"
                allowClear
              />
            </div>

            <AppTable<PlaylistSource>
              className="playlist-detail__table"
              rowKey="id"
              columns={columns}
              dataSource={filteredSources}
              pagination={{ pageSize: 10 }}
              scroll={{ x: 800 }}
            />
          </section>
        </div>
      )}

      {/* Tab bản tin sử dụng */}
      {activeTab === "news" && playlistId && (
        <FacilityPlaylistUsedNews playlistId={playlistId} />
      )}
    </div>
  );
}

export default FacilityPlaylistDetail;
