import React, { useState } from 'react';
import {
  Modal,
  Tabs,
  Button,
  Input,
  Typography,
  message,
  Switch,
  Card,
  Row,
  Col,
  Checkbox,
  Tag,
  Space,
} from 'antd';
import {
  ShieldCheck,
  QrCode,
  Key,
  Smartphone,
  Copy,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatRelativeTime } from '../../utils/formatters';

const { Text, Paragraph } = Typography;

interface TwoFactorSetupModalProps {
  open: boolean;
  onClose: () => void;
}

export const TwoFactorSetupModal: React.FC<TwoFactorSetupModalProps> = ({ open, onClose }) => {
  const {
    twoFactor,
    enableTwoFactor,
    disableTwoFactor,
    useBackupCode,
    regenerateBackupCodes,
    trustCurrentDevice,
  } = useAuth();

  const [otpCode, setOtpCode] = useState('');
  const [backupInput, setBackupInput] = useState('');
  const [dontAskAgain, setDontAskAgain] = useState(false);

  // Sinh QR Code dựa trên Secret 32 ký tự theo SRS 5.2
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=otpauth://totp/MTC:${twoFactor.secretKey}?secret=${twoFactor.secretKey}&issuer=AltaMedia`;

  const handleVerifyOtp = () => {
    if (otpCode.length !== 6 || !/^\d+$/.test(otpCode)) {
      message.error('Vui lòng nhập đúng mã xác thực gồm 6 chữ số (SRS SEC-2FA-LGN-02).');
      return;
    }
    enableTwoFactor(twoFactor.secretKey);
    if (dontAskAgain) {
      trustCurrentDevice();
    }
    message.success('Xác thực hai bước (2FA) qua ứng dụng thành công!');
    setOtpCode('');
  };

  const handleVerifyBackup = () => {
    if (!backupInput) {
      message.error('Vui lòng nhập mã dự phòng.');
      return;
    }
    const success = useBackupCode(backupInput);
    if (success) {
      if (dontAskAgain) {
        trustCurrentDevice();
      }
      message.success('Xác thực bằng mã dự phòng thành công! Mã này đã được đánh dấu sử dụng.');
      setBackupInput('');
    } else {
      message.error('Mã dự phòng không chính xác hoặc đã được sử dụng trước đó.');
    }
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(twoFactor.secretKey);
    message.success('Đã sao chép mã 32 ký tự vào clipboard.');
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={680}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              padding: 6,
              borderRadius: 8,
              background: twoFactor.isEnabled ? '#ECFDF5' : '#FEF3C7',
              color: twoFactor.isEnabled ? '#059669' : '#D97706',
              display: 'flex',
            }}
          >
            <ShieldCheck size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Xác Thực Hai Bước (2FA - SEC-2FA)</div>
            <div style={{ fontSize: 12, color: '#6B7280', fontWeight: 400 }}>
              Bảo vệ tài khoản bằng ứng dụng Authenticator hoặc Mã dự phòng
            </div>
          </div>
        </div>
      }
    >
      <div style={{ marginTop: 12 }}>
        {/* Trạng thái Bật/Tắt 2FA */}
        <Card
          size="small"
          style={{
            marginBottom: 20,
            background: twoFactor.isEnabled ? '#F0FDF4' : '#F9FAFB',
            borderColor: twoFactor.isEnabled ? '#BBF7D0' : '#E5E7EB',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>
                Trạng thái: {twoFactor.isEnabled ? 'Đã kích hoạt' : 'Chưa kích hoạt'}
              </div>
              <div style={{ fontSize: 12, color: '#6B7280' }}>
                {twoFactor.isEnabled && twoFactor.enabledDate
                  ? `Đã bật ${formatRelativeTime(twoFactor.enabledDate)} (SRS SEC-ACC-04)`
                  : 'Mặc định tài khoản mới tắt 2FA, người dùng tự bật để nâng cao an toàn.'}
              </div>
            </div>
            <Switch
              checked={twoFactor.isEnabled}
              onChange={(checked) => {
                if (!checked) {
                  disableTwoFactor();
                  message.info('Đã tắt xác thực hai bước.');
                } else {
                  enableTwoFactor(twoFactor.secretKey);
                  message.success('Đã bật xác thực hai bước.');
                }
              }}
            />
          </div>
        </Card>

        <Tabs
          defaultActiveKey="app"
          items={[
            {
              key: 'app',
              label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Smartphone size={16} /> Ứng dụng xác thực (TOTP)
                </span>
              ),
              children: (
                <div style={{ paddingTop: 8 }}>
                  <Row gutter={24}>
                    <Col span={10} style={{ textAlign: 'center' }}>
                      <div
                        style={{
                          border: '1px solid #E5E7EB',
                          padding: 12,
                          borderRadius: 12,
                          background: '#ffffff',
                          display: 'inline-block',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                        }}
                      >
                        <img
                          src={qrUrl}
                          alt="2FA QR Code"
                          style={{ width: 170, height: 170, display: 'block' }}
                        />
                      </div>
                      <div style={{ marginTop: 8, fontSize: 11, color: '#6B7280' }}>
                        Quét mã bằng Google Authenticator hoặc Authy
                      </div>
                    </Col>

                    <Col span={14}>
                      <div style={{ marginBottom: 12 }}>
                        <Text strong style={{ fontSize: 13 }}>
                          Mã thiết lập bí mật 32 ký tự (SRS 5.2):
                        </Text>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            background: '#F3F4F6',
                            padding: '6px 10px',
                            borderRadius: 6,
                            marginTop: 4,
                            gap: 8,
                          }}
                        >
                          <code style={{ fontSize: 11, wordBreak: 'break-all', flex: 1, color: '#1F2937' }}>
                            {twoFactor.secretKey}
                          </code>
                          <Button
                            type="text"
                            size="small"
                            icon={<Copy size={14} />}
                            onClick={handleCopySecret}
                          />
                        </div>
                      </div>

                      <div style={{ marginBottom: 16 }}>
                        <Text strong style={{ fontSize: 13 }}>
                          Nhập mã 6 chữ số từ ứng dụng:
                        </Text>
                        <Input
                          placeholder="Ví dụ: 123456"
                          maxLength={6}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                          style={{ marginTop: 6, fontSize: 18, letterSpacing: 4, textAlign: 'center' }}
                        />
                      </div>

                      <div style={{ marginBottom: 16 }}>
                        <Checkbox
                          checked={dontAskAgain}
                          onChange={(e) => setDontAskAgain(e.target.checked)}
                        >
                          <span style={{ fontSize: 12 }}>
                            Không hỏi lại trên thiết bị này (SRS SEC-2FA-LGN-04: Chrome trên MacOS)
                          </span>
                        </Checkbox>
                      </div>

                      <Button
                        type="primary"
                        block
                        onClick={handleVerifyOtp}
                        style={{ background: '#FF7506', borderColor: '#FF7506' }}
                      >
                        Xác nhận và liên kết
                      </Button>
                    </Col>
                  </Row>
                </div>
              ),
            },
            {
              key: 'backup',
              label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Key size={16} /> Mã dự phòng (10 mã)
                </span>
              ),
              children: (
                <div style={{ paddingTop: 8 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 12,
                    }}
                  >
                    <div>
                      <Text strong>Danh sách 10 mã dự phòng (SRS 5.2):</Text>
                      <Paragraph style={{ fontSize: 12, color: '#6B7280', margin: 0 }}>
                        Mã đã dùng vẫn hiển thị gạch ngang để người dùng chủ động xóa hoặc tạo mới.
                      </Paragraph>
                    </div>
                    <Button
                      size="small"
                      icon={<RefreshCw size={13} />}
                      onClick={() => {
                        regenerateBackupCodes();
                        message.success('Đã tạo 10 mã dự phòng mới!');
                      }}
                    >
                      Tạo lại bộ mã
                    </Button>
                  </div>

                  {/* Lưới 10 mã */}
                  <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
                    {twoFactor.backupCodes.map((item, idx) => (
                      <Col span={12} key={idx}>
                        <div
                          style={{
                            background: item.used ? '#F3F4F6' : '#EFF6FF',
                            border: `1px solid ${item.used ? '#E5E7EB' : '#BFDBFE'}`,
                            padding: '8px 12px',
                            borderRadius: 8,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <span
                            style={{
                              fontFamily: 'monospace',
                              fontWeight: 700,
                              fontSize: 14,
                              textDecoration: item.used ? 'line-through' : 'none',
                              color: item.used ? '#9CA3AF' : '#1E40AF',
                            }}
                          >
                            {idx + 1}. {item.code}
                          </span>
                          <Tag color={item.used ? 'default' : 'blue'}>
                            {item.used ? 'Đã dùng' : 'Còn hiệu lực'}
                          </Tag>
                        </div>
                      </Col>
                    ))}
                  </Row>

                  {/* Thử đăng nhập bằng mã dự phòng */}
                  <Card size="small" title="Thử nghiệm đăng nhập bằng mã dự phòng (SEC-2FA-LGN-03)">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Text style={{ fontSize: 12, color: '#6B7280' }}>
                        Cho phép nhập tối đa 50 ký tự, có thể chứa dấu cách (hệ thống tự chuẩn hóa):
                      </Text>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Input
                          placeholder="Nhập mã dự phòng, vd: 4019 5821"
                          maxLength={50}
                          value={backupInput}
                          onChange={(e) => setBackupInput(e.target.value)}
                        />
                        <Button type="primary" onClick={handleVerifyBackup}>
                          Kiểm tra mã
                        </Button>
                      </div>
                    </Space>
                  </Card>
                </div>
              ),
            },
            {
              key: 'devices',
              label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={16} /> Thiết bị tin cậy
                </span>
              ),
              children: (
                <div style={{ paddingTop: 8 }}>
                  <Text strong>Các trình duyệt / thiết bị không cần hỏi lại 2FA:</Text>
                  <div style={{ marginTop: 12 }}>
                    {twoFactor.trustedDevices.map((dev, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '10px 14px',
                          background: '#F9FAFB',
                          border: '1px solid #E5E7EB',
                          borderRadius: 8,
                          marginBottom: 8,
                        }}
                      >
                        <span style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>{dev}</span>
                        <Tag color="cyan">Đã tin cậy</Tag>
                      </div>
                    ))}
                  </div>
                </div>
              ),
            },
          ]}
        />
      </div>
    </Modal>
  );
};
