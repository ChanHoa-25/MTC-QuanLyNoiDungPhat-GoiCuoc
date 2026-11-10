import { useEffect, useState } from "react";
import { Dropdown } from "antd";
import type { MenuProps } from "antd";

import {
  DownOutlined,
  RightOutlined,
  MoreOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";

import type { Facility, FacilityAction } from "../../types/facility.types";

import { findFacilityPath } from "../../utils/facility.utils";

import "./LocationTree.css";

interface LocationTreeProps {
  facilities: Facility[];
  selectedId: string | null;
  onSelect: (facility: Facility) => void;
  onAction: (action: FacilityAction, facility: Facility) => void;
}

function LocationTree({
  facilities,
  selectedId,
  onSelect,
  onAction,
}: LocationTreeProps) {
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  // Mở rộng các cơ sở gốc sau khi API tải dữ liệu.
  useEffect(() => {
    setExpandedIds((previous) =>
      Array.from(new Set([...previous, ...facilities.map((facility) => facility.id)]))
    );
  }, [facilities]);

  // Mở rộng các cơ sở cha khi chọn cơ sở con.
  useEffect(() => {
    if (!selectedId) return;

    const path = findFacilityPath(facilities, selectedId);

    if (path.length === 0) return;

    const ancestorIds = path.slice(0, -1).map((facility) => facility.id);

    setExpandedIds((previous) => Array.from(new Set([...previous, ...ancestorIds])));
  }, [facilities, selectedId]);

  const isExpanded = (id: string) => expandedIds.includes(id);

  const toggleExpand = (id: string) => {
    setExpandedIds((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id],
    );
  };
  // Menu thao tác với cơ sở
  const getMenuItems = (facility: Facility): MenuProps["items"] => [
    {
      key: "create",
      label: "Tạo cơ sở trực thuộc",
      onClick: () => onAction("create", facility),
    },
    {
      key: "edit",
      label: "Cập nhật thông tin cơ sở",
      onClick: () => onAction("edit", facility),
    },
    {
      key: "delete",
      label: "Xóa cơ sở",
      onClick: () => onAction("delete", facility),
    },
  ];

  // Nút thao tác ba chấm
  const renderMoreButton = (facility: Facility, isRoot = false) => (
    <Dropdown
      menu={{ items: getMenuItems(facility) }}
      trigger={["click"]}
      placement="rightTop"
      overlayClassName="location-action-dropdown">
      <button
        type="button"
        className={`location-more ${isRoot ? "location-more-root" : ""}`}
        aria-label={`Thao tác với ${facility.facilityName}`}
        onClick={(event) => event.stopPropagation()}>
        <MoreOutlined />
      </button>
    </Dropdown>
  );

  // Render đệ quy các cơ sở con
  const renderNode = (facility: Facility) => {
    const hasChildren = Boolean(facility.children?.length);
    const expanded = isExpanded(facility.id);
    const selected = selectedId === facility.id;

    return (
      <div
        key={facility.id}
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
                expanded
                  ? `Thu gọn ${facility.facilityName}`
                  : `Mở rộng ${facility.facilityName}`
              }
              aria-expanded={expanded}
              onClick={() => toggleExpand(facility.id)}>
              {expanded ? <DownOutlined /> : <RightOutlined />}
            </button>
          )}

          <button
            type="button"
            className="location-name"
            title={facility.facilityName}
            aria-current={selected ? "true" : undefined}
            onClick={() => onSelect(facility)}>
            {facility.facilityName}
          </button>

          {renderMoreButton(facility)}
        </div>

        {hasChildren && expanded && (
          <div className="location-children">
            {facility.children?.map((child) => renderNode(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="location-tree">
      {facilities.map((root) => {
        const expanded = isExpanded(root.id);
        const selected = selectedId === root.id;

        return (
          <div key={root.id} className="location-root-block">
            <div
              className={`location-root-header ${
                selected ? "is-selected" : ""
              }`}>
              <button
                type="button"
                className="location-root-expand"
                aria-label={
                  expanded
                    ? `Thu gọn ${root.facilityName}`
                    : `Mở rộng ${root.facilityName}`
                }
                aria-expanded={expanded}
                onClick={() => toggleExpand(root.id)}>
                {expanded ? <DownOutlined /> : <RightOutlined />}
              </button>

              <button
                type="button"
                className="location-root-name"
                title={root.facilityName}
                aria-current={selected ? "true" : undefined}
                onClick={() => onSelect(root)}>
                <EnvironmentOutlined />
                <span>{root.facilityName}</span>
              </button>

              {renderMoreButton(root, true)}
            </div>

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
