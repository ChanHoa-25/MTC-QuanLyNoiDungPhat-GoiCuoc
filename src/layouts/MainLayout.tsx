import { useState } from "react";
import { Layout } from "antd";
import { Outlet } from "react-router-dom";

import AppSidebar from "./components/AppSidebar";
import AppHeader from "./components/AppHeader";
import AppActionPanel from "../components/common/AppActionPanel";

import {
  ActionPanelProvider,
  useActionPanel,
} from "../contexts/ActionPanelContext";

import "./Mainlayout.css";

const { Header, Content, Footer } = Layout;

function MainLayoutContent() {
  const [collapsed, setCollapsed] = useState(false);
  const { actions } = useActionPanel();

  const handleCollapse = () => {
    setCollapsed((prev) => !prev);
  };

  return (
    <Layout className="main-layout">
      {/* Sidebar nằm bên trái */}
      <AppSidebar collapsed={collapsed} onCollapse={handleCollapse} />

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

function MainLayout() {
  return (
    <ActionPanelProvider>
      <MainLayoutContent />
    </ActionPanelProvider>
  );
}

export default MainLayout;
