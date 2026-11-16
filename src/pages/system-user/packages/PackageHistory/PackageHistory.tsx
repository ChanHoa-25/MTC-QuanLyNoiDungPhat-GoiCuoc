import { useMemo, useState } from "react";
import type { ColumnsType } from "antd/es/table";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { ArrowRight } from "lucide-react";

import AppFilter, {
  AppFilterField,
} from "../../../../components/common/AppFilter";
import AppTimePicker from "../../../../components/common/AppTimePicker";
import AppDatePicker from "../../../../components/common/AppDatePicker";
import AppSelect from "../../../../components/common/AppSelect";
import AppSearch from "../../../../components/common/AppSearch";
import AppTable from "../../../../components/common/AppTable";
import AppStatusTag from "../../../../components/common/AppStatusTag";

import PackageHistoryStats from "../PackageHistoryStats/PackageHistoryStats";

import { PACKAGE_HISTORY_MOCK } from "../data/packageHistory.mock";
import type {
  PackageHistoryItem,
  PaymentStatus,
} from "../types/packageHistory.types";

import "./PackageHistory.css";

const PAGE_SIZE = 10;

const paymentLabels: Record<PaymentStatus, string> = {
  success: "Thành công",
  cancelled: "Đã hủy",
  processing: "Đang xử lý",
  failed: "Thất bại",
};

const paymentVariants: Record<
  PaymentStatus,
  "green" | "yellow" | "red" | "gray"
> = {
  success: "green",
  cancelled: "yellow",
  processing: "gray",
  failed: "red",
};

const formatMoney = (value: number) =>
  `${new Intl.NumberFormat("vi-VN").format(value)} VND`;

const formatDateTime = (value: string) =>
  dayjs(value).format("DD/MM/YYYY HH:mm:ss");

function combineDateTime(
  date: Dayjs | null,
  time: Dayjs | null,
  isEnd: boolean,
): Dayjs | null {
  if (!date) return null;

  if (!time) {
    return isEnd ? date.endOf("day") : date.startOf("day");
  }

  return date
    .hour(time.hour())
    .minute(time.minute())
    .second(time.second())
    .millisecond(isEnd ? 999 : 0);
}

function PackageHistory() {
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [startTime, setStartTime] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [endTime, setEndTime] = useState<Dayjs | null>(null);

  const [organization, setOrganization] = useState("ALL");
  const [capacity, setCapacity] = useState("ALL");
  const [paymentStatus, setPaymentStatus] = useState("ALL");
  const [keyword, setKeyword] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);

  const resetPage = () => setCurrentPage(1);

  const organizationOptions = useMemo(
    () => [
      { label: "Tất cả", value: "ALL" },
      ...Array.from(
        new Set(PACKAGE_HISTORY_MOCK.map((item) => item.organization)),
      ).map((value) => ({
        label: value,
        value,
      })),
    ],
    [],
  );

  const capacityOptions = useMemo(
    () => [
      { label: "Tất cả", value: "ALL" },
      ...Array.from(
        new Set(PACKAGE_HISTORY_MOCK.map((item) => item.capacity)),
      ).map((value) => ({
        label: value,
        value,
      })),
    ],
    [],
  );

  const startDateTime = useMemo(
    () => combineDateTime(startDate, startTime, false),
    [startDate, startTime],
  );

  const endDateTime = useMemo(
    () => combineDateTime(endDate, endTime, true),
    [endDate, endTime],
  );

  const filteredData = useMemo(() => {
    const search = keyword.trim().toLowerCase();

    return PACKAGE_HISTORY_MOCK.filter((item) => {
      const renewedAt = dayjs(item.renewedAt);

      const matchStart =
        !startDateTime || renewedAt.valueOf() >= startDateTime.valueOf();

      const matchEnd =
        !endDateTime || renewedAt.valueOf() <= endDateTime.valueOf();

      const matchOrganization =
        organization === "ALL" || item.organization === organization;

      const matchCapacity = capacity === "ALL" || item.capacity === capacity;

      const matchStatus =
        paymentStatus === "ALL" || item.paymentStatus === paymentStatus;

      const matchKeyword =
        !search ||
        [
          item.identifier,
          item.organization,
          item.capacity,
          item.duration,
          item.payer,
          item.paymentMethod,
        ].some((value) => value.toLowerCase().includes(search));

      return (
        matchStart &&
        matchEnd &&
        matchOrganization &&
        matchCapacity &&
        matchStatus &&
        matchKeyword
      );
    });
  }, [
    startDateTime,
    endDateTime,
    organization,
    capacity,
    paymentStatus,
    keyword,
  ]);

  const totalRevenue = useMemo(
    () =>
      filteredData
        .filter((item) => item.paymentStatus === "success")
        .reduce((total, item) => total + item.price, 0),
    [filteredData],
  );

  const successfulCount = useMemo(
    () =>
      filteredData.filter((item) => item.paymentStatus === "success").length,
    [filteredData],
  );

  const columns: ColumnsType<PackageHistoryItem> = [
    {
      title: "Mã định danh",
      dataIndex: "identifier",
      key: "identifier",
      width: 130,
    },
    {
      title: "Tên tổ chức",
      dataIndex: "organization",
      key: "organization",
      width: 190,
    },
    {
      title: "Thời gian gia hạn",
      dataIndex: "renewedAt",
      key: "renewedAt",
      width: 170,
      render: (value: string) => formatDateTime(value),
    },
    {
      title: "Dung lượng",
      dataIndex: "capacity",
      key: "capacity",
      width: 110,
    },
    {
      title: "Thời hạn",
      dataIndex: "duration",
      key: "duration",
      width: 110,
    },
    {
      title: "Thời gian hiệu lực",
      dataIndex: "effectivePeriod",
      key: "effectivePeriod",
      width: 210,
    },
    {
      title: "Giá gói cước",
      dataIndex: "price",
      key: "price",
      width: 145,
      render: (value: number) => formatMoney(value),
    },
    {
      title: "Người thanh toán",
      dataIndex: "payer",
      key: "payer",
      width: 160,
    },
    {
      title: "Phương thức",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      width: 150,
    },
    {
      title: "Trạng thái thanh toán",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      width: 185,
      render: (status: PaymentStatus) => (
        <AppStatusTag
          type="status"
          variant={paymentVariants[status]}
          label={paymentLabels[status]}
        />
      ),
    },
  ];

  return (
    <div className="package-history">
      <h2 className="package-history-title">Lịch sử gia hạn gói cước</h2>

      <PackageHistoryStats
        totalTransactions={`${successfulCount}/${filteredData.length}`}
        totalRevenue={formatMoney(totalRevenue)}
      />

      <AppFilter
        className="package-history-filters"
        showActions={false}
        gap={16}>
        <AppFilterField width="auto" className="package-history-filter-date">
          <label className="package-history-filter-label">
            Thời gian gia hạn
          </label>

          <div className="package-history-date-range">
            <div className="package-history-date-group">
              <AppTimePicker
                width={110}
                value={startTime}
                format="HH:mm"
                placeholder="00:00"
                onChange={(value) => {
                  setStartTime(value);
                  resetPage();
                }}
              />

              <AppDatePicker
                width={150}
                value={startDate}
                placeholder="Từ ngày"
                disabledDate={(date) =>
                  !!endDate && date.isAfter(endDate, "day")
                }
                onChange={(value) => {
                  setStartDate(value);
                  resetPage();
                }}
              />
            </div>

            <ArrowRight size={18} className="package-history-date-arrow" />

            <div className="package-history-date-group">
              <AppTimePicker
                width={110}
                value={endTime}
                format="HH:mm"
                placeholder="00:00"
                onChange={(value) => {
                  setEndTime(value);
                  resetPage();
                }}
              />

              <AppDatePicker
                width={150}
                value={endDate}
                placeholder="Đến ngày"
                disabledDate={(date) =>
                  !!startDate && date.isBefore(startDate, "day")
                }
                onChange={(value) => {
                  setEndDate(value);
                  resetPage();
                }}
              />
            </div>
          </div>
        </AppFilterField>

        <AppFilterField width="auto" className="package-history-filter-select">
          <label className="package-history-filter-label">Tổ chức</label>

          <AppSelect
            width="100%"
            value={organization}
            options={organizationOptions}
            onChange={(value) => {
              setOrganization((value as string) ?? "ALL");
              resetPage();
            }}
          />
        </AppFilterField>

        <AppFilterField width="auto" className="package-history-filter-select">
          <label className="package-history-filter-label">Dung lượng</label>

          <AppSelect
            width="100%"
            value={capacity}
            options={capacityOptions}
            onChange={(value) => {
              setCapacity((value as string) ?? "ALL");
              resetPage();
            }}
          />
        </AppFilterField>

        <AppFilterField width="auto" className="package-history-filter-select">
          <label className="package-history-filter-label">
            Trạng thái thanh toán
          </label>

          <AppSelect
            width="100%"
            value={paymentStatus}
            options={[
              { label: "Tất cả", value: "ALL" },
              { label: "Thành công", value: "success" },
              { label: "Đã hủy", value: "cancelled" },
              { label: "Đang xử lý", value: "processing" },
              { label: "Thất bại", value: "failed" },
            ]}
            onChange={(value) => {
              setPaymentStatus((value as string) ?? "ALL");
              resetPage();
            }}
          />
        </AppFilterField>

        <AppFilterField width="auto" className="package-history-filter-search">
          <label className="package-history-filter-label">Từ khóa</label>

          <AppSearch
            width="100%"
            placeholder="Nhập từ khóa"
            value={keyword}
            onChange={(value) => {
              setKeyword(value);
              resetPage();
            }}
          />
        </AppFilterField>
      </AppFilter>

      <div className="package-history-table-area">
        <AppTable<PackageHistoryItem>
          className="package-history-table"
          rowKey="id"
          columns={columns}
          dataSource={filteredData}
          scroll={{ x: "max-content" }}
          serverSidePagination
          pagination={{
            current: currentPage,
            pageSize,
            total: filteredData.length,
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

export default PackageHistory;
