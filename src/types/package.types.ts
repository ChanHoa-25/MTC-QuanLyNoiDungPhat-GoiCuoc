export type PackageStatus = "active" | "upcoming" | "suspended" | "ended";

export interface ServicePackage {
  id: string;
  code: string;
  name: string;
  description: string;
  storageGB: number;
  maxDevices: number;
  durationMonths: number;
  priceVND: number;
  status: PackageStatus;
  activeSubscribers: number;
  features: string[];
  createdAt: string;
  updatedAt: string;
}

export type UpgradeStatus = "selling" | "closed";

export interface UpgradePackage {
  id: string;
  code: string;
  name: string;
  description: string;
  extraStorageGB: number;
  extraDevices: number;
  priceVND: number;
  purchasedCount: number;
  status: UpgradeStatus;
  createdAt: string;
}

export type TransactionType = "buy" | "renew" | "upgrade" | "switch";
export type TransactionStatus = "success" | "pending" | "failed";
export type PaymentMethod = "bank_transfer" | "credit_card" | "momo" | "cash";

export interface PackageTransaction {
  id: string;
  orgId: string;
  orgName: string;
  packageId: string;
  packageName: string;
  amountVND: number;
  type: TransactionType;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  createdAt: string;
  note?: string;
}

export interface CreditCardInfo {
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
  isDefault: boolean;
}
