import { useLocation, useNavigate } from "react-router-dom";
import { Layout, Menu, Dropdown, Button } from "antd";
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
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import Logo from "../../assets/images/Logo.png";
import { ROUTES } from "../../constants/route.constants";
import "../MainLayout.css";

const { Sider } = Layout;

interface AppSidebarProps {
  collapsed: boolean;
  onCollapse: () => void;
}

// Các đường dẫn menu chính
const mainRoutes = [
  ROUTES.DASHBOARD,
  ROUTES.SITES,
  ROUTES.SOURCES,
  ROUTES.DEVICES,
  ROUTES.BROADCASTS,
  ROUTES.REPORTS,
  ROUTES.SETTINGS,
];

// Danh sách menu con
const submenuItems: Record<string, NonNullable<MenuProps["items"]>> = {
  [ROUTES.SOURCES]: [
    {
      key: ROUTES.SOURCE_MEDIA,
      label: "Nguồn media",
    },
    {
      key: ROUTES.SOURCE_SHARED,
      label: "Nguồn được chia sẻ",
    },
    {
      key: ROUTES.SOURCE_PLAYLISTS,
      label: "Danh sách phát",
    },
    {
      key: ROUTES.SOURCE_TEMPLATES,
      label: "Bản mẫu",
    },
  ],

  [ROUTES.SETTINGS]: [
    {
      key: ROUTES.SETTINGS_CATEGORIES,
      label: "Danh mục lĩnh vực",
    },
    {
      key: ROUTES.SETTINGS_ROLES,
      label: "Quản lý vai trò",
    },
    {
      key: ROUTES.SETTINGS_DISTRIBUTORS,
      label: "Danh mục nhà phân phối thiết bị",
    },
    {
      key: ROUTES.SETTINGS_LOGS,
      label: "Nhật ký người dùng",
    },
    {
      key: ROUTES.SETTINGS_NEWS_MODE,
      label: "Chế độ tạo bản tin",
    },
  ],
};

function AppSidebar({ collapsed, onCollapse }: AppSidebarProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // Xác định menu cha đang được chọn
  const selectedParentKey =
    [...mainRoutes]
      .sort((a, b) => b.length - a.length)
      .find(
        (route) => pathname === route || pathname.startsWith(`${route}/`),
      ) ?? "";

  // Tạo icon và đổi màu theo trạng thái menu
  const renderIcon = (Icon: LucideIcon, active: boolean) => (
    <Icon
      className="sidebar-menu-icon"
      size={24}
      strokeWidth={1.8}
      color={active ? "#EE6B2D" : "#FFFFFF"}
    />
  );

  // Tạo dropdown menu con
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
          navigate(String(key));
        },
      }}>
      <button
        type="button"
        className="sidebar-more-button"
        aria-label="Mở menu con"
        onClick={(event) => {
          event.stopPropagation();
        }}
        onKeyDown={(event) => {
          event.stopPropagation();
        }}>
        <MoreVertical size={20} />
      </button>
    </Dropdown>
  );

  // Danh sách menu chính
  const menuItems: MenuProps["items"] = [
    {
      key: ROUTES.DASHBOARD,
      icon: renderIcon(Command, selectedParentKey === ROUTES.DASHBOARD),
      label: "Dashboard",
    },
    {
      key: ROUTES.SITES,
      icon: renderIcon(Network, selectedParentKey === ROUTES.SITES),
      label: "Cơ sở",
    },
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
    {
      key: ROUTES.DEVICES,
      icon: renderIcon(Radio, selectedParentKey === ROUTES.DEVICES),
      label: "Thiết bị",
    },
    {
      key: ROUTES.BROADCASTS,
      icon: renderIcon(FileText, selectedParentKey === ROUTES.BROADCASTS),
      label: "Bản tin",
    },
    {
      key: ROUTES.REPORTS,
      icon: renderIcon(ChartLine, selectedParentKey === ROUTES.REPORTS),
      label: "Báo cáo",
    },
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

  // Xử lý click menu chính
  const handleMenuClick: MenuProps["onClick"] = ({ key, domEvent }) => {
    const target = domEvent.target;

    if (target instanceof Element && target.closest(".sidebar-more-button")) {
      return;
    }

    navigate(String(key));
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
          <div className="sidebar-logo">
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

        {/* Menu điều hướng */}
        <nav className="sidebar-navigation" aria-label="Điều hướng chính">
          <Menu
            className="sidebar-menu"
            mode="inline"
            inlineCollapsed={collapsed}
            selectedKeys={selectedParentKey ? [selectedParentKey] : []}
            items={menuItems}
            onClick={handleMenuClick}
          />
        </nav>

        {/* Footer */}
        {!collapsed && (
          <div className="sidebar-footer">
            <span className="powered-by">Powered by </span>
            <span className="brand-name">AltaSoftware</span>
          </div>
        )}
      </aside>
    </Sider>
  );
}

export default AppSidebar;
