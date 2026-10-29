import React, { useState } from 'react';
import { Modal, Table, Tag, Typography, Card, Button, Badge } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { AlertTriangle, Monitor, RotateCcw } from 'lucide-react';
import { useMtcData } from '../../context/MtcDataContext';
import type { DeviceErrorDefinition } from '../../types';

const { Text, Paragraph } = Typography;

interface DeviceErrorModalProps {
  open: boolean;
  onClose: () => void;
}

export const DeviceErrorModal: React.FC<DeviceErrorModalProps> = ({ open, onClose }) => {
  const { errorDefinitions } = useMtcData();
  const [selectedError, setSelectedError] = useState<DeviceErrorDefinition | null>(
    errorDefinitions[0]
  );

  const columns: ColumnsType<DeviceErrorDefinition> = [
    {
      title: 'Mã lỗi (ERR)',
      dataIndex: 'code',
      key: 'code',
      render: (code: string) => <Tag color="red" style={{ fontWeight: 700 }}>{code}</Tag>,
      width: 170,
    },
    {
      title: 'Loại lỗi',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => <Text strong>{type}</Text>,
      width: 140,
    },
    {
      title: 'Tiêu đề hiển thị trên thiết bị',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Điều kiện phát sinh (Test case)',
      dataIndex: 'condition',
      key: 'condition',
      render: (cond: string) => <Text style={{ color: '#4B5563', fontSize: 12 }}>{cond}</Text>,
    },
    {
      title: 'Mô phỏng',
      key: 'action',
      render: (_, record) => (
        <Button
          size="small"
          type={selectedError?.code === record.code ? 'primary' : 'default'}
          onClick={() => setSelectedError(record)}
        >
          Xem màn hình
        </Button>
      ),
      width: 120,
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={900}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              padding: 6,
              borderRadius: 8,
              background: '#FEF3C7',
              color: '#D97706',
              display: 'flex',
            }}
          >
            <AlertTriangle size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>
              Mã Lỗi Trên Thiết Bị Phát & Quản Lý Sự Cố (SRS Mục 7.1)
            </div>
            <div style={{ fontSize: 12, color: '#6B7280', fontWeight: 400 }}>
              Bảng quy chuẩn thông điệp hiển thị và tiêu chí kiểm thử điều kiện lỗi
            </div>
          </div>
        </div>
      }
    >
      <div style={{ marginTop: 12 }}>
        {/* Device screen simulation box */}
        {selectedError && (
          <Card
            size="small"
            style={{
              background: '#0F172A',
              color: '#ffffff',
              borderRadius: 12,
              marginBottom: 18,
              border: '2px solid #334155',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1E293B', paddingBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Monitor size={16} color="#38BDF8" />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8' }}>
                  Mô phỏng màn hình thiết bị phát MTC
                </span>
              </div>
              <Tag color="error">{selectedError.code}</Tag>
            </div>

            <div style={{ padding: '24px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>⚠️</div>
              <h3 style={{ color: '#F87171', fontSize: 18, margin: '0 0 8px 0', fontWeight: 700 }}>
                {selectedError.title}
              </h3>
              <p style={{ color: '#94A3B8', fontSize: 13, maxWidth: 500, margin: '0 auto 16px auto' }}>
                Hệ thống đang tự động thử kết nối lại hoặc đồng bộ bộ nhớ đệm. Mã kiểm thử: <code>{selectedError.code}</code>.
              </p>
              <div style={{ fontSize: 11, color: '#64748B' }}>
                Điều kiện phát sinh: {selectedError.condition}
              </div>
            </div>
          </Card>
        )}

        <Table
          dataSource={errorDefinitions}
          columns={columns}
          rowKey="code"
          pagination={false}
          size="small"
        />
      </div>
    </Modal>
  );
};
