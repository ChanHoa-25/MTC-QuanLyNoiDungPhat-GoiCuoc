import { useEffect, useMemo, useState } from "react";
import type { Key } from "react";
import type { ColumnsType } from "antd/es/table";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { Checkbox, message } from "antd";
import { SquarePen, Info, Trash2, Ban } from "lucide-react";

import AppFilter, { AppFilterField } from "../../common/AppFilter";
import AppSelect from "../../common/AppSelect";
import AppSearch from "../../common/AppSearch";
import AppDateRangePicker from "../../common/AppDateRangePicker";
import AppTable from "../../common/AppTable";
import AppStatusTag from "../../common/AppStatusTag";
import type {
  AppStatusVariant,
  AppStatusLabelVariant,
} from "../../common/AppStatusTag";
import AppTableActions from "../../common/AppTableActions";

import "./MediaBroadcastList.css";

export interface BroadcastItem {
  id: string;
  name: string;
  type: "Tin ưu tiên" | "Tin thường";
  approvalStatus: string;
  playStatus: string;
  startDate: string | null;
  endDate: string | null;
  broadcastTime: string;
  location: string;
}

interface MediaBroadcastListProps {
  mediaId: string;
  data?: BroadcastItem[];
  onCancelSelected?: (ids: string[]) => void | Promise<void>;
  onDeleteSelected?: (ids: string[]) => void | Promise<void>;
  onEdit?: (item: BroadcastItem) => void;
  onView?: (item: BroadcastItem) => void;
}

const demoBroadcasts: BroadcastItem[] = [
  {
    id: "1",
    name: "Khám phá Hội An - Bản tin số 01",
    type: "Tin ưu tiên",
    approvalStatus: "Chờ duyệt",
    playStatus: "-",
    startDate: null,
    endDate: null,
    broadcastTime: "-",
    location: "TP. Hồ Chí Minh",
  },
  {
    id: "2",
    name: "Khám phá Hội An - Bản tin số 02",
    type: "Tin ưu tiên",
    approvalStatus: "Đang hoạt động",
    playStatus: "Đang phát",
    startDate: "2022-03-02",
    endDate: "2022-03-02",
    broadcastTime: "12:00 - 12:15",
    location: "TP. Hồ Chí Minh",
  },
  {
    id: "3",
    name: "Khám phá Hội An - Bản tin số 03",
    type: "Tin thường",
    approvalStatus: "Từ chối duyệt",
    playStatus: "-",
    startDate: "2022-03-01",
    endDate: "2022-03-03",
    broadcastTime: "10:00 - 15:15",
    location: "Thủ Đức, Bình Thạnh",
  },
  {
    id: "4",
    name: "Khám phá Hội An - Bản tin số 04",
    type: "Tin thường",
    approvalStatus: "Đã duyệt",
    playStatus: "Tạm ngưng",
    startDate: "2022-03-01",
    endDate: "2022-03-03",
    broadcastTime: "10:00 - 15:15",
    location: "Thủ Đức, Bình Thạnh",
  },
  {
    id: "5",
    name: "Khám phá Hội An - Bản tin số 05",
    type: "Tin thường",
    approvalStatus: "Đã duyệt",
    playStatus: "Chờ phát",
    startDate: "2022-03-01",
    endDate: "2022-03-03",
    broadcastTime: "10:00 - 15:15",
    location: "Thủ Đức, Bình Thạnh",
  },
  {
    id: "6",
    name: "Khám phá Hội An - Bản tin số 06",
    type: "Tin ưu tiên",
    approvalStatus: "Đã duyệt",
    playStatus: "Đã kết thúc",
    startDate: "2022-03-02",
    endDate: "2022-03-02",
    broadcastTime: "12:00 - 12:15",
    location: "Thủ Đức, Bình Thạnh",
  },
  {
    id: "7",
    name: "Khám phá Hội An - Bản tin số 07",
    type: "Tin thường",
    approvalStatus: "Chờ duyệt",
    playStatus: "-",
    startDate: "2022-03-01",
    endDate: "2022-03-03",
    broadcastTime: "10:00 - 15:15",
    location: "Thủ Đức, Bình Thạnh",
  },
  {
    id: "8",
    name: "Khám phá Hội An - Bản tin số 08",
    type: "Tin thường",
    approvalStatus: "Đã duyệt",
    playStatus: "Chưa phát",
    startDate: "2022-03-01",
    endDate: "2022-03-03",
    broadcastTime: "10:00 - 15:15",
    location: "Thủ Đức, Bình Thạnh",
  },
];

const PAGE_SIZE = 10;

function getStatusVariant(status: string): AppStatusVariant {
  switch (status) {
    case "Đã duyệt":
    case "Đang phát":
      return "blue";
    case "Đang hoạt động":
    case "Chưa phát":
      return "green";
    case "Từ chối duyệt":
      return "red";
    case "Đã kết thúc":
      return "gray";
    case "Tạm ngưng":
      return "yellow";
    default:
      return "orange";
  }
}

function getTypeVariant(type: BroadcastItem["type"]): AppStatusLabelVariant {
  return type === "Tin ưu tiên" ? "green" : "blue";
}

function formatDate(value: string | null) {
  return value ? dayjs(value).format("DD/MM/YYYY") : "-";
}

function MediaBroadcastList({
  mediaId,
  data,
  onCancelSelected,
  onDeleteSelected,
  onEdit,
  onView,
}: MediaBroadcastListProps) {
  // Không có data: giữ demo cũ của Facility. data=[]: hiển thị danh sách rỗng.
  const broadcasts = data ?? demoBroadcasts;

  const [type, setType] = useState("all");
  const [approval, setApproval] = useState("all");
  const [play, setPlay] = useState("all");
  const [dates, setDates] = useState<[Dayjs | null, Dayjs | null]>([
    null,
    null,
  ]);
  const [keyword, setKeyword] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Chuyển sang media khác thì bỏ bộ lọc, phân trang và các hàng đã chọn.
  useEffect(() => {
    setType("all");
    setApproval("all");
    setPlay("all");
    setDates([null, null]);
    setKeyword("");
    setSelectedRowKeys([]);
    setCurrentPage(1);
  }, [mediaId]);

  const resetTableState = () => {
    setCurrentPage(1);
    setSelectedRowKeys([]);
  };

  const filteredData = useMemo(() => {
    const search = keyword.trim().toLowerCase();
    return broadcasts.filter((item) => {
      if (type !== "all" && item.type !== type) return false;
      if (approval !== "all" && item.approvalStatus !== approval) return false;
      if (play !== "all" && item.playStatus !== play) return false;
      if (
        search &&
        !`${item.name} ${item.location}`.toLowerCase().includes(search)
      ) {
        return false;
      }
      if (
        dates[0] &&
        (!item.startDate || dayjs(item.startDate).isBefore(dates[0], "day"))
      ) {
        return false;
      }
      if (
        dates[1] &&
        (!item.startDate || dayjs(item.startDate).isAfter(dates[1], "day"))
      ) {
        return false;
      }
      return true;
    });
  }, [broadcasts, type, approval, play, dates, keyword]);

  const safePage = Math.min(
    currentPage,
    Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE)),
  );
  const currentPageIds = useMemo(
    () =>
      filteredData
        .slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
        .map((item) => item.id),
    [filteredData, safePage],
  );
  const selectedIds = useMemo(
    () => selectedRowKeys.map(String),
    [selectedRowKeys],
  );
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const hasSelection = selectedIds.length > 0;
  const allCurrentPageSelected =
    currentPageIds.length > 0 &&
    currentPageIds.every((id) => selectedSet.has(id));
  const someCurrentPageSelected = currentPageIds.some((id) =>
    selectedSet.has(id),
  );

  const toggleCurrentPage = (checked: boolean) => {
    const pageSet = new Set(currentPageIds);
    setSelectedRowKeys((prev) =>
      checked
        ? [...new Set([...prev.map(String), ...currentPageIds])]
        : prev.filter((key) => !pageSet.has(String(key))),
    );
  };

  const handlePendingAction = (action: string) => {
    message.info(`${action}: Chức năng đang chờ tích hợp API bản tin.`);
  };

  const handleBulkAction = async (action: "cancel" | "delete") => {
    if (!selectedIds.length || submitting) return;
    const callback = action === "cancel" ? onCancelSelected : onDeleteSelected;
    if (!callback) {
      handlePendingAction(action === "cancel" ? "Hủy bản tin" : "Xóa bản tin");
      return;
    }
    setSubmitting(true);
    try {
      await callback(selectedIds);
      setSelectedRowKeys([]);
    } catch (error) {
      console.error("Lỗi xử lý danh sách bản tin:", error);
      message.error("Không thể thực hiện thao tác. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  const columns: ColumnsType<BroadcastItem> = [
    {
      title: "Tiêu đề",
      dataIndex: "name",
      key: "name",
      width: 230,
      ellipsis: true,
      render: (value: string) => (
        <span title={value} className="media-broadcast-list__name">
          {value}
        </span>
      ),
    },
    {
      title: "Loại bản tin",
      dataIndex: "type",
      key: "type",
      width: 120,
      render: (value: BroadcastItem["type"]) => (
        <AppStatusTag
          type="label"
          variant={getTypeVariant(value)}
          label={value}
        />
      ),
    },
    {
      title: "Trạng thái duyệt",
      dataIndex: "approvalStatus",
      key: "approvalStatus",
      width: 145,
      render: (value: string) => (
        <AppStatusTag
          type="status"
          variant={getStatusVariant(value)}
          label={value}
        />
      ),
    },
    {
      title: "Trạng thái phát",
      dataIndex: "playStatus",
      key: "playStatus",
      width: 135,
      render: (value: string) =>
        value === "-" ? (
          "-"
        ) : (
          <AppStatusTag
            type="status"
            variant={getStatusVariant(value)}
            label={value}
          />
        ),
    },
    {
      title: "Ngày phát",
      key: "broadcastDates",
      width: 130,
      render: (_: unknown, record: BroadcastItem) => (
        <div className="media-broadcast-list__dates">
          <span>{formatDate(record.startDate)}</span>
          <span>{formatDate(record.endDate)}</span>
        </div>
      ),
    },
    {
      title: "Giờ phát",
      dataIndex: "broadcastTime",
      key: "broadcastTime",
      width: 145,
    },
    {
      title: "Cơ sở phát",
      dataIndex: "location",
      key: "location",
      width: 170,
      ellipsis: true,
    },
    {
      title: "Hành động",
      key: "actions",
      width: 110,
      align: "right",
      render: (_: unknown, record: BroadcastItem) => (
        <AppTableActions
          actions={[
            ...(record.approvalStatus === "Chờ duyệt"
              ? [
                  {
                    key: "edit",
                    icon: <SquarePen />,
                    tooltip: "Sửa bản tin",
                    onClick: () =>
                      onEdit
                        ? onEdit(record)
                        : handlePendingAction("Sửa bản tin"),
                  },
                ]
              : []),
            {
              key: "detail",
              icon: <Info />,
              tooltip: "Xem thông tin bản tin",
              onClick: () =>
                onView ? onView(record) : handlePendingAction("Xem bản tin"),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="media-broadcast-list">
      <h2 className="media-broadcast-list__title">
        Danh sách bản tin sử dụng media file
      </h2>
      <AppFilter
        showActions={false}
        className="media-broadcast-list__filter"
        gap={12}>
        <AppFilterField width={160}>
          <label className="media-broadcast-list__label">Loại bản tin</label>
          <AppSelect
            width="100%"
            value={type}
            onChange={(value) => {
              setType(value);
              resetTableState();
            }}
            options={[
              { value: "all", label: "Tất cả" },
              { value: "Tin ưu tiên", label: "Tin ưu tiên" },
              { value: "Tin thường", label: "Tin thường" },
            ]}
          />
        </AppFilterField>
        <AppFilterField width={160}>
          <label className="media-broadcast-list__label">
            Trạng thái duyệt
          </label>
          <AppSelect
            width="100%"
            value={approval}
            onChange={(value) => {
              setApproval(value);
              resetTableState();
            }}
            options={[
              { value: "all", label: "Tất cả" },
              { value: "Chờ duyệt", label: "Chờ duyệt" },
              { value: "Đã duyệt", label: "Đã duyệt" },
              { value: "Từ chối duyệt", label: "Từ chối duyệt" },
              { value: "Đang hoạt động", label: "Đang hoạt động" },
            ]}
          />
        </AppFilterField>
        <AppFilterField width={160}>
          <label className="media-broadcast-list__label">Trạng thái phát</label>
          <AppSelect
            width="100%"
            value={play}
            onChange={(value) => {
              setPlay(value);
              resetTableState();
            }}
            options={[
              { value: "all", label: "Tất cả" },
              { value: "Đang phát", label: "Đang phát" },
              { value: "Tạm ngưng", label: "Tạm ngưng" },
              { value: "Chờ phát", label: "Chờ phát" },
              { value: "Đã kết thúc", label: "Đã kết thúc" },
              { value: "Chưa phát", label: "Chưa phát" },
              { value: "Sắp tới lịch", label: "Sắp tới lịch" },
              { value: "Đã hủy", label: "Đã hủy" },
            ]}
          />
        </AppFilterField>
        <AppFilterField width={388}>
          <label className="media-broadcast-list__label">
            Thời gian bắt đầu phát
          </label>
          <AppDateRangePicker
            width="100%"
            value={dates}
            onChange={(value) => {
              setDates(value);
              resetTableState();
            }}
          />
        </AppFilterField>
        <AppFilterField width={250}>
          <label className="media-broadcast-list__label">Từ khóa</label>
          <AppSearch
            width="100%"
            placeholder="Tên bản tin / Cơ sở phát"
            value={keyword}
            onChange={(value) => {
              setKeyword(value);
              resetTableState();
            }}
          />
        </AppFilterField>
      </AppFilter>

      {hasSelection && (
        <div className="media-broadcast-list__selection">
          <Checkbox
            checked={allCurrentPageSelected}
            indeterminate={someCurrentPageSelected && !allCurrentPageSelected}
            onChange={(event) => toggleCurrentPage(event.target.checked)}
            aria-label="Chọn hoặc bỏ chọn bản tin trên trang hiện tại"
          />
          <strong>{selectedIds.length} bản tin đã chọn</strong>
          <button
            type="button"
            disabled={submitting}
            onClick={() => void handleBulkAction("cancel")}>
            <Ban size={17} /> Hủy bản tin
          </button>
          <button
            type="button"
            disabled={submitting}
            className="media-broadcast-list__delete"
            onClick={() => void handleBulkAction("delete")}>
            <Trash2 size={17} /> Xóa bản tin
          </button>
        </div>
      )}

      <AppTable<BroadcastItem>
        className={`media-broadcast-list__table ${hasSelection ? "media-broadcast-list__table--selected" : ""}`}
        rowKey="id"
        columns={columns}
        dataSource={filteredData}
        selectable
        showSelectedCount={false}
        rowSelection={{
          selectedRowKeys,
          preserveSelectedRowKeys: false,
          onChange: (keys) => setSelectedRowKeys([...keys]),
        }}
        pagination={{
          current: safePage,
          pageSize: PAGE_SIZE,
          total: filteredData.length,
          onChange: (page) => setCurrentPage(page),
        }}
        scroll={{ x: 1200 }}
        locale={{ emptyText: "Không có bản tin phù hợp" }}
      />
    </div>
  );
}

export default MediaBroadcastList;
