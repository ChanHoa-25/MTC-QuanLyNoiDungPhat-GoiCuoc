import { useCallback, useEffect, useMemo, useState } from "react";
import { Form, message } from "antd";
import dayjs from "dayjs";
import { FileCheckCorner, Plus, RefreshCw, Trash2 } from "lucide-react";
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
import SourceMediaQuickPreview from "./components/SourceMediaQuickPreview";
import { useSourceMediaStore } from "./data/sourceMedia.store";
import type { SourceMediaItem } from "./types/sourceMedia.types";

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
  { label: "Từ chối duyệt", value: "rejected" },
];

function SourceMediaPage() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const { setActions } = useActionPanel();

  const { mediaItems, deleteMediaByIds, updateApproval } =
    useSourceMediaStore();

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

  // Trạng thái popup xác nhận
  const [deleteTargetIds, setDeleteTargetIds] = useState<string[]>([]);
  const [approveModalOpen, setApproveModalOpen] = useState(false);

  const categoryOptions = useMemo(() => {
    const uniqueCategories = [
      ...new Set(mediaItems.map((item) => item.category)),
    ];

    return [
      { label: "Tất cả", value: "all" },
      ...uniqueCategories.map((cat) => ({
        label: cat,
        value: cat,
      })),
    ];
  }, [mediaItems]);

  const filteredMedia = useMemo(() => {
    const search = keyword.trim().toLowerCase();
    const [startDate, endDate] = dateRange;

    return mediaItems.filter((item) => {
      const matchCategory = category === "all" || item.category === category;
      const matchType = mediaType === "all" || item.type === mediaType;
      const matchStatus =
        approvalStatus === "all" || item.approvalStatus === approvalStatus;

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
    messageApi.info(
      "Gửi ảnh thiết kế Popup Thêm file media để mình hoàn thiện tiếp nhé!",
    );
  }, [messageApi]);

  const handleOpenBulkDelete = useCallback(() => {
    if (selectedIds.length === 0) return;
    setDeleteTargetIds(selectedIds);
  }, [selectedIds]);

  const handleOpenApprove = useCallback(() => {
    if (selectedIds.length === 0) return;
    setApproveModalOpen(true);
  }, [selectedIds.length]);

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
        disabled: selectedIds.length === 0,
        onClick: handleOpenBulkDelete,
      },
      {
        key: "approve-media",
        icon: <FileCheckCorner color="#34CD26" />,
        tooltip: "Duyệt media file",
        disabled: selectedIds.length === 0,
        onClick: handleOpenApprove,
      },
    ]);

    return () => {
      setActions([]);
    };
  }, [
    setActions,
    selectedIds.length,
    handleOpenAddMedia,
    handleOpenBulkDelete,
    handleOpenApprove,
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
    messageApi.success(`Đã duyệt ${count} file media thành công`);
  };

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

            <AppIconButton
              icon={<RefreshCw size={20} />}
              tooltip="Làm mới danh sách"
              size={34}
              iconSize={20}
              className="source-media-panel__refresh"
              onClick={handleResetFilters}
            />
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
                  onOpenDetail={handleOpenDetail}
                  onEdit={(item) =>
                    messageApi.info(`Cập nhật file media: ${item.title}`)
                  }
                  onShare={(item) =>
                    messageApi.info(`Chia sẻ nguồn thông tin: ${item.title}`)
                  }
                  onDelete={(item) => setDeleteTargetIds([item.id])}
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
          />
        )}
      </div>

      <AppConfirmModal
        open={deleteTargetIds.length > 0}
        type="delete"
        title="Xác nhận xóa nguồn tin"
        description={`Bạn có chắc chắn muốn xóa ${deleteTargetIds.length} nguồn media đã chọn? Thao tác này không thể hoàn tác.`}
        confirmText="Xác nhận"
        cancelText="Hủy"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTargetIds([])}
      />

      <AppConfirmModal
        open={approveModalOpen}
        type="success"
        title="Xác nhận duyệt media file"
        description={`Bạn có chắc chắn muốn phê duyệt ${selectedIds.length} file media đã chọn?`}
        confirmText="Duyệt"
        cancelText="Hủy"
        onConfirm={handleConfirmApprove}
        onCancel={() => setApproveModalOpen(false)}
      />
    </div>
  );
}

export default SourceMediaPage;
