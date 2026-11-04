import { useMemo, useState } from "react";
import type { Key } from "react";

import { Form, message } from "antd";
import type { TableColumnsType } from "antd";
import { useNavigate } from "react-router-dom";

import {
  Plus,
  Trash2,
  RefreshCw,
  Volume2,
  SquarePen,
  Info,
  Crosshair,
} from "lucide-react";

import { ROUTES } from "../../constants/route.constants";

import AppFilter, { AppFilterField } from "../../components/common/AppFilter";
import AppSelect from "../../components/common/AppSelect";
import AppSearch from "../../components/common/AppSearch";
import AppTable from "../../components/common/AppTable";
import AppTableActions from "../../components/common/AppTableActions";
import AppActionPanel from "../../components/common/AppActionPanel";
import AppStatusTag from "../../components/common/AppStatusTag";
import AppConfirmModal from "../../components/common/AppConfirmModal";

import { useDevices } from "../../contexts/DeviceContext";

import DeviceVolumeModal from "./components/DeviceVolumeModal";

import { facilitiesMock } from "../facilities/data/facilities.mock";
import {
  flattenFacilities,
  getFacilityDescendantIds,
} from "../facilities/utils/facility.utils";

import type { Device } from "./types/device.types";

import "./DevicesPage.css";

interface DeviceFilters {
  facilityId?: string;
  status?: string;
  connection?: string;
  broadcast?: string;
}

const PAGE_SIZE = 10;

const facilityOptions = flattenFacilities(facilitiesMock).map((facility) => ({
  label: facility.facilityName,
  value: facility.id,
}));

function DevicesPage() {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // Dữ liệu thiết bị dùng chung
  const { devices, deleteDevices } = useDevices();

  // Tìm kiếm và lọc
  const [keyword, setKeyword] = useState("");
  const [filters, setFilters] = useState<DeviceFilters>({});

  // Chọn thiết bị và phân trang
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Trạng thái popup
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [restartOpen, setRestartOpen] = useState(false);
  const [volumeOpen, setVolumeOpen] = useState(false);

  // Âm lượng hiện tại (mock)
  const [volume, setVolume] = useState(0);

  // Lấy cơ sở được chọn và toàn bộ cơ sở con
  const selectedFacilityIds = useMemo(() => {
    if (!filters.facilityId) return null;

    return new Set(
      getFacilityDescendantIds(facilitiesMock, filters.facilityId),
    );
  }, [filters.facilityId]);

  // Lọc và tìm kiếm thiết bị
  const filteredDevices = useMemo(() => {
    const search = keyword.trim().toLowerCase();

    return devices.filter((device) => {
      const matchKeyword =
        !search ||
        [
          device.name,
          device.code,
          device.location,
          device.supplier,
          device.facilityName,
        ].some((value) => (value ?? "").toLowerCase().includes(search));

      const matchFacility =
        !selectedFacilityIds || selectedFacilityIds.has(device.facilityId);

      const matchStatus = !filters.status || device.status === filters.status;

      const matchConnection =
        !filters.connection || device.connection === filters.connection;

      const matchBroadcast =
        !filters.broadcast || device.broadcast === filters.broadcast;

      return (
        matchKeyword &&
        matchFacility &&
        matchStatus &&
        matchConnection &&
        matchBroadcast
      );
    });
  }, [devices, keyword, filters, selectedFacilityIds]);

  // Cập nhật bộ lọc
  const updateFilters = (values: Record<string, unknown>) => {
    const nextFilters: DeviceFilters = {};

    if (typeof values.facilityId === "string") {
      nextFilters.facilityId = values.facilityId;
    }

    if (typeof values.status === "string") {
      nextFilters.status = values.status;
    }

    if (typeof values.connection === "string") {
      nextFilters.connection = values.connection;
    }

    if (typeof values.broadcast === "string") {
      nextFilters.broadcast = values.broadcast;
    }

    setFilters(nextFilters);
    setCurrentPage(1);
    setSelectedRowKeys([]);
  };

  // Thông báo cho chức năng chưa triển khai
  const handleAction = (action: string) => {
    message.info(`Chức năng ${action} sẽ được triển khai sau.`);
  };

  // Xóa các thiết bị được chọn
  const handleDeleteDevices = () => {
    if (selectedRowKeys.length === 0) {
      setDeleteOpen(false);
      return;
    }

    const selectedIds = selectedRowKeys.map(String);

    // Xóa thông qua DeviceContext
    deleteDevices(selectedIds);

    setSelectedRowKeys([]);
    setCurrentPage(1);
    setDeleteOpen(false);

    message.success("Xóa thiết bị thành công (mô phỏng)");
  };

  // Xác nhận khởi động lại thiết bị
  const handleRestartDevices = () => {
    if (selectedRowKeys.length === 0) {
      setRestartOpen(false);
      return;
    }

    // TODO: Gọi API khởi động lại thiết bị
    setRestartOpen(false);

    message.info("Đã xác nhận yêu cầu khởi động lại thiết bị (mô phỏng)");
  };

  // Xác nhận điều chỉnh âm lượng
  const handleVolumeConfirm = (nextVolume: number) => {
    if (selectedRowKeys.length === 0) return;

    // TODO: Gọi API cập nhật âm lượng thiết bị
    setVolume(nextVolume);
    setVolumeOpen(false);

    message.info(`Đã lưu mức âm lượng mô phỏng: ${nextVolume}%`);
  };

  // Cấu hình các cột bảng
  const columns: TableColumnsType<Device> = [
    {
      title: "Tên thiết bị",
      dataIndex: "name",
      key: "name",
      width: 150,
      ellipsis: true,
    },
    {
      title: "Mã định danh",
      dataIndex: "code",
      key: "code",
      width: 100,
    },
    {
      title: "Nhà cung cấp",
      dataIndex: "supplier",
      key: "supplier",
      width: 110,
      ellipsis: true,
    },
    {
      title: "Địa chỉ lắp đặt",
      dataIndex: "location",
      key: "location",
      width: 190,
      ellipsis: true,
    },
    {
      title: "Trạng thái hoạt động",
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (status: Device["status"]) => (
        <AppStatusTag
          variant={status === "active" ? "green" : "red"}
          label={status === "active" ? "Đang hoạt động" : "Ngưng hoạt động"}
        />
      ),
    },
    {
      title: "Trạng thái kết nối",
      dataIndex: "connection",
      key: "connection",
      width: 140,
      render: (connection: Device["connection"]) => (
        <AppStatusTag
          variant={connection === "online" ? "green" : "red"}
          label={connection === "online" ? "Đang kết nối" : "Mất kết nối"}
        />
      ),
    },
    {
      title: "Trạng thái phát bản tin",
      dataIndex: "broadcast",
      key: "broadcast",
      width: 155,
      render: (broadcast: Device["broadcast"]) => (
        <AppStatusTag
          variant={broadcast === "playing" ? "green" : "red"}
          label={
            broadcast === "playing" ? "Đang phát bản tin" : "Dừng phát bản tin"
          }
        />
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      width: 125,
      align: "center",
      render: (_, record) => (
        <AppTableActions
          actions={[
            {
              key: "edit",
              icon: <SquarePen />,
              tooltip: "Chỉnh sửa thiết bị",
              onClick: () => navigate(`${ROUTES.DEVICES}/${record.id}/edit`),
            },
            {
              key: "detail",
              icon: <Info />,
              tooltip: "Thông tin thiết bị",
              onClick: () => navigate(`${ROUTES.DEVICES}/${record.id}`),
            },
            {
              key: "control",
              icon: <Crosshair />,
              tooltip: "Điều khiển thiết bị",
              onClick: () => handleAction(`điều khiển ${record.name}`),
            },
          ]}
        />
      ),
    },
  ];

  // Thanh công cụ bên phải
  const panelActions = [
    {
      key: "add",
      icon: <Plus />,
      tooltip: "Thêm thiết bị",
      onClick: () => navigate(`${ROUTES.DEVICES}/create`),
    },
    {
      key: "delete",
      icon: <Trash2 />,
      tooltip: "Xóa thiết bị",
      disabled: selectedRowKeys.length === 0,
      onClick: () => setDeleteOpen(true),
    },
    {
      key: "restart",
      icon: <RefreshCw />,
      tooltip: "Khởi động lại thiết bị",
      disabled: selectedRowKeys.length === 0,
      onClick: () => setRestartOpen(true),
    },
    {
      key: "volume",
      icon: <Volume2 />,
      tooltip: "Điều chỉnh âm lượng",
      disabled: selectedRowKeys.length === 0,
      onClick: () => setVolumeOpen(true),
    },
  ];

  return (
    <div className="devices-page">
      <div className="devices-page-main">
        <h2 className="devices-page-title">
          Quản lý thiết bị phát bản tin điện tử
        </h2>

        {/* Bộ lọc và tìm kiếm */}
        <AppFilter
          form={form}
          className="devices-page-filters"
          onValuesChange={(_, values) => updateFilters(values)}>
          <AppFilterField width="100%">
            <Form.Item name="facilityId" noStyle>
              <AppSelect
                placeholder="Cơ sở"
                width="100%"
                allowClear
                options={facilityOptions}
              />
            </Form.Item>
          </AppFilterField>

          <AppFilterField width="100%">
            <Form.Item name="status" noStyle>
              <AppSelect
                placeholder="Trạng thái hoạt động"
                width="100%"
                allowClear
                options={[
                  {
                    label: "Đang hoạt động",
                    value: "active",
                  },
                  {
                    label: "Ngưng hoạt động",
                    value: "inactive",
                  },
                ]}
              />
            </Form.Item>
          </AppFilterField>

          <AppFilterField width="100%">
            <Form.Item name="connection" noStyle>
              <AppSelect
                placeholder="Trạng thái kết nối"
                width="100%"
                allowClear
                options={[
                  {
                    label: "Đang kết nối",
                    value: "online",
                  },
                  {
                    label: "Mất kết nối",
                    value: "offline",
                  },
                ]}
              />
            </Form.Item>
          </AppFilterField>

          <AppFilterField width="100%">
            <Form.Item name="broadcast" noStyle>
              <AppSelect
                placeholder="Trạng thái phát bản tin"
                width="100%"
                allowClear
                options={[
                  {
                    label: "Đang phát bản tin",
                    value: "playing",
                  },
                  {
                    label: "Dừng phát bản tin",
                    value: "stopped",
                  },
                ]}
              />
            </Form.Item>
          </AppFilterField>

          <AppFilterField width="100%">
            <AppSearch
              width="100%"
              placeholder="Tìm kiếm từ khóa"
              value={keyword}
              onChange={(value) => {
                setKeyword(value);
                setCurrentPage(1);
                setSelectedRowKeys([]);
              }}
            />
          </AppFilterField>
        </AppFilter>

        {/* Bảng danh sách thiết bị */}
        <AppTable<Device>
          className="devices-page-table"
          rowKey="id"
          columns={columns}
          dataSource={filteredDevices}
          tableLayout="fixed"
          selectable
          rowSelection={{
            selectedRowKeys,
            columnWidth: 48,
            onChange: (keys) => setSelectedRowKeys([...keys]),
          }}
          selectedLabel="thiết bị"
          pagination={{
            current: Math.min(
              currentPage,
              Math.max(1, Math.ceil(filteredDevices.length / PAGE_SIZE)),
            ),
            pageSize: PAGE_SIZE,
            total: filteredDevices.length,
            onChange: (page) => setCurrentPage(page),
          }}
        />
      </div>

      {/* Thanh thao tác bên phải */}
      <AppActionPanel className="devices-page-actions" actions={panelActions} />

      {/* Popup xác nhận xóa thiết bị */}
      <AppConfirmModal
        open={deleteOpen}
        type="delete"
        title="Xác nhận xóa thiết bị"
        description="Các thiết bị được chọn sẽ bị xóa khỏi danh sách."
        confirmText="Tiếp tục"
        cancelText="Hủy"
        onConfirm={handleDeleteDevices}
        onCancel={() => setDeleteOpen(false)}
      />

      {/* Popup xác nhận khởi động lại */}
      <AppConfirmModal
        open={restartOpen}
        type="restart"
        title="Xác nhận khởi động lại thiết bị"
        description="Các thiết bị được chọn sẽ được khởi động lại."
        confirmText="Tiếp tục"
        cancelText="Hủy"
        onConfirm={handleRestartDevices}
        onCancel={() => setRestartOpen(false)}
      />

      {/* Popup điều chỉnh âm lượng */}
      <DeviceVolumeModal
        open={volumeOpen}
        initialVolume={volume}
        onCancel={() => setVolumeOpen(false)}
        onConfirm={handleVolumeConfirm}
      />
    </div>
  );
}

export default DevicesPage;
