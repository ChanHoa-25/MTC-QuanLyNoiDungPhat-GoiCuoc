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
  Progress,
  Tooltip,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  Film,
  Plus,
  Share2,
  CheckCircle,
  XCircle,
  Trash2,
  Radio,
  FileVideo,
  FileAudio,
  Image as ImageIcon,
  Tv,
  Clock,
  Send,
  CornerDownRight,
} from 'lucide-react';
import { useMtcData } from '../../context/MtcDataContext';
import { useAuth } from '../../context/AuthContext';
import type { MediaItem, MediaType } from '../../types';
import { formatStorage, formatDate, formatRelativeTime } from '../../utils/formatters';

const { Title, Text, Paragraph } = Typography;

export const MediaManagerView: React.FC = () => {
  const {
    mediaList,
    facilities,
    addMedia,
    deleteMedia,
    approveMedia,
    rejectMedia,
    shareMediaToFacility,
  } = useMtcData();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [targetFacilityId, setTargetFacilityId] = useState('');

  // Upload simulation progress
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const [form] = Form.useForm();

  const isApproverOrAdmin = ['Approver', 'Administrator', 'SystemAdmin'].includes(currentUser.role);

  // Lọc media thuộc tổ chức
  const orgMedia = mediaList.filter((m) => m.orgId === currentUser.orgId);

  const filteredMedia = orgMedia
    .filter((m) => {
      if (activeTab === 'all') return true;
      return m.status === activeTab;
    })
    .filter(
      (m) =>
        m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Mở modal từ chối (USR-MED-08: Tối đa 510 ký tự, tự xóa sau 24h)
  const handleOpenRejectModal = (media: MediaItem) => {
    setSelectedMedia(media);
    setRejectionReason('');
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = () => {
    if (!selectedMedia) return;
    if (!rejectionReason.trim()) {
      message.error('Vui lòng nhập lý do từ chối duyệt.');
      return;
    }
    rejectMedia(selectedMedia.id, rejectionReason, currentUser.fullName);
    message.warning(
      'Đã từ chối duyệt media. Theo quy tắc USR-MED-08, file sẽ tự xóa sau 24h kể từ thời điểm này.'
    );
    setIsRejectModalOpen(false);
  };

  // Mở modal chia sẻ (USR-MED-09: Chỉ chia sẻ media đã duyệt cho cấp gần nhất)
  const handleOpenShareModal = (media: MediaItem) => {
    setSelectedMedia(media);
    setIsShareModalOpen(true);
  };

  const handleConfirmShare = () => {
    if (!selectedMedia || !targetFacilityId) return;
    shareMediaToFacility(selectedMedia.id, targetFacilityId);
    message.success('Đã chia sẻ nguồn tin thành công cho cơ sở cấp dưới.');
    setIsShareModalOpen(false);
  };

  // Xóa media (USR-MED-06)
  const handleDeleteMedia = (media: MediaItem) => {
    if (!isApproverOrAdmin && media.status === 'approved') {
      message.error('Người tạo (Creator) chỉ được xóa media chưa duyệt (SRS USR-MED-06).');
      return;
    }
    const res = deleteMedia(media.id);
    if (res.success) {
      message.success(res.message);
    } else {
      message.error(res.message);
    }
  };

  const getMediaIcon = (type: MediaType) => {
    switch (type) {
      case 'video':
        return <FileVideo size={18} color="#FF7506" />;
      case 'audio':
        return <FileAudio size={18} color="#10B981" />;
      case 'image':
        return <ImageIcon size={18} color="#3B82F6" />;
      case 'livestream':
        return <Tv size={18} color="#8B5CF6" />;
      case 'frequency':
        return <Radio size={18} color="#EC4899" />;
    }
  };

  const columns: ColumnsType<MediaItem> = [
    {
      title: 'Tên nguồn tin / Media',
      key: 'title',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              padding: 8,
              borderRadius: 8,
              background: '#F9FAFB',
              border: '1px solid #E5E7EB',
              display: 'flex',
            }}
          >
            {getMediaIcon(record.type)}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {/* Media nhận từ cấp trên chia sẻ xuống có biểu tượng ở góc trái theo SRS 4.3.1 */}
              {record.sharedFromFacilityId && (
                <Tooltip title="Nguồn tin nhận từ cơ sở cấp trên chia sẻ xuống">
                  <Tag color="purple" style={{ padding: '0 4px', fontSize: 10 }}>
                    <CornerDownRight size={10} style={{ marginRight: 2 }} /> Được chia sẻ
                  </Tag>
                </Tooltip>
              )}
              <Text strong style={{ fontSize: 13, color: '#1F2937' }}>
                {record.title}
              </Text>
            </div>
            <div style={{ fontSize: 11, color: '#6B7280' }}>
              Người tạo: {record.uploaderName} • {formatRelativeTime(record.createdAt)}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Loại & Định dạng',
      key: 'type',
      render: (_, record) => {
        const typeLabels: Record<MediaType, string> = {
          video: 'Video MP4',
          audio: 'Âm thanh MP3/WAV',
          image: 'Hình ảnh PNG/JPG',
          livestream: 'Phát trực tiếp',
          frequency: `Tần số ${record.frequencyHz || 'Hz'}`,
        };
        return <Tag color="blue">{typeLabels[record.type]}</Tag>;
      },
      width: 170,
    },
    {
      title: 'Dung lượng',
      dataIndex: 'fileSizeMB',
      key: 'fileSizeMB',
      render: (mb: number) => <span>{mb > 0 ? formatStorage(mb) : 'Luồng sóng'}</span>,
      width: 110,
    },
    {
      title: 'Trạng thái (4 trạng thái)',
      dataIndex: 'status',
      key: 'status',
      render: (st: MediaItem['status'], record) => {
        if (st === 'approved') return <Tag color="success">Đã duyệt</Tag>;
        if (st === 'pending') return <Tag color="warning">Chờ duyệt</Tag>;
        if (st === 'processing') return <Tag color="processing">Đang tải lên (1GB)</Tag>;
        return (
          <Tooltip title={`Lý do: ${record.rejectionReason}. Tự xóa sau 24h từ ${record.rejectedAt ? formatRelativeTime(record.rejectedAt) : ''}`}>
            <Tag color="error">Từ chối duyệt (24h)</Tag>
          </Tooltip>
        );
      },
      width: 150,
    },
    {
      title: 'Thao tác nghiệp vụ',
      key: 'action',
      render: (_, record) => (
        <Space size={4}>
          {/* Duyệt & Từ chối dành cho Approver / Admin */}
          {record.status === 'pending' && isApproverOrAdmin && (
            <>
              <Button
                size="small"
                type="primary"
                icon={<CheckCircle size={13} />}
                style={{ background: '#10B981', borderColor: '#10B981' }}
                onClick={() => {
                  approveMedia(record.id, currentUser.fullName);
                  message.success(`Đã phê duyệt media [${record.title}].`);
                }}
              >
                Duyệt
              </Button>
              <Button
                size="small"
                danger
                icon={<XCircle size={13} />}
                onClick={() => handleOpenRejectModal(record)}
              >
                Từ chối
              </Button>
            </>
          )}

          {/* Chia sẻ media đã duyệt cho cấp dưới theo USR-MED-09 */}
          {record.status === 'approved' && (
            <Button
              size="small"
              icon={<Share2 size={13} color="#6366F1" />}
              onClick={() => handleOpenShareModal(record)}
              title="Chia sẻ cho cơ sở cấp dưới (USR-MED-09)"
            >
              Chia sẻ
            </Button>
          )}

          <Button
            size="small"
            type="text"
            danger
            icon={<Trash2 size={14} />}
            onClick={() => handleDeleteMedia(record)}
          />
        </Space>
      ),
      width: 200,
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
            Quản Lý Nguồn Tin & Media (USR-SRC / USR-MED)
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Quản lý 5 loại media (Video, Audio, Ảnh, Livestream, Tần số Hz), quy trình kiểm duyệt và chia sẻ cơ sở cấp dưới
          </Text>
        </div>

        <Space>
          <Input.Search
            placeholder="Tìm theo tên media..."
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
            Thêm nguồn tin mới
          </Button>
        </Space>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={(k) => setActiveTab(k as any)}
        items={[
          { key: 'all', label: `Tất cả (${orgMedia.length})` },
          {
            key: 'pending',
            label: `Chờ duyệt (${orgMedia.filter((m) => m.status === 'pending').length})`,
          },
          {
            key: 'approved',
            label: `Đã duyệt (${orgMedia.filter((m) => m.status === 'approved').length})`,
          },
          {
            key: 'rejected',
            label: `Bị từ chối (${orgMedia.filter((m) => m.status === 'rejected').length})`,
          },
        ]}
      />

      <Table
        dataSource={filteredMedia}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 8 }}
        style={{
          background: '#ffffff',
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      />

      {/* Modal Thêm Nguồn Tin (4 cách thêm theo SRS 4.3.1) */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Film size={18} color="#FF7506" />
            <span>Thêm Nguồn Tin Mới (SRS USR-MED-02)</span>
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
            type: 'video',
            method: 'file',
          }}
          onFinish={(values) => {
            setIsUploading(true);
            setUploadProgress(20);

            // Mô phỏng tải khối (chunked) cho file lên tới 1GB theo SRS mục 8.2
            setTimeout(() => setUploadProgress(65), 500);
            setTimeout(() => {
              setUploadProgress(100);
              addMedia({
                orgId: currentUser.orgId,
                facilityId: currentUser.facilityId || facilities[0].id,
                title: values.title,
                type: values.type,
                format: values.type === 'video' ? 'mp4' : values.type === 'audio' ? 'mp3' : 'png',
                fileSizeMB: values.type === 'video' ? 120 : values.type === 'audio' ? 15 : 5,
                url: values.url || 'https://assets.mixkit.co/sample.mp4',
                status: 'pending',
                uploaderName: currentUser.fullName,
                createdAt: new Date().toISOString(),
                frequencyHz: values.frequencyHz,
              });
              setIsUploading(false);
              message.success('Đã tải lên media thành công! Nguồn tin đang ở trạng thái Chờ duyệt.');
              setIsAddModalOpen(false);
              form.resetFields();
            }, 1000);
          }}
        >
          <Form.Item
            name="title"
            label="Tiêu đề nguồn tin"
            rules={[{ required: true, message: 'Nhập tiêu đề nguồn tin' }]}
          >
            <Input placeholder="Ví dụ: Video Quảng bá Du lịch Biển 4K" />
          </Form.Item>

          <Form.Item
            name="type"
            label="Loại nguồn tin (5 loại theo SRS 4.3.1)"
            rules={[{ required: true }]}
          >
            <Select>
              <Select.Option value="video">Video (MP4 - Tối đa 1 GB)</Select.Option>
              <Select.Option value="audio">Âm thanh (MP3, WAV)</Select.Option>
              <Select.Option value="image">Hình ảnh (PNG, JPG, JPEG)</Select.Option>
              <Select.Option value="livestream">Phát trực tiếp (Live Stream HLS/RTMP)</Select.Option>
              <Select.Option value="frequency">Tần số kênh phát (Hz / FM)</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="method"
            label="Phương thức nạp nguồn (4 cách theo SRS 4.3.1)"
          >
            <Select>
              <Select.Option value="file">Tải lên tệp tin từ máy tính (Chunked upload 1GB)</Select.Option>
              <Select.Option value="url">Tải từ đường dẫn URL</Select.Option>
              <Select.Option value="stream">Liên kết phát trực tiếp</Select.Option>
              <Select.Option value="frequency">Tần số kênh (Hz)</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="url" label="Đường dẫn liên kết hoặc luồng phát (nếu có)">
            <Input placeholder="https://..." />
          </Form.Item>

          <Form.Item name="frequencyHz" label="Tần số (Nếu chọn loại tần số Hz)">
            <Input placeholder="Ví dụ: 99.9 MHz" />
          </Form.Item>

          {isUploading && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>
                Đang truyền tải khối dữ liệu (Chunked upload): {uploadProgress}%
              </div>
              <Progress percent={uploadProgress} strokeColor="#FF7506" />
            </div>
          )}

          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsAddModalOpen(false)}>Hủy</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={isUploading}
                style={{ background: '#FF7506', borderColor: '#FF7506' }}
              >
                Nạp nguồn tin
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Modal Từ Chối Phê Duyệt (USR-MED-08: Tối đa 510 ký tự, tự xóa sau 24h) */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <XCircle size={18} color="#DC2626" />
            <span>Từ Chối Duyệt Nguồn Tin (SRS USR-MED-08)</span>
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
          Media [<strong>{selectedMedia?.title}</strong>] sẽ bị chuyển sang trạng thái <strong>Từ chối duyệt</strong>. Theo quy tắc <strong>USR-MED-08</strong>, hệ thống sẽ tự động xóa sau 24 giờ kể từ lúc từ chối và gửi thông báo lý do cho người tạo.
        </Paragraph>

        <Form.Item label={<Text strong>Lý do từ chối (Tối đa 510 ký tự theo SRS):</Text>}>
          <Input.TextArea
            rows={4}
            maxLength={510}
            showCount
            placeholder="Nhập chi tiết lý do từ chối (độ phân giải, nội dung chưa đạt chuẩn...)"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
        </Form.Item>
      </Modal>

      {/* Modal Chia Sẻ Media Cho Cơ Sở Cấp Dưới (USR-MED-09) */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Share2 size={18} color="#6366F1" />
            <span>Chia Sẻ Media Cho Địa Bàn Cấp Dưới (SRS USR-MED-09)</span>
          </div>
        }
        open={isShareModalOpen}
        onCancel={() => setIsShareModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsShareModalOpen(false)}>Hủy</Button>,
          <Button
            key="share"
            type="primary"
            style={{ background: '#6366F1', borderColor: '#6366F1' }}
            onClick={handleConfirmShare}
          >
            Chia sẻ ngay
          </Button>,
        ]}
      >
        <Paragraph style={{ fontSize: 13, color: '#4B5563' }}>
          Chỉ chia sẻ media đã duyệt cho địa bàn cấp gần nhất bên dưới. Cơ sở nhận có thể tiếp nhận hoặc xóa (USR-MED-09 & USR-SHR).
        </Paragraph>

        <Form.Item label="Chọn cơ sở trực thuộc nhận nguồn tin:" required>
          <Select
            placeholder="Chọn cơ sở cấp dưới"
            value={targetFacilityId}
            onChange={(val) => setTargetFacilityId(val)}
          >
            {facilities
              .filter((f) => f.orgId === currentUser.orgId)
              .map((f) => (
                <Select.Option key={f.id} value={f.id}>
                  {f.name} ({f.code})
                </Select.Option>
              ))}
          </Select>
        </Form.Item>
      </Modal>
    </div>
  );
};
