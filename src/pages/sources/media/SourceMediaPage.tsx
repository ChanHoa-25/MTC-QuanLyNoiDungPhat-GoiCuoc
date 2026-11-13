import { useCallback, useEffect, useMemo, useState } from "react";
import { Form, message } from "antd";
import dayjs from "dayjs";
import {
  AlertTriangle,
  FileCheckCorner,
  FileX2,
  HardDrive,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import AppConfirmModal from "../../../components/common/AppConfirmModal";
import AppDateRangePicker from "../../../components/common/AppDateRangePicker";
import type { DateRangeValue } from "../../../components/common/AppDateRangePicker";
import AppFilter, {
  AppFilterField,
} from "../../../components/common/AppFilter";
import AppIconButton from "../../../components/common/AppIconButton";
import AppPagination from "../../../components/common/AppPagination";
import AppSearch from "../../../components/common/AppSearch";
import AppSelect from "../../../components/common/AppSelect";
import { ROUTES } from "../../../constants/route.constants";
import { useActionPanel } from "../../../contexts/ActionPanelContext";

import SourceNavigationTabs from "../components/SourceNavigationTabs";
import SourceMediaCard from "./components/SourceMediaCard";
import SourceMediaFormModal from "./components/SourceMediaFormModal";
import SourceMediaPlayerModal from "./components/SourceMediaPlayerModal";
import SourceMediaQuickPreview from "./components/SourceMediaQuickPreview";
import SourceMediaRejectModal from "./components/SourceMediaRejectModal";
import SourceMediaShareModal from "./components/SourceMediaShareModal";
import { DEFAULT_MEDIA_THUMBNAIL } from "./data/sourceMedia.mock";
import { useSourceMediaStore } from "./data/sourceMedia.store";
import type {
  SourceMediaFormValues,
  SourceMediaItem,
  SourceMediaType,
} from "./types/sourceMedia.types";

import "./SourceMediaPage.css";

const PAGE_SIZE = 15;

const MEDIA_TYPE_OPTIONS = [
  { label: "Tất cả", value: "all" },
  { label: "Video", value: "video" },
  { label: "Âm thanh", value: "audio" },
  { label: "Hình ảnh", value: "image" },
];

const APPROVAL_STATUS_OPTIONS = [
  { label: "Tất cả", value: "all" },
  { label: "Đã duyệt", value: "approved" },
  { label: "Chờ duyệt", value: "pending" },
  { label: "Đang xử lý", value: "processing" },
  { label: "Từ chối duyệt", value: "rejected" },
];

const SHARE_FACILITY_NAME_MAP: Record<string, string> = {
  "quan-1": "Quận 1",
  "quan-2": "Quận 2",
  "quan-3": "Quận 3",
  "quan-4": "Quận 4",
  "quan-5": "Quận 5",
  "quan-6": "Quận 6",
  "tan-binh": "Quận Tân Bình",
  "binh-thanh": "Quận Bình Thạnh",
};

function inferMediaType(values: SourceMediaFormValues): SourceMediaType {
  if (values.file) {
    if (values.file.type.startsWith("audio/")) return "audio";
    if (values.file.type.startsWith("image/")) return "image";
    return "video";
  }
  if (values.contentType === "frequency") return "audio";
  const val = (values.contentValue ?? "").toLowerCase();
  if (/\.(mp3|wav|ogg|aac|m4a)$/.test(val)) return "audio";
  if (/\.(jpg|jpeg|png|gif|webp|svg)$/.test(val)) return "image";
  return "video";
}

function SourceMediaPage() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const { setActions } = useActionPanel();

  const {
    mediaItems,
    addMediaItems,
    updateMediaItem,
    deleteMediaByIds,
    updateApproval,
  } = useSourceMediaStore();

  // Bộ lọc
  const [category, setCategory] = useState("all");
  const [mediaType, setMediaType] = useState("all");
  const [approvalStatus, setApprovalStatus] = useState("all");
  const [dateRange, setDateRange] = useState<DateRangeValue>([null, null]);
  const [keyword, setKeyword] = useState("");

  // Chọn media, trang hiện tại & xem nhanh bên phải
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [previewMediaId, setPreviewMediaId] = useState<string | null>(null);

  // Trạng thái các Popup (Modal)
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingMedia, setEditingMedia] = useState<SourceMediaItem | null>(
    null,
  );
  const [sharingMedia, setSharingMedia] = useState<SourceMediaItem | null>(
    null,
  );
  const [playingMedia, setPlayingMedia] = useState<SourceMediaItem | null>(
    null,
  );
  const [deleteTargetIds, setDeleteTargetIds] = useState<string[]>([]);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [storageFullModalOpen, setStorageFullModalOpen] = useState(false);

  const categoryList = useMemo(() => {
    const defaultCats = [
      "Tin tức",
      "Thể dục dưỡng sinh",
      "Văn nghệ giải trí",
      "Giáo dục",
      "Thông báo hành chính",
    ];
    return [
      ...new Set([...defaultCats, ...mediaItems.map((item) => item.category)]),
    ];
  }, [mediaItems]);

  const categoryOptions = useMemo(
    () => [
      { label: "Tất cả", value: "all" },
      ...categoryList.map((cat) => ({
        label: cat,
        value: cat,
      })),
    ],
    [categoryList],
  );

  const filteredMedia = useMemo(() => {
    const search = keyword.trim().toLowerCase();
    const [startDate, endDate] = dateRange;

    return mediaItems.filter((item) => {
      const matchCategory = category === "all" || item.category === category;
      const matchType = mediaType === "all" || item.type === mediaType;

      const matchStatus =
        approvalStatus === "all"
          ? true
          : approvalStatus === "processing"
            ? Boolean(item.isProcessing)
            : item.approvalStatus === approvalStatus && !item.isProcessing;

      const createdDate = dayjs(item.createdAt);
      const matchDate =
        (!startDate || !createdDate.isBefore(startDate, "day")) &&
        (!endDate || !createdDate.isAfter(endDate, "day"));

      const matchKeyword =
        !search ||
        item.title.toLowerCase().includes(search) ||
        item.fileName.toLowerCase().includes(search) ||
        item.attachmentOrLink.toLowerCase().includes(search) ||
        item.createdBy.toLowerCase().includes(search);

      return (
        matchCategory &&
        matchType &&
        matchStatus &&
        matchDate &&
        matchKeyword
      );
    });
  }, [mediaItems, category, mediaType, approvalStatus, dateRange, keyword]);

  const totalPages = Math.max(1, Math.ceil(filteredMedia.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedMedia = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredMedia.slice(start, start + PAGE_SIZE);
  }, [filteredMedia, safePage]);

  const previewMedia = useMemo(
    () =>
      previewMediaId
        ? (mediaItems.find((item) => item.id === previewMediaId) ?? null)
        : null,
    [mediaItems, previewMediaId],
  );

  const handleOpenAddMedia = useCallback(() => {
    setCreateModalOpen(true);
  }, []);

  const handleOpenBulkDelete = useCallback(() => {
    if (selectedIds.length === 0) {
      messageApi.warning("Vui lòng chọn media file cần xóa");
      return;
    }
    setDeleteTargetIds(selectedIds);
  }, [selectedIds, messageApi]);

  const handleOpenApprove = useCallback(() => {
    if (selectedIds.length === 0) {
      messageApi.warning("Vui lòng chọn media file cần phê duyệt");
      return;
    }
    setApproveModalOpen(true);
  }, [selectedIds.length, messageApi]);

  const handleOpenReject = useCallback(() => {
    if (selectedIds.length === 0) {
      messageApi.warning("Vui lòng chọn media file cần từ chối duyệt");
      return;
    }
    setRejectModalOpen(true);
  }, [selectedIds.length, messageApi]);

  useEffect(() => {
    setActions([
      {
        key: "add-media",
        icon: <Plus />,
        tooltip: "Thêm file media",
        onClick: handleOpenAddMedia,
      },
      {
        key: "delete-media",
        icon: <Trash2 />,
        tooltip: "Xóa nguồn tin",
        danger: true,
        onClick: handleOpenBulkDelete,
      },
      {
        key: "approve-media",
        icon: <FileCheckCorner color="#34CD26" />,
        tooltip: "Duyệt media file",
        onClick: handleOpenApprove,
      },
      {
        key: "reject-media",
        icon: <FileX2 />,
        tooltip: "Từ chối duyệt media",
        danger: true,
        onClick: handleOpenReject,
      },
    ]);

    return () => {
      setActions([]);
    };
  }, [
    setActions,
    handleOpenAddMedia,
    handleOpenBulkDelete,
    handleOpenApprove,
    handleOpenReject,
  ]);

  const handleResetFilters = () => {
    setCategory("all");
    setMediaType("all");
    setApprovalStatus("all");
    setDateRange([null, null]);
    setKeyword("");
    setCurrentPage(1);
    messageApi.success("Đã làm mới danh sách Media");
  };

  const handleToggleSelect = (id: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...new Set([...prev, id])] : prev.filter((x) => x !== id),
    );
  };

  const handleOpenDetail = (media: SourceMediaItem) => {
    navigate(`${ROUTES.SOURCE_MEDIA}/${media.id}`);
  };

  const handleDownloadMedia = (media: SourceMediaItem) => {
    const link = document.createElement("a");
    link.href = media.thumbnail;
    link.download = media.fileName || media.title;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    link.remove();
    messageApi.success(`Đang tải xuống "${media.title}"`);
  };

  const handleCreateMediaSubmit = (values: SourceMediaFormValues) => {
    const type = inferMediaType(values);
    const sizeMB = values.file
      ? Math.max(1, Math.round(values.file.size / (1024 * 1024)))
      : 165;

    const newItem: SourceMediaItem = {
      id: `source-media-${Date.now()}`,
      title: values.title,
      fileName: values.file?.name ?? values.title,
      category: values.category,
      type,
      contentType: values.contentType,
      approvalStatus: "pending",
      duration: type === "image" ? "00:00:15" : "00:01:30",
      sizeMB,
      detailSizeLabel: `${sizeMB}MB`,
      thumbnail:
        values.file && values.file.type.startsWith("image/")
          ? URL.createObjectURL(values.file)
          : DEFAULT_MEDIA_THUMBNAIL,
      attachmentOrLink:
        values.file?.name ?? values.contentValue ?? "Snail.com/tintuc/ttbs.mp4",
      approvedBy: "Tòng Sỹ Nguyên",
      createdBy: "Tuyết Nguyễn",
      createdAt: new Date().toISOString(),
      sharedArea: "Thủ Đức",
      isProcessing: false,
      resolutions: [
        { label: "4K", state: "processing" },
        { label: "2K", state: "disabled" },
        { label: "FHD", state: "ready-blue" },
        { label: "HD", state: "ready-green" },
      ],
    };

    addMediaItems([newItem]);
    setCreateModalOpen(false);
    setCurrentPage(1);
    messageApi.success(`Đã thêm file media "${values.title}" thành công`);
  };

  const handleEditMediaSubmit = (values: SourceMediaFormValues) => {
    if (!editingMedia) return;

    updateMediaItem(editingMedia.id, {
      title: values.title,
      category: values.category,
      ...(values.file
        ? {
            fileName: values.file.name,
            attachmentOrLink: values.file.name,
          }
        : {}),
    });

    setEditingMedia(null);
    messageApi.success(`Đã cập nhật file media "${values.title}" thành công`);
  };

  const handleShareMediaSubmit = (
    media: SourceMediaItem,
    facilityIds: string[],
  ) => {
    const names = facilityIds
      .map((id) => SHARE_FACILITY_NAME_MAP[id] ?? id)
      .join(", ");

    updateMediaItem(media.id, {
      sharedFacilityIds: facilityIds,
      sharedArea: names || media.sharedArea,
    });

    setSharingMedia(null);
    messageApi.success(
      `Đã chia sẻ "${media.title}" đến ${facilityIds.length} cơ sở thành công`,
    );
  };

  const handleConfirmDelete = () => {
    if (deleteTargetIds.length === 0) return;

    const count = deleteTargetIds.length;
    deleteMediaByIds(deleteTargetIds);
    setSelectedIds((prev) =>
      prev.filter((id) => !deleteTargetIds.includes(id)),
    );

    if (previewMediaId && deleteTargetIds.includes(previewMediaId)) {
      setPreviewMediaId(null);
    }

    setDeleteTargetIds([]);
    messageApi.success(`Đã xóa ${count} nguồn media thành công`);
  };

  const handleConfirmApprove = () => {
    if (selectedIds.length === 0) {
      setApproveModalOpen(false);
      return;
    }

    const count = selectedIds.length;
    updateApproval(selectedIds, "approved");
    setSelectedIds([]);
    setApproveModalOpen(false);
    messageApi.success(`Đã phê duyệt ${count} media file thành công`);
  };

  const handleConfirmReject = (reason: string) => {
    if (selectedIds.length === 0) {
      setRejectModalOpen(false);
      return;
    }

    const count = selectedIds.length;
    updateApproval(selectedIds, "rejected", reason);
    setSelectedIds([]);
    setRejectModalOpen(false);
    messageApi.success(`Đã từ chối duyệt ${count} media file`);
  };

  const isSingleDelete = deleteTargetIds.length === 1;

  return (
    <div className="source-media-page">
      {contextHolder}

      <SourceNavigationTabs />

      <div className="source-media-page__body">
        <section className="source-media-panel">
          <div className="source-media-panel__header">
            <h2 className="source-media-panel__title">
              Danh sách Media cơ sở đang quản lý
            </h2>

            <div className="source-media-panel__header-actions">
              <button
                type="button"
                className="source-media-panel__storage-btn"
                title="Kiểm tra cảnh báo dung lượng lưu trữ"
                onClick={() => setStorageFullModalOpen(true)}>
                <HardDrive size={15} />
                <span>Dung lượng lưu trữ</span>
              </button>

              <AppIconButton
                icon={<RefreshCw size={20} />}
                tooltip="Làm mới danh sách"
                size={34}
                iconSize={20}
                className="source-media-panel__refresh"
                onClick={handleResetFilters}
              />
            </div>
          </div>

          <AppFilter
            showActions={false}
            gap={14}
            className="source-media-panel__filters">
            <AppFilterField width={175}>
              <Form.Item label="Lĩnh vực">
                <AppSelect
                  width="100%"
                  value={category}
                  options={categoryOptions}
                  onChange={(value) => {
                    setCategory(String(value));
                    setCurrentPage(1);
                  }}
                />
              </Form.Item>
            </AppFilterField>

            <AppFilterField width={155}>
              <Form.Item label="Loại media">
                <AppSelect
                  width="100%"
                  value={mediaType}
                  options={MEDIA_TYPE_OPTIONS}
                  onChange={(value) => {
                    setMediaType(String(value));
                    setCurrentPage(1);
                  }}
                />
              </Form.Item>
            </AppFilterField>

            <AppFilterField width={165}>
              <Form.Item label="Trạng thái">
                <AppSelect
                  width="100%"
                  value={approvalStatus}
                  options={APPROVAL_STATUS_OPTIONS}
                  onChange={(value) => {
                    setApprovalStatus(String(value));
                    setCurrentPage(1);
                  }}
                />
              </Form.Item>
            </AppFilterField>

            <AppFilterField width={310}>
              <Form.Item label="Ngày tạo">
                <AppDateRangePicker
                  width="100%"
                  value={dateRange}
                  startPlaceholder="Từ ngày"
                  endPlaceholder="Đến ngày"
                  onChange={(dates) => {
                    setDateRange(dates);
                    setCurrentPage(1);
                  }}
                />
              </Form.Item>
            </AppFilterField>

            <AppFilterField
              width={250}
              className="source-media-panel__search-field">
              <Form.Item label="Từ khóa">
                <AppSearch
                  width="100%"
                  placeholder="Tên kênh/ URL/ Tần số"
                  value={keyword}
                  onChange={(value) => {
                    setKeyword(value);
                    setCurrentPage(1);
                  }}
                />
              </Form.Item>
            </AppFilterField>
          </AppFilter>

          {paginatedMedia.length > 0 ? (
            <div
              className={[
                "source-media-grid",
                previewMedia ? "source-media-grid--with-preview" : "",
              ]
                .filter(Boolean)
                .join(" ")}>
              {paginatedMedia.map((media) => (
                <SourceMediaCard
                  key={media.id}
                  media={media}
                  selected={selectedIds.includes(media.id)}
                  activePreview={previewMedia?.id === media.id}
                  onSelect={handleToggleSelect}
                  onPreview={(item) => setPreviewMediaId(item.id)}
                  onPlayModal={(item) => setPlayingMedia(item)}
                  onOpenDetail={handleOpenDetail}
                  onEdit={(item) => setEditingMedia(item)}
                  onShare={(item) => setSharingMedia(item)}
                  onDownload={handleDownloadMedia}
                />
              ))}
            </div>
          ) : (
            <div className="source-media-panel__empty">
              Không tìm thấy Media phù hợp với điều kiện lọc.
            </div>
          )}

          <div className="source-media-panel__pagination">
            <AppPagination
              current={safePage}
              pageSize={PAGE_SIZE}
              total={filteredMedia.length}
              onChange={(page) => setCurrentPage(page)}
            />
          </div>
        </section>

        {previewMedia && (
          <SourceMediaQuickPreview
            media={previewMedia}
            onClose={() => setPreviewMediaId(null)}
            onOpenDetail={handleOpenDetail}
            onPlayModal={(item) => setPlayingMedia(item)}
          />
        )}
      </div>

      {/* Popup 1: Thêm file media */}
      <SourceMediaFormModal
        open={createModalOpen}
        mode="create"
        categories={categoryList}
        onCancel={() => setCreateModalOpen(false)}
        onSubmit={handleCreateMediaSubmit}
        onStorageFull={() => {
          setCreateModalOpen(false);
          setStorageFullModalOpen(true);
        }}
      />

      {/* Popup 2: Cập nhật file media */}
      <SourceMediaFormModal
        open={editingMedia !== null}
        mode="edit"
        initialValues={editingMedia}
        categories={categoryList}
        onCancel={() => setEditingMedia(null)}
        onSubmit={handleEditMediaSubmit}
        onStorageFull={() => {
          setEditingMedia(null);
          setStorageFullModalOpen(true);
        }}
      />

      {/* Popup 3: Chia sẻ nguồn thông tin */}
      <SourceMediaShareModal
        media={sharingMedia}
        onCancel={() => setSharingMedia(null)}
        onShare={handleShareMediaSubmit}
      />

      {/* Popup 4: Xem trước / Nghe thử file media */}
      <SourceMediaPlayerModal
        item={playingMedia}
        onClose={() => setPlayingMedia(null)}
      />

      {/* Popup 5: Xác nhận xóa nguồn tin (1 mục) / Xác nhận xóa file media (nhiều mục) */}
      <AppConfirmModal
        open={deleteTargetIds.length > 0}
        type="delete"
        title={
          isSingleDelete ? "Xác nhận xóa nguồn tin" : "Xác nhận xóa file media"
        }
        description={
          isSingleDelete
            ? "Nguồn tin này sẽ bị xóa khỏi hệ thống và không thể khôi phục."
            : "Các media file được chọn sẽ bị xóa khỏi hệ thống và không thể khôi phục."
        }
        confirmText="Tiếp tục"
        cancelText="Hủy"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTargetIds([])}
      />

      {/* Popup 6: Xác nhận duyệt media file */}
      <AppConfirmModal
        open={approveModalOpen}
        type="success"
        title="Xác nhận duyệt media file"
        description="Media file bạn chọn sẽ được phê duyệt."
        confirmText="Tiếp tục"
        cancelText="Hủy"
        onConfirm={handleConfirmApprove}
        onCancel={() => setApproveModalOpen(false)}
      />

      {/* Popup 7: Xác nhận từ chối duyệt media */}
      <SourceMediaRejectModal
        open={rejectModalOpen}
        onCancel={() => setRejectModalOpen(false)}
        onConfirm={handleConfirmReject}
      />

      {/* Popup 8: Cảnh báo hết dung lượng lưu trữ */}
      <AppConfirmModal
        open={storageFullModalOpen}
        type="delete"
        icon={<AlertTriangle size={40} strokeWidth={2} />}
        title="Bạn đã hết dung lượng lưu trữ"
        description="Hãy thay đổi gói cước khác hoặc giải phóng kho media file để tải media mới."
        cancelText="Hủy"
        confirmText="Nâng cấp"
        onCancel={() => setStorageFullModalOpen(false)}
        onConfirm={() => {
          setStorageFullModalOpen(false);
          navigate(`${ROUTES.PROFILE}/renewal-history`);
        }}
      />
    </div>
  );
}

export default SourceMediaPage;
