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
  sourceReportsMock,
  sourceBroadcastStatisticsMock,
  sourceCircleStatisticsMock,
} from "../../data/sourceReports.mock";

import type { SourceReportItem } from "../../types/sourceReport.types";

import { exportReportToCSV } from "../../utils/exportReport";

import "./SourceReport.css";

// Cấu hình các cột biểu đồ dùng cho tab Nguồn tin
const sourceBarSeries: ReportBarSeries[] = [
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

function SourceReport() {
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

  // Đăng ký nút xuất báo cáo
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
              "Số lượng bản tin": item.deviceCount,
              "Bản tin khác": item.otherDeviceCount,
            })),
            "Bao_cao_ban_tin_theo_nguon_tin",
          );
        },
      },
    ]);

    return () => {
      setActions([]);
    };
  }, [setActions]);

  // Danh sách cơ sở cho AppSelect
  const facilityOptions = useMemo(
    () => [
      {
        label: "Tất cả",
        value: "all",
      },
      ...sourceReportsMock.map((item) => ({
        label: item.facilityName,
        value: item.facilityName,
      })),
    ],
    [],
  );

  // Lọc dữ liệu bảng theo cơ sở
  const filteredReports = useMemo(() => {
    if (selectedFacility === "all") {
      return sourceReportsMock;
    }

    return sourceReportsMock.filter(
      (item) => item.facilityName === selectedFacility,
    );
  }, [selectedFacility]);

  // Lọc dữ liệu biểu đồ cột
  const filteredStatistics = useMemo(() => {
    const facilityNames = new Set(
      filteredReports.map((item) => item.facilityName),
    );

    return sourceBroadcastStatisticsMock.filter((item) =>
      facilityNames.has(item.facilityName),
    );
  }, [filteredReports]);

  // Lọc dữ liệu biểu đồ tròn
  const filteredCircles = useMemo(() => {
    const facilityNames = new Set(
      filteredReports.map((item) => item.facilityName),
    );

    return sourceCircleStatisticsMock.filter((item) =>
      facilityNames.has(item.facilityName),
    );
  }, [filteredReports]);

  // Chuyển dữ liệu biểu đồ cột về cấu trúc chung
  const sourceBarData: ReportBarData[] = useMemo(
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

  // Chuyển dữ liệu biểu đồ tròn về cấu trúc chung
  const sourceCircleData: ReportCircleData[] = useMemo(
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

  // Xử lý xem chi tiết
  const handleViewDetail = (record: SourceReportItem) => {
    message.info(`Xem chi tiết cơ sở: ${record.facilityName}`);
  };

  // Cấu hình bảng
  const columns: ColumnsType<SourceReportItem> = [
    {
      title: "STT",
      key: "index",
      width: 50,
      align: "center",
      render: (_value, _record, index) => (currentPage - 1) * 10 + index + 1,
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
              icon: <Info size={24} color="#F26D21" />,
              tooltip: "Xem chi tiết",
              onClick: () => handleViewDetail(record),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="source-report">
      {/* Tiêu đề */}
      <h2 className="source-report__heading">
        Báo cáo số lượng nguồn tin theo nhà cung cấp
      </h2>

      {/* Bộ lọc */}
      <AppFilter showActions={false} className="source-report__filter">
        <AppFilterField width={180}>
          <label className="source-report__label">Chọn ngày</label>

          <AppDatePicker
            width="100%"
            value={selectedDate}
            onChange={(date) => setSelectedDate(date)}
          />
        </AppFilterField>

        <AppFilterField width={190}>
          <label className="source-report__label">Chọn giờ</label>

          <AppTimePicker
            width="100%"
            value={selectedTime}
            format="HH:mm:ss"
            onChange={(time) => setSelectedTime(time)}
          />
        </AppFilterField>

        <AppFilterField width={180}>
          <label className="source-report__label">Cơ sở</label>

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
      <div className="source-report__body">
        {/* Bảng bên trái */}
        <div className="source-report__table">
          <AppTable<SourceReportItem>
            columns={columns}
            dataSource={filteredReports}
            rowKey="id"
            selectable={false}
            pagination={{
              current: currentPage,
              pageSize: 10,
              total: filteredReports.length,
              onChange: (page) => setCurrentPage(page),
            }}
          />
        </div>

        {/* Biểu đồ bên phải */}
        <div className="source-report__charts">
          <ReportCharts
            barData={sourceBarData}
            barSeries={sourceBarSeries}
            circleData={sourceCircleData}
          />
        </div>
      </div>
    </div>
  );
}

export default SourceReport;
