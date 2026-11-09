import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type {
  ServicePackage,
  UpgradePackage,
  PackageTransaction,
  PackageStatus,
  CreditCardInfo,
} from "../types/package.types";
import { packagesMock } from "../data/packages.mock";
import { upgradePackagesMock } from "../data/upgradePackages.mock";
import { packageTransactionsMock } from "../data/packageTransactions.mock";

interface PackageContextType {
  packages: ServicePackage[];
  upgradePackages: UpgradePackage[];
  transactions: PackageTransaction[];
  savedCard: CreditCardInfo | null;
  addPackage: (pkg: Omit<ServicePackage, "id" | "activeSubscribers" | "createdAt" | "updatedAt">) => void;
  updatePackage: (id: string, updates: Partial<ServicePackage>) => void;
  deletePackage: (id: string) => { success: boolean; message: string };
  updatePackageStatus: (id: string, status: PackageStatus) => void;
  addUpgradePackage: (pkg: Omit<UpgradePackage, "id" | "purchasedCount" | "createdAt">) => void;
  updateUpgradePackage: (id: string, updates: Partial<UpgradePackage>) => void;
  deleteUpgradePackage: (id: string) => { success: boolean; message: string };
  saveCardInfo: (card: CreditCardInfo) => void;
  processRenew: (
    packageId: string,
    months: number,
    paymentMethod: PackageTransaction["paymentMethod"],
    orgName: string,
  ) => PackageTransaction;
  processUpgrade: (
    upgradeId: string,
    paymentMethod: PackageTransaction["paymentMethod"],
    orgName: string,
  ) => PackageTransaction;
}

const PackageContext = createContext<PackageContextType | undefined>(undefined);

const PACKAGES_KEY = "mtc_packages";
const UPGRADES_KEY = "mtc_upgrade_packages";
const TRANSACTIONS_KEY = "mtc_package_transactions";
const CARD_KEY = "mtc_saved_card";

export function PackageProvider({ children }: { children: ReactNode }) {
  const [packages, setPackages] = useState<ServicePackage[]>(() => {
    try {
      const saved = localStorage.getItem(PACKAGES_KEY);
      return saved ? JSON.parse(saved) : packagesMock;
    } catch {
      return packagesMock;
    }
  });

  const [upgradePackages, setUpgradePackages] = useState<UpgradePackage[]>(() => {
    try {
      const saved = localStorage.getItem(UPGRADES_KEY);
      return saved ? JSON.parse(saved) : upgradePackagesMock;
    } catch {
      return upgradePackagesMock;
    }
  });

  const [transactions, setTransactions] = useState<PackageTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(TRANSACTIONS_KEY);
      return saved ? JSON.parse(saved) : packageTransactionsMock;
    } catch {
      return packageTransactionsMock;
    }
  });

  const [savedCard, setSavedCard] = useState<CreditCardInfo | null>(() => {
    try {
      const saved = localStorage.getItem(CARD_KEY);
      return saved
        ? JSON.parse(saved)
        : {
            cardNumber: "**** **** **** 8826",
            cardHolder: "NGUYEN VAN CHINH",
            expiryDate: "12/28",
            cvv: "***",
            isDefault: true,
          };
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(PACKAGES_KEY, JSON.stringify(packages));
    } catch {
      // ignore
    }
  }, [packages]);

  useEffect(() => {
    try {
      localStorage.setItem(UPGRADES_KEY, JSON.stringify(upgradePackages));
    } catch {
      // ignore
    }
  }, [upgradePackages]);

  useEffect(() => {
    try {
      localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
    } catch {
      // ignore
    }
  }, [transactions]);

  useEffect(() => {
    try {
      if (savedCard) {
        localStorage.setItem(CARD_KEY, JSON.stringify(savedCard));
      }
    } catch {
      // ignore
    }
  }, [savedCard]);

  const addPackage = (
    pkgData: Omit<ServicePackage, "id" | "activeSubscribers" | "createdAt" | "updatedAt">,
  ) => {
    const now = new Date().toISOString().replace("T", " ").substring(0, 19);
    const newId = `PKG${String(packages.length + 1).padStart(3, "0")}`;
    const newPkg: ServicePackage = {
      ...pkgData,
      id: newId,
      activeSubscribers: 0,
      createdAt: now,
      updatedAt: now,
    };
    setPackages((prev) => [newPkg, ...prev]);
  };

  const updatePackage = (id: string, updates: Partial<ServicePackage>) => {
    const now = new Date().toISOString().replace("T", " ").substring(0, 19);
    setPackages((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates, updatedAt: now } : item)),
    );
  };

  const deletePackage = (id: string) => {
    const target = packages.find((p) => p.id === id);
    if (!target) {
      return { success: false, message: "Không tìm thấy gói cước để xóa" };
    }
    if (target.activeSubscribers > 0) {
      return {
        success: false,
        message: `Không thể xóa gói [${target.name}] vì đang có ${target.activeSubscribers} tổ chức đang sử dụng! Hãy chuyển trạng thái sang "Ngưng kinh doanh".`,
      };
    }
    setPackages((prev) => prev.filter((p) => p.id !== id));
    return { success: true, message: `Đã xóa gói cước [${target.name}] thành công!` };
  };

  const updatePackageStatus = (id: string, status: PackageStatus) => {
    updatePackage(id, { status });
  };

  const addUpgradePackage = (
    pkgData: Omit<UpgradePackage, "id" | "purchasedCount" | "createdAt">,
  ) => {
    const now = new Date().toISOString().replace("T", " ").substring(0, 19);
    const newId = `UPG${String(upgradePackages.length + 1).padStart(3, "0")}`;
    const newPkg: UpgradePackage = {
      ...pkgData,
      id: newId,
      purchasedCount: 0,
      createdAt: now,
    };
    setUpgradePackages((prev) => [newPkg, ...prev]);
  };

  const updateUpgradePackage = (id: string, updates: Partial<UpgradePackage>) => {
    setUpgradePackages((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    );
  };

  const deleteUpgradePackage = (id: string) => {
    const target = upgradePackages.find((p) => p.id === id);
    if (!target) {
      return { success: false, message: "Không tìm thấy gói nâng cấp" };
    }
    setUpgradePackages((prev) => prev.filter((p) => p.id !== id));
    return { success: true, message: `Đã xóa gói nâng cấp [${target.name}]!` };
  };

  const saveCardInfo = (card: CreditCardInfo) => {
    setSavedCard(card);
  };

  const processRenew = (
    packageId: string,
    months: number,
    paymentMethod: PackageTransaction["paymentMethod"],
    orgName: string,
  ): PackageTransaction => {
    const target = packages.find((p) => p.id === packageId) || packages[0];
    const unitPrice = target.priceVND;
    const factor = months === 12 ? (target.durationMonths === 12 ? 1 : 10) : months;
    const amount = target.durationMonths === 12 ? target.priceVND : unitPrice * factor;

    const now = new Date().toISOString().replace("T", " ").substring(0, 19);
    const newTrx: PackageTransaction = {
      id: `TRX-${Date.now().toString().slice(-6)}`,
      orgId: "org-current",
      orgName: orgName || "Cơ sở Hiện tại",
      packageId: target.id,
      packageName: target.name,
      amountVND: amount,
      type: "renew",
      paymentMethod,
      status: "success",
      createdAt: now,
      note: `Gia hạn ${months} tháng gói [${target.name}]`,
    };

    setTransactions((prev) => [newTrx, ...prev]);
    return newTrx;
  };

  const processUpgrade = (
    upgradeId: string,
    paymentMethod: PackageTransaction["paymentMethod"],
    orgName: string,
  ): PackageTransaction => {
    const upg = upgradePackages.find((u) => u.id === upgradeId) || upgradePackages[0];
    const now = new Date().toISOString().replace("T", " ").substring(0, 19);
    const newTrx: PackageTransaction = {
      id: `TRX-${Date.now().toString().slice(-6)}`,
      orgId: "org-current",
      orgName: orgName || "Cơ sở Hiện tại",
      packageId: upg.id,
      packageName: upg.name,
      amountVND: upg.priceVND,
      type: "upgrade",
      paymentMethod,
      status: "success",
      createdAt: now,
      note: `Mua bổ sung gói [${upg.name}]`,
    };

    setTransactions((prev) => [newTrx, ...prev]);
    setUpgradePackages((prev) =>
      prev.map((item) =>
        item.id === upg.id ? { ...item, purchasedCount: item.purchasedCount + 1 } : item,
      ),
    );
    return newTrx;
  };

  return (
    <PackageContext.Provider
      value={{
        packages,
        upgradePackages,
        transactions,
        savedCard,
        addPackage,
        updatePackage,
        deletePackage,
        updatePackageStatus,
        addUpgradePackage,
        updateUpgradePackage,
        deleteUpgradePackage,
        saveCardInfo,
        processRenew,
        processUpgrade,
      }}>
      {children}
    </PackageContext.Provider>
  );
}

export function usePackages() {
  const ctx = useContext(PackageContext);
  if (!ctx) {
    throw new Error("usePackages must be used within PackageProvider");
  }
  return ctx;
}
