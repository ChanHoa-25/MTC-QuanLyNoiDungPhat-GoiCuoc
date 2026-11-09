import type { DeviceItem } from '../types/dashboardAdmin.types';

export const MOCK_DEVICES: DeviceItem[] = [
  { id: 1, name: "Thiết bị 1", organization: "Hồ Chí Minh", address: "86/33 Âu Cơ, phường 9, quận Tân Bình, TP. HCM", lat: 10.769878, lng: 106.651172, status: "online" },
  { id: 2, name: "Thiết bị 2", organization: "Hậu Giang", address: "120 Lý Thái Tổ, phường 9, quận 10, TP. HCM", lat: 10.7679, lng: 106.6726, status: "online" },
  { id: 3, name: "Thiết bị 3", organization: "Gia Lai", address: "45 Nguyễn Tri Phương, phường 8, quận 10, TP. HCM", lat: 10.7612, lng: 106.6689, status: "offline" },
  { id: 4, name: "Thiết bị 4", organization: "Hồ Chí Minh", address: "210 Võ Văn Kiệt, phường 2, quận 5, TP. HCM", lat: 10.7503, lng: 106.6641, status: "online" },
  { id: 5, name: "Thiết bị 5", organization: "Bình Dương", address: "33 Trần Hưng Đạo, phường 2, quận 5, TP. HCM", lat: 10.7545, lng: 106.6702, status: "online" },
  { id: 6, name: "Thiết bị 6", organization: "Hồ Chí Minh", address: "78 Điện Biên Phủ, phường 6, quận 3, TP. HCM", lat: 10.7791, lng: 106.6819, status: "offline" },
  { id: 7, name: "Thiết bị 7", organization: "Đồng Nai", address: "12 Ngô Gia Tự, phường 2, quận 10, TP. HCM", lat: 10.7651, lng: 106.6638, status: "online" },
];

export const ORG_OPTIONS = [
  { label: "Tất cả", value: "all" },
  { label: "Hồ Chí Minh", value: "Hồ Chí Minh" },
  { label: "Hậu Giang", value: "Hậu Giang" },
  { label: "Gia Lai", value: "Gia Lai" },
  { label: "Bình Dương", value: "Bình Dương" },
  { label: "Đồng Nai", value: "Đồng Nai" },
];

export const STATUS_OPTIONS = [
  { label: "Tất cả", value: "all" },
  { label: "Đang hoạt động", value: "online" },
  { label: "Ngưng hoạt động", value: "offline" },
];

export const STATUS_TEXT: Record<string, string> = {
  online: "Đang hoạt động",
  offline: "Ngưng hoạt động",
};