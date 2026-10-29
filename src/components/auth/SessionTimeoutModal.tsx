import React, { useState } from 'react';
import { Modal, Input, Button, Typography, message } from 'antd';
import { Lock, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const { Text, Paragraph } = Typography;

export const SessionTimeoutModal: React.FC = () => {
  const { isSessionExpired, verifySessionPassword, dismissSessionModal, currentUser } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isSessionExpired) return null;

  const handleConfirm = () => {
    if (!password) {
      setError('Vui lòng nhập mật khẩu tài khoản.');
      return;
    }
    const ok = verifySessionPassword(password);
    if (ok) {
      message.success('Xác nhận phiên làm việc thành công!');
      setPassword('');
      setError('');
    } else {
      setError('Mật khẩu không chính xác. Vui lòng thử lại.');
    }
  };

  const handleBack = () => {
    // SRS 5.4: Nút quay lại đóng pop-up, ở lại trang
    dismissSessionModal();
  };

  return (
    <Modal
      open={isSessionExpired}
      closable={false}
      maskClosable={false}
      width={450}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              padding: 6,
              borderRadius: 8,
              background: '#FFF1F0',
              color: '#CF1322',
              display: 'flex',
            }}
          >
            <Clock size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Phiên Làm Việc Hết Hạn (SEC-SES)</div>
            <div style={{ fontSize: 12, color: '#8C8C8C', fontWeight: 400 }}>
              Yêu cầu xác thực lại mật khẩu sau 15 phút không hoạt động
            </div>
          </div>
        </div>
      }
      footer={[
        <Button key="back" onClick={handleBack}>
          Quay lại (Đóng pop-up)
        </Button>,
        <Button
          key="submit"
          type="primary"
          style={{ background: '#FF7506', borderColor: '#FF7506' }}
          onClick={handleConfirm}
        >
          Xác nhận tiếp tục
        </Button>,
      ]}
    >
      <div style={{ padding: '12px 0' }}>
        <Paragraph style={{ color: '#4B5563', fontSize: 13 }}>
          Theo quy định bảo mật hệ thống MTC (SRS mục 5.4), phiên làm việc của tài khoản{' '}
          <Text strong>{currentUser.username}</Text> đã vượt quá giới hạn 15 phút.
          Vui lòng nhập lại mật khẩu để tiếp tục thao tác dữ liệu.
        </Paragraph>

        <div style={{ marginTop: 16 }}>
          <Text strong style={{ fontSize: 13 }}>
            Mật khẩu tài khoản:
          </Text>
          <Input.Password
            prefix={<Lock size={16} color="#9CA3AF" />}
            placeholder="Nhập mật khẩu (ví dụ: Admin@123)"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            onPressEnter={handleConfirm}
            style={{ marginTop: 6 }}
          />
          {error && (
            <div style={{ color: '#DC2626', fontSize: 12, marginTop: 4 }}>{error}</div>
          )}
        </div>
      </div>
    </Modal>
  );
};
