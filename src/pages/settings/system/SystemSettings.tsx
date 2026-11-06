import { useCallback, useEffect, useMemo, useState } from "react";
import { Radio } from "antd";
import type { RadioChangeEvent } from "antd";
import { SquarePen } from "lucide-react";

import AppSelect from "../../../components/common/AppSelect";
import type { AppActionPanelItem } from "../../../components/common/AppActionPanel";
import { useActionPanel } from "../../../contexts/ActionPanelContext";

import "./SystemSettings.css";

type NewsCreationMode = "facility" | "device";

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

function SystemSettings() {
  const { setActions } = useActionPanel();

  const [newsCreationMode, setNewsCreationMode] =
    useState<NewsCreationMode>("facility");

  const [timezone, setTimezone] = useState("Asia/Ho_Chi_Minh");

  const [isEditing, setIsEditing] = useState(false);

  // Bật chế độ chỉnh sửa
  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  // Danh sách action của trang
  const actions = useMemo<AppActionPanelItem[]>(
    () => [
      {
        key: "edit-system-settings",
        icon: <SquarePen size={24} />,
        tooltip: "Chỉnh sửa thiết lập hệ thống",
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

  const handleModeChange = (event: RadioChangeEvent) => {
    setNewsCreationMode(event.target.value as NewsCreationMode);
  };

  const handleTimezoneChange = (value: string) => {
    setTimezone(value);
  };

  return (
    <div className="system-settings">
      <h2 className="system-settings__title">Thiết lập hệ thống</h2>

      <div className="system-settings__form">
        {/* Chế độ tạo bản tin */}
        <div className="system-settings__row">
          <label className="system-settings__label">Chế độ tạo bản tin</label>

          <Radio.Group
            className="system-settings__radio-group"
            value={newsCreationMode}
            disabled={!isEditing}
            onChange={handleModeChange}>
            <Radio value="facility">Phát theo cơ sở</Radio>

            <Radio value="device">Phát theo thiết bị</Radio>
          </Radio.Group>
        </div>

        {/* Múi giờ */}
        <div className="system-settings__row">
          <label className="system-settings__label">Múi giờ</label>

          <AppSelect
            width={325}
            value={timezone}
            disabled={!isEditing}
            options={timezoneOptions}
            onChange={handleTimezoneChange}
          />
        </div>
      </div>
    </div>
  );
}

export default SystemSettings;
