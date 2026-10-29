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
  Card,
  Row,
  Col,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { LayoutTemplate, ListOrdered, Plus, Trash2, Lock } from 'lucide-react';
import { useMtcData } from '../../context/MtcDataContext';
import { useAuth } from '../../context/AuthContext';
import type { TemplateItem, PlaylistItem } from '../../types';
import { formatDate } from '../../utils/formatters';

const { Title, Text, Paragraph } = Typography;

export const TemplatePlaylistManagerView: React.FC = () => {
  const { templates, playlists, mediaList, addTemplate, deleteTemplate, addPlaylist, deletePlaylist } =
    useMtcData();
  const { currentUser } = useAuth();

  const [isAddTplOpen, setIsAddTplOpen] = useState(false);
  const [isAddPlsOpen, setIsAddPlsOpen] = useState(false);

  const [tplForm] = Form.useForm();
  const [plsForm] = Form.useForm();

  // Media đã duyệt thuộc tổ chức
  // SRS USR-TPL-02: Media loại tần số FM và phát trực tiếp không đưa vào bản mẫu!
  const approvedMediaForTemplate = mediaList.filter(
    (m) =>
      m.orgId === currentUser.orgId &&
      m.status === 'approved' &&
      !['livestream', 'frequency'].includes(m.type)
  );

  const approvedMediaForPlaylist = mediaList.filter(
    (m) => m.orgId === currentUser.orgId && m.status === 'approved'
  );

  const templateColumns: ColumnsType<TemplateItem> = [
    {
      title: 'Tên bản mẫu (Template)',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: 'Tỷ lệ màn hình (SRS USR-TPL)',
      dataIndex: 'screenRatio',
      key: 'screenRatio',
      render: (r: string) => <Tag color="blue">{r}</Tag>,
      width: 140,
    },
    {
      title: 'Thành phần Media',
      key: 'media',
      render: (_, record) => (
        <div style={{ fontSize: 12 }}>
          {record.mediaList.map((m, i) => (
            <div key={i} style={{ color: '#4B5563' }}>
              • {m.title} ({m.area})
            </div>
          ))}
        </div>
      ),
    },
    {
      title: 'Trạng thái sử dụng',
      dataIndex: 'isUsed',
      key: 'isUsed',
      render: (used: boolean) => (
        <Tag color={used ? 'orange' : 'green'}>
          {used ? 'Đang dùng trong bản tin (Khóa)' : 'Chưa sử dụng'}
        </Tag>
      ),
      width: 190,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Button
          size="small"
          type="text"
          danger
          disabled={record.isUsed}
          icon={record.isUsed ? <Lock size={13} /> : <Trash2 size={13} />}
          onClick={() => {
            const res = deleteTemplate(record.id);
            if (res.success) message.success(res.message);
            else message.error(res.message);
          }}
          title={record.isUsed ? 'SRS USR-TPL-03: Không xóa template đã được sử dụng' : 'Xóa'}
        />
      ),
      width: 90,
    },
  ];

  const playlistColumns: ColumnsType<PlaylistItem> = [
    {
      title: 'Tên danh sách phát (Playlist)',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: 'Thời lượng tổng',
      dataIndex: 'totalDurationSec',
      key: 'totalDurationSec',
      render: (sec: number) => <Tag color="cyan">{sec} giây</Tag>,
      width: 130,
    },
    {
      title: 'Thứ tự phát media',
      key: 'items',
      render: (_, record) => (
        <div style={{ fontSize: 12 }}>
          {record.mediaItems.map((m, i) => (
            <span key={i} style={{ marginRight: 8, color: '#4B5563' }}>
              {i + 1}. {m.title} ({m.durationSec}s) {i < record.mediaItems.length - 1 ? '→' : ''}
            </span>
          ))}
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isUsed',
      key: 'isUsed',
      render: (used: boolean) => (
        <Tag color={used ? 'orange' : 'green'}>
          {used ? 'Đang dùng trong bản tin (Khóa)' : 'Chưa sử dụng'}
        </Tag>
      ),
      width: 190,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Button
          size="small"
          type="text"
          danger
          disabled={record.isUsed}
          icon={record.isUsed ? <Lock size={13} /> : <Trash2 size={13} />}
          onClick={() => {
            const res = deletePlaylist(record.id);
            if (res.success) message.success(res.message);
            else message.error(res.message);
          }}
          title={record.isUsed ? 'SRS USR-PLS-03: Không xóa playlist đã được sử dụng' : 'Xóa'}
        />
      ),
      width: 90,
    },
  ];

  return (
    <div style={{ padding: '24px 28px' }}>
      <div style={{ marginBottom: 20 }}>
        <Title level={3} style={{ margin: 0, fontWeight: 800 }}>
          Quản Lý Bản Mẫu & Danh Sách Phát (USR-TPL / USR-PLS)
        </Title>
        <Text type="secondary" style={{ fontSize: 13 }}>
          Tạo bố cục trình chiếu từ Media đã duyệt (Khóa sửa/xóa khi đã được gán vào Bản tin theo SRS mục 4.3.2)
        </Text>
      </div>

      <Tabs
        defaultActiveKey="templates"
        items={[
          {
            key: 'templates',
            label: (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <LayoutTemplate size={16} /> Bản mẫu (Template - USR-TPL)
              </span>
            ),
            children: (
              <div>
                <div style={{ textAlign: 'right', marginBottom: 16 }}>
                  <Button
                    type="primary"
                    icon={<Plus size={16} />}
                    style={{ background: '#FF7506', borderColor: '#FF7506' }}
                    onClick={() => setIsAddTplOpen(true)}
                  >
                    Tạo bản mẫu mới
                  </Button>
                </div>
                <Table
                  dataSource={templates}
                  columns={templateColumns}
                  rowKey="id"
                  pagination={false}
                  style={{
                    background: '#ffffff',
                    borderRadius: 12,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  }}
                />
              </div>
            ),
          },
          {
            key: 'playlists',
            label: (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <ListOrdered size={16} /> Danh sách phát (Playlist - USR-PLS)
              </span>
            ),
            children: (
              <div>
                <div style={{ textAlign: 'right', marginBottom: 16 }}>
                  <Button
                    type="primary"
                    icon={<Plus size={16} />}
                    style={{ background: '#FF7506', borderColor: '#FF7506' }}
                    onClick={() => setIsAddPlsOpen(true)}
                  >
                    Tạo danh sách phát mới
                  </Button>
                </div>
                <Table
                  dataSource={playlists}
                  columns={playlistColumns}
                  rowKey="id"
                  pagination={false}
                  style={{
                    background: '#ffffff',
                    borderRadius: 12,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  }}
                />
              </div>
            ),
          },
        ]}
      />

      {/* Modal Thêm Template (USR-TPL-02) */}
      <Modal
        title="Tạo Bản Mẫu Trình Chiếu (Template)"
        open={isAddTplOpen}
        onCancel={() => setIsAddTplOpen(false)}
        footer={null}
      >
        <Form
          form={tplForm}
          layout="vertical"
          initialValues={{ screenRatio: '16:9' }}
          onFinish={(values) => {
            const selectedMedia = approvedMediaForTemplate.find((m) => m.id === values.mediaId);
            addTemplate({
              orgId: currentUser.orgId,
              facilityId: currentUser.facilityId || 'fac-root-alta',
              name: values.name,
              screenRatio: values.screenRatio,
              mediaList: [
                {
                  mediaId: values.mediaId,
                  title: selectedMedia?.title || 'Media',
                  area: 'Toàn màn hình',
                },
              ],
            });
            message.success('Tạo bản mẫu thành công!');
            setIsAddTplOpen(false);
            tplForm.resetFields();
          }}
        >
          <Form.Item name="name" label="Tên bản mẫu" rules={[{ required: true }]}>
            <Input placeholder="Ví dụ: Bố cục Sảnh A 16:9" />
          </Form.Item>

          <Form.Item name="screenRatio" label="Tỷ lệ màn hình (SRS USR-TPL)">
            <Select>
              <Select.Option value="16:9">Ngang chuẩn 16:9</Select.Option>
              <Select.Option value="9:16">Dọc chuẩn 9:16 (Kiosk)</Select.Option>
              <Select.Option value="4:3">Màn hình vuông 4:3</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="mediaId"
            label="Chọn Media đã duyệt (Không hỗ trợ Livestream và Tần số FM theo SRS USR-TPL-02)"
            rules={[{ required: true }]}
          >
            <Select placeholder="Chọn file media">
              {approvedMediaForTemplate.map((m) => (
                <Select.Option key={m.id} value={m.id}>
                  {m.title} ({m.type})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsAddTplOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" style={{ background: '#FF7506', borderColor: '#FF7506' }}>
                Lưu bản mẫu
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Modal Thêm Playlist (USR-PLS-02) */}
      <Modal
        title="Tạo Danh Sách Phát (Playlist)"
        open={isAddPlsOpen}
        onCancel={() => setIsAddPlsOpen(false)}
        footer={null}
      >
        <Form
          form={plsForm}
          layout="vertical"
          onFinish={(values) => {
            const selectedMedia = approvedMediaForPlaylist.find((m) => m.id === values.mediaId);
            addPlaylist({
              orgId: currentUser.orgId,
              facilityId: currentUser.facilityId || 'fac-root-alta',
              name: values.name,
              mediaItems: [
                {
                  mediaId: values.mediaId,
                  title: selectedMedia?.title || 'Media',
                  durationSec: Number(values.duration) || 60,
                },
              ],
              totalDurationSec: Number(values.duration) || 60,
            });
            message.success('Tạo playlist thành công!');
            setIsAddPlsOpen(false);
            plsForm.resetFields();
          }}
        >
          <Form.Item name="name" label="Tên danh sách phát" rules={[{ required: true }]}>
            <Input placeholder="Ví dụ: Playlist Buổi Chiều Sảnh B" />
          </Form.Item>

          <Form.Item
            name="mediaId"
            label="Chọn Media đã duyệt đưa vào danh sách"
            rules={[{ required: true }]}
          >
            <Select placeholder="Chọn file media">
              {approvedMediaForPlaylist.map((m) => (
                <Select.Option key={m.id} value={m.id}>
                  {m.title} ({m.type})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="duration"
            label="Thời lượng phát (giây)"
            rules={[{ required: true }]}
            initialValue={60}
          >
            <Input type="number" min={5} />
          </Form.Item>

          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsAddPlsOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" style={{ background: '#FF7506', borderColor: '#FF7506' }}>
                Lưu playlist
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};
