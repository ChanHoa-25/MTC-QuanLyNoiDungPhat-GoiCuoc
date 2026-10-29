import { useLocation, useNavigate } from "react-router-dom";
import { Layout, Menu, Dropdown, Button } from "antd";
import type { MenuProps } from "antd";

import {
  LayoutDashboard,
  Network,
  CloudDownload,
  Radio,
  FileText,
  ChartNoAxesColumn,
  Settings,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Command,
  ChartLine,
} from "lucide-react";

import Logo from "../../assets/images/Logo.png";
import "../MainLayout.css";

const { Sider } = Layout;

interface AppSidebarProps {
  collapsed: boolean;
  onCollapse: () => void;
}

// Các route được quản lý bởi Sidebar
const routes = [
  { key: "/dashboard", parentKey: "/dashboard" },
  { key: "/sites", parentKey: "/sites" },

  { key: "/sources", parentKey: "/sources" },
  { key: "/sources/list", parentKey: "/sources" },
  { key: "/sources/categories", parentKey: "/sources" },

  { key: "/devices", parentKey: "/devices" },
  { key: "/news", parentKey: "/news" },
  { key: "/reports", parentKey: "/reports" },

  { key: "/settings", parentKey: "/settings" },
  { key: "/settings/general", parentKey: "/settings" },
  { key: "/settings/permissions", parentKey: "/settings" },
];

// Các menu con hiển thị trong nút ba chấm
const submenuItems: Record<string, NonNullable<MenuProps["items"]>> = {
  "/sources": [
    { key: "/media/source", label: "Nguồn media" },
    { key: "/media/shared", label: "Nguồn được chia sẻ" },
    { key: "/media/playlist", label: "Danh sách phát" },
    { key: "/media/templates", label: "Bản mẫu" },
  ],

  "/settings": [
    { key: "/settings/categories", label: "Danh mục lĩnh vực" },
    { key: "/settings/roles", label: "Quản lý vai trò" },
    {
      key: "/settings/distributors",
      label: "Danh mục nhà phân phối thiết bị",
    },
    { key: "/settings/logs", label: "Nhật ký người dùng" },
    { key: "/settings/news-mode", label: "Chế độ tạo bản tin" },
  ],
};

function AppSidebar({ collapsed, onCollapse }: AppSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  // Tìm route khớp dài nhất với đường dẫn hiện tại
  const currentRoute = [...routes]
    .sort((a, b) => b.key.length - a.key.length)
    .find(
      (route) =>
        location.pathname === route.key ||
        location.pathname.startsWith(`${route.key}/`),
    );

  const selectedKey = currentRoute?.key ?? "/dashboard";

  const selectedParentKey = currentRoute?.parentKey ?? "/dashboard";

  // Tạo icon và đổi màu khi menu được chọn
  const renderIcon = (Icon: typeof LayoutDashboard, active: boolean) => (
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
        selectedKeys: [selectedKey],
        onClick: ({ key }) => {
          navigate(String(key));
        },
      }}>
      <button
        type="button"
        className="sidebar-more-button"
        aria-label="Mở menu con"
        onClick={(event) => {
          event.stopPropagation();
        }}>
        <MoreVertical size={20} />
      </button>
    </Dropdown>
  );

  // Danh sách menu chính
  const menuItems: MenuProps["items"] = [
    {
      key: "/dashboard",
      icon: renderIcon(Command, selectedParentKey === "/dashboard"),
      label: "Tổng quan",
    },

    {
      key: "/sites",
      icon: renderIcon(Network, selectedParentKey === "/sites"),
      label: "Quản lý cơ sở",
    },

    {
      key: "/sources",
      icon: renderIcon(CloudDownload, selectedParentKey === "/sources"),
      label: (
        <div className="sidebar-menu-label">
          <span className="sidebar-menu-text">Nguồn thông tin</span>

          {!collapsed && createSubmenu("/sources")}
        </div>
      ),
    },

    {
      key: "/devices",
      icon: renderIcon(Radio, selectedParentKey === "/devices"),
      label: "Thiết bị",
    },

    {
      key: "/news",
      icon: renderIcon(FileText, selectedParentKey === "/news"),
      label: "Bản tin",
    },

    {
      key: "/reports",
      icon: renderIcon(ChartLine, selectedParentKey === "/reports"),
      label: "Báo cáo",
    },

    {
      key: "/settings",
      icon: renderIcon(Settings, selectedParentKey === "/settings"),
      label: (
        <div className="sidebar-menu-label">
          <span className="sidebar-menu-text">Cài đặt hệ thống</span>

          {!collapsed && createSubmenu("/settings")}
        </div>
      ),
    },
  ];

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
          aria-label={collapsed ? "Mở rộng Sidebar" : "Thu gọn Sidebar"}>
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </Button>

        {/* Menu */}
        <nav className="sidebar-navigation" aria-label="Điều hướng chính">
          <Menu
            className="sidebar-menu"
            mode="inline"
            inlineCollapsed={collapsed}
            selectedKeys={[selectedParentKey]}
            items={menuItems}
            onClick={({ key }) => {
              navigate(String(key));
            }}
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
