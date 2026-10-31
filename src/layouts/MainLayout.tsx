import { useState } from "react";
import { Layout } from "antd";
import { Outlet } from "react-router-dom";

import AppSidebar from "./components/AppSidebar";
import AppHeader from "./components/AppHeader";

import "./Mainlayout.css";

const { Header, Content, Footer } = Layout;

function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);

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

        <Content className="app-content">
          <Outlet />
        </Content>

        <Footer className="app-footer">
          <span className="powered-by">Powered by</span>
          <span className="brand-name">AltaSoftware</span>
        </Footer>
      </Layout>
    </Layout>
  );
}

export default MainLayout;
