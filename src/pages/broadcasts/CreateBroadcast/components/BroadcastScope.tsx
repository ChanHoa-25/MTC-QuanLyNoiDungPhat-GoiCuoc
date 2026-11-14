import { useMemo } from "react";
import type { Key } from "react";
import { message } from "antd";
import type { TableColumnsType } from "antd";
import { Info, SquarePen } from "lucide-react";

import AppSearch from "../../../../components/common/AppSearch";
import AppTable from "../../../../components/common/AppTable";
import AppTableActions from "../../../../components/common/AppTableActions";
import AppIconButton from "../../../../components/common/AppIconButton";

import { broadcastDevicesMock } from "../../data/createBroadcast.mock";

import type { BroadcastDevice } from "../../data/createBroadcast.mock";

interface BroadcastScopeProps {
  deviceIds: Key[];
  onDeviceIdsChange: (values: Key[]) => void;

  deviceKeyword: string;
  onDeviceKeywordChange: (value: string) => void;

  onOpenDeviceModal: () => void;
}

function BroadcastScope({
  deviceIds,
  onDeviceIdsChange,
  deviceKeyword,
  onDeviceKeywordChange,
  onOpenDeviceModal,
}: BroadcastScopeProps) {
  // Lọc thiết bị theo từ khóa tìm kiếm
  const filteredDevices = useMemo(() => {
    const keyword = deviceKeyword.trim().toLowerCase();

    if (!keyword) {
      return broadcastDevicesMock;
    }

    return broadcastDevicesMock.filter((item) =>
      [item.name, item.facility, item.address]
        .join(" ")
        .toLowerCase()
        .includes(keyword),
    );
  }, [deviceKeyword]);

  // Cấu hình các cột trong bảng thiết bị
  const deviceColumns: TableColumnsType<BroadcastDevice> = [
    {
      title: "STT",
      key: "index",
      width: 50,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Thiết bị",
      dataIndex: "name",
      key: "name",
      width: 110,
    },
    {
      title: "Cơ sở lắp đặt",
      dataIndex: "facility",
      key: "facility",
      width: 120,
    },
    {
      title: "Địa chỉ lắp đặt",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "",
      key: "actions",
      width: 50,
      render: (_, record) => (
        <AppTableActions
          actions={[
            {
              key: "info",
              icon: <Info />,
              tooltip: "Thông tin thiết bị",
              onClick: () => message.info(record.name),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <section className="create-broadcast__section">
      <h2>4. Phạm vi phát</h2>

      {/* Tìm kiếm và mở popup chọn thiết bị */}
      <div className="create-broadcast__device-search">
        <AppSearch
          width="100%"
          value={deviceKeyword}
          placeholder="Nhập tên nguồn thông tin"
          onChange={onDeviceKeywordChange}
          onSearch={onDeviceKeywordChange}
          allowClear
        />

        <AppIconButton
          icon={<SquarePen size={20} />}
          tooltip="Chọn thiết bị phát"
          size={44}
          iconSize={20}
          className="create-broadcast__outline-icon"
          onClick={onOpenDeviceModal}
        />
      </div>

      {/* Bảng danh sách thiết bị */}
      <div className="create-broadcast__table-wrap">
        <AppTable<BroadcastDevice>
          rowKey="id"
          className="create-broadcast__device-table"
          columns={deviceColumns}
          dataSource={filteredDevices}
          pagination={false}
          size="small"
          scroll={{ x: 650 }}
          selectable
          showSelectedCount={false}
          rowSelection={{
            selectedRowKeys: deviceIds,
            preserveSelectedRowKeys: true,
            onChange: (keys) => onDeviceIdsChange([...keys]),
          }}
        />
      </div>

      {/* Số lượng thiết bị đã chọn */}
      <div className="create-broadcast__selection-count">
        Đã chọn {deviceIds.length} thiết bị
      </div>
    </section>
  );
}

export default BroadcastScope;
