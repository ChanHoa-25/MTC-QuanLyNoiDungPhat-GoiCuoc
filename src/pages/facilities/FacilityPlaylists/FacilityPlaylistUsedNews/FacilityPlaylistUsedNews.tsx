import { useCallback, useEffect, useMemo, useState } from "react";
import type { Key } from "react";
import type { TableColumnsType } from "antd";
import { Form, message } from "antd";
import { Info, ListX, SquarePen, Trash2 } from "lucide-react";
import dayjs from "dayjs";

import AppFilter, {
  AppFilterField,
} from "../../../../components/common/AppFilter";
import AppSelect from "../../../../components/common/AppSelect";
import AppSearch from "../../../../components/common/AppSearch";
import AppDateRangePicker from "../../../../components/common/AppDateRangePicker";
import type { DateRangeValue } from "../../../../components/common/AppDateRangePicker";
import AppTable from "../../../../components/common/AppTable";
import AppStatusTag from "../../../../components/common/AppStatusTag";
import AppTableActions from "../../../../components/common/AppTableActions";
import AppConfirmModal from "../../../../components/common/AppConfirmModal";

import { useActionPanel } from "../../../../contexts/ActionPanelContext";
import type { AppActionPanelItem } from "../../../../components/common/AppActionPanel";

import {
  createFacilityPlaylistNewsMock,
  facilityNewsTypeOptions,
  facilityNewsApprovalOptions,
  facilityNewsBroadcastOptions,
  facilityNewsRepeatOptions,
} from "../../data/facilitiesPlaylistNews.mock";

import type { FacilityPlaylistNews } from "../../types/facilityPlaylistNews.types";

import "./FacilityPlaylistUsedNews.css";

interface FacilityPlaylistUsedNewsProps {
  playlistId: string;
}

const approvalVariants = {
  "Chờ duyệt": "yellow",
  "Đã duyệt": "blue",
  "Từ chối duyệt": "red",
} as const;

const broadcastVariants = {
  "Đang phát": "blue",
  "Tạm ngưng": "yellow",
  "Chờ phát": "darkRed",
  "Đã kết thúc": "gray",
  "Chưa phát": "green",
  "Sắp tới lịch": "orange",
  "Đã hủy": "red",
} as const;

const repeatVariants = {
  "Không lặp": "green",
  "Hàng ngày": "yellow",
  "Ngày trong tuần": "blue",
  "Ngày trong tháng": "orange",
} as const;

function FacilityPlaylistUsedNews({
  playlistId,
}: FacilityPlaylistUsedNewsProps) {
  const { setActions } = useActionPanel();

  const [news, setNews] = useState<FacilityPlaylistNews[]>(() =>
    createFacilityPlaylistNewsMock(playlistId),
  );

  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);

  const [newsType, setNewsType] = useState("all");
  const [approval, setApproval] = useState("all");
  const [broadcast, setBroadcast] = useState("all");
  const [repeat, setRepeat] = useState("all");
  const [dateRange, setDateRange] = useState<DateRangeValue>([null, null]);
  const [keyword, setKeyword] = useState("");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Đổi danh sách phát thì tải lại mock và bộ lọc
  useEffect(() => {
    setNews(createFacilityPlaylistNewsMock(playlistId));
    setSelectedRowKeys([]);
    setNewsType("all");
    setApproval("all");
    setBroadcast("all");
    setRepeat("all");
    setDateRange([null, null]);
    setKeyword("");
    setDeleteModalOpen(false);
  }, [playlistId]);

  // Lọc danh sách bản tin
  const filteredNews = useMemo(() => {
    const search = keyword.trim().toLowerCase();
    const [startDate, endDate] = dateRange ?? [null, null];

    return news.filter((item) => {
      if (item.playlistId !== playlistId) return false;

      if (newsType !== "all" && item.newsType !== newsType) {
        return false;
      }

      if (approval !== "all" && item.approvalStatus !== approval) {
        return false;
      }

      if (broadcast !== "all" && item.broadcastStatus !== broadcast) {
        return false;
      }

      if (repeat !== "all" && item.repeatType !== repeat) {
        return false;
      }

      if (search) {
        const searchableText =
          `${item.code} ${item.title} ${item.facilityName}`.toLowerCase();

        if (!searchableText.includes(search)) return false;
      }

      if (startDate || endDate) {
        if (!item.startDate) return false;

        const date = dayjs(item.startDate);

        if (startDate && date.isBefore(startDate, "day")) {
          return false;
        }

        if (endDate && date.isAfter(endDate, "day")) {
          return false;
        }
      }

      return true;
    });
  }, [
    news,
    playlistId,
    newsType,
    approval,
    broadcast,
    repeat,
    dateRange,
    keyword,
  ]);

  // Mở modal xác nhận xóa
  const handleDelete = useCallback(() => {
    if (selectedRowKeys.length === 0) {
      message.warning("Vui lòng chọn bản tin cần xóa");
      return;
    }

    setDeleteModalOpen(true);
  }, [selectedRowKeys.length]);

  // Xác nhận xóa bản tin
  const handleConfirmDelete = () => {
    const selectedIds = new Set(selectedRowKeys.map(String));

    setNews((previous) => previous.filter((item) => !selectedIds.has(item.id)));

    setSelectedRowKeys([]);
    setDeleteModalOpen(false);

    message.success("Đã xóa bản tin được chọn");
  };

  // Bỏ chọn bản tin
  const handleClearSelection = useCallback(() => {
    setSelectedRowKeys([]);
  }, []);

  // Đăng ký nút thao tác trên ActionPanel
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
    return () => {
      setActions([]);
    };
  }, [setActions]);

  const columns: TableColumnsType<FacilityPlaylistNews> = [
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
      key: "newsType",
      width: 115,
      render: (_, record) => (
        <AppStatusTag
          type="label"
          variant={record.newsType === "Tin ưu tiên" ? "green" : "blue"}
          label={record.newsType}
        />
      ),
    },
    {
      title: "Trạng thái duyệt",
      key: "approvalStatus",
      width: 130,
      render: (_, record) => (
        <AppStatusTag
          variant={approvalVariants[record.approvalStatus]}
          label={record.approvalStatus}
        />
      ),
    },
    {
      title: "Trạng thái phát",
      key: "broadcastStatus",
      width: 125,
      render: (_, record) =>
        record.broadcastStatus ? (
          <AppStatusTag
            variant={broadcastVariants[record.broadcastStatus]}
            label={record.broadcastStatus}
          />
        ) : (
          "-"
        ),
    },
    {
      title: "Kiểu lặp",
      key: "repeatType",
      width: 135,
      render: (_, record) =>
        record.repeatType ? (
          <AppStatusTag
            type="label"
            variant={repeatVariants[record.repeatType]}
            label={record.repeatType}
          />
        ) : (
          "-"
        ),
    },
    {
      title: "Ngày phát",
      key: "broadcastDate",
      width: 145,
      render: (_, record) =>
        record.startDate
          ? `${dayjs(record.startDate).format("DD/MM/YYYY")}${
              record.endDate
                ? ` - ${dayjs(record.endDate).format("DD/MM/YYYY")}`
                : ""
            }`
          : "-",
    },
    {
      title: "Giờ phát",
      dataIndex: "broadcastTime",
      key: "broadcastTime",
      width: 160,
      ellipsis: true,
      render: (value?: string) => value || "-",
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
      align: "center",
      render: (_, record) => (
        <AppTableActions
          actions={[
            ...(record.approvalStatus === "Chờ duyệt"
              ? [
                  {
                    key: "edit",
                    icon: <SquarePen />,
                    tooltip: "Chỉnh sửa bản tin",
                    onClick: () => message.info(`Chỉnh sửa: ${record.code}`),
                  },
                ]
              : []),
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

  return (
    <>
      <div className="playlist-used-news">
        <div className="playlist-used-news__heading">
          <h2>Danh sách bản tin sử dụng danh sách phát</h2>
        </div>

        <AppFilter
          className="playlist-used-news__filters"
          showActions={false}
          gap={10}>
          <AppFilterField width="13%">
            <Form.Item label="Loại bản tin">
              <AppSelect
                width="100%"
                value={newsType}
                onChange={setNewsType}
                options={facilityNewsTypeOptions}
              />
            </Form.Item>
          </AppFilterField>

          <AppFilterField width="13%">
            <Form.Item label="Trạng thái duyệt">
              <AppSelect
                width="100%"
                value={approval}
                onChange={setApproval}
                options={facilityNewsApprovalOptions}
              />
            </Form.Item>
          </AppFilterField>

          <AppFilterField width="13%">
            <Form.Item label="Trạng thái phát">
              <AppSelect
                width="100%"
                value={broadcast}
                onChange={setBroadcast}
                options={facilityNewsBroadcastOptions}
              />
            </Form.Item>
          </AppFilterField>

          <AppFilterField width="13%">
            <Form.Item label="Kiểu lặp">
              <AppSelect
                width="100%"
                value={repeat}
                onChange={setRepeat}
                options={facilityNewsRepeatOptions}
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

        <AppTable<FacilityPlaylistNews>
          key={playlistId}
          className="playlist-used-news__table"
          rowKey="id"
          columns={columns}
          dataSource={filteredNews}
          selectable
          selectedLabel="bản tin"
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys([...keys]),
          }}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1450 }}
        />
      </div>

      <AppConfirmModal
        open={deleteModalOpen}
        type="delete"
        title="Xóa bản tin đã chọn?"
        description={`Bạn có chắc chắn muốn xóa ${selectedRowKeys.length} bản tin đã chọn khỏi danh sách phát?`}
        confirmText="Xóa"
        cancelText="Hủy"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </>
  );
}

export default FacilityPlaylistUsedNews;
