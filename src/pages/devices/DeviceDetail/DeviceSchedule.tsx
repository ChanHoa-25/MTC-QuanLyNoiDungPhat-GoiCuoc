import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Clock3, Star, Radio } from "lucide-react";

import {
  deviceScheduleMock,
  scheduleCategories,
} from "../data/deviceSchedule.mock";

import type { DeviceScheduleItem } from "../types/deviceSchedule.types";

import "./DeviceSchedule.css";

interface DeviceScheduleProps {
  deviceId: string;
}

const START_HOUR = 6;
const END_HOUR = 14;
const HOUR_WIDTH = 100;
const TIMELINE_WIDTH = (END_HOUR - START_HOUR) * HOUR_WIDTH;

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

function getScheduleStyle(item: DeviceScheduleItem) {
  const start = parseTime(item.startTime);
  const end = parseTime(item.endTime);

  if (!Number.isFinite(start) || !Number.isFinite(end)) {
    return null;
  }

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
  const [selectedDate, setSelectedDate] = useState(() => new Date(2026, 10, 3));

  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 60_000);

    return () => window.clearInterval(timer);
  }, []);

  const selectedDateString = formatDate(selectedDate);

  const monthLabel = `Tháng ${
    selectedDate.getMonth() + 1
  } ${selectedDate.getFullYear()}`;

  const calendarDays = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    return Array.from(
      { length: daysInMonth },
      (_, index) => new Date(year, month, index + 1),
    );
  }, [selectedDate]);

  const schedules = useMemo(() => {
    return deviceScheduleMock.filter(
      (item) => item.deviceId === deviceId && item.date === selectedDateString,
    );
  }, [deviceId, selectedDateString]);

  const hours = useMemo(
    () =>
      Array.from(
        { length: END_HOUR - START_HOUR + 1 },
        (_, index) => START_HOUR + index,
      ),
    [],
  );

  const nowInHours = now.getHours() + now.getMinutes() / 60;

  const showCurrentTime =
    selectedDateString === formatDate(now) &&
    nowInHours >= START_HOUR &&
    nowInHours <= END_HOUR;

  const currentTimeLeft = (nowInHours - START_HOUR) * HOUR_WIDTH;

  const changeMonth = (offset: number) => {
    setSelectedDate((current) => {
      const nextDate = new Date(
        current.getFullYear(),
        current.getMonth() + offset,
        1,
      );

      return nextDate;
    });
  };

  return (
    <section className="device-schedule">
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

      <div className="device-schedule__table-scroll">
        <div className="device-schedule__table">
          <div className="device-schedule__categories">
            <div className="device-schedule__category-heading">Lĩnh vực</div>

            {scheduleCategories.map((category) => (
              <div key={category.key} className="device-schedule__category">
                {category.label}
              </div>
            ))}
          </div>

          <div
            className="device-schedule__timeline"
            style={{ width: TIMELINE_WIDTH }}>
            <div className="device-schedule__hours">
              {hours.map((hour) => (
                <span
                  key={hour}
                  className={[
                    "device-schedule__hour",
                    hour === END_HOUR ? "device-schedule__hour--last" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  style={{
                    left: (hour - START_HOUR) * HOUR_WIDTH,
                  }}>
                  {hour}:00
                </span>
              ))}
            </div>

            <div className="device-schedule__timeline-body">
              {scheduleCategories.map((category) => {
                const categorySchedules = schedules
                  .filter((item) => item.category === category.key)
                  .sort(
                    (a, b) => parseTime(a.startTime) - parseTime(b.startTime),
                  );

                return (
                  <div
                    key={category.key}
                    className="device-schedule__timeline-row">
                    {categorySchedules.map((item) => {
                      const position = getScheduleStyle(item);

                      if (!position) return null;

                      return (
                        <div
                          key={item.id}
                          className={[
                            "device-schedule__event",
                            item.priority
                              ? "device-schedule__event--priority"
                              : "",
                            item.status === "playing"
                              ? "device-schedule__event--playing"
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
                            <span>
                              {item.startTime} - {item.endTime}
                            </span>
                          </div>

                          {item.priority && (
                            <div className="device-schedule__priority">
                              <Star size={12} />
                              <span>Tin ưu tiên</span>
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

              {showCurrentTime && (
                <div
                  className="device-schedule__current-time"
                  style={{ left: currentTimeLeft }}
                  aria-label="Thời gian hiện tại"
                  title={`Hiện tại: ${now.toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}`}>
                  <span className="device-schedule__current-time-dot" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {schedules.length === 0 && (
        <div className="device-schedule__empty">
          Không có lịch phát trong ngày đã chọn.
        </div>
      )}
    </section>
  );
}

export default DeviceSchedule;
