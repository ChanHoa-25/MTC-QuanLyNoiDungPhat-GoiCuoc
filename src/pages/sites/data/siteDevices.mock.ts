import type { SiteDevice } from "../types/sitedevice.types";

export const createSiteDevicesMock = (
  siteId: string,
  siteName: string,
): SiteDevice[] => {
  const ipAddresses = [
    "192.168.1.0",
    "192.168.11.1",
    "192.168.12.23",
    "192.168.23.0",
    "192.168.244.0",
    "192.168.1.32",
    "192.168.1.223",
    "192.168.1.112",
    "192.168.1.221",
    "192.168.1.124",
  ];

  return ipAddresses.map((ipAddress, index) => ({
    id: `${siteId}-device-${index + 1}`,
    siteId,
    identifier: `MCLs${index + 1}`,
    name: `Cụm loa ${String(index + 1).padStart(2, "0")}`,
    ipAddress,
    siteName,
    activityStatus: index === 9 ? "inactive" : "active",
    connectionStatus: index === 9 ? "disconnected" : "connected",
  }));
};
