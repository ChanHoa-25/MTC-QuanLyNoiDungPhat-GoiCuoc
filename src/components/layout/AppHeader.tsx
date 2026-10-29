import React from 'react';
import {
  Dropdown,
  Avatar,
  Badge,
  Input,
} from 'antd';
import type { MenuProps } from 'antd';
import {
  Radio,
  ChevronRight,
  Search,
  ChevronDown,
  LayoutGrid,
  Bell,
  User,
  KeyRound,
  RotateCw,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useMtcData } from '../../context/MtcDataContext';

interface AppHeaderProps {
  currentPortal: 'system' | 'enduser';
  onSwitchPortal: (portal: 'system' | 'enduser') => void;
  onOpen2FA: () => void;
  onOpenProfile: () => void;
  onOpenNotifications: () => void;
  onOpenLogs: () => void;
  onOpenErrors: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  currentPortal,
  onSwitchPortal,
  onOpen2FA,
  onOpenProfile,
  onOpenNotifications,
}) => {
  const { currentUser, switchUserRole } = useAuth();
  const { notifications } = useMtcData();

  const unreadCount = notifications.filter((n) => !n.isRead).length || 1;

  // Menu chuyển đổi vai trò & thông tin tài khoản
  const roleMenuItems: MenuProps['items'] = [
    {
      key: 'Administrator',
      label: '🏢 Administrator (Quản trị viên tổ chức Alta)',
      onClick: () => {
        switchUserRole('Administrator');
        onSwitchPortal('enduser');
      },
    },
    {
      key: 'IT',
      label: '🛠️ IT (Kỹ thuật quản lý thiết bị)',
      onClick: () => {
        switchUserRole('IT');
        onSwitchPortal('enduser');
      },
    },
    {
      key: 'Creator',
      label: '✍️ Creator (Biên tập nội dung & media)',
      onClick: () => {
        switchUserRole('Creator');
        onSwitchPortal('enduser');
      },
    },
    {
      key: 'Approver',
      label: '✅ Approver (Kiểm duyệt viên nội dung/bản tin)',
      onClick: () => {
        switchUserRole('Approver');
        onSwitchPortal('enduser');
      },
    },
    {
      key: 'SystemAdmin',
      label: '👑 SystemAdmin (Nhà vận hành nền tảng)',
      onClick: () => {
        switchUserRole('SystemAdmin');
        onSwitchPortal('system');
      },
    },
  ];

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <User size={16} />,
      label: `Tài khoản: ${currentUser.fullName} (${currentUser.role})`,
      onClick: onOpenProfile,
    },
    {
      key: '2fa',
      icon: <KeyRound size={16} />,
      label: 'Xác thực hai bước 2FA',
      onClick: onOpen2FA,
    },
    {
      type: 'divider',
    },
    {
      key: 'switch-role',
      icon: <RotateCw size={16} />,
      label: 'Chuyển đổi vai trò người dùng',
      children: roleMenuItems,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogOut size={16} />,
      danger: true,
      label: 'Đăng xuất khỏi hệ thống',
      onClick: () => window.location.reload(),
    },
  ];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 32px 12px 28px',
        background: 'transparent',
        minHeight: 64,
      }}
    >
      {/* Left: Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Radio size={20} color="#FF7506" strokeWidth={2.4} />
        <span
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: '#1F2937',
            letterSpacing: -0.2,
          }}
        >
          Quản lý
        </span>
        <ChevronRight size={18} color="#9CA3AF" />
        <span
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: '#FF7506',
            letterSpacing: -0.2,
          }}
        >
          Danh sách thiết bị phát bản tin điện tử
        </span>
      </div>

      {/* Right: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Search Input */}
        <div style={{ width: 170 }}>
          <Input
            placeholder="Từ khóa..."
            suffix={<Search size={15} color="#9CA3AF" />}
            style={{
              borderRadius: 8,
              borderColor: '#E5E7EB',
              background: '#FFFFFF',
              fontSize: 13,
              padding: '6px 12px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
            }}
          />
        </div>

        {/* Language Pill: VIE */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '5px 12px',
            background: '#FFFFFF',
            border: '1.5px solid #FF7506',
            borderRadius: 20,
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
          }}
        >
          {/* Vietnam Flag Badge */}
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: '50%',
              backgroundColor: '#DA251D',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <span
              style={{
                color: '#FFFF00',
                fontSize: 10,
                lineHeight: 1,
                userSelect: 'none',
              }}
            >
              ★
            </span>
          </div>
          <span
            style={{
              color: '#FF7506',
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 0.5,
            }}
          >
            VIE
          </span>
          <ChevronDown size={14} color="#FF7506" strokeWidth={2.2} />
        </div>

        {/* 9 Dots Grid Launcher */}
        <Dropdown menu={{ items: roleMenuItems }} trigger={['click']} placement="bottomRight">
          <div
            style={{
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 8,
              cursor: 'pointer',
              color: '#FF7506',
              transition: 'background 0.2s',
            }}
            title="Menu ứng dụng & chuyển vai trò"
          >
            <LayoutGrid size={20} color="#FF7506" />
          </div>
        </Dropdown>

        {/* Bell Notification with Orange Badge */}
        <div
          onClick={onOpenNotifications}
          style={{
            position: 'relative',
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#FF7506',
          }}
          title="Thông báo"
        >
          <Bell size={20} color="#FF7506" />
          <span
            style={{
              position: 'absolute',
              top: 5,
              right: 5,
              width: 15,
              height: 15,
              borderRadius: '50%',
              backgroundColor: '#FF7506',
              color: '#FFFFFF',
              fontSize: 10,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1.5px solid #FFFFFF',
            }}
          >
            {unreadCount}
          </span>
        </div>

        {/* Profile Avatar with Online Status */}
        <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
          <div
            style={{
              position: 'relative',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
            title={`${currentUser.fullName} (${currentUser.role})`}
          >
            <Avatar
              size={38}
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256"
              style={{
                border: '2px solid #FFFFFF',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
              }}
            />
            {/* Online Indicator */}
            <span
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: '#FF7506',
                border: '1.5px solid #FFFFFF',
              }}
            />
          </div>
        </Dropdown>
      </div>
    </div>
  );
};
