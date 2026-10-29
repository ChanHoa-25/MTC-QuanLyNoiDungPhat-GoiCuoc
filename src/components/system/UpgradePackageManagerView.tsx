import React, { useState } from 'react';
import {
  Table,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Layers, Plus, ShoppingBag } from 'lucide-react';
import { useMtcData } from '../../context/MtcDataContext';
import type { UpgradePackage } from '../../types';
import { formatVND } from '../../utils/formatters';

const { Title, Text } = Typography;

export const UpgradePackageManagerView: React.FC = () => {
  const { upgradePackages, addUpgradePackage } = useMtcData();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [form] = Form.useForm();

  const columns: ColumnsType<UpgradePackage> = [
    {
      title: 'Tên gói nâng cấp (SYS-UPG-01)',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record) => (
        <div>
          <Text strong style={{ fontSize: 14 }}>{name}</Text>
          <div style={{ fontSize: 12, color: '#6B7280' }}>{record.description}</div>
        </div>
      ),
    },
    {
      title: 'Dung lượng bổ sung',
      dataIndex: 'extraStorageGB',
      key: 'extraStorageGB',
      render: (gb: number) => <Tag color="blue" style={{ fontWeight: 700 }}>+{gb} GB</Tag>,
      width: 160,
    },
    {
      title: 'Số thiết bị thêm',
      dataIndex: 'extraDevices',
      key: 'extraDevices',
      render: (dev: number) => <Tag color="purple" style={{ fontWeight: 700 }}>+{dev} Thiết bị</Tag>,
      width: 150,
    },
    {
      title: 'Giá gói',
      dataIndex: 'priceVND',
      key: 'priceVND',
      render: (price: number) => (
        <span style={{ fontWeight: 700, color: '#FF7506' }}>{formatVND(price)}</span>
      ),
      width: 140,
    },
    {
      title: 'Số lượt đã mua (SRS SYS-UPG-01)',
      dataIndex: 'purchasedCount',
      key: 'purchasedCount',
      render: (count: number) => <Tag color="green">{count} lượt</Tag>,
      width: 150,
    },
    {
      title: 'Trạng thái mở bán',
      dataIndex: 'status',
      key: 'status',
      render: (st: string) => (
        <Tag color={st === 'selling' ? 'success' : 'default'}>
          {st === 'selling' ? 'Đang mở bán' : 'Đã đóng'}
        </Tag>
      ),
      width: 130,
    },
  ];

  return (
    <div style={{ padding: '24px 28px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        <div>
          <Title level={3} style={{ margin: 0, fontWeight: 800 }}>
            Quản Lý Gói Nâng Cấp (SYS-UPG)
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Thiết lập gói bổ sung dung lượng và thiết bị, theo dõi lượt mua của khách hàng theo SRS mục 3.5
          </Text>
        </div>

        <Button
          type="primary"
          icon={<Plus size={16} />}
          style={{ background: '#FF7506', borderColor: '#FF7506' }}
          onClick={() => setIsAddModalOpen(true)}
        >
          Tạo gói nâng cấp mới
        </Button>
      </div>

      <Table
        dataSource={upgradePackages}
        columns={columns}
        rowKey="id"
        pagination={false}
        style={{
          background: '#ffffff',
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      />

      {/* Modal Tạo Gói Nâng Cấp (SYS-UPG-02) */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Layers size={18} color="#FF7506" />
            <span>Tạo Gói Nâng Cấp Mới (SYS-UPG-02)</span>
          </div>
        }
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        footer={null}
        width={550}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            addUpgradePackage({
              name: values.name,
              extraStorageGB: Number(values.extraStorageGB),
              extraDevices: Number(values.extraDevices),
              durationMonths: 1,
              priceVND: Number(values.priceVND),
              status: 'selling',
              startDate: '2026-01-01',
              endDate: '2026-12-31',
              description: values.description || '',
            });
            message.success('Tạo gói nâng cấp thành công!');
            setIsAddModalOpen(false);
            form.resetFields();
          }}
        >
          <Form.Item
            name="name"
            label="Tên gói nâng cấp"
            rules={[{ required: true, message: 'Nhập tên gói' }]}
          >
            <Input placeholder="Ví dụ: Gói Bổ Sung +25GB & 10 Thiết Bị" />
          </Form.Item>

          <Form.Item
            name="extraStorageGB"
            label="Dung lượng bổ sung thêm (GB)"
            rules={[{ required: true, message: 'Nhập dung lượng' }]}
          >
            <Input type="number" placeholder="25" min={1} />
          </Form.Item>

          <Form.Item
            name="extraDevices"
            label="Số lượng thiết bị bổ sung thêm"
            rules={[{ required: true, message: 'Nhập số thiết bị' }]}
          >
            <Input type="number" placeholder="10" min={1} />
          </Form.Item>

          <Form.Item
            name="priceVND"
            label="Giá bán (VNĐ)"
            rules={[{ required: true, message: 'Nhập giá bán' }]}
          >
            <Input type="number" placeholder="500000" min={0} />
          </Form.Item>

          <Form.Item name="description" label="Mô tả gói">
            <Input.TextArea rows={3} placeholder="Mô tả chi tiết quyền lợi..." />
          </Form.Item>

          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsAddModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" style={{ background: '#FF7506', borderColor: '#FF7506' }}>
                Lưu gói nâng cấp
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};
