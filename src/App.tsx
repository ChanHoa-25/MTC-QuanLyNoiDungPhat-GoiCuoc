import React, { useState } from 'react';
import { Layout, ConfigProvider, theme } from 'antd';
import { AuthProvider } from './context/AuthContext';
import { MtcDataProvider } from './context/MtcDataContext';

// Layout components
import { AppHeader } from './components/layout/AppHeader';
import { AppSidebar } from './components/layout/AppSidebar';

// System User Views
import { SystemDashboardView } from './components/system/SystemDashboardView';
import { OrganizationManagerView } from './components/system/OrganizationManagerView';
import { PackageManagerView } from './components/system/PackageManagerView';
import { UpgradePackageManagerView } from './components/system/UpgradePackageManagerView';
import { SystemUserManagerView } from './components/system/SystemUserManagerView';
import { SystemNotificationView } from './components/system/SystemNotificationView';
import { SystemReportsView } from './components/system/SystemReportsView';

// End User Views
import { FacilityManagerView } from './components/enduser/FacilityManagerView';
import { DeviceManagerView } from './components/enduser/DeviceManagerView';
import { MediaManagerView } from './components/enduser/MediaManagerView';
import { BroadcastManagerView } from './components/enduser/BroadcastManagerView';
import { DeviceFeedbackView } from './components/enduser/DeviceFeedbackView';
import { OrgPackageManagerView } from './components/enduser/OrgPackageManagerView';
import { EndUserReportsView } from './components/enduser/EndUserReportsView';

// Common Views & Modals
import { SettingsView } from './components/common/SettingsView';
import { TwoFactorSetupModal } from './components/auth/TwoFactorSetupModal';
import { ProfileModal } from './components/auth/ProfileModal';
import { SessionTimeoutModal } from './components/auth/SessionTimeoutModal';
import { DeviceErrorModal } from './components/common/DeviceErrorModal';
import { ActivityLogDrawer } from './components/common/ActivityLogDrawer';
import { NotificationDrawer } from './components/common/NotificationDrawer';

const { Content } = Layout;

const MainLayout: React.FC = () => {
  const [currentPortal, setCurrentPortal] = useState<'system' | 'enduser'>('enduser');
  const [activeMenu, setActiveMenu] = useState<string>('usr-dev');

  // Modal open states
  const [is2FAOpen, setIs2FAOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [isErrorsOpen, setIsErrorsOpen] = useState(false);

  const handleSwitchPortal = (portal: 'system' | 'enduser') => {
    setCurrentPortal(portal);
    if (portal === 'system') {
      setActiveMenu('sys-dashboard');
    } else {
      setActiveMenu('usr-dev');
    }
  };

  const renderContent = () => {
    if (currentPortal === 'system') {
      switch (activeMenu) {
        case 'sys-dashboard':
          return <SystemDashboardView />;
        case 'sys-org':
          return <OrganizationManagerView />;
        case 'sys-pkg':
          return <PackageManagerView />;
        case 'sys-upg':
          return <UpgradePackageManagerView />;
        case 'sys-usr':
          return <SystemUserManagerView />;
        case 'sys-ntf':
          return <SystemNotificationView />;
        case 'sys-rpt':
          return <SystemReportsView />;
        case 'sys-set':
          return <SettingsView portal="system" />;
        default:
          return <SystemDashboardView />;
      }
    } else {
      switch (activeMenu) {
        case 'usr-fac':
          return <FacilityManagerView />;
        case 'usr-dev':
          return <DeviceManagerView />;
        case 'usr-src':
          return <MediaManagerView />;
        case 'usr-brd':
          return <BroadcastManagerView />;
        case 'usr-feedback':
          return <DeviceFeedbackView />;
        case 'usr-usr':
          return <SystemUserManagerView />;
        case 'usr-pkg':
          return <OrgPackageManagerView />;
        case 'usr-rpt':
          return <EndUserReportsView />;
        case 'usr-set':
          return <SettingsView portal="enduser" />;
        default:
          return <DeviceManagerView />;
      }
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#FAF6F2' }}>
      <AppSidebar
        currentPortal={currentPortal}
        activeMenu={activeMenu}
        onSelectMenu={(key) => setActiveMenu(key)}
      />

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          background: '#FAF6F2',
          overflowX: 'hidden',
        }}
      >
        <AppHeader
          currentPortal={currentPortal}
          onSwitchPortal={handleSwitchPortal}
          onOpen2FA={() => setIs2FAOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenLogs={() => setIsLogsOpen(true)}
          onOpenErrors={() => setIsErrorsOpen(true)}
        />

        <main style={{ flex: 1, overflowY: 'auto' }}>
          {renderContent()}
        </main>
      </div>

      {/* Security Modals & Drawers */}
      <TwoFactorSetupModal open={is2FAOpen} onClose={() => setIs2FAOpen(false)} />
      <ProfileModal open={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <SessionTimeoutModal />
      <DeviceErrorModal open={isErrorsOpen} onClose={() => setIsErrorsOpen(false)} />
      <ActivityLogDrawer open={isLogsOpen} onClose={() => setIsLogsOpen(false)} />
      <NotificationDrawer open={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
    </div>
  );
};

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#FF7506', // Alta Media signature orange
          borderRadius: 8,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        },
      }}
    >
      <AuthProvider>
        <MtcDataProvider>
          <MainLayout />
        </MtcDataProvider>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;
