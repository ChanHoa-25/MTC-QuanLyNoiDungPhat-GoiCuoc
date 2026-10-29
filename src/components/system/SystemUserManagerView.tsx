import React, { useState } from 'react';
import {
  Table,
  Button,
  Tag,
  Space,
  Tabs,
  Typography,
  Modal,
  Form,
  Input,
  Select,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Users, Plus, Trash2, Edit } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { User, RoleType } from '../../types';

const { Title, Text } = Typography;

export const SystemUserManagerView: React.FC = () => {
  const { allUsers, currentUser } = useAuth();
  const [delegatedTab, setDelegatedTab] = useState<'all' | 'delegated' | 'non-delegated'>('all');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [form] = Form.useForm();

  // Xem theo 2 dạng: đã phân quyền và chưa phân quyền (SRS SYS-USR-01)
  const filteredUsers = allUsers.filter((u) => {
    if (delegatedTab === 'delegated') return u.isDelegated;
    if (delegatedTab === 'non-delegated') return !u.isDelegated;
    return true;
  });

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
    });
    setIsEditModalOpen(true);
  };

  const columns: ColumnsType<User> = [
    {
      title: 'Tên đăng nhập (SYS-USR-03)',
      dataIndex: 'username',
      key: 'username',
      render: (u: string) => <Tag color="blue">{u}</Tag>,
      width: 170,
    },
    {
      title: 'Tên người dùng',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: 'Số điện thoại & Email',
      key: 'contact',
      render: (_, record) => (
        <div style={{ fontSize: 12 }}>
          <div>{record.phone}</div>
          <div style={{ color: '#6B7280' }}>{record.email}</div>
        </div>
      ),
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (r: RoleType) => <Tag color="orange">{r}</Tag>,
      width: 140,
    },
    {
      title: 'Phân quyền',
      dataIndex: 'isDelegated',
      key: 'isDelegated',
      render: (del: boolean) => (
        <Tag color={del ? 'green' : 'default'}>
          {del ? 'Đã phân quyền' : 'Chưa phân quyền'}
        </Tag>
      ),
      width: 150,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (st: string) => (
        <Tag color={st === 'active' ? 'success' : 'error'}>
          {st === 'active' ? 'Hoạt động' : 'Khóa'}
        </Tag>
      ),
      width: 120,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<Edit size={13} />}
            onClick={() => handleOpenEdit(record)}
          />
          <Button
            size="small"
            type="text"
            danger
            icon={<Trash2 size={13} />}
            onClick={() => message.success(`Đã xóa người dùng ${record.username} (SYS-USR-04)`)}
          />
        </Space>
      ),
      width: 110,
    },
  ];

  return (
    <div style={{ padding: '24px 28px' }}>
      <div style={{ marginBottom: 20 }}>
        <Title level={3} style={{ margin: 0, fontWeight: 800 }}>
          Quản Lý Người Dùng Hệ Thống (SYS-USR)
        </Title>
        <Text type="secondary" style={{ fontSize: 13 }}>
          Xem danh sách người dùng theo dạng Đã phân quyền và Chưa phân quyền (SRS SYS-USR-01)
        </Text>
      </div>

      <Tabs
        activeKey={delegatedTab}
        onChange={(k) => setDelegatedTab(k as any)}
        items={[
          { key: 'all', label: `Tất cả tài khoản (${allUsers.length})` },
          {
            key: 'delegated',
            label: `Đã phân quyền (${allUsers.filter((u) => u.isDelegated).length})`,
          },
          {
            key: 'non-delegated',
            label: `Chưa phân quyền (${allUsers.filter((u) => !u.isDelegated).length})`,
          },
        ]}
      />

      <Table
        dataSource={filteredUsers}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 8 }}
        style={{
          background: '#ffffff',
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      />

      {/* Modal Sửa Người Dùng (SYS-USR-03: Không được sửa tên đăng nhập) */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={18} color="#FF7506" />
            <span>Chỉnh Sửa Người Dùng (SYS-USR-03)</span>
          </div>
        }
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={null}
      >
        {editingUser && (
          <Form
            form={form}
            layout="vertical"
            onFinish={(values) => {
              message.success('Cập nhật thông tin người dùng thành công!');
              setIsEditModalOpen(false);
            }}
          >
            <Form.Item label="Tên đăng nhập (Không được sửa theo SRS SYS-USR-03)">
              <Input value={editingUser.username} disabled />
            </Form.Item>

            <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true }]}>
              <Input />
            </Form.Item>

            <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true }]}>
              <Input />
            </Form.Item>

            <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
              <Input />
            </Form.Item>

            <Form.Item name="role" label="Vai trò">
              <Select>
                <Select.Option value="Administrator">Administrator</Select.Option>
                <Select.Option value="Creator">Creator</Select.Option>
                <Select.Option value="IT">IT</Select.Option>
                <Select.Option value="Approver">Approver</Select.Option>
                <Select.Option value="SystemAdmin">SystemAdmin</Select.Option>
              </Select>
            </Form.Item>

            <div style={{ textAlign: 'right' }}>
              <Space>
                <Button onClick={() => setIsEditModalOpen(false)}>Hủy</Button>
                <Button type="primary" htmlType="submit" style={{ background: '#FF7506', borderColor: '#FF7506' }}>
                  Lưu thay đổi
                </Button>
              </Space>
            </div>
          </Form>
        )}
      </Modal>
    </div>
  );
};
