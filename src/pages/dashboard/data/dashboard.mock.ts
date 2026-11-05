import { Cast, MapPin, MonitorSpeaker } from "lucide-react";

import type {
  DashboardDevice,
  DashboardStat,
  DashboardStorage,
} from "../types/dashboard.types";

export const dashboardStorage: DashboardStorage = {
  used: 4,
  total: 5,
};

export const dashboardStats: DashboardStat[] = [
  {
    key: "sites",
    variant: "pink",
    icon: MapPin,
    title: "Cơ sở",
    value: 60,
  },
  {
    key: "devices",
    variant: "green",
    icon: MonitorSpeaker,
    title: "Thiết bị phát bản tin điện tử",
    value: 43,
    total: 50,
  },
  {
    key: "broadcasts",
    variant: "cyan",
    icon: Cast,
    title: "Bản tin điện tử",
    value: 64,
  },
];

export const dashboardDevices: DashboardDevice[] = [
  {
    id: 1,
    name: "Thiết bị 1",
    address: "86/33 Âu Cơ, phường 9, quận Tân Bình, TP. HCM",
    lat: 10.769878,
    lng: 106.651172,
    status: "online",
  },
  {
    id: 2,
    name: "Thiết bị 2",
    address: "120 Lý Thái Tổ, phường 9, quận 10, TP. HCM",
    lat: 10.7679,
    lng: 106.6726,
    status: "online",
  },
  {
    id: 3,
    name: "Thiết bị 3",
    address: "45 Nguyễn Tri Phương, phường 8, quận 10, TP. HCM",
    lat: 10.7612,
    lng: 106.6689,
    status: "offline",
  },
  {
    id: 4,
    name: "Thiết bị 4",
    address: "210 Võ Văn Kiệt, phường 2, quận 5, TP. HCM",
    lat: 10.7503,
    lng: 106.6641,
    status: "online",
  },
  {
    id: 5,
    name: "Thiết bị 5",
    address: "33 Trần Hưng Đạo, phường 2, quận 5, TP. HCM",
    lat: 10.7545,
    lng: 106.6702,
    status: "online",
  },
  {
    id: 6,
    name: "Thiết bị 6",
    address: "78 Điện Biên Phủ, phường 6, quận 3, TP. HCM",
    lat: 10.7791,
    lng: 106.6819,
    status: "offline",
  },
  {
    id: 7,
    name: "Thiết bị 7",
    address: "12 Ngô Gia Tự, phường 2, quận 10, TP. HCM",
    lat: 10.7651,
    lng: 106.6638,
    status: "online",
  },
  {
    id: 8,
    name: "Thiết bị 8",
    address: "250 Lê Hồng Phong, phường 4, quận 5, TP. HCM",
    lat: 10.7586,
    lng: 106.6757,
    status: "online",
  },
  {
    id: 9,
    name: "Thiết bị 9",
    address: "9 Nguyễn Thị Minh Khai, phường 5, quận 3, TP. HCM",
    lat: 10.7845,
    lng: 106.6925,
    status: "offline",
  },
  {
    id: 10,
    name: "Thiết bị 10",
    address: "64 Ba Tháng Hai, phường 12, quận 10, TP. HCM",
    lat: 10.7718,
    lng: 106.6667,
    status: "online",
  },
  {
    id: 11,
    name: "Thiết bị 11",
    address: "301 Lý Thường Kiệt, phường 15, quận 11, TP. HCM",
    lat: 10.7735,
    lng: 106.6552,
    status: "online",
  },
  {
    id: 12,
    name: "Thiết bị 12",
    address: "18 Hoàng Văn Thụ, phường 4, quận Tân Bình, TP. HCM",
    lat: 10.7992,
    lng: 106.6568,
    status: "offline",
  },
  {
    id: 13,
    name: "Thiết bị 13",
    address: "55 Lạc Long Quân, phường 3, quận 11, TP. HCM",
    lat: 10.7646,
    lng: 106.6459,
    status: "online",
  },
  {
    id: 14,
    name: "Thiết bị 14",
    address: "7 Trần Phú, phường 4, quận 5, TP. HCM",
    lat: 10.7569,
    lng: 106.6798,
    status: "online",
  },
];
