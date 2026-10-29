import React from 'react';
import { Drawer, List, Tag, Button, Typography } from 'antd';
import { Bell, Check, ExternalLink } from 'lucide-react';
import { useMtcData } from '../../context/MtcDataContext';
import { formatRelativeTime } from '../../utils/formatters';

const { Text, Paragraph } = Typography;

interface NotificationDrawerProps {
  open: boolean;
  onClose: () => void;
  onNavigateToModule?: (moduleKey: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  open,
  onClose,
  onNavigateToModule,
}) => {
  const { notifications, markNotificationAsRead } = useMtcData();

  return (
    <Drawer
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Bell size={18} color="#FF7506" />
          <span>Thông Báo Trong Ứng Dụng (SRS 6.1 - NTF)</span>
        </div>
      }
      placement="right"
      width={500}
      open={open}
      onClose={onClose}
    >
      <div style={{ marginBottom: 12, fontSize: 12, color: '#6B7280' }}>
        Danh sách thông báo nội bộ tự động kích hoạt theo 14 sự kiện nghiệp vụ quy định trong SRS.
      </div>

      <List
        itemLayout="horizontal"
        dataSource={notifications}
        renderItem={(item) => (
          <List.Item
            style={{
              padding: '12px 14px',
              background: item.isRead ? '#ffffff' : '#FFF7ED',
              borderRadius: 8,
              marginBottom: 10,
              border: `1px solid ${item.isRead ? '#F3F4F6' : '#FFEDD5'}`,
            }}
            actions={[
              !item.isRead && (
                <Button
                  size="small"
                  type="text"
                  icon={<Check size={14} color="#059669" />}
                  onClick={() => markNotificationAsRead(item.id)}
                >
                  Đã đọc
                </Button>
              ),
            ]}
          >
            <List.Item.Meta
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: '#1F2937' }}>
                    {item.title}
                  </span>
                  <Tag color="orange" style={{ fontSize: 10 }}>{item.code}</Tag>
                </div>
              }
              description={
                <div>
                  <Paragraph
                    style={{ fontSize: 12, color: '#4B5563', margin: '4px 0 6px 0', lineHeight: 1.4 }}
                  >
                    {item.content}
                  </Paragraph>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: '#9CA3AF' }}>
                      {formatRelativeTime(item.createdAt)}
                    </span>
                    {item.recipientRole && (
                      <Tag color="blue" style={{ fontSize: 10 }}>
                        Gửi tới: {item.recipientRole}
                      </Tag>
                    )}
                  </div>
                </div>
              }
            />
          </List.Item>
        )}
      />
    </Drawer>
  );
};
