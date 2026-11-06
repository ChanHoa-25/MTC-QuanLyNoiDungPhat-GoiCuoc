import { useCallback, useEffect, useMemo, useState } from "react";
import type { Key } from "react";
import { message } from "antd";
import type { TableColumnsType } from "antd";

import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { Trash2 } from "lucide-react";

import AppTable from "../../../components/common/AppTable";
import AppSearch from "../../../components/common/AppSearch";
import AppDateRangePicker from "../../../components/common/AppDateRangePicker";
import AppConfirmModal from "../../../components/common/AppConfirmModal";

import { useActionPanel } from "../../../contexts/ActionPanelContext";
import type { AppActionPanelItem } from "../../../components/common/AppActionPanel";

import { deviceBroadcastHistoryMock } from "../data/deviceBroadcastHistory.mock";
import type { DeviceBroadcastHistoryItem } from "../types/deviceBroadcastHistory.types";

import "./DeviceBroadcastHistory.css";

interface DeviceBroadcastHistoryProps {
  deviceId: string;
}

type DateRange = [Dayjs | null, Dayjs | null];

const PAGE_SIZE = 10;

function DeviceBroadcastHistory({ deviceId }: DeviceBroadcastHistoryProps) {
  const { setActions } = useActionPanel();

  const [historyData, setHistoryData] = useState<DeviceBroadcastHistoryItem[]>(
    () => [...deviceBroadcastHistoryMock],
  );

  const [keyword, setKeyword] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>([null, null]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const filteredData = useMemo(() => {
    const search = keyword.trim().toLowerCase();
    const [startDate, endDate] = dateRange;

    return historyData.filter((item) => {
      const matchDevice = item.deviceId === deviceId;

      const matchKeyword = !search || item.title.toLowerCase().includes(search);

      const broadcastStart = dayjs(item.startTime);

      const matchStartDate =
        !startDate || !broadcastStart.isBefore(startDate.startOf("day"));

      const matchEndDate =
        !endDate || !broadcastStart.isAfter(endDate.endOf("day"));

      return matchDevice && matchKeyword && matchStartDate && matchEndDate;
    });
  }, [historyData, deviceId, keyword, dateRange]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const handleKeywordChange = (value: string) => {
    setKeyword(value);
    setCurrentPage(1);
    setSelectedRowKeys([]);
  };

  const handleDateRangeChange = (value: DateRange | null) => {
    setDateRange(value ?? [null, null]);
    setCurrentPage(1);
    setSelectedRowKeys([]);
  };

  const openDeleteModal = useCallback(() => {
    if (selectedRowKeys.length === 0) {
      message.warning("Vui lòng chọn bản tin cần xóa");
      return;
    }

    setDeleteModalOpen(true);
  }, [selectedRowKeys.length]);

  const handleConfirmDelete = () => {
    const selectedIds = new Set(selectedRowKeys);

    setHistoryData((prev) => prev.filter((item) => !selectedIds.has(item.id)));

    setSelectedRowKeys([]);
    setCurrentPage(1);
    setDeleteModalOpen(false);

    message.success("Xóa lịch sử phát bản tin thành công");
  };

  const actions = useMemo<AppActionPanelItem[]>(
    () => [
      {
        key: "delete-broadcast-history",
        icon: <Trash2 size={24} />,
        tooltip: "Xóa lịch sử phát bản tin",
        danger: true,
        disabled: selectedRowKeys.length === 0,
        onClick: openDeleteModal,
      },
    ],
    [openDeleteModal, selectedRowKeys.length],
  );

  useEffect(() => {
    setActions(actions);

    return () => {
      setActions([]);
    };
  }, [actions, setActions]);

  const columns = useMemo<TableColumnsType<DeviceBroadcastHistoryItem>>(
    () => [
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
    ],
    [safeCurrentPage],
  );

  return (
    <div className="device-broadcast-history">
      <h2 className="device-broadcast-history__title">
        Lịch sử phát bản tin điện tử trên thiết bị
      </h2>

      <div className="device-broadcast-history__filters">
        <div className="device-broadcast-history__date">
          <label>Thời gian</label>

          <AppDateRangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
          />
        </div>

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

      <div className="device-broadcast-history__table-area">
        <AppTable<DeviceBroadcastHistoryItem>
          className="device-broadcast-history__table"
          rowKey="id"
          columns={columns}
          dataSource={filteredData}
          tableLayout="fixed"
          selectable
          showSelectedCount={false}
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

        <div className="device-broadcast-history__selection" aria-live="polite">
          {selectedRowKeys.length > 0 && (
            <span>
              {String(selectedRowKeys.length).padStart(2, "0")} bản tin đã được
              chọn
            </span>
          )}
        </div>
      </div>

      <AppConfirmModal
        open={deleteModalOpen}
        type="delete"
        title="Xác nhận xóa lịch sử phát bản tin"
        description={`Bạn có chắc chắn muốn xóa ${selectedRowKeys.length} bản tin đã chọn?`}
        confirmText="Tiếp tục"
        cancelText="Hủy"
        showIcon={false}
        width={500}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}

export default DeviceBroadcastHistory;
