import { useEffect, useMemo, useState } from "react";
import type { ColumnsType } from "antd/es/table";
import type { Dayjs } from "dayjs";

import dayjs from "dayjs";
import { message } from "antd";
import { FileInput, Info } from "lucide-react";

import AppFilter, {
  AppFilterField,
} from "../../../../components/common/AppFilter";
import AppDatePicker from "../../../../components/common/AppDatePicker";
import AppTimePicker from "../../../../components/common/AppTimePicker";
import AppSelect from "../../../../components/common/AppSelect";
import AppTable from "../../../../components/common/AppTable";
import AppTableActions from "../../../../components/common/AppTableActions";

import { useActionPanel } from "../../../../contexts/ActionPanelContext";

import ReportCharts from "../ReportCharts/ReportCharts";
import type {
  ReportBarData,
  ReportBarSeries,
  ReportCircleData,
} from "../ReportCharts/ReportCharts";

import {
  broadcastReportsMock,
  broadcastStatisticsMock,
  broadcastCircleStatisticsMock,
} from "../../data/broadcastReports";

import type { BroadcastReportItem } from "../../types/broadcastReport.types";

import "./BroadcastReport.css";

// Cấu hình biểu đồ cột chồng
const broadcastBarSeries: ReportBarSeries[] = [
  {
    dataKey: "playing",
    name: "Bản tin đang phát",
    color: "#9CC3FF",
  },
  {
    dataKey: "cancelled",
    name: "Bản tin đã hủy",
    color: "#72F27F",
  },
  {
    dataKey: "completed",
    name: "Bản tin đã phát xong",
    color: "#FF85B1",
  },
  {
    dataKey: "unscheduled",
    name: "Bản tin chưa đến lịch",
    color: "#FFC93F",
  },
];

function BroadcastReport() {
  const { setActions } = useActionPanel();

  // Bộ lọc
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(
    dayjs("2021-10-10"),
  );

  const [selectedTime, setSelectedTime] = useState<Dayjs | null>(
    dayjs().hour(14).minute(4).second(30),
  );

  const [selectedFacility, setSelectedFacility] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 10;

  // Đăng ký nút xuất báo cáo
  useEffect(() => {
    setActions([
      {
        key: "export",
        icon: <FileInput size={24} color="#F26D21" />,
        tooltip: "Xuất báo cáo",
        onClick: () => {
          message.info("Chức năng xuất báo cáo sẽ được tích hợp sau.");
        },
      },
    ]);

    return () => setActions([]);
  }, [setActions]);

  // Danh sách cơ sở
  const facilityOptions = useMemo(
    () => [
      { label: "Tất cả", value: "all" },
      ...broadcastReportsMock.map((item) => ({
        label: item.facilityName,
        value: item.facilityName,
      })),
    ],
    [],
  );

  // Lọc bảng
  const filteredReports = useMemo(() => {
    if (selectedFacility === "all") {
      return broadcastReportsMock;
    }

    return broadcastReportsMock.filter(
      (item) => item.facilityName === selectedFacility,
    );
  }, [selectedFacility]);

  // Lọc biểu đồ cột
  const filteredStatistics = useMemo(() => {
    const facilityNames = new Set(
      filteredReports.map((item) => item.facilityName),
    );

    return broadcastStatisticsMock.filter((item) =>
      facilityNames.has(item.facilityName),
    );
  }, [filteredReports]);

  // Lọc biểu đồ tròn
  const filteredCircles = useMemo(() => {
    const facilityNames = new Set(
      filteredReports.map((item) => item.facilityName),
    );

    return broadcastCircleStatisticsMock.filter((item) =>
      facilityNames.has(item.facilityName),
    );
  }, [filteredReports]);

  // Dữ liệu biểu đồ cột dùng chung
  const broadcastBarData: ReportBarData[] = useMemo(
    () =>
      filteredStatistics.map((item) => ({
        name: item.facilityName,
        playing: item.playing,
        cancelled: item.cancelled,
        completed: item.completed,
        unscheduled: item.unscheduled,
      })),
    [filteredStatistics],
  );

  // Dữ liệu biểu đồ tròn dùng chung
  const broadcastCircleData: ReportCircleData[] = useMemo(
    () =>
      filteredCircles.map((item) => ({
        id: item.id,
        name: item.facilityName,
        value: item.value,
        color: item.color,
        backgroundColor: item.backgroundColor,
      })),
    [filteredCircles],
  );

  // Xem chi tiết
  const handleViewDetail = (record: BroadcastReportItem) => {
    message.info(`Xem chi tiết bản tin tại: ${record.facilityName}`);
  };

  // Cấu hình bảng
  const columns: ColumnsType<BroadcastReportItem> = [
    {
      title: "STT",
      key: "index",
      width: 50,
      align: "center",
      render: (_value, _record, index) =>
        (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: "Cơ sở",
      dataIndex: "facilityName",
      key: "facilityName",
      width: 150,
    },
    {
      title: "Số lượng thiết bị",
      dataIndex: "deviceCount",
      key: "deviceCount",
      width: 115,
      align: "center",
    },
    {
      title: "Số lượng thiết bị khác",
      dataIndex: "otherDeviceCount",
      key: "otherDeviceCount",
      width: 145,
      align: "center",
    },
    {
      title: "Chi tiết",
      key: "actions",
      width: 80,
      align: "center",
      render: (_value, record) => (
        <AppTableActions
          actions={[
            {
              key: "detail",
              icon: <Info size={20} color="#F26D21" />,
              tooltip: "Xem chi tiết",
              onClick: () => handleViewDetail(record),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="broadcast-report">
      {/* Tiêu đề */}
      <h2 className="broadcast-report__heading">
        Báo cáo số lượng thiết bị theo nhà cung cấp
      </h2>

      {/* Bộ lọc */}
      <AppFilter showActions={false} className="broadcast-report__filter">
        <AppFilterField width={180}>
          <label className="broadcast-report__label">Chọn ngày</label>
          <AppDatePicker
            width="100%"
            value={selectedDate}
            onChange={setSelectedDate}
          />
        </AppFilterField>

        <AppFilterField width={190}>
          <label className="broadcast-report__label">Chọn giờ</label>
          <AppTimePicker
            width="100%"
            value={selectedTime}
            format="HH:mm:ss"
            onChange={setSelectedTime}
          />
        </AppFilterField>

        <AppFilterField width={180}>
          <label className="broadcast-report__label">Cơ sở</label>
          <AppSelect
            width="100%"
            value={selectedFacility}
            options={facilityOptions}
            onChange={(value) => {
              setSelectedFacility(String(value));
              setCurrentPage(1);
            }}
          />
        </AppFilterField>
      </AppFilter>

      {/* Bảng và biểu đồ */}
      <div className="broadcast-report__body">
        <div className="broadcast-report__table">
          <AppTable<BroadcastReportItem>
            columns={columns}
            dataSource={filteredReports}
            rowKey="id"
            selectable={false}
            pagination={{
              current: currentPage,
              pageSize,
              total: filteredReports.length,
              onChange: setCurrentPage,
            }}
          />
        </div>

        <div className="broadcast-report__charts">
          <ReportCharts
            barData={broadcastBarData}
            barSeries={broadcastBarSeries}
            circleData={broadcastCircleData}
          />
        </div>
      </div>
    </div>
  );
}

export default BroadcastReport;
