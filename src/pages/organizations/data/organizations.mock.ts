import type { OrganizationItem, TransactionRecord } from '../types/organization.types';

export const INITIAL_ORGS: OrganizationItem[] = [
  { id: 'org-1', stt: 1, code: 'TPHCM', name: 'Thành phố Hồ Chí Minh', districtCount: 10, packageInfo: '5GB/10GB', effectiveDate: '25/07/2021', expiryDate: '25/08/2021', expiredDays: '-', status: 'orange', statusLabel: 'Chưa diễn ra', representativeLastName: 'Nguyễn', representativeFirstName: 'Chinh', phone: '+84 250 137 008', birthday: '02/02/1998', username: 'nguyen.chinh', email: 'chinhnguyen889@gmail.com', timezone: 'Hà Nội (GMT+07:00)' },
  { id: 'org-2', stt: 2, code: 'THG', name: 'Tỉnh Hậu Giang', districtCount: 20, packageInfo: '5GB/10GB', effectiveDate: '25/07/2021', expiryDate: '-', expiredDays: 10, status: 'green', statusLabel: 'Còn hạn', representativeLastName: 'Phan', representativeFirstName: 'Văn Trị', phone: '09177334', birthday: '12/01/1998', username: 'huy.phan', email: 'huy.phan@gmail.com', timezone: 'Hà Nội (GMT+07:00)' },
  { id: 'org-3', stt: 3, code: 'TGL', name: 'Tỉnh Gia Lai', districtCount: 15, packageInfo: '5GB/10GB', effectiveDate: '25/07/2021', expiryDate: '25/08/2021', expiredDays: 0, status: 'darkRed', statusLabel: 'Hủy bỏ tổ chức', representativeLastName: 'Lê', representativeFirstName: 'Hoàng Nam', phone: '0987654321', birthday: '20/03/1995', username: 'nam.le', email: 'namle@gialai.vn', timezone: 'Hà Nội (GMT+07:00)' },
  { id: 'org-4', stt: 4, code: 'TPBMT', name: 'Thành phố Buôn Mê Thuột', districtCount: 25, packageInfo: '5GB/10GB', effectiveDate: '25/07/2021', expiryDate: '25/08/2021', expiredDays: 10, status: 'green', statusLabel: 'Còn hạn' },
  { id: 'org-5', stt: 5, code: 'TBD', name: 'Tỉnh Bình Dương', districtCount: 12, packageInfo: '5GB/10GB', effectiveDate: '25/07/2021', expiryDate: '25/08/2021', expiredDays: 10, status: 'green', statusLabel: 'Còn hạn' },
  { id: 'org-6', stt: 6, code: 'TBP', name: 'Tỉnh Bình Phước', districtCount: 25, packageInfo: '5GB/10GB', effectiveDate: '25/07/2021', expiryDate: '25/08/2021', expiredDays: 15, status: 'green', statusLabel: 'Còn hạn' },
  { id: 'org-7', stt: 7, code: 'TDN', name: 'Tỉnh Đồng Nai', districtCount: 18, packageInfo: '5GB/10GB', effectiveDate: '25/07/2021', expiryDate: '25/08/2021', expiredDays: -3, status: 'red', statusLabel: 'Hết hạn' },
  { id: 'org-8', stt: 8, code: 'TCM', name: 'Tỉnh Cà Mau', districtCount: 8, packageInfo: '5GB/10GB', effectiveDate: '25/07/2021', expiryDate: '25/08/2021', expiredDays: 0, status: 'red', statusLabel: 'Hết hạn' },
];

export const MOCK_TRANSACTIONS: TransactionRecord[] = [
  { id: 'tx-1', time: '25/07/2021 19:00:00', storage: '5GB', validity: '25/07/2021 - 25/08/2023', price: '50.000 VND', handler: 'Nguyễn Văn A', phone: '0951454354', status: 'success', statusLabel: 'Thành công', method: 'Chuyển khoản' },
  { id: 'tx-2', time: '25/06/2021 19:00:00', storage: '5GB', validity: '25/07/2021 - 25/08/2023', price: '50.000 VND', handler: 'Nguyễn Văn A', phone: '0951454354', status: 'success', statusLabel: 'Thành công', method: 'Chuyển khoản' },
  { id: 'tx-3', time: '25/05/2021 19:00:00', storage: '5GB', validity: '25/07/2021 - 25/08/2023', price: '50.000 VND', handler: 'Nguyễn Văn A', phone: '0951454354', status: 'cancelled', statusLabel: 'Đã hủy', method: 'Ví MOMO' },
  { id: 'tx-4', time: '25/04/2021 19:00:00', storage: '5GB', validity: '25/07/2021 - 25/08/2023', price: '50.000 VND', handler: 'Nguyễn Văn A', phone: '0951454354', status: 'success', statusLabel: 'Thành công', method: 'Ví MOMO' },
  { id: 'tx-5', time: '25/03/2021 19:00:00', storage: '5GB', validity: '25/07/2021 - 25/08/2023', price: '50.000 VND', handler: 'Nguyễn Văn A', phone: '0951454354', status: 'pending', statusLabel: 'Đang xử lý', method: 'Thẻ quốc tế' },
  { id: 'tx-6', time: '25/02/2021 19:00:00', storage: '5GB', validity: '25/07/2021 - 25/08/2023', price: '100.000 VND', handler: 'Nguyễn Văn A', phone: '0951454354', status: 'failed', statusLabel: 'Thất bại', method: 'Thẻ quốc tế' },
];