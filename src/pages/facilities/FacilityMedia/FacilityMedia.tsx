import { useEffect, useMemo, useState } from "react";
import { message } from "antd";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";

import AppSelect from "../../../components/common/AppSelect";
import AppSearch from "../../../components/common/AppSearch";
import AppDatePicker from "../../../components/common/AppDatePicker";
import AppPagination from "../../../components/common/AppPagination";
import AppConfirmModal from "../../../components/common/AppConfirmModal";
import AppFilter, {
  AppFilterField,
} from "../../../components/common/AppFilter";

import MediaCard from "./MediaCard/MediaCard";
import FacilityMediaFormModal from "./FacilityMediaFormModal/FacilityMediaFormModal";

import { createFacilityMediaMock } from "../data/facilitiesMedia.mock";

import type {
  FacilityMediaItem,
  FacilityMediaFormValues,
  MediaType,
} from "../types/facilityMedia.types";

import "./FacilityMedia.css";

interface FacilityMediaProps {
  facilityId: string;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  openCreate: boolean;
  onCloseCreate: () => void;
  deleteRequestId: number;
  approveRequestId: number;
  onShare?: (media: FacilityMediaItem) => void;
}

const PAGE_SIZE = 8;

// Lưu mock theo từng cơ sở trong phiên chạy ứng dụng
const mediaStore = new Map<string, FacilityMediaItem[]>();

function getFacilityMedia(facilityId: string) {
  if (!mediaStore.has(facilityId)) {
    mediaStore.set(facilityId, createFacilityMediaMock(facilityId));
  }

  return mediaStore.get(facilityId)!;
}

function getMediaType(file: File): MediaType {
  if (file.type.startsWith("video/")) return "video";
  if (file.type.startsWith("audio/")) return "audio";
  return "image";
}

function getTypeFromUrl(url: string): MediaType {
  const path = url.split("?")[0].toLowerCase();

  if (/\.(mp3|wav|ogg|aac|m4a)$/.test(path)) {
    return "audio";
  }

  if (/\.(jpg|jpeg|png|gif|webp|svg)$/.test(path)) {
    return "image";
  }

  return "video";
}

function FacilityMedia({
  facilityId,
  selectedIds,
  onSelectionChange,
  openCreate,
  onCloseCreate,
  deleteRequestId,
  approveRequestId,
  onShare,
}: FacilityMediaProps) {
  const [mediaList, setMediaList] = useState<FacilityMediaItem[]>(() =>
    getFacilityMedia(facilityId),
  );

  const [category, setCategory] = useState("all");
  const [mediaType, setMediaType] = useState("all");
  const [sourceStatus, setSourceStatus] = useState("all");
  const [createdDate, setCreatedDate] = useState<Dayjs | null>(null);
  const [keyword, setKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [editMedia, setEditMedia] = useState<FacilityMediaItem | null>(null);

  const [saving, setSaving] = useState(false);

  const updateMedia = (
    updater: (previous: FacilityMediaItem[]) => FacilityMediaItem[],
  ) => {
    const next = updater(getFacilityMedia(facilityId));
    mediaStore.set(facilityId, next);
    setMediaList(next);
  };

  useEffect(() => {
    setMediaList(getFacilityMedia(facilityId));
    setCategory("all");
    setMediaType("all");
    setSourceStatus("all");
    setCreatedDate(null);
    setKeyword("");
    setCurrentPage(1);
    setDeleteModalOpen(false);
    setEditMedia(null);
    onSelectionChange([]);
    // Reset khi thay đổi cơ sở
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facilityId]);

  const categoryOptions = useMemo(() => {
    const categories = [
      "Tin tức",
      "Thể dục dưỡng sinh",
      "Văn nghệ giải trí",
      "Giáo dục",
    ];

    const all = Array.from(
      new Set([...categories, ...mediaList.map((media) => media.category)])
    );

    return [
      { value: "all", label: "Tất cả" },
      ...all.map((item) => ({
        value: item,
        label: item,
      })),
    ];
  }, [mediaList]);

  const filteredMedia = useMemo(() => {
    const searchValue = keyword.trim().toLowerCase();

    return mediaList.filter((media) => {
      const matchCategory = category === "all" || media.category === category;

      const matchType = mediaType === "all" || media.type === mediaType;

      const matchSourceStatus =
        sourceStatus === "all" || media.sourceStatus === sourceStatus;

      const matchDate =
        !createdDate || dayjs(media.createdAt).isSame(createdDate, "day");

      const matchKeyword =
        !searchValue ||
        media.title.toLowerCase().includes(searchValue) ||
        media.createdBy.toLowerCase().includes(searchValue);

      return (
        matchCategory &&
        matchType &&
        matchSourceStatus &&
        matchDate &&
        matchKeyword
      );
    });
  }, [mediaList, category, mediaType, sourceStatus, createdDate, keyword]);

  const total = filteredMedia.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedMedia = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredMedia.slice(start, start + PAGE_SIZE);
  }, [filteredMedia, safePage]);

  const handleSelect = (id: string, checked: boolean) => {
    const next = checked
      ? Array.from(new Set([...selectedIds, id]))
      : selectedIds.filter((item) => item !== id);

    onSelectionChange(next);
  };

  const handleConfirmDelete = () => {
    if (selectedIds.length === 0) {
      setDeleteModalOpen(false);
      return;
    }

    updateMedia((previous) =>
      previous.filter((media) => !selectedIds.includes(media.id)),
    );

    onSelectionChange([]);
    setDeleteModalOpen(false);
    message.success("Xóa Media thành công");
  };

  const handleApproveMedia = () => {
    if (selectedIds.length === 0) {
      message.warning("Vui lòng chọn Media cần duyệt");
      return;
    }

    const pendingIds = selectedIds.filter((id) =>
      mediaList.some((media) => media.id === id && media.status === "pending"),
    );

    if (pendingIds.length === 0) {
      message.info("Các Media đã chọn đều đã được duyệt");
      return;
    }

    updateMedia((previous) =>
      previous.map((media) =>
        pendingIds.includes(media.id)
          ? { ...media, status: "approved" }
          : media,
      ),
    );

    onSelectionChange([]);
    message.success("Duyệt Media thành công");
  };

  const handleSaveMedia = async (values: FacilityMediaFormValues) => {
    setSaving(true);

    try {
      if (editMedia) {
        const existing = editMedia;

        const newUrl = values.file
          ? URL.createObjectURL(values.file)
          : undefined;

        const updated: FacilityMediaItem = {
          ...existing,
          title: values.title,
          category: values.category,
          type: values.file ? getMediaType(values.file) : existing.type,
          sizeMB: values.file
            ? Number((values.file.size / (1024 * 1024)).toFixed(2))
            : existing.sizeMB,
          url: newUrl ?? existing.url,
          fileName: values.file ? values.file.name : existing.fileName,
          mimeType: values.file ? values.file.type : existing.mimeType,
          contentValue: values.contentValue ?? existing.contentValue,
          thumbnail: values.file?.type.startsWith("image/")
            ? newUrl!
            : existing.thumbnail,
        };

        updateMedia((previous) =>
          previous.map((media) => (media.id === existing.id ? updated : media)),
        );

        setEditMedia(null);
        message.success("Cập nhật Media thành công");
      } else {
        const newUrl = values.file
          ? URL.createObjectURL(values.file)
          : (values.contentValue ?? "");

        const type = values.file
          ? getMediaType(values.file)
          : values.contentType === "frequency"
            ? "audio"
            : getTypeFromUrl(newUrl);

        const newMedia: FacilityMediaItem = {
          id: `${facilityId}-media-${crypto.randomUUID()}`,
          facilityId,
          title: values.title,
          category: values.category,
          type,
          status: "pending",
          sourceStatus: "active",
          createdAt: new Date().toISOString(),
          createdBy: "Người dùng hiện tại",
          sizeMB: values.file
            ? Number((values.file.size / (1024 * 1024)).toFixed(2))
            : 0,
          thumbnail: values.file?.type.startsWith("image/")
            ? newUrl
            : (mediaList[0]?.thumbnail ?? ""),
          url: values.contentType === "frequency" ? undefined : newUrl,
          contentType: values.contentType,
          contentValue: values.contentValue,
          fileName: values.file?.name,
          mimeType: values.file?.type,
        };

        updateMedia((previous) => [newMedia, ...previous]);

        onCloseCreate();
        setCurrentPage(1);
        message.success("Thêm Media thành công");
      }
    } catch {
      message.error("Không thể lưu Media");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (deleteRequestId <= 0) return;

    if (selectedIds.length === 0) {
      message.warning("Vui lòng chọn Media cần xóa");
      return;
    }

    setDeleteModalOpen(true);
    // Mỗi lần nhấn xóa sẽ tăng request ID
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleteRequestId]);

  useEffect(() => {
    if (approveRequestId <= 0) return;

    handleApproveMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approveRequestId]);

  const handleViewMedia = (media: FacilityMediaItem) => {
    if (!media.url) {
      message.info("Media này chưa có nội dung để xem trước");
      return;
    }

    window.open(media.url, "_blank", "noopener,noreferrer");
  };

  const handleEditMedia = (media: FacilityMediaItem) => {
    setEditMedia(media);
  };

  const handleShareMedia = (media: FacilityMediaItem) => {
    onShare?.(media);
  };

  const handleDownloadMedia = (media: FacilityMediaItem) => {
    if (!media.url) {
      message.warning("Media chưa có đường dẫn tải xuống");
      return;
    }

    if (media.contentType === "frequency") {
      message.warning("Media tần số không có file để tải xuống");
      return;
    }

    const link = document.createElement("a");
    link.href = media.url;
    link.download = media.fileName ?? media.title;
    link.rel = "noopener noreferrer";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="facility-media-layout">
      <section className="facility-media">
        <h2 className="facility-media__heading">Danh sách Media</h2>

        <div className="facility-media__filters">
          <AppFilter gap={18} showActions={false}>
            <AppFilterField width={210}>
              <label>Lĩnh vực</label>
              <AppSelect
                width="100%"
                value={category}
                options={categoryOptions}
                onChange={(value) => {
                  setCategory(value);
                  setCurrentPage(1);
                }}
              />
            </AppFilterField>

            <AppFilterField width={210}>
              <label>Loại media</label>
              <AppSelect
                width="100%"
                value={mediaType}
                options={[
                  { value: "all", label: "Tất cả" },
                  { value: "video", label: "Video" },
                  { value: "image", label: "Hình ảnh" },
                  { value: "audio", label: "Âm thanh" },
                ]}
                onChange={(value) => {
                  setMediaType(value);
                  setCurrentPage(1);
                }}
              />
            </AppFilterField>

            <AppFilterField width={210}>
              <label>Trạng thái nguồn thông tin</label>
              <AppSelect
                width="100%"
                value={sourceStatus}
                options={[
                  { value: "all", label: "Tất cả" },
                  { value: "active", label: "Hoạt động" },
                  {
                    value: "inactive",
                    label: "Ngưng hoạt động",
                  },
                ]}
                onChange={(value) => {
                  setSourceStatus(value);
                  setCurrentPage(1);
                }}
              />
            </AppFilterField>

            <AppFilterField width={210}>
              <label>Ngày tạo</label>
              <AppDatePicker
                width="100%"
                value={createdDate}
                onChange={(date) => {
                  setCreatedDate(dayjs.isDayjs(date) ? date : null);
                  setCurrentPage(1);
                }}
              />
            </AppFilterField>

            <AppFilterField width={226}>
              <label>Từ khóa</label>
              <AppSearch
                width="100%"
                placeholder="Tên media/người tạo"
                value={keyword}
                onChange={(value) => {
                  setKeyword(value);
                  setCurrentPage(1);
                }}
              />
            </AppFilterField>
          </AppFilter>
        </div>

        {paginatedMedia.length > 0 ? (
          <div className="facility-media__grid">
            {paginatedMedia.map((media) => (
              <MediaCard
                key={media.id}
                media={media}
                selected={selectedIds.includes(media.id)}
                onSelect={handleSelect}
                onView={handleViewMedia}
                onEdit={handleEditMedia}
                onShare={handleShareMedia}
                onDownload={handleDownloadMedia}
              />
            ))}
          </div>
        ) : (
          <div className="facility-media__empty">
            Không tìm thấy Media phù hợp
          </div>
        )}

        <div className="facility-media__pagination">
          <AppPagination
            current={safePage}
            pageSize={PAGE_SIZE}
            total={total}
            onChange={setCurrentPage}
          />
        </div>
      </section>

      <FacilityMediaFormModal
        open={openCreate}
        mode="create"
        categories={categoryOptions
          .filter((option) => option.value !== "all")
          .map((option) => option.value)}
        loading={saving}
        onCancel={onCloseCreate}
        onSubmit={handleSaveMedia}
      />

      <FacilityMediaFormModal
        open={editMedia !== null}
        mode="edit"
        initialValues={editMedia}
        categories={categoryOptions
          .filter((option) => option.value !== "all")
          .map((option) => option.value)}
        loading={saving}
        onCancel={() => setEditMedia(null)}
        onSubmit={handleSaveMedia}
      />

      <AppConfirmModal
        open={deleteModalOpen}
        type="delete"
        title="Xóa Media"
        description={`Bạn có chắc chắn muốn xóa ${selectedIds.length} Media đã chọn?`}
        confirmText="Xóa"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}

export default FacilityMedia;
