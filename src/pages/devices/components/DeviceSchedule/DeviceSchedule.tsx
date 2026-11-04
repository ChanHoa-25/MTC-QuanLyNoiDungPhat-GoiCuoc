import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Clock3, Star, Radio } from "lucide-react";

import {
  deviceScheduleMock,
  scheduleCategories,
} from "../../data/deviceSchedule.mock";

import type { DeviceScheduleItem } from "../../types/deviceSchedule.types";

import "./DeviceSchedule.css";

interface DeviceScheduleProps {
  deviceId: string;
}

const START_HOUR = 6;
const END_HOUR = 14;
const HOUR_WIDTH = 100;

const WEEKDAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseTime(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);

  return hours + minutes / 60;
}

// Tính vị trí sự kiện trên timeline
function getScheduleStyle(item: DeviceScheduleItem) {
  const start = parseTime(item.startTime);
  const end = parseTime(item.endTime);

  const visibleStart = Math.max(start, START_HOUR);
  const visibleEnd = Math.min(end, END_HOUR);

  if (visibleEnd <= visibleStart) {
    return null;
  }

  return {
    left: (visibleStart - START_HOUR) * HOUR_WIDTH,
    width: (visibleEnd - visibleStart) * HOUR_WIDTH,
  };
}

function DeviceSchedule({ deviceId }: DeviceScheduleProps) {
  // Ngày mặc định phục vụ dữ liệu demo
  const [selectedDate, setSelectedDate] = useState(() => new Date(2026, 10, 3));

  const selectedDateString = formatDate(selectedDate);

  const monthLabel = `Tháng ${
    selectedDate.getMonth() + 1
  } ${selectedDate.getFullYear()}`;

  // Danh sách ngày trong tháng
  const calendarDays = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    return Array.from(
      { length: daysInMonth },
      (_, index) => new Date(year, month, index + 1),
    );
  }, [selectedDate]);

  // Lọc lịch phát theo thiết bị và ngày
  const schedules = useMemo(() => {
    return deviceScheduleMock.filter(
      (item) => item.deviceId === deviceId && item.date === selectedDateString,
    );
  }, [deviceId, selectedDateString]);

  // Chuyển tháng
  const changeMonth = (offset: number) => {
    setSelectedDate(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + offset, 1),
    );
  };

  // Danh sách giờ hiển thị
  const hours = useMemo(
    () =>
      Array.from(
        { length: END_HOUR - START_HOUR + 1 },
        (_, index) => START_HOUR + index,
      ),
    [],
  );

  return (
    <section className="device-schedule">
      {/* Header */}
      <div className="device-schedule__header">
        <h2>Lịch phát thiết bị</h2>

        <div className="device-schedule__month">
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            aria-label="Tháng trước">
            <ChevronLeft size={18} />
          </button>

          <span>{monthLabel}</span>

          <button
            type="button"
            onClick={() => changeMonth(1)}
            aria-label="Tháng sau">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Lịch chọn ngày */}
      <div className="device-schedule__calendar">
        {calendarDays.map((day) => {
          const dateKey = formatDate(day);
          const active = dateKey === selectedDateString;

          return (
            <button
              type="button"
              key={dateKey}
              className={[
                "device-schedule__day",
                active ? "device-schedule__day--active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-pressed={active}
              onClick={() => setSelectedDate(day)}>
              <span className="device-schedule__weekday">
                {WEEKDAYS[day.getDay()]}
              </span>

              <span className="device-schedule__day-number">
                {day.getDate()}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bảng lịch phát */}
      <div className="device-schedule__table-scroll">
        <div className="device-schedule__table">
          {/* Cột lĩnh vực */}
          <div className="device-schedule__categories">
            <div className="device-schedule__category-heading">Lĩnh vực</div>

            {scheduleCategories.map((category) => (
              <div key={category.key} className="device-schedule__category">
                {category.label}
              </div>
            ))}
          </div>

          {/* Timeline */}
          <div className="device-schedule__timeline">
            {/* Trục thời gian */}
            <div className="device-schedule__hours">
              {hours.map((hour) => (
                <span
                  key={hour}
                  className="device-schedule__hour"
                  style={{
                    left: (hour - START_HOUR) * HOUR_WIDTH,
                  }}>
                  {hour}:00
                </span>
              ))}
            </div>

            {/* Nội dung timeline */}
            <div className="device-schedule__timeline-body">
              {scheduleCategories.map((category) => {
                const categorySchedules = schedules.filter(
                  (item) => item.category === category.key,
                );

                return (
                  <div
                    key={category.key}
                    className="device-schedule__timeline-row">
                    {categorySchedules.map((item) => {
                      const position = getScheduleStyle(item);

                      // Bỏ qua lịch nằm ngoài khung giờ
                      if (!position) return null;

                      return (
                        <div
                          key={item.id}
                          className={[
                            "device-schedule__event",
                            item.priority
                              ? "device-schedule__event--priority"
                              : "",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                          style={{
                            left: position.left,
                            width: position.width,
                          }}
                          title={`${item.title}: ${item.startTime} - ${item.endTime}`}>
                          <div className="device-schedule__event-title">
                            {item.title}
                          </div>

                          <div className="device-schedule__event-time">
                            <Clock3 size={12} />
                            {item.startTime} - {item.endTime}
                          </div>

                          {item.priority && (
                            <div className="device-schedule__priority">
                              <Star size={13} />
                              Tin ưu tiên
                            </div>
                          )}

                          {item.status === "playing" && (
                            <Radio
                              className="device-schedule__playing-icon"
                              size={15}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default DeviceSchedule;
