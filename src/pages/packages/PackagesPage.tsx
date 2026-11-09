import { useEffect, useMemo, useState } from "react";
import type { ColumnsType } from "antd/es/table";
import { Select, Tag, message } from "antd";
import {
  Layers,
  Receipt,
  Plus,
  SquarePen,
  Trash2,
  Eye,
  FileInput,
  CheckCircle,
  Clock,
  XCircle,
  Building,
  CreditCard,
  Smartphone,
  Check,
} from "lucide-react";

import AppTabs from "../../components/common/AppTabs";
import AppTable from "../../components/common/AppTable";
import AppSearch from "../../components/common/AppSearch";
import AppSelect from "../../components/common/AppSelect";
import AppConfirmModal from "../../components/common/AppConfirmModal";
import AppTableActions from "../../components/common/AppTableActions";
import type { AppActionPanelItem } from "../../components/common/AppActionPanel";
import { useActionPanel } from "../../contexts/ActionPanelContext";

import { usePackages } from "../../contexts/PackageContext";
import type {
  ServicePackage,
  UpgradePackage,
  PackageTransaction,
  PackageStatus,
} from "../../types/package.types";

import PackageFormModal from "./components/PackageFormModal";
import PackageDetailModal from "./components/PackageDetailModal";
import UpgradePackageModal from "./components/UpgradePackageModal";

import "./PackagesPage.css";

type PackageTabKey = "packages" | "upgrades" | "transactions";

const packageTabs = [
  { key: "packages", label: "Quản lý gói cước" },
  { key: "upgrades", label: "Gói nâng cấp (SYS-UPG)" },
  { key: "transactions", label: "Lịch sử giao dịch" },
];

export function PackagesPage() {
  const { setActions } = useActionPanel();
  const {
    packages,
    upgradePackages,
    transactions,
    addPackage,
    updatePackage,
    deletePackage,
    updatePackageStatus,
    addUpgradePackage,
    updateUpgradePackage,
    deleteUpgradePackage,
  } = usePackages();

  const [activeTab, setActiveTab] = useState<PackageTabKey>("packages");

  // Filters for Packages
  const [pkgSearch, setPkgSearch] = useState("");
  const [pkgStatusFilter, setPkgStatusFilter] = useState<string>("all");
  const [pkgDurationFilter, setPkgDurationFilter] = useState<string>("all");

  // Filters for Upgrades
  const [upgSearch, setUpgSearch] = useState("");
  const [upgStatusFilter, setUpgStatusFilter] = useState<string>("all");

  // Filters for Transactions
  const [trxSearch, setTrxSearch] = useState("");
  const [trxTypeFilter, setTrxTypeFilter] = useState<string>("all");
  const [trxStatusFilter, setTrxStatusFilter] = useState<string>("all");

  // Modals state
  const [isPkgFormOpen, setIsPkgFormOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<ServicePackage | null>(null);

  const [isPkgDetailOpen, setIsPkgDetailOpen] = useState(false);
  const [selectedPkgDetail, setSelectedPkgDetail] = useState<ServicePackage | null>(null);

  const [isUpgFormOpen, setIsUpgFormOpen] = useState(false);
  const [editingUpg, setEditingUpg] = useState<UpgradePackage | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<{ type: "pkg" | "upg"; id: string; name: string } | null>(
    null,
  );

  // Export helper (CSV file download with UTF-8 BOM)
  const exportToCSV = (data: any[], filename: string) => {
    if (!data.length) {
      message.warning("Không có dữ liệu để xuất");
      return;
    }
    const headers = Object.keys(data[0]).join(",");
    const rows = data.map((item) =>
      Object.values(item)
        .map((val) => `"${String(val).replace(/"/g, '""')}"`)
        .join(","),
    );
    const csvContent = "\uFEFF" + [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success(`Đã xuất file [${filename}] thành công!`);
  };

  // Register floating ActionPanel according to active tab
  useEffect(() => {
    const actions: AppActionPanelItem[] = [];

    if (activeTab === "packages") {
      actions.push({
        key: "add-package",
        icon: <Plus size={24} color="#F26D21" />,
        tooltip: "Thêm gói cước",
        onClick: () => {
          setEditingPkg(null);
          setIsPkgFormOpen(true);
        },
      });
      actions.push({
        key: "export-packages",
        icon: <FileInput size={24} color="#F26D21" />,
        tooltip: "Xuất danh sách gói cước",
        onClick: () => {
          exportToCSV(
            filteredPackages.map((p) => ({
              "Mã gói": p.code,
              "Tên gói": p.name,
              "Dung lượng (GB)": p.storageGB,
              "Thiết bị": p.maxDevices,
              "Thời hạn (tháng)": p.durationMonths,
              "Giá (VNĐ)": p.priceVND,
              "Trạng thái": p.status,
              "Thuê bao": p.activeSubscribers,
            })),
            "Danh_sach_goi_cuoc_MTC",
          );
        },
      });
    } else if (activeTab === "upgrades") {
      actions.push({
        key: "add-upgrade",
        icon: <Plus size={24} color="#F26D21" />,
        tooltip: "Thêm gói nâng cấp",
        onClick: () => {
          setEditingUpg(null);
          setIsUpgFormOpen(true);
        },
      });
      actions.push({
        key: "export-upgrades",
        icon: <FileInput size={24} color="#F26D21" />,
        tooltip: "Xuất gói nâng cấp",
        onClick: () => {
          exportToCSV(
            filteredUpgrades.map((u) => ({
              "Mã gói": u.code,
              "Tên gói nâng cấp": u.name,
              "Dung lượng (+GB)": u.extraStorageGB,
              "Thiết bị (+thiết bị)": u.extraDevices,
              "Đơn giá (VNĐ)": u.priceVND,
              "Lượt mua": u.purchasedCount,
              "Trạng thái": u.status,
            })),
            "Goi_nang_cap_MTC",
          );
        },
      });
    } else if (activeTab === "transactions") {
      actions.push({
        key: "export-transactions",
        icon: <FileInput size={24} color="#F26D21" />,
        tooltip: "Xuất báo cáo giao dịch",
        onClick: () => {
          exportToCSV(
            filteredTransactions.map((t) => ({
              "Mã GD": t.id,
              "Tổ chức": t.orgName,
              "Gói cước": t.packageName,
              "Số tiền (VNĐ)": t.amountVND,
              "Loại GD": t.type,
              "Phương thức": t.paymentMethod,
              "Trạng thái": t.status,
              "Thời gian": t.createdAt,
            })),
            "Bao_cao_giao_dich_MTC",
          );
        },
      });
    }

    setActions(actions);
    return () => {
      setActions([]);
    };
  }, [activeTab, packages, upgradePackages, transactions]);

  // Filtered lists
  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => {
      const matchSearch =
        pkg.name.toLowerCase().includes(pkgSearch.toLowerCase()) ||
        pkg.code.toLowerCase().includes(pkgSearch.toLowerCase());
      const matchStatus = pkgStatusFilter === "all" || pkg.status === pkgStatusFilter;
      const matchDuration =
        pkgDurationFilter === "all" || String(pkg.durationMonths) === pkgDurationFilter;
      return matchSearch && matchStatus && matchDuration;
    });
  }, [packages, pkgSearch, pkgStatusFilter, pkgDurationFilter]);

  const filteredUpgrades = useMemo(() => {
    return upgradePackages.filter((upg) => {
      const matchSearch =
        upg.name.toLowerCase().includes(upgSearch.toLowerCase()) ||
        upg.code.toLowerCase().includes(upgSearch.toLowerCase());
      const matchStatus = upgStatusFilter === "all" || upg.status === upgStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [upgradePackages, upgSearch, upgStatusFilter]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((trx) => {
      const matchSearch =
        trx.id.toLowerCase().includes(trxSearch.toLowerCase()) ||
        trx.orgName.toLowerCase().includes(trxSearch.toLowerCase()) ||
        trx.packageName.toLowerCase().includes(trxSearch.toLowerCase());
      const matchType = trxTypeFilter === "all" || trx.type === trxTypeFilter;
      const matchStatus = trxStatusFilter === "all" || trx.status === trxStatusFilter;
      return matchSearch && matchType && matchStatus;
    });
  }, [transactions, trxSearch, trxTypeFilter, trxStatusFilter]);

  // Handle Deletes
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "pkg") {
      const res = deletePackage(deleteTarget.id);
      if (res.success) {
        message.success(res.message);
      } else {
        message.error(res.message);
      }
    } else {
      const res = deleteUpgradePackage(deleteTarget.id);
      if (res.success) {
        message.success(res.message);
      } else {
        message.error(res.message);
      }
    }
    setDeleteTarget(null);
  };

  // Columns for Packages
  const packageColumns: ColumnsType<ServicePackage> = [
    {
      title: "Mã gói",
      dataIndex: "code",
      key: "code",
      width: 120,
      render: (code: string) => <strong style={{ color: "#2B2B2B" }}>{code}</strong>,
    },
    {
      title: "Tên gói cước",
      dataIndex: "name",
      key: "name",
      render: (name: string, record) => (
        <div>
          <strong style={{ fontSize: 14, color: "#2B2B2B", display: "block" }}>{name}</strong>
          <span style={{ fontSize: 12, color: "#8C8C8C" }}>{record.description}</span>
        </div>
      ),
    },
    {
      title: "Dung lượng",
      dataIndex: "storageGB",
      key: "storageGB",
      width: 110,
      render: (gb: number) => (
        <span style={{ fontWeight: 600, color: "#1890FF" }}>{gb} GB</span>
      ),
    },
    {
      title: "Thiết bị",
      dataIndex: "maxDevices",
      key: "maxDevices",
      width: 100,
      render: (dev: number) => (
        <span style={{ fontWeight: 600, color: "#722ED1" }}>{dev} máy</span>
      ),
    },
    {
      title: "Thời hạn",
      dataIndex: "durationMonths",
      key: "durationMonths",
      width: 110,
      render: (m: number) => <span>{m === 12 ? "1 năm" : `${m} tháng`}</span>,
    },
    {
      title: "Đơn giá",
      dataIndex: "priceVND",
      key: "priceVND",
      width: 130,
      render: (price: number) => (
        <strong style={{ color: "#F26D21" }}>
          {price === 0 ? "Miễn phí" : `${price.toLocaleString("vi-VN")} đ`}
        </strong>
      ),
    },
    {
      title: "Trạng thái kinh doanh (SYS-PKG-01)",
      dataIndex: "status",
      key: "status",
      width: 175,
      render: (status: PackageStatus, record) => (
        <Select
          size="small"
          value={status}
          style={{ width: 155 }}
          onChange={(newStatus) => {
            updatePackageStatus(record.id, newStatus);
            message.success(`Đã cập nhật trạng thái gói [${record.name}]!`);
          }}>
          <Select.Option value="active">
            <span style={{ color: "#52C41A", fontWeight: 600 }}>● Đang kinh doanh</span>
          </Select.Option>
          <Select.Option value="upcoming">
            <span style={{ color: "#1890FF", fontWeight: 600 }}>● Chưa kinh doanh</span>
          </Select.Option>
          <Select.Option value="suspended">
            <span style={{ color: "#FAAD14", fontWeight: 600 }}>● Ngưng kinh doanh</span>
          </Select.Option>
          <Select.Option value="ended">
            <span style={{ color: "#8C8C8C", fontWeight: 600 }}>● Đã kết thúc</span>
          </Select.Option>
        </Select>
      ),
    },
    {
      title: "Thuê bao",
      dataIndex: "activeSubscribers",
      key: "activeSubscribers",
      width: 90,
      render: (count: number) => (
        <Tag color={count > 0 ? "orange" : "default"}>{count} cơ sở</Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 100,
      render: (_, record) => (
        <AppTableActions
          actions={[
            {
              key: "view",
              icon: <Eye size={18} color="#1890FF" />,
              tooltip: "Xem chi tiết",
              onClick: () => {
                setSelectedPkgDetail(record);
                setIsPkgDetailOpen(true);
              },
            },
            {
              key: "edit",
              icon: <SquarePen size={18} color="#F26D21" />,
              tooltip: "Chỉnh sửa",
              onClick: () => {
                setEditingPkg(record);
                setIsPkgFormOpen(true);
              },
            },
            {
              key: "delete",
              icon: <Trash2 size={18} color="#FF4D4F" />,
              tooltip: "Xóa",
              danger: true,
              onClick: () => {
                setDeleteTarget({ type: "pkg", id: record.id, name: record.name });
              },
            },
          ]}
        />
      ),
    },
  ];

  // Columns for Upgrades
  const upgradeColumns: ColumnsType<UpgradePackage> = [
    {
      title: "Mã gói",
      dataIndex: "code",
      key: "code",
      width: 150,
      render: (code: string) => <strong>{code}</strong>,
    },
    {
      title: "Tên gói nâng cấp (SYS-UPG-01)",
      dataIndex: "name",
      key: "name",
      render: (name: string, record) => (
        <div>
          <strong style={{ fontSize: 14, color: "#2B2B2B", display: "block" }}>{name}</strong>
          <span style={{ fontSize: 12, color: "#8C8C8C" }}>{record.description}</span>
        </div>
      ),
    },
    {
      title: "Dung lượng thêm",
      dataIndex: "extraStorageGB",
      key: "extraStorageGB",
      width: 140,
      render: (gb: number) =>
        gb > 0 ? <Tag color="blue">+{gb} GB Dung lượng</Tag> : <span style={{ color: "#8C8C8C" }}>-</span>,
    },
    {
      title: "Thiết bị thêm",
      dataIndex: "extraDevices",
      key: "extraDevices",
      width: 140,
      render: (dev: number) =>
        dev > 0 ? <Tag color="purple">+{dev} Thiết bị</Tag> : <span style={{ color: "#8C8C8C" }}>-</span>,
    },
    {
      title: "Đơn giá",
      dataIndex: "priceVND",
      key: "priceVND",
      width: 140,
      render: (price: number) => (
        <strong style={{ color: "#F26D21" }}>{price.toLocaleString("vi-VN")} đ</strong>
      ),
    },
    {
      title: "Lượt mua",
      dataIndex: "purchasedCount",
      key: "purchasedCount",
      width: 110,
      render: (count: number) => <Tag color="green">{count} lượt</Tag>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (st: UpgradePackage["status"], record) => (
        <Select
          size="small"
          value={st}
          style={{ width: 125 }}
          onChange={(newSt) => {
            updateUpgradePackage(record.id, { status: newSt });
            message.success("Đã cập nhật trạng thái mở bán!");
          }}>
          <Select.Option value="selling">
            <span style={{ color: "#52C41A", fontWeight: 600 }}>● Đang mở bán</span>
          </Select.Option>
          <Select.Option value="closed">
            <span style={{ color: "#8C8C8C", fontWeight: 600 }}>● Đã đóng</span>
          </Select.Option>
        </Select>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 90,
      render: (_, record) => (
        <AppTableActions
          actions={[
            {
              key: "edit",
              icon: <SquarePen size={18} color="#F26D21" />,
              tooltip: "Chỉnh sửa",
              onClick: () => {
                setEditingUpg(record);
                setIsUpgFormOpen(true);
              },
            },
            {
              key: "delete",
              icon: <Trash2 size={18} color="#FF4D4F" />,
              tooltip: "Xóa",
              danger: true,
              onClick: () => {
                setDeleteTarget({ type: "upg", id: record.id, name: record.name });
              },
            },
          ]}
        />
      ),
    },
  ];

  // Columns for Transactions
  const transactionColumns: ColumnsType<PackageTransaction> = [
    {
      title: "Mã GD",
      dataIndex: "id",
      key: "id",
      width: 130,
      render: (id: string) => <Tag color="default" style={{ fontWeight: 600 }}>{id}</Tag>,
    },
    {
      title: "Tổ chức / Cơ sở",
      dataIndex: "orgName",
      key: "orgName",
      render: (name: string, record) => (
        <div>
          <strong style={{ color: "#2B2B2B" }}>{name}</strong>
          {record.note && (
            <div style={{ fontSize: 11, color: "#8C8C8C", marginTop: 2 }}>{record.note}</div>
          )}
        </div>
      ),
    },
    {
      title: "Gói dịch vụ",
      dataIndex: "packageName",
      key: "packageName",
      width: 200,
    },
    {
      title: "Số tiền",
      dataIndex: "amountVND",
      key: "amountVND",
      width: 140,
      render: (val: number) => (
        <strong style={{ color: "#52C41A" }}>{val.toLocaleString("vi-VN")} đ</strong>
      ),
    },
    {
      title: "Loại GD",
      dataIndex: "type",
      key: "type",
      width: 110,
      render: (type: PackageTransaction["type"]) => {
        const typeLabels: Record<string, { label: string; color: string }> = {
          buy: { label: "Mua mới", color: "blue" },
          renew: { label: "Gia hạn", color: "orange" },
          upgrade: { label: "Nâng cấp", color: "purple" },
          switch: { label: "Đổi gói", color: "cyan" },
        };
        const cur = typeLabels[type] || { label: type, color: "default" };
        return <Tag color={cur.color}>{cur.label}</Tag>;
      },
    },
    {
      title: "Phương thức",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      width: 140,
      render: (m: PackageTransaction["paymentMethod"]) => {
        if (m === "bank_transfer") {
          return (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12 }}>
              <Building size={14} color="#1890FF" /> Chuyển khoản
            </span>
          );
        }
        if (m === "credit_card") {
          return (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12 }}>
              <CreditCard size={14} color="#722ED1" /> Thẻ quốc tế
            </span>
          );
        }
        return (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12 }}>
            <Smartphone size={14} color="#E91E63" /> Ví MoMo
          </span>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (st: PackageTransaction["status"]) => {
        if (st === "success") {
          return (
            <span style={{ color: "#52C41A", display: "inline-flex", alignItems: "center", gap: 4, fontWeight: 600 }}>
              <CheckCircle size={14} /> Thành công
            </span>
          );
        }
        if (st === "pending") {
          return (
            <span style={{ color: "#FAAD14", display: "inline-flex", alignItems: "center", gap: 4, fontWeight: 600 }}>
              <Clock size={14} /> Đang xử lý
            </span>
          );
        }
        return (
          <span style={{ color: "#FF4D4F", display: "inline-flex", alignItems: "center", gap: 4, fontWeight: 600 }}>
            <XCircle size={14} /> Thất bại
          </span>
        );
      },
    },
    {
      title: "Thời gian",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      render: (d: string) => <span style={{ fontSize: 12, color: "#595959" }}>{d}</span>,
    },
  ];

  // Transaction Stats
  const totalRevenue = useMemo(() => {
    return transactions
      .filter((t) => t.status === "success")
      .reduce((sum, t) => sum + t.amountVND, 0);
  }, [transactions]);

  const totalSuccessCount = useMemo(() => {
    return transactions.filter((t) => t.status === "success").length;
  }, [transactions]);

  return (
    <div className="packages-page">
      <div className="packages-page__header">
        <h1 className="packages-page__title">Quản lý Gói cước & Dịch vụ</h1>
        <p className="packages-page__subtitle">
          Quản lý danh mục gói cước phát thanh, gói nâng cấp mở rộng và lịch sử giao dịch toàn hệ thống
        </p>
      </div>

      <div className="packages-page__tabs">
        <AppTabs
          items={packageTabs}
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as PackageTabKey)}
        />
      </div>

      <div className="packages-page__content">
        {/* TAB 1: DANH SÁCH GÓI CƯỚC */}
        {activeTab === "packages" && (
          <div>
            <div className="packages-filter-bar">
              <div className="packages-filter-group">
                <AppSearch
                  placeholder="Tìm theo tên hoặc mã gói..."
                  value={pkgSearch}
                  onChange={setPkgSearch}
                  style={{ width: 280 }}
                />

                <AppSelect
                  width={180}
                  placeholder="Trạng thái kinh doanh"
                  value={pkgStatusFilter}
                  onChange={setPkgStatusFilter}
                  options={[
                    { label: "Tất cả trạng thái", value: "all" },
                    { label: "Đang kinh doanh", value: "active" },
                    { label: "Chưa kinh doanh", value: "upcoming" },
                    { label: "Ngưng kinh doanh", value: "suspended" },
                    { label: "Đã kết thúc", value: "ended" },
                  ]}
                />

                <AppSelect
                  width={150}
                  placeholder="Thời hạn gói"
                  value={pkgDurationFilter}
                  onChange={setPkgDurationFilter}
                  options={[
                    { label: "Tất cả thời hạn", value: "all" },
                    { label: "1 tháng", value: "1" },
                    { label: "3 tháng", value: "3" },
                    { label: "6 tháng", value: "6" },
                    { label: "12 tháng (1 năm)", value: "12" },
                  ]}
                />
              </div>
            </div>

            <AppTable<ServicePackage>
              rowKey="id"
              columns={packageColumns}
              dataSource={filteredPackages}
              pagination={{ pageSize: 8 }}
            />
          </div>
        )}

        {/* TAB 2: GÓI NÂNG CẤP */}
        {activeTab === "upgrades" && (
          <div>
            <div className="packages-filter-bar">
              <div className="packages-filter-group">
                <AppSearch
                  placeholder="Tìm gói nâng cấp..."
                  value={upgSearch}
                  onChange={setUpgSearch}
                  style={{ width: 280 }}
                />

                <AppSelect
                  width={160}
                  placeholder="Trạng thái"
                  value={upgStatusFilter}
                  onChange={setUpgStatusFilter}
                  options={[
                    { label: "Tất cả trạng thái", value: "all" },
                    { label: "Đang mở bán", value: "selling" },
                    { label: "Đã đóng", value: "closed" },
                  ]}
                />
              </div>
            </div>

            <AppTable<UpgradePackage>
              rowKey="id"
              columns={upgradeColumns}
              dataSource={filteredUpgrades}
              pagination={{ pageSize: 8 }}
            />
          </div>
        )}

        {/* TAB 3: LỊCH SỬ GIAO DỊCH */}
        {activeTab === "transactions" && (
          <div>
            {/* Thống kê doanh thu */}
            <div className="packages-stats-grid">
              <div className="packages-stat-card">
                <div className="packages-stat-icon">
                  <Receipt size={24} />
                </div>
                <div className="packages-stat-info">
                  <span className="packages-stat-label">Tổng doanh thu</span>
                  <span className="packages-stat-value">
                    {totalRevenue.toLocaleString("vi-VN")} đ
                  </span>
                </div>
              </div>

              <div className="packages-stat-card packages-stat-card--blue">
                <div className="packages-stat-icon packages-stat-icon--blue">
                  <Layers size={24} />
                </div>
                <div className="packages-stat-info">
                  <span className="packages-stat-label">Tổng giao dịch</span>
                  <span className="packages-stat-value">{transactions.length}</span>
                </div>
              </div>

              <div className="packages-stat-card packages-stat-card--green">
                <div className="packages-stat-icon packages-stat-icon--green">
                  <Check size={24} />
                </div>
                <div className="packages-stat-info">
                  <span className="packages-stat-label">Thành công</span>
                  <span className="packages-stat-value">{totalSuccessCount}</span>
                </div>
              </div>
            </div>

            <div className="packages-filter-bar">
              <div className="packages-filter-group">
                <AppSearch
                  placeholder="Tìm mã GD, cơ sở, gói cước..."
                  value={trxSearch}
                  onChange={setTrxSearch}
                  style={{ width: 280 }}
                />

                <AppSelect
                  width={160}
                  placeholder="Loại giao dịch"
                  value={trxTypeFilter}
                  onChange={setTrxTypeFilter}
                  options={[
                    { label: "Tất cả loại GD", value: "all" },
                    { label: "Mua mới", value: "buy" },
                    { label: "Gia hạn", value: "renew" },
                    { label: "Nâng cấp", value: "upgrade" },
                    { label: "Đổi gói", value: "switch" },
                  ]}
                />

                <AppSelect
                  width={160}
                  placeholder="Trạng thái GD"
                  value={trxStatusFilter}
                  onChange={setTrxStatusFilter}
                  options={[
                    { label: "Tất cả trạng thái", value: "all" },
                    { label: "Thành công", value: "success" },
                    { label: "Đang xử lý", value: "pending" },
                    { label: "Thất bại", value: "failed" },
                  ]}
                />
              </div>
            </div>

            <AppTable<PackageTransaction>
              rowKey="id"
              columns={transactionColumns}
              dataSource={filteredTransactions}
              pagination={{ pageSize: 8 }}
            />
          </div>
        )}
      </div>

      {/* Modal Thêm/Sửa gói cước */}
      <PackageFormModal
        open={isPkgFormOpen}
        editingPackage={editingPkg}
        onClose={() => setIsPkgFormOpen(false)}
        onSubmit={(vals) => {
          if (editingPkg) {
            updatePackage(editingPkg.id, vals);
            message.success("Cập nhật gói cước thành công!");
          } else {
            addPackage(vals);
            message.success("Thêm mới gói cước thành công!");
          }
        }}
      />

      {/* Modal Xem chi tiết gói cước */}
      <PackageDetailModal
        open={isPkgDetailOpen}
        packageData={selectedPkgDetail}
        onClose={() => setIsPkgDetailOpen(false)}
        onEdit={(pkg) => {
          setEditingPkg(pkg);
          setIsPkgFormOpen(true);
        }}
      />

      {/* Modal Thêm/Sửa gói nâng cấp */}
      <UpgradePackageModal
        open={isUpgFormOpen}
        editingUpgrade={editingUpg}
        onClose={() => setIsUpgFormOpen(false)}
        onSubmit={(vals) => {
          if (editingUpg) {
            updateUpgradePackage(editingUpg.id, vals);
            message.success("Cập nhật gói nâng cấp thành công!");
          } else {
            addUpgradePackage(vals);
            message.success("Thêm mới gói nâng cấp thành công!");
          }
        }}
      />

      {/* Modal xác nhận xóa */}
      <AppConfirmModal
        open={Boolean(deleteTarget)}
        type="delete"
        title={deleteTarget?.type === "pkg" ? "Xác nhận xóa gói cước" : "Xác nhận xóa gói nâng cấp"}
        description={`Bạn có chắc chắn muốn xóa [${deleteTarget?.name}] không? Thao tác này không thể hoàn tác.`}
        confirmText="Xác nhận xóa"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

export default PackagesPage;
