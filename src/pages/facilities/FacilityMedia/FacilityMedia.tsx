import { useEffect, useMemo, useState } from "react";
import { Form, message } from "antd";
import dayjs from "dayjs";
import { RefreshCw } from "lucide-react";
import AppSelect from "../../../components/common/AppSelect";
import AppSearch from "../../../components/common/AppSearch";
import AppDateRangePicker from "../../../components/common/AppDateRangePicker";
import type { DateRangeValue } from "../../../components/common/AppDateRangePicker";
import AppPagination from "../../../components/common/AppPagination";
import AppFilter, {
  AppFilterField,
} from "../../../components/common/AppFilter";
import MediaCard from "../../../components/media/MediaCard/MediaCard";
import MediaFormModal from "../../../components/media/MediaFormModal/MediaFormModal";
import FacilityMediaRejectModal from "../../../components/media/MediaRejectModal/MediaRejectModal";
import FacilityMediaPreview from "../../../components/media/MediaPreview/MediaPreview";
import mediaApi from "../../../api/mediaApi";
import mediaCategoryApi from "../../../api/mediaCategoryApi";
import { mapMediaToFacilityItem } from "../utils/mediaMapper";
import type {
  FacilityMediaItem,
  FacilityMediaFormValues,
} from "../types/facilityMedia.types";
import type { MediaCategoryApiItem } from "../../../api/mediaCategoryApi";
import { useNavigate } from "react-router-dom";
import {
  MEDIA_SOURCE_TYPE,
  MEDIA_FILE_TYPE,
} from "../constants/media.constants";
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
const PAGE_SIZE = 10;
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
  { label: "Từ chối duyệt", value: "rejected" },
  { label: "Đang xử lý", value: "processing" },
];
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
  // Dữ liệu từ Backend
  const [mediaList, setMediaList] = useState<FacilityMediaItem[]>([]);
  const [categoryNames, setCategoryNames] = useState<string[]>([]);
  const [mediaCategories, setMediaCategories] = useState<
    MediaCategoryApiItem[]
  >([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  // Bộ lọc
  const [category, setCategory] = useState("all");
  const [mediaType, setMediaType] = useState("all");
  const [approvalStatus, setApprovalStatus] = useState("all");
  const [dateRange, setDateRange] = useState<DateRangeValue>([null, null]);
  const [keyword, setKeyword] = useState("");
  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  // Thêm, sửa và duyệt Media
  const [editMedia, setEditMedia] = useState<FacilityMediaItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [approving, setApproving] = useState(false);
  // Từ chối duyệt
  const [rejectMedia, setRejectMedia] = useState<FacilityMediaItem | null>(
    null,
  );
  const [rejecting, setRejecting] = useState(false);
  const navigate = useNavigate();
  const [previewMedia, setPreviewMedia] = useState<FacilityMediaItem | null>(
    null,
  );
  const handlePreviewMedia = (media: FacilityMediaItem) => {
    setPreviewMedia(media);
  };
  const handleClosePreview = () => {
    setPreviewMedia(null);
  };
  // Đặt lại trạng thái khi chuyển cơ sở
  useEffect(() => {
    setCategory("all");
    setMediaType("all");
    setApprovalStatus("all");
    setDateRange([null, null]);
    setKeyword("");
    setCurrentPage(1);
    setEditMedia(null);
    setRejectMedia(null);
    setPreviewMedia(null);
    onSelectionChange([]);
    // Chỉ reset khi facilityId thay đổi
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facilityId]);
  // Lấy Media từ Backend
  useEffect(() => {
    let cancelled = false;
    const loadMedia = async () => {
      setLoadingMedia(true);
      setMediaError(null);
      setMediaList([]);
      setCategoryNames([]);
      setMediaCategories([]);
      try {
        const [mediaResult, categoryResult] = await Promise.all([
          mediaApi.getAll(),
          mediaCategoryApi.getAll(),
        ]);
        if (cancelled) return;
        const facilityMedia = mediaResult
          .filter((item) => item.facilityId === facilityId)
          .map((item) => mapMediaToFacilityItem(item, categoryResult));
        setMediaList(facilityMedia);
        setMediaCategories(categoryResult);
        setCategoryNames(
          Array.from(new Set(categoryResult.map((item) => item.categoryName))),
        );
      } catch (error) {
        if (cancelled) return;
        console.error("Không thể tải Media:", error);
        setMediaList([]);
        setCategoryNames([]);
        setMediaCategories([]);
        setMediaError(
          "Không thể tải danh sách Media. Vui lòng kiểm tra quyền truy cập hoặc kết nối Backend.",
        );
      } finally {
        if (!cancelled) {
          setLoadingMedia(false);
        }
      }
    };
    void loadMedia();
    return () => {
      cancelled = true;
    };
  }, [facilityId, reloadKey]);
  // Danh sách lĩnh vực
  const categoryOptions = useMemo(
    () => [
      { value: "all", label: "Tất cả" },
      ...categoryNames.map((name) => ({
        value: name,
        label: name,
      })),
    ],

    [categoryNames],
  );
  // Lọc Media
  const filteredMedia = useMemo(() => {
    const searchValue = keyword.trim().toLowerCase();
    const [startDate, endDate] = dateRange;
    return mediaList.filter((media) => {
      const matchCategory = category === "all" || media.category === category;
      const matchType = mediaType === "all" || media.type === mediaType;
      const matchStatus =
        approvalStatus === "all" || media.status === approvalStatus;
      const createdDate = dayjs(media.createdAt);
      const matchDate =
        createdDate.isValid() &&
        (!startDate || !createdDate.isBefore(startDate, "day")) &&
        (!endDate || !createdDate.isAfter(endDate, "day"));
      const matchKeyword =
        !searchValue ||
        media.title.toLowerCase().includes(searchValue) ||
        (media.createdBy ?? "").toLowerCase().includes(searchValue);
      return (
        matchCategory && matchType && matchStatus && matchDate && matchKeyword
      );
    });
  }, [mediaList, category, mediaType, approvalStatus, dateRange, keyword]);
  // Phân trang
  const total = filteredMedia.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedMedia = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredMedia.slice(start, start + PAGE_SIZE);
  }, [filteredMedia, safePage]);
  // Làm mới danh sách và bộ lọc
  const handleRefresh = () => {
    setCategory("all");
    setMediaType("all");
    setApprovalStatus("all");
    setDateRange([null, null]);
    setKeyword("");
    setCurrentPage(1);
    setReloadKey((key) => key + 1);
  };
  // Chọn Media
  const handleSelect = (id: string, checked: boolean) => {
    const next = checked
      ? Array.from(new Set([...selectedIds, id]))
      : selectedIds.filter((item) => item !== id);
    onSelectionChange(next);
  };
  // Thêm hoặc cập nhật Media
  const handleSaveMedia = async (values: FacilityMediaFormValues) => {
    if (saving) return;
    const currentMedia = editMedia;
    const isEdit = currentMedia !== null;
    const contentType = isEdit ? currentMedia.contentType : values.contentType;
    if (!contentType) {
      message.error("Không xác định được phương thức Media.");
      return;
    }
    if (contentType === "file") {
      message.warning("Chức năng tải tệp đang chờ tích hợp API upload.");
      return;
    }
    const selectedCategory = mediaCategories.find(
      (item) => item.categoryName === values.category,
    );
    if (!selectedCategory) {
      message.error("Không tìm thấy lĩnh vực đã chọn.");
      return;
    }
    const contentValue = values.contentValue?.trim() ?? "";
    if (!contentValue) {
      message.error("Vui lòng nhập nội dung Media.");
      return;
    }
    let fileType: string;
    let sourceType: number;
    const sourceData: {
      sourceUrl?: string;
      url?: string;
      frequencyHz?: number;
    } = {};
    switch (contentType) {
      case "url": {
        fileType = isEdit
          ? (currentMedia.fileType ?? values.fileType ?? "")
          : (values.fileType ?? "");
        if (!["Image", "Audio", "Video"].includes(fileType)) {
          message.error("Vui lòng chọn loại Media hợp lệ.");
          return;
        }
        sourceType = MEDIA_SOURCE_TYPE.URL_DOWNLOAD;
        sourceData.sourceUrl = contentValue;
        break;
      }
      case "live": {
        fileType = MEDIA_FILE_TYPE.LIVE_STREAM;
        sourceType = MEDIA_SOURCE_TYPE.STREAM_URL;
        sourceData.url = contentValue;
        break;
      }
      case "frequency": {
        const frequency = Number(contentValue);
        if (!Number.isFinite(frequency) || frequency <= 0) {
          message.error("Tần số phải lớn hơn 0.");
          return;
        }
        fileType = MEDIA_FILE_TYPE.FREQUENCY;
        sourceType = MEDIA_SOURCE_TYPE.FREQUENCY_CHANNEL;
        sourceData.frequencyHz = frequency;
        break;
      }
      default:
        message.error("Phương thức Media không hợp lệ.");
        return;
    }
    if (isEdit && currentMedia.sourceType !== sourceType) {
      message.error("Không được thay đổi phương thức nguồn Media.");
      return;
    }
    const payload = {
      mediaName: values.title.trim(),
      fileType,
      sourceType,
      facilityId: isEdit ? currentMedia.facilityId : facilityId,
      categoryId: selectedCategory.id,
      ...sourceData,
    };
    if (!payload.facilityId) {
      message.error("Không xác định được cơ sở của Media.");
      return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        await mediaApi.update(currentMedia.id, payload);
        message.success("Cập nhật Media thành công!");
        setEditMedia(null);
      } else {
        await mediaApi.create(payload);
        message.success("Thêm Media thành công!");
        onCloseCreate();
      }
      setCurrentPage(1);
      setReloadKey((key) => key + 1);
    } catch (error) {
      console.error("Lỗi khi lưu Media:", error);
      message.error(
        isEdit
          ? "Không thể cập nhật Media. Vui lòng kiểm tra dữ liệu hoặc quyền truy cập."
          : "Không thể thêm Media. Vui lòng kiểm tra dữ liệu hoặc quyền truy cập.",
      );
    } finally {
      setSaving(false);
    }
  };
  // Xóa Media: chờ API Backend
  useEffect(() => {
    if (deleteRequestId <= 0) return;
    message.warning(
      "Chưa có API xóa Media. Không thể xóa dữ liệu trên Backend.",
    );
  }, [deleteRequestId]);
  // Duyệt Media được chọn
  useEffect(() => {
    if (approveRequestId <= 0 || approving) {
      return;
    }
    const selectedMedia = mediaList.filter((media) =>
      selectedIds.includes(media.id),
    );
    if (selectedMedia.length === 0) {
      message.warning("Vui lòng chọn Media cần duyệt.");
      return;
    }
    const pendingMedia = selectedMedia.filter(
      (media) => media.status === "pending",
    );
    if (pendingMedia.length === 0) {
      message.warning("Không có Media đang chờ duyệt.");
      return;
    }
    const approveSelectedMedia = async () => {
      setApproving(true);
      try {
        const results = await Promise.allSettled(
          pendingMedia.map((media) => mediaApi.approve(media.id)),
        );
        const successIds = pendingMedia
          .filter((_, index) => results[index].status === "fulfilled")
          .map((media) => media.id);
        const failedCount = results.length - successIds.length;
        if (successIds.length > 0) {
          message.success(`Đã duyệt thành công ${successIds.length} Media.`);
          onSelectionChange(
            selectedIds.filter((id) => !successIds.includes(id)),
          );
          setReloadKey((key) => key + 1);
        }
        if (failedCount > 0) {
          message.error(
            `Không thể duyệt ${failedCount} Media. Vui lòng kiểm tra quyền truy cập hoặc trạng thái Media.`,
          );
        }
      } catch (error) {
        console.error("Lỗi duyệt Media:", error);
        message.error("Có lỗi xảy ra khi duyệt Media.");
      } finally {
        setApproving(false);
      }
    };
    void approveSelectedMedia();
    // Chỉ xử lý khi có yêu cầu mới từ component cha
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approveRequestId]);
  // Xem chi tiết Media
  const handleViewMedia = (media: FacilityMediaItem) => {
    navigate(
      `/facilities/${encodeURIComponent(facilityId)}/media/${encodeURIComponent(media.id)}`,
    );
  };
  // Chỉnh sửa Media
  const handleEditMedia = (media: FacilityMediaItem) => {
    if (media.status !== "pending") {
      message.warning("Chỉ có thể chỉnh sửa Media đang chờ duyệt.");
      return;
    }
    setEditMedia(media);
  };
  // Chia sẻ Media
  const handleShareMedia = (media: FacilityMediaItem) => {
    onShare?.(media);
  };
  // Tải xuống Media
  const handleDownloadMedia = (media: FacilityMediaItem) => {
    if (media.contentType === "frequency") {
      message.warning("Media tần số không có file để tải xuống.");
      return;
    }
    if (!media.url) {
      message.warning("Media chưa có đường dẫn tải xuống.");
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
  // Mở popup từ chối duyệt
  const handleRejectMedia = (media: FacilityMediaItem) => {
    if (media.status !== "pending") {
      message.warning("Chỉ có thể từ chối Media đang chờ duyệt.");
      return;
    }
    setRejectMedia(media);
  };
  // Xác nhận từ chối duyệt
  const handleConfirmRejectMedia = async (reason: string) => {
    if (!rejectMedia || rejecting) return;
    const mediaId = rejectMedia.id;
    setRejecting(true);
    try {
      await mediaApi.reject(mediaId, {
        rejectionReason: reason,
      });
      message.success("Từ chối duyệt Media thành công!");
      onSelectionChange(selectedIds.filter((id) => id !== mediaId));
      setRejectMedia(null);
      setReloadKey((key) => key + 1);
    } catch (error) {
      console.error("Lỗi từ chối duyệt Media:", error);
      message.error(
        error instanceof Error
          ? error.message
          : "Không thể từ chối duyệt Media.",
      );
    } finally {
      setRejecting(false);
    }
  };
  return (
    <div
      className={[
        "facility-media-layout",
        previewMedia ? "facility-media-layout--detail-open" : "",
      ]
        .filter(Boolean)
        .join(" ")}>
      <section className="facility-media">
        {/* Tiêu đề và làm mới */}
        <div className="facility-media__header">
          <h2 className="facility-media__heading">
            Danh sách Media cơ sở đang quản lý
          </h2>
          <button
            type="button"
            className="facility-media__refresh"
            onClick={handleRefresh}
            disabled={loadingMedia}
            title="Làm mới danh sách"
            aria-label="Làm mới danh sách Media">
            <RefreshCw size={20} />
          </button>
        </div>
        {/* Bộ lọc */}
        <div className="facility-media__filters">
          <AppFilter gap={12} showActions={false}>
            <AppFilterField width={175}>
              <Form.Item label="Lĩnh vực">
                <AppSelect
                  width="100%"
                  value={category}
                  options={categoryOptions}
                  onChange={(value) => {
                    setCategory(value);
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
                    setMediaType(value);
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
                    setApprovalStatus(value);
                    setCurrentPage(1);
                  }}
                />
              </Form.Item>
            </AppFilterField>
            <AppFilterField width={388}>
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
            <AppFilterField width={250}>
              <Form.Item label="Từ khóa">
                <AppSearch
                  width="100%"
                  placeholder="Từ khóa"
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
        {/* Danh sách Media */}
        {loadingMedia ? (
          <div className="facility-media__empty">
            Đang tải danh sách Media...
          </div>
        ) : mediaError ? (
          <div className="facility-media__empty">
            <p>{mediaError}</p>
            <button
              type="button"
              onClick={() => setReloadKey((key) => key + 1)}>
              Thử lại
            </button>
          </div>
        ) : paginatedMedia.length > 0 ? (
          <div className="facility-media__grid">
            {paginatedMedia.map((media) => (
              <MediaCard
                key={media.id}
                media={media}
                selected={selectedIds.includes(media.id)}
                onSelect={handleSelect}
                onPreview={handlePreviewMedia}
                onView={handleViewMedia}
                onEdit={handleEditMedia}
                onReject={handleRejectMedia}
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
        {/* Phân trang */}
        <div className="facility-media__pagination">
          <AppPagination
            current={safePage}
            pageSize={PAGE_SIZE}
            total={total}
            onChange={setCurrentPage}
          />
        </div>
      </section>
      {/* Popup thêm Media */}
      <MediaFormModal
        open={openCreate}
        mode="create"
        categories={categoryNames}
        loading={saving}
        onCancel={onCloseCreate}
        onSubmit={handleSaveMedia}
      />
      {/* Popup sửa Media */}
      <MediaFormModal
        open={editMedia !== null}
        mode="edit"
        initialValues={editMedia}
        categories={categoryNames}
        loading={saving}
        onCancel={() => setEditMedia(null)}
        onSubmit={handleSaveMedia}
      />
      {/* Popup từ chối duyệt */}
      <FacilityMediaRejectModal
        open={rejectMedia !== null}
        loading={rejecting}
        onCancel={() => {
          if (!rejecting) {
            setRejectMedia(null);
          }
        }}
        onConfirm={handleConfirmRejectMedia}
      />
      {previewMedia && (
        <FacilityMediaPreview
          key={previewMedia.id}
          media={previewMedia}
          onClose={handleClosePreview}
        />
      )}
    </div>
  );
}
export default FacilityMedia;
