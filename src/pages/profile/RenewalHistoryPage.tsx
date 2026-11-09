import { useMemo, useState } from "react";
import type { Dayjs } from "dayjs";
import { Switch, message } from "antd";
import type { TableProps } from "antd";

import AppHeader from "../../layouts/components/AppHeader";
import AppButton from "../../components/common/AppButton/AppButton";
import AppSearch from "../../components/common/AppSearch";
import AppDatePicker from "../../components/common/AppDatePicker";
import AppTable from "../../components/common/AppTable/AppTable";

import Logo from "../../assets/images/Logo.png";
import { useAuth } from "../../contexts/AuthContext";
import { usePackages } from "../../contexts/PackageContext";
import PackageRenewModal from "../packages/components/PackageRenewModal";
import PackageUpgradeModalCustomer from "../packages/components/PackageUpgradeModalCustomer";

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

const initialHistory: RenewalHistory[] = [
  {
    id: "1",
    renewer: "Nguyễn Văn A",
    phone: "0951454354",
    renewedAt: "25/07/2026 19:00:00",
    packageName: "Gói Tiêu chuẩn 20GB",
    price: "1.440.000 VNĐ",
    paymentMethod: "Chuyển khoản ngân hàng",
  },
  {
    id: "2",
    renewer: "Nguyễn Văn A",
    phone: "0951454354",
    renewedAt: "25/06/2026 19:00:00",
    packageName: "Combo Nâng cấp: +20GB & +10 Thiết bị",
    price: "990.000 VNĐ",
    paymentMethod: "Thẻ quốc tế",
  },
  {
    id: "3",
    renewer: "Nguyễn Văn A",
    phone: "0951454354",
    renewedAt: "25/05/2026 19:00:00",
    packageName: "Gói Cơ bản 5GB (1 tháng)",
    price: "150.000 VNĐ",
    paymentMethod: "Ví MOMO",
  },
  {
    id: "4",
    renewer: "Nguyễn Văn A",
    phone: "0951454354",
    renewedAt: "25/04/2026 19:00:00",
    packageName: "Gói Mở rộng Dung lượng +10GB",
    price: "250.000 VNĐ",
    paymentMethod: "Ví MOMO",
  },
  {
    id: "5",
    renewer: "Nguyễn Văn A",
    phone: "0951454354",
    renewedAt: "25/03/2026 19:00:00",
    packageName: "Gói Cơ bản 5GB (1 tháng)",
    price: "150.000 VNĐ",
    paymentMethod: "Thẻ quốc tế",
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
    width: "20%",
  },
  {
    title: "Giá gói cước",
    dataIndex: "price",
    key: "price",
    width: "15%",
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
  const { user, updateAutoRenew } = useAuth();
  const { transactions } = usePackages();

  const [openRenewModal, setOpenRenewModal] = useState(false);
  const [openUpgradeModal, setOpenUpgradeModal] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [renewalDate, setRenewalDate] = useState<Dayjs | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Combine initialHistory with new transactions from PackageContext
  const combinedHistory = useMemo(() => {
    const trxHistory: RenewalHistory[] = transactions.map((t) => ({
      id: t.id,
      renewer: user.fullName || "Người dùng quản trị",
      phone: user.phone || "0909123456",
      renewedAt: t.createdAt,
      packageName: t.packageName,
      price: `${t.amountVND.toLocaleString("vi-VN")} VNĐ`,
      paymentMethod:
        t.paymentMethod === "bank_transfer"
          ? "Chuyển khoản ngân hàng"
          : t.paymentMethod === "credit_card"
          ? "Thẻ quốc tế"
          : "Ví MOMO",
    }));

    return [...trxHistory, ...initialHistory];
  }, [transactions, user]);

  const filteredData = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();

    return combinedHistory.filter((item) => {
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
        item.renewedAt.includes(renewalDate.format("DD/MM/YYYY")) ||
        item.renewedAt.includes(renewalDate.format("YYYY-MM-DD"));

      return matchesSearch && matchesDate;
    });
  }, [combinedHistory, searchKeyword, renewalDate]);

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

          <div className="renewal-package-description">Gói cước hiện tại:</div>

          <div className="renewal-package-capacity">
            <strong>{user.currentPackage.capacity}</strong>
            <span>{user.currentPackage.cycle}</span>
          </div>

          <div className="renewal-package-details">
            <div className="renewal-package-row">
              <span>Thời gian gia hạn:</span>
              <strong>{user.currentPackage.expirationDate}</strong>
            </div>

            <div className="renewal-package-row">
              <span>Gia hạn tự động:</span>
              <Switch
                size="small"
                checked={user.currentPackage.autoRenew}
                onChange={(checked) => {
                  updateAutoRenew(checked);
                  messageApi.success(
                    checked ? "Đã bật tự động gia hạn" : "Đã tắt tự động gia hạn",
                  );
                }}
              />
            </div>

            <div className="renewal-package-row">
              <span>Gia hạn ngay:</span>
              <AppButton
                width={80}
                height={36}
                className="renewal-package-button"
                onClick={() => setOpenRenewModal(true)}>
                Gia hạn
              </AppButton>
            </div>

            <div className="renewal-package-row">
              <span>Nâng cấp gói cước:</span>
              <AppButton
                width={80}
                height={36}
                className="renewal-package-button"
                onClick={() => setOpenUpgradeModal(true)}>
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
                placeholder="Tìm tên gói, phương thức..."
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

      {/* Popups */}
      <PackageRenewModal
        open={openRenewModal}
        onClose={() => setOpenRenewModal(false)}
      />

      <PackageUpgradeModalCustomer
        open={openUpgradeModal}
        onClose={() => setOpenUpgradeModal(false)}
      />

      <footer className="renewal-history-footer">Powered by AltaSoftware</footer>
    </div>
  );
}

export default RenewalHistoryPage;
