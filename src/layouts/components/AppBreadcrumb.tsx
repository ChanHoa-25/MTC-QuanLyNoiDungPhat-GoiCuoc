import type { ReactNode } from "react";
import { Breadcrumb } from "antd";
import { RightOutlined } from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";

import {
  Command,
  Network,
  CloudDownload,
  Radio,
  FileText,
  ChartLine,
  Settings,
} from "lucide-react";

import { ROUTES } from "../../constants/route.constants";
import { useFacilityContext } from "../../contexts/FacilityContext";
import "../MainLayout.css";

interface BreadcrumbConfig {
  label: string;
  icon?: ReactNode;
}

const breadcrumbs: Record<string, BreadcrumbConfig> = {
  [ROUTES.DASHBOARD]: {
    label: "Tổng quan",
    icon: <Command className="breadcrumb-icon" />,
  },

  [ROUTES.FACILITIES]: {
    label: "Cơ sở",
    icon: <Network className="breadcrumb-icon" />,
  },

  [ROUTES.SOURCES]: {
    label: "Nguồn thông tin",
    icon: <CloudDownload className="breadcrumb-icon" />,
  },

  [ROUTES.SOURCE_MEDIA]: {
    label: "Nguồn media",
  },

  [ROUTES.SOURCE_SHARED]: {
    label: "Nguồn được chia sẻ",
  },

  [ROUTES.SOURCE_PLAYLISTS]: {
    label: "Danh sách phát",
  },

  [ROUTES.SOURCE_TEMPLATES]: {
    label: "Bản mẫu",
  },

  [ROUTES.DEVICES]: {
    label: "Thiết bị",
    icon: <Radio className="breadcrumb-icon" />,
  },

  [ROUTES.BROADCASTS]: {
    label: "Bản tin",
    icon: <FileText className="breadcrumb-icon" />,
  },

  [ROUTES.REPORTS]: {
    label: "Báo cáo",
    icon: <ChartLine className="breadcrumb-icon" />,
  },

  [ROUTES.SETTINGS]: {
    label: "Cài đặt hệ thống",
    icon: <Settings className="breadcrumb-icon" />,
  },

  [ROUTES.SETTINGS_CATEGORIES]: {
    label: "Danh mục lĩnh vực",
  },

  [ROUTES.SETTINGS_ROLES]: {
    label: "Quản lý vai trò",
  },

  [ROUTES.SETTINGS_DISTRIBUTORS]: {
    label: "Danh mục nhà phân phối thiết bị",
  },

  [ROUTES.SETTINGS_LOGS]: {
    label: "Nhật ký người dùng",
  },

  [ROUTES.SETTINGS_NEWS_MODE]: {
    label: "Chế độ tạo bản tin",
  },

  [`${ROUTES.FACILITIES}/user`]: {
    label: "Tài khoản quản trị",
  },
};

function AppBreadcrumb() {
  const { pathname } = useLocation();

  const { selectedFacilityPath, setSelectedFacilityId } = useFacilityContext();

  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return null;
  }

  const isFacilityTemplateRoute =
    segments[0] === ROUTES.FACILITIES.replace(/^\//, "") &&
    segments[2] === "templates";

  const items = segments.flatMap((segment, index) => {
    const path = `/${segments.slice(0, index + 1).join("/")}`;

    const isLast = index === segments.length - 1;

    const config = breadcrumbs[path];

    const isFacilityDetail =
      index === 1 &&
      segments[0] === ROUTES.FACILITIES.replace(/^\//, "") &&
      segment !== "user";

    if (isFacilityTemplateRoute) {
      if (index === 1) {
        return [];
      }

      if (index === 3 && segment !== "create") {
        return [];
      }
    }

    let label = config?.label ?? segment;

    if (isFacilityDetail) {
      label = "Thông tin chi tiết";
    }

    if (isFacilityTemplateRoute) {
      if (segment === "templates") {
        label = "Bản mẫu";
      } else if (segment === "create") {
        label = "Thêm mới";
      } else if (segment === "edit") {
        label = "Cập nhật";
      }
    }

    const parentPath =
      path === ROUTES.FACILITIES ||
      path === ROUTES.SOURCES ||
      path === ROUTES.SETTINGS;

    const isClickable = !isLast && !parentPath;

    return [
      {
        title: (
          <span className="breadcrumb-item">
            {index === 0 && config?.icon}

            {isClickable ? (
              <Link to={path} className="breadcrumb-parent">
                {label}
              </Link>
            ) : (
              <span
                className={isLast ? "breadcrumb-current" : "breadcrumb-parent"}>
                {label}
              </span>
            )}
          </span>
        ),
      },
    ];
  });

  if (pathname === ROUTES.FACILITIES) {
    selectedFacilityPath.forEach((facility, index) => {
      const isLast = index === selectedFacilityPath.length - 1;

      items.push({
        title: (
          <span className="breadcrumb-item">
            {isLast ? (
              <span className="breadcrumb-current">
                {facility.facilityName}
              </span>
            ) : (
              <button
                type="button"
                className="breadcrumb-parent"
                style={{
                  padding: 0,
                  border: "none",
                  background: "transparent",
                  font: "inherit",
                  cursor: "pointer",
                }}
                onClick={() => setSelectedFacilityId(facility.id)}>
                {facility.facilityName}
              </button>
            )}
          </span>
        ),
      });
    });
  }

  return (
    <Breadcrumb
      className="app-breadcrumb"
      items={items}
      separator={<RightOutlined className="breadcrumb-separator-icon" />}
    />
  );
}

export default AppBreadcrumb;
