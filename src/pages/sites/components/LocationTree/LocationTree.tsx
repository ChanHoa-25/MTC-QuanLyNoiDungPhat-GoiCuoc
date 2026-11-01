import { useEffect, useState } from "react";
import { Dropdown } from "antd";
import type { MenuProps } from "antd";

import {
  DownOutlined,
  RightOutlined,
  MoreOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";

import type { Site, SiteAction } from "../../types/site.types";

import "./LocationTree.css";

// Props của LocationTree
interface LocationTreeProps {
  sites: Site[];
  selectedId: string | null;
  onSelect: (site: Site) => void;
  onAction: (action: SiteAction, site: Site) => void;
}

// Tìm danh sách ID của các cơ sở cha
function findAncestorIds(
  sites: Site[],
  targetId: string,
  ancestors: string[] = [],
): string[] | null {
  for (const site of sites) {
    if (site.id === targetId) {
      return ancestors;
    }

    const found = findAncestorIds(site.children ?? [], targetId, [
      ...ancestors,
      site.id,
    ]);

    if (found) {
      return found;
    }
  }

  return null;
}

function LocationTree({
  sites,
  selectedId,
  onSelect,
  onAction,
}: LocationTreeProps) {
  // Các cơ sở đang được mở rộng
  const [expandedIds, setExpandedIds] = useState<string[]>(["hcm", "thu-duc"]);

  // Tự mở rộng các cấp cha của cơ sở được chọn
  useEffect(() => {
    if (!selectedId) return;

    const ancestorIds = findAncestorIds(sites, selectedId);

    if (!ancestorIds) return;

    setExpandedIds((previous) => [...new Set([...previous, ...ancestorIds])]);
  }, [selectedId, sites]);

  // Kiểm tra cơ sở đang mở rộng
  const isExpanded = (id: string) => expandedIds.includes(id);

  // Mở rộng hoặc thu gọn
  const toggleExpand = (id: string) => {
    setExpandedIds((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id],
    );
  };

  // Kiểm tra cơ sở Root
  const isRootSite = (site: Site) => sites.some((root) => root.id === site.id);

  // Menu thao tác của từng cơ sở
  const getMenuItems = (site: Site): MenuProps["items"] => [
    {
      key: "create",
      label: "Tạo cơ sở trực thuộc",
      onClick: () => onAction("create", site),
    },
    {
      key: "edit",
      label: "Cập nhật thông tin cơ sở",
      onClick: () => onAction("edit", site),
    },
    {
      key: "delete",
      label: "Xóa cơ sở",

      onClick: () => onAction("delete", site),
    },
  ];

  // Nút ba chấm
  const renderMoreButton = (site: Site, isRoot = false) => (
    <Dropdown
      menu={{ items: getMenuItems(site) }}
      trigger={["click"]}
      placement="rightTop"
      overlayClassName="location-action-dropdown">
      <button
        type="button"
        className={`location-more ${isRoot ? "location-more-root" : ""}`}
        aria-label={`Thao tác với ${site.name}`}
        onClick={(event) => event.stopPropagation()}>
        <MoreOutlined />
      </button>
    </Dropdown>
  );

  // Render đệ quy các cơ sở con
  const renderNode = (site: Site) => {
    const hasChildren = Boolean(site.children?.length);
    const expanded = isExpanded(site.id);
    const selected = selectedId === site.id;

    return (
      <div
        key={site.id}
        className={`location-node ${
          hasChildren ? "location-group" : "location-leaf"
        }`}>
        <div
          className={`location-row ${
            hasChildren ? "location-group-row" : "location-leaf-row"
          } ${selected ? "is-selected" : ""}`}>
          {hasChildren && (
            <button
              type="button"
              className="location-expand"
              aria-label={
                expanded ? `Thu gọn ${site.name}` : `Mở rộng ${site.name}`
              }
              aria-expanded={expanded}
              onClick={() => toggleExpand(site.id)}>
              {expanded ? <DownOutlined /> : <RightOutlined />}
            </button>
          )}

          <button
            type="button"
            className="location-name"
            title={site.name}
            onClick={() => onSelect(site)}>
            {site.name}
          </button>

          {renderMoreButton(site)}
        </div>

        {hasChildren && expanded && (
          <div className="location-children">
            {site.children?.map((child) => renderNode(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="location-tree">
      {sites.map((root) => {
        const expanded = isExpanded(root.id);

        return (
          <div key={root.id} className="location-root-block">
            {/* Root Header */}
            <div className="location-root-header">
              <button
                type="button"
                className="location-root-expand"
                aria-label={
                  expanded ? `Thu gọn ${root.name}` : `Mở rộng ${root.name}`
                }
                aria-expanded={expanded}
                onClick={() => toggleExpand(root.id)}>
                {expanded ? <DownOutlined /> : <RightOutlined />}
              </button>

              <button
                type="button"
                className="location-root-name"
                onClick={() => onSelect(root)}
                title={root.name}>
                <EnvironmentOutlined />
                <span>{root.name}</span>
              </button>

              {renderMoreButton(root, true)}
            </div>

            {/* Danh sách cơ sở trực thuộc Root */}
            {expanded && Boolean(root.children?.length) && (
              <div className="location-root-body">
                {root.children?.map((child) => renderNode(child))}
              </div>
            )}
          </div>
        );
      })}
    </aside>
  );
}

export default LocationTree;
