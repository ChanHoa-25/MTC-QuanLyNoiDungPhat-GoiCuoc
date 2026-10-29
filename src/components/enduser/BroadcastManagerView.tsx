import React, { useState } from 'react';
import {
  Table,
  Button,
  Tag,
  Space,
  Input,
  Modal,
  Form,
  Select,
  Typography,
  message,
  Tabs,
  Card,
  Row,
  Col,
  TimePicker,
  DatePicker,
  Checkbox,
  Alert,
  Tooltip,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  CalendarDays,
  Plus,
  Play,
  Pause,
  StopCircle,
  XCircle,
  CheckCircle,
  Trash2,
  AlertTriangle,
  Clock,
  Tv,
  Layers,
  Flame,
} from 'lucide-react';
import dayjs from 'dayjs';
import { useMtcData } from '../../context/MtcDataContext';
import { useAuth } from '../../context/AuthContext';
import type { Broadcast, BroadcastStatus, BroadcastType } from '../../types';
import { formatDate } from '../../utils/formatters';
import { checkBroadcastConflicts, type ConflictResult } from '../../utils/scheduleConflict';

const { Title, Text, Paragraph } = Typography;

export const BroadcastManagerView: React.FC = () => {
  const {
    broadcasts,
    devices,
    facilities,
    mediaList,
    playlists,
    templates,
    addBroadcast,
    updateBroadcastStatus,
    approveBroadcast,
    rejectBroadcast,
    deleteBroadcast,
  } = useMtcData();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'all' | 'broadcasting' | 'scheduled' | 'pending'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedBrd, setSelectedBrd] = useState<Broadcast | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Conflict modal
  const [conflictData, setConflictData] = useState<ConflictResult | null>(null);
  const [pendingBroadcastData, setPendingBroadcastData] = useState<any | null>(null);
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);

  const [form] = Form.useForm();

  const isApproverOrAdmin = ['Approver', 'Administrator', 'SystemAdmin'].includes(currentUser.role);

  // Lọc cơ sở và thiết bị
  const currentOrgFacilities = facilities.filter((f) => f.orgId === currentUser.orgId);
  const facilityNamesMap: Record<string, string> = {};
  currentOrgFacilities.forEach((f) => {
    facilityNamesMap[f.id] = f.name;
  });

  const orgBroadcasts = broadcasts.filter((b) => b.orgId === currentUser.orgId);

  const filteredBroadcasts = orgBroadcasts
    .filter((b) => {
      if (activeTab === 'all') return true;
      if (activeTab === 'broadcasting') return b.status === 'broadcasting';
      if (activeTab === 'scheduled') return ['scheduled', 'upcoming'].includes(b.status);
      if (activeTab === 'pending') return b.status === 'pending';
      return true;
    })
    .filter((b) => b.title.toLowerCase().includes(searchTerm.toLowerCase()));

  // 9 trạng thái gộp (duyệt và phát) theo SRS 4.4
  const getStatusBadge = (status: BroadcastStatus) => {
    const map: Record<BroadcastStatus, { text: string; color: string }> = {
      pending: { text: 'Chờ duyệt', color: 'warning' },
      rejected: { text: 'Từ chối duyệt', color: 'error' },
      scheduled: { text: 'Chưa phát', color: 'blue' },
      upcoming: { text: 'Sắp tới lịch (15p)', color: 'processing' },
      broadcasting: { text: 'Đang phát', color: 'success' },
      paused: { text: 'Tạm ngưng', color: 'default' },
      waiting: { text: 'Chờ phát tiếp', color: 'cyan' },
      completed: { text: 'Đã kết thúc', color: 'default' },
      cancelled: { text: 'Đã hủy', color: 'magenta' },
    };
    const s = map[status] || { text: status, color: 'default' };
    return <Tag color={s.color}>{s.text}</Tag>;
  };

  // Mở modal từ chối (USR-BRD-07: Tối đa 510 ký tự)
  const handleOpenRejectModal = (brd: Broadcast) => {
    setSelectedBrd(brd);
    setRejectionReason('');
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = () => {
    if (!selectedBrd) return;
    if (!rejectionReason.trim()) {
      message.error('Vui lòng nhập lý do từ chối.');
      return;
    }
    rejectBroadcast(selectedBrd.id, rejectionReason, currentUser.fullName);
    message.warning('Đã từ chối duyệt bản tin phát sóng.');
    setIsRejectModalOpen(false);
  };

  // Kiểm tra trùng lịch và thêm bản tin (USR-BRD-02 & SRS trang 15)
  const handlePreSubmitBroadcast = (values: any) => {
    const dates = values.dateRange;
    const startDate = dates[0].format('YYYY-MM-DD');
    const endDate = dates[1].format('YYYY-MM-DD');
    const times = values.timeRange;
    const startTime = times[0].format('HH:mm');
    const endTime = times[1].format('HH:mm');

    const inputData = {
      title: values.title,
      type: values.type as BroadcastType,
      targetMode: values.targetMode as 'facility' | 'device',
      targetIds: values.targetIds as string[],
      startDate,
      endDate,
      startTime,
      endTime,
      repeatDays: values.repeatDays as number[],
    };

    // Kiểm tra xung đột lịch phát
    const conflictResult = checkBroadcastConflicts(
      inputData,
      orgBroadcasts,
      devices,
      facilityNamesMap
    );

    const fullPayload = {
      ...inputData,
      orgId: currentUser.orgId,
      facilityId: currentUser.facilityId || facilities[0].id,
      contentType: values.contentType,
      contentId: values.contentId,
      contentName: values.contentName || 'Nội dung phát',
      status: 'pending' as BroadcastStatus,
      creatorName: currentUser.fullName,
    };

    if (conflictResult.hasConflict) {
      setConflictData(conflictResult);
      setPendingBroadcastData(fullPayload);
      setIsConflictModalOpen(true);
    } else {
      // Không xung đột -> Lưu trực tiếp
      addBroadcast(fullPayload);
      message.success('Tạo bản tin thành công! Bản tin đang ở trạng thái Chờ duyệt.');
      setIsAddModalOpen(false);
      form.resetFields();
    }
  };

  // Xác nhận lưu bản tin kể cả khi có xung đột (đối với bản tin ưu tiên sẽ đè lên theo SRS)
  const handleProceedConflict = () => {
    if (pendingBroadcastData) {
      addBroadcast(pendingBroadcastData);
      message.success(
        pendingBroadcastData.type === 'priority'
          ? 'Đã tạo bản tin ưu tiên (sẽ tự động ghi đè bản tin trùng lịch).'
          : 'Đã tạo bản tin và ghi nhận cảnh báo xung đột.'
      );
      setIsConflictModalOpen(false);
      setIsAddModalOpen(false);
      form.resetFields();
    }
  };

  const columns: ColumnsType<Broadcast> = [
    {
      title: 'Tiêu đề bản tin',
      key: 'title',
      render: (_, record) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {record.type === 'priority' && (
              <Tooltip title="Bản tin ưu tiên: Được phát qua ngày, đè lên bản tin thường">
                <Tag color="red" style={{ padding: '0 4px', fontSize: 10, display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                  <Flame size={10} /> Ưu tiên
                </Tag>
              </Tooltip>
            )}
            <Text strong style={{ fontSize: 14, color: '#1F2937' }}>{record.title}</Text>
          </div>
          <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>
            Nguồn: <strong style={{ color: '#FF7506' }}>{record.contentName}</strong> ({record.contentType})
          </div>
        </div>
      ),
    },
    {
      title: 'Kiểu & Phạm vi phát',
      key: 'target',
      render: (_, record) => (
        <div style={{ fontSize: 12 }}>
          <Tag color="purple">
            {record.targetMode === 'facility' ? 'Theo Cơ sở' : 'Theo Thiết bị'}
          </Tag>
          <span style={{ color: '#4B5563' }}>({record.targetIds.length} mục tiêu)</span>
        </div>
      ),
      width: 140,
    },
    {
      title: 'Lịch phát (Giờ & Ngày)',
      key: 'schedule',
      render: (_, record) => (
        <div style={{ fontSize: 11 }}>
          <div style={{ fontWeight: 600, color: '#111827' }}>
            <Clock size={11} style={{ marginRight: 4, display: 'inline' }} />
            {record.startTime} - {record.endTime}
          </div>
          <div style={{ color: '#6B7280' }}>
            {formatDate(record.startDate)} → {formatDate(record.endDate)}
          </div>
        </div>
      ),
      width: 170,
    },
    {
      title: 'Trạng thái (9 trạng thái)',
      dataIndex: 'status',
      key: 'status',
      render: (st: BroadcastStatus) => getStatusBadge(st),
      width: 150,
    },
    {
      title: 'Người tạo',
      dataIndex: 'creatorName',
      key: 'creatorName',
      render: (name: string) => <span style={{ fontSize: 12 }}>{name}</span>,
      width: 120,
    },
    {
      title: 'Thao tác điều khiển',
      key: 'action',
      render: (_, record) => (
        <Space size={4}>
          {/* Duyệt & Từ chối dành cho Approver */}
          {record.status === 'pending' && isApproverOrAdmin && (
            <>
              <Button
                size="small"
                type="primary"
                style={{ background: '#10B981', borderColor: '#10B981' }}
                onClick={() => {
                  approveBroadcast(record.id, currentUser.fullName);
                  message.success(`Đã duyệt bản tin [${record.title}].`);
                }}
              >
                Duyệt
              </Button>
              <Button
                size="small"
                danger
                onClick={() => handleOpenRejectModal(record)}
              >
                Từ chối
              </Button>
            </>
          )}

          {/* Dừng phát (USR-BRD-09: chỉ với Đang phát, không áp dụng cho bản tin ưu tiên) */}
          {record.status === 'broadcasting' && record.type !== 'priority' && (
            <Button
              size="small"
              icon={<Pause size={13} />}
              onClick={() => {
                updateBroadcastStatus(record.id, 'paused');
                message.info(`Đã tạm dừng phát bản tin [${record.title}].`);
              }}
              title="Tạm ngưng phát (USR-BRD-09)"
            />
          )}

          {/* Tiếp tục phát (USR-BRD-10: chỉ với Tạm ngưng) */}
          {record.status === 'paused' && (
            <Button
              size="small"
              icon={<Play size={13} color="#059669" />}
              onClick={() => {
                updateBroadcastStatus(record.id, 'broadcasting');
                message.success(`Đã tiếp tục phát bản tin [${record.title}].`);
              }}
              title="Tiếp tục phát (USR-BRD-10)"
            />
          )}

          {/* Xóa bản tin (USR-BRD-05: chỉ xóa khi Chờ duyệt, Từ chối hoặc Đã hủy) */}
          {['pending', 'rejected', 'cancelled'].includes(record.status) && (
            <Button
              size="small"
              type="text"
              danger
              icon={<Trash2 size={13} />}
              onClick={() => {
                const res = deleteBroadcast(record.id);
                if (res.success) message.success(res.message);
                else message.error(res.message);
              }}
            />
          )}
        </Space>
      ),
      width: 180,
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
            Quản Lý Bản Tin & Lịch Phát (USR-BRD)
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Lập lịch phát sóng, luồng phê duyệt, kiểm tra xung đột trùng lịch tự động và 9 trạng thái gộp theo SRS mục 4.4
          </Text>
        </div>

        <Space>
          <Input.Search
            placeholder="Tìm theo tiêu đề bản tin..."
            style={{ width: 240 }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <Button
            type="primary"
            icon={<Plus size={16} />}
            style={{ background: '#FF7506', borderColor: '#FF7506' }}
            onClick={() => setIsAddModalOpen(true)}
          >
            Tạo bản tin mới
          </Button>
        </Space>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={(k) => setActiveTab(k as any)}
        items={[
          { key: 'all', label: `Tất cả bản tin (${orgBroadcasts.length})` },
          {
            key: 'broadcasting',
            label: `Đang phát (${orgBroadcasts.filter((b) => b.status === 'broadcasting').length})`,
          },
          {
            key: 'scheduled',
            label: `Chưa phát / Sắp tới (${orgBroadcasts.filter((b) => ['scheduled', 'upcoming'].includes(b.status)).length})`,
          },
          {
            key: 'pending',
            label: `Chờ duyệt (${orgBroadcasts.filter((b) => b.status === 'pending').length})`,
          },
        ]}
      />

      <Table
        dataSource={filteredBroadcasts}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 8 }}
        style={{
          background: '#ffffff',
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      />

      {/* Modal Tạo Bản Tin Mới với Kiểm Tra Trùng Lịch Xung Đột (USR-BRD-02) */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CalendarDays size={18} color="#FF7506" />
            <span>Tạo Bản Tin Phát Sóng Mới (SRS USR-BRD-02)</span>
          </div>
        }
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        footer={null}
        width={680}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            type: 'regular',
            targetMode: 'device',
            contentType: 'media',
            repeatDays: [1, 2, 3, 4, 5],
          }}
          onFinish={handlePreSubmitBroadcast}
        >
          <Form.Item
            name="title"
            label="Tiêu đề bản tin"
            rules={[{ required: true, message: 'Nhập tiêu đề bản tin' }]}
          >
            <Input placeholder="Ví dụ: Lịch Chiếu Video Quảng Cáo Giờ Cao Điểm" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="type"
                label="Loại bản tin (SRS: Thường hoặc Ưu tiên)"
                rules={[{ required: true }]}
              >
                <Select>
                  <Select.Option value="regular">Bản tin thường</Select.Option>
                  <Select.Option value="priority">🔥 Bản tin ưu tiên (Ghi đè, phát qua ngày)</Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="targetMode"
                label="Kiểu phát (SRS: Theo cơ sở hoặc theo thiết bị)"
                rules={[{ required: true }]}
              >
                <Select>
                  <Select.Option value="device">Theo Thiết bị cụ thể</Select.Option>
                  <Select.Option value="facility">Theo Cơ sở / Địa bàn</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            noStyle
            shouldUpdate={(prev, cur) => prev.targetMode !== cur.targetMode}
          >
            {({ getFieldValue }) => {
              const mode = getFieldValue('targetMode');
              return mode === 'facility' ? (
                <Form.Item
                  name="targetIds"
                  label="Chọn cơ sở phát sóng:"
                  rules={[{ required: true, message: 'Chọn ít nhất 1 cơ sở' }]}
                >
                  <Select mode="multiple" placeholder="Chọn các cơ sở trực thuộc">
                    {currentOrgFacilities.map((f) => (
                      <Select.Option key={f.id} value={f.id}>
                        {f.name} ({f.code})
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              ) : (
                <Form.Item
                  name="targetIds"
                  label="Chọn thiết bị phát sóng:"
                  rules={[{ required: true, message: 'Chọn ít nhất 1 thiết bị' }]}
                >
                  <Select mode="multiple" placeholder="Chọn các màn hình LED/LCD">
                    {devices
                      .filter((d) => d.orgId === currentUser.orgId)
                      .map((d) => (
                        <Select.Option key={d.id} value={d.id}>
                          {d.name} ({d.deviceCode})
                        </Select.Option>
                      ))}
                  </Select>
                </Form.Item>
              );
            }}
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="contentType"
                label="Nguồn nội dung (Media / Template / Playlist)"
                rules={[{ required: true }]}
              >
                <Select>
                  <Select.Option value="media">Media đơn lẻ (Đã duyệt)</Select.Option>
                  <Select.Option value="playlist">Danh sách phát (Playlist)</Select.Option>
                  <Select.Option value="template">Bản mẫu (Template)</Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="contentId"
                label="Chọn nội dung cụ thể"
                rules={[{ required: true, message: 'Chọn nội dung phát' }]}
              >
                <Select placeholder="Chọn file media đã duyệt">
                  {mediaList
                    .filter((m) => m.orgId === currentUser.orgId && m.status === 'approved')
                    .map((m) => (
                      <Select.Option key={m.id} value={m.id}>
                        {m.title} ({m.type})
                      </Select.Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="dateRange"
                label="Khoảng ngày phát sóng"
                rules={[{ required: true, message: 'Chọn khoảng ngày' }]}
              >
                <DatePicker.RangePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="timeRange"
                label="Khung giờ phát trong ngày (HH:mm)"
                rules={[{ required: true, message: 'Chọn khung giờ' }]}
              >
                <TimePicker.RangePicker format="HH:mm" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="repeatDays"
            label="Lặp lại vào các ngày trong tuần"
          >
            <Checkbox.Group
              options={[
                { label: 'T2', value: 1 },
                { label: 'T3', value: 2 },
                { label: 'T4', value: 3 },
                { label: 'T5', value: 4 },
                { label: 'T6', value: 5 },
                { label: 'T7', value: 6 },
                { label: 'CN', value: 0 },
              ]}
            />
          </Form.Item>

          <div style={{ textAlign: 'right', marginTop: 12 }}>
            <Space>
              <Button onClick={() => setIsAddModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" style={{ background: '#FF7506', borderColor: '#FF7506' }}>
                Kiểm tra lịch & Lưu bản tin
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Modal Cảnh Báo Trùng Lịch Phát Sóng (SRS USR-BRD-02 & Trang 15) */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={20} color="#DC2626" />
            <span style={{ color: '#DC2626' }}>Phát Hiện Xung Đột Trùng Lịch Bản Tin! (SRS USR-BRD-02)</span>
          </div>
        }
        open={isConflictModalOpen}
        onCancel={() => setIsConflictModalOpen(false)}
        footer={[
          <Button key="back" onClick={() => setIsConflictModalOpen(false)}>
            Quay lại chỉnh sửa lịch
          </Button>,
          <Button
            key="submit"
            type="primary"
            danger={pendingBroadcastData?.type !== 'priority'}
            style={{
              background: pendingBroadcastData?.type === 'priority' ? '#FF7506' : undefined,
              borderColor: pendingBroadcastData?.type === 'priority' ? '#FF7506' : undefined,
            }}
            onClick={handleProceedConflict}
          >
            {pendingBroadcastData?.type === 'priority'
              ? 'Xác nhận ghi đè (Bản tin ưu tiên)'
              : 'Vẫn lưu bản tin (Báo trùng)'}
          </Button>,
        ]}
        width={650}
      >
        <Alert
          message="Quy tắc kiểm tra trùng lịch (SRS Mục 4.4):"
          description="Hệ thống phát hiện thiết bị hoặc cơ sở được chọn đang có lịch phát trùng giờ với các bản tin khác."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />

        {conflictData?.conflictBroadcasts.map((item, idx) => (
          <Card size="small" key={idx} style={{ marginBottom: 10, background: '#FFFBEB', borderColor: '#FDE68A' }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#92400E' }}>
              Xung đột với bản tin: "{item.broadcast.title}"
            </div>
            <div style={{ fontSize: 12, color: '#4B5563', margin: '4px 0' }}>
              {item.reason}
            </div>
            <div style={{ fontSize: 11, color: '#6B7280' }}>
              Thiết bị bị ảnh hưởng: {item.conflictedDeviceNames.join(', ')}
            </div>
          </Card>
        ))}
      </Modal>

      {/* Modal Từ Chối Duyệt Bản Tin (USR-BRD-07: Tối đa 510 ký tự) */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <XCircle size={18} color="#DC2626" />
            <span>Từ Chối Duyệt Bản Tin (SRS USR-BRD-07)</span>
          </div>
        }
        open={isRejectModalOpen}
        onCancel={() => setIsRejectModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsRejectModalOpen(false)}>Hủy</Button>,
          <Button key="reject" danger type="primary" onClick={handleConfirmReject}>
            Xác nhận từ chối
          </Button>,
        ]}
      >
        <Paragraph style={{ fontSize: 13, color: '#4B5563' }}>
          Nhập lý do từ chối duyệt bản tin [<strong>{selectedBrd?.title}</strong>] (tối đa 510 ký tự theo quy định SRS).
        </Paragraph>
        <Form.Item label={<Text strong>Lý do từ chối:</Text>}>
          <Input.TextArea
            rows={4}
            maxLength={510}
            showCount
            placeholder="Nêu rõ lý do không duyệt bản tin..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
        </Form.Item>
      </Modal>
    </div>
  );
};
