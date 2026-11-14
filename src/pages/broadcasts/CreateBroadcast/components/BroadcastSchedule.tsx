import { Checkbox, InputNumber, message, Radio, TimePicker } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { CircleMinus, CirclePlus } from "lucide-react";

import AppDateRangePicker from "../../../../components/common/AppDateRangePicker";
import AppIconButton from "../../../../components/common/AppIconButton";

import type {
  BroadcastMode,
  BroadcastRepeat,
  BroadcastTimeMode,
  BroadcastTimeSlot,
} from "../../data/createBroadcast.mock";

const weekdays = [
  { value: 1, label: "Thứ 2" },
  { value: 2, label: "Thứ 3" },
  { value: 3, label: "Thứ 4" },
  { value: 4, label: "Thứ 5" },
  { value: 5, label: "Thứ 6" },
  { value: 6, label: "Thứ 7" },
  { value: 0, label: "Chủ nhật" },
];

const parseTime = (value: string): Dayjs | null => {
  if (!/^\d{2}:\d{2}$/.test(value)) {
    return null;
  }

  const result = dayjs(`2000-01-01T${value}:00`);

  return result.isValid() ? result : null;
};

interface BroadcastScheduleProps {
  mode: BroadcastMode;
  onModeChange: (value: BroadcastMode) => void;

  repeat: BroadcastRepeat;
  onRepeatChange: (value: BroadcastRepeat) => void;

  timeMode: BroadcastTimeMode;
  onTimeModeChange: (value: BroadcastTimeMode) => void;

  dateRange: [Dayjs | null, Dayjs | null];
  onDateRangeChange: (value: [Dayjs | null, Dayjs | null]) => void;

  monthlyDateRange: [Dayjs | null, Dayjs | null];
  onMonthlyDateRangeChange: (value: [Dayjs | null, Dayjs | null]) => void;

  selectedWeekdays: number[];
  onSelectedWeekdaysChange: (values: number[]) => void;

  timeSlots: BroadcastTimeSlot[];
  onTimeSlotsChange: (values: BroadcastTimeSlot[]) => void;

  playCount: number;
  onPlayCountChange: (value: number) => void;
}

function BroadcastSchedule({
  mode,
  onModeChange,
  repeat,
  onRepeatChange,
  timeMode,
  onTimeModeChange,
  dateRange,
  onDateRangeChange,
  monthlyDateRange,
  onMonthlyDateRangeChange,
  selectedWeekdays,
  onSelectedWeekdaysChange,
  timeSlots,
  onTimeSlotsChange,
  playCount,
  onPlayCountChange,
}: BroadcastScheduleProps) {
  const updateTimeSlot = (
    id: string,
    field: "start" | "end",
    value: string,
  ) => {
    onTimeSlotsChange(
      timeSlots.map((slot) =>
        slot.id === id ? { ...slot, [field]: value } : slot,
      ),
    );
  };

  const addTimeSlot = () => {
    const newSlot: BroadcastTimeSlot = {
      id: crypto.randomUUID(),
      start: "08:30",
      end: "09:00",
    };

    onTimeSlotsChange([...timeSlots, newSlot]);
  };

  const removeTimeSlot = (id: string) => {
    if (timeSlots.length <= 1) {
      message.warning("Cần ít nhất một giờ phát");
      return;
    }

    onTimeSlotsChange(timeSlots.filter((slot) => slot.id !== id));
  };

  return (
    <section className="create-broadcast__section create-broadcast__schedule-section">
      <h2>2. Lịch phát bản tin</h2>

      <div className="create-broadcast__field-label">
        Chế độ phát:
        <span className="required">*</span>
      </div>

      <Radio.Group
        className="create-broadcast__segmented create-broadcast__broadcast-mode"
        value={mode}
        optionType="button"
        buttonStyle="solid"
        onChange={(event) => onModeChange(event.target.value as BroadcastMode)}>
        <Radio.Button value="scheduled">Phát theo lịch</Radio.Button>

        <Radio.Button value="immediate">
          Phát ngay sau khi phê duyệt
        </Radio.Button>
      </Radio.Group>

      {mode === "scheduled" && (
        <div className="create-broadcast__schedule-box">
          <div className="create-broadcast__schedule-grid">
            {/* CỘT TRÁI: THỜI GIAN PHÁT */}
            <div className="create-broadcast__schedule-left">
              <div className="create-broadcast__field-label">
                Thời gian áp dụng:
                <span className="required">*</span>
              </div>

              <AppDateRangePicker
                width={530}
                value={dateRange}
                onChange={onDateRangeChange}
                startPlaceholder="Ngày bắt đầu"
                endPlaceholder="Ngày kết thúc"
                className="create-broadcast__date-range"
              />

              <Radio.Group
                className="create-broadcast__segmented create-broadcast__time-mode"
                value={timeMode}
                optionType="button"
                buttonStyle="solid"
                onChange={(event) =>
                  onTimeModeChange(event.target.value as BroadcastTimeMode)
                }>
                <Radio.Button value="fixed">Giờ phát</Radio.Button>

                <Radio.Button value="range">Phát theo khung giờ</Radio.Button>
              </Radio.Group>

              <div className="create-broadcast__time-list">
                {timeSlots.map((slot, index) => (
                  <div key={slot.id} className="create-broadcast__time-row">
                    <TimePicker
                      format="HH:mm"
                      minuteStep={5}
                      inputReadOnly
                      suffixIcon={null}
                      allowClear={false}
                      value={parseTime(slot.start)}
                      placeholder="08:30"
                      onChange={(value) =>
                        updateTimeSlot(
                          slot.id,
                          "start",
                          value?.format("HH:mm") ?? "",
                        )
                      }
                      className="create-broadcast__start-time"
                    />

                    <TimePicker
                      format="HH:mm"
                      minuteStep={5}
                      inputReadOnly
                      suffixIcon={null}
                      allowClear={false}
                      value={parseTime(slot.end)}
                      placeholder="09:00"
                      onChange={(value) =>
                        updateTimeSlot(
                          slot.id,
                          "end",
                          value?.format("HH:mm") ?? "",
                        )
                      }
                      className="create-broadcast__end-time"
                    />

                    <AppIconButton
                      icon={<CircleMinus size={22} />}
                      tooltip="Xóa giờ phát"
                      size={36}
                      iconSize={22}
                      onClick={() => removeTimeSlot(slot.id)}
                      className="create-broadcast__remove-time"
                    />

                    {index === 0 && (
                      <div className="create-broadcast__play-count">
                        <label htmlFor="broadcast-play-count">
                          Số lần phát
                          <span className="required">*</span>
                        </label>

                        <InputNumber
                          id="broadcast-play-count"
                          min={1}
                          max={999}
                          controls={false}
                          value={playCount}
                          formatter={(value) =>
                            String(value ?? "").padStart(2, "0")
                          }
                          onChange={(value) => onPlayCountChange(value ?? 1)}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="create-broadcast__add-time"
                onClick={addTimeSlot}>
                <CirclePlus size={22} />
                Thêm giờ phát
              </button>
            </div>

            {/* CỘT PHẢI: KIỂU LẶP LẠI */}
            <div className="create-broadcast__schedule-right">
              <div className="create-broadcast__field-label">
                Kiểu lặp lại bản tin
              </div>

              <Radio.Group
                className="create-broadcast__segmented create-broadcast__repeat-mode"
                value={repeat}
                optionType="button"
                buttonStyle="solid"
                onChange={(event) =>
                  onRepeatChange(event.target.value as BroadcastRepeat)
                }>
                <Radio.Button value="daily">Lặp hằng ngày</Radio.Button>

                <Radio.Button value="weekly">
                  Lặp theo tuần vào các ngày
                </Radio.Button>

                <Radio.Button value="monthly">
                  Lặp theo tháng vào các ngày
                </Radio.Button>
              </Radio.Group>

              {repeat === "weekly" && (
                <Checkbox.Group
                  className="create-broadcast__weekdays"
                  value={selectedWeekdays}
                  onChange={(values) =>
                    onSelectedWeekdaysChange(values as number[])
                  }>
                  {weekdays.map((day) => (
                    <Checkbox key={day.value} value={day.value}>
                      {day.label}
                    </Checkbox>
                  ))}
                </Checkbox.Group>
              )}

              {repeat === "monthly" && (
                <AppDateRangePicker
                  width={530}
                  value={monthlyDateRange}
                  onChange={onMonthlyDateRangeChange}
                  startPlaceholder="Ngày bắt đầu"
                  endPlaceholder="Ngày kết thúc"
                  className="create-broadcast__monthly-date-range"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default BroadcastSchedule;
