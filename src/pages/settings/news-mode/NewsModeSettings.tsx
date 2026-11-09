import { useCallback, useEffect, useMemo, useState } from "react";
import { Radio, Switch, InputNumber, message } from "antd";
import type { RadioChangeEvent } from "antd";
import { SquarePen, Check, Radio as RadioIcon, Clock, BellRing } from "lucide-react";

import type { AppActionPanelItem } from "../../../components/common/AppActionPanel";
import { useActionPanel } from "../../../contexts/ActionPanelContext";

import "./NewsModeSettings.css";

type BroadcastTargetMode = "facility" | "device";

export function NewsModeSettings() {
  const { setActions } = useActionPanel();

  const [isEditing, setIsEditing] = useState(false);

  // Settings states
  const [broadcastMode, setBroadcastMode] = useState<BroadcastTargetMode>("facility");
  const [allowEmergencyInterrupt, setAllowEmergencyInterrupt] = useState(true);
  const [allowFixedScheduleOverride, setAllowFixedScheduleOverride] = useState(true);
  const [autoRepeatCycleMinutes, setAutoRepeatCycleMinutes] = useState(30);
  const [maxBroadcastDurationMinutes, setMaxBroadcastDurationMinutes] = useState(60);
  const [transitionDelaySeconds, setTransitionDelaySeconds] = useState(5);
  const [autoMuteOtherChannels, setAutoMuteOtherChannels] = useState(true);
  const [volumeBalancePercent, setVolumeBalancePercent] = useState(85);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleSave = useCallback(() => {
    setIsEditing(false);
    message.success("Lưu cấu hình chế độ tạo bản tin thành công!");
  }, []);

  const actions = useMemo<AppActionPanelItem[]>(() => {
    if (!isEditing) {
      return [
        {
          key: "edit-news-mode",
          icon: <SquarePen size={24} color="#F26D21" />,
          tooltip: "Chỉnh sửa cấu hình",
          onClick: handleEdit,
        },
      ];
    }
    return [
      {
        key: "save-news-mode",
        icon: <Check size={24} color="#52C41A" />,
        tooltip: "Lưu cấu hình",
        onClick: handleSave,
      },
    ];
  }, [isEditing, handleEdit, handleSave]);

  useEffect(() => {
    setActions(actions);
    return () => {
      setActions([]);
    };
  }, [actions, setActions]);

  return (
    <div className="news-mode-settings">
      <h1 className="news-mode-settings__title">Thiết lập Chế độ tạo bản tin</h1>
      <p className="news-mode-settings__subtitle">
        Cấu hình quy tắc phát sóng, phạm vi truyền phát và mức độ ưu tiên giữa các loại bản tin
      </p>

      <div className="news-mode-settings__card">
        {/* 1. Chế độ phân bổ phát sóng */}
        <div className="news-mode-settings__section">
          <div className="news-mode-settings__section-title">
            <RadioIcon size={18} color="#F26D21" />
            <span>Phạm vi đối tượng nhận bản tin (Mặc định hệ thống)</span>
          </div>

          <Radio.Group
            value={broadcastMode}
            disabled={!isEditing}
            onChange={(e: RadioChangeEvent) => setBroadcastMode(e.target.value)}
            style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Radio value="facility" style={{ fontSize: 14 }}>
              <strong>Phát theo cơ sở (Khuyến nghị):</strong> Cho phép cơ sở tự động điều phối tới
              tất cả thiết bị trực thuộc được gán quyền phát.
            </Radio>
            <Radio value="device" style={{ fontSize: 14 }}>
              <strong>Phát trực tiếp theo từng thiết bị:</strong> Chọn lọc cụ thể từng cụm loa hoặc
              màn hình LED riêng lẻ cho mỗi lịch phát.
            </Radio>
          </Radio.Group>
        </div>

        {/* 2. Quy tắc ưu tiên phát sóng */}
        <div className="news-mode-settings__section">
          <div className="news-mode-settings__section-title">
            <BellRing size={18} color="#F26D21" />
            <span>Độ ưu tiên phát sóng & ngắt luồng</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <strong style={{ fontSize: 14, color: "#2B2B2B", display: "block" }}>
                  Cho phép bản tin Khẩn cấp ngắt các bản tin đang phát
                </strong>
                <span style={{ fontSize: 13, color: "#8C8C8C" }}>
                  Bản tin bão lũ, cảnh báo thiên tai từ trung ương sẽ lập tức chiếm quyền phát trên toàn bộ thiết bị
                </span>
              </div>
              <Switch
                checked={allowEmergencyInterrupt}
                disabled={!isEditing}
                onChange={setAllowEmergencyInterrupt}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <strong style={{ fontSize: 14, color: "#2B2B2B", display: "block" }}>
                  Bảo lưu lịch phát định kỳ cố định
                </strong>
                <span style={{ fontSize: 13, color: "#8C8C8C" }}>
                  Không cho phép các bản tin đột xuất thông thường ghi đè khung giờ phát tin thời sự cố định
                </span>
              </div>
              <Switch
                checked={allowFixedScheduleOverride}
                disabled={!isEditing}
                onChange={setAllowFixedScheduleOverride}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <strong style={{ fontSize: 14, color: "#2B2B2B", display: "block" }}>
                  Tự động giảm âm lượng các kênh nền khi phát tin tiếng nói
                </strong>
                <span style={{ fontSize: 13, color: "#8C8C8C" }}>
                  Ducking audio để giọng đọc phát thanh rõ ràng hơn
                </span>
              </div>
              <Switch
                checked={autoMuteOtherChannels}
                disabled={!isEditing}
                onChange={setAutoMuteOtherChannels}
              />
            </div>
          </div>
        </div>

        {/* 3. Cấu hình thời gian & giới hạn */}
        <div className="news-mode-settings__section">
          <div className="news-mode-settings__section-title">
            <Clock size={18} color="#F26D21" />
            <span>Thời lượng & chu kỳ lặp lại</span>
          </div>

          <div className="news-mode-settings__grid">
            <div>
              <label style={{ fontSize: 13, color: "#595959", display: "block", marginBottom: 6 }}>
                Thời lượng tối đa 1 bản tin (phút)
              </label>
              <InputNumber
                min={5}
                max={360}
                value={maxBroadcastDurationMinutes}
                disabled={!isEditing}
                onChange={(val) => setMaxBroadcastDurationMinutes(val || 60)}
                style={{ width: "100%", height: 40 }}
              />
            </div>

            <div>
              <label style={{ fontSize: 13, color: "#595959", display: "block", marginBottom: 6 }}>
                Thời gian trễ chuyển đổi giữa các bản tin (giây)
              </label>
              <InputNumber
                min={0}
                max={60}
                value={transitionDelaySeconds}
                disabled={!isEditing}
                onChange={(val) => setTransitionDelaySeconds(val || 5)}
                style={{ width: "100%", height: 40 }}
              />
            </div>

            <div>
              <label style={{ fontSize: 13, color: "#595959", display: "block", marginBottom: 6 }}>
                Chu kỳ phát lại mặc định (phút)
              </label>
              <InputNumber
                min={10}
                max={1440}
                value={autoRepeatCycleMinutes}
                disabled={!isEditing}
                onChange={(val) => setAutoRepeatCycleMinutes(val || 30)}
                style={{ width: "100%", height: 40 }}
              />
            </div>

            <div>
              <label style={{ fontSize: 13, color: "#595959", display: "block", marginBottom: 6 }}>
                Mức âm lượng mặc định (%)
              </label>
              <InputNumber
                min={10}
                max={100}
                value={volumeBalancePercent}
                disabled={!isEditing}
                onChange={(val) => setVolumeBalancePercent(val || 85)}
                style={{ width: "100%", height: 40 }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewsModeSettings;
