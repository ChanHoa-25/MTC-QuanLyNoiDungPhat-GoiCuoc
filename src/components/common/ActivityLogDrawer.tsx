import React from 'react';
import { Drawer, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Activity } from 'lucide-react';
import { useMtcData } from '../../context/MtcDataContext';
import type { ActivityLog } from '../../types';
import { formatRelativeTime } from '../../utils/formatters';

const { Text } = Typography;

interface ActivityLogDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const ActivityLogDrawer: React.FC<ActivityLogDrawerProps> = ({ open, onClose }) => {
  const { activityLogs } = useMtcData();

  const columns: ColumnsType<ActivityLog> = [
    {
      title: 'Thời gian',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (ts: string) => (
        <span style={{ fontSize: 12, color: '#6B7280' }}>
          {formatRelativeTime(ts)}
        </span>
      ),
      width: 130,
    },
    {
      title: 'Người thực hiện',
      key: 'actor',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{record.actorName}</div>
          <Tag color="orange" style={{ fontSize: 10 }}>{record.actorRole}</Tag>
        </div>
      ),
      width: 180,
    },
    {
      title: 'Nhóm',
      dataIndex: 'group',
      key: 'group',
      render: (grp: string) => <Tag color="blue">{grp}</Tag>,
      width: 110,
    },
    {
      title: 'Hành động & Đối tượng',
      key: 'action',
      render: (_, record) => (
        <div>
          <Text strong>{record.action}</Text>: <Text code>{record.identifier}</Text>
          {(record.oldValue || record.newValue) && (
            <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>
              {record.oldValue && <span>Cũ: {record.oldValue} → </span>}
              {record.newValue && <span style={{ color: '#059669', fontWeight: 600 }}>Mới: {record.newValue}</span>}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Cơ sở',
      dataIndex: 'facilityName',
      key: 'facilityName',
      width: 160,
      render: (f: string) => <span style={{ fontSize: 12 }}>{f}</span>,
    },
  ];

  return (
    <Drawer
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Activity size={18} color="#4F46E5" />
          <span>Nhật Ký Hoạt Động Hệ Thống (SRS 6.3 - LOG)</span>
        </div>
      }
      placement="right"
      width={780}
      open={open}
      onClose={onClose}
    >
      <div style={{ marginBottom: 12, fontSize: 12, color: '#6B7280' }}>
        Quy ước ghi log theo SRS: Thêm mới ghi tất cả thông tin; Cập nhật ghi trường định danh kèm giá trị cũ và mới; Xóa ghi trường định danh.
      </div>
      <Table
        dataSource={activityLogs}
        columns={columns}
        rowKey="id"
        size="small"
        pagination={{ pageSize: 12 }}
      />
    </Drawer>
  );
};
