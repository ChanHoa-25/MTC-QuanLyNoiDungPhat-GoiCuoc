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
import MediaCard from "../../../components/media/MediaCard/MediaCard";
import MediaFormModal from "../../../components/media/MediaFormModal/MediaFormModal";
import type { MediaFormValues } from "../../../components/media/MediaFormModal/MediaFormModal";
import SourceMediaPlayerModal from "./components/SourceMediaPlayerModal";
import MediaPreview from "../../../components/media/MediaPreview/MediaPreview";
import MediaRejectModal from "../../../components/media/MediaRejectModal/MediaRejectModal";
import SourceMediaShareModal from "./components/SourceMediaShareModal";
import { DEFAULT_MEDIA_THUMBNAIL } from "./data/sourceMedia.mock";
import { useSourceMediaStore } from "./data/sourceMedia.store";
import type {
  SourceMediaItem,
  SourceMediaType,
} from "./types/sourceMedia.types";
import "./SourceMediaPage.css";
const PAGE_SIZE = 12;
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
function inferMediaType(values: MediaFormValues): SourceMediaType {
  if (values.file) {
    if (values.file.type.startsWith("audio/")) return "audio";
    if (values.file.type.startsWith("image/")) return "image";
    return "video";
  }
  if (values.contentType === "frequency") return "audio";
  if (values.fileType === "Image") return "image";
  if (values.fileType === "Audio") return "audio";
  if (values.fileType === "Video") return "video";
  const val = (values.contentValue ?? "").toLowerCase();
  if (/\.(mp3|wav|ogg|aac|m4a)$/.test(val)) return "audio";
  if (/\.(jpg|jpeg|png|gif|webp|svg)$/.test(val)) return "image";
  return "video";
}
function parseDurationSeconds(value?: string | null): number | null {
  if (!value) return null;
  const parts = value.split(":").map(Number);
  if (parts.some((part) => !Number.isFinite(part) || part < 0)) return null;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return null;
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
  const [category, setCategory] = useState("all");
  const [mediaType, setMediaType] = useState("all");
  const [approvalStatus, setApprovalStatus] = useState("all");
  const [dateRange, setDateRange] = useState<DateRangeValue>([null, null]);
  const [keyword, setKeyword] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [previewMediaId, setPreviewMediaId] = useState<string | null>(null);
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
  const [approvalTargetIds, setApprovalTargetIds] = useState<string[]>([]);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionTargetIds, setRejectionTargetIds] = useState<string[]>([]);
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
        approvalStatus === "all" || item.status === approvalStatus;
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
        matchCategory && matchType && matchStatus && matchDate && matchKeyword
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
    const eligibleIds = selectedIds.filter((id) =>
      mediaItems.some((item) => item.id === id && item.status === "pending"),
    );
    if (eligibleIds.length === 0) {
      messageApi.warning("Chỉ có thể duyệt Media đang chờ duyệt");
      return;
    }
    setApprovalTargetIds(eligibleIds);
    setApproveModalOpen(true);
  }, [selectedIds, mediaItems, messageApi]);
  const handleOpenReject = useCallback(() => {
    if (selectedIds.length === 0) {
      messageApi.warning("Vui lòng chọn media file cần từ chối duyệt");
      return;
    }
    const eligibleIds = selectedIds.filter((id) =>
      mediaItems.some((item) => item.id === id && item.status === "pending"),
    );
    if (eligibleIds.length === 0) {
      messageApi.warning("Chỉ có thể từ chối Media đang chờ duyệt");
      return;
    }
    setRejectionTargetIds(eligibleIds);
    setRejectModalOpen(true);
  }, [selectedIds, mediaItems, messageApi]);
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
    const downloadUrl = media.url ?? media.sourceUrl;
    if (!downloadUrl || !/^(https?:\/\/|blob:|data:|\/)/i.test(downloadUrl)) {
      messageApi.warning("Media này chưa có đường dẫn tải xuống hợp lệ");
      return;
    }
    link.href = downloadUrl;
    link.download = media.fileName || media.title;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    link.remove();
    messageApi.success(`Đang tải xuống "${media.title}"`);
  };
  const handleCreateMediaSubmit = (values: MediaFormValues) => {
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
      status: "pending",
      duration: type === "image" ? "00:00:15" : "00:01:30",
      sizeMB,
      detailSizeLabel: `${sizeMB}MB`,
      thumbnail:
        values.file && values.file.type.startsWith("image/")
          ? URL.createObjectURL(values.file)
          : DEFAULT_MEDIA_THUMBNAIL,
      attachmentOrLink:
        values.file?.name ?? values.contentValue ?? "Snail.com/tintuc/ttbs.mp4",
      sourceUrl: values.contentValue ?? undefined,
      approvedBy: "Tòng Sỹ Nguyên",
      createdBy: "Tuyết Nguyễn",
      createdAt: new Date().toISOString(),
      sharedArea: "Thủ Đức",
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
  const handleEditMediaSubmit = (values: MediaFormValues) => {
    if (!editingMedia) return;
    updateMediaItem(editingMedia.id, {
      title: values.title,
      category: values.category,
      ...(values.file
        ? {
            fileName: values.file.name,
            attachmentOrLink: values.file.name,
            sourceUrl: undefined,
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
    if (approvalTargetIds.length === 0) {
      setApproveModalOpen(false);
      return;
    }
    updateApproval(approvalTargetIds, "approved");
    setSelectedIds((prev) =>
      prev.filter((id) => !approvalTargetIds.includes(id)),
    );
    messageApi.success(
      `Đã phê duyệt ${approvalTargetIds.length} media file thành công`,
    );
    setApprovalTargetIds([]);
    setApproveModalOpen(false);
  };
  const handleConfirmReject = (reason: string) => {
    if (rejectionTargetIds.length === 0) {
      setRejectModalOpen(false);
      return;
    }
    updateApproval(rejectionTargetIds, "rejected", reason);
    setSelectedIds((prev) =>
      prev.filter((id) => !rejectionTargetIds.includes(id)),
    );
    messageApi.success(
      `Đã từ chối duyệt ${rejectionTargetIds.length} media file`,
    );
    setRejectionTargetIds([]);
    setRejectModalOpen(false);
  };
  const handleApproveSingle = (media: SourceMediaItem) => {
    if (media.status !== "pending") return;
    setApprovalTargetIds([media.id]);
    setApproveModalOpen(true);
  };
  const handleRejectSingle = (media: SourceMediaItem) => {
    if (media.status !== "pending") return;
    setRejectionTargetIds([media.id]);
    setRejectModalOpen(true);
  };
  const handleDeleteSingle = (media: SourceMediaItem) => {
    setDeleteTargetIds([media.id]);
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

          <div className="source-media-panel__filters">
            <AppFilter showActions={false} gap={12}>
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
          </div>
          {paginatedMedia.length > 0 ? (
            <div
              className={[
                "source-media-grid",
                previewMedia ? "source-media-grid--with-preview" : "",
              ]
                .filter(Boolean)
                .join(" ")}>
              {paginatedMedia.map((media) => (
                <MediaCard
                  key={media.id}
                  media={media}
                  selected={selectedIds.includes(media.id)}
                  menuVariant="detail"
                  onSelect={handleToggleSelect}
                  onPreview={(item) => setPreviewMediaId(item.id)}
                  onView={handleOpenDetail}
                  onEdit={(item) => setEditingMedia(item)}
                  onApprove={handleApproveSingle}
                  onReject={handleRejectSingle}
                  onShare={(item) => setSharingMedia(item)}
                  onDownload={handleDownloadMedia}
                  onDelete={handleDeleteSingle}
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
          <MediaPreview
            key={previewMedia.id}
            media={{
              ...previewMedia,
              contentValue: previewMedia.attachmentOrLink,
              sharedLocations: previewMedia.sharedArea,
              durationSeconds: parseDurationSeconds(previewMedia.duration),
            }}
            onClose={() => setPreviewMediaId(null)}
          />
        )}
      </div>
      <MediaFormModal
        open={createModalOpen}
        mode="create"
        categories={categoryList}
        onCancel={() => setCreateModalOpen(false)}
        onSubmit={handleCreateMediaSubmit}
      />
      <MediaFormModal
        open={editingMedia !== null}
        mode="edit"
        initialValues={
          editingMedia
            ? {
                ...editingMedia,
                contentType: editingMedia.contentType,
                contentValue: editingMedia.attachmentOrLink,
                fileType:
                  editingMedia.type === "image"
                    ? "Image"
                    : editingMedia.type === "audio"
                      ? "Audio"
                      : "Video",
              }
            : null
        }
        categories={categoryList}
        onCancel={() => setEditingMedia(null)}
        onSubmit={handleEditMediaSubmit}
      />
      <SourceMediaShareModal
        media={sharingMedia}
        onCancel={() => setSharingMedia(null)}
        onShare={handleShareMediaSubmit}
      />
      <SourceMediaPlayerModal
        item={playingMedia}
        onClose={() => setPlayingMedia(null)}
      />
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
      <MediaRejectModal
        open={rejectModalOpen}
        onCancel={() => setRejectModalOpen(false)}
        onConfirm={async (reason) => {
          handleConfirmReject(reason);
        }}
      />
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
