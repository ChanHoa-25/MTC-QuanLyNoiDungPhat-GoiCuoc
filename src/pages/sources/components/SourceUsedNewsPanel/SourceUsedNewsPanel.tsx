import { useMemo, useState } from "react";
import type { Key } from "react";
import { Form, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";

import AppTable from "../../../../components/common/AppTable";
import AppStatusTag from "../../../../components/common/AppStatusTag";
import AppSelect from "../../../../components/common/AppSelect";
import AppSearch from "../../../../components/common/AppSearch";
import AppDateRangePicker from "../../../../components/common/AppDateRangePicker";
import type { DateRangeValue } from "../../../../components/common/AppDateRangePicker";
import AppFilter, { AppFilterField } from "../../../../components/common/AppFilter";
import AppConfirmModal from "../../../../components/common/AppConfirmModal";

import type {
  BroadcastApprovalStatus,
  BroadcastPlayStatus,
  BroadcastRepeatType,
  BroadcastType,
  SourceUsedNewsAction,
  SourceUsedNewsItem,
} from "../../types/sourceUsedNews.types";
import "./SourceUsedNewsPanel.css";

/**
 * Panel "Bản tin sử dụng" dùng chung cho chi tiết Bản mẫu và chi tiết Danh sách phát.
 *
 * - Trang cha quản lý ActionPanel (nút xóa / hủy) và truyền `pendingAction` xuống
 *   để panel mở popup xác nhận tương ứng.
 * - Danh sách `items` do trang cha giữ (hiện là mock, sau này lấy từ API bản tin).
 */
interface SourceUsedNewsPanelProps {
  title: string;
  items: SourceUsedNewsItem[];
  onItemsChange: (items: SourceUsedNewsItem[]) => void;
  selectedKeys: Key[];
  onSelectedKeysChange: (keys: Key[]) => void;
  pendingAction: SourceUsedNewsAction | null;
  onPendingActionChange: (action: SourceUsedNewsAction | null) => void;
}

const ALL = "all";

const NEWS_TYPE_OPTIONS = [
  { label: "Tất cả", value: ALL },
  { label: "Tin ưu tiên", value: "urgent" },
  { label: "Tin thường", value: "normal" },
];

const APPROVAL_OPTIONS = [
  { label: "Tất cả", value: ALL },
  { label: "Đã duyệt", value: "approved" },
  { label: "Chờ duyệt", value: "pending" },
  { label: "Từ chối duyệt", value: "rejected" },
];

const PLAY_STATUS_OPTIONS = [
  { label: "Tất cả", value: ALL },
  { label: "Đang phát", value: "playing" },
  { label: "Tạm ngưng", value: "paused" },
  { label: "Chờ phát", value: "waiting" },
  { label: "Đã kết thúc", value: "ended" },
  { label: "Đã hủy", value: "cancelled" },
];

const REPEAT_OPTIONS = [
  { label: "Tất cả", value: ALL },
  { label: "Không lặp", value: "none" },
  { label: "Hàng ngày", value: "daily" },
  { label: "Ngày trong tuần", value: "weekly" },
  { label: "Ngày trong tháng", value: "monthly" },
];

/** Lấy ngày bắt đầu phát từ chuỗi "DD/MM/YYYY - DD/MM/YYYY". */
function parseStartDate(broadcastDate: string) {
  const [start] = broadcastDate.split("-").map((part) => part.trim());
  const [d, m, y] = (start ?? "").split("/");
  if (!d || !m || !y) return null;
  const parsed = dayjs(`${y}-${m}-${d}`);
  return parsed.isValid() ? parsed : null;
}

function renderApproval(status: BroadcastApprovalStatus) {
  if (status === "approved") return <AppStatusTag variant="blue" label="Đã duyệt" />;
  if (status === "pending") return <AppStatusTag variant="yellow" label="Chờ duyệt" />;
  return <AppStatusTag variant="red" label="Từ chối duyệt" />;
}

function renderPlayStatus(status: BroadcastPlayStatus, approval: BroadcastApprovalStatus) {
  // Bản tin chưa được duyệt thì chưa có trạng thái phát
  if (approval !== "approved") return null;
  if (status === "playing") return <AppStatusTag variant="blue" label="Đang phát" />;
  if (status === "paused") return <AppStatusTag variant="yellow" label="Tạm ngưng" />;
  if (status === "waiting") return <AppStatusTag variant="orange" label="Chờ phát" />;
  if (status === "ended") return <AppStatusTag variant="gray" label="Đã kết thúc" />;
  return <AppStatusTag variant="red" label="Đã hủy" />;
}

function renderRepeat(repeat: BroadcastRepeatType) {
  if (repeat === "daily") return <span className="used-news-repeat used-news-repeat--yellow">Hàng ngày</span>;
  if (repeat === "weekly") return <span className="used-news-repeat used-news-repeat--blue">Ngày trong tuần</span>;
  if (repeat === "monthly") return <span className="used-news-repeat used-news-repeat--orange">Ngày trong tháng</span>;
  return <span>-</span>;
}

export default function SourceUsedNewsPanel({
  title,
  items,
  onItemsChange,
  selectedKeys,
  onSelectedKeysChange,
  pendingAction,
  onPendingActionChange,
}: SourceUsedNewsPanelProps) {
  const [messageApi, contextHolder] = message.useMessage();

  const [newsType, setNewsType] = useState(ALL);
  const [approvalStatus, setApprovalStatus] = useState(ALL);
  const [playStatus, setPlayStatus] = useState(ALL);
  const [repeatType, setRepeatType] = useState(ALL);
  const [dateRange, setDateRange] = useState<DateRangeValue>([null, null]);
  const [keyword, setKeyword] = useState("");

  const filteredItems = useMemo(() => {
    const search = keyword.trim().toLowerCase();
    const [from, to] = dateRange;

    return items.filter((item) => {
      if (newsType !== ALL && item.type !== newsType) return false;
      if (approvalStatus !== ALL && item.approvalStatus !== approvalStatus) return false;
      if (playStatus !== ALL && item.playStatus !== playStatus) return false;
      if (repeatType !== ALL && item.repeatType !== repeatType) return false;

      if (from || to) {
        const start = parseStartDate(item.broadcastDate);
        if (!start) return false;
        if (from && start.isBefore(from, "day")) return false;
        if (to && start.isAfter(to, "day")) return false;
      }

      if (
        search &&
        !item.title.toLowerCase().includes(search) &&
        !item.code.toLowerCase().includes(search)
      ) {
        return false;
      }
      return true;
    });
  }, [items, newsType, approvalStatus, playStatus, repeatType, dateRange, keyword]);

  const columns: ColumnsType<SourceUsedNewsItem> = [
    { title: "Mã bản tin", dataIndex: "code", key: "code", width: 110 },
    { title: "Tiêu đề", dataIndex: "title", key: "title", ellipsis: true },
    {
      title: "Loại bản tin",
      dataIndex: "type",
      key: "type",
      width: 120,
      render: (type: BroadcastType) =>
        type === "urgent" ? (
          <AppStatusTag type="label" variant="green" label="Tin ưu tiên" />
        ) : (
          <AppStatusTag type="label" variant="blue" label="Tin thường" />
        ),
    },
    {
      title: "Trạng thái duyệt",
      dataIndex: "approvalStatus",
      key: "approvalStatus",
      width: 140,
      render: (status: BroadcastApprovalStatus) => renderApproval(status),
    },
    {
      title: "Trạng thái phát",
      dataIndex: "playStatus",
      key: "playStatus",
      width: 130,
      render: (status: BroadcastPlayStatus, record: SourceUsedNewsItem) =>
        renderPlayStatus(status, record.approvalStatus),
    },
    {
      title: "Kiểu lặp",
      dataIndex: "repeatType",
      key: "repeatType",
      width: 140,
      render: (repeat: BroadcastRepeatType) => renderRepeat(repeat),
    },
    { title: "Ngày phát", dataIndex: "broadcastDate", key: "broadcastDate", width: 170 },
    { title: "Giờ phát", dataIndex: "broadcastTime", key: "broadcastTime", width: 160 },
    {
      title: "Cơ sở phát",
      dataIndex: "facilityName",
      key: "facilityName",
      width: 150,
      ellipsis: true,
    },
    { title: "Người tạo", dataIndex: "createdBy", key: "createdBy", width: 130 },
  ];

  const closeModal = () => onPendingActionChange(null);

  const handleConfirmDelete = () => {
    onItemsChange(items.filter((item) => !selectedKeys.includes(item.id)));
    onSelectedKeysChange([]);
    closeModal();
    messageApi.success("Đã xóa bản tin thành công!");
  };

  const handleConfirmCancel = () => {
    onItemsChange(
      items.map((item) =>
        selectedKeys.includes(item.id) ? { ...item, playStatus: "cancelled" } : item,
      ),
    );
    onSelectedKeysChange([]);
    closeModal();
    messageApi.success("Đã hủy bản tin thành công!");
  };

  return (
    <div className="source-used-news-panel">
      {contextHolder}
      <h2 className="source-used-news-panel__title">{title}</h2>

      <AppFilter showActions={false} gap={14}>
        <AppFilterField width={140}>
          <Form.Item label="Loại bản tin">
            <AppSelect
              value={newsType}
              onChange={(value: unknown) => setNewsType(String(value))}
              options={NEWS_TYPE_OPTIONS}
              width="100%"
            />
          </Form.Item>
        </AppFilterField>

        <AppFilterField width={150}>
          <Form.Item label="Trạng thái duyệt">
            <AppSelect
              value={approvalStatus}
              onChange={(value: unknown) => setApprovalStatus(String(value))}
              options={APPROVAL_OPTIONS}
              width="100%"
            />
          </Form.Item>
        </AppFilterField>

        <AppFilterField width={150}>
          <Form.Item label="Trạng thái phát">
            <AppSelect
              value={playStatus}
              onChange={(value: unknown) => setPlayStatus(String(value))}
              options={PLAY_STATUS_OPTIONS}
              width="100%"
            />
          </Form.Item>
        </AppFilterField>

        <AppFilterField width={150}>
          <Form.Item label="Kiểu lặp">
            <AppSelect
              value={repeatType}
              onChange={(value: unknown) => setRepeatType(String(value))}
              options={REPEAT_OPTIONS}
              width="100%"
            />
          </Form.Item>
        </AppFilterField>

        <AppFilterField width={300}>
          <Form.Item label="Thời gian bắt đầu phát">
            <AppDateRangePicker
              value={dateRange}
              onChange={(dates: DateRangeValue) => setDateRange(dates)}
              width="100%"
            />
          </Form.Item>
        </AppFilterField>

        <AppFilterField width={220}>
          <Form.Item label="Từ khóa">
            <AppSearch
              placeholder="Mã / tiêu đề bản tin"
              value={keyword}
              onChange={(value: string) => setKeyword(value)}
              onSearch={(value: string) => setKeyword(value)}
              width="100%"
            />
          </Form.Item>
        </AppFilterField>
      </AppFilter>

      <div className="source-used-news-panel__table">
        <AppTable<SourceUsedNewsItem>
          columns={columns}
          dataSource={filteredItems}
          rowKey="id"
          selectedLabel="bản tin"
          scroll={{ x: 1300 }}
          locale={{ emptyText: "Chưa có bản tin nào sử dụng" }}
          rowSelection={{
            selectedRowKeys: selectedKeys,
            onChange: (keys: Key[]) => onSelectedKeysChange(keys),
          }}
          pagination={{ pageSize: 10 }}
        />
      </div>

      <AppConfirmModal
        open={pendingAction === "delete"}
        type="delete"
        title="Xác nhận xóa bản tin"
        description={`Các bản tin được chọn (${selectedKeys.length}) sẽ bị xóa khỏi danh sách và không thể khôi phục.`}
        confirmText="Tiếp tục"
        cancelText="Hủy"
        onConfirm={handleConfirmDelete}
        onCancel={closeModal}
      />

      <AppConfirmModal
        open={pendingAction === "cancel"}
        type="restart"
        title="Xác nhận hủy bản tin"
        description={`Bạn có chắc chắn muốn hủy ${selectedKeys.length} bản tin đã chọn?`}
        confirmText="Tiếp tục"
        cancelText="Hủy"
        onConfirm={handleConfirmCancel}
        onCancel={closeModal}
      />
    </div>
  );
}

