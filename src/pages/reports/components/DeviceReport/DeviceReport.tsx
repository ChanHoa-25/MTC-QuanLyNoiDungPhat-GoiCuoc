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
  deviceReportsMock,
  deviceBroadcastStatisticsMock,
  deviceCircleStatisticsMock,
} from "../../data/deviceReports.mock";

import type { DeviceReportItem } from "../../types/deviceReport.types";

import { exportReportToCSV } from "../../utils/exportReport";

import "./DeviceReport.css";

// Cấu hình biểu đồ cột theo Figma
const deviceBarSeries: ReportBarSeries[] = [
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

function DeviceReport() {
  const { setActions } = useActionPanel();

  // Bộ lọc ngày, giờ và cơ sở
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(
    dayjs("2021-10-10"),
  );

  const [selectedTime, setSelectedTime] = useState<Dayjs | null>(
    dayjs().hour(14).minute(4).second(30),
  );

  const [selectedFacility, setSelectedFacility] = useState("all");

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Đăng ký nút xuất báo cáo với MainLayout
  useEffect(() => {
    setActions([
      {
        key: "export",
        icon: <FileInput size={24} color="#F26D21" />,
        tooltip: "Xuất báo cáo",
        onClick: () => {
          exportReportToCSV(
            filteredReports.map((item, idx) => ({
              STT: idx + 1,
              "Tên cơ sở": item.facilityName,
              "Thiết bị chính": item.deviceCount,
              "Thiết bị khác": item.otherDeviceCount,
            })),
            "Bao_cao_ban_tin_theo_thiet_bi",
          );
        },
      },
    ]);

    return () => {
      setActions([]);
    };
  }, [setActions]);

  // Danh sách cơ sở cho bộ lọc
  const facilityOptions = useMemo(
    () => [
      {
        label: "Tất cả",
        value: "all",
      },
      ...deviceReportsMock.map((item) => ({
        label: item.facilityName,
        value: item.facilityName,
      })),
    ],
    [],
  );

  // Lọc dữ liệu bảng theo cơ sở
  const filteredReports = useMemo(() => {
    if (selectedFacility === "all") {
      return deviceReportsMock;
    }

    return deviceReportsMock.filter(
      (item) => item.facilityName === selectedFacility,
    );
  }, [selectedFacility]);

  // Lọc dữ liệu biểu đồ cột
  const filteredStatistics = useMemo(() => {
    const facilityNames = new Set(
      filteredReports.map((item) => item.facilityName),
    );

    return deviceBroadcastStatisticsMock.filter((item) =>
      facilityNames.has(item.facilityName),
    );
  }, [filteredReports]);

  // Lọc dữ liệu biểu đồ tròn
  const filteredCircles = useMemo(() => {
    const facilityNames = new Set(
      filteredReports.map((item) => item.facilityName),
    );

    return deviceCircleStatisticsMock.filter((item) =>
      facilityNames.has(item.facilityName),
    );
  }, [filteredReports]);

  // Chuyển dữ liệu biểu đồ cột sang cấu trúc chung
  const deviceBarData: ReportBarData[] = useMemo(
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

  // Chuyển dữ liệu biểu đồ tròn sang cấu trúc chung
  const deviceCircleData: ReportCircleData[] = useMemo(
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

  // Xử lý xem chi tiết thiết bị theo cơ sở
  const handleViewDetail = (record: DeviceReportItem) => {
    message.info(`Xem chi tiết thiết bị tại: ${record.facilityName}`);
  };

  // Cấu hình các cột bảng
  const columns: ColumnsType<DeviceReportItem> = [
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
    <div className="device-report">
      {/* Tiêu đề */}
      <h2 className="device-report__heading">
        Báo cáo số lượng thiết bị theo nhà cung cấp
      </h2>

      {/* Bộ lọc */}
      <AppFilter showActions={false} className="device-report__filter">
        <AppFilterField width={180}>
          <label className="device-report__label">Chọn ngày</label>

          <AppDatePicker
            width="100%"
            value={selectedDate}
            onChange={(date) => setSelectedDate(date)}
          />
        </AppFilterField>

        <AppFilterField width={190}>
          <label className="device-report__label">Chọn giờ</label>

          <AppTimePicker
            width="100%"
            value={selectedTime}
            format="HH:mm:ss"
            onChange={(time) => setSelectedTime(time)}
          />
        </AppFilterField>

        <AppFilterField width={180}>
          <label className="device-report__label">Cơ sở</label>

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

      {/* Nội dung báo cáo */}
      <div className="device-report__body">
        {/* Bảng thống kê bên trái */}
        <div className="device-report__table">
          <AppTable<DeviceReportItem>
            columns={columns}
            dataSource={filteredReports}
            rowKey="id"
            selectable={false}
            pagination={{
              current: currentPage,
              pageSize,
              total: filteredReports.length,
              onChange: (page) => setCurrentPage(page),
            }}
          />
        </div>

        {/* Biểu đồ dùng chung bên phải */}
        <div className="device-report__charts">
          <ReportCharts
            barData={deviceBarData}
            barSeries={deviceBarSeries}
            circleData={deviceCircleData}
          />
        </div>
      </div>
    </div>
  );
}

export default DeviceReport;
