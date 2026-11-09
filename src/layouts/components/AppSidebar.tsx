import { useLocation, useNavigate } from "react-router-dom";
import { Layout, Menu, Dropdown, Button, Tooltip } from "antd";
import type { MenuProps } from "antd";
import {
  Network,
  CloudDownload,
  Radio,
  FileText,
  Settings,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Command,
  ChartLine,
  Bell,
  Database,
  LogOut,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import Logo from "../../assets/images/Logo.png";
import avatarImage from "../../assets/images/avatar.png";
import { ROUTES } from "../../constants/route.constants";
import "../MainLayout.css";

const { Sider } = Layout;

export type AppSidebarRole = "user" | "admin";

export interface AppSidebarProps {
  collapsed: boolean;
  onCollapse: () => void;
  role?: AppSidebarRole;
  userName?: string;
  userLocation?: string;
  userRole?: string;
  avatarUrl?: string;
  onLogout?: () => void;
}

// Danh sách đường dẫn chính cho User và Admin
const userRoutes = [
  ROUTES.DASHBOARD,
  ROUTES.FACILITIES,
  ROUTES.SOURCES,
  ROUTES.DEVICES,
  ROUTES.BROADCASTS,
  ROUTES.REPORTS,
  ROUTES.SETTINGS,
];

const adminRoutes = [
  ROUTES.DASHBOARD,
  ROUTES.ORGANIZATIONS,
  ROUTES.NOTIFICATIONS,
  ROUTES.PACKAGES,
  ROUTES.REPORTS,
  ROUTES.SETTINGS,
];

// Danh sách menu con
const submenuItems: Record<string, NonNullable<MenuProps["items"]>> = {
  [ROUTES.SOURCES]: [
    { key: ROUTES.SOURCE_MEDIA, label: "Nguồn media" },
    { key: ROUTES.SOURCE_SHARED, label: "Nguồn được chia sẻ" },
    { key: ROUTES.SOURCE_PLAYLISTS, label: "Danh sách phát" },
    { key: ROUTES.SOURCE_TEMPLATES, label: "Bản mẫu" },
  ],
  [ROUTES.SETTINGS]: [
    { key: ROUTES.SETTINGS_CATEGORIES, label: "Danh mục lĩnh vực" },
    { key: ROUTES.SETTINGS_ROLES, label: "Quản lý vai trò" },
    { key: ROUTES.SETTINGS_DISTRIBUTORS, label: "Danh mục nhà phân phối thiết bị" },
    { key: ROUTES.SETTINGS_LOGS, label: "Nhật ký người dùng" },
    { key: ROUTES.SETTINGS_NEWS_MODE, label: "Chế độ tạo bản tin" },
    { key: ROUTES.SETTINGS_SYSTEM, label: "Thiết lập hệ thống" },
    { key: ROUTES.SETTINGS_PERSONAL, label: "Cấu hình cá nhân" },
  ],
};

function AppSidebar({
  collapsed,
  onCollapse,
  role,
  userName = "Chinh.Nguyen",
  userLocation = "Tp. Hồ Chí Minh",
  userRole = "Admin",
  avatarUrl = avatarImage,
  onLogout,
}: AppSidebarProps) {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();

  // Xác định vai trò: ưu tiên prop > URL ?role=admin > localStorage > route Admin
  const searchParams = new URLSearchParams(search);
  const isAdminRoute =
    pathname.startsWith("/admin") ||
    pathname.startsWith(ROUTES.ORGANIZATIONS) ||
    pathname.startsWith(ROUTES.NOTIFICATIONS) ||
    pathname.startsWith(ROUTES.PACKAGES);
  const isAdmin =
    role === "admin" ||
    (!role &&
      (searchParams.get("role") === "admin" ||
        (typeof window !== "undefined" && localStorage.getItem("mtc_role") === "admin") ||
        isAdminRoute));

  const activeRoutes = isAdmin ? adminRoutes : userRoutes;
  const selectedParentKey =
    [...activeRoutes]
      .sort((a, b) => b.length - a.length)
      .find((route) => pathname === route || pathname.startsWith(`${route}/`)) ??
    (isAdmin && pathname === "/admin/dashboard" ? ROUTES.DASHBOARD : "");

  const renderIcon = (Icon: LucideIcon, active: boolean) => (
    <Icon
      className="sidebar-menu-icon"
      size={24}
      strokeWidth={1.8}
      color={active ? "#EE6B2D" : "#FFFFFF"}
    />
  );

  const createSubmenu = (parentKey: string) => (
    <Dropdown
      trigger={["click"]}
      placement="rightTop"
      overlayClassName="sidebar-more-dropdown"
      menu={{
        items: submenuItems[parentKey],
        selectedKeys: [pathname],
        onClick: ({ key, domEvent }) => {
          domEvent.stopPropagation();
          if (isAdmin && typeof window !== "undefined") {
            localStorage.setItem("mtc_role", "admin");
          }
          navigate(String(key));
        },
      }}>
      <button
        type="button"
        className="sidebar-more-button"
        aria-label="Mở menu con"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}>
        <MoreVertical size={20} />
      </button>
    </Dropdown>
  );

  // Danh sách menu User
  const userMenuItems: MenuProps["items"] = [
    { key: ROUTES.DASHBOARD, icon: renderIcon(Command, selectedParentKey === ROUTES.DASHBOARD), label: "Dashboard" },
    { key: ROUTES.FACILITIES, icon: renderIcon(Network, selectedParentKey === ROUTES.FACILITIES), label: "Cơ sở" },
    {
      key: ROUTES.SOURCES,
      icon: renderIcon(CloudDownload, selectedParentKey === ROUTES.SOURCES),
      label: (
        <div className="sidebar-menu-label">
          <span className="sidebar-menu-text">Nguồn thông tin</span>
          {!collapsed && createSubmenu(ROUTES.SOURCES)}
        </div>
      ),
    },
    { key: ROUTES.DEVICES, icon: renderIcon(Radio, selectedParentKey === ROUTES.DEVICES), label: "Thiết bị" },
    { key: ROUTES.BROADCASTS, icon: renderIcon(FileText, selectedParentKey === ROUTES.BROADCASTS), label: "Bản tin" },
    { key: ROUTES.REPORTS, icon: renderIcon(ChartLine, selectedParentKey === ROUTES.REPORTS), label: "Báo cáo" },
    {
      key: ROUTES.SETTINGS,
      icon: renderIcon(Settings, selectedParentKey === ROUTES.SETTINGS),
      label: (
        <div className="sidebar-menu-label">
          <span className="sidebar-menu-text">Cài đặt hệ thống</span>
          {!collapsed && createSubmenu(ROUTES.SETTINGS)}
        </div>
      ),
    },
  ];

  // Danh sách menu Admin 
  const adminMenuItems: MenuProps["items"] = [
    { key: ROUTES.DASHBOARD, icon: renderIcon(Command, selectedParentKey === ROUTES.DASHBOARD), label: "Dashboard" },
    { type: "divider", style: { borderColor: "rgba(255, 255, 255, 0.35)", margin: "8px 12px" } },
    { key: ROUTES.ORGANIZATIONS, icon: renderIcon(Network, selectedParentKey === ROUTES.ORGANIZATIONS), label: "Tổ chức" },
    { key: ROUTES.NOTIFICATIONS, icon: renderIcon(Bell, selectedParentKey === ROUTES.NOTIFICATIONS), label: "Thông báo" },
    { key: ROUTES.PACKAGES, icon: renderIcon(Database, selectedParentKey === ROUTES.PACKAGES), label: "Gói cước" },
    { key: ROUTES.REPORTS, icon: renderIcon(ChartLine, selectedParentKey === ROUTES.REPORTS), label: "Báo cáo" },
    { type: "divider", style: { borderColor: "rgba(255, 255, 255, 0.35)", margin: "8px 12px" } },
    {
      key: ROUTES.SETTINGS,
      icon: renderIcon(Settings, selectedParentKey === ROUTES.SETTINGS),
      label: (
        <div className="sidebar-menu-label">
          <span className="sidebar-menu-text">Cài đặt hệ thống</span>
          {!collapsed && createSubmenu(ROUTES.SETTINGS)}
        </div>
      ),
    },
  ];

  // Xử lý click chọn menu
  const handleMenuClick: MenuProps["onClick"] = ({ key, domEvent }) => {
    if (domEvent.target instanceof Element && domEvent.target.closest(".sidebar-more-button")) return;

    if (isAdmin) {
      if (typeof window !== "undefined") localStorage.setItem("mtc_role", "admin");
      const target = key === ROUTES.DASHBOARD ? "/admin/dashboard" : String(key);
      navigate(searchParams.get("role") === "admin" && !target.includes("role=") ? `${target}?role=admin` : target);
    } else {
      navigate(String(key));
    }
  };

  const handleAdminLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      if (typeof window !== "undefined") localStorage.removeItem("mtc_role");
      navigate(ROUTES.LOGIN);
    }
  };

  return (
    <Sider
      className="app-sidebar"
      width={300}
      collapsedWidth={93}
      collapsed={collapsed}
      trigger={null}>
      <aside className={`sidebar ${collapsed ? "sidebar-collapsed" : ""}`}>
        {/* Logo */}
        <div className="sidebar-header">
          <div
            className="sidebar-logo"
            onClick={() => (isAdmin ? handleMenuClick({ key: ROUTES.DASHBOARD } as any) : navigate(ROUTES.DASHBOARD))}
            role="button"
            tabIndex={0}
            onKeyDown={(e) =>
              (e.key === "Enter" || e.key === " ") &&
              (isAdmin ? handleMenuClick({ key: ROUTES.DASHBOARD } as any) : navigate(ROUTES.DASHBOARD))
            }>
            <img src={Logo} alt="MTC" />
          </div>
        </div>

        {/* Nút thu gọn / mở rộng */}
        <Button
          type="text"
          className="sidebar-collapse-button"
          onClick={onCollapse}
          aria-label={collapsed ? "Mở rộng Sidebar" : "Thu gọn Sidebar"}
          aria-expanded={!collapsed}>
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </Button>

        <nav className="sidebar-navigation" aria-label="Điều hướng chính">
          <Menu
            className="sidebar-menu"
            mode="inline"
            inlineCollapsed={collapsed}
            selectedKeys={selectedParentKey ? [selectedParentKey] : []}
            items={isAdmin ? adminMenuItems : userMenuItems}
            onClick={handleMenuClick}
          />
        </nav>

        {isAdmin ? (
          <div style={{ padding: "12px 8px 4px", borderTop: "1px solid rgba(255, 255, 255, 0.25)", flexShrink: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: collapsed ? "center" : "space-between",
                padding: collapsed ? "6px" : "8px 10px",
                background: collapsed ? "transparent" : "rgba(255, 255, 255, 0.16)",
                border: collapsed ? "none" : "1px solid rgba(255, 255, 255, 0.3)",
                borderRadius: "14px",
              }}>
              {collapsed ? (
                <Tooltip title={`${userName} (${userRole}) - ${userLocation}`} placement="right">
                  <img
                    src={avatarUrl}
                    alt={userName}
                    style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(255, 255, 255, 0.7)" }}
                  />
                </Tooltip>
              ) : (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}>
                    <img
                      src={avatarUrl}
                      alt={userName}
                      style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(255, 255, 255, 0.7)", flexShrink: 0 }}
                    />
                    <div style={{ display: "flex", flexDirection: "column", minWidth: 0, lineHeight: 1.25 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#FFFFFF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={userName}>
                        {userName}
                      </span>
                      <span style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.85)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={userLocation}>
                        {userLocation}
                      </span>
                      <span style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.85)" }}>{userRole}</span>
                    </div>
                  </div>
                  <Tooltip title="Đăng xuất" placement="top">
                    <button
                      type="button"
                      onClick={handleAdminLogout}
                      aria-label="Đăng xuất"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 34,
                        height: 34,
                        borderRadius: "50%",
                        border: "none",
                        background: "rgba(255, 255, 255, 0.25)",
                        color: "#FFFFFF",
                        cursor: "pointer",
                        marginLeft: 6,
                        flexShrink: 0,
                      }}>
                      <LogOut size={18} />
                    </button>
                  </Tooltip>
                </>
              )}
            </div>
          </div>
        ) : (
          !collapsed && (
            <div className="sidebar-footer">
              <span className="powered-by">Powered by </span>
              <span className="brand-name">AltaSoftware</span>
            </div>
          )
        )}
      </aside>
    </Sider>
  );
}

export default AppSidebar;
