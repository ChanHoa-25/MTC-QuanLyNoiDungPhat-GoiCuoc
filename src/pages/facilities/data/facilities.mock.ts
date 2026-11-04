import type { Facility } from "../types/facility.types";

interface FacilitySeed {
  id: string;
  code: string;
  name: string;
  children?: FacilitySeed[];
}

const organizationId = "mtc";
const createdAt = "2026-11-04T00:00:00.000Z";

function createFacilityTree(
  items: FacilitySeed[],
  parentId: string | null = null,
): Facility[] {
  return items.map((item) => ({
    id: item.id,
    organizationId,
    facilityCode: item.code,
    facilityName: item.name,
    parentId,
    isActive: true,
    createdAt,
    children: item.children
      ? createFacilityTree(item.children, item.id)
      : undefined,
  }));
}

const facilitySeeds: FacilitySeed[] = [
  {
    id: "hcm",
    code: "TPHCM",
    name: "TP. Hồ Chí Minh",
    children: [
      {
        id: "thu-duc",
        code: "TD",
        name: "Quận Thủ Đức",
        children: [
          { id: "linh-xuan", code: "LX", name: "Phường Linh Xuân" },
          { id: "binh-chieu", code: "BC", name: "Phường Bình Chiểu" },
          { id: "linh-trung", code: "LT", name: "Phường Linh Trung" },
          { id: "tam-binh", code: "TB", name: "Phường Tam Bình" },
          { id: "tam-phu", code: "TP", name: "Phường Tam Phú" },
          {
            id: "hiep-binh-phuoc",
            code: "HBP",
            name: "Phường Hiệp Bình Phước",
          },
          {
            id: "hiep-binh-chanh",
            code: "HBC",
            name: "Phường Hiệp Bình Chánh",
          },
          { id: "linh-tay", code: "LTA", name: "Phường Linh Tây" },
          { id: "linh-dong", code: "LD", name: "Phường Linh Đông" },
          { id: "linh-chieu", code: "LC", name: "Phường Linh Chiểu" },
          { id: "truong-tho", code: "TT", name: "Phường Trường Thọ" },
          { id: "binh-tho", code: "BT", name: "Phường Bình Thọ" },
        ],
      },
      {
        id: "quan-1",
        code: "Q1",
        name: "Quận 1",
        children: [
          { id: "ben-nghe", code: "BN", name: "Phường Bến Nghé" },
          { id: "ben-thanh", code: "BT", name: "Phường Bến Thành" },
          {
            id: "pham-ngu-lao",
            code: "PNL",
            name: "Phường Phạm Ngũ Lão",
          },
          { id: "tan-dinh", code: "TD", name: "Phường Tân Định" },
          { id: "dakao", code: "DK", name: "Phường Đa Kao" },
        ],
      },
      {
        id: "quan-3",
        code: "Q3",
        name: "Quận 3",
        children: [
          { id: "vo-thi-sau", code: "VTS", name: "Phường Võ Thị Sáu" },
          { id: "p1-q3", code: "P1Q3", name: "Phường 1" },
          { id: "p2-q3", code: "P2Q3", name: "Phường 2" },
        ],
      },
      {
        id: "quan-7",
        code: "Q7",
        name: "Quận 7",
        children: [
          { id: "tan-phong", code: "TPH", name: "Phường Tân Phong" },
          { id: "tan-quy", code: "TQ", name: "Phường Tân Quy" },
          { id: "phu-thuan", code: "PT", name: "Phường Phú Thuận" },
        ],
      },
      {
        id: "quan-binh-thanh",
        code: "QBT",
        name: "Quận Bình Thạnh",
        children: [
          { id: "p25-bt", code: "P25BT", name: "Phường 25" },
          { id: "p26-bt", code: "P26BT", name: "Phường 26" },
        ],
      },
      ...Array.from(
        { length: 5 },
        (_, index): FacilitySeed => ({
          id: `quan-${index + 8}`,
          code: `Q${index + 8}`,
          name: `Quận ${index + 8}`,
        }),
      ),
    ],
  },
  {
    id: "hanoi",
    code: "HN",
    name: "TP. Hà Nội",
    children: [
      {
        id: "hoan-kiem",
        code: "HK",
        name: "Quận Hoàn Kiếm",
        children: [
          { id: "hang-bac", code: "HB", name: "Phường Hàng Bạc" },
          { id: "trang-tien", code: "TTI", name: "Phường Tràng Tiền" },
          { id: "hang-dao", code: "HD", name: "Phường Hàng Đào" },
        ],
      },
      {
        id: "cau-giay",
        code: "CG",
        name: "Quận Cầu Giấy",
        children: [
          { id: "dich-vong", code: "DV", name: "Phường Dịch Vọng" },
          {
            id: "dich-vong-hau",
            code: "DVH",
            name: "Phường Dịch Vọng Hậu",
          },
          { id: "trung-hoa", code: "TH", name: "Phường Trung Hòa" },
        ],
      },
      {
        id: "ba-dinh",
        code: "BD",
        name: "Quận Ba Đình",
      },
    ],
  },
  {
    id: "da-nang",
    code: "DN",
    name: "TP. Đà Nẵng",
    children: [
      {
        id: "hai-chau",
        code: "HC",
        name: "Quận Hải Châu",
        children: [
          { id: "thach-thang", code: "TT", name: "Phường Thạch Thang" },
          { id: "phuoc-ninh", code: "PN", name: "Phường Phước Ninh" },
        ],
      },
      {
        id: "son-tra",
        code: "ST",
        name: "Quận Sơn Trà",
        children: [
          { id: "an-hai-bac", code: "AHB", name: "Phường An Hải Bắc" },
        ],
      },
    ],
  },
];

export const facilitiesMock: Facility[] = createFacilityTree(facilitySeeds);
