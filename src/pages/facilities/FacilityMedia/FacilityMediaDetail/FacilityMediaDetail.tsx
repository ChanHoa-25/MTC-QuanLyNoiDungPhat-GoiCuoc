import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Alert, Spin, message } from "antd";
import { Download, Trash2 } from "lucide-react";

import mediaApi from "../../../../api/mediaApi";
import type { MediaApiItem } from "../../../../api/mediaApi";

import AppTabs from "../../../../components/common/AppTabs";
import { useActionPanel } from "../../../../contexts/ActionPanelContext";
import type { AppActionPanelItem } from "../../../../components/common/AppActionPanel";

import MediaOverview from "../../../../components/media/MediaOverview/MediaOverview";
import MediaBroadcastList from "../../../../components/media/MediaBroadcastList/MediaBroadcastList";
import MediaSharedFacilities from "../../../../components/media/MediaSharedFacilities/MediaSharedFacilities";

import DownloadQualityModal from "../../../../components/media/DownloadQualityModal/DownloadQualityModal";
import type { DownloadQuality } from "../../../../components/media/DownloadQualityModal/DownloadQualityModal";

import "./FacilityMediaDetail.css";

type DetailTab = "broadcasts" | "shared";

const tabItems = [
  { key: "broadcasts", label: "Danh sách bản tin sử dụng" },
  { key: "shared", label: "Danh sách cơ sở được chia sẻ" },
];

function FacilityMediaDetail() {
  const { mediaId } = useParams<{ mediaId: string }>();
  const { setActions } = useActionPanel();

  const [media, setMedia] = useState<MediaApiItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<DetailTab>("broadcasts");
  const [downloadOpen, setDownloadOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadMedia() {
      if (!mediaId) {
        setError("Không tìm thấy mã Media.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      setMedia(null);
      setDownloadOpen(false);

      try {
        const result = await mediaApi.getById(mediaId);

        if (!cancelled) {
          setMedia(result);
        }
      } catch (err) {
        console.error("Lỗi lấy thông tin Media:", err);

        if (!cancelled) {
          setError("Không thể tải thông tin Media.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadMedia();

    return () => {
      cancelled = true;
    };
  }, [mediaId]);

  const handleDownload = useCallback(() => {
    if (!media) return;

    setDownloadOpen(true);
  }, [media]);

  const handleConfirmDownload = useCallback(
    (quality: DownloadQuality) => {
      if (!media) return;

      const url = media.url || media.sourceUrl;

      if (!url) {
        message.warning("Media chưa có đường dẫn tải xuống.");
        return;
      }

      message.info(
        `Đã chọn chất lượng ${quality}. Chức năng tải theo chất lượng đang chờ API Backend.`,
      );

      setDownloadOpen(false);
    },
    [media],
  );

  const handleDelete = useCallback(() => {
    message.info("Chức năng xóa Media đang chờ API Backend.");
  }, []);

  const actions = useMemo<AppActionPanelItem[]>(() => {
    if (!media || loading || error) {
      return [];
    }

    return [
      {
        key: "delete",
        icon: <Trash2 />,
        tooltip: "Xóa Media",
        danger: true,
        onClick: handleDelete,
      },
      {
        key: "download",
        icon: <Download />,
        tooltip: "Tải xuống Media",
        onClick: handleDownload,
      },
    ];
  }, [media, loading, error, handleDelete, handleDownload]);

  useEffect(() => {
    setActions(actions);

    return () => {
      setActions([]);
    };
  }, [actions, setActions]);

  if (loading) {
    return (
      <div className="facility-media-detail__state">
        <Spin size="large" />
        <span>Đang tải thông tin Media...</span>
      </div>
    );
  }

  if (error || !media) {
    return (
      <Alert type="error" showIcon message={error || "Không tìm thấy Media."} />
    );
  }

  return (
    <div className="facility-media-detail">
      <div className="facility-media-detail__top">
        <MediaOverview media={media} />
      </div>

      <section className="facility-media-detail__content">
        <AppTabs
          items={tabItems}
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as DetailTab)}
          ariaLabel="Thông tin liên quan đến Media"
        />

        <div className="facility-media-detail__tab-content">
          {activeTab === "broadcasts" ? (
            <MediaBroadcastList mediaId={media.id} />
          ) : (
            <MediaSharedFacilities mediaId={media.id} />
          )}
        </div>
      </section>

      <DownloadQualityModal
        open={downloadOpen}
        onClose={() => setDownloadOpen(false)}
        onDownload={handleConfirmDownload}
      />
    </div>
  );
}

export default FacilityMediaDetail;
