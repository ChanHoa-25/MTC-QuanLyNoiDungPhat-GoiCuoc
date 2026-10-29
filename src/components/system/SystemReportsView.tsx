import React, { useState } from 'react';
import { Card, Row, Col, Typography, Select, DatePicker } from 'antd';
import { BarChart3, PieChart as PieIcon, TrendingUp, DollarSign } from 'lucide-react';
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
import { formatVND } from '../../utils/formatters';

const { Title, Text } = Typography;

export const SystemReportsView: React.FC = () => {
  const { organizations, transactions, packages } = useMtcData();
  const [timeFilter, setTimeFilter] = useState('month');

  // SYS-RPT-08: Doanh thu theo thời gian
  const revenueOverTimeData = [
    { period: 'Tháng 5/2026', revenue: 7500000 },
    { period: 'Tháng 6/2026', revenue: 9200000 },
    { period: 'Tháng 7/2026', revenue: 11400000 },
    { period: 'Tháng 8/2026', revenue: 14800000 },
    { period: 'Tháng 9/2026', revenue: 18200000 },
    { period: 'Tháng 10/2026', revenue: 22600000 },
  ];

  // SYS-RPT-10: Doanh thu theo tổ chức
  const revenueByOrgData = organizations.map((org) => {
    const total = transactions
      .filter((t) => t.orgId === org.id)
      .reduce((acc, t) => acc + t.amountVND, 0);
    return {
      name: org.name.length > 20 ? org.name.slice(0, 20) + '...' : org.name,
      revenue: total || 1500000,
    };
  });

  // SYS-RPT-12: Tỷ lệ chuyển đổi khi hết hạn (gia hạn, nâng cấp, không tiếp tục)
  const conversionRateData = [
    { name: 'Gia hạn gói hiện tại', value: 68, color: '#10B981' },
    { name: 'Nâng cấp gói cao hơn', value: 24, color: '#FF7506' },
    { name: 'Không tiếp tục / Hủy', value: 8, color: '#EF4444' },
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
            Báo Cáo & Doanh Thu Hệ Thống (SYS-RPT)
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Phân tích số liệu tài chính, doanh thu theo gói cước, tổ chức và tỷ lệ chuyển đổi khách hàng
          </Text>
        </div>

        <DatePicker.RangePicker />
      </div>

      <Row gutter={[18, 18]} style={{ marginBottom: 24 }}>
        <Col span={14}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <TrendingUp size={16} color="#FF7506" />
                <span style={{ fontWeight: 700 }}>Doanh Thu Toàn Hệ Thống Theo Thời Gian (SYS-RPT-08)</span>
              </div>
            }
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
          >
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueOverTimeData}>
                  <XAxis dataKey="period" />
                  <YAxis tickFormatter={(v) => `${v / 1000000}M`} />
                  <RechartsTooltip formatter={(v) => formatVND(Number(v))} />
                  <Bar dataKey="revenue" name="Tổng tiền thực thu" fill="#FF7506" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        <Col span={10}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <PieIcon size={16} color="#10B981" />
                <span style={{ fontWeight: 700 }}>Tỷ Lệ Chuyển Đổi Khi Hết Hạn (SYS-RPT-12)</span>
              </div>
            }
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
          >
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={conversionRateData}
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    dataKey="value"
                    label={({ name, percent }: any) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {conversionRateData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(v) => `${v}%`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[18, 18]}>
        <Col span={24}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <DollarSign size={16} color="#2563EB" />
                <span style={{ fontWeight: 700 }}>Doanh Thu Theo Tổ Chức (SYS-RPT-10)</span>
              </div>
            }
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
          >
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueByOrgData}>
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(v) => `${v / 1000000}M`} />
                  <RechartsTooltip formatter={(v) => formatVND(Number(v))} />
                  <Bar dataKey="revenue" name="Doanh thu thanh toán" fill="#2563EB" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
