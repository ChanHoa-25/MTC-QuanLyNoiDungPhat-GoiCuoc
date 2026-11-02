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

import { createSiteMediaMock } from "../../data/siteMedia.mock";
import type { SiteMediaItem } from "../../types/siteMedia.types";

import "./SiteMedia.css";
import AppFilter, {
  AppFilterField,
} from "../../../../components/common/AppFilter";

interface SiteMediaProps {
  siteId: string;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  openCreate: boolean;
  onCloseCreate: () => void;
  deleteRequestId: number;
  approveRequestId: number;
  onShare?: () => void;
}

const PAGE_SIZE = 8;

function SiteMedia({
  siteId,
  selectedIds,
  onSelectionChange,
  openCreate,
  onCloseCreate,
  deleteRequestId,
  approveRequestId,
  onShare,
}: SiteMediaProps) {
  const [mediaList, setMediaList] = useState<SiteMediaItem[]>(() =>
    createSiteMediaMock(siteId),
  );

  const [category, setCategory] = useState("all");
  const [mediaType, setMediaType] = useState("all");
  const [sourceStatus, setSourceStatus] = useState("all");
  const [createdDate, setCreatedDate] = useState<Dayjs | null>(null);
  const [keyword, setKeyword] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Đổi cơ sở
  useEffect(() => {
    setMediaList(createSiteMediaMock(siteId));
    onSelectionChange([]);
    setCurrentPage(1);
    setDeleteModalOpen(false);
  }, [siteId]); // Chỉ chạy khi đổi cơ sở

  // Danh sách lĩnh vực
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

  // Lọc Media
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

  // Phân trang
  const total = filteredMedia.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedMedia = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredMedia.slice(start, start + PAGE_SIZE);
  }, [filteredMedia, safePage]);

  // Chọn Media
  const handleSelect = (id: string, checked: boolean) => {
    const nextSelectedIds = checked
      ? [...new Set([...selectedIds, id])]
      : selectedIds.filter((item) => item !== id);

    onSelectionChange(nextSelectedIds);
  };

  // Xóa Media
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

  // Duyệt Media
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

  // Thêm Media (chưa có form)
  useEffect(() => {
    if (!openCreate) return;

    message.info("Chức năng thêm Media đang được phát triển");
    onCloseCreate();
  }, [openCreate]);

  // Nhận yêu cầu xóa từ SitesPage
  useEffect(() => {
    if (deleteRequestId <= 0) return;

    if (selectedIds.length === 0) {
      message.warning("Vui lòng chọn Media cần xóa");
      return;
    }

    setDeleteModalOpen(true);
  }, [deleteRequestId]);

  // Nhận yêu cầu duyệt từ SitesPage
  useEffect(() => {
    if (approveRequestId <= 0) return;
    handleApproveMedia();
  }, [approveRequestId]);

  // Các thao tác trên Card
  const handleViewMedia = (media: SiteMediaItem) => {
    message.info(`Xem chi tiết: ${media.title}`);
  };

  const handleEditMedia = (media: SiteMediaItem) => {
    message.info(`Chỉnh sửa: ${media.title}`);
  };

  const handleShareMedia = (media: SiteMediaItem) => {
    console.log("Media được chia sẻ:", media);
    onShare?.();
  };
  const handleDownloadMedia = (media: SiteMediaItem) => {
    if (!media.url) {
      message.warning("Media chưa có đường dẫn tải xuống");
      return;
    }

    window.open(media.url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="site-media-layout">
      <section className="site-media">
        {/* Tiêu đề */}
        <h2 className="site-media__heading">Danh sách Media</h2>

        {/* Bộ lọc */}

        <div className="site-media__filters">
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

        {/* Danh sách Media */}
        {paginatedMedia.length > 0 ? (
          <div className="site-media__grid">
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
          <div className="site-media__empty">Không tìm thấy Media phù hợp</div>
        )}

        {/* Phân trang */}
        <div className="site-media__pagination">
          <AppPagination
            current={safePage}
            pageSize={PAGE_SIZE}
            total={total}
            onChange={setCurrentPage}
          />
        </div>
      </section>

      {/* Modal xác nhận xóa */}
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

export default SiteMedia;
