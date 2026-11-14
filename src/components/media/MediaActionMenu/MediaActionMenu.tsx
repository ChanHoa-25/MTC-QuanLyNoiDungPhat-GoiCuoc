import type { ReactNode } from "react";
import { Dropdown } from "antd";
import type { MenuProps } from "antd";

import {
  Info,
  CheckCheck,
  Ban,
  Share2,
  Download,
  RefreshCcwDot,
  SquarePlus,
  FileText,
  ListPlus,
  PanelsTopLeft,
  SquarePen,
  Trash2,
} from "lucide-react";

import "./MediaActionMenu.css";

export type MediaAction =
  | "view"
  | "edit"
  | "approve"
  | "reject"
  | "share"
  | "download"
  | "convert"
  | "createNews"
  | "createPlaylist"
  | "createTemplate"
  | "delete";

export type MediaMenuVariant = "detail" | "create";

interface MediaActionMenuProps {
  children: ReactNode;
  variant?: MediaMenuVariant;
  visibleActions?: MediaAction[];
  disabledActions?: MediaAction[];
  onAction: (action: MediaAction) => void;
}

type MenuItem = NonNullable<MenuProps["items"]>[number];

const actionIcons: Record<MediaAction, ReactNode> = {
  view: <Info size={18} strokeWidth={1.8} />,
  edit: <SquarePen size={18} strokeWidth={1.8} />,
  approve: <CheckCheck size={18} strokeWidth={1.8} />,
  reject: <Ban size={18} strokeWidth={1.8} />,
  share: <Share2 size={18} strokeWidth={1.8} />,
  download: <Download size={18} strokeWidth={1.8} />,
  convert: <RefreshCcwDot size={18} strokeWidth={1.8} />,
  createNews: <FileText size={18} strokeWidth={1.8} />,
  createPlaylist: <ListPlus size={18} strokeWidth={1.8} />,
  createTemplate: <PanelsTopLeft size={18} strokeWidth={1.8} />,
  delete: <Trash2 size={18} strokeWidth={1.8} />,
};
const actionLabels: Record<MediaAction, string> = {
  view: "Xem chi tiết",
  edit: "Chỉnh sửa",
  approve: "Duyệt",
  reject: "Từ chối duyệt",
  share: "Chia sẻ",
  download: "Tải xuống",
  convert: "Chuyển đổi chất lượng",
  createNews: "Tạo bản tin",
  createPlaylist: "Tạo danh sách phát",
  createTemplate: "Tạo bản mẫu",
  delete: "Xóa media",
};

const detailActions: MediaAction[] = [
  "view",
  "approve",
  "reject",
  "edit",
  "share",
  "download",
  "convert",
  "delete",
];

const createActions: MediaAction[] = [
  "createNews",
  "createPlaylist",
  "createTemplate",
  "view",
  "approve",
  "reject",
  "edit",
  "convert",
  "download",
  "share",
  "delete",
];

const createActionKeys: MediaAction[] = [
  "createNews",
  "createPlaylist",
  "createTemplate",
];

function MediaActionMenu({
  children,
  variant = "detail",
  visibleActions,
  disabledActions = [],
  onAction,
}: MediaActionMenuProps) {
  const defaultActions = variant === "detail" ? detailActions : createActions;

  const allowedActions = visibleActions ?? defaultActions;

  const hasAction = (action: MediaAction) => allowedActions.includes(action);

  const createItem = (action: MediaAction): MenuItem => ({
    key: action,
    label: actionLabels[action],
    icon: actionIcons[action],
    disabled: disabledActions.includes(action),
    danger: action === "delete",
  });

  const createSubmenuItems = createActionKeys.filter(hasAction).map(createItem);

  const items: MenuProps["items"] = [];

  if (variant === "create" && createSubmenuItems.length > 0) {
    items.push({
      key: "createFrom",
      label: "Tạo từ media này",
      icon: <SquarePlus size={18} strokeWidth={1.8} />,
      children: createSubmenuItems,
    });

    items.push({ type: "divider" });
  }

  const regularActions = defaultActions.filter(
    (action) => !createActionKeys.includes(action) && hasAction(action),
  );

  regularActions.forEach((action) => {
    if (action === "delete" && items.length > 0) {
      items.push({ type: "divider" });
    }

    items.push(createItem(action));
  });

  const handleClick: MenuProps["onClick"] = ({ key }) => {
    const action = key as MediaAction;

    if (allowedActions.includes(action) && !disabledActions.includes(action)) {
      onAction(action);
    }
  };

  return (
    <Dropdown
      trigger={["click"]}
      placement="bottomRight"
      menu={{
        items,
        onClick: handleClick,
        className: "media-action-menu",
      }}>
      {children}
    </Dropdown>
  );
}

export default MediaActionMenu;
