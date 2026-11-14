import type { ReactNode } from "react";
import { FileText } from "lucide-react";

import { ROUTES } from "../../constants/route.constants";

export interface BroadcastBreadcrumbItem {
  label: string;
  path?: string;
  icon?: ReactNode;
}

export function getBroadcastBreadcrumbs(
  pathname: string,
  searchParams: URLSearchParams,
): BroadcastBreadcrumbItem[] | null {
  const basePath = ROUTES.BROADCASTS;

  const isBroadcastList = pathname === basePath;

  const isBroadcastDetail = new RegExp(`^${basePath}/[^/]+$`).test(pathname);

  if (!isBroadcastList && !isBroadcastDetail) {
    return null;
  }

  const isChildFacility = searchParams.get("tab") === "child-facility";

  const listPath = isChildFacility
    ? `${basePath}?tab=child-facility`
    : basePath;

  const root: BroadcastBreadcrumbItem = {
    label: "Quản lý bản tin",
    icon: <FileText className="breadcrumb-icon" />,
  };

  if (isBroadcastList) {
    return [
      root,
      {
        label: isChildFacility ? "Bản tin cơ sở con" : "Bản tin của cơ sở",
      },
    ];
  }

  return [
    root,
    {
      label: "Danh sách bản tin",
      path: listPath,
    },
    {
      label: "Chi tiết bản tin",
    },
  ];
}
