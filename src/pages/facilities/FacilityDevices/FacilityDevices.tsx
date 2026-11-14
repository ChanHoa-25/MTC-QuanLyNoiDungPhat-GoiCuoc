import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Key } from "react";
import type { TableColumnsType } from "antd";
import { Form, Input, message } from "antd";
import { Search, SquarePen } from "lucide-react";
import axios from "axios";

import AppFilter, {
  AppFilterField,
} from "../../../components/common/AppFilter";
import AppSelect from "../../../components/common/AppSelect";
import AppTable from "../../../components/common/AppTable";
import AppTableActions from "../../../components/common/AppTableActions";
import deviceApi from "../../../api/deviceApi";
import deviceVendorApi from "../../../api/deviceVendorApi";
import FacilityDeviceFormModal from "./FacilityDeviceFormModal";

import type {
  CreateDeviceRequest,
  DeviceResponse,
  UpdateDeviceRequest,
} from "../../../types/device.types";
import type { DeviceVendor } from "../../../types/deviceVendor.types";
import type { Facility } from "../types/facility.types";
import type {
  FacilityDevice,
  FacilityDeviceFormValues,
} from "../types/facilityDevice.types";

import "./FacilityDevices.css";
import deviceCommandApi from "../../../api/deviceCommandApi";

interface FacilityDevicesProps {
  facility: Facility;
  selectedRowKeys: Key[];
  onSelectionChange: (keys: Key[]) => void;
  openCreate?: boolean;
  onCloseCreate?: () => void;
  deleteRequestId?: number;
  onDeleteComplete?: () => void;
}

type DeviceRow = FacilityDevice & { deviceVendorId?: string | null };

function mapDevice(device: DeviceResponse, facilityName: string): DeviceRow {
  const status = device.connectionStatus?.trim().toLowerCase();

  const isConnected =
    status === "connected" ||
    status === "online" ||
    status === "kết nối" ||
    status === "đã kết nối";
  return {
    id: device.id,
    facilityId: device.facilityId,
    facilityName,
    identifier: device.deviceCode,
    name: device.deviceName,
    ipAddress: device.ipAddress ?? "",
    provider: device.deviceVendorId ?? "",
    deviceVendorId: device.deviceVendorId,
    simPhoneNumber: device.simPhoneNumber ?? "",
    simSerial: device.simSerialNumber ?? "",
    tag: device.tag ?? "",
    deviceGroup: device.deviceGroupId ?? undefined,
    description: device.description ?? "",
    longitude: device.longitude != null ? String(device.longitude) : "",
    latitude: device.latitude != null ? String(device.latitude) : "",
    locationMode: "manual",
    activityStatus: device.activeStatus ? "active" : "inactive",
    connectionStatus: isConnected ? "connected" : "disconnected",
  };
}

function getApiError(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; errors?: string[] | null }
      | undefined;
    return (
      data?.errors?.filter(Boolean).join("; ") || data?.message || fallback
    );
  }
  return error instanceof Error ? error.message : fallback;
}

function FacilityDevices({
  facility,
  selectedRowKeys,
  onSelectionChange,
  openCreate = false,
  onCloseCreate,
  deleteRequestId = 0,
  onDeleteComplete,
}: FacilityDevicesProps) {
  const [devices, setDevices] = useState<DeviceRow[]>([]);
  const [vendors, setVendors] = useState<DeviceVendor[]>([]);
  const [loading, setLoading] = useState(false);
  const [vendorsLoading, setVendorsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activityFilter, setActivityFilter] = useState("all");
  const [connectionFilter, setConnectionFilter] = useState("all");
  const [keyword, setKeyword] = useState("");
  const [editingDevice, setEditingDevice] = useState<DeviceRow | null>(null);

  const handledDeleteRequestRef = useRef(deleteRequestId);
  const requestVersionRef = useRef(0);
  const deletingRef = useRef(false);
  const currentFacilityIdRef = useRef(facility.id);
  currentFacilityIdRef.current = facility.id;

  const loadDevices = useCallback(async () => {
    const version = ++requestVersionRef.current;
    setLoading(true);
    try {
      const result = await deviceApi.getAll({ facilityId: facility.id });
      if (version !== requestVersionRef.current) return;
      setDevices(
        result
          .filter((device) => device.facilityId === facility.id)
          .map((device) => mapDevice(device, facility.facilityName)),
      );
    } catch (error) {
      if (version !== requestVersionRef.current) return;
      setDevices([]);
      message.error(getApiError(error, "Không thể tải danh sách thiết bị"));
    } finally {
      if (version === requestVersionRef.current) setLoading(false);
    }
  }, [facility.id, facility.facilityName]);

  useEffect(() => {
    setDevices([]);
    setActivityFilter("all");
    setConnectionFilter("all");
    setKeyword("");
    setEditingDevice(null);
    void loadDevices();
    return () => {
      requestVersionRef.current += 1;
    };
  }, [loadDevices]);

  useEffect(() => {
    let cancelled = false;
    setVendors([]);
    setVendorsLoading(true);

    const loadVendors = async () => {
      try {
        const result = await deviceVendorApi.getAll();

        if (!cancelled) {
          setVendors(
            result.filter(
              (vendor) =>
                vendor.organizationId === null ||
                vendor.organizationId === facility.organizationId,
            ),
          );
        }
      } catch (error) {
        if (!cancelled) {
          message.error(getApiError(error, "Không thể tải nhà phân phối"));
        }
      } finally {
        if (!cancelled) setVendorsLoading(false);
      }
    };

    void loadVendors();
    return () => {
      cancelled = true;
    };
  }, [facility.organizationId]);

  const providers = useMemo(
    () =>
      vendors.map((vendor) => ({ label: vendor.vendorName, value: vendor.id })),
    [vendors],
  );

  const filteredDevices = useMemo(() => {
    const search = keyword.trim().toLowerCase();
    return devices.filter((device) => {
      const matchActivity =
        activityFilter === "all" || device.activityStatus === activityFilter;
      const matchConnection =
        connectionFilter === "all" ||
        device.connectionStatus === connectionFilter;
      const matchKeyword =
        !search ||
        device.identifier.toLowerCase().includes(search) ||
        device.name.toLowerCase().includes(search) ||
        device.ipAddress.toLowerCase().includes(search);
      return matchActivity && matchConnection && matchKeyword;
    });
  }, [devices, activityFilter, connectionFilter, keyword]);

  useEffect(() => {
    if (deleteRequestId === handledDeleteRequestRef.current) return;
    handledDeleteRequestRef.current = deleteRequestId;
    if (deletingRef.current) return;

    const ids = selectedRowKeys.map(String);
    if (ids.length === 0) {
      onDeleteComplete?.();
      return;
    }

    deletingRef.current = true;
    const deleteDevices = async () => {
      try {
        const results = await Promise.allSettled(
          ids.map((id) => deviceApi.remove(id)),
        );
        const deletedIds = ids.filter(
          (_, index) => results[index].status === "fulfilled",
        );
        const failedIds = ids.filter(
          (_, index) => results[index].status === "rejected",
        );
        if (deletedIds.length) {
          message.success(`Đã xóa ${deletedIds.length} thiết bị thành công`);
        }
        if (failedIds.length) {
          message.error(`Không thể xóa ${failedIds.length} thiết bị`);
        }
        onSelectionChange(failedIds);
        await loadDevices();
      } catch (error) {
        message.error(getApiError(error, "Không thể hoàn tất xóa thiết bị"));
      } finally {
        deletingRef.current = false;
        onDeleteComplete?.();
      }
    };
    void deleteDevices();
  }, [
    deleteRequestId,
    selectedRowKeys,
    onSelectionChange,
    onDeleteComplete,
    loadDevices,
  ]);

  const getSelectedVendor = (vendorId: string) => {
    return vendors.find(
      (vendor) =>
        vendor.id === vendorId &&
        (vendor.organizationId === null ||
          vendor.organizationId === facility.organizationId),
    );
  };

  const handleCreateDevice = async (values: FacilityDeviceFormValues) => {
    if (saving) return;
    if (vendorsLoading) {
      message.warning("Đang tải danh sách nhà phân phối");
      return;
    }
    const vendor = getSelectedVendor(values.provider);
    if (!vendor) {
      message.error("Vui lòng chọn nhà phân phối hợp lệ của tổ chức");
      return;
    }

    const payload: CreateDeviceRequest = {
      organizationId: facility.organizationId,
      facilityId: facility.id,
      deviceCode: values.identifier.trim(),
      deviceName: values.name.trim(),
      osType: values.osType,
      description: values.description?.trim() || null,
      ipAddress: values.ipAddress?.trim() || null,
      deviceVendorId: vendor.id,
      vendorName: vendor.vendorName,
      deviceGroupId: values.deviceGroup || null,
      activeStatus: values.activityStatus === "active",
      screenshotSizeInBytes: 0,
      simPhoneNumber: values.simPhoneNumber?.trim() || null,
      simSerialNumber: values.simSerial?.trim() || null,
      tag: values.tag?.trim() || null,
      longitude:
        values.locationMode === "manual" && values.longitude?.trim()
          ? Number(values.longitude)
          : null,
      latitude:
        values.locationMode === "manual" && values.latitude?.trim()
          ? Number(values.latitude)
          : null,
    };

    setSaving(true);
    try {
      await deviceApi.create(payload);
      message.success("Thêm mới thiết bị thành công");
      onCloseCreate?.();
      await loadDevices();
    } catch (error) {
      message.error(getApiError(error, "Không thể thêm thiết bị"));
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateDevice = async (values: FacilityDeviceFormValues) => {
    if (!editingDevice || saving) return;
    const vendor = getSelectedVendor(values.provider);
    if (!vendor) {
      message.error("Vui lòng chọn nhà phân phối hợp lệ của tổ chức");
      return;
    }

    setSaving(true);
    try {
      const current = await deviceApi.getById(editingDevice.id);

      if (!current.osType?.trim()) {
        message.error("Thiết bị chưa có thông tin hệ điều hành");
        return;
      }

      const payload: UpdateDeviceRequest = {
        organizationId: current.organizationId,
        facilityId: current.facilityId,
        deviceCode: current.deviceCode,
        deviceName: values.name.trim(),
        description: values.description?.trim() || null,
        serialNumber: current.serialNumber,
        ipAddress: current.ipAddress,
        simPhoneNumber: values.simPhoneNumber?.trim() || null,
        simSerialNumber: values.simSerial?.trim() || null,
        tag: current.tag,
        osType: current.osType,
        vendorName: vendor.vendorName,
        deviceVendorId: vendor.id,
        deviceGroupId: values.deviceGroup || null,
        activeStatus: values.activityStatus === "active",
        volume: current.volume,
        screenshotUrl: current.screenshotUrl,
        screenshotSizeInBytes: current.screenshotSizeInBytes ?? 0,
        lastScreenshotAt: current.lastScreenshotAt,
        latitude:
          values.locationMode === "manual" && values.latitude?.trim()
            ? Number(values.latitude)
            : current.latitude,
        longitude:
          values.locationMode === "manual" && values.longitude?.trim()
            ? Number(values.longitude)
            : current.longitude,
        installationAddress: current.installationAddress,
        connectionStatus: current.connectionStatus,
        playStatus: current.playStatus,
        lastOnlineAt: current.lastOnlineAt,
      };

      await deviceApi.update(editingDevice.id, payload);
      message.success("Cập nhật thiết bị thành công");
      setEditingDevice(null);
      await loadDevices();
    } catch (error) {
      message.error(getApiError(error, "Không thể cập nhật thiết bị"));
    } finally {
      setSaving(false);
    }
  };

  const [commandLoading, setCommandLoading] = useState(false);

  const handleChangeVolume = async (volume: number) => {
    const ids = selectedRowKeys.map(String);

    if (ids.length === 0) {
      message.warning("Vui lòng chọn ít nhất một thiết bị");
      return;
    }

    if (commandLoading) return;

    setCommandLoading(true);

    try {
      if (ids.length === 1) {
        await deviceCommandApi.setVolume(ids[0], volume);
      } else {
        await deviceCommandApi.setVolumeMany(ids, volume);
      }

      message.success("Đã gửi lệnh điều chỉnh âm lượng");
      await loadDevices();
    } catch (error) {
      message.error(getApiError(error, "Không thể điều chỉnh âm lượng"));
    } finally {
      setCommandLoading(false);
    }
  };

  const handleRebootDevices = async () => {
    const ids = selectedRowKeys.map(String);

    if (ids.length === 0) {
      message.warning("Vui lòng chọn ít nhất một thiết bị");
      return;
    }

    if (commandLoading) return;

    setCommandLoading(true);

    try {
      if (ids.length === 1) {
        await deviceCommandApi.reboot(ids[0]);
      } else {
        await deviceCommandApi.rebootMany(ids);
      }

      message.success("Đã gửi lệnh khởi động lại thiết bị");
    } catch (error) {
      message.error(getApiError(error, "Không thể gửi lệnh khởi động lại"));
    } finally {
      setCommandLoading(false);
    }
  };

  const handleOpenEditDevice = async (device: DeviceRow) => {
    const facilityId = facility.id;

    try {
      const result = await deviceApi.getById(device.id);

      if (currentFacilityIdRef.current !== facilityId) {
        return;
      }

      if (result.facilityId !== facilityId) {
        message.error("Thiết bị không thuộc cơ sở hiện tại");
        return;
      }

      setEditingDevice(mapDevice(result, facility.facilityName));
    } catch (error) {
      if (currentFacilityIdRef.current !== facilityId) {
        return;
      }

      message.error(getApiError(error, "Không thể tải thông tin thiết bị"));
    }
  };

  const columns: TableColumnsType<DeviceRow> = [
    {
      title: "Mã định danh",
      dataIndex: "identifier",
      key: "identifier",
      width: 130,
    },
    { title: "Tên thiết bị", dataIndex: "name", key: "name", width: 140 },
    {
      title: "Địa chỉ IP",
      dataIndex: "ipAddress",
      key: "ipAddress",
      width: 130,
    },
    {
      title: "Cơ sở",
      dataIndex: "facilityName",
      key: "facilityName",
      width: 160,
    },
    {
      title: "Trạng thái hoạt động",
      dataIndex: "activityStatus",
      key: "activityStatus",
      width: 170,
      render: (status: DeviceRow["activityStatus"]) => (
        <span
          className={`facility-devices__status facility-devices__status--${status}`}>
          <span className="facility-devices__status-dot" />
          {status === "active" ? "Đang hoạt động" : "Ngừng hoạt động"}
        </span>
      ),
    },
    {
      title: "Trạng thái kết nối",
      dataIndex: "connectionStatus",
      key: "connectionStatus",
      width: 150,
      render: (status: DeviceRow["connectionStatus"]) => (
        <span
          className={`facility-devices__status facility-devices__status--${status}`}>
          <span className="facility-devices__status-dot" />
          {status === "connected" ? "Kết nối" : "Mất kết nối"}
        </span>
      ),
    },
    {
      title: "Cập nhật",
      key: "actions",
      width: 90,
      align: "center",
      render: (_, record) => (
        <AppTableActions
          actions={[
            {
              key: "edit",
              icon: <SquarePen />,
              tooltip: "Cập nhật thiết bị",
              onClick: () => void handleOpenEditDevice(record),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="facility-devices">
      <div className="facility-devices__panel">
        <h2 className="facility-devices__title">Danh sách thiết bị</h2>
        <AppFilter
          showActions={false}
          gap={28}
          className="facility-devices__filters">
          <AppFilterField width={180}>
            <Form.Item label="Trạng thái hoạt động">
              <AppSelect
                width="100%"
                value={activityFilter}
                onChange={setActivityFilter}
                options={[
                  { label: "Tất cả", value: "all" },
                  { label: "Đang hoạt động", value: "active" },
                  { label: "Ngừng hoạt động", value: "inactive" },
                ]}
              />
            </Form.Item>
          </AppFilterField>
          <AppFilterField width={180}>
            <Form.Item label="Trạng thái kết nối">
              <AppSelect
                width="100%"
                value={connectionFilter}
                onChange={setConnectionFilter}
                options={[
                  { label: "Tất cả", value: "all" },
                  { label: "Kết nối", value: "connected" },
                  { label: "Mất kết nối", value: "disconnected" },
                ]}
              />
            </Form.Item>
          </AppFilterField>
          <AppFilterField width={353} className="facility-devices__search">
            <Form.Item label="Từ khóa">
              <Input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Tên thiết bị/ Mã định danh/ Địa chỉ IP"
                suffix={<Search size={20} />}
                allowClear
              />
            </Form.Item>
          </AppFilterField>
        </AppFilter>
        <AppTable<DeviceRow>
          rowKey="id"
          columns={columns}
          dataSource={filteredDevices}
          loading={loading}
          selectable
          selectedLabel="thiết bị"
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => onSelectionChange([...keys]),
          }}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1070 }}
        />
      </div>
      <FacilityDeviceFormModal
        open={openCreate}
        mode="create"
        facilityName={facility.facilityName}
        providers={providers}
        loading={saving || vendorsLoading}
        onCancel={() => {
          if (!saving) onCloseCreate?.();
        }}
        onSubmit={handleCreateDevice}
      />
      <FacilityDeviceFormModal
        open={editingDevice !== null}
        mode="edit"
        initialValues={editingDevice}
        facilityName={facility.facilityName}
        providers={providers}
        loading={saving || vendorsLoading}
        onCancel={() => {
          if (!saving) setEditingDevice(null);
        }}
        onSubmit={handleUpdateDevice}
      />
    </div>
  );
}

export default FacilityDevices;
