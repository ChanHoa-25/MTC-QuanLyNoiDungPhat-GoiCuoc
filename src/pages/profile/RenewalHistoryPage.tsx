import { useMemo, useState } from "react";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { Switch, message } from "antd";
import type { TableProps } from "antd";

import AppHeader from "../../layouts/components/AppHeader";
import AppButton from "../../components/common/AppButton/AppButton";
import AppSearch from "../../components/common/AppSearch";
import AppDatePicker from "../../components/common/AppDatePicker";
import AppTable from "../../components/common/AppTable/AppTable";

import Logo from "../../assets/images/Logo.png";
import { mockSubscription } from "./profile.mock";

import "./RenewalHistoryPage.css";

interface RenewalHistory {
  id: string;
  renewer: string;
  phone: string;
  renewedAt: string;
  packageName: string;
  price: string;
  paymentMethod: string;
}

const mockRenewalHistory: RenewalHistory[] = [
  {
    id: "1",
    renewer: "Nguyễn Văn A",
    phone: "0951454354",
    renewedAt: "25/07/2021 19:00:00",
    packageName: "5GB/tháng",
    price: "50.000 VNĐ",
    paymentMethod: "Chuyển khoản ngân hàng",
  },
  {
    id: "2",
    renewer: "Nguyễn Văn A",
    phone: "0951454354",
    renewedAt: "25/06/2021 19:00:00",
    packageName: "5GB/tháng",
    price: "50.000 VNĐ",
    paymentMethod: "Chuyển khoản ngân hàng",
  },
  {
    id: "3",
    renewer: "Nguyễn Văn A",
    phone: "0951454354",
    renewedAt: "25/05/2021 19:00:00",
    packageName: "5GB/tháng",
    price: "50.000 VNĐ",
    paymentMethod: "Ví MOMO",
  },
  {
    id: "4",
    renewer: "Nguyễn Văn A",
    phone: "0951454354",
    renewedAt: "25/04/2021 19:00:00",
    packageName: "5GB/tháng",
    price: "50.000 VNĐ",
    paymentMethod: "Ví MOMO",
  },
  {
    id: "5",
    renewer: "Nguyễn Văn A",
    phone: "0951454354",
    renewedAt: "25/03/2021 19:00:00",
    packageName: "5GB/tháng",
    price: "50.000 VNĐ",
    paymentMethod: "Thẻ quốc tế",
  },
  {
    id: "6",
    renewer: "Nguyễn Văn A",
    phone: "0951454354",
    renewedAt: "25/02/2021 19:00:00",
    packageName: "10GB/tháng",
    price: "100.000 VNĐ",
    paymentMethod: "Thẻ quốc tế",
  },
  {
    id: "7",
    renewer: "Nguyễn Văn A",
    phone: "0951454354",
    renewedAt: "25/01/2021 19:00:00",
    packageName: "10GB/tháng",
    price: "100.000 VNĐ",
    paymentMethod: "Ví MOMO",
  },
];

const columns: TableProps<RenewalHistory>["columns"] = [
  {
    title: "Người gia hạn",
    dataIndex: "renewer",
    key: "renewer",
    width: "18%",
  },
  {
    title: "Số điện thoại",
    dataIndex: "phone",
    key: "phone",
    width: "15%",
  },
  {
    title: "Thời gian gia hạn",
    dataIndex: "renewedAt",
    key: "renewedAt",
    width: "17%",
  },
  {
    title: "Gói cước gia hạn",
    dataIndex: "packageName",
    key: "packageName",
    width: "16%",
  },
  {
    title: "Giá gói cước",
    dataIndex: "price",
    key: "price",
    width: "16%",
  },
  {
    title: "Phương thức thanh toán",
    dataIndex: "paymentMethod",
    key: "paymentMethod",
    width: "18%",
  },
];

function RenewalHistoryPage() {
  const [messageApi, contextHolder] = message.useMessage();

  const [autoRenew, setAutoRenew] = useState(mockSubscription.autoRenew);

  const [searchInput, setSearchInput] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [renewalDate, setRenewalDate] = useState<Dayjs | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();

    return mockRenewalHistory.filter((item) => {
      const matchesSearch =
        !keyword ||
        [
          item.renewer,
          item.phone,
          item.renewedAt,
          item.packageName,
          item.price,
          item.paymentMethod,
        ].some((value) => value.toLowerCase().includes(keyword));

      const matchesDate =
        !renewalDate ||
        dayjs(item.renewedAt.slice(0, 10), "DD/MM/YYYY").format(
          "DD/MM/YYYY",
        ) === renewalDate.format("DD/MM/YYYY");

      return matchesSearch && matchesDate;
    });
  }, [searchKeyword, renewalDate]);

  const handleSearch = (value: string) => {
    setSearchKeyword(value);
    setCurrentPage(1);
  };

  return (
    <div className="renewal-history-page">
      {contextHolder}

      <header className="renewal-history-header">
        <AppHeader variant="profile" />
      </header>

      <div className="renewal-history-logo">
        <img src={Logo} alt="MTC" />
      </div>

      <main className="renewal-history-content">
        <section className="renewal-package-card">
          <h2>Thông tin gói cước</h2>

          <div className="renewal-package-description">
            Gói cước trong tháng:
          </div>

          <div className="renewal-package-capacity">
            <strong>{mockSubscription.capacity}</strong>
            <span>{mockSubscription.cycle}</span>
          </div>

          <div className="renewal-package-details">
            <div className="renewal-package-row">
              <span>Thời gian gia hạn:</span>
              <strong>{mockSubscription.expirationDate}</strong>
            </div>

            <div className="renewal-package-row">
              <span>Gia hạn tự động:</span>
              <Switch
                size="small"
                checked={autoRenew}
                onChange={setAutoRenew}
              />
            </div>

            <div className="renewal-package-row">
              <span>Gia hạn ngay:</span>
              <AppButton
                width={80}
                height={36}
                className="renewal-package-button"
                onClick={() =>
                  messageApi.info("Chưa tích hợp chức năng gia hạn")
                }>
                Gia hạn
              </AppButton>
            </div>

            <div className="renewal-package-row">
              <span>Nâng cấp gói cước:</span>
              <AppButton
                width={80}
                height={36}
                className="renewal-package-button"
                onClick={() =>
                  messageApi.info("Chưa tích hợp chức năng nâng cấp")
                }>
                Nâng cấp
              </AppButton>
            </div>
          </div>
        </section>

        <section className="renewal-history-card">
          <h2>Lịch sử gia hạn gói cước</h2>

          <div className="renewal-history-toolbar">
            <div className="renewal-history-date">
              <label>Thời gian gia hạn</label>
              <AppDatePicker
                width={180}
                placeholder="Chọn ngày"
                value={renewalDate}
                onChange={(date) => {
                  setRenewalDate(Array.isArray(date) ? null : date);
                  setCurrentPage(1);
                }}
              />
            </div>

            <div className="renewal-history-search">
              <label>Từ khóa</label>
              <AppSearch
                width={301}
                placeholder="Tên kênh/ URL/ Tần số"
                value={searchInput}
                onChange={setSearchInput}
                onSearch={handleSearch}
              />
            </div>
          </div>

          <AppTable<RenewalHistory>
            className="renewal-history-table"
            rowKey="id"
            columns={columns}
            dataSource={filteredData}
            selectable={false}
            pagination={{
              current: currentPage,
              pageSize: 10,
              total: filteredData.length,
              onChange: setCurrentPage,
            }}
          />
        </section>
      </main>

      <footer className="renewal-history-footer">
        Powered by AltaSoftware
      </footer>
    </div>
  );
}

export default RenewalHistoryPage;
