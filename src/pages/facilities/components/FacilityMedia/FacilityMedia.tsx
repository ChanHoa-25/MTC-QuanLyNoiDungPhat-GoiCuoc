import { useEffect, useMemo, useState } from "react";
import { message } from "antd";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import AppSelect from "../../../../components/common/AppSelect";
import AppSearch from "../../../../components/common/AppSearch";
import AppDatePicker from "../../../../components/common/AppDatePicker";
import AppPagination from "../../../../components/common/AppPagination";
import AppConfirmModal from "../../../../components/common/AppConfirmModal";
import MediaCard from "./MediaCard";
import { createFacilityMediaMock } from "../../data/facilitiesMedia.mock";
import type { FacilityMediaItem } from "../../types/facilityMedia.types";
import "./FacilityMedia.css";

import AppFilter, {
  AppFilterField,
} from "../../../../components/common/AppFilter";

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
    createFacilityMediaMock(facilityId),
  );

  const [category, setCategory] = useState("all");

  const [mediaType, setMediaType] = useState("all");

  const [sourceStatus, setSourceStatus] = useState("all");

  const [createdDate, setCreatedDate] = useState<Dayjs | null>(null);

  const [keyword, setKeyword] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    setMediaList(createFacilityMediaMock(facilityId));

    setCategory("all");
    setMediaType("all");
    setSourceStatus("all");
    setCreatedDate(null);
    setKeyword("");

    onSelectionChange([]);
    setCurrentPage(1);
    setDeleteModalOpen(false);
  }, [facilityId]);

  const categoryOptions = useMemo(() => {
    const categories = [...new Set(mediaList.map((media) => media.category))];

    return [
      { value: "all", label: "Tất cả" },

      ...categories.map((item) => ({
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
    const nextSelectedIds = checked
      ? [...new Set([...selectedIds, id])]
      : selectedIds.filter((item) => item !== id);

    onSelectionChange(nextSelectedIds);
  };

  const handleConfirmDelete = () => {
    if (selectedIds.length === 0) {
      setDeleteModalOpen(false);

      return;
    }

    setMediaList((previous) =>
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

    setMediaList((previous) =>
      previous.map((media) =>
        selectedIds.includes(media.id)
          ? { ...media, status: "approved" }
          : media,
      ),
    );

    onSelectionChange([]);

    message.success("Duyệt Media thành công");
  };

  useEffect(() => {
    if (!openCreate) return;

    message.info("Chức năng thêm Media đang được phát triển");

    onCloseCreate();
  }, [openCreate]);

  useEffect(() => {
    if (deleteRequestId <= 0) return;

    if (selectedIds.length === 0) {
      message.warning("Vui lòng chọn Media cần xóa");

      return;
    }

    setDeleteModalOpen(true);
  }, [deleteRequestId]);

  useEffect(() => {
    if (approveRequestId <= 0) return;

    handleApproveMedia();
  }, [approveRequestId]);

  const handleViewMedia = (media: FacilityMediaItem) => {
    message.info(`Xem chi tiết: ${media.title}`);
  };

  const handleEditMedia = (media: FacilityMediaItem) => {
    message.info(`Chỉnh sửa: ${media.title}`);
  };

  const handleShareMedia = (media: FacilityMediaItem) => {
    console.log("Media được chia sẻ:", media);

    onShare?.(media);
  };

  const handleDownloadMedia = (media: FacilityMediaItem) => {
    if (!media.url) {
      message.warning("Media chưa có đường dẫn tải xuống");

      return;
    }

    window.open(media.url, "_blank", "noopener,noreferrer");
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

                  { value: "inactive", label: "Ngưng hoạt động" },
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
