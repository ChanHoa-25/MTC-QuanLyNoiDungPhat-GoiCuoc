import { useCallback, useEffect, useMemo, useState } from "react";
import type { Key } from "react";
import type { TableColumnsType } from "antd";
import { Form, message } from "antd";
import { Info, ListX, Trash2 } from "lucide-react";

import AppFilter, {
  AppFilterField,
} from "../../../../components/common/AppFilter";
import AppSelect from "../../../../components/common/AppSelect";
import AppSearch from "../../../../components/common/AppSearch";
import AppDateRangePicker from "../../../../components/common/AppDateRangePicker";
import type { DateRangeValue } from "../../../../components/common/AppDateRangePicker";
import AppStatusTag from "../../../../components/common/AppStatusTag";
import AppTableActions from "../../../../components/common/AppTableActions";
import AppConfirmModal from "../../../../components/common/AppConfirmModal";

import PlaylistUsedNews from "../../../../components/playlists/PlaylistUsedNews/PlaylistUsedNews";

import { useActionPanel } from "../../../../contexts/ActionPanelContext";
import type { AppActionPanelItem } from "../../../../components/common/AppActionPanel";

import { MOCK_PLAYLIST_USED_NEWS } from "../data/sourcePlaylists.mock";
import type { SourceUsedNewsItem } from "../../types/sourceUsedNews.types";

interface SourcePlaylistUsedNewsProps {
  playlistId: string;
}

type LinkedNews = SourceUsedNewsItem & {
  playlistId?: string;
};

const newsTypeOptions = [
  { label: "Tất cả", value: "all" },
  { label: "Tin ưu tiên", value: "urgent" },
  { label: "Tin thường", value: "normal" },
];

const approvalOptions = [
  { label: "Tất cả", value: "all" },
  { label: "Chờ duyệt", value: "pending" },
  { label: "Đã duyệt", value: "approved" },
  { label: "Từ chối duyệt", value: "rejected" },
];

const broadcastOptions = [
  { label: "Tất cả", value: "all" },
  { label: "Chờ phát", value: "waiting" },
  { label: "Đang phát", value: "playing" },
  { label: "Tạm ngưng", value: "paused" },
  { label: "Đã kết thúc", value: "ended" },
  { label: "Đã hủy", value: "cancelled" },
];

const repeatOptions = [
  { label: "Tất cả", value: "all" },
  { label: "Không lặp", value: "none" },
  { label: "Hàng ngày", value: "daily" },
  { label: "Hàng tuần", value: "weekly" },
  { label: "Hàng tháng", value: "monthly" },
];

const newsTypeLabels: Record<string, string> = {
  urgent: "Tin ưu tiên",
  normal: "Tin thường",
};

const approvalLabels: Record<string, string> = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Từ chối duyệt",
};

const broadcastLabels: Record<string, string> = {
  waiting: "Chờ phát",
  playing: "Đang phát",
  paused: "Tạm ngưng",
  ended: "Đã kết thúc",
  cancelled: "Đã hủy",
};

const repeatLabels: Record<string, string> = {
  none: "Không lặp",
  daily: "Hàng ngày",
  weekly: "Hàng tuần",
  monthly: "Hàng tháng",
};

const approvalVariants = {
  pending: "yellow",
  approved: "blue",
  rejected: "red",
} as const;

const broadcastVariants = {
  waiting: "darkRed",
  playing: "blue",
  paused: "yellow",
  ended: "gray",
  cancelled: "red",
} as const;

const repeatVariants = {
  none: "green",
  daily: "yellow",
  weekly: "blue",
  monthly: "orange",
} as const;

function SourcePlaylistUsedNews({ playlistId }: SourcePlaylistUsedNewsProps) {
  const { setActions } = useActionPanel();

  const [news, setNews] = useState<LinkedNews[]>(() =>
    MOCK_PLAYLIST_USED_NEWS.filter(
      (item: LinkedNews) => item.playlistId === playlistId,
    ),
  );

  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);

  const [newsType, setNewsType] = useState("all");
  const [approval, setApproval] = useState("all");
  const [broadcast, setBroadcast] = useState("all");
  const [repeat, setRepeat] = useState("all");
  const [dateRange, setDateRange] = useState<DateRangeValue>([null, null]);
  const [keyword, setKeyword] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    setNews(
      MOCK_PLAYLIST_USED_NEWS.filter(
        (item: LinkedNews) => item.playlistId === playlistId,
      ),
    );
    setSelectedRowKeys([]);
    setNewsType("all");
    setApproval("all");
    setBroadcast("all");
    setRepeat("all");
    setDateRange([null, null]);
    setKeyword("");
    setDeleteModalOpen(false);
  }, [playlistId]);

  const filteredNews = useMemo(() => {
    const search = keyword.trim().toLowerCase();
    const [startDate, endDate] = dateRange;

    return news.filter((item) => {
      if (newsType !== "all" && item.type !== newsType) {
        return false;
      }

      if (approval !== "all" && item.approvalStatus !== approval) {
        return false;
      }

      if (broadcast !== "all" && item.playStatus !== broadcast) {
        return false;
      }

      if (repeat !== "all" && item.repeatType !== repeat) {
        return false;
      }

      if (search) {
        const searchableText =
          `${item.code} ${item.title} ${item.facilityName}`.toLowerCase();

        if (!searchableText.includes(search)) {
          return false;
        }
      }

      if (startDate || endDate) {
        const firstDate = item.broadcastDate.split(" - ")[0].trim();

        const parts = firstDate.split("/");

        if (parts.length !== 3) return false;

        const date = new Date(
          Number(parts[2]),
          Number(parts[1]) - 1,
          Number(parts[0]),
        );

        if (Number.isNaN(date.getTime())) return false;

        if (startDate && date < startDate.startOf("day").toDate()) {
          return false;
        }

        if (endDate && date > endDate.endOf("day").toDate()) {
          return false;
        }
      }

      return true;
    });
  }, [news, newsType, approval, broadcast, repeat, dateRange, keyword]);

  const handleDelete = useCallback(() => {
    if (selectedRowKeys.length === 0) {
      message.warning("Vui lòng chọn bản tin cần xóa");
      return;
    }

    setDeleteModalOpen(true);
  }, [selectedRowKeys.length]);

  const handleConfirmDelete = () => {
    const selectedIds = new Set(selectedRowKeys.map(String));

    setNews((previous) => previous.filter((item) => !selectedIds.has(item.id)));

    setSelectedRowKeys([]);
    setDeleteModalOpen(false);

    message.success("Đã xóa bản tin được chọn khỏi danh sách hiển thị");
  };

  const handleClearSelection = useCallback(() => {
    setSelectedRowKeys([]);
  }, []);

  useEffect(() => {
    const actions: AppActionPanelItem[] = [
      {
        key: "delete-used-news",
        icon: <Trash2 />,
        tooltip: "Xóa bản tin đã chọn",
        danger: true,
        disabled: selectedRowKeys.length === 0,
        onClick: handleDelete,
      },
      {
        key: "clear-used-news-selection",
        icon: <ListX />,
        tooltip: "Bỏ chọn bản tin",
        disabled: selectedRowKeys.length === 0,
        onClick: handleClearSelection,
      },
    ];

    setActions(actions);
  }, [setActions, selectedRowKeys.length, handleDelete, handleClearSelection]);

  useEffect(() => {
    return () => setActions([]);
  }, [setActions]);

  const columns: TableColumnsType<LinkedNews> = [
    {
      title: "Mã bản tin",
      dataIndex: "code",
      key: "code",
      width: 110,
      ellipsis: true,
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      width: 190,
      ellipsis: true,
    },
    {
      title: "Loại bản tin",
      key: "type",
      width: 115,
      render: (_, record) => (
        <AppStatusTag
          type="label"
          variant={record.type === "urgent" ? "green" : "blue"}
          label={newsTypeLabels[record.type] ?? record.type}
        />
      ),
    },
    {
      title: "Trạng thái duyệt",
      key: "approvalStatus",
      width: 130,
      render: (_, record) => (
        <AppStatusTag
          variant={broadcastVariants[record.playStatus]}
          label={approvalLabels[record.approvalStatus] ?? record.approvalStatus}
        />
      ),
    },
    {
      title: "Trạng thái phát",
      key: "playStatus",
      width: 125,
      render: (_, record) => (
        <AppStatusTag
          variant={broadcastVariants[record.playStatus]}
          label={broadcastLabels[record.playStatus] ?? record.playStatus}
        />
      ),
    },
    {
      title: "Kiểu lặp",
      key: "repeatType",
      width: 135,
      render: (_, record) => (
        <AppStatusTag
          type="label"
          variant={repeatVariants[record.repeatType]}
          label={repeatLabels[record.repeatType] ?? record.repeatType}
        />
      ),
    },
    {
      title: "Ngày phát",
      dataIndex: "broadcastDate",
      key: "broadcastDate",
      width: 160,
    },
    {
      title: "Giờ phát",
      dataIndex: "broadcastTime",
      key: "broadcastTime",
      width: 160,
    },
    {
      title: "Cơ sở phát",
      dataIndex: "facilityName",
      key: "facilityName",
      width: 150,
      ellipsis: true,
    },
    {
      title: "Người tạo",
      dataIndex: "createdBy",
      key: "createdBy",
      width: 130,
      ellipsis: true,
    },
    {
      title: "Hành động",
      key: "actions",
      width: 100,
      align: "right",
      render: (_, record) => (
        <AppTableActions
          actions={[
            {
              key: "detail",
              icon: <Info />,
              tooltip: "Xem chi tiết bản tin",
              onClick: () => message.info(`Chi tiết: ${record.code}`),
            },
          ]}
        />
      ),
    },
  ];

  const filters = (
    <AppFilter showActions={false} gap={10}>
      <AppFilterField width="13%">
        <Form.Item label="Loại bản tin">
          <AppSelect
            width="100%"
            value={newsType}
            onChange={setNewsType}
            options={newsTypeOptions}
          />
        </Form.Item>
      </AppFilterField>

      <AppFilterField width="13%">
        <Form.Item label="Trạng thái duyệt">
          <AppSelect
            width="100%"
            value={approval}
            onChange={setApproval}
            options={approvalOptions}
          />
        </Form.Item>
      </AppFilterField>

      <AppFilterField width="13%">
        <Form.Item label="Trạng thái phát">
          <AppSelect
            width="100%"
            value={broadcast}
            onChange={setBroadcast}
            options={broadcastOptions}
          />
        </Form.Item>
      </AppFilterField>

      <AppFilterField width="13%">
        <Form.Item label="Kiểu lặp">
          <AppSelect
            width="100%"
            value={repeat}
            onChange={setRepeat}
            options={repeatOptions}
          />
        </Form.Item>
      </AppFilterField>

      <AppFilterField width="25%">
        <Form.Item label="Thời gian bắt đầu phát">
          <AppDateRangePicker
            width="100%"
            value={dateRange}
            onChange={setDateRange}
          />
        </Form.Item>
      </AppFilterField>

      <AppFilterField width="19%">
        <Form.Item label="Từ khóa">
          <AppSearch
            width="100%"
            value={keyword}
            onChange={setKeyword}
            placeholder="Nhập mã hoặc tiêu đề bản tin"
            allowClear
          />
        </Form.Item>
      </AppFilterField>
    </AppFilter>
  );

  return (
    <>
      <PlaylistUsedNews<LinkedNews>
        tableKey={playlistId}
        data={filteredNews}
        columns={columns}
        selectedRowKeys={selectedRowKeys}
        onSelectionChange={setSelectedRowKeys}
        filters={filters}
      />

      <AppConfirmModal
        open={deleteModalOpen}
        type="delete"
        title="Xóa bản tin đã chọn?"
        description={`Bạn có chắc chắn muốn xóa ${selectedRowKeys.length} bản tin đã chọn khỏi danh sách hiển thị?`}
        confirmText="Xóa"
        cancelText="Hủy"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </>
  );
}

export default SourcePlaylistUsedNews;
