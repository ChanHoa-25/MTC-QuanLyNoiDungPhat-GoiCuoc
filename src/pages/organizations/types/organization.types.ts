export interface OrganizationItem {
  id: string;
  stt: number;
  code: string;
  name: string;
  districtCount: number | string;
  packageInfo: string;
  effectiveDate: string;
  expiryDate: string;
  expiredDays: number | string;
  status: 'active' | 'inactive' | 'expired' | 'pending' | string;
  statusLabel: string;
  taxCode?: string;
  representativeLastName?: string;
  representativeFirstName?: string;
  phone?: string;
  birthday?: string;
  username?: string;
  email?: string;
  timezone?: string;
}

export interface TransactionRecord {
  id: string;
  time: string;
  storage: string;
  validity: string;
  price: string;
  handler: string;
  phone: string;
  status: 'success' | 'cancelled' | 'pending' | 'failed' | string;
  statusLabel: string;
  method: string;
}

export type ConfirmModalType = 
  | 'DELETE_ORG' 
  | 'CANCEL_ORG' 
  | 'RENEW_PACKAGE' 
  | 'EXPIRED_WARNING' 
  | 'CANCEL_PACKAGE_CHANGE' 
  | null;