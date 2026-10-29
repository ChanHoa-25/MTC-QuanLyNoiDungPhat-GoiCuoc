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
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { BellRing, Plus, Trash2 } from 'lucide-react';
import { useMtcData } from '../../context/MtcDataContext';
import type { SystemNotification } from '../../types';
import { formatRelativeTime } from '../../utils/formatters';

const { Title, Text, Paragraph } = Typography;

export const SystemNotificationView: React.FC = () => {
  const { notifications, organizations, addNotification } = useMtcData();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [form] = Form.useForm();

  const columns: ColumnsType<SystemNotification> = [
    {
      title: 'Mã sự kiện',
      dataIndex: 'code',
      key: 'code',
      render: (c: string) => <Tag color="orange" style={{ fontWeight: 700 }}>{c}</Tag>,
      width: 110,
    },
    {
      title: 'Tiêu đề thông báo (Tối đa 255 ký tự)',
      dataIndex: 'title',
      key: 'title',
      render: (t: string) => <Text strong style={{ fontSize: 13 }}>{t}</Text>,
      width: 250,
    },
    {
      title: 'Nội dung thông điệp (Tối đa 510 ký tự)',
      dataIndex: 'content',
      key: 'content',
      render: (c: string) => <Paragraph style={{ margin: 0, fontSize: 12, color: '#4B5563' }}>{c}</Paragraph>,
    },
    {
      title: 'Thời gian phát',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (d: string) => <span style={{ fontSize: 11, color: '#6B7280' }}>{formatRelativeTime(d)}</span>,
      width: 140,
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
            Thông Báo Hệ Thống (SYS-NTF)
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Gửi thông báo và cảnh báo diện rộng tới người đứng đầu các tổ chức (Quy tắc tiêu đề ≤ 255 ký tự, nội dung ≤ 510 ký tự)
          </Text>
        </div>

        <Button
          type="primary"
          icon={<Plus size={16} />}
          style={{ background: '#FF7506', borderColor: '#FF7506' }}
          onClick={() => setIsAddModalOpen(true)}
        >
          Gửi thông báo mới
        </Button>
      </div>

      <Table
        dataSource={notifications}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 8 }}
        style={{
          background: '#ffffff',
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      />

      {/* Modal Thêm Thông Báo (SYS-NTF-02) */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BellRing size={18} color="#FF7506" />
            <span>Gửi Thông Báo Hệ Thống (SYS-NTF-02)</span>
          </div>
        }
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            targetOrg: 'all',
          }}
          onFinish={(values) => {
            addNotification({
              code: 'SYS-BROADCAST',
              title: values.title,
              content: values.content,
              recipientRole: 'Administrator',
            });
            message.success('Đã gửi thông báo thành công tới các tổ chức.');
            setIsAddModalOpen(false);
            form.resetFields();
          }}
        >
          <Form.Item
            name="targetOrg"
            label="Gửi tới tổ chức mục tiêu (Người đứng đầu tổ chức):"
          >
            <Select>
              <Select.Option value="all">Toàn bộ tổ chức trên nền tảng</Select.Option>
              {organizations.map((o) => (
                <Select.Option key={o.id} value={o.id}>
                  {o.name} ({o.orgCode})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="title"
            label="Tiêu đề thông báo (Tối đa 255 ký tự)"
            rules={[{ required: true, message: 'Nhập tiêu đề thông báo' }]}
          >
            <Input maxLength={255} showCount placeholder="Thông báo nâng cấp hệ thống định kỳ..." />
          </Form.Item>

          <Form.Item
            name="content"
            label="Nội dung thông báo (Tối đa 510 ký tự)"
            rules={[{ required: true, message: 'Nhập nội dung thông báo' }]}
          >
            <Input.TextArea
              rows={4}
              maxLength={510}
              showCount
              placeholder="Chi tiết thông báo bảo trì, lịch cập nhật..."
            />
          </Form.Item>

          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsAddModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" style={{ background: '#FF7506', borderColor: '#FF7506' }}>
                Phát thông báo
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};
