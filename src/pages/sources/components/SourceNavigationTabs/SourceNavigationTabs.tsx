import { useLocation, useNavigate } from "react-router-dom";
import AppTabs from "../../../../components/common/AppTabs";
import type { AppTabItem } from "../../../../components/common/AppTabs";
import { ROUTES } from "../../../../constants/route.constants";
import "./SourceNavigationTabs.css";

const SOURCE_TAB_ITEMS: AppTabItem[] = [
  {
    key: ROUTES.SOURCE_MEDIA,
    label: "Media",
  },
  {
    key: ROUTES.SOURCE_TEMPLATES,
    label: "Bản mẫu",
  },
  {
    key: ROUTES.SOURCE_PLAYLISTS,
    label: "Danh sách phát",
  },
  {
    key: ROUTES.SOURCE_SHARED,
    label: "Media được chia sẻ",
  },
];

function SourceNavigationTabs() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const activeKey =
    SOURCE_TAB_ITEMS.find(
      (item) => pathname === item.key || pathname.startsWith(`${item.key}/`),
    )?.key ?? ROUTES.SOURCE_MEDIA;

  return (
    <div className="source-nav-tabs">
      <AppTabs
        items={SOURCE_TAB_ITEMS}
        activeKey={activeKey}
        onChange={(key) => navigate(key)}
        ariaLabel="Danh mục quản lý nguồn thông tin"
      />
    </div>
  );
}

export default SourceNavigationTabs;

