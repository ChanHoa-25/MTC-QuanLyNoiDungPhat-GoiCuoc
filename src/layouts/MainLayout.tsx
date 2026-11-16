import { useState } from "react";
import type { ReactNode } from "react";
import { Layout } from "antd";
import { Outlet } from "react-router-dom";

import AppSidebar from "./components/AppSidebar";
import AppHeader from "./components/AppHeader";
import AppActionPanel from "../components/common/AppActionPanel";
import SystemUserSidebarFooter from "./components/SystemUserSidebarFooter";

import { endUserMenu, systemUserMenu } from "../config/menu";

import type { UserType } from "../config/menu";

import {
  ActionPanelProvider,
  useActionPanel,
} from "../contexts/ActionPanelContext";

import "./MainLayout.css";

const { Header, Content, Footer } = Layout;

interface MainLayoutProps {
  variant?: UserType;
  sidebarFooter?: ReactNode;
}

function MainLayoutContent({
  variant = "end-user",
  sidebarFooter,
}: MainLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { actions } = useActionPanel();

  // Xác định phân hệ
  const isSystemUser = variant === "system-user";

  // Chọn menu theo phân hệ
  const menu = isSystemUser ? systemUserMenu : endUserMenu;

  // Xử lý thu gọn Sidebar
  const handleCollapse = () => {
    setCollapsed((prev) => !prev);
  };

  return (
    <Layout className="main-layout">
      {/* Sidebar */}
      <AppSidebar
        collapsed={collapsed}
        onCollapse={handleCollapse}
        menu={menu}
        footer={
          isSystemUser ? (
            <SystemUserSidebarFooter collapsed={collapsed} />
          ) : undefined
        }
      />

      {/* Phần nội dung bên phải */}
      <Layout className="main-layout-right">
        <Header className="app-header">
          <AppHeader variant={isSystemUser ? "system-user" : "default"} />
        </Header>

        {/* Content và thanh thao tác */}
        <div className="app-body">
          <Content className="app-content">
            <Outlet />
          </Content>

          {actions.length > 0 && <AppActionPanel actions={actions} />}
        </div>

        {/* Footer chính */}
        <Footer className="app-footer">
          <span className="powered-by">Powered by</span>
          <span className="brand-name">AltaSoftware</span>
        </Footer>
      </Layout>
    </Layout>
  );
}

function MainLayout({ variant = "end-user", sidebarFooter }: MainLayoutProps) {
  return (
    <ActionPanelProvider>
      <MainLayoutContent variant={variant} sidebarFooter={sidebarFooter} />
    </ActionPanelProvider>
  );
}

export default MainLayout;
