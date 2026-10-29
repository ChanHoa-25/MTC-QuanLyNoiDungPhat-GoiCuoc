import {
  Command,
  Network,
  CloudDownload,
  Radio,
  FileText,
  ChartLine,
  Settings,
} from "lucide-react";
import type { ReactNode } from "react";
import { Breadcrumb } from "antd";
import { RightOutlined } from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import "../MainLayout.css";

interface BreadcrumbConfig {
  label: string;
  icon: ReactNode;
}

const breadcrumbs: Record<string, BreadcrumbConfig> = {
  dashboard: {
    label: "Tổng quan",
    icon: <Command className="breadcrumb-icon" />,
  },
  sites: {
    label: "Quản lý cơ sở",
    icon: <Network className="breadcrumb-icon" />,
  },
  devices: {
    label: "Thiết bị",
    icon: <CloudDownload className="breadcrumb-icon" />,
  },
  news: {
    label: "Bản tin",
    icon: <FileText className="breadcrumb-icon" />,
  },
  broadcasts: {
    label: "Quản lý phát",
    icon: <Radio className="breadcrumb-icon" />,
  },
  reports: {
    label: "Báo cáo",
    icon: <ChartLine className="breadcrumb-icon" />,
  },
  settings: {
    label: "Cài đặt hệ thống",
    icon: <Settings className="breadcrumb-icon" />,
  },
};

function AppBreadcrumb() {
  const { pathname } = useLocation();
  const segments = pathname.split("/").filter(Boolean);

  const items = [
    {
      title: (
        <span className="breadcrumb-item">
          <Command className="breadcrumb-icon" />
          <Link to="/" className="breadcrumb-home">
            Trang chủ
          </Link>
        </span>
      ),
    },

    ...segments.map((segment, index) => {
      const path = `/${segments.slice(0, index + 1).join("/")}`;
      const config = breadcrumbs[segment];
      const label = config?.label ?? segment;
      const isLast = index === segments.length - 1;

      return {
        title: (
          <span className="breadcrumb-item">
            {index === 0 && config?.icon}
            {isLast ? (
              <span className="breadcrumb-current">{label}</span>
            ) : (
              <Link to={path} className="breadcrumb-parent">
                {label}
              </Link>
            )}
          </span>
        ),
      };
    }),
  ];

  return (
    <Breadcrumb
      className="app-breadcrumb"
      items={items}
      separator={<RightOutlined className="breadcrumb-separator-icon" />}
    />
  );
}

export default AppBreadcrumb;
