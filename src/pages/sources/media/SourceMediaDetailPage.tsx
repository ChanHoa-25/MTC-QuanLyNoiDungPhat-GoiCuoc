import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Key } from "react";
import { Checkbox, Form, message } from "antd";
import type { TableColumnsType } from "antd";
import dayjs from "dayjs";
import {
  Ban,
  ChevronDown,
  ChevronUp,
  Info,
  Play,
  SquarePen,
  Trash2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import AppButton from "../../../components/common/AppButton";
import AppConfirmModal from "../../../components/common/AppConfirmModal";
import AppDateRangePicker from "../../../components/common/AppDateRangePicker";
import type { DateRangeValue } from "../../../components/common/AppDateRangePicker";
import AppFilter, {
  AppFilterField,
} from "../../../components/common/AppFilter";
import AppIconButton from "../../../components/common/AppIconButton";
import AppSearch from "../../../components/common/AppSearch";
import AppSelect from "../../../components/common/AppSelect";
import AppStatusTag from "../../../components/common/AppStatusTag";
import type { AppStatusVariant } from "../../../components/common/AppStatusTag";
import AppTable from "../../../components/common/AppTable";
import AppTableActions from "../../../components/common/AppTableActions";
import AppTabs from "../../../components/common/AppTabs";
import type { AppTabItem } from "../../../components/common/AppTabs";
import { ROUTES } from "../../../constants/route.constants";
import { useActionPanel } from "../../../contexts/ActionPanelContext";

import MediaResolutionsTag from "./components/MediaResolutionsTag";
import {
  DEFAULT_MEDIA_THUMBNAIL,
  createMediaBroadcastUsageMock,
  createMediaSharedFacilitiesMock,
} from "./data/sourceMedia.mock";
import { useSourceMediaStore } from "./data/sourceMedia.store";
import type {
  BroadcastApprovalStatus,
  BroadcastPlayStatus,
  MediaBroadcastUsageItem,
  MediaSharedFacilityItem,
  SourceMediaApprovalStatus,
  SourceMediaType,
} from "./types/sourceMedia.types";

import "./SourceMediaDetailPage.css";

type DetailSubTab = "broadcasts" | "shared-facilities";

const DETAIL_SUBTABS: AppTabItem[] = [
  {
    key: "broadcasts",
    label: "Danh sách bản tin sử dụng",
  },
  {
    key: "shared-facilities",
    label: "Danh sách cơ sở được chia sẻ",
  },
];

const PAGE_SIZE = 10;

const MEDIA_APPROVAL_MAP: Record<
  SourceMediaApprovalStatus,
  { label: string; variant: AppStatusVariant }
> = {
  approved: { label: "Đã duyệt", variant: "green" },
  pending: { label: "Chờ duyệt", variant: "yellow" },
  rejected: { label: "Từ chối duyệt", variant: "red" },
};

const MEDIA_TYPE_BADGE: Record<SourceMediaType, string> = {
  video: "VIDEO",
  audio: "AUDIO",
  image: "IMAGE",
};

const BROADCAST_APPROVAL_MAP: Record<
  BroadcastApprovalStatus,
  { label: string; variant: AppStatusVariant }
> = {
  pending: { label: "Chờ duyệt", variant: "yellow" },
  approved: { label: "Đã duyệt", variant: "green" },
  rejected: { label: "Từ chối duyệt", variant: "red" },
};

const BROADCAST_PLAY_MAP: Record<
  BroadcastPlayStatus,
  { label: string; variant: AppStatusVariant }
> = {
  playing: { label: "Đang phát", variant: "blue" },
  paused: { label: "Tạm ngưng", variant: "yellow" },
  waiting: { label: "Chờ phát", variant: "darkRed" },
  ended: { label: "Đã kết thúc", variant: "gray" },
  not_started: { label: "Chưa phát", variant: "green" },
  upcoming: { label: "Sắp tới lịch", variant: "darkRed" },
  cancelled: { label: "Đã hủy", variant: "red" },
};

const BROADCAST_TYPE_OPTIONS = [
  { label: "Tất cả", value: "all" },
  { label: "Tin ưu tiên", value: "priority" },
  { label: "Tin thường", value: "normal" },
];

const BROADCAST_APPROVAL_OPTIONS = [
  { label: "Tất cả", value: "all" },
  { label: "Chờ duyệt", value: "pending" },
  { label: "Đã duyệt", value: "approved" },
  { label: "Từ chối duyệt", value: "rejected" },
];

const BROADCAST_PLAY_OPTIONS = [
  { label: "Tất cả", value: "all" },
  { label: "Đang phát", value: "playing" },
  { label: "Tạm ngưng", value: "paused" },
  { label: "Chờ phát", value: "waiting" },
  { label: "Đã kết thúc", value: "ended" },
  { label: "Chưa phát", value: "not_started" },
  { label: "Sắp tới lịch", value: "upcoming" },
  { label: "Đã hủy", value: "cancelled" },
];

const SHARED_RECEIVE_STATUS_OPTIONS = [
  { label: "Tất cả", value: "all" },
  { label: "Đã tiếp nhận", value: "received" },
  { label: "Chưa tiếp nhận", value: "not_received" },
];

function SourceMediaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const { setActions } = useActionPanel();
  const rootRef = useRef<HTMLDivElement | null>(null);

  const { getMediaById, deleteMediaByIds } = useSourceMediaStore();
  const media = id ? getMediaById(id) : undefined;

  const [activeSubTab, setActiveSubTab] = useState<DetailSubTab>("broadcasts");
  const [compactSummary, setCompactSummary] = useState(false);

  // Popup xác nhận
  const [deleteMediaOpen, setDeleteMediaOpen] = useState(false);
  const [cancelBroadcastOpen, setCancelBroadcastOpen] = useState(false);
  const [deleteBroadcastOpen, setDeleteBroadcastOpen] = useState(false);

  // Dữ liệu bản tin sử dụng theo từng media (cho phép hủy / xóa trên state)
  const [broadcastsByMediaId, setBroadcastsByMediaId] = useState<
    Record<string, MediaBroadcastUsageItem[]>
  >({});

  const broadcasts = useMemo(() => {
    if (!id) return [];
    return broadcastsByMediaId[id] ?? createMediaBroadcastUsageMock(id);
  }, [broadcastsByMediaId, id]);

  // Thu gọn / mở rộng thẻ thông tin phía trên khi cuộn nội dung giống thiết kế Figma
  const compactTransitionUntilRef = useRef(0);
  const lastScrollTopRef = useRef(0);

  useEffect(() => {
    const scrollParent = rootRef.current?.closest(
      ".app-content",
    ) as HTMLElement | null;
    if (!scrollParent) return;

    const handleScroll = () => {
      const top = scrollParent.scrollTop;
      const now = Date.now();

      if (now < compactTransitionUntilRef.current) {
        lastScrollTopRef.current = top;
        return;
      }

      const scrollingDown = top > lastScrollTopRef.current;
      const scrollingUp = top < lastScrollTopRef.current;
      lastScrollTopRef.current = top;

      if (scrollingDown && top > 36) {
        setCompactSummary((prev) => {
          if (!prev) {
            compactTransitionUntilRef.current = Date.now() + 280;
            return true;
          }
          return prev;
        });
      } else if (scrollingUp && top <= 4) {
        setCompactSummary((prev) => {
          if (prev) {
            compactTransitionUntilRef.current = Date.now() + 280;
            return false;
          }
          return prev;
        });
      }
    };

    const handleWheel = (event: WheelEvent) => {
      if (event.deltaY < -8 && scrollParent.scrollTop <= 4) {
        setCompactSummary((prev) => {
          if (prev) {
            compactTransitionUntilRef.current = Date.now() + 280;
            return false;
          }
          return prev;
        });
      }
    };

    scrollParent.addEventListener("scroll", handleScroll, { passive: true });
    scrollParent.addEventListener("wheel", handleWheel, { passive: true });
    return () => {
      scrollParent.removeEventListener("scroll", handleScroll);
      scrollParent.removeEventListener("wheel", handleWheel);
    };
  }, []);

  // Lọc danh sách bản tin sử dụng
  const [broadcastType, setBroadcastType] = useState("all");
  const [approvalFilter, setApprovalFilter] = useState("all");
  const [playFilter, setPlayFilter] = useState("all");
  const [dateRange, setDateRange] = useState<DateRangeValue>([null, null]);
  const [keyword, setKeyword] = useState("");
  const [selectedBroadcastKeys, setSelectedBroadcastKeys] = useState<Key[]>([]);
  const [broadcastPage, setBroadcastPage] = useState(1);

  // Lọc cơ sở được chia sẻ
  const [sharedDateRange, setSharedDateRange] = useState<DateRangeValue>([
    null,
    null,
  ]);
  const [sharedStatus, setSharedStatus] = useState("all");
  const [facilityKeyword, setFacilityKeyword] = useState("");
  const [facilityPage, setFacilityPage] = useState(1);

  const handleGoBack = useCallback(() => {
    navigate(ROUTES.SOURCE_MEDIA);
  }, [navigate]);

  const handleOpenDeleteMedia = useCallback(() => {
    setDeleteMediaOpen(true);
  }, []);

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
        onClick: handleOpenDeleteMedia,
      },
    ]);

    return () => {
      setActions([]);
    };
  }, [media, setActions, handleOpenDeleteMedia]);

  const sharedFacilities = useMemo(
    () => (media ? createMediaSharedFacilitiesMock(media.id) : []),
    [media],
  );

  const filteredBroadcasts = useMemo(() => {
    const search = keyword.trim().toLowerCase();
    const [startDate, endDate] = dateRange;

    return broadcasts.filter((item) => {
      const matchType =
        broadcastType === "all" || item.broadcastType === broadcastType;
      const matchApproval =
        approvalFilter === "all" || item.approvalStatus === approvalFilter;
      const matchPlay = playFilter === "all" || item.playStatus === playFilter;

      const itemDate = item.startDate ? dayjs(item.startDate) : null;
      const matchDate =
        (!startDate && !endDate) ||
        (!!itemDate &&
          (!startDate || !itemDate.isBefore(startDate, "day")) &&
          (!endDate || !itemDate.isAfter(endDate, "day")));

      const matchKeyword =
        !search ||
        item.title.toLowerCase().includes(search) ||
        item.facilitiesText.toLowerCase().includes(search);

      return (
        matchType &&
        matchApproval &&
        matchPlay &&
        matchDate &&
        matchKeyword
      );
    });
  }, [
    broadcasts,
    broadcastType,
    approvalFilter,
    playFilter,
    dateRange,
    keyword,
  ]);

  const safeBroadcastPage = Math.min(
    broadcastPage,
    Math.max(1, Math.ceil(filteredBroadcasts.length / PAGE_SIZE)),
  );

  const currentPageBroadcastIds = useMemo(() => {
    const start = (safeBroadcastPage - 1) * PAGE_SIZE;
    return filteredBroadcasts
      .slice(start, start + PAGE_SIZE)
      .map((item) => item.id);
  }, [filteredBroadcasts, safeBroadcastPage]);

  const allCurrentPageSelected =
    currentPageBroadcastIds.length > 0 &&
    currentPageBroadcastIds.every((rowId) =>
      selectedBroadcastKeys.includes(rowId),
    );

  const someCurrentPageSelected =
    currentPageBroadcastIds.some((rowId) =>
      selectedBroadcastKeys.includes(rowId),
    ) && !allCurrentPageSelected;

  const handleToggleAllCurrentPageBroadcasts = (checked: boolean) => {
    if (checked) {
      setSelectedBroadcastKeys((prev) => [
        ...new Set([...prev, ...currentPageBroadcastIds]),
      ]);
    } else {
      const currentSet = new Set(currentPageBroadcastIds);
      setSelectedBroadcastKeys((prev) =>
        prev.filter((k) => !currentSet.has(String(k))),
      );
    }
  };

  const filteredSharedFacilities = useMemo(() => {
    const search = facilityKeyword.trim().toLowerCase();
    const [startDate, endDate] = sharedDateRange;

    return sharedFacilities.filter((item) => {
      const matchStatus =
        sharedStatus === "all" || item.receiveStatus === sharedStatus;

      const itemDate = item.sharedAt ? dayjs(item.sharedAt) : null;
      const matchDate =
        (!startDate && !endDate) ||
        (!!itemDate &&
          (!startDate || !itemDate.isBefore(startDate, "day")) &&
          (!endDate || !itemDate.isAfter(endDate, "day")));

      const matchKeyword =
        !search || item.facilityName.toLowerCase().includes(search);

      return matchStatus && matchDate && matchKeyword;
    });
  }, [sharedFacilities, sharedStatus, sharedDateRange, facilityKeyword]);

  if (!media) {
    return (
      <div className="source-media-detail__not-found">
        <h2>Không tìm thấy file media</h2>
        <p>File media không tồn tại hoặc đã bị xóa khỏi danh sách.</p>
        <AppButton variant="primary" width="auto" onClick={handleGoBack}>
          Quay lại danh sách Media
        </AppButton>
      </div>
    );
  }

  const mediaApproval = MEDIA_APPROVAL_MAP[media.approvalStatus];
  const formattedCreatedAt = dayjs(media.createdAt).format(
    "DD/MM/YYYY HH:mm:ss",
  );

  const broadcastColumns: TableColumnsType<MediaBroadcastUsageItem> = [
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      ellipsis: true,
      width: 170,
    },
    {
      title: "Loại bản tin",
      dataIndex: "broadcastType",
      key: "broadcastType",
      width: 120,
      render: (value: MediaBroadcastUsageItem["broadcastType"]) => (
        <AppStatusTag
          type="label"
          variant={value === "priority" ? "green" : "blue"}
          label={value === "priority" ? "Tin ưu tiên" : "Tin thường"}
        />
      ),
    },
    {
      title: "Trạng thái duyệt",
      dataIndex: "approvalStatus",
      key: "approvalStatus",
      width: 135,
      render: (value: BroadcastApprovalStatus) => {
        const info = BROADCAST_APPROVAL_MAP[value];
        return <AppStatusTag variant={info.variant} label={info.label} />;
      },
    },
    {
      title: "Trạng thái phát",
      dataIndex: "playStatus",
      key: "playStatus",
      width: 135,
      render: (value?: BroadcastPlayStatus) => {
        if (!value) return null;
        const info = BROADCAST_PLAY_MAP[value];
        return <AppStatusTag variant={info.variant} label={info.label} />;
      },
    },
    {
      title: "Ngày phát",
      key: "playDate",
      width: 120,
      render: (_, record) =>
        record.startDate && record.endDate ? (
          <div className="source-media-detail__multiline-cell">
            <span>{dayjs(record.startDate).format("DD/MM/YYYY")} -</span>
            <span>{dayjs(record.endDate).format("DD/MM/YYYY")}</span>
          </div>
        ) : (
          "-"
        ),
    },
    {
      title: "Giờ phát",
      key: "playTime",
      width: 160,
      render: (_, record) =>
        record.playTimeSlots.length > 0 ? (
          <div className="source-media-detail__multiline-cell">
            {record.playTimeSlots.map((slot, idx) => (
              <span key={`${record.id}-slot-${idx}`}>
                {slot}
                {idx < record.playTimeSlots.length - 1 ? "," : ""}
              </span>
            ))}
          </div>
        ) : (
          "-"
        ),
    },
    {
      title: "Cơ sở phát",
      dataIndex: "facilitiesText",
      key: "facilitiesText",
      ellipsis: true,
      width: 155,
    },
    {
      title: "Hành động",
      key: "actions",
      width: 95,
      align: "right",
      render: (_, record) => (
        <AppTableActions
          actions={[
            ...(record.approvalStatus === "pending"
              ? [
                  {
                    key: "edit",
                    icon: <SquarePen />,
                    tooltip: "Chỉnh sửa bản tin",
                    onClick: () =>
                      messageApi.info(`Chỉnh sửa bản tin: ${record.title}`),
                  },
                ]
              : []),
            {
              key: "detail",
              icon: <Info />,
              tooltip: "Xem chi tiết bản tin",
              onClick: () =>
                messageApi.info(`Chi tiết bản tin: ${record.title}`),
            },
          ]}
        />
      ),
    },
  ];

  const facilityColumns: TableColumnsType<MediaSharedFacilityItem> = [
    {
      title: "Cơ sở chia sẻ",
      dataIndex: "facilityName",
      key: "facilityName",
      width: 260,
    },
    {
      title: "Thời gian chia sẻ",
      dataIndex: "sharedAt",
      key: "sharedAt",
      width: 280,
      render: (val: string | null) =>
        val ? dayjs(val).format("DD/MM/YYYY HH:mm:ss") : "-",
    },
    {
      title: "Trạng thái tiếp nhận",
      dataIndex: "receiveStatus",
      key: "receiveStatus",
      render: (val: MediaSharedFacilityItem["receiveStatus"]) => (
        <AppStatusTag
          variant={val === "received" ? "green" : "blue"}
          label={val === "received" ? "Đã tiếp nhận" : "Chưa tiếp nhận"}
        />
      ),
    },
  ];

  const handleConfirmDeleteMedia = () => {
    deleteMediaByIds([media.id]);
    setDeleteMediaOpen(false);
    messageApi.success("Đã xóa file media thành công");
    navigate(ROUTES.SOURCE_MEDIA);
  };

  const handleConfirmCancelBroadcasts = () => {
    const selectedSet = new Set(selectedBroadcastKeys.map(String));
    setBroadcastsByMediaId((prev) => {
      const current = prev[media.id] ?? createMediaBroadcastUsageMock(media.id);
      return {
        ...prev,
        [media.id]: current.map((item) =>
          selectedSet.has(item.id)
            ? { ...item, playStatus: "cancelled" }
            : item,
        ),
      };
    });
    messageApi.success(
      `Đã hủy ${selectedBroadcastKeys.length} bản tin đã chọn`,
    );
    setSelectedBroadcastKeys([]);
    setCancelBroadcastOpen(false);
  };

  const handleConfirmDeleteBroadcasts = () => {
    const selectedSet = new Set(selectedBroadcastKeys.map(String));
    const count = selectedBroadcastKeys.length;
    setBroadcastsByMediaId((prev) => {
      const current = prev[media.id] ?? createMediaBroadcastUsageMock(media.id);
      return {
        ...prev,
        [media.id]: current.filter((item) => !selectedSet.has(item.id)),
      };
    });
    setSelectedBroadcastKeys([]);
    setDeleteBroadcastOpen(false);
    messageApi.success(`Đã xóa ${count} bản tin đã chọn`);
  };

  return (
    <div ref={rootRef} className="source-media-detail">
      {contextHolder}

      {/* Khung thông tin media phía trên (hỗ trợ cả dạng đầy đủ & thu gọn như thiết kế Figma) */}
      <section
        className={[
          "source-media-detail__summary",
          compactSummary ? "source-media-detail__summary--compact" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={() => {
          if (compactSummary) {
            setCompactSummary(false);
          }
        }}>
        <div className="source-media-detail__preview-box">
          <img
            src={media.thumbnail}
            alt={media.fileName}
            className="source-media-detail__preview-img"
            onError={(event) => {
              event.currentTarget.src = DEFAULT_MEDIA_THUMBNAIL;
            }}
          />

          {!compactSummary && (
            <button
              type="button"
              className="source-media-detail__play"
              aria-label="Phát xem trước">
              <Play size={18} fill="currentColor" />
            </button>
          )}
        </div>

        <div className="source-media-detail__main-info">
          <div className="source-media-detail__badges-row">
            <div className="source-media-detail__badges">
              <span>{MEDIA_TYPE_BADGE[media.type]}</span>
              <span>{media.duration}</span>
              <span>{media.detailSizeLabel}</span>
            </div>

            {compactSummary && (
              <div className="source-media-detail__status">
                <AppStatusTag
                  variant={mediaApproval.variant}
                  label={mediaApproval.label}
                />
              </div>
            )}
          </div>

          <h2 className="source-media-detail__filename">{media.fileName}</h2>

          <MediaResolutionsTag
            resolutions={media.resolutions}
            processingNote={compactSummary ? undefined : media.processingNote}
          />

          {!compactSummary && (
            <div className="source-media-detail__status">
              <AppStatusTag
                variant={mediaApproval.variant}
                label={mediaApproval.label}
              />
            </div>
          )}
        </div>

        {!compactSummary && (
          <dl className="source-media-detail__meta">
            <div className="source-media-detail__meta-row">
              <dt>Lĩnh vực:</dt>
              <dd>{media.category}</dd>
            </div>

            <div className="source-media-detail__meta-row">
              <dt>File đính kèm hoặc link nội dung:</dt>
              <dd>{media.attachmentOrLink}</dd>
            </div>

            <div className="source-media-detail__meta-row">
              <dt>Người phê duyệt:</dt>
              <dd>{media.approvedBy}</dd>
            </div>

            <div className="source-media-detail__meta-row">
              <dt>Người tạo:</dt>
              <dd>{media.createdBy}</dd>
            </div>

            <div className="source-media-detail__meta-row">
              <dt>Ngày tạo:</dt>
              <dd>{formattedCreatedAt}</dd>
            </div>

            <div className="source-media-detail__meta-row">
              <dt>Địa bàn chia sẻ:</dt>
              <dd>{media.sharedArea}</dd>
            </div>
          </dl>
        )}

        <AppIconButton
          icon={
            compactSummary ? <ChevronDown size={18} /> : <ChevronUp size={18} />
          }
          tooltip={
            compactSummary
              ? "Mở rộng thông tin media"
              : "Thu gọn thông tin media"
          }
          size={28}
          iconSize={18}
          className="source-media-detail__collapse-btn"
          onClick={(event) => {
            event.stopPropagation();
            compactTransitionUntilRef.current = Date.now() + 280;
            setCompactSummary((prev) => !prev);
          }}
        />
      </section>

      {/* Khung danh sách phía dưới */}
      <section className="source-media-detail__bottom">
        <AppTabs
          items={DETAIL_SUBTABS}
          activeKey={activeSubTab}
          onChange={(key) => {
            if (key === "broadcasts" || key === "shared-facilities") {
              setActiveSubTab(key);
            }
          }}
          className="source-media-detail__subtabs"
          ariaLabel="Thông tin sử dụng media"
        />

        {activeSubTab === "broadcasts" ? (
          <div className="source-media-detail__tab-body">
            <h3 className="source-media-detail__section-title">
              Danh sách bản tin sử dụng media file
            </h3>

            <AppFilter
              showActions={false}
              gap={14}
              className="source-media-detail__filters">
              <AppFilterField width={150}>
                <Form.Item label="Loại bản tin">
                  <AppSelect
                    width="100%"
                    value={broadcastType}
                    options={BROADCAST_TYPE_OPTIONS}
                    onChange={(val) => {
                      setBroadcastType(val);
                      setBroadcastPage(1);
                    }}
                  />
                </Form.Item>
              </AppFilterField>

              <AppFilterField width={155}>
                <Form.Item label="Trạng thái duyệt">
                  <AppSelect
                    width="100%"
                    value={approvalFilter}
                    options={BROADCAST_APPROVAL_OPTIONS}
                    onChange={(val) => {
                      setApprovalFilter(val);
                      setBroadcastPage(1);
                    }}
                  />
                </Form.Item>
              </AppFilterField>

              <AppFilterField width={155}>
                <Form.Item label="Trạng thái phát">
                  <AppSelect
                    width="100%"
                    value={playFilter}
                    options={BROADCAST_PLAY_OPTIONS}
                    onChange={(val) => {
                      setPlayFilter(val);
                      setBroadcastPage(1);
                    }}
                  />
                </Form.Item>
              </AppFilterField>

              <AppFilterField width={310}>
                <Form.Item label="Thời gian bắt đầu phát">
                  <AppDateRangePicker
                    width="100%"
                    value={dateRange}
                    startPlaceholder="Từ ngày"
                    endPlaceholder="Đến ngày"
                    onChange={(dates) => {
                      setDateRange(dates);
                      setBroadcastPage(1);
                    }}
                  />
                </Form.Item>
              </AppFilterField>

              <AppFilterField
                width={245}
                className="source-media-detail__search-field">
                <Form.Item label="Từ khóa">
                  <AppSearch
                    width="100%"
                    placeholder="Tên kênh/ URL/ Tần số"
                    value={keyword}
                    onChange={(val) => {
                      setKeyword(val);
                      setBroadcastPage(1);
                    }}
                  />
                </Form.Item>
              </AppFilterField>
            </AppFilter>

            {/* Thanh thao tác hàng loạt thay cho header bảng khi có dòng được chọn (khớp ảnh Figma) */}
            {selectedBroadcastKeys.length > 0 && (
              <div className="source-media-detail__selection-bar">
                <div className="source-media-detail__selection-check">
                  <Checkbox
                    checked={allCurrentPageSelected}
                    indeterminate={someCurrentPageSelected}
                    onChange={(event) =>
                      handleToggleAllCurrentPageBroadcasts(
                        event.target.checked,
                      )
                    }
                  />
                </div>

                <span className="source-media-detail__selection-count">
                  {selectedBroadcastKeys.length} bản tin đã chọn
                </span>

                <button
                  type="button"
                  className="source-media-detail__selection-action"
                  onClick={() => setCancelBroadcastOpen(true)}>
                  <Ban size={15} />
                  <span>Hủy bản tin</span>
                </button>

                <button
                  type="button"
                  className="source-media-detail__selection-action source-media-detail__selection-action--danger"
                  onClick={() => setDeleteBroadcastOpen(true)}>
                  <Trash2 size={15} />
                  <span>Xóa bản tin</span>
                </button>
              </div>
            )}

            <AppTable<MediaBroadcastUsageItem>
              className="source-media-detail__table"
              rowKey="id"
              columns={broadcastColumns}
              dataSource={filteredBroadcasts}
              showHeader={selectedBroadcastKeys.length === 0}
              showSelectedCount={false}
              selectable
              selectedLabel="bản tin"
              rowSelection={{
                selectedRowKeys: selectedBroadcastKeys,
                columnWidth: 52,
                onChange: (keys) => setSelectedBroadcastKeys([...keys]),
              }}
              pagination={{
                current: safeBroadcastPage,
                pageSize: PAGE_SIZE,
                total: filteredBroadcasts.length,
                onChange: (page) => setBroadcastPage(page),
              }}
              scroll={{ x: 1080 }}
            />
          </div>
        ) : (
          <div className="source-media-detail__tab-body">
            <h3 className="source-media-detail__section-title">
              Theo dõi tình trạng chia sẻ của nguồn tin
            </h3>

            <AppFilter
              showActions={false}
              gap={16}
              className="source-media-detail__filters">
              <AppFilterField width={310}>
                <Form.Item label="Thời gian chia sẻ">
                  <AppDateRangePicker
                    width="100%"
                    value={sharedDateRange}
                    startPlaceholder="Từ ngày"
                    endPlaceholder="Đến ngày"
                    onChange={(dates) => {
                      setSharedDateRange(dates);
                      setFacilityPage(1);
                    }}
                  />
                </Form.Item>
              </AppFilterField>

              <AppFilterField width={185}>
                <Form.Item label="Trạng thái">
                  <AppSelect
                    width="100%"
                    value={sharedStatus}
                    options={SHARED_RECEIVE_STATUS_OPTIONS}
                    onChange={(val) => {
                      setSharedStatus(val);
                      setFacilityPage(1);
                    }}
                  />
                </Form.Item>
              </AppFilterField>

              <AppFilterField
                width={260}
                className="source-media-detail__search-field">
                <Form.Item label="Từ khóa">
                  <AppSearch
                    width="100%"
                    placeholder="Tên kênh/ URL/ Tần số"
                    value={facilityKeyword}
                    onChange={(val) => {
                      setFacilityKeyword(val);
                      setFacilityPage(1);
                    }}
                  />
                </Form.Item>
              </AppFilterField>
            </AppFilter>

            <AppTable<MediaSharedFacilityItem>
              className="source-media-detail__table"
              rowKey="id"
              columns={facilityColumns}
              dataSource={filteredSharedFacilities}
              pagination={{
                current: Math.min(
                  facilityPage,
                  Math.max(
                    1,
                    Math.ceil(filteredSharedFacilities.length / PAGE_SIZE),
                  ),
                ),
                pageSize: PAGE_SIZE,
                total: filteredSharedFacilities.length,
                onChange: (page) => setFacilityPage(page),
              }}
            />
          </div>
        )}
      </section>

      <AppConfirmModal
        open={deleteMediaOpen}
        type="delete"
        title="Xác nhận xóa nguồn tin"
        description="Bạn có chắc chắn muốn xóa file media này khỏi hệ thống? Thao tác này không thể hoàn tác."
        confirmText="Xác nhận"
        cancelText="Hủy"
        onConfirm={handleConfirmDeleteMedia}
        onCancel={() => setDeleteMediaOpen(false)}
      />

      <AppConfirmModal
        open={cancelBroadcastOpen}
        type="restart"
        title="Xác nhận hủy bản tin"
        description={`Bạn có chắc chắn muốn hủy ${selectedBroadcastKeys.length} bản tin đã chọn?`}
        confirmText="Xác nhận"
        cancelText="Hủy"
        onConfirm={handleConfirmCancelBroadcasts}
        onCancel={() => setCancelBroadcastOpen(false)}
      />

      <AppConfirmModal
        open={deleteBroadcastOpen}
        type="delete"
        title="Xác nhận xóa bản tin"
        description={`Bạn có chắc chắn muốn xóa ${selectedBroadcastKeys.length} bản tin đã chọn khỏi danh sách?`}
        confirmText="Xác nhận"
        cancelText="Hủy"
        onConfirm={handleConfirmDeleteBroadcasts}
        onCancel={() => setDeleteBroadcastOpen(false)}
      />
    </div>
  );
}

export default SourceMediaDetailPage;
