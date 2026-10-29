import React, { useState } from 'react';
import {
  Modal,
  Tabs,
  Form,
  Input,
  Button,
  Avatar,
  Typography,
  message,
  Card,
  Row,
  Col,
  Tag,
} from 'antd';
import { User, Lock, Shield, History, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatRelativeTime } from '../../utils/formatters';

const { Text, Paragraph } = Typography;

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ open, onClose }) => {
  const { currentUser, updateUserProfile, twoFactor } = useAuth();

  // Tab 1: Thông tin tài khoản
  const [fullName, setFullName] = useState(currentUser.fullName);
  const [idCard, setIdCard] = useState(currentUser.idCard || '079205001122');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl || '');

  // Tab 2: Đổi mật khẩu
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLastChanged] = useState('2026-10-18T09:00:00Z');

  // Xử lý lưu thông tin cá nhân (SEC-ACC-01)
  const handleSaveProfile = () => {
    if (!fullName.trim()) {
      message.error('Họ và tên không được để trống.');
      return;
    }
    updateUserProfile({
      fullName,
      idCard,
      avatarUrl: avatarUrl || undefined,
    });
    message.success('Cập nhật thông tin tài khoản thành công!');
  };

  // Xử lý đổi mật khẩu theo chuẩn SEC-ACC-03
  const handleChangePassword = () => {
    if (!currentPassword) {
      message.error('Vui lòng nhập mật khẩu hiện tại.');
      return;
    }
    // Regex: ít nhất 8 ký tự, có hoa, thường, số, ký tự đặc biệt
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
    if (!strongPasswordRegex.test(newPassword)) {
      message.error(
        'Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm cả chữ thường, chữ hoa, số và ký tự đặc biệt (SRS SEC-ACC-03).'
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      message.error('Mật khẩu xác nhận không khớp.');
      return;
    }
    message.success('Đổi mật khẩu thành công! Vui lòng lưu lại mật khẩu mới.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={650}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              padding: 6,
              borderRadius: 8,
              background: '#FFF7E6',
              color: '#D46B08',
              display: 'flex',
            }}
          >
            <User size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>
              Thông Tin Tài Khoản & Bảo Mật (SEC-ACC)
            </div>
            <div style={{ fontSize: 12, color: '#8C8C8C', fontWeight: 400 }}>
              Quản lý hồ sơ, bảo mật 2FA và màn hình khôi phục tài khoản
            </div>
          </div>
        </div>
      }
    >
      <Tabs
        defaultActiveKey="info"
        items={[
          {
            key: 'info',
            label: (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <User size={16} /> Hồ sơ cá nhân (SEC-ACC-01)
              </span>
            ),
            children: (
              <div style={{ paddingTop: 8 }}>
                {/* Avatar Preview & URL */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                  <Avatar
                    src={avatarUrl}
                    size={64}
                    style={{ border: '2px solid #FF7506', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}
                  >
                    {fullName.charAt(0)}
                  </Avatar>
                  <div style={{ flex: 1 }}>
                    <Text strong style={{ fontSize: 13 }}>
                      Ảnh đại diện (PNG, JPG, Webp - SEC-ACC-01):
                    </Text>
                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      <Input
                        placeholder="Nhập đường dẫn ảnh đại diện..."
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        size="small"
                      />
                      <Button
                        size="small"
                        danger
                        onClick={() => {
                          setAvatarUrl('');
                          message.info('Đã xóa ảnh về mặc định (SEC-ACC-01)');
                        }}
                      >
                        Về mặc định
                      </Button>
                    </div>
                  </div>
                </div>

                <Row gutter={16}>
                  {/* Trường được sửa */}
                  <Col span={12}>
                    <Form.Item label={<Text strong>Họ và tên (Được sửa)</Text>}>
                      <Input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Nhập họ và tên"
                      />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item label={<Text strong>CCCD / CMND (Được sửa)</Text>}>
                      <Input
                        value={idCard}
                        onChange={(e) => setIdCard(e.target.value)}
                        placeholder="Số CCCD gắn chip"
                      />
                    </Form.Item>
                  </Col>

                  {/* Trường không được sửa theo SEC-ACC-02 */}
                  <Col span={12}>
                    <Form.Item
                      label={
                        <Text type="secondary">
                          Tên đăng nhập <Tag color="default">Không sửa</Tag>
                        </Text>
                      }
                    >
                      <Input value={currentUser.username} disabled />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item
                      label={
                        <Text type="secondary">
                          Vai trò người dùng <Tag color="orange">{currentUser.role}</Tag>
                        </Text>
                      }
                    >
                      <Input value={currentUser.role} disabled />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item
                      label={
                        <Text type="secondary">
                          Số điện thoại <Tag color="default">Không sửa</Tag>
                        </Text>
                      }
                    >
                      <Input value={currentUser.phone} disabled />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item
                      label={
                        <Text type="secondary">
                          Email <Tag color="default">Không sửa</Tag>
                        </Text>
                      }
                    >
                      <Input value={currentUser.email} disabled />
                    </Form.Item>
                  </Col>
                </Row>

                <div style={{ textAlign: 'right', marginTop: 10 }}>
                  <Button
                    type="primary"
                    onClick={handleSaveProfile}
                    style={{ background: '#FF7506', borderColor: '#FF7506' }}
                  >
                    Lưu thay đổi hồ sơ
                  </Button>
                </div>
              </div>
            ),
          },
          {
            key: 'password',
            label: (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <KeyRound size={16} /> Đổi mật khẩu (SEC-ACC-03)
              </span>
            ),
            children: (
              <div style={{ paddingTop: 8 }}>
                <Card
                  size="small"
                  style={{ marginBottom: 16, background: '#F8FAFC', borderColor: '#E2E8F0' }}
                >
                  <div style={{ fontSize: 12, color: '#64748B' }}>
                    <Text strong>Quy tắc mật khẩu an toàn:</Text>
                    <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                      <li>Độ dài tối thiểu 8 ký tự</li>
                      <li>Phải chứa chữ hoa, chữ thường, số và ký tự đặc biệt (!@#$%^...)</li>
                    </ul>
                  </div>
                </Card>

                <Form layout="vertical">
                  <Form.Item label="Mật khẩu hiện tại" required>
                    <Input.Password
                      placeholder="Nhập mật khẩu cũ"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </Form.Item>

                  <Form.Item label="Mật khẩu mới (SEC-ACC-03)" required>
                    <Input.Password
                      placeholder="Nhập mật khẩu mới thỏa mãn quy tắc"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </Form.Item>

                  <Form.Item label="Xác nhận mật khẩu mới" required>
                    <Input.Password
                      placeholder="Nhập lại mật khẩu mới"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </Form.Item>

                  <Button
                    type="primary"
                    block
                    onClick={handleChangePassword}
                    style={{ background: '#FF7506', borderColor: '#FF7506', marginTop: 8 }}
                  >
                    Cập nhật mật khẩu mới
                  </Button>
                </Form>
              </div>
            ),
          },
          {
            key: 'security',
            label: (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <History size={16} /> Đăng nhập & Khôi phục (SEC-ACC-04)
              </span>
            ),
            children: (
              <div style={{ paddingTop: 8 }}>
                <Card size="small" style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Text strong>Thay đổi mật khẩu lần cuối:</Text>
                      <div style={{ fontSize: 13, color: '#4B5563', marginTop: 2 }}>
                        {formatRelativeTime(passwordLastChanged)} (SRS 5.1 định dạng thời gian)
                      </div>
                    </div>
                    <Tag color="blue">Bảo vệ tốt</Tag>
                  </div>
                </Card>

                <Card size="small" style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Text strong>Xác thực hai bước (2FA):</Text>
                      <div style={{ fontSize: 13, color: '#4B5563', marginTop: 2 }}>
                        {twoFactor.isEnabled && twoFactor.enabledDate
                          ? `Đã bật ${formatRelativeTime(twoFactor.enabledDate)}`
                          : 'Đang tắt'}
                      </div>
                    </div>
                    <Tag color={twoFactor.isEnabled ? 'green' : 'orange'}>
                      {twoFactor.isEnabled ? 'Đã kích hoạt' : 'Chưa bật'}
                    </Tag>
                  </div>
                </Card>

                <Card size="small">
                  <div>
                    <Text strong>Hoạt động đăng nhập gần nhất (SRS 5.2):</Text>
                    <div style={{ fontSize: 13, color: '#4B5563', marginTop: 4 }}>
                      • Đăng nhập đầu tiên: <code>2026-10-13 09:00:00</code> (Chrome trên MacOS)
                    </div>
                    <div style={{ fontSize: 13, color: '#4B5563', marginTop: 2 }}>
                      • Đăng nhập gần nhất: <code>2026-10-20 17:10:00</code> (Chrome trên MacOS - Phiên hiện tại)
                    </div>
                  </div>
                </Card>
              </div>
            ),
          },
        ]}
      />
    </Modal>
  );
};
