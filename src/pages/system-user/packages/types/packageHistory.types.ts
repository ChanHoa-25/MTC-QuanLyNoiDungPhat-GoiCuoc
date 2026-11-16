export type PaymentStatus = "success" | "cancelled" | "processing" | "failed";

export interface PackageHistoryItem {
  id: string;
  identifier: string;
  organization: string;
  renewedAt: string;
  capacity: string;
  duration: string;
  effectivePeriod: string;
  price: number;
  payer: string;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
}
