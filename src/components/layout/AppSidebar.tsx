import React, { useState } from 'react';
import {
  LayoutDashboard,
  GitFork,
  Cloud,
  Radio,
  FileText,
  TrendingUp,
  Settings,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface AppSidebarProps {
  currentPortal: 'system' | 'enduser';
  activeMenu: string;
  onSelectMenu: (key: string) => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  activeMenu,
  onSelectMenu,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  // Danh sách menu chuẩn theo đúng bản thiết kế Figma
  const menuItems = [
    {
      key: 'usr-dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard size={20} strokeWidth={1.8} />,
      hasMore: false,
    },
    {
      key: 'usr-fac',
      label: 'Cơ sở',
      icon: <GitFork size={20} strokeWidth={1.8} />,
      hasMore: false,
    },
    {
      key: 'usr-src',
      label: 'Nguồn thông tin',
      icon: <Cloud size={20} strokeWidth={1.8} />,
      hasMore: true,
    },
    {
      key: 'usr-dev',
      label: 'Thiết bị',
      icon: <Radio size={20} strokeWidth={2.2} />,
      hasMore: false,
    },
    {
      key: 'usr-brd',
      label: 'Bản tin',
      icon: <FileText size={20} strokeWidth={1.8} />,
      hasMore: false,
    },
    {
      key: 'usr-rpt',
      label: 'Báo cáo',
      icon: <TrendingUp size={20} strokeWidth={1.8} />,
      hasMore: false,
    },
    {
      key: 'usr-set',
      label: 'Cài đặt hệ thống',
      icon: <Settings size={20} strokeWidth={1.8} />,
      hasMore: true,
    },
  ];

  return (
    <div
      style={{
        position: 'relative',
        width: collapsed ? 76 : 220,
        minWidth: collapsed ? 76 : 220,
        height: '100vh',
        background: 'linear-gradient(180deg, #FF7B29 0%, #FF5A00 100%)',
        borderTopRightRadius: 24,
        borderBottomRightRadius: 24,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 50,
        boxShadow: '4px 0 20px rgba(255, 117, 6, 0.15)',
        userSelect: 'none',
      }}
    >
      {/* Nút thu gọn / mở rộng Sidebar ở cạnh phải */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          position: 'absolute',
          right: -14,
          top: 130,
          width: 28,
          height: 28,
          borderRadius: '50%',
          backgroundColor: '#FFFFFF',
          border: '1.5px solid #FF7506',
          color: '#FF7506',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          zIndex: 60,
          outline: 'none',
        }}
        title={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Top Section: Logo & Menu */}
      <div style={{ paddingTop: 32 }}>
        {/* Logo MTC */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 40,
            padding: '0 16px',
          }}
        >
          {collapsed ? (
            <div
              style={{
                fontSize: 22,
                fontWeight: 900,
                color: '#1E1B18',
                letterSpacing: -1,
                fontFamily: 'Montserrat, sans-serif',
              }}
            >
              m<span style={{ color: '#FFFFFF' }}>t</span>c
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span
                style={{
                  fontSize: 36,
                  fontWeight: 900,
                  color: '#1E1B18',
                  letterSpacing: -1.5,
                  lineHeight: 1,
                  fontFamily: 'Montserrat, sans-serif',
                }}
              >
                m
              </span>
              <span
                style={{
                  fontSize: 36,
                  fontWeight: 900,
                  color: '#1E1B18',
                  letterSpacing: -1.5,
                  lineHeight: 1,
                  fontFamily: 'Montserrat, sans-serif',
                  position: 'relative',
                }}
              >
                t
                <span
                  style={{
                    position: 'absolute',
                    top: 2,
                    right: -2,
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    backgroundColor: '#FFFFFF',
                  }}
                />
              </span>
              <span
                style={{
                  fontSize: 36,
                  fontWeight: 900,
                  color: '#1E1B18',
                  letterSpacing: -1.5,
                  lineHeight: 1,
                  fontFamily: 'Montserrat, sans-serif',
                }}
              >
                c
              </span>
            </div>
          )}
        </div>

        {/* Menu Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '0 14px' }}>
          {menuItems.map((item) => {
            const isActive =
              activeMenu === item.key ||
              (item.key === 'usr-dev' && (activeMenu === 'usr-feedback' || activeMenu === 'usr-dev'));

            return (
              <div
                key={item.key}
                onClick={() => onSelectMenu(item.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: collapsed ? 'center' : 'space-between',
                  padding: collapsed ? '12px 0' : '10px 16px',
                  borderRadius: 12,
                  cursor: 'pointer',
                  backgroundColor: isActive ? '#FFFFFF' : 'transparent',
                  color: isActive ? '#FF7506' : '#FFFFFF',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: 14,
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? '0 4px 12px rgba(0, 0, 0, 0.08)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isActive ? '#FF7506' : '#FFFFFF',
                    }}
                  >
                    {item.icon}
                  </span>
                  {!collapsed && <span>{item.label}</span>}
                </div>

                {!collapsed && item.hasMore && (
                  <MoreVertical
                    size={16}
                    color={isActive ? '#FF7506' : '#FFFFFF'}
                    style={{ opacity: 0.8 }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Section: Powered by AltaSoftware */}
      <div
        style={{
          padding: '24px 12px',
          textAlign: 'center',
          color: '#FFFFFF',
          fontSize: 12,
          fontStyle: 'italic',
          letterSpacing: 0.2,
          opacity: 0.95,
        }}
      >
        {!collapsed && (
          <div>
            Powered by <strong style={{ fontWeight: 600 }}>AltaSoftware</strong>
          </div>
        )}
      </div>
    </div>
  );
};
