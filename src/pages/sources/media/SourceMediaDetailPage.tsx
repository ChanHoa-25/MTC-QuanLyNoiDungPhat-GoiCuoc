import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { message } from "antd";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import AppConfirmModal from "../../../components/common/AppConfirmModal";
import AppIconButton from "../../../components/common/AppIconButton";
import AppTabs from "../../../components/common/AppTabs";
import type { AppTabItem } from "../../../components/common/AppTabs";
import MediaOverview from "../../../components/media/MediaOverview/MediaOverview";
import type { MediaOverviewDisplay } from "../../../components/media/MediaOverview/MediaOverview";
import MediaBroadcastList from "../../../components/media/MediaBroadcastList/MediaBroadcastList";
import type { BroadcastItem } from "../../../components/media/MediaBroadcastList/MediaBroadcastList";
import MediaSharedFacilities from "../../../components/media/MediaSharedFacilities/MediaSharedFacilities";
import type { SharedFacility } from "../../../components/media/MediaSharedFacilities/MediaSharedFacilities";
import { ROUTES } from "../../../constants/route.constants";
import { useActionPanel } from "../../../contexts/ActionPanelContext";
import {
  createMediaBroadcastUsageMock,
  createMediaSharedFacilitiesMock,
} from "./data/sourceMedia.mock";
import { useSourceMediaStore } from "./data/sourceMedia.store";
import type { MediaBroadcastUsageItem } from "./types/sourceMedia.types";
import "./SourceMediaDetailPage.css";

const TABS: AppTabItem[] = [
  { key: "broadcasts", label: "Danh sách bản tin sử dụng" },
  { key: "shared-facilities", label: "Danh sách cơ sở được chia sẻ" },
];

const approvalLabels: Record<string, string> = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Từ chối duyệt",
};
const playLabels: Record<string, string> = {
  playing: "Đang phát",
  paused: "Tạm ngưng",
  waiting: "Chờ phát",
  ended: "Đã kết thúc",
  not_started: "Chưa phát",
  upcoming: "Sắp tới lịch",
  cancelled: "Đã hủy",
};

function toBroadcastItem(item: MediaBroadcastUsageItem): BroadcastItem {
  return {
    id: item.id,
    name: item.title,
    type: item.broadcastType === "priority" ? "Tin ưu tiên" : "Tin thường",
    approvalStatus: approvalLabels[item.approvalStatus] ?? item.approvalStatus,
    playStatus: item.playStatus
      ? (playLabels[item.playStatus] ?? item.playStatus)
      : "-",
    startDate: item.startDate,
    endDate: item.endDate,
    broadcastTime: item.playTimeSlots.join(", ") || "-",
    location: item.facilitiesText,
  };
}

function SourceMediaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setActions } = useActionPanel();
  const [messageApi, contextHolder] = message.useMessage();
  const { getMediaById, deleteMediaByIds } = useSourceMediaStore();
  const media = id ? getMediaById(id) : undefined;

  const [activeTab, setActiveTab] = useState("broadcasts");
  const [compact, setCompact] = useState(false);
  const [deleteMediaOpen, setDeleteMediaOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    type: "cancel" | "delete";
    ids: string[];
  } | null>(null);
  const [broadcastsByMediaId, setBroadcastsByMediaId] = useState<
    Record<string, MediaBroadcastUsageItem[]>
  >({});
  const rootRef = useRef<HTMLDivElement>(null);

  const broadcasts = useMemo(() => {
    if (!id) return [];
    return broadcastsByMediaId[id] ?? createMediaBroadcastUsageMock(id);
  }, [broadcastsByMediaId, id]);

  const broadcastData = useMemo(
    () => broadcasts.map(toBroadcastItem),
    [broadcasts],
  );

  const sharedData = useMemo<SharedFacility[]>(() => {
    if (!id) return [];
    return createMediaSharedFacilitiesMock(id).map((item) => ({
      id: item.id,
      facilityName: item.facilityName,
      sharedAt: item.sharedAt,
      status:
        item.receiveStatus === "received" ? "Đã tiếp nhận" : "Chưa tiếp nhận",
    }));
  }, [id]);

  const overview = useMemo<MediaOverviewDisplay | null>(() => {
    if (!media) return null;

    return {
      name: media.fileName,
      url: media.url || media.sourceUrl || media.thumbnail,
      fileType: media.type,
      durationLabel: media.duration,
      sizeLabel: media.detailSizeLabel,

      approvalStatus: approvalLabels[media.status] ?? media.status,

      resolutions: media.resolutions.map((item) => item.label),

      category: media.category,
      attachmentOrLink: media.attachmentOrLink,
      approvedBy: media.approvedBy,
      createdBy: media.createdBy,
      createdAt: media.createdAt,
      sharedArea: media.sharedArea,
    };
  }, [media]);

  const openDeleteMedia = useCallback(() => setDeleteMediaOpen(true), []);

  useEffect(() => {
    if (!media) {
      setActions([]);
      return;
    }
    setActions([
      {
        key: "delete-media-detail",
        icon: <Trash2 />,
        tooltip: "Xóa file media",
        danger: true,
        onClick: openDeleteMedia,
      },
    ]);
    return () => setActions([]);
  }, [media, openDeleteMedia, setActions]);

  useEffect(() => {
    setActiveTab("broadcasts");
    setCompact(false);
    setPendingAction(null);
  }, [id]);

  useEffect(() => {
    const scrollParent = rootRef.current?.closest(
      ".app-content",
    ) as HTMLElement | null;
    if (!scrollParent) return;
    const onScroll = () => setCompact(scrollParent.scrollTop > 100);
    scrollParent.addEventListener("scroll", onScroll, { passive: true });
    return () => scrollParent.removeEventListener("scroll", onScroll);
  }, [id]);

  if (!media || !overview || !id) {
    return (
      <div className="source-media-detail source-media-detail--empty">
        <p>Không tìm thấy thông tin file media.</p>
        <button type="button" onClick={() => navigate(ROUTES.SOURCE_MEDIA)}>
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const confirmDeleteMedia = () => {
    deleteMediaByIds([media.id]);
    setDeleteMediaOpen(false);
    messageApi.success("Đã xóa file media thành công");
    navigate(ROUTES.SOURCE_MEDIA);
  };

  const confirmBroadcastAction = () => {
    if (!pendingAction) return;
    const { ids, type } = pendingAction;
    const selected = new Set(ids);
    setBroadcastsByMediaId((prev) => {
      const current = prev[media.id] ?? createMediaBroadcastUsageMock(media.id);
      return {
        ...prev,
        [media.id]:
          type === "cancel"
            ? current.map((item) =>
                selected.has(item.id)
                  ? { ...item, playStatus: "cancelled" }
                  : item,
              )
            : current.filter((item) => !selected.has(item.id)),
      };
    });
    messageApi.success(
      type === "cancel"
        ? `Đã hủy ${ids.length} bản tin`
        : `Đã xóa ${ids.length} bản tin`,
    );
    setPendingAction(null);
  };

  return (
    <div
      ref={rootRef}
      className="source-media-detail source-media-detail--shared">
      {contextHolder}
      <section
        className={`source-media-detail__overview ${compact ? "source-media-detail__overview--compact" : ""}`}>
        <MediaOverview media={overview} />
        <AppIconButton
          icon={compact ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          onClick={() => setCompact((value) => !value)}
          tooltip={compact ? "Mở rộng thông tin" : "Thu gọn thông tin"}
        />
      </section>

      <section className="source-media-detail__bottom">
        <AppTabs items={TABS} activeKey={activeTab} onChange={setActiveTab} />
        {activeTab === "broadcasts" ? (
          <MediaBroadcastList
            key={`broadcasts-${media.id}`}
            mediaId={media.id}
            data={broadcastData}
            onCancelSelected={(ids) =>
              setPendingAction({ type: "cancel", ids })
            }
            onDeleteSelected={(ids) =>
              setPendingAction({ type: "delete", ids })
            }
            onEdit={(item) =>
              messageApi.info(`Chỉnh sửa bản tin: ${item.name}`)
            }
            onView={(item) => messageApi.info(`Chi tiết bản tin: ${item.name}`)}
          />
        ) : (
          <MediaSharedFacilities
            key={`facilities-${media.id}`}
            mediaId={media.id}
            data={sharedData}
          />
        )}
      </section>

      <AppConfirmModal
        open={deleteMediaOpen}
        type="delete"
        title="Xác nhận xóa nguồn tin"
        description="Bạn có chắc chắn muốn xóa file media này khỏi hệ thống? Thao tác này không thể hoàn tác."
        confirmText="Xác nhận"
        cancelText="Hủy"
        onConfirm={confirmDeleteMedia}
        onCancel={() => setDeleteMediaOpen(false)}
      />
      <AppConfirmModal
        open={pendingAction !== null}
        type={pendingAction?.type === "cancel" ? "restart" : "delete"}
        title={
          pendingAction?.type === "cancel"
            ? "Xác nhận hủy bản tin"
            : "Xác nhận xóa bản tin"
        }
        description={`Bạn có chắc chắn muốn ${pendingAction?.type === "cancel" ? "hủy" : "xóa"} ${pendingAction?.ids.length ?? 0} bản tin đã chọn?`}
        confirmText="Xác nhận"
        cancelText="Hủy"
        onConfirm={confirmBroadcastAction}
        onCancel={() => setPendingAction(null)}
      />
    </div>
  );
}

export default SourceMediaDetailPage;
