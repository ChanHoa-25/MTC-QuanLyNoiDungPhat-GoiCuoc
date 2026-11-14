import { useCallback, useEffect, useMemo, useState } from "react";
import type { Key } from "react";
import type { TableColumnsType } from "antd";
import { Form, message } from "antd";
import { Info, ListX, SquarePen, Trash2 } from "lucide-react";
import dayjs from "dayjs";

import AppFilter, { AppFilterField } from "../../common/AppFilter";
import AppSelect from "../../common/AppSelect";
import AppSearch from "../../common/AppSearch";
import AppDateRangePicker from "../../common/AppDateRangePicker";
import type { DateRangeValue } from "../../common/AppDateRangePicker";
import AppTable from "../../common/AppTable";
import AppStatusTag from "../../common/AppStatusTag";
import AppTableActions from "../../common/AppTableActions";
import AppConfirmModal from "../../common/AppConfirmModal";
import { useActionPanel } from "../../../contexts/ActionPanelContext";
import type { AppActionPanelItem } from "../../common/AppActionPanel";
import "./TemplateUsedNews.css";

export interface TemplateUsedNewsItem {
  id: string;
  templateId: string;
  code: string;
  title: string;
  newsType: string;
  approvalStatus: string;
  broadcastStatus?: string | null;
  repeatType?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  broadcastTime?: string | null;
  facilityName: string;
  createdBy: string;
}

export interface TemplateUsedNewsFilterOptions {
  newsTypes: { label: string; value: string }[];
  approvals: { label: string; value: string }[];
  broadcasts: { label: string; value: string }[];
  repeats: { label: string; value: string }[];
}

interface TemplateUsedNewsProps {
  templateId: string;
  loadNews: (templateId: string) => TemplateUsedNewsItem[];
  deleteNews: (templateId: string, ids: string[]) => void | Promise<void>;
  filterOptions: TemplateUsedNewsFilterOptions;
  onViewNews?: (item: TemplateUsedNewsItem) => void;
  onEditNews?: (item: TemplateUsedNewsItem) => void;
}

type StatusVariant =
  | "yellow"
  | "blue"
  | "red"
  | "darkRed"
  | "gray"
  | "green"
  | "orange";
const approvalVariants: Record<string, StatusVariant> = {
  "Chờ duyệt": "yellow",
  "Đã duyệt": "blue",
  "Từ chối duyệt": "red",
};
const broadcastVariants: Record<string, StatusVariant> = {
  "Đang phát": "blue",
  "Tạm ngưng": "yellow",
  "Chờ phát": "darkRed",
  "Đã kết thúc": "gray",
  "Chưa phát": "green",
  "Sắp tới lịch": "orange",
  "Đã hủy": "red",
};
const repeatVariants: Record<string, "green" | "yellow" | "blue" | "orange"> = {
  "Không lặp": "green",
  "Hàng ngày": "yellow",
  "Ngày trong tuần": "blue",
  "Ngày trong tháng": "orange",
};

function TemplateUsedNews({
  templateId,
  loadNews,
  deleteNews,
  filterOptions,
  onViewNews,
  onEditNews,
}: TemplateUsedNewsProps) {
  const { setActions } = useActionPanel();
  const [news, setNews] = useState<TemplateUsedNewsItem[]>(() =>
    loadNews(templateId),
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
    setNews(loadNews(templateId));
    setSelectedRowKeys([]);
    setNewsType("all");
    setApproval("all");
    setBroadcast("all");
    setRepeat("all");
    setDateRange([null, null]);
    setKeyword("");
    setDeleteModalOpen(false);
  }, [templateId, loadNews]);

  const filteredNews = useMemo(() => {
    const search = keyword.trim().toLowerCase();
    const [startDate, endDate] = dateRange ?? [null, null];
    return news.filter((item) => {
      if (item.templateId !== templateId) return false;
      if (newsType !== "all" && item.newsType !== newsType) return false;
      if (approval !== "all" && item.approvalStatus !== approval) return false;
      if (broadcast !== "all" && item.broadcastStatus !== broadcast)
        return false;
      if (repeat !== "all" && item.repeatType !== repeat) return false;
      if (
        search &&
        ![item.code, item.title, item.facilityName]
          .join(" ")
          .toLowerCase()
          .includes(search)
      )
        return false;
      if (startDate || endDate) {
        if (!item.startDate) return false;
        const date = dayjs(item.startDate);
        if (startDate && date.isBefore(startDate, "day")) return false;
        if (endDate && date.isAfter(endDate, "day")) return false;
      }
      return true;
    });
  }, [
    news,
    templateId,
    newsType,
    approval,
    broadcast,
    repeat,
    dateRange,
    keyword,
  ]);

  const handleDelete = useCallback(() => {
    if (selectedRowKeys.length === 0) {
      message.warning("Vui lòng chọn bản tin cần xóa");
      return;
    }
    setDeleteModalOpen(true);
  }, [selectedRowKeys.length]);

  const handleConfirmDelete = async () => {
    const ids = selectedRowKeys.map(String);
    const selectedIds = new Set(ids);
    try {
      await deleteNews(templateId, ids);
      setNews((previous) =>
        previous.filter((item) => !selectedIds.has(item.id)),
      );
      setSelectedRowKeys([]);
      setDeleteModalOpen(false);
      message.success("Đã xóa bản tin được chọn");
    } catch {
      message.error("Không thể xóa bản tin");
    }
  };

  const handleClearSelection = useCallback(() => setSelectedRowKeys([]), []);

  useEffect(() => {
    const actions: AppActionPanelItem[] = [
      {
        key: "delete-template-used-news",
        icon: <Trash2 />,
        tooltip: "Xóa bản tin đã chọn",
        danger: true,
        disabled: selectedRowKeys.length === 0,
        onClick: handleDelete,
      },
      {
        key: "clear-template-news-selection",
        icon: <ListX />,
        tooltip: "Bỏ chọn bản tin",
        disabled: selectedRowKeys.length === 0,
        onClick: handleClearSelection,
      },
    ];
    setActions(actions);
    return () => setActions([]);
  }, [setActions, selectedRowKeys.length, handleDelete, handleClearSelection]);

  const columns: TableColumnsType<TemplateUsedNewsItem> = [
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
          variant={approvalVariants[record.approvalStatus] ?? "gray"}
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
            variant={broadcastVariants[record.broadcastStatus] ?? "gray"}
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
            variant={
              repeatVariants[
                record.repeatType as keyof typeof repeatVariants
              ] ?? "blue"
            }
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
          ? `${dayjs(record.startDate).format("DD/MM/YYYY")}${record.endDate ? ` - ${dayjs(record.endDate).format("DD/MM/YYYY")}` : ""}`
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
      align: "right",
      render: (_, record) => (
        <AppTableActions
          actions={[
            ...(record.approvalStatus === "Chờ duyệt"
              ? [
                  {
                    key: "edit",
                    icon: <SquarePen />,
                    tooltip: "Chỉnh sửa bản tin",
                    onClick: () =>
                      onEditNews
                        ? onEditNews(record)
                        : message.info(`Chỉnh sửa: ${record.code}`),
                  },
                ]
              : []),
            {
              key: "detail",
              icon: <Info />,
              tooltip: "Xem chi tiết bản tin",
              onClick: () =>
                onViewNews
                  ? onViewNews(record)
                  : message.info(`Chi tiết: ${record.code}`),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <>
      <section className="template-used-news">
        <h2 className="template-used-news__title">
          Danh sách bản tin sử dụng bản mẫu
        </h2>
        <AppFilter
          className="template-used-news__filters"
          showActions={false}
          gap={10}>
          <AppFilterField width="13%">
            <Form.Item label="Loại bản tin">
              <AppSelect
                width="100%"
                value={newsType}
                onChange={setNewsType}
                options={filterOptions.newsTypes}
              />
            </Form.Item>
          </AppFilterField>
          <AppFilterField width="13%">
            <Form.Item label="Trạng thái duyệt">
              <AppSelect
                width="100%"
                value={approval}
                onChange={setApproval}
                options={filterOptions.approvals}
              />
            </Form.Item>
          </AppFilterField>
          <AppFilterField width="13%">
            <Form.Item label="Trạng thái phát">
              <AppSelect
                width="100%"
                value={broadcast}
                onChange={setBroadcast}
                options={filterOptions.broadcasts}
              />
            </Form.Item>
          </AppFilterField>
          <AppFilterField width="13%">
            <Form.Item label="Kiểu lặp">
              <AppSelect
                width="100%"
                value={repeat}
                onChange={setRepeat}
                options={filterOptions.repeats}
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
        <AppTable<TemplateUsedNewsItem>
          key={templateId}
          className="template-used-news__table"
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
      </section>
      <AppConfirmModal
        open={deleteModalOpen}
        type="delete"
        title="Xóa bản tin đã chọn?"
        description={`Bạn có chắc chắn muốn xóa ${selectedRowKeys.length} bản tin đã chọn khỏi danh sách sử dụng bản mẫu?`}
        confirmText="Xóa"
        cancelText="Hủy"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </>
  );
}

export default TemplateUsedNews;
