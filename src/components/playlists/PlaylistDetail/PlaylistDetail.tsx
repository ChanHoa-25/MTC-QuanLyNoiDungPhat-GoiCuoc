import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { TableColumnsType } from "antd";
import { Play } from "lucide-react";
import dayjs from "dayjs";

import AppTabs from "../../common/AppTabs";
import AppTable from "../../common/AppTable";
import AppSearch from "../../common/AppSearch";

import "./PlaylistDetail.css";

type DetailTab = "information" | "news";

export interface PlaylistDetailInfo {
  id: string | number;
  name: string;
  category?: string;
  createdBy?: string;
  createdAt?: string;
  description?: string;
}

export interface PlaylistSource {
  id: string | number;
  order: number;
  name: string;
  duration: string;
  source: string;
  audioUrl?: string;
}

interface PlaylistDetailProps {
  playlist: PlaylistDetailInfo;
  sources: PlaylistSource[];
  usedNewsContent?: ReactNode;
}

function PlaylistDetail({
  playlist,
  sources,
  usedNewsContent,
}: PlaylistDetailProps) {
  const [activeTab, setActiveTab] = useState<DetailTab>("information");

  const [keyword, setKeyword] = useState("");

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  const filteredSources = useMemo(() => {
    const search = keyword.trim().toLowerCase();

    if (!search) return sources;

    return sources.filter((item) => item.name.toLowerCase().includes(search));
  }, [sources, keyword]);

  const handlePreview = (audioUrl?: string) => {
    if (!audioUrl) return;

    audioRef.current?.pause();

    const audio = new Audio(audioUrl);

    audioRef.current = audio;

    void audio.play().catch(() => {
      audioRef.current = null;
    });
  };

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
          onClick={() => handlePreview(record.audioUrl)}>
          <Play size={20} />
        </button>
      ),
    },
  ];

  return (
    <div className="playlist-detail">
      <AppTabs
        className="playlist-detail__tabs"
        activeKey={activeTab}
        onChange={(key) => {
          audioRef.current?.pause();
          setActiveTab(key as DetailTab);
        }}
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

      {activeTab === "information" && (
        <div className="playlist-detail__content">
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
              <span>{playlist.description || "-"}</span>
            </div>
          </aside>

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

      {activeTab === "news" && usedNewsContent}
    </div>
  );
}

export default PlaylistDetail;
