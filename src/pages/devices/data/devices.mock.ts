import type { Device } from "../types/device.types";
import type { Facility } from "../../facilities/types/facility.types";
import { facilitiesMock } from "../../facilities/data/facilities.mock";

// Tìm cơ sở trong cây Facilities
function findFacility(
  facilities: Facility[],
  facilityId: string,
): Facility | undefined {
  for (const facility of facilities) {
    if (facility.id === facilityId) {
      return facility;
    }

    if (facility.children) {
      const found = findFacility(facility.children, facilityId);

      if (found) return found;
    }
  }

  return undefined;
}

const deviceSeeds = [
  { id: "1", facilityId: "linh-xuan" },
  { id: "2", facilityId: "binh-chieu" },
  { id: "3", facilityId: "linh-trung" },
  { id: "4", facilityId: "tam-binh" },
  { id: "5", facilityId: "tam-phu" },
  { id: "6", facilityId: "hiep-binh-phuoc" },
  { id: "7", facilityId: "hiep-binh-chanh" },
  { id: "8", facilityId: "linh-tay" },
  { id: "9", facilityId: "linh-dong" },
  { id: "10", facilityId: "linh-chieu" },
  { id: "11", facilityId: "truong-tho" },
  { id: "12", facilityId: "binh-tho" },
  { id: "13", facilityId: "ben-nghe" },
  { id: "14", facilityId: "ben-thanh" },
  { id: "15", facilityId: "pham-ngu-lao" },
  { id: "16", facilityId: "tan-dinh" },
  { id: "17", facilityId: "dakao" },
  { id: "18", facilityId: "vo-thi-sau" },
  { id: "19", facilityId: "tan-phong" },
  { id: "20", facilityId: "phu-thuan" },
];

export const devicesMock: Device[] = deviceSeeds.map((seed, index) => {
  const facility = findFacility(facilitiesMock, seed.facilityId);

  if (!facility) {
    throw new Error(`Không tìm thấy cơ sở: ${seed.facilityId}`);
  }

  const number = index + 1;
  const active = number % 5 !== 0;
  const online = active && number % 4 !== 0;

  return {
    id: seed.id,
    name: `Thiết bị phát thanh ${number}`,
    code: `MCLs${number}`,

    supplier: "Nhà cung cấp mẫu",
    supplierPhone: "0999999999",

    location: facility.facilityName,
    facilityId: facility.id,
    facilityName: facility.facilityName,

    status: active ? "active" : "inactive",
    connection: online ? "online" : "offline",
    broadcast: online && number % 3 !== 0 ? "playing" : "stopped",

    // Tọa độ minh họa, chưa phải vị trí thiết bị thực tế
    longitude: "106.700000",
    latitude: "10.800000",

    simPhone: `096944${String(4323 + index)}`,
    simSerial: String(9394403353524 + index),

    description: `CUMLOA${String(number).padStart(2, "0")}`,
  };
});
