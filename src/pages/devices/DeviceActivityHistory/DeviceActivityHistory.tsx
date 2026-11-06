import { useMemo, useState } from "react";
import type { TableColumnsType } from "antd";

import dayjs from "dayjs";
import type { Dayjs } from "dayjs";

import AppTable from "../../../components/common/AppTable";
import AppSelect from "../../../components/common/AppSelect";
import AppSearch from "../../../components/common/AppSearch";
import AppDateRangePicker from "../../../components/common/AppDateRangePicker";

import { deviceActivityHistoryMock } from "../data/deviceActivityHistory.mock";

import type {
  DeviceActivityHistoryItem,
  DeviceConnectionFilter,
} from "../types/deviceActivityHistory.types";

import "./DeviceActivityHistory.css";

interface DeviceActivityHistoryProps {
  deviceId: string;
}

type DateRange = [Dayjs | null, Dayjs | null];

const PAGE_SIZE = 10;

const connectionOptions = [
  { label: "Tất cả", value: "all" },
  { label: "Đang kết nối", value: "online" },
  { label: "Mất kết nối", value: "offline" },
];

function DeviceActivityHistory({ deviceId }: DeviceActivityHistoryProps) {
  const [connection, setConnection] = useState<DeviceConnectionFilter>("all");

  const [dateRange, setDateRange] = useState<DateRange>([null, null]);
  const [keyword, setKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = useMemo(() => {
    const search = keyword.trim().toLowerCase();
    const [startDate, endDate] = dateRange;

    return deviceActivityHistoryMock.filter((item) => {
      const matchDevice = item.deviceId === deviceId;

      const matchConnection =
        connection === "all" ||
        (connection === "online" && item.type === "reconnected") ||
        (connection === "offline" && item.type === "disconnected");

      const matchKeyword =
        !search ||
        item.activity.toLowerCase().includes(search) ||
        (item.note ?? "").toLowerCase().includes(search);

      const activityTime = dayjs(item.time);

      const matchStartDate =
        !startDate || !activityTime.isBefore(startDate.startOf("day"));

      const matchEndDate =
        !endDate || !activityTime.isAfter(endDate.endOf("day"));

      return (
        matchDevice &&
        matchConnection &&
        matchKeyword &&
        matchStartDate &&
        matchEndDate
      );
    });
  }, [deviceId, connection, keyword, dateRange]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const handleConnectionChange = (value: DeviceConnectionFilter) => {
    setConnection(value);
    setCurrentPage(1);
  };

  const handleDateRangeChange = (value: DateRange | null) => {
    setDateRange(value ?? [null, null]);
    setCurrentPage(1);
  };

  const handleKeywordChange = (value: string) => {
    setKeyword(value);
    setCurrentPage(1);
  };

  const columns: TableColumnsType<DeviceActivityHistoryItem> = [
    {
      title: "STT",
      key: "stt",
      width: 80,
      align: "center",
      render: (_, __, index) => (safeCurrentPage - 1) * PAGE_SIZE + index + 1,
    },
    {
      title: "Thời gian",
      dataIndex: "time",
      key: "time",
      width: 230,
      render: (value: string) => dayjs(value).format("DD/MM/YYYY HH:mm:ss"),
    },
    {
      title: "Hoạt động",
      dataIndex: "activity",
      key: "activity",
      width: 280,
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
    },
  ];

  return (
    <div className="device-activity-history">
      <h2 className="device-activity-history__title">
        Lịch sử hoạt động của thiết bị
      </h2>

      <div className="device-activity-history__filters">
        <div className="device-activity-history__connection">
          <label>Trạng thái kết nối</label>

          <AppSelect
            width="100%"
            value={connection}
            options={connectionOptions}
            onChange={(value) =>
              handleConnectionChange(value as DeviceConnectionFilter)
            }
          />
        </div>

        <div className="device-activity-history__date">
          <label>Thời gian</label>

          <AppDateRangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
          />
        </div>

        <div className="device-activity-history__search">
          <label>Từ khóa</label>

          <AppSearch
            width="100%"
            placeholder="Tìm kiếm hoạt động hoặc ghi chú"
            value={keyword}
            onChange={handleKeywordChange}
          />
        </div>
      </div>

      <AppTable<DeviceActivityHistoryItem>
        className="device-activity-history__table"
        rowKey="id"
        columns={columns}
        dataSource={filteredData}
        tableLayout="fixed"
        pagination={{
          current: safeCurrentPage,
          pageSize: PAGE_SIZE,
          total: filteredData.length,
          showSizeChanger: false,
          onChange: (page) => setCurrentPage(page),
        }}
      />
    </div>
  );
}

export default DeviceActivityHistory;
