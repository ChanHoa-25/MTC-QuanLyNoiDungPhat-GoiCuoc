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
import AppSearch from "../../../../components/common/AppSearch";
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
  facilityReportsMock,
  facilityProviderStatisticsMock,
  facilityCircleStatisticsMock,
} from "../../data/reports.mock";

import type { FacilityReportItem } from "../../types/report.types";

import "./FacilityReport.css";

// Cấu hình các cột biểu đồ dành cho tab Cơ sở
const facilityBarSeries: ReportBarSeries[] = [
  {
    dataKey: "provider3",
    name: "Nhà cung cấp 3",
    color: "#9CC3FF",
  },
  {
    dataKey: "provider2",
    name: "Nhà cung cấp 2",
    color: "#72F27F",
  },
  {
    dataKey: "provider1",
    name: "Nhà cung cấp 1",
    color: "#FF85B1",
  },
  {
    dataKey: "viettel",
    name: "Viettel",
    color: "#FFC93F",
  },
  {
    dataKey: "mobifone",
    name: "MobiFone",
    color: "#C1B6F2",
  },
];

function FacilityReport() {
  const { setActions } = useActionPanel();

  // Bộ lọc ngày, giờ và từ khóa
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(
    dayjs("2021-10-10"),
  );

  const [selectedTime, setSelectedTime] = useState<Dayjs | null>(
    dayjs().hour(14).minute(4).second(30),
  );

  const [keyword, setKeyword] = useState("");

  // Đăng ký nút xuất báo cáo với MainLayout
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

    // Xóa action khi rời tab Cơ sở
    return () => {
      setActions([]);
    };
  }, [setActions]);

  // Lọc danh sách cơ sở theo từ khóa
  const filteredReports = useMemo(() => {
    const search = keyword.trim().toLowerCase();

    if (!search) {
      return facilityReportsMock;
    }

    return facilityReportsMock.filter((item) =>
      item.facilityName.toLowerCase().includes(search),
    );
  }, [keyword]);

  // Lọc dữ liệu biểu đồ cột theo danh sách cơ sở
  const filteredProviderStatistics = useMemo(() => {
    const facilityNames = new Set(
      filteredReports.map((item) => item.facilityName),
    );

    return facilityProviderStatisticsMock.filter((item) =>
      facilityNames.has(item.facilityName),
    );
  }, [filteredReports]);

  // Lọc dữ liệu biểu đồ tròn theo danh sách cơ sở
  const filteredCircleStatistics = useMemo(() => {
    const facilityNames = new Set(
      filteredReports.map((item) => item.facilityName),
    );

    return facilityCircleStatisticsMock.filter((item) =>
      facilityNames.has(item.facilityName),
    );
  }, [filteredReports]);

  // Chuyển dữ liệu biểu đồ cột sang cấu trúc dùng chung
  const facilityBarData: ReportBarData[] = useMemo(
    () =>
      filteredProviderStatistics.map((item) => ({
        name: item.facilityName,
        provider3: item.provider3,
        provider2: item.provider2,
        provider1: item.provider1,
        viettel: item.viettel,
        mobifone: item.mobifone,
      })),
    [filteredProviderStatistics],
  );

  // Chuyển dữ liệu biểu đồ tròn sang cấu trúc dùng chung
  const facilityCircleData: ReportCircleData[] = useMemo(
    () =>
      filteredCircleStatistics.map((item) => ({
        id: item.id,
        name: item.facilityName,
        value: item.value,
        color: item.color,
        backgroundColor: item.backgroundColor,
      })),
    [filteredCircleStatistics],
  );

  // Xử lý xem chi tiết
  const handleViewDetail = (record: FacilityReportItem) => {
    message.info(`Xem chi tiết cơ sở: ${record.facilityName}`);
  };

  // Cấu hình bảng báo cáo cơ sở
  const columns: ColumnsType<FacilityReportItem> = [
    {
      title: "STT",
      key: "index",
      width: 60,
      align: "center",
      render: (_value, _record, index) => index + 1,
    },
    {
      title: "Cơ sở",
      dataIndex: "facilityName",
      key: "facilityName",
      width: 165,
    },
    {
      title: "Tổng số cấp con",
      dataIndex: "totalChildren",
      key: "totalChildren",
      width: 124,
    },
    {
      title: "Chi tiết",
      key: "actions",
      align: "center",
      width: 100,
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
    <div className="facility-report">
      <div className="facility-report__content">
        {/* Bên trái: Bộ lọc và bảng */}
        <div className="facility-report__left">
          <h2 className="facility-report__heading">Báo cáo về cơ sở</h2>

          {/* Bộ lọc ngày và giờ */}
          <AppFilter showActions={false} className="facility-report__filter">
            <AppFilterField width={210}>
              <label className="facility-report__label">Chọn ngày</label>

              <AppDatePicker
                width="100%"
                value={selectedDate}
                onChange={(date) => setSelectedDate(date)}
              />
            </AppFilterField>

            <AppFilterField width={222}>
              <label className="facility-report__label">Chọn giờ</label>

              <AppTimePicker
                width="100%"
                value={selectedTime}
                format="HH:mm:ss"
                onChange={(time) => setSelectedTime(time)}
              />
            </AppFilterField>
          </AppFilter>

          {/* Tìm kiếm theo từ khóa */}
          <div className="facility-report__search">
            <label className="facility-report__label">Từ khóa</label>

            <AppSearch
              width="100%"
              placeholder="Say something"
              value={keyword}
              onChange={setKeyword}
            />
          </div>

          {/* Bảng danh sách cơ sở */}
          <div className="facility-report__table-section">
            <h3 className="facility-report__heading">Báo cáo về cơ sở</h3>

            <AppTable<FacilityReportItem>
              columns={columns}
              dataSource={filteredReports}
              rowKey="id"
              selectable={false}
              pagination={false}
            />
          </div>
        </div>

        {/* Bên phải: Biểu đồ dùng chung */}
        <div className="facility-report__right">
          <ReportCharts
            barData={facilityBarData}
            barSeries={facilityBarSeries}
            circleData={facilityCircleData}
          />
        </div>
      </div>
    </div>
  );
}

export default FacilityReport;
