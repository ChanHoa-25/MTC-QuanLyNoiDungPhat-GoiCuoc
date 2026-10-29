import React, { useState } from 'react';
import {
  Table,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Typography,
  message,
  Tabs,
  Card,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Package, Plus, Trash2, Edit, History, AlertCircle } from 'lucide-react';
import { useMtcData } from '../../context/MtcDataContext';
import type { ServicePackage, PackageTransaction } from '../../types';
import { formatVND, formatDate } from '../../utils/formatters';

const { Title, Text } = Typography;

export const PackageManagerView: React.FC = () => {
  const { packages, transactions, addServicePackage, updateServicePackage, deleteServicePackage } =
    useMtcData();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleStatusChange = (pkgId: string, newStatus: ServicePackage['status']) => {
    updateServicePackage(pkgId, { status: newStatus });
    message.success('Cập nhật trạng thái kinh doanh thành công!');
  };

  const handleDelete = (pkg: ServicePackage) => {
    const res = deleteServicePackage(pkg.id);
    if (res.success) {
      message.success(res.message);
    } else {
      message.error(res.message);
    }
  };

  const packageColumns: ColumnsType<ServicePackage> = [
    {
      title: 'Tên gói cước',
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
      title: 'Dung lượng',
      dataIndex: 'storageGB',
      key: 'storageGB',
      render: (gb: number) => <Tag color="blue" style={{ fontWeight: 700 }}>{gb} GB</Tag>,
      width: 120,
    },
    {
      title: 'Thời hạn',
      dataIndex: 'durationMonths',
      key: 'durationMonths',
      render: (m: number) => (
        <span>{m === 12 ? '1 năm' : `${m} tháng`}</span>
      ),
      width: 120,
    },
    {
      title: 'Giá gói',
      dataIndex: 'priceVND',
      key: 'priceVND',
      render: (price: number) => (
        <span style={{ fontWeight: 700, color: '#FF7506' }}>
          {price === 0 ? 'Miễn phí' : formatVND(price)}
        </span>
      ),
      width: 140,
    },
    {
      title: 'Trạng thái kinh doanh (SYS-PKG-01)',
      dataIndex: 'status',
      key: 'status',
      render: (status: ServicePackage['status'], record) => {
        const statusMap = {
          active: { text: 'Đang kinh doanh', color: 'success' },
          upcoming: { text: 'Chưa kinh doanh', color: 'processing' },
          ended: { text: 'Đã kết thúc', color: 'default' },
          suspended: { text: 'Ngưng kinh doanh', color: 'warning' },
        };
        const cur = statusMap[status];
        return (
          <Select
            value={status}
            size="small"
            style={{ width: 155 }}
            onChange={(val) => handleStatusChange(record.id, val)}
          >
            <Select.Option value="active">Đang kinh doanh</Select.Option>
            <Select.Option value="upcoming">Chưa kinh doanh</Select.Option>
            <Select.Option value="suspended">Ngưng kinh doanh</Select.Option>
            <Select.Option value="ended">Đã kết thúc</Select.Option>
          </Select>
        );
      },
      width: 180,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            type="text"
            danger
            icon={<Trash2 size={14} />}
            onClick={() => handleDelete(record)}
          />
        </Space>
      ),
      width: 80,
    },
  ];

  const transactionColumns: ColumnsType<PackageTransaction> = [
    {
      title: 'Mã GD',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => <Text code>{id}</Text>,
      width: 120,
    },
    {
      title: 'Tổ chức',
      dataIndex: 'orgName',
      key: 'orgName',
      render: (t: string) => <Text strong>{t}</Text>,
    },
    {
      title: 'Gói cước',
      dataIndex: 'packageName',
      key: 'packageName',
    },
    {
      title: 'Số tiền thanh toán',
      dataIndex: 'amountVND',
      key: 'amountVND',
      render: (val: number) => <span style={{ fontWeight: 700, color: '#059669' }}>{formatVND(val)}</span>,
      width: 160,
    },
    {
      title: 'Loại GD',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const labels: Record<string, string> = {
          buy: 'Mua mới',
          renew: 'Gia hạn',
          upgrade: 'Nâng cấp',
          switch: 'Đổi gói cước',
        };
        return <Tag color="blue">{labels[type] || type}</Tag>;
      },
      width: 120,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (st: string) => <Tag color="success">Thành công</Tag>,
      width: 120,
    },
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (d: string) => formatDate(d),
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
            Quản Lý Gói Cước (SYS-PKG)
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Thiết lập gói cước bán sẵn theo dung lượng, thời hạn (1 tháng, 6 tháng, 1 năm) và theo dõi lịch sử thanh toán
          </Text>
        </div>

        <Button
          type="primary"
          icon={<Plus size={16} />}
          style={{ background: '#FF7506', borderColor: '#FF7506' }}
          onClick={() => setIsAddModalOpen(true)}
        >
          Thêm gói cước mới
        </Button>
      </div>

      <Tabs
        defaultActiveKey="packages"
        items={[
          {
            key: 'packages',
            label: 'Danh sách Gói Cước Bán Sẵn (SYS-PKG-01)',
            children: (
              <Table
                dataSource={packages}
                columns={packageColumns}
                rowKey="id"
                pagination={false}
                style={{
                  background: '#ffffff',
                  borderRadius: 12,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}
              />
            ),
          },
          {
            key: 'transactions',
            label: (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <History size={15} /> Lịch Sử Thanh Toán Gói Cước (SYS-PKG-06)
              </span>
            ),
            children: (
              <Table
                dataSource={transactions}
                columns={transactionColumns}
                rowKey="id"
                pagination={{ pageSize: 8 }}
                style={{
                  background: '#ffffff',
                  borderRadius: 12,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}
              />
            ),
          },
        ]}
      />

      {/* Modal Thêm Gói Cước Mới (SYS-PKG-03) */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Package size={18} color="#FF7506" />
            <span>Thêm Gói Cước Mới (SYS-PKG-03)</span>
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
            // SRS SYS-PKG-03: Không trùng số dung lượng
            const exists = packages.some((p) => p.storageGB === Number(values.storageGB));
            if (exists) {
              message.error(`Đã tồn tại gói cước có dung lượng ${values.storageGB} GB (Quy tắc SYS-PKG-03).`);
              return;
            }

            addServicePackage({
              name: values.name,
              storageGB: Number(values.storageGB),
              durationMonths: Number(values.durationMonths),
              priceVND: Number(values.priceVND),
              status: 'active',
              startDate: '2026-01-01',
              endDate: '2026-12-31',
              description: values.description || '',
            });
            message.success('Thêm gói cước thành công!');
            setIsAddModalOpen(false);
            form.resetFields();
          }}
        >
          <Form.Item
            name="name"
            label="Tên gói cước"
            rules={[{ required: true, message: 'Vui lòng nhập tên gói' }]}
          >
            <Input placeholder="Ví dụ: Gói Mở Rộng 50GB / 1 Năm" />
          </Form.Item>

          <Form.Item
            name="storageGB"
            label="Dung lượng (GB) — Không trùng số dung lượng"
            rules={[{ required: true, message: 'Vui lòng nhập dung lượng' }]}
          >
            <Input type="number" placeholder="50" min={1} />
          </Form.Item>

          <Form.Item
            name="durationMonths"
            label="Thời hạn áp dụng (SRS quy định: 1 tháng, 6 tháng, 1 năm)"
            rules={[{ required: true, message: 'Vui lòng chọn thời hạn' }]}
          >
            <Select placeholder="Chọn thời hạn">
              <Select.Option value="1">1 Tháng</Select.Option>
              <Select.Option value="6">6 Tháng</Select.Option>
              <Select.Option value="12">1 Năm (12 Tháng)</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="priceVND"
            label="Giá bán (VNĐ)"
            rules={[{ required: true, message: 'Nhập giá bán' }]}
          >
            <Input type="number" placeholder="1500000" min={0} />
          </Form.Item>

          <Form.Item name="description" label="Mô tả gói cước">
            <Input.TextArea rows={3} placeholder="Mô tả tính năng gói..." />
          </Form.Item>

          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsAddModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" style={{ background: '#FF7506', borderColor: '#FF7506' }}>
                Lưu gói cước
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};
