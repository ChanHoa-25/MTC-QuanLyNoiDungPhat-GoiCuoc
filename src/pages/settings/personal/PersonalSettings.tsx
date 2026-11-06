import { useCallback, useEffect, useMemo, useState } from "react";
import { SquarePen } from "lucide-react";

import AppSelect from "../../../components/common/AppSelect";
import type { AppActionPanelItem } from "../../../components/common/AppActionPanel";
import { useActionPanel } from "../../../contexts/ActionPanelContext";

import "./PersonalSettings.css";

type NewsViewMode = "table" | "grid";

const timezoneOptions = [
  {
    label: "Hà Nội (GMT+07:00)",
    value: "Asia/Ho_Chi_Minh",
  },
  {
    label: "Bangkok (GMT+07:00)",
    value: "Asia/Bangkok",
  },
  {
    label: "Singapore (GMT+08:00)",
    value: "Asia/Singapore",
  },
  {
    label: "Tokyo (GMT+09:00)",
    value: "Asia/Tokyo",
  },
];

const newsViewOptions = [
  {
    label: "Dạng bảng",
    value: "table",
  },
  {
    label: "Dạng lưới",
    value: "grid",
  },
];

function PersonalSettings() {
  const { setActions } = useActionPanel();

  const [timezone, setTimezone] = useState("Asia/Ho_Chi_Minh");

  const [newsViewMode, setNewsViewMode] = useState<NewsViewMode>("table");

  const [isEditing, setIsEditing] = useState(false);

  // Bật chế độ chỉnh sửa
  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  // Danh sách action của trang
  const actions = useMemo<AppActionPanelItem[]>(
    () => [
      {
        key: "edit-personal-settings",
        icon: <SquarePen size={24} />,
        tooltip: "Chỉnh sửa cấu hình cá nhân",
        onClick: handleEdit,
      },
    ],
    [handleEdit],
  );

  // Đăng ký ActionPanel
  useEffect(() => {
    setActions(actions);
  }, [actions, setActions]);

  // Dọn dẹp khi rời trang
  useEffect(() => {
    return () => {
      setActions([]);
    };
  }, [setActions]);

  return (
    <div className="personal-settings">
      <h2 className="personal-settings__title">Cấu hình cá nhân</h2>

      <div className="personal-settings__form">
        {/* Múi giờ */}
        <div className="personal-settings__row">
          <label className="personal-settings__label">Múi giờ</label>

          <AppSelect
            width={325}
            value={timezone}
            disabled={!isEditing}
            options={timezoneOptions}
            onChange={(value) => setTimezone(value)}
          />
        </div>

        {/* Chế độ xem bản tin */}
        <div className="personal-settings__row">
          <label className="personal-settings__label">Chế độ xem bản tin</label>

          <AppSelect
            width={325}
            value={newsViewMode}
            disabled={!isEditing}
            options={newsViewOptions}
            onChange={(value) => setNewsViewMode(value as NewsViewMode)}
          />
        </div>
      </div>
    </div>
  );
}

export default PersonalSettings;
