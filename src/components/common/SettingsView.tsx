import React from 'react';
import { Card, Descriptions, Tag, Typography, List, Form, Input, Button, message } from 'antd';
import { Settings, Shield, Building, Radio } from 'lucide-react';
import { DEFAULT_FIELDS, DEFAULT_SUPPLIER } from '../../data/mockData';

const { Title, Text } = Typography;

interface SettingsViewProps {
  portal: 'system' | 'enduser';
}

export const SettingsView: React.FC<SettingsViewProps> = ({ portal }) => {
  return (
    <div style={{ padding: '24px 28px' }}>
      <div style={{ marginBottom: 20 }}>
        <Title level={3} style={{ margin: 0, fontWeight: 800 }}>
          {portal === 'system' ? 'Cài Đặt Hệ Thống (SYS-SET)' : 'Cài Đặt Tổ Chức & Cơ Sở (USR-SET)'}
        </Title>
        <Text type="secondary" style={{ fontSize: 13 }}>
          Danh mục nhà cung cấp mặc định, cấu hình 11 lĩnh vực phát sóng và thiết lập chung theo SRS mục 2.4 & 4.6
        </Text>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Nhà cung cấp mặc định */}
        <Card
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Building size={18} color="#FF7506" />
              <span style={{ fontWeight: 700 }}>Nhà Cung Cấp Mặc Định (SRS 2.4)</span>
            </div>
          }
          bordered={false}
          style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
        >
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="Mã nhà cung cấp">
              <Tag color="orange" style={{ fontWeight: 700 }}>{DEFAULT_SUPPLIER.code}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Tên nhà cung cấp">
              <Text strong>{DEFAULT_SUPPLIER.name}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Loại hợp tác">
              <span>Đơn vị cung cấp thiết bị và hạ tầng cloud phát sóng</span>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color="success">Đang hoạt động</Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* 11 Lĩnh vực hoạt động */}
        <Card
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Radio size={18} color="#2563EB" />
              <span style={{ fontWeight: 700 }}>Danh Mục 11 Lĩnh Vực Phát Sóng (SRS 2.4)</span>
            </div>
          }
          bordered={false}
          style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {DEFAULT_FIELDS.map((field, idx) => (
              <Tag
                key={idx}
                color="blue"
                style={{ padding: '6px 12px', fontSize: 13, borderRadius: 6 }}
              >
                {idx + 1}. {field}
              </Tag>
            ))}
          </div>
        </Card>

        {/* Thiết lập áp dụng cấp cao nhất */}
        <Card
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Shield size={18} color="#10B981" />
              <span style={{ fontWeight: 700 }}>Thiết Lập Áp Dụng Cấp Tổ Chức (SRS 4.6)</span>
            </div>
          }
          bordered={false}
          style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
        >
          <Text style={{ fontSize: 13, color: '#4B5563', display: 'block', marginBottom: 16 }}>
            "Chỉ cấp tổ chức (cao nhất) có chức năng này; khi thay đổi thì áp dụng cho toàn bộ tổ chức." (SRS 4.6)
          </Text>

          <Form layout="vertical" onFinish={() => message.success('Đã lưu thiết lập chung của tổ chức.')}>
            <Form.Item label="Thời gian chờ tín hiệu thiết bị trước khi báo mất kết nối">
              <Input defaultValue="15 phút" style={{ maxWidth: 300 }} />
            </Form.Item>
            <Form.Item label="Chế độ kiểm tra xung đột trùng lịch mặc định">
              <Input defaultValue="Theo thiết bị & theo cơ sở (Khuyến nghị)" style={{ maxWidth: 300 }} disabled />
            </Form.Item>
            <Button type="primary" htmlType="submit" style={{ background: '#FF7506', borderColor: '#FF7506' }}>
              Lưu cấu hình tổ chức
            </Button>
          </Form>
        </Card>
      </div>
    </div>
  );
};
