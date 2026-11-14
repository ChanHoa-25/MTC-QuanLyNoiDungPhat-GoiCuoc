import { useMemo, useState } from "react";
import type { Key } from "react";
import type { TableColumnsType } from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

import AppFilter, {
  AppFilterField,
} from "../../../components/common/AppFilter";

import AppDateRangePicker from "../../../components/common/AppDateRangePicker";
import type { DateRangeValue } from "../../../components/common/AppDateRangePicker";

import AppSearch from "../../../components/common/AppSearch";
import AppTable from "../../../components/common/AppTable";

import { broadcastHistoryMock } from "../data/broadcasts.mock";

import type { BroadcastHistoryItem } from "../data/broadcasts.mock";

import "./BroadcastHistory.css";

dayjs.extend(customParseFormat);

const columns: TableColumnsType<BroadcastHistoryItem> = [
  {
    title: "Mã thiết bị",
    dataIndex: "deviceCode",
    key: "deviceCode",
    width: 150,
  },
  {
    title: "Tên thiết bị",
    dataIndex: "deviceName",
    key: "deviceName",
    width: 160,
  },
  {
    title: "Thời gian bắt đầu phát",
    dataIndex: "startTime",
    key: "startTime",
    width: 200,
  },
  {
    title: "Thời gian kết thúc phát",
    dataIndex: "endTime",
    key: "endTime",
    width: 200,
  },
  {
    title: "Cơ sở",
    dataIndex: "facility",
    key: "facility",
    width: 180,
  },
];

function BroadcastHistory() {
  const [dateRange, setDateRange] = useState<DateRangeValue>([null, null]);

  const [keyword, setKeyword] = useState("");

  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredData = useMemo(() => {
    const searchValue = keyword.trim().toLowerCase();

    return broadcastHistoryMock.filter((item) => {
      const matchesKeyword =
        !searchValue ||
        item.deviceCode.toLowerCase().includes(searchValue) ||
        item.deviceName.toLowerCase().includes(searchValue) ||
        item.facility.toLowerCase().includes(searchValue);

      const startDate = dayjs(item.startTime, "DD/MM/YYYY HH:mm:ss", true);

      const matchesDate =
        startDate.isValid() &&
        (!dateRange[0] || !startDate.isBefore(dateRange[0], "day")) &&
        (!dateRange[1] || !startDate.isAfter(dateRange[1], "day"));

      return matchesKeyword && matchesDate;
    });
  }, [keyword, dateRange]);

  const handleDateChange = (dates: DateRangeValue) => {
    setDateRange(dates);
    setCurrentPage(1);
  };

  const handleKeywordChange = (value: string) => {
    setKeyword(value);
    setCurrentPage(1);
  };

  return (
    <div className="broadcast-history">
      <h2 className="broadcast-history__title">Lịch sử phát bản tin</h2>

      <AppFilter className="broadcast-history__filters" showActions={false}>
        <AppFilterField width={388} className="broadcast-history__date-field">
          <label className="broadcast-history__label">
            Thời gian bắt đầu phát
          </label>

          <AppDateRangePicker
            width="100%"
            value={dateRange}
            onChange={handleDateChange}
            startPlaceholder="Từ ngày"
            endPlaceholder="Đến ngày"
          />
        </AppFilterField>

        <AppFilterField width={345} className="broadcast-history__search-field">
          <label className="broadcast-history__label">Từ khóa</label>

          <AppSearch
            width="100%"
            value={keyword}
            placeholder="Mã hoặc tên thiết bị"
            onChange={handleKeywordChange}
            onSearch={handleKeywordChange}
            allowClear
          />
        </AppFilterField>
      </AppFilter>

      <div className="broadcast-history__table">
        <AppTable<BroadcastHistoryItem>
          rowKey="id"
          columns={columns}
          dataSource={filteredData}
          selectable
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys),
          }}
          showSelectedCount
          selectedLabel="bản ghi"
          pagination={{
            current: currentPage,
            pageSize,
            total: filteredData.length,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50"],
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
          scroll={{ x: 900 }}
          locale={{
            emptyText: "Không có lịch sử phát bản tin",
          }}
        />
      </div>
    </div>
  );
}

export default BroadcastHistory;
