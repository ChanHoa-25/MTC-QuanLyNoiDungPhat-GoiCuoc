import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

import { devicesMock } from "../pages/devices/data/devices.mock";
import type { Device } from "../pages/devices/types/device.types";

interface DeviceContextType {
  devices: Device[];
  getDeviceById: (id: string) => Device | undefined;
  addDevice: (device: Device) => void;
  updateDevice: (id: string, data: Partial<Device>) => void;
  deleteDevices: (ids: string[]) => void;
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

interface DeviceProviderProps {
  children: ReactNode;
}

export function DeviceProvider({ children }: DeviceProviderProps) {
  // Khởi tạo danh sách thiết bị từ mock data
  const [devices, setDevices] = useState<Device[]>(() => [...devicesMock]);

  // Lấy thiết bị theo ID
  const getDeviceById = useCallback(
    (id: string) => {
      return devices.find((device) => device.id === id);
    },
    [devices],
  );

  // Thêm thiết bị
  const addDevice = useCallback((device: Device) => {
    setDevices((prev) => [...prev, device]);
  }, []);

  // Cập nhật thiết bị
  const updateDevice = useCallback((id: string, data: Partial<Device>) => {
    setDevices((prev) =>
      prev.map((device) =>
        device.id === id ? { ...device, ...data } : device,
      ),
    );
  }, []);

  // Xóa một hoặc nhiều thiết bị
  const deleteDevices = useCallback((ids: string[]) => {
    const idSet = new Set(ids);

    setDevices((prev) => prev.filter((device) => !idSet.has(device.id)));
  }, []);

  // Giá trị dùng chung
  const value = useMemo<DeviceContextType>(
    () => ({
      devices,
      getDeviceById,
      addDevice,
      updateDevice,
      deleteDevices,
    }),
    [devices, getDeviceById, addDevice, updateDevice, deleteDevices],
  );

  return (
    <DeviceContext.Provider value={value}>{children}</DeviceContext.Provider>
  );
}

// Hook sử dụng DeviceContext
export function useDevices() {
  const context = useContext(DeviceContext);

  if (!context) {
    throw new Error("useDevices phải được sử dụng bên trong DeviceProvider");
  }

  return context;
}
