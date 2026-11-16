import React, { useMemo, useState } from "react";
import type { ColumnsType } from "antd/es/table";
import type { DateRangeValue } from "../../../components/common/AppDateRangePicker";
import dayjs from "dayjs";

import "./OrganizationDetailPage.css";

import AppButton from "../../../components/common/AppButton";
import AppStatusTag from "../../../components/common/AppStatusTag";
import AppTable from "../../../components/common/AppTable";
import AppDateRangePicker from "../../../components/common/AppDateRangePicker";
import AppSearch from "../../../components/common/AppSearch";

import type {
  OrganizationItem,
  TransactionRecord,
} from "./types/organization.types";

import { MOCK_TRANSACTIONS } from "./data/organizations.mock";

interface Props {
  org: OrganizationItem;
  onBack: () => void;
  onEdit: () => void;
  onChangePackage: () => void;
}

type TransactionStatusVariant = "green" | "orange" | "blue" | "red";

const statusVariantMap: Record<string, TransactionStatusVariant> = {
  success: "green",
  cancelled: "orange",
  pending: "blue",
  failed: "red",
};

const transactionColumns: ColumnsType<TransactionRecord> = [
  {
    title: "Thời gian gia hạn",
    dataIndex: "time",
    key: "time",
    width: 160,
  },
  {
    title: "Dung lượng",
    dataIndex: "storage",
    key: "storage",
    width: 90,
  },
  {
    title: "Thời gian hiệu lực",
    dataIndex: "validity",
    key: "validity",
    width: 180,
  },
  {
    title: "Giá gói cước",
    dataIndex: "price",
    key: "price",
    width: 115,
  },
  {
    title: "Người gia hạn",
    dataIndex: "handler",
    key: "handler",
    width: 125,
  },
  {
    title: "Số điện thoại",
    dataIndex: "phone",
    key: "phone",
    width: 115,
  },
  {
    title: "Trạng thái",
    dataIndex: "status",
    key: "status",
    width: 120,
    render: (status: string, record: TransactionRecord) => (
      <AppStatusTag
        type="status"
        variant={statusVariantMap[status] ?? "green"}
        label={record.statusLabel}
      />
    ),
  },
  {
    title: "Phương thức",
    dataIndex: "method",
    key: "method",
    width: 120,
  },
];

const OrganizationDetailPage: React.FC<Props> = ({
  org,
  onBack,
  onEdit,
  onChangePackage,
}) => {
  const [dateRange, setDateRange] = useState<DateRangeValue>([null, null]);
  const [keyword, setKeyword] = useState("");

  const filteredTransactions = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return MOCK_TRANSACTIONS.filter((transaction) => {
      const searchableText = [
        transaction.time,
        transaction.storage,
        transaction.validity,
        transaction.price,
        transaction.handler,
        transaction.phone,
        transaction.statusLabel,
        transaction.method,
      ]
        .map((value) => String(value ?? ""))
        .join(" ")
        .toLowerCase();

      const matchesKeyword =
        !normalizedKeyword || searchableText.includes(normalizedKeyword);

      const [startDate, endDate] = dateRange;

      const transactionDate = dayjs(
        String(transaction.time).slice(0, 10),
        "DD/MM/YYYY",
        true,
      );

      const matchesStart =
        !startDate ||
        (transactionDate.isValid() &&
          !transactionDate.isBefore(startDate, "day"));

      const matchesEnd =
        !endDate ||
        (transactionDate.isValid() && !transactionDate.isAfter(endDate, "day"));

      return matchesKeyword && matchesStart && matchesEnd;
    });
  }, [keyword, dateRange]);

  return (
    <div className="org-detail-container">
      <div className="org-detail-grid">
        <section className="org-detail-card org-detail-card--info">
          <div className="org-detail-card-content">
            <h3 className="org-detail-title">Thông tin tổ chức</h3>

            <div className="org-detail-info-row">
              <span className="org-detail-label">Mã định danh tổ chức:</span>
              <span className="org-detail-value">{org.code}</span>
            </div>

            <div className="org-detail-info-row">
              <span className="org-detail-label">Tên tổ chức:</span>
              <span className="org-detail-value">{org.name}</span>
            </div>

            <div className="org-detail-info-row">
              <span className="org-detail-label">Trạng thái:</span>
              <AppStatusTag
                type="status"
                variant={
                  org.status === "green" ||
                  org.status === "orange" ||
                  org.status === "blue" ||
                  org.status === "red" ||
                  org.status === "yellow" ||
                  org.status === "darkRed" ||
                  org.status === "gray" ||
                  org.status === "outlineOrange"
                    ? org.status
                    : "green"
                }
                label={org.statusLabel || "hạn"}
              />
            </div>

            <div className="org-detail-info-row org-detail-info-row--storage">
              <span className="org-detail-label">Dung lượng sử dụng:</span>
              <strong>2GB / 3GB</strong>
            </div>

            <div className="org-progress-bg">
              <div className="org-progress-fill" />
            </div>

            <h3 className="org-detail-title org-detail-title--account">
              Thông tin tài khoản
            </h3>

            <div className="org-detail-info-row">
              <span className="org-detail-label">Họ và tên:</span>
              <span className="org-detail-value">
                {org.representativeLastName} {org.representativeFirstName}
              </span>
            </div>

            <div className="org-detail-info-row">
              <span className="org-detail-label">Tên đăng nhập:</span>
              <span className="org-detail-value">{org.username}</span>
            </div>

            <div className="org-detail-info-row">
              <span className="org-detail-label">Email:</span>
              <span className="org-detail-value">{org.email}</span>
            </div>

            <div className="org-detail-info-row">
              <span className="org-detail-label">Số điện thoại:</span>
              <span className="org-detail-value">{org.phone}</span>
            </div>

            <div className="org-detail-info-row">
              <span className="org-detail-label">Ngày sinh:</span>
              <span className="org-detail-value">{org.birthday}</span>
            </div>

            <div className="org-detail-info-row">
              <span className="org-detail-label">Múi giờ:</span>
              <span className="org-detail-value">{org.timezone}</span>
            </div>
          </div>

          <div className="org-detail-actions">
            <AppButton variant="primary" width={136} onClick={onEdit}>
              Chỉnh sửa
            </AppButton>
          </div>
        </section>

        <section className="org-detail-card org-detail-card--package">
          <h3 className="org-detail-title">Thông tin gói cước</h3>

          <div className="org-package-banner">
            <div className="org-package-box">
              <span className="org-package-box-gb">3GB</span>

              <div className="org-package-box-info">
                <span className="org-package-box-date">
                  25/07/2023 - 25/08/2023
                </span>

                <div className="org-package-box-tags">
                  <span className="org-package-tag warning">3 ngày</span>
                  <span className="org-package-tag danger">
                    Ngừng kinh doanh
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="org-detail-add-package"
              onClick={onChangePackage}
              aria-label="Thay đổi gói cước">
              <span className="org-detail-add-package-icon">+</span>
            </button>
          </div>

          <h3 className="org-detail-title org-detail-title--history">
            Lịch sử giao dịch
          </h3>

          <div className="org-detail-filter-row">
            <div className="org-detail-filter-date">
              <label className="org-detail-filter-label">
                Thời gian gia hạn
              </label>

              <AppDateRangePicker
                width="100%"
                value={dateRange}
                onChange={setDateRange}
                startPlaceholder="02/02/2000"
                endPlaceholder="00/00/0000"
              />
            </div>

            <div className="org-detail-filter-search">
              <label className="org-detail-filter-label">Từ khóa</label>

              <AppSearch
                width="100%"
                placeholder="Từ khóa"
                value={keyword}
                onChange={setKeyword}
              />
            </div>
          </div>

          <div className="org-detail-table-wrapper">
            <AppTable<TransactionRecord>
              className="org-detail-table"
              columns={transactionColumns}
              dataSource={filteredTransactions}
              rowKey="id"
              pagination={{
                pageSize: 10,
              }}
              scroll={{ x: 1025 }}
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default OrganizationDetailPage;
