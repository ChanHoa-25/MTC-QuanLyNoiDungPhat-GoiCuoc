import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Layout, Menu, Dropdown, Button } from "antd";
import type { MenuProps } from "antd";

import { MoreVertical, ChevronLeft, ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import Logo from "../../assets/images/Logo.png";

import type { SidebarMenuEntry, SidebarMenuItem } from "../../config/menu";

import "../MainLayout.css";

const { Sider } = Layout;

interface AppSidebarProps {
  collapsed: boolean;
  onCollapse: () => void;
  menu: SidebarMenuEntry[];
  footer?: ReactNode;
}

function AppSidebar({ collapsed, onCollapse, menu, footer }: AppSidebarProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // Lấy các mục menu, bỏ qua divider
  const mainMenuItems: SidebarMenuItem[] = menu.filter(
    (item): item is SidebarMenuItem => item !== "divider",
  );

  // Xác định menu cha đang được chọn
  const selectedParentKey =
    [...mainMenuItems]
      .sort((a, b) => b.key.length - a.key.length)
      .find(
        (item) => pathname === item.key || pathname.startsWith(`${item.key}/`),
      )?.key ?? "";

  // Tạo icon theo trạng thái menu
  const renderIcon = (Icon: LucideIcon, active: boolean) => (
    <Icon
      className="sidebar-menu-icon"
      size={24}
      strokeWidth={1.8}
      color={active ? "#EE6B2D" : "#FFFFFF"}
    />
  );

  // Dropdown cho menu con
  const createSubmenu = (item: SidebarMenuItem) => (
    <Dropdown
      trigger={["click"]}
      placement="rightTop"
      overlayClassName="sidebar-more-dropdown"
      menu={{
        items: item.children?.map((child) => ({
          key: child.key,
          label: child.label,
        })),
        selectedKeys: [pathname],
        onClick: ({ key, domEvent }) => {
          domEvent.stopPropagation();
          navigate(String(key));
        },
      }}>
      <button
        type="button"
        className="sidebar-more-button"
        aria-label={`Mở menu con ${item.label}`}
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

  // Dựng menu từ cấu hình
  const menuItems: MenuProps["items"] = menu.map((item, index) => {
    if (item === "divider") {
      return {
        type: "divider" as const,
        key: `divider-${index}`,
        className: "sidebar-menu-divider",
      };
    }

    return {
      key: item.key,
      icon: renderIcon(item.icon, selectedParentKey === item.key),
      label: item.children ? (
        <div className="sidebar-menu-label">
          <span className="sidebar-menu-text">{item.label}</span>

          {!collapsed && createSubmenu(item)}
        </div>
      ) : (
        item.label
      ),
    };
  });

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
        {footer !== undefined ? (
          <div className="sidebar-system-footer">{footer}</div>
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
