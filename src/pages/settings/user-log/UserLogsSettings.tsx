import { useEffect, useMemo, useState } from "react";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";

import AppTable from "../../../components/common/AppTable";
import AppDateRangePicker from "../../../components/common/AppDateRangePicker";
import { useActionPanel } from "../../../contexts/ActionPanelContext";

import type { UserLog } from "../types/userLogs.types";
import { mockUserLogs } from "../data/userLogs.mock";

import "./UserLogsSettings.css";

const columns: ColumnsType<UserLog> = [
  {
    title: "STT",
    dataIndex: "id",
    key: "id",
    width: 70,
    align: "center",
  },
  {
    title: "Người tác động",
    dataIndex: "actor",
    key: "actor",
    width: 150,
  },
  {
    title: "Thời gian tác động",
    dataIndex: "actionTime",
    key: "actionTime",
    width: 185,
    render: (value: string) => dayjs(value).format("DD/MM/YYYY HH:mm:ss"),
  },
  {
    title: "Chức năng bị tác động",
    dataIndex: "functionName",
    key: "functionName",
    width: 200,
  },
  {
    title: "Nội dung cũ",
    dataIndex: "oldContent",
    key: "oldContent",
  },
  {
    title: "Nội dung mới",
    dataIndex: "newContent",
    key: "newContent",
  },
];

function UserLogsSettings() {
  const { setActions } = useActionPanel();

  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([
    null,
    null,
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Trang nhật ký không có ActionPanel
  useEffect(() => {
    setActions([]);

    return () => {
      setActions([]);
    };
  }, [setActions]);

  // Lọc nhật ký theo khoảng thời gian
  const filteredLogs = useMemo(() => {
    const [startDate, endDate] = dateRange;

    return mockUserLogs.filter((log) => {
      const logDate = dayjs(log.actionTime);

      if (startDate && logDate.isBefore(startDate, "day")) {
        return false;
      }

      if (endDate && logDate.isAfter(endDate, "day")) {
        return false;
      }

      return true;
    });
  }, [dateRange]);

  return (
    <div className="user-logs">
      <h2 className="user-logs__title">Nhật ký người dùng</h2>

      {/* Bộ lọc thời gian */}
      <div className="user-logs__filter">
        <label className="user-logs__filter-label">Thời gian:</label>

        <AppDateRangePicker
          value={dateRange}
          onChange={(value) => {
            setDateRange(value ?? [null, null]);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Bảng nhật ký */}
      <div className="user-logs__table">
        <AppTable<UserLog>
          rowKey="id"
          columns={columns}
          dataSource={filteredLogs}
          selectable={false}
          pagination={{
            current: currentPage,
            pageSize,
            total: filteredLogs.length,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50"],
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
        />
      </div>
    </div>
  );
}

export default UserLogsSettings;
