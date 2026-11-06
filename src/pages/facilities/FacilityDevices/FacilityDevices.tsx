import { useEffect, useMemo, useRef, useState } from "react";
import type { Key } from "react";
import type { TableColumnsType } from "antd";
import { Form, Input, message } from "antd";
import { Search, SquarePen } from "lucide-react";

import AppFilter, {
  AppFilterField,
} from "../../../components/common/AppFilter";
import AppSelect from "../../../components/common/AppSelect";
import AppTable from "../../../components/common/AppTable";
import AppTableActions from "../../../components/common/AppTableActions";

import FacilityDeviceFormModal from "./FacilityDeviceFormModal";
import { createFacilityDevicesMock } from "../data/facilitiesDevices.mock";

import type { Facility } from "../types/facility.types";
import type {
  FacilityDevice,
  FacilityDeviceFormValues,
} from "../types/facilityDevice.types";

import "./FacilityDevices.css";

interface FacilityDevicesProps {
  facility: Facility;
  selectedRowKeys: Key[];
  onSelectionChange: (keys: Key[]) => void;
  openCreate?: boolean;
  onCloseCreate?: () => void;
  deleteRequestId?: number;
  onDeleteComplete?: () => void;
}

const providers = [
  { label: "Mobifone", value: "Mobifone" },
  { label: "Viettel", value: "Viettel" },
  { label: "Vinaphone", value: "Vinaphone" },
];

// Lưu dữ liệu mock theo cơ sở trong phiên chạy ứng dụng.
// Không bị reset khi chuyển tab hoặc chuyển cơ sở.
const deviceStore = new Map<string, FacilityDevice[]>();

function getFacilityDevices(facility: Facility): FacilityDevice[] {
  const existing = deviceStore.get(facility.id);

  if (existing) {
    return existing;
  }

  const initialDevices = createFacilityDevicesMock(
    facility.id,
    facility.facilityName,
  );

  deviceStore.set(facility.id, initialDevices);

  return initialDevices;
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
  const [devices, setDevices] = useState<FacilityDevice[]>(() =>
    getFacilityDevices(facility),
  );

  const [activityFilter, setActivityFilter] = useState("all");
  const [connectionFilter, setConnectionFilter] = useState("all");
  const [keyword, setKeyword] = useState("");

  const [editingDevice, setEditingDevice] = useState<FacilityDevice | null>(
    null,
  );

  const [saving, setSaving] = useState(false);

  const handledDeleteRequestRef = useRef(deleteRequestId);

  // Cập nhật đồng thời React state và mock store.
  const updateDevices = (
    updater: (previous: FacilityDevice[]) => FacilityDevice[],
  ) => {
    const currentDevices = getFacilityDevices(facility);
    const nextDevices = updater(currentDevices);

    deviceStore.set(facility.id, nextDevices);
    setDevices(nextDevices);
  };

  // Khi chuyển cơ sở, lấy dữ liệu đã lưu thay vì tạo lại mock.
  useEffect(() => {
    setDevices(getFacilityDevices(facility));
    setActivityFilter("all");
    setConnectionFilter("all");
    setKeyword("");
    setEditingDevice(null);
  }, [facility.id, facility.facilityName]);

  // Danh sách sau khi lọc.
  const filteredDevices = useMemo(() => {
    const search = keyword.trim().toLowerCase();

    return devices.filter((device) => {
      const matchFacility = device.facilityId === facility.id;

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

      return matchFacility && matchActivity && matchConnection && matchKeyword;
    });
  }, [devices, facility.id, activityFilter, connectionFilter, keyword]);

  // Xử lý yêu cầu xóa từ FacilitiesPage.
  useEffect(() => {
    if (deleteRequestId === handledDeleteRequestRef.current) {
      return;
    }

    handledDeleteRequestRef.current = deleteRequestId;

    const selectedIds = new Set(selectedRowKeys);
    const currentDevices = getFacilityDevices(facility);

    const deletedDevices = currentDevices.filter(
      (device) =>
        device.facilityId === facility.id && selectedIds.has(device.id),
    );

    if (deletedDevices.length > 0) {
      const nextDevices = currentDevices.filter(
        (device) =>
          !(device.facilityId === facility.id && selectedIds.has(device.id)),
      );

      deviceStore.set(facility.id, nextDevices);
      setDevices(nextDevices);

      setEditingDevice((previous) =>
        previous && selectedIds.has(previous.id) ? null : previous,
      );

      message.success(`Đã xóa ${deletedDevices.length} thiết bị thành công`);
    }

    onSelectionChange([]);
    onDeleteComplete?.();
  }, [
    deleteRequestId,
    selectedRowKeys,
    facility,
    onSelectionChange,
    onDeleteComplete,
  ]);

  // Kiểm tra mã định danh đã tồn tại.
  const isIdentifierExists = (identifier: string) => {
    const normalized = identifier.trim().toLowerCase();

    for (const facilityDevices of deviceStore.values()) {
      if (
        facilityDevices.some(
          (device) => device.identifier.trim().toLowerCase() === normalized,
        )
      ) {
        return true;
      }
    }

    return false;
  };

  // Thêm thiết bị.
  const handleCreateDevice = (values: FacilityDeviceFormValues) => {
    if (saving) return;

    if (isIdentifierExists(values.identifier)) {
      message.error("Mã định danh thiết bị đã tồn tại");
      return;
    }

    setSaving(true);

    try {
      const newDevice: FacilityDevice = {
        id: crypto.randomUUID(),
        facilityId: facility.id,
        facilityName: facility.facilityName,
        identifier: values.identifier.trim(),
        name: values.name.trim(),
        ipAddress: values.ipAddress.trim(),
        provider: values.provider,
        simPhoneNumber: values.simPhoneNumber?.trim() ?? "",
        simSerial: values.simSerial?.trim() ?? "",
        tag: values.tag?.trim() ?? "",
        activityStatus: "active",
        connectionStatus: "disconnected",
      };

      updateDevices((previous) => [newDevice, ...previous]);

      message.success("Thêm mới thiết bị thành công");
      onCloseCreate?.();
    } finally {
      setSaving(false);
    }
  };

  // Cập nhật thiết bị.
  const handleUpdateDevice = (values: FacilityDeviceFormValues) => {
    if (!editingDevice || saving) return;

    setSaving(true);

    try {
      updateDevices((previous) =>
        previous.map((device) =>
          device.id === editingDevice.id
            ? {
                ...device,
                name: values.name.trim(),
                ipAddress: values.ipAddress.trim(),
                provider: values.provider,
                simPhoneNumber: values.simPhoneNumber?.trim() ?? "",
                simSerial: values.simSerial?.trim() ?? "",
                tag: values.tag?.trim() ?? "",
              }
            : device,
        ),
      );

      message.success("Cập nhật thiết bị thành công");
      setEditingDevice(null);
    } finally {
      setSaving(false);
    }
  };

  const handleCloseCreate = () => {
    if (!saving) onCloseCreate?.();
  };

  const handleCloseEdit = () => {
    if (!saving) setEditingDevice(null);
  };

  const columns: TableColumnsType<FacilityDevice> = [
    {
      title: "Mã định danh",
      dataIndex: "identifier",
      key: "identifier",
      width: 130,
    },
    {
      title: "Tên thiết bị",
      dataIndex: "name",
      key: "name",
      width: 140,
    },
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
      render: (status: FacilityDevice["activityStatus"]) => (
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
      render: (status: FacilityDevice["connectionStatus"]) => (
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
              onClick: () => setEditingDevice(record),
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

        <AppTable<FacilityDevice>
          rowKey="id"
          columns={columns}
          dataSource={filteredDevices}
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
        loading={saving}
        onCancel={handleCloseCreate}
        onSubmit={handleCreateDevice}
      />

      <FacilityDeviceFormModal
        open={editingDevice !== null}
        mode="edit"
        initialValues={editingDevice}
        facilityName={facility.facilityName}
        providers={providers}
        loading={saving}
        onCancel={handleCloseEdit}
        onSubmit={handleUpdateDevice}
      />
    </div>
  );
}

export default FacilityDevices;
