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

  "/admin/dashboard": {
    label: "Tổng quan",
    icon: <Command className="breadcrumb-icon" />,
  },

  [ROUTES.FACILITIES]: {
    label: "Cơ sở",
    icon: <Network className="breadcrumb-icon" />,
  },

  [ROUTES.ORGANIZATIONS]: {
    label: "Quản lý tổ chức",
    icon: <FileText className="breadcrumb-icon" />,
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

  [ROUTES.NOTIFICATIONS]: {
    label: "Quản lý thông báo",
    icon: <FileText className="breadcrumb-icon" />,
  },

  [ROUTES.PACKAGES]: {
    label: "Gói cước",
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
  const { pathname, search } = useLocation();

  const { selectedFacilityPath, setSelectedFacilityId } = useFacilityContext();

  if (
    pathname === ROUTES.ORGANIZATIONS ||
    pathname.startsWith(`${ROUTES.ORGANIZATIONS}/`)
  ) {
    const searchParams = new URLSearchParams(search);
    const isEditOrDetail =
      searchParams.get("action") === "edit" ||
      searchParams.get("view") === "detail" ||
      searchParams.has("id") ||
      pathname.length > ROUTES.ORGANIZATIONS.length;

    const orgItems = [
      {
        title: (
          <span className="breadcrumb-item">
            <FileText className="breadcrumb-icon" />
            <Link to={ROUTES.ORGANIZATIONS} className="breadcrumb-parent">
              Quản lý tổ chức
            </Link>
          </span>
        ),
      },
      {
        title: (
          <span className="breadcrumb-item">
            {isEditOrDetail ? (
              <Link to={ROUTES.ORGANIZATIONS} className="breadcrumb-parent">
                Danh sách tổ chức
              </Link>
            ) : (
              <span className="breadcrumb-current">Danh sách tổ chức</span>
            )}
          </span>
        ),
      },
    ];

    if (isEditOrDetail) {
      orgItems.push({
        title: (
          <span className="breadcrumb-item">
            <span className="breadcrumb-current">Chỉnh sửa tổ chức</span>
          </span>
        ),
      });
    }

    return (
      <Breadcrumb
        className="app-breadcrumb"
        items={orgItems}
        separator={<RightOutlined className="breadcrumb-separator-icon" />}
      />
    );
  }

  if (
    pathname === ROUTES.NOTIFICATIONS ||
    pathname.startsWith(`${ROUTES.NOTIFICATIONS}/`)
  ) {
    const searchParams = new URLSearchParams(search);
    const isEditOrDetail =
      searchParams.get("action") === "edit" ||
      searchParams.get("view") === "detail" ||
      searchParams.has("id") ||
      pathname.length > ROUTES.NOTIFICATIONS.length;

    const notifItems = [
      {
        title: (
          <span className="breadcrumb-item">
            <FileText className="breadcrumb-icon" />
            <Link to={ROUTES.NOTIFICATIONS} className="breadcrumb-parent">
              Quản lý thông báo
            </Link>
          </span>
        ),
      },
      {
        title: (
          <span className="breadcrumb-item">
            {isEditOrDetail ? (
              <Link to={ROUTES.NOTIFICATIONS} className="breadcrumb-parent">
                Danh sách thông báo
              </Link>
            ) : (
              <span className="breadcrumb-current">Danh sách thông báo</span>
            )}
          </span>
        ),
      },
    ];

    if (isEditOrDetail) {
      notifItems.push({
        title: (
          <span className="breadcrumb-item">
            <span className="breadcrumb-current">Chi tiết thông báo</span>
          </span>
        ),
      });
    }

    return (
      <Breadcrumb
        className="app-breadcrumb"
        items={notifItems}
        separator={<RightOutlined className="breadcrumb-separator-icon" />}
      />
    );
  }

  if (
    pathname === ROUTES.NOTIFICATIONS ||
    pathname.startsWith(`${ROUTES.NOTIFICATIONS}/`)
  ) {
    const searchParams = new URLSearchParams(search);
    const isEditOrDetail =
      searchParams.get("action") === "edit" ||
      searchParams.get("view") === "detail" ||
      searchParams.has("id") ||
      pathname.length > ROUTES.NOTIFICATIONS.length;

    const notifItems = [
      {
        title: (
          <span className="breadcrumb-item">
            <FileText className="breadcrumb-icon" />
            <Link to={ROUTES.NOTIFICATIONS} className="breadcrumb-parent">
              Quản lý thông báo
            </Link>
          </span>
        ),
      },
      {
        title: (
          <span className="breadcrumb-item">
            {isEditOrDetail ? (
              <Link to={ROUTES.NOTIFICATIONS} className="breadcrumb-parent">
                Danh sách thông báo
              </Link>
            ) : (
              <span className="breadcrumb-current">Danh sách thông báo</span>
            )}
          </span>
        ),
      },
    ];

    if (isEditOrDetail) {
      notifItems.push({
        title: (
          <span className="breadcrumb-item">
            <span className="breadcrumb-current">Chi tiết thông báo</span>
          </span>
        ),
      });
    }

    return (
      <Breadcrumb
        className="app-breadcrumb"
        items={notifItems}
        separator={<RightOutlined className="breadcrumb-separator-icon" />}
      />
    );
  }

  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return null;
  }

  const items = segments.map((segment, index) => {
    const path = `/${segments.slice(0, index + 1).join("/")}`;

    const isLast = index === segments.length - 1;

    const config = breadcrumbs[path];

    const isFacilityDetail =
      index === 1 &&
      segments[0] === ROUTES.FACILITIES.replace(/^\//, "") &&
      segment !== "user";

    const label = isFacilityDetail
      ? "Thông tin chi tiết"
      : (config?.label ?? segment);

    const parentPath =
      path === ROUTES.FACILITIES ||
      path === ROUTES.SOURCES ||
      path === ROUTES.SETTINGS;

    const isClickable = !isLast && !parentPath;

    return {
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
    };
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
