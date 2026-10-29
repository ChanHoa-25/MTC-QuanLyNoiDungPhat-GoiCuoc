import React from 'react';
import { Card, Row, Col, Progress, Typography, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { BarChart3, PieChart as PieIcon, Tv, CheckCircle2 } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
} from 'recharts';
import { useMtcData } from '../../context/MtcDataContext';
import { useAuth } from '../../context/AuthContext';
import { formatStorage } from '../../utils/formatters';

const { Title, Text } = Typography;

export const EndUserReportsView: React.FC = () => {
  const { facilities, devices, mediaList, broadcasts } = useMtcData();
  const { currentUser } = useAuth();

  const orgFacilities = facilities.filter((f) => f.orgId === currentUser.orgId);
  const facilityIds = orgFacilities.map((f) => f.id);
  const orgDevices = devices.filter((d) => facilityIds.includes(d.facilityId));
  const orgBroadcasts = broadcasts.filter((b) => b.orgId === currentUser.orgId);

  // Biểu đồ trạng thái thiết bị (đang kết nối, mất kết nối, ngưng hoạt động)
  const deviceStatusData = [
    {
      name: 'Đang kết nối (Online)',
      value: orgDevices.filter((d) => d.connectionStatus === 'online').length || 1,
      color: '#10B981',
    },
    {
      name: 'Mất kết nối (Offline)',
      value: orgDevices.filter((d) => d.connectionStatus === 'offline').length || 1,
      color: '#EF4444',
    },
    {
      name: 'Ngưng hoạt động',
      value: orgDevices.filter((d) => d.status === 'inactive').length,
      color: '#9CA3AF',
    },
  ];

  // Biểu đồ số thiết bị theo cơ sở
  const devicePerFacilityData = orgFacilities.map((f) => ({
    name: f.name.length > 18 ? f.name.slice(0, 18) + '...' : f.name,
    count: devices.filter((d) => d.facilityId === f.id).length,
  }));

  // Bảng kết quả phát bản tin & tỷ lệ hoàn thành (SRS 4.8 & mục 9 #1: đã phát / cần phát * 100)
  interface BroadcastCompletionItem {
    id: string;
    title: string;
    targetMode: string;
    plannedHours: number;
    playedHours: number;
    completionPercent: number;
  }

  const broadcastCompletionList: BroadcastCompletionItem[] = orgBroadcasts.map((b, idx) => {
    const planned = 40;
    const played = b.status === 'completed' ? 40 : b.status === 'broadcasting' ? 24 : 0;
    const percent = Math.min(100, Math.round((played / planned) * 100));
    return {
      id: b.id,
      title: b.title,
      targetMode: b.targetMode === 'facility' ? 'Cơ sở' : 'Thiết bị',
      plannedHours: planned,
      playedHours: played,
      completionPercent: percent,
    };
  });

  const columns: ColumnsType<BroadcastCompletionItem> = [
    {
      title: 'Bản tin phát sóng',
      dataIndex: 'title',
      key: 'title',
      render: (t: string) => <Text strong>{t}</Text>,
    },
    {
      title: 'Kiểu phát',
      dataIndex: 'targetMode',
      key: 'targetMode',
      render: (m: string) => <Tag color="blue">{m}</Tag>,
      width: 120,
    },
    {
      title: 'Thời gian đã phát / Kế hoạch',
      key: 'hours',
      render: (_, record) => (
        <span>
          {record.playedHours}h / {record.plannedHours}h
        </span>
      ),
      width: 170,
    },
    {
      title: 'Phần trăm hoàn thành (SRS Mục 9 #1)',
      key: 'completion',
      render: (_, record) => (
        <div style={{ width: 180 }}>
          <Progress
            percent={record.completionPercent}
            size="small"
            strokeColor={record.completionPercent === 100 ? '#10B981' : '#FF7506'}
          />
        </div>
      ),
      width: 220,
    },
  ];

  return (
    <div style={{ padding: '24px 28px' }}>
      <div style={{ marginBottom: 20 }}>
        <Title level={3} style={{ margin: 0, fontWeight: 800 }}>
          Báo Cáo Phía Tổ Chức (USR-RPT)
        </Title>
        <Text type="secondary" style={{ fontSize: 13 }}>
          Báo cáo tình trạng thiết bị theo cây địa bàn, phân bổ hệ điều hành và kết quả phát bản tin theo công thức chuẩn
        </Text>
      </div>

      <Row gutter={[18, 18]} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <PieIcon size={16} color="#FF7506" />
                <span style={{ fontWeight: 700 }}>Tỷ lệ hoạt động của thiết bị (USR-RPT)</span>
              </div>
            }
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
          >
            <div style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deviceStatusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    dataKey="value"
                    label={({ name, percent }: any) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {deviceStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        <Col span={12}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <BarChart3 size={16} color="#3B82F6" />
                <span style={{ fontWeight: 700 }}>Số lượng thiết bị theo cơ sở (USR-RPT)</span>
              </div>
            }
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
          >
            <div style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={devicePerFacilityData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="count" name="Số màn hình" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle2 size={16} color="#10B981" />
            <span style={{ fontWeight: 700 }}>Kết Quả Phát Bản Tin & Tiến Độ (SRS USR-RPT & Mục 9 #1)</span>
          </div>
        }
        bordered={false}
        style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
      >
        <Table
          dataSource={broadcastCompletionList}
          columns={columns}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  );
};
