import React from 'react';
import { Card, Row, Col, Statistic, Progress, Tag, Typography } from 'antd';
import {
  Tv,
  Building2,
  HardDrive,
  DollarSign,
  TrendingUp,
  PieChart as PieIcon,
} from 'lucide-react';
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
import { formatVND, formatStorage } from '../../utils/formatters';

const { Title, Text } = Typography;

const COLORS = ['#FF7506', '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B'];

export const SystemDashboardView: React.FC = () => {
  const { organizations, devices, mediaList, transactions } = useMtcData();

  // Thống kê theo SRS SYS-RPT-01, 02, 03
  const totalDevices = devices.length;
  const freeOrgs = organizations.filter((o) => o.currentPackageId === 'pkg-free').length;
  const paidOrgs = organizations.filter((o) => o.currentPackageId !== 'pkg-free').length;
  const totalRevenue = transactions.reduce((acc, t) => acc + t.amountVND, 0);

  // Dữ liệu biểu đồ cơ cấu dung lượng (SYS-RPT-04: media, device log, screenshot, activity log)
  const storageBreakdownData = [
    { name: 'Nội dung Media', value: 65, color: '#FF7506' },
    { name: 'Nhật ký thiết bị (Device logs)', value: 15, color: '#3B82F6' },
    { name: 'Ảnh chụp màn hình (Screenshot)', value: 12, color: '#10B981' },
    { name: 'Nhật ký hoạt động (Audit log)', value: 8, color: '#8B5CF6' },
  ];

  // Dữ liệu tỷ lệ loại media (SYS-RPT-05)
  const mediaTypeData = [
    { name: 'Video (MP4)', value: mediaList.filter((m) => m.type === 'video').length || 2, color: '#FF7506' },
    { name: 'Hình ảnh (PNG/JPG)', value: mediaList.filter((m) => m.type === 'image').length || 1, color: '#3B82F6' },
    { name: 'Âm thanh (MP3)', value: mediaList.filter((m) => m.type === 'audio').length || 1, color: '#10B981' },
    { name: 'Phát trực tiếp (Stream)', value: mediaList.filter((m) => m.type === 'livestream').length || 1, color: '#F59E0B' },
    { name: 'Tần số phát (Hz)', value: mediaList.filter((m) => m.type === 'frequency').length || 1, color: '#8B5CF6' },
  ];

  // Dữ liệu tỷ lệ hệ điều hành thiết bị (SYS-RPT-06: Android, Linux, Windows)
  const osData = [
    { name: 'Android', value: devices.filter((d) => d.os === 'Android').length, color: '#10B981' },
    { name: 'Windows', value: devices.filter((d) => d.os === 'Windows').length, color: '#3B82F6' },
    { name: 'Linux', value: devices.filter((d) => d.os === 'Linux').length, color: '#FF7506' },
  ];

  // Doanh thu theo gói cước (SYS-RPT-09)
  const packageRevenueData = [
    { name: '100GB / 1 Năm', revenue: 4800000 },
    { name: '20GB / 6 Tháng', revenue: 2700000 },
    { name: '5GB / 1 Tháng', revenue: 1500000 },
    { name: 'Nâng cấp +10GB', revenue: 600000 },
  ];

  return (
    <div style={{ padding: '24px 28px' }}>
      <div style={{ marginBottom: 20 }}>
        <Title level={3} style={{ margin: 0, color: '#111827', fontWeight: 800 }}>
          Tổng Quan Hệ Thống Vận Hành (SYS-DSH & SYS-RPT)
        </Title>
        <Text type="secondary" style={{ fontSize: 13 }}>
          Theo dõi các chỉ số thời gian thực: thiết bị toàn hệ thống, tổ chức, dung lượng và doanh thu
        </Text>
      </div>

      {/* 4 Card thống kê chính theo SRS 3.7 */}
      <Row gutter={[18, 18]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card
            bordered={false}
            style={{
              borderRadius: 12,
              background: 'linear-gradient(135deg, #FFF7ED 0%, #FFFFFF 100%)',
              border: '1px solid #FFEDD5',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            }}
          >
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#C2410C' }}>Tổng thiết bị toàn hệ thống (SYS-RPT-01)</span>}
              value={totalDevices}
              prefix={<Tv size={20} color="#EA580C" style={{ marginRight: 6 }} />}
              suffix={<span style={{ fontSize: 14, color: '#9A3412' }}>thiết bị</span>}
              valueStyle={{ fontWeight: 800, color: '#C2410C', fontSize: 28 }}
            />
          </Card>
        </Col>

        <Col span={6}>
          <Card
            bordered={false}
            style={{
              borderRadius: 12,
              background: 'linear-gradient(135deg, #EFF6FF 0%, #FFFFFF 100%)',
              border: '1px solid #DBEAFE',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            }}
          >
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#1D4ED8' }}>Tổ chức dùng gói trả phí (SYS-RPT-03)</span>}
              value={paidOrgs}
              prefix={<Building2 size={20} color="#2563EB" style={{ marginRight: 6 }} />}
              suffix={<span style={{ fontSize: 14, color: '#1E40AF' }}>tổ chức</span>}
              valueStyle={{ fontWeight: 800, color: '#1D4ED8', fontSize: 28 }}
            />
          </Card>
        </Col>

        <Col span={6}>
          <Card
            bordered={false}
            style={{
              borderRadius: 12,
              background: 'linear-gradient(135deg, #F0FDF4 0%, #FFFFFF 100%)',
              border: '1px solid #DCFCE7',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            }}
          >
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#15803D' }}>Tổ chức dùng gói Free (SYS-RPT-02)</span>}
              value={freeOrgs}
              prefix={<HardDrive size={20} color="#16A34A" style={{ marginRight: 6 }} />}
              suffix={<span style={{ fontSize: 14, color: '#166534' }}>tổ chức</span>}
              valueStyle={{ fontWeight: 800, color: '#15803D', fontSize: 28 }}
            />
          </Card>
        </Col>

        <Col span={6}>
          <Card
            bordered={false}
            style={{
              borderRadius: 12,
              background: 'linear-gradient(135deg, #FAF5FF 0%, #FFFFFF 100%)',
              border: '1px solid #F3E8FF',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            }}
          >
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#7E22CE' }}>Tổng doanh thu lũy kế (SYS-RPT-08)</span>}
              value={totalRevenue}
              formatter={(v) => formatVND(Number(v))}
              prefix={<DollarSign size={20} color="#9333EA" style={{ marginRight: 6 }} />}
              valueStyle={{ fontWeight: 800, color: '#7E22CE', fontSize: 22 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Row biểu đồ tỷ lệ dung lượng & loại media */}
      <Row gutter={[18, 18]} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <PieIcon size={16} color="#FF7506" />
                <span style={{ fontWeight: 700 }}>Tỷ lệ sử dụng dung lượng trung bình (SYS-RPT-04)</span>
              </div>
            }
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
          >
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={storageBreakdownData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {storageBreakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value) => `${value}%`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ textAlign: 'center', fontSize: 12, color: '#6B7280', marginTop: 8 }}>
              Bao gồm: Media, nhật ký thiết bị, ảnh màn hình thiết bị và nhật ký hoạt động
            </div>
          </Card>
        </Col>

        <Col span={12}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <PieIcon size={16} color="#3B82F6" />
                <span style={{ fontWeight: 700 }}>Tỷ lệ hệ điều hành thiết bị (SYS-RPT-06)</span>
              </div>
            }
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
          >
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={osData}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="value"
                    label={({ name, percent }: any) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {osData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ textAlign: 'center', fontSize: 12, color: '#6B7280', marginTop: 8 }}>
              Theo dõi thiết bị chạy Android, Windows, Linux kết nối về hệ thống MTC
            </div>
          </Card>
        </Col>
      </Row>

      {/* Doanh thu theo gói cước */}
      <Row gutter={[18, 18]}>
        <Col span={24}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <TrendingUp size={16} color="#10B981" />
                <span style={{ fontWeight: 700 }}>Doanh thu theo gói cước (SYS-RPT-09)</span>
              </div>
            }
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
          >
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={packageRevenueData}>
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(v) => `${v / 1000000}M`} />
                  <RechartsTooltip formatter={(val) => formatVND(Number(val))} />
                  <Legend />
                  <Bar dataKey="revenue" name="Tổng doanh thu thực nhận" fill="#FF7506" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
