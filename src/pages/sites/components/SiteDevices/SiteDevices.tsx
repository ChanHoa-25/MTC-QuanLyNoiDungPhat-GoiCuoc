import { useEffect, useMemo, useState } from "react";
import type { Key } from "react";
import type { TableColumnsType } from "antd";
import { Form, Input, message } from "antd";
import { Search, SquarePen } from "lucide-react";

import AppFilter, {
  AppFilterField,
} from "../../../../components/common/AppFilter";
import AppSelect from "../../../../components/common/AppSelect";
import AppTable from "../../../../components/common/AppTable";
import AppTableActions from "../../../../components/common/AppTableActions";

import SiteDeviceFormModal from "../SiteDeviceFormModal";
import { createSiteDevicesMock } from "../../data/siteDevices.mock";

import type { Site } from "../../types/site.types";
import type {
  SiteDevice,
  SiteDeviceFormValues,
} from "../../types/sitedevice.types";

import "./SiteDevices.css";

interface SiteDevicesProps {
  site: Site;
  selectedRowKeys: Key[];
  onSelectionChange: (keys: Key[]) => void;
  openCreate?: boolean;
  onCloseCreate?: () => void;
  deleteRequestId?: number;
  onDeleteComplete?: () => void;
}

function SiteDevices({
  site,
  selectedRowKeys,
  onSelectionChange,
  openCreate = false,
  onCloseCreate = () => {},
  deleteRequestId = 0,
  onDeleteComplete = () => {},
}: SiteDevicesProps) {
  const [devices, setDevices] = useState<SiteDevice[]>(() =>
    createSiteDevicesMock(site.id, site.name),
  );

  const [activityFilter, setActivityFilter] = useState("all");
  const [connectionFilter, setConnectionFilter] = useState("all");
  const [keyword, setKeyword] = useState("");

  const [editingDevice, setEditingDevice] = useState<SiteDevice | null>(null);

  const [saving, setSaving] = useState(false);

  // Đánh dấu yêu cầu xóa đã xử lý để tránh chạy lại.
  const [handledDeleteRequest, setHandledDeleteRequest] =
    useState(deleteRequestId);

  const filteredDevices = useMemo(() => {
    const search = keyword.trim().toLowerCase();

    return devices.filter((device) => {
      const matchSite = device.siteId === site.id;

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

      return matchSite && matchActivity && matchConnection && matchKeyword;
    });
  }, [devices, site.id, activityFilter, connectionFilter, keyword]);

  // Xử lý yêu cầu xóa từ SitesPage.
  useEffect(() => {
    if (deleteRequestId === handledDeleteRequest) return;

    setHandledDeleteRequest(deleteRequestId);

    const selectedIds = new Set(selectedRowKeys);

    const count = devices.filter(
      (device) => device.siteId === site.id && selectedIds.has(device.id),
    ).length;

    if (count > 0) {
      setDevices((previous) =>
        previous.filter(
          (device) =>
            !(device.siteId === site.id && selectedIds.has(device.id)),
        ),
      );

      message.success(`Đã xóa ${count} thiết bị thành công`);
    }

    onSelectionChange([]);
    onDeleteComplete();
  }, [
    deleteRequestId,
    handledDeleteRequest,
    selectedRowKeys,
    devices,
    site.id,
    onSelectionChange,
    onDeleteComplete,
  ]);

  const handleOpenEdit = (device: SiteDevice) => {
    setEditingDevice(device);
  };

  const handleCloseEdit = () => {
    if (saving) return;
    setEditingDevice(null);
  };

  const handleCloseCreate = () => {
    if (saving) return;
    onCloseCreate();
  };

  const handleCreateDevice = (values: SiteDeviceFormValues) => {
    if (saving) return;

    const exists = devices.some(
      (device) =>
        device.identifier.toLowerCase() === values.identifier.toLowerCase(),
    );

    if (exists) {
      message.error("Mã định danh thiết bị đã tồn tại");
      return;
    }

    setSaving(true);

    try {
      const newDevice: SiteDevice = {
        id: crypto.randomUUID(),
        siteId: site.id,
        siteName: site.name,
        identifier: values.identifier,
        name: values.name,
        ipAddress: values.ipAddress,
        provider: values.provider,
        simPhoneNumber: values.simPhoneNumber,
        simSerial: values.simSerial,
        tag: values.tag,
        activityStatus: "active",
        connectionStatus: "disconnected",
      };

      setDevices((previous) => [newDevice, ...previous]);

      message.success("Thêm mới thiết bị thành công");
      onCloseCreate();
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateDevice = (values: SiteDeviceFormValues) => {
    if (!editingDevice || saving) return;

    setSaving(true);

    try {
      setDevices((previous) =>
        previous.map((device) =>
          device.id === editingDevice.id
            ? {
                ...device,
                name: values.name,
                ipAddress: values.ipAddress,
                provider: values.provider,
                simPhoneNumber: values.simPhoneNumber,
                simSerial: values.simSerial,
                tag: values.tag,
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

  const columns: TableColumnsType<SiteDevice> = [
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
      dataIndex: "siteName",
      key: "siteName",
      width: 160,
    },
    {
      title: "Trạng thái hoạt động",
      dataIndex: "activityStatus",
      key: "activityStatus",
      width: 170,
      render: (status: SiteDevice["activityStatus"]) => (
        <span
          className={`site-devices__status site-devices__status--${status}`}>
          <span className="site-devices__status-dot" />
          {status === "active" ? "Đang hoạt động" : "Ngừng hoạt động"}
        </span>
      ),
    },
    {
      title: "Trạng thái kết nối",
      dataIndex: "connectionStatus",
      key: "connectionStatus",
      width: 150,
      render: (status: SiteDevice["connectionStatus"]) => (
        <span
          className={`site-devices__status site-devices__status--${status}`}>
          <span className="site-devices__status-dot" />
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
              onClick: () => handleOpenEdit(record),
            },
          ]}
        />
      ),
    },
  ];

  // Danh sách nhà cung cấp tạm thời.
  // Thay bằng danh sách từ API hoặc dữ liệu cấu hình.
  const providers = [
    { label: "Mobifone", value: "Mobifone" },
    { label: "Viettel", value: "Viettel" },
    { label: "Vinaphone", value: "Vinaphone" },
  ];

  return (
    <div className="site-devices">
      <div className="site-devices__panel">
        <h2 className="site-devices__title">Danh sách thiết bị</h2>

        <AppFilter
          showActions={false}
          gap={28}
          className="site-devices__filters">
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

          <AppFilterField width={353} className="site-devices__search">
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

        <AppTable<SiteDevice>
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

      <SiteDeviceFormModal
        open={openCreate}
        mode="create"
        siteName={site.name}
        providers={providers}
        loading={saving}
        onCancel={handleCloseCreate}
        onSubmit={handleCreateDevice}
      />

      <SiteDeviceFormModal
        open={editingDevice !== null}
        mode="edit"
        initialValues={editingDevice}
        siteName={site.name}
        providers={providers}
        loading={saving}
        onCancel={handleCloseEdit}
        onSubmit={handleUpdateDevice}
      />
    </div>
  );
}

export default SiteDevices;
