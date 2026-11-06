import type { Facility } from "../types/facility.types";
import { MOCK_ORGANIZATION_ID } from "./organizations.mock";

const guid = (n: number): string =>
  `22222222-2222-4222-8222-${n.toString(16).padStart(12, "0")}`;

const createdAt = "2026-01-01T00:00:00.000Z";

type FacilitySeed = {
  key: number;
  code: string;
  name: string;
  parent: number | null;
};

const seeds: FacilitySeed[] = [
  // TP. Hồ Chí Minh
  { key: 1, code: "TPHCM", name: "TP. Hồ Chí Minh", parent: null },
  { key: 2, code: "TD", name: "Quận Thủ Đức", parent: 1 },
  { key: 3, code: "LX", name: "Phường Linh Xuân", parent: 2 },
  { key: 4, code: "BC", name: "Phường Bình Chiểu", parent: 2 },
  { key: 5, code: "LT", name: "Phường Linh Trung", parent: 2 },
  { key: 6, code: "TB", name: "Phường Tam Bình", parent: 2 },
  { key: 7, code: "TP", name: "Phường Tam Phú", parent: 2 },
  { key: 8, code: "HBP", name: "Phường Hiệp Bình Phước", parent: 2 },
  { key: 9, code: "HBC", name: "Phường Hiệp Bình Chánh", parent: 2 },
  { key: 10, code: "LTA", name: "Phường Linh Tây", parent: 2 },
  { key: 11, code: "LD", name: "Phường Linh Đông", parent: 2 },
  { key: 12, code: "LC", name: "Phường Linh Chiểu", parent: 2 },
  { key: 13, code: "TT-TD", name: "Phường Trường Thọ", parent: 2 },
  { key: 14, code: "BT-TD", name: "Phường Bình Thọ", parent: 2 },

  { key: 15, code: "Q1", name: "Quận 1", parent: 1 },
  { key: 16, code: "BN", name: "Phường Bến Nghé", parent: 15 },
  { key: 17, code: "BT-Q1", name: "Phường Bến Thành", parent: 15 },
  { key: 18, code: "PNL", name: "Phường Phạm Ngũ Lão", parent: 15 },
  { key: 19, code: "TD-Q1", name: "Phường Tân Định", parent: 15 },
  { key: 20, code: "DK", name: "Phường Đa Kao", parent: 15 },

  { key: 21, code: "Q3", name: "Quận 3", parent: 1 },
  { key: 22, code: "VTS", name: "Phường Võ Thị Sáu", parent: 21 },
  { key: 23, code: "P1Q3", name: "Phường 1", parent: 21 },
  { key: 24, code: "P2Q3", name: "Phường 2", parent: 21 },

  { key: 25, code: "Q7", name: "Quận 7", parent: 1 },
  { key: 26, code: "TPH", name: "Phường Tân Phong", parent: 25 },
  { key: 27, code: "TQ", name: "Phường Tân Quy", parent: 25 },
  { key: 28, code: "PT", name: "Phường Phú Thuận", parent: 25 },

  { key: 29, code: "QBT", name: "Quận Bình Thạnh", parent: 1 },
  { key: 30, code: "P25BT", name: "Phường 25", parent: 29 },
  { key: 31, code: "P26BT", name: "Phường 26", parent: 29 },

  ...Array.from({ length: 5 }, (_, index) => ({
    key: 32 + index,
    code: `Q${index + 8}`,
    name: `Quận ${index + 8}`,
    parent: 1,
  })),

  // TP. Hà Nội
  { key: 37, code: "HN", name: "TP. Hà Nội", parent: null },
  { key: 38, code: "HK", name: "Quận Hoàn Kiếm", parent: 37 },
  { key: 39, code: "HB", name: "Phường Hàng Bạc", parent: 38 },
  { key: 40, code: "TTI", name: "Phường Tràng Tiền", parent: 38 },
  { key: 41, code: "HD", name: "Phường Hàng Đào", parent: 38 },

  { key: 42, code: "CG", name: "Quận Cầu Giấy", parent: 37 },
  { key: 43, code: "DV", name: "Phường Dịch Vọng", parent: 42 },
  { key: 44, code: "DVH", name: "Phường Dịch Vọng Hậu", parent: 42 },
  { key: 45, code: "TH", name: "Phường Trung Hòa", parent: 42 },
  { key: 46, code: "BD", name: "Quận Ba Đình", parent: 37 },

  // TP. Đà Nẵng
  { key: 47, code: "DN", name: "TP. Đà Nẵng", parent: null },
  { key: 48, code: "HC", name: "Quận Hải Châu", parent: 47 },
  { key: 49, code: "TT-DN", name: "Phường Thạch Thang", parent: 48 },
  { key: 50, code: "PN", name: "Phường Phước Ninh", parent: 48 },

  { key: 51, code: "ST", name: "Quận Sơn Trà", parent: 47 },
  { key: 52, code: "AHB", name: "Phường An Hải Bắc", parent: 51 },
];

export const facilitiesMock: Facility[] = seeds.map((item) => ({
  id: guid(item.key),
  organizationId: MOCK_ORGANIZATION_ID,
  facilityCode: item.code,
  facilityName: item.name,
  isActive: true,
  parentId: item.parent === null ? null : guid(item.parent),
  createdAt,
}));
