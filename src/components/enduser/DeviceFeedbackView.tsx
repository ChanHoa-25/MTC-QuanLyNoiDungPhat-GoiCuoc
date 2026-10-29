import React, { useState, useMemo } from 'react';
import {
  Table,
  Tag,
  Space,
  Input,
  Select,
  Typography,
  Progress,
  Tooltip,
  Badge,
  Card,
  Row,
  Col,
  Alert,
  Modal,
  Button,
  Statistic,
  Tabs,
  Steps,
  Descriptions,
  message,
  DatePicker,
  Timeline,
  Popconfirm,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import {
  WifiOff,
  Download,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Signal,
  RefreshCw,
  Eye,
  Radio,
  Tv,
  MapPin,
  Wifi,
  Send,
  History,
  Filter,
  RotateCw,
  ShieldCheck,
  Activity,
  Pause,
} from 'lucide-react';
import { useMtcData } from '../../context/MtcDataContext';
import { useAuth } from '../../context/AuthContext';
import type { DeviceBroadcastFeedback, DeviceFeedbackStatus } from '../../types';
import { INITIAL_DEVICE_FEEDBACKS } from '../../data/mockData';

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;

// ──────────────────────────────────────────────
// Config maps
// ──────────────────────────────────────────────
const STATUS_CFG: Record<
  DeviceFeedbackStatus,
  { label: string; color: string; tagColor: string; icon: React.ReactNode }
> = {
  received:    { label: 'Đã nhận lịch',     color: '#3B82F6', tagColor: 'blue',    icon: <Clock    size={12} /> },
  downloading: { label: 'Đang tải nội dung', color: '#8B5CF6', tagColor: 'purple',  icon: <Download size={12} /> },
  ready:       { label: 'Sẵn sàng phát',    color: '#0EA5E9', tagColor: 'cyan',    icon: <CheckCircle2 size={12} /> },
  playing:     { label: 'Đang phát',         color: '#10B981', tagColor: 'success', icon: <Play     size={12} /> },
  completed:   { label: 'Đã phát xong',      color: '#6B7280', tagColor: 'default', icon: <CheckCircle2 size={12} /> },
  failed:      { label: 'Phát thất bại',     color: '#DC2626', tagColor: 'error',   icon: <XCircle  size={12} /> },
  no_response: { label: 'Không phản hồi',   color: '#9CA3AF', tagColor: 'default', icon: <WifiOff  size={12} /> },
};

const NETWORK_CLR: Record<string, string> = {
  LAN: '#10B981', WiFi: '#3B82F6', '4G': '#8B5CF6', Unknown: '#9CA3AF',
};

function fmtDT(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  });
}
function diffMin(iso: string) {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
}

// ──────────────────────────────────────────────
// Tag component
// ──────────────────────────────────────────────
const StatusTag: React.FC<{ status: DeviceFeedbackStatus }> = ({ status }) => {
  const c = STATUS_CFG[status];
  return (
    <Tag color={c.tagColor} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px' }}>
      {c.icon} {c.label}
    </Tag>
  );
};

// ──────────────────────────────────────────────
// Main component
// ──────────────────────────────────────────────
export const DeviceFeedbackView: React.FC = () => {
  const { broadcasts, facilities } = useMtcData();
  const { currentUser } = useAuth();

  // Tab state: 7 màn hình
  const [activeTab, setActiveTab] = useState<
    'overview' | 'playing' | 'error' | 'detail-view' | 'filter' | 'retry' | 'history'
  >('overview');

  // Filters
  const [search, setSearch]               = useState('');
  const [fBrd,   setFBrd]                 = useState('all');
  const [fStatus, setFStatus]             = useState('all');
  const [fFac,   setFFac]                 = useState('all');
  const [dateRange, setDateRange]         = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  // Detail modal
  const [detail, setDetail]   = useState<DeviceBroadcastFeedback | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Retry confirm
  const [retryTarget, setRetryTarget] = useState<DeviceBroadcastFeedback | null>(null);

  // Data
  const orgFacIds = facilities.filter(f => f.orgId === currentUser.orgId).map(f => f.id);
  const allFeedbacks = useMemo(
    () => INITIAL_DEVICE_FEEDBACKS.filter(fb => orgFacIds.includes(fb.facilityId)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentUser.orgId]
  );
  const orgBroadcasts = broadcasts.filter(b => b.orgId === currentUser.orgId);

  // Computed stats
  const stats = useMemo(() => ({
    total:     allFeedbacks.length,
    playing:   allFeedbacks.filter(f => f.feedbackStatus === 'playing').length,
    completed: allFeedbacks.filter(f => f.feedbackStatus === 'completed').length,
    failed:    allFeedbacks.filter(f => ['failed','no_response'].includes(f.feedbackStatus)).length,
    pending:   allFeedbacks.filter(f => ['received','downloading','ready'].includes(f.feedbackStatus)).length,
  }), [allFeedbacks]);

  // Filter function
  const applyFilter = (list: DeviceBroadcastFeedback[], extraStatus?: DeviceFeedbackStatus[]) => {
    return list.filter(fb => {
      const matchSearch = !search || [fb.deviceName, fb.deviceCode, fb.broadcastTitle]
        .some(s => s.toLowerCase().includes(search.toLowerCase()));
      const matchBrd    = fBrd === 'all' || fb.broadcastId === fBrd;
      const matchStatus = fStatus === 'all' || fb.feedbackStatus === fStatus;
      const matchFac    = fFac === 'all' || fb.facilityId === fFac;
      const matchExtra  = !extraStatus || extraStatus.includes(fb.feedbackStatus);
      const matchDate   = !dateRange || (() => {
        const t = new Date(fb.lastSyncAt).getTime();
        return t >= dateRange[0].startOf('day').valueOf() && t <= dateRange[1].endOf('day').valueOf();
      })();
      return matchSearch && matchBrd && matchStatus && matchFac && matchExtra && matchDate;
    });
  };

  // ──────────────────────────────────────────────
  // Table columns
  // ──────────────────────────────────────────────
  const makeColumns = (showRetry = false): ColumnsType<DeviceBroadcastFeedback> => [
    {
      title: 'Thiết bị', key: 'device', width: 210,
      render: (_, r) => (
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
            <Tv size={14} color="#FF7506" style={{ flexShrink:0 }} />
            <Text strong style={{ fontSize:13, color:'#1F2937' }}>{r.deviceName}</Text>
          </div>
          <Tag color="blue" style={{ fontSize:10, marginTop:2 }}>{r.deviceCode}</Tag>
          <div style={{ display:'flex', alignItems:'center', gap:3, fontSize:11, color:'#9CA3AF', marginTop:2 }}>
            <MapPin size={10} />{r.facilityName}
          </div>
        </div>
      ),
    },
    {
      title: 'Bản tin', key: 'broadcast', ellipsis: true,
      render: (_, r) => (
        <div>
          <Text style={{ fontSize:12, fontWeight:600, color:'#1F2937' }}>{r.broadcastTitle}</Text>
          <div style={{ fontSize:10, color:'#9CA3AF' }}>ID: {r.broadcastId}</div>
        </div>
      ),
    },
    {
      title: 'Trạng thái', key: 'status', width: 155,
      render: (_, r) => <StatusTag status={r.feedbackStatus} />,
      filters: (Object.keys(STATUS_CFG) as DeviceFeedbackStatus[]).map(k => ({
        text: STATUS_CFG[k].label, value: k,
      })),
      onFilter: (v, r) => r.feedbackStatus === v,
    },
    {
      title: 'Tiến độ', key: 'progress', width: 130,
      render: (_, r) => {
        const isErr = ['failed','no_response'].includes(r.feedbackStatus);
        const isDone = r.feedbackStatus === 'completed';
        return (
          <div>
            <Progress
              percent={r.playbackProgress ?? 0}
              size="small"
              strokeColor={isErr ? '#DC2626' : isDone ? '#6B7280' : '#FF7506'}
              status={isErr ? 'exception' : isDone ? 'success' : r.feedbackStatus === 'playing' ? 'active' : 'normal'}
            />
            <div style={{ fontSize:10, color:'#9CA3AF' }}>{r.playbackProgress ?? 0}%</div>
          </div>
        );
      },
    },
    {
      title: 'Mạng', key: 'network', width: 120,
      render: (_, r) => {
        const clr = NETWORK_CLR[r.networkType ?? 'Unknown'];
        const sig = r.signalStrength ?? 0;
        return (
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:4, marginBottom:3 }}>
              {sig > 0 ? <Signal size={12} color={clr}/> : <WifiOff size={12} color="#9CA3AF"/>}
              <Tag style={{ fontSize:10, padding:'0 5px', background:`${clr}15`, borderColor:clr, color:clr }}>
                {r.networkType ?? 'Unknown'}
              </Tag>
            </div>
            <Progress percent={sig} size="small"
              strokeColor={sig > 60 ? '#10B981' : sig > 30 ? '#F59E0B' : '#DC2626'} showInfo={false}/>
            <div style={{ fontSize:10, color:'#9CA3AF' }}>{sig}%</div>
          </div>
        );
      },
    },
    {
      title: 'Sync cuối', key: 'sync', width: 130,
      render: (_, r) => {
        const dm = diffMin(r.lastSyncAt);
        const stale = dm > 30;
        return (
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, color: stale ? '#DC2626' : '#374151' }}>
              <RefreshCw size={11} color={stale ? '#DC2626' : '#9CA3AF'}/>
              {dm < 60 ? `${dm}p trước` : `${Math.floor(dm/60)}h trước`}
            </div>
            <div style={{ fontSize:10, color:'#9CA3AF' }}>{fmtDT(r.lastSyncAt)}</div>
            {r.retryCount > 0 && <Tag color="orange" style={{ fontSize:10, marginTop:2 }}>×{r.retryCount} thử</Tag>}
          </div>
        );
      },
    },
    {
      title: 'Lỗi', key: 'error', width: 130,
      render: (_, r) => r.errorCode
        ? <Tooltip title={r.errorMessage}>
            <Tag color="error" style={{ fontSize:10, maxWidth:115, overflow:'hidden', textOverflow:'ellipsis', display:'block' }}>
              <AlertTriangle size={10} style={{ marginRight:3 }}/>{r.errorCode}
            </Tag>
          </Tooltip>
        : <Text style={{ fontSize:11, color:'#10B981' }}>✓ Bình thường</Text>,
    },
    {
      title: 'Thao tác', key: 'action', width: showRetry ? 120 : 70, fixed: 'right',
      render: (_, r) => (
        <Space size={4}>
          <Button size="small" icon={<Eye size={13}/>} title="Chi tiết"
            onClick={() => { setDetail(r); setDetailOpen(true); }}/>
          {showRetry && ['failed','no_response'].includes(r.feedbackStatus) && (
            <Popconfirm
              title="Gửi lại lệnh phát đến thiết bị này?"
              onConfirm={() => { message.success(`Đã gửi lại lệnh phát đến ${r.deviceName}`); }}
              okText="Gửi lại" cancelText="Huỷ"
            >
              <Button size="small" danger icon={<RotateCw size={13}/>} title="Gửi lại"/>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  // ──────────────────────────────────────────────
  // Filter bar (dùng chung)
  // ──────────────────────────────────────────────
  const FilterBar = ({ extra }: { extra?: React.ReactNode }) => (
    <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:16, alignItems:'center' }}>
      <Input.Search
        placeholder="Tìm thiết bị / bản tin..."
        style={{ width:230 }} value={search}
        onChange={e => setSearch(e.target.value)} allowClear
      />
      <Select style={{ minWidth:185 }} value={fBrd} onChange={setFBrd}>
        <Select.Option value="all">Tất cả bản tin</Select.Option>
        {orgBroadcasts.map(b => <Select.Option key={b.id} value={b.id}>{b.title}</Select.Option>)}
      </Select>
      <Select style={{ minWidth:160 }} value={fStatus} onChange={setFStatus}>
        <Select.Option value="all">Tất cả trạng thái</Select.Option>
        {(Object.keys(STATUS_CFG) as DeviceFeedbackStatus[]).map(k =>
          <Select.Option key={k} value={k}>{STATUS_CFG[k].label}</Select.Option>)}
      </Select>
      <Select style={{ minWidth:170 }} value={fFac} onChange={setFFac}>
        <Select.Option value="all">Tất cả cơ sở</Select.Option>
        {facilities.filter(f => f.orgId === currentUser.orgId)
          .map(f => <Select.Option key={f.id} value={f.id}>{f.name}</Select.Option>)}
      </Select>
      {extra}
    </div>
  );

  // ──────────────────────────────────────────────
  // Stat Cards
  // ──────────────────────────────────────────────
  const StatCards = () => (
    <Row gutter={[12,12]} style={{ marginBottom:20 }}>
      {[
        { label:'Tổng thiết bị theo dõi', val:stats.total,     color:'#374151', bg:'#F9FAFB', border:'#E5E7EB', icon:<Activity size={20} color="#374151"/> },
        { label:'Đang phát',              val:stats.playing,   color:'#059669', bg:'#ECFDF5', border:'#A7F3D0', icon:<Play     size={20} color="#059669"/> },
        { label:'Chờ / Chuẩn bị',        val:stats.pending,   color:'#2563EB', bg:'#EFF6FF', border:'#BFDBFE', icon:<Clock    size={20} color="#2563EB"/> },
        { label:'Đã phát xong',          val:stats.completed, color:'#6B7280', bg:'#F9FAFB', border:'#E5E7EB', icon:<CheckCircle2 size={20} color="#6B7280"/> },
        { label:'Lỗi / Không phản hồi', val:stats.failed,    color:'#DC2626', bg:'#FEF2F2', border:'#FECACA', icon:<XCircle  size={20} color="#DC2626"/> },
      ].map(s => (
        <Col xs={24} sm={12} md={8} lg={5} key={s.label}>
          <Card size="small" style={{ borderRadius:10, background:s.bg, border:`1px solid ${s.border}`, height:'100%' }}>
            <Statistic
              title={<span style={{ fontSize:11, color:s.color, fontWeight:600 }}>{s.label}</span>}
              value={s.val}
              valueStyle={{ color:s.color, fontWeight:800, fontSize:26 }}
              prefix={s.icon}
            />
          </Card>
        </Col>
      ))}
    </Row>
  );

  // ──────────────────────────────────────────────
  // SCREEN 1: Overview
  // ──────────────────────────────────────────────
  const Screen1Overview = () => (
    <div>
      <StatCards/>
      {stats.failed > 0 && (
        <Alert
          message={`⚠ Phát hiện ${stats.failed} thiết bị đang gặp sự cố — cần kiểm tra ngay`}
          description="Một hoặc nhiều thiết bị đã mất kết nối hoặc không thể tải nội dung bản tin."
          type="warning" showIcon closable style={{ marginBottom:16, borderRadius:8 }}
        />
      )}
      <FilterBar/>
      <Table
        dataSource={applyFilter(allFeedbacks)}
        columns={makeColumns(false)} rowKey="id"
        pagination={{ pageSize:8, showSizeChanger:true, showTotal:(t,r)=>`${r[0]}-${r[1]} / ${t} dòng` }}
        scroll={{ x: 'max-content' }}
        style={{ background:'#fff', borderRadius:12, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}
      />
    </div>
  );

  // ──────────────────────────────────────────────
  // SCREEN 2: Playing
  // ──────────────────────────────────────────────
  const Screen2Playing = () => {
    const rows = applyFilter(allFeedbacks, ['playing','ready','downloading']);
    return (
      <div>
        <Alert
          message={`🟢 Hiện có ${stats.playing} thiết bị đang phát bản tin theo thời gian thực`}
          type="success" showIcon style={{ marginBottom:16, borderRadius:8 }}
        />
        <FilterBar/>
        <Table
          dataSource={rows} columns={makeColumns(false)} rowKey="id"
          pagination={{ pageSize:8, showSizeChanger:true }}
          scroll={{ x: 'max-content' }}
          style={{ background:'#fff', borderRadius:12, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}
          rowClassName={r => r.feedbackStatus === 'playing' ? 'row-playing' : ''}
        />
      </div>
    );
  };

  // ──────────────────────────────────────────────
  // SCREEN 3: Error / Cảnh báo
  // ──────────────────────────────────────────────
  const Screen3Error = () => {
    const rows = applyFilter(allFeedbacks, ['failed','no_response']);
    return (
      <div>
        <Alert
          message={`🔴 ${stats.failed} thiết bị đang gặp sự cố cần xử lý`}
          description={
            <ul style={{ margin:'8px 0 0', paddingLeft:16, fontSize:12 }}>
              <li>Kiểm tra kết nối mạng của thiết bị (4G/WiFi/LAN)</li>
              <li>Xem mã lỗi chi tiết và số lần thử lại</li>
              <li>Dùng nút "Gửi lại" để gửi lại lệnh phát</li>
            </ul>
          }
          type="error" showIcon style={{ marginBottom:16, borderRadius:8 }}
        />
        <FilterBar/>
        <Table
          dataSource={rows} columns={makeColumns(true)} rowKey="id"
          pagination={{ pageSize:8, showSizeChanger:true }}
          scroll={{ x: 'max-content' }}
          style={{ background:'#fff', borderRadius:12, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}
        />
      </div>
    );
  };

  // ──────────────────────────────────────────────
  // SCREEN 4: Detail / Timeline
  // (Tab này chỉ mở modal, hiển thị danh sách tất cả để user click xem chi tiết)
  // ──────────────────────────────────────────────
  const Screen4Detail = () => (
    <div>
      <Alert
        message="Nhấn nút 👁 trên mỗi hàng để xem timeline đầy đủ: Nhận lịch → Tải nội dung → Sẵn sàng → Đang phát → Hoàn thành"
        type="info" showIcon style={{ marginBottom:16, borderRadius:8 }}
      />
      <FilterBar/>
      <Table
        dataSource={applyFilter(allFeedbacks)} columns={makeColumns(false)} rowKey="id"
        pagination={{ pageSize:8, showSizeChanger:true }}
        scroll={{ x: 'max-content' }}
        style={{ background:'#fff', borderRadius:12, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}
      />
    </div>
  );

  // ──────────────────────────────────────────────
  // SCREEN 5: Bộ lọc nâng cao
  // ──────────────────────────────────────────────
  const Screen5Filter = () => (
    <div>
      {/* Advanced filter panel */}
      <Card
        style={{ marginBottom:16, borderRadius:12, background:'#F8FAFC', border:'1px solid #E2E8F0' }}
        title={<span style={{ fontSize:14, fontWeight:700, display:'flex', alignItems:'center', gap:6 }}>
          <Filter size={15} color="#FF7506"/> Bộ lọc nâng cao
        </span>}
      >
        <Row gutter={[12,12]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <div style={{ fontSize:12, fontWeight:600, marginBottom:4, color:'#374151' }}>Tìm kiếm tên / mã</div>
            <Input.Search placeholder="Thiết bị, bản tin..." value={search} onChange={e=>setSearch(e.target.value)} allowClear/>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <div style={{ fontSize:12, fontWeight:600, marginBottom:4, color:'#374151' }}>Bản tin</div>
            <Select style={{ width:'100%' }} value={fBrd} onChange={setFBrd}>
              <Select.Option value="all">Tất cả bản tin</Select.Option>
              {orgBroadcasts.map(b=><Select.Option key={b.id} value={b.id}>{b.title}</Select.Option>)}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <div style={{ fontSize:12, fontWeight:600, marginBottom:4, color:'#374151' }}>Trạng thái phản hồi</div>
            <Select style={{ width:'100%' }} value={fStatus} onChange={setFStatus}>
              <Select.Option value="all">Tất cả trạng thái</Select.Option>
              {(Object.keys(STATUS_CFG) as DeviceFeedbackStatus[]).map(k=>
                <Select.Option key={k} value={k}>{STATUS_CFG[k].label}</Select.Option>)}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <div style={{ fontSize:12, fontWeight:600, marginBottom:4, color:'#374151' }}>Cơ sở / Địa bàn</div>
            <Select style={{ width:'100%' }} value={fFac} onChange={setFFac}>
              <Select.Option value="all">Tất cả cơ sở</Select.Option>
              {facilities.filter(f=>f.orgId===currentUser.orgId)
                .map(f=><Select.Option key={f.id} value={f.id}>{f.name}</Select.Option>)}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={12} lg={8}>
            <div style={{ fontSize:12, fontWeight:600, marginBottom:4, color:'#374151' }}>Khoảng thời gian sync</div>
            <RangePicker style={{ width:'100%' }} onChange={v => setDateRange(v as any)}/>
          </Col>
          <Col xs={24} sm={12} md={12} lg={4} style={{ display:'flex', alignItems:'flex-end' }}>
            <Button onClick={() => { setSearch(''); setFBrd('all'); setFStatus('all'); setFFac('all'); setDateRange(null); }}>
              Xóa bộ lọc
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Result count */}
      <div style={{ marginBottom:8, fontSize:13, color:'#6B7280' }}>
        Kết quả: <strong style={{ color:'#1F2937' }}>{applyFilter(allFeedbacks).length}</strong> / {allFeedbacks.length} bản ghi
      </div>

      <Table
        dataSource={applyFilter(allFeedbacks)} columns={makeColumns(false)} rowKey="id"
        pagination={{ pageSize:8, showSizeChanger:true }}
        scroll={{ x: 'max-content' }}
        style={{ background:'#fff', borderRadius:12, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}
      />
    </div>
  );

  // ──────────────────────────────────────────────
  // SCREEN 6: Gửi lại / Đồng bộ
  // ──────────────────────────────────────────────
  const Screen6Retry = () => {
    const errorRows = applyFilter(allFeedbacks, ['failed','no_response']);
    return (
      <div>
        <Row gutter={[12,12]} style={{ marginBottom:16 }}>
          <Col xs={24} sm={12}>
            <Alert
              message="Gửi lại lệnh phát"
              description="Chọn thiết bị lỗi và nhấn 'Gửi lại' để server tái phát lệnh phát bản tin đến thiết bị."
              type="warning" showIcon style={{ borderRadius:8, height:'100%' }}
            />
          </Col>
          <Col xs={24} sm={12}>
            <Alert
              message="Đồng bộ cấu hình"
              description="Gửi lại toàn bộ cấu hình (volume, lịch phát, nội dung) đến thiết bị đã mất đồng bộ."
              type="info" showIcon style={{ borderRadius:8, height:'100%' }}
            />
          </Col>
        </Row>

        <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
          <Popconfirm
            title={`Gửi lại lệnh phát đến TẤT CẢ ${errorRows.length} thiết bị đang lỗi?`}
            onConfirm={() => message.success(`Đã gửi lại lệnh đến ${errorRows.length} thiết bị`)}
            okText="Xác nhận" cancelText="Huỷ"
          >
            <Button danger icon={<Send size={14}/>} disabled={errorRows.length === 0}>
              Gửi lại tất cả ({errorRows.length} thiết bị lỗi)
            </Button>
          </Popconfirm>
          <Popconfirm
            title="Đồng bộ cấu hình đến tất cả thiết bị?"
            onConfirm={() => message.success('Đã gửi lệnh đồng bộ cấu hình đến tất cả thiết bị')}
            okText="Xác nhận" cancelText="Huỷ"
          >
            <Button icon={<ShieldCheck size={14}/>}>Đồng bộ cấu hình tất cả</Button>
          </Popconfirm>
        </div>

        <FilterBar/>

        <Table
          dataSource={applyFilter(allFeedbacks)} columns={makeColumns(true)} rowKey="id"
          pagination={{ pageSize:8, showSizeChanger:true }}
          scroll={{ x: 'max-content' }}
          style={{ background:'#fff', borderRadius:12, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}
        />
      </div>
    );
  };

  // ──────────────────────────────────────────────
  // SCREEN 7: Lịch sử hoàn thành
  // ──────────────────────────────────────────────
  const Screen7History = () => {
    const rows = applyFilter(allFeedbacks, ['completed']);
    return (
      <div>
        <Alert
          message={`📋 Lịch sử phát thành công — ${rows.length} bản ghi thiết bị đã hoàn thành phát bản tin`}
          type="success" showIcon style={{ marginBottom:16, borderRadius:8 }}
        />
        <FilterBar extra={
          <RangePicker placeholder={['Từ ngày','Đến ngày']} onChange={v => setDateRange(v as any)}/>
        }/>
        <Table
          dataSource={rows} columns={[
            ...makeColumns(false).slice(0,-1), // bỏ cột action cuối
            {
              title: 'Thời gian bắt đầu', key: 'startedAt', width:160,
              render: (_,r) => <div style={{ fontSize:11 }}>{fmtDT(r.startedPlayingAt)}</div>,
            },
            {
              title: 'Hoàn thành lúc', key: 'completedAt', width:160,
              render: (_,r) => <div style={{ fontSize:11, color:'#059669' }}>{fmtDT(r.completedAt)}</div>,
            },
            {
              title: 'Thao tác', key: 'action2', width:70, fixed:'right',
              render: (_,r) => (
                <Button size="small" icon={<Eye size={13}/>}
                  onClick={() => { setDetail(r); setDetailOpen(true); }}/>
              ),
            },
          ]} rowKey="id"
          pagination={{ pageSize:8, showSizeChanger:true }}
          scroll={{ x: 'max-content' }}
          style={{ background:'#fff', borderRadius:12, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}
        />
      </div>
    );
  };

  // ──────────────────────────────────────────────
  // Detail Modal — Timeline
  // ──────────────────────────────────────────────
  const DetailModal = () => {
    if (!detail) return null;
    const cfg = STATUS_CFG[detail.feedbackStatus];
    const timelineItems = [
      { color:'blue',  label:'Nhận lịch từ server',    time:detail.receivedAt,        done:!!detail.receivedAt },
      { color:'purple',label:'Tải nội dung',            time:undefined,                done:['downloading','ready','playing','completed'].includes(detail.feedbackStatus) },
      { color:'cyan',  label:'Sẵn sàng phát',          time:undefined,                done:['ready','playing','completed'].includes(detail.feedbackStatus) },
      { color:'green', label:'Bắt đầu phát bản tin',   time:detail.startedPlayingAt,  done:!!detail.startedPlayingAt },
      { color:'gray',  label:'Hoàn thành phát',        time:detail.completedAt,       done:!!detail.completedAt },
    ];
    return (
      <Modal
        open={detailOpen} onCancel={() => setDetailOpen(false)} width={640}
        footer={<Button onClick={() => setDetailOpen(false)}>Đóng</Button>}
        title={
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <Radio size={17} color="#FF7506"/>
            <span>Chi tiết phản hồi — {detail.deviceName}</span>
          </div>
        }
      >
        {/* Status header */}
        <div style={{
          display:'flex', alignItems:'center', gap:12,
          padding:'12px 16px', borderRadius:10, marginBottom:20,
          background: detail.feedbackStatus === 'playing' ? '#ECFDF5'
            : ['failed','no_response'].includes(detail.feedbackStatus) ? '#FEF2F2' : '#EFF6FF',
          border:`1px solid ${cfg.color}30`,
        }}>
          <StatusTag status={detail.feedbackStatus}/>
          <div>
            <div style={{ fontWeight:700, fontSize:14, color:'#111827' }}>{detail.deviceName}</div>
            <div style={{ fontSize:12, color:'#6B7280' }}>{detail.deviceCode} · {detail.facilityName}</div>
          </div>
        </div>

        {/* Bản tin */}
        <div style={{ padding:'10px 14px', borderRadius:8, background:'#F9FAFB', border:'1px solid #F3F4F6', marginBottom:16 }}>
          <div style={{ fontSize:11, color:'#9CA3AF', marginBottom:4 }}>BẢN TIN ĐƯỢC GIAO PHÁT</div>
          <div style={{ fontWeight:700, color:'#FF7506' }}>{detail.broadcastTitle}</div>
          <div style={{ fontSize:11, color:'#9CA3AF' }}>ID: {detail.broadcastId}</div>
        </div>

        {/* Tiến độ */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:11, color:'#9CA3AF', marginBottom:6 }}>TIẾN ĐỘ PHÁT ({detail.playbackProgress ?? 0}%)</div>
          <Progress percent={detail.playbackProgress ?? 0}
            strokeColor={{ '0%':'#FF7506', '100%':'#10B981' }}
            status={['failed','no_response'].includes(detail.feedbackStatus) ? 'exception'
              : detail.feedbackStatus === 'completed' ? 'success' : 'active'}/>
        </div>

        {/* Timeline */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:11, color:'#9CA3AF', marginBottom:10 }}>TIMELINE PHẢN HỒI</div>
          <Timeline
            items={timelineItems.map(t => ({
              color: t.done ? t.color : 'gray',
              children: (
                <div>
                  <span style={{ fontWeight: t.done ? 600 : 400, color: t.done ? '#1F2937' : '#9CA3AF', fontSize:13 }}>
                    {t.label}
                  </span>
                  {t.time && <div style={{ fontSize:11, color:'#6B7280' }}>{fmtDT(t.time)}</div>}
                </div>
              ),
            }))}
          />
        </div>

        {/* Mạng */}
        <Descriptions size="small" bordered column={2} style={{ marginBottom: detail.errorCode ? 16 : 0 }}>
          <Descriptions.Item label="Loại mạng">{detail.networkType ?? 'Unknown'}</Descriptions.Item>
          <Descriptions.Item label="Cường độ tín hiệu">{detail.signalStrength ?? 0}%</Descriptions.Item>
          <Descriptions.Item label="Số lần thử lại">{detail.retryCount}</Descriptions.Item>
          <Descriptions.Item label="Sync cuối">{fmtDT(detail.lastSyncAt)}</Descriptions.Item>
        </Descriptions>

        {/* Lỗi */}
        {detail.errorCode && (
          <Alert
            style={{ marginTop:16, borderRadius:8 }}
            message={<>
              <strong>Mã lỗi: {detail.errorCode}</strong>
              {detail.retryCount > 0 && <Tag color="orange" style={{ marginLeft:8 }}>Đã thử {detail.retryCount}×</Tag>}
            </>}
            description={detail.errorMessage}
            type="error" showIcon
          />
        )}
      </Modal>
    );
  };

  // ──────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────
  const TAB_ITEMS = [
    { key:'overview',    label:<span><Activity size={13} style={{marginRight:5}}/>Tổng quan</span>,         children:<Screen1Overview/> },
    { key:'playing',     label:<span><Play     size={13} style={{marginRight:5}}/>Đang phát ({stats.playing})</span>, children:<Screen2Playing/> },
    { key:'error',       label:<span><XCircle  size={13} style={{marginRight:5}}/>Lỗi / Offline ({stats.failed})</span>, children:<Screen3Error/> },
    { key:'detail-view', label:<span><Eye      size={13} style={{marginRight:5}}/>Chi tiết & Timeline</span>, children:<Screen4Detail/> },
    { key:'filter',      label:<span><Filter   size={13} style={{marginRight:5}}/>Bộ lọc nâng cao</span>,   children:<Screen5Filter/> },
    { key:'retry',       label:<span><Send     size={13} style={{marginRight:5}}/>Gửi lại / Đồng bộ</span>, children:<Screen6Retry/> },
    { key:'history',     label:<span><History  size={13} style={{marginRight:5}}/>Lịch sử hoàn thành</span>, children:<Screen7History/> },
  ];

  return (
    <div style={{ padding:'0 32px 32px 28px', minHeight:'100%', background:'transparent' }}>
      {/* Page header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12, marginBottom:20 }}>
        <div>
          <Title level={3} style={{ margin:0, fontWeight:800, fontSize:'clamp(16px,2.5vw,22px)' }}>
            Thiết Bị Phản Hồi Bản Tin Điện Tử
          </Title>
          <Text type="secondary" style={{ fontSize:13 }}>
            Theo dõi trạng thái nhận, tải và phát bản tin của từng thiết bị — 7 chức năng giám sát
          </Text>
        </div>
        {stats.failed > 0 && (
          <Badge count={stats.failed} style={{ backgroundColor:'#DC2626' }}>
            <Button danger icon={<AlertTriangle size={14}/>} onClick={() => setActiveTab('error')}>
              {stats.failed} thiết bị lỗi
            </Button>
          </Badge>
        )}
      </div>

      {/* 7-tab layout */}
      <Tabs
        activeKey={activeTab}
        onChange={k => setActiveTab(k as any)}
        items={TAB_ITEMS}
        type="card"
        size="small"
        style={{ background:'#fff', borderRadius:12, padding:'0 12px 16px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}
        tabBarStyle={{ marginBottom:16 }}
      />

      <DetailModal/>

      <style>{`
        .row-playing { background: #F0FDF4 !important; }
        .ant-tabs-card > .ant-tabs-nav .ant-tabs-tab { border-radius: 6px 6px 0 0 !important; }
      `}</style>
    </div>
  );
};
