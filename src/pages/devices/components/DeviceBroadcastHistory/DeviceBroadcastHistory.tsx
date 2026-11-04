import { useMemo, useState } from "react";
import type { Key } from "react";
import type { TableColumnsType } from "antd";

import dayjs from "dayjs";
import type { Dayjs } from "dayjs";

import AppTable from "../../../../components/common/AppTable";
import AppSearch from "../../../../components/common/AppSearch";
import AppDateRangePicker from "../../../../components/common/AppDateRangePicker";

import { deviceBroadcastHistoryMock } from "../../data/deviceBroadcastHistory.mock";
import type { DeviceBroadcastHistoryItem } from "../../types/deviceBroadcastHistory.types";

import "./DeviceBroadcastHistory.css";

interface DeviceBroadcastHistoryProps {
  deviceId: string;
}

type DateRange = [Dayjs | null, Dayjs | null];

const PAGE_SIZE = 10;

function DeviceBroadcastHistory({ deviceId }: DeviceBroadcastHistoryProps) {
  // Tìm kiếm
  const [keyword, setKeyword] = useState("");

  // Khoảng thời gian
  const [dateRange, setDateRange] = useState<DateRange>([null, null]);

  // Chọn bản tin
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);

  // Lọc dữ liệu
  const filteredData = useMemo(() => {
    const search = keyword.trim().toLowerCase();
    const [startDate, endDate] = dateRange;

    return deviceBroadcastHistoryMock.filter((item) => {
      // Lọc theo thiết bị
      const matchDevice = item.deviceId === deviceId;

      // Tìm kiếm tiêu đề bản tin
      const matchKeyword = !search || item.title.toLowerCase().includes(search);

      const broadcastStart = dayjs(item.startTime);

      // Lọc theo ngày bắt đầu phát
      const matchStartDate =
        !startDate || !broadcastStart.isBefore(startDate.startOf("day"));

      const matchEndDate =
        !endDate || !broadcastStart.isAfter(endDate.endOf("day"));

      return matchDevice && matchKeyword && matchStartDate && matchEndDate;
    });
  }, [deviceId, keyword, dateRange]);

  // Tổng số trang
  const totalPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));

  // Trang hiện tại hợp lệ
  const safeCurrentPage = Math.min(currentPage, totalPages);

  // Cập nhật từ khóa
  const handleKeywordChange = (value: string) => {
    setKeyword(value);
    setCurrentPage(1);
    setSelectedRowKeys([]);
  };

  // Cập nhật khoảng thời gian
  const handleDateRangeChange = (value: DateRange | null) => {
    setDateRange(value ?? [null, null]);
    setCurrentPage(1);
    setSelectedRowKeys([]);
  };

  // Cấu hình cột
  const columns: TableColumnsType<DeviceBroadcastHistoryItem> = [
    {
      title: "STT",
      key: "stt",
      width: 70,
      align: "center",
      render: (_, __, index) => (safeCurrentPage - 1) * PAGE_SIZE + index + 1,
    },
    {
      title: "Tên bản tin",
      dataIndex: "title",
      key: "title",
      width: 220,
      ellipsis: true,
    },
    {
      title: "Thời lượng",
      dataIndex: "duration",
      key: "duration",
      width: 180,
    },
    {
      title: "Thời gian bắt đầu phát",
      dataIndex: "startTime",
      key: "startTime",
      width: 240,
      render: (value: string) => dayjs(value).format("DD/MM/YYYY HH:mm:ss"),
    },
    {
      title: "Thời gian kết thúc phát",
      dataIndex: "endTime",
      key: "endTime",
      width: 240,
      render: (value: string) => dayjs(value).format("DD/MM/YYYY HH:mm:ss"),
    },
  ];

  return (
    <div className="device-broadcast-history">
      <h2 className="device-broadcast-history__title">
        Lịch sử phát bản tin điện tử trên thiết bị
      </h2>

      {/* Bộ lọc */}
      <div className="device-broadcast-history__filters">
        {/* Lọc theo thời gian */}
        <div className="device-broadcast-history__date">
          <label>Thời gian</label>

          <AppDateRangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
          />
        </div>

        {/* Tìm kiếm */}
        <div className="device-broadcast-history__search">
          <label>Từ khóa</label>

          <AppSearch
            width="100%"
            placeholder="Tiêu đề bản tin"
            value={keyword}
            onChange={handleKeywordChange}
          />
        </div>
      </div>

      {/* Bảng lịch sử */}
      <AppTable<DeviceBroadcastHistoryItem>
        className="device-broadcast-history__table"
        rowKey="id"
        columns={columns}
        dataSource={filteredData}
        tableLayout="fixed"
        selectable
        rowSelection={{
          selectedRowKeys,
          columnWidth: 60,
          onChange: (keys) => {
            setSelectedRowKeys([...keys]);
          },
        }}
        selectedLabel="bản tin"
        pagination={{
          current: safeCurrentPage,
          pageSize: PAGE_SIZE,
          total: filteredData.length,
          onChange: (page) => setCurrentPage(page),
          showSizeChanger: false,
        }}
      />
    </div>
  );
}

export default DeviceBroadcastHistory;
