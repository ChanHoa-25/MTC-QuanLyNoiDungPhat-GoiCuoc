import { useState } from "react";
import { Layout } from "antd";
import { Outlet } from "react-router-dom";

import AppSidebar from "./components/AppSidebar";
import type { AppSidebarRole } from "./components/AppSidebar";
import AppHeader from "./components/AppHeader";
import AppActionPanel from "../components/common/AppActionPanel";

import {
  ActionPanelProvider,
  useActionPanel,
} from "../contexts/ActionPanelContext";

import "./Mainlayout.css";

const { Header, Content, Footer } = Layout;

export interface MainLayoutProps {
  role?: AppSidebarRole;
}

function MainLayoutContent({ role }: MainLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { actions } = useActionPanel();

  const handleCollapse = () => {
    setCollapsed((prev) => !prev);
  };

  return (
    <Layout className="main-layout">
      {/* Sidebar nằm bên trái */}
      <AppSidebar collapsed={collapsed} onCollapse={handleCollapse} role={role} />

      {/* Phần nội dung nằm bên phải */}
      <Layout className="main-layout-right">
        <Header className="app-header">
          <AppHeader />
        </Header>

        {/* Content và thanh thao tác */}
        <div className="app-body">
          <Content className="app-content">
            <Outlet />
          </Content>

          {actions.length > 0 && <AppActionPanel actions={actions} />}
        </div>

        <Footer className="app-footer">
          <span className="powered-by">Powered by</span>
          <span className="brand-name">AltaSoftware</span>
        </Footer>
      </Layout>
    </Layout>
  );
}

function MainLayout({ role }: MainLayoutProps) {
  return (
    <ActionPanelProvider>
      <MainLayoutContent role={role} />
    </ActionPanelProvider>
  );
}

export default MainLayout;
