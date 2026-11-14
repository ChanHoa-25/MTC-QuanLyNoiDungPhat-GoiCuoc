import { useState } from "react";
import type { Key } from "react";
import { useNavigate } from "react-router-dom";
import { Form, message } from "antd";
import type { Dayjs } from "dayjs";

import AppButton from "../../../components/common/AppButton";

import BroadcastInfo from "./components/BroadcastInfo";
import BroadcastSchedule from "./components/BroadcastSchedule";
import BroadcastContent from "./components/BroadcastContent";
import BroadcastScope from "./components/BroadcastScope";
import DeviceSelectionModal from "./components/DeviceSelectionModal";

import {
  broadcastMediaMock,
  broadcastSources,
  getCreatedBroadcasts,
  saveCreatedBroadcast,
} from "../data/createBroadcast.mock";

import type {
  BroadcastMode,
  BroadcastRepeat,
  BroadcastTimeMode,
  BroadcastTimeSlot,
  CreateBroadcastData,
} from "../data/createBroadcast.mock";

import "./CreateBroadcast.css";

interface BroadcastFormValues {
  code: string;
  title: string;
  category: string;
}

const createTimeSlot = (): BroadcastTimeSlot => ({
  id: crypto.randomUUID(),
  start: "08:30",
  end: "09:00",
});

const validDuration = (value: string): boolean => {
  return /^\d{2,}:[0-5]\d:[0-5]\d$/.test(value);
};

function CreateBroadcast() {
  const navigate = useNavigate();

  const [form] = Form.useForm<BroadcastFormValues>();

  // ==========================================
  // 1. THÔNG TIN BẢN TIN
  // ==========================================

  // Mã bản tin, tiêu đề và lĩnh vực
  // được quản lý bằng Ant Design Form.

  // ==========================================
  // 2. LỊCH PHÁT BẢN TIN
  // ==========================================

  const [mode, setMode] = useState<BroadcastMode>("scheduled");

  const [repeat, setRepeat] = useState<BroadcastRepeat>("weekly");

  const [timeMode, setTimeMode] = useState<BroadcastTimeMode>("fixed");

  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([
    null,
    null,
  ]);

  const [monthlyDateRange, setMonthlyDateRange] = useState<
    [Dayjs | null, Dayjs | null]
  >([null, null]);

  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([
    2, 3, 6, 0,
  ]);

  const [timeSlots, setTimeSlots] = useState<BroadcastTimeSlot[]>([
    createTimeSlot(),
    createTimeSlot(),
  ]);

  const [playCount, setPlayCount] = useState(5);

  // ==========================================
  // 3. NỘI DUNG PHÁT
  // ==========================================

  const [sourceType, setSourceType] = useState<string>("media");

  const [sourceId, setSourceId] = useState<string>(
    broadcastSources.find((item) => item.type === "media")?.value ?? "",
  );

  const [duration, setDuration] = useState<string>("00:00:00");

  const [mediaIds, setMediaIds] = useState<Key[]>(
    broadcastMediaMock.map((item) => item.id),
  );

  // ==========================================
  // 4. PHẠM VI PHÁT
  // ==========================================

  const [deviceIds, setDeviceIds] = useState<Key[]>([]);

  const [deviceKeyword, setDeviceKeyword] = useState<string>("");

  const [deviceModalOpen, setDeviceModalOpen] = useState<boolean>(false);

  // ==========================================
  // TRẠNG THÁI LƯU
  // ==========================================

  const [saving, setSaving] = useState(false);

  // ==========================================
  // XỬ LÝ LƯU BẢN TIN
  // ==========================================

  const handleSave = async () => {
    let values: BroadcastFormValues;

    // Kiểm tra thông tin bản tin
    try {
      values = await form.validateFields();
    } catch {
      message.warning("Vui lòng nhập đầy đủ thông tin bản tin");
      return;
    }

    const code = values.code.trim();
    const title = values.title.trim();

    if (!code || !title) {
      message.warning("Mã bản tin và tiêu đề không được để trống");
      return;
    }

    // Kiểm tra lịch phát
    const [startDate, endDate] = dateRange;

    const [monthlyStartDate, monthlyEndDate] = monthlyDateRange;

    if (mode === "scheduled") {
      // Thời gian áp dụng
      if (!startDate || !endDate) {
        message.warning("Vui lòng chọn thời gian áp dụng");
        return;
      }

      if (endDate.isBefore(startDate, "day")) {
        message.warning("Ngày kết thúc phải sau hoặc bằng ngày bắt đầu");
        return;
      }

      // Lặp theo tuần
      if (repeat === "weekly" && selectedWeekdays.length === 0) {
        message.warning("Vui lòng chọn ít nhất một ngày trong tuần");
        return;
      }

      // Lặp theo tháng
      if (repeat === "monthly") {
        if (!monthlyStartDate || !monthlyEndDate) {
          message.warning("Vui lòng chọn khoảng ngày lặp theo tháng");
          return;
        }

        if (monthlyEndDate.isBefore(monthlyStartDate, "day")) {
          message.warning("Ngày kết thúc lặp phải sau hoặc bằng ngày bắt đầu");
          return;
        }
      }

      // Giờ phát
      if (timeSlots.length === 0) {
        message.warning("Vui lòng thêm ít nhất một giờ phát");
        return;
      }

      const invalidTimeSlot = timeSlots.some(
        (slot) => !slot.start || !slot.end || slot.start >= slot.end,
      );

      if (invalidTimeSlot) {
        message.warning("Giờ kết thúc phải sau giờ bắt đầu");
        return;
      }

      // Số lần phát
      if (!Number.isInteger(playCount) || playCount < 1 || playCount > 999) {
        message.warning("Số lần phát phải từ 1 đến 999");
        return;
      }
    }

    // Kiểm tra nội dung phát
    if (!sourceId) {
      message.warning("Vui lòng chọn nguồn phát bản tin");
      return;
    }

    if (!validDuration(duration)) {
      message.warning("Thời lượng phải có định dạng HH:mm:ss");
      return;
    }

    if (mediaIds.length === 0) {
      message.warning("Vui lòng chọn ít nhất một nguồn tin");
      return;
    }

    // Kiểm tra phạm vi phát
    if (deviceIds.length === 0) {
      message.warning("Vui lòng chọn ít nhất một thiết bị phát");
      return;
    }

    setSaving(true);

    try {
      // Kiểm tra mã bản tin trùng
      const existingBroadcasts = getCreatedBroadcasts();

      const isDuplicate = existingBroadcasts.some(
        (item) => item.code.toLowerCase() === code.toLowerCase(),
      );

      if (isDuplicate) {
        message.warning("Mã bản tin đã tồn tại");
        return;
      }

      // Chuẩn bị dữ liệu lưu
      const data: CreateBroadcastData = {
        id: crypto.randomUUID(),

        // Thông tin bản tin
        code,
        title,
        category: values.category,

        // Lịch phát
        mode,

        startDate:
          mode === "scheduled"
            ? (startDate?.format("YYYY-MM-DD") ?? null)
            : null,

        endDate:
          mode === "scheduled" ? (endDate?.format("YYYY-MM-DD") ?? null) : null,

        repeat,

        weekdays:
          mode === "scheduled" && repeat === "weekly" ? selectedWeekdays : [],

        // Giữ trường cũ để tương thích dữ liệu mock
        monthDays: [],

        monthlyStartDate:
          mode === "scheduled" && repeat === "monthly"
            ? (monthlyStartDate?.format("YYYY-MM-DD") ?? null)
            : null,

        monthlyEndDate:
          mode === "scheduled" && repeat === "monthly"
            ? (monthlyEndDate?.format("YYYY-MM-DD") ?? null)
            : null,

        timeMode,

        timeSlots:
          mode === "scheduled"
            ? timeSlots.map((slot) => ({
                ...slot,
              }))
            : [],

        playCount,

        // Nội dung phát
        sourceType,
        sourceId,
        duration,
        mediaIds: mediaIds.map(String),

        // Phạm vi phát
        deviceIds: deviceIds.map(String),

        // Thời gian tạo
        createdAt: new Date().toISOString(),
      };

      // Lưu vào mock storage
      saveCreatedBroadcast(data);

      message.success("Thêm bản tin thành công");

      // Quay về danh sách bản tin
      navigate("/broadcasts");
    } catch (error) {
      console.error("Lỗi khi lưu bản tin:", error);

      message.error("Không thể lưu bản tin");
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // GIAO DIỆN
  // ==========================================

  return (
    <div className="create-broadcast">
      <h1 className="create-broadcast__title">Thêm bản tin điện tử</h1>

      <Form
        form={form}
        layout="vertical"
        className="create-broadcast__form"
        initialValues={{
          code: "",
          title: "",
          category: undefined,
        }}>
        {/* 1. THÔNG TIN BẢN TIN */}
        <BroadcastInfo />

        {/* 2. LỊCH PHÁT BẢN TIN */}
        <BroadcastSchedule
          mode={mode}
          onModeChange={setMode}
          repeat={repeat}
          onRepeatChange={setRepeat}
          timeMode={timeMode}
          onTimeModeChange={setTimeMode}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          monthlyDateRange={monthlyDateRange}
          onMonthlyDateRangeChange={setMonthlyDateRange}
          selectedWeekdays={selectedWeekdays}
          onSelectedWeekdaysChange={setSelectedWeekdays}
          timeSlots={timeSlots}
          onTimeSlotsChange={setTimeSlots}
          playCount={playCount}
          onPlayCountChange={setPlayCount}
        />

        {/* 3. NỘI DUNG PHÁT + 4. PHẠM VI PHÁT */}
        <div className="create-broadcast__bottom-grid">
          <BroadcastContent
            sourceType={sourceType}
            onSourceTypeChange={setSourceType}
            sourceId={sourceId}
            onSourceIdChange={setSourceId}
            duration={duration}
            onDurationChange={setDuration}
            mediaIds={mediaIds}
            onMediaIdsChange={setMediaIds}
          />

          <BroadcastScope
            deviceIds={deviceIds}
            onDeviceIdsChange={setDeviceIds}
            deviceKeyword={deviceKeyword}
            onDeviceKeywordChange={setDeviceKeyword}
            onOpenDeviceModal={() => setDeviceModalOpen(true)}
          />
        </div>

        {/* NÚT THAO TÁC */}
        <div className="create-broadcast__footer">
          <AppButton
            variant="outline"
            width={150}
            onClick={() => navigate("/broadcasts")}>
            Hủy
          </AppButton>

          <AppButton
            variant="primary"
            width={150}
            loading={saving}
            onClick={handleSave}>
            Lưu
          </AppButton>
        </div>
      </Form>

      {/* POPUP CHỌN THIẾT BỊ */}
      <DeviceSelectionModal
        open={deviceModalOpen}
        selectedIds={deviceIds}
        onCancel={() => setDeviceModalOpen(false)}
        onSave={(ids) => {
          setDeviceIds(ids);
          setDeviceModalOpen(false);
        }}
      />
    </div>
  );
}

export default CreateBroadcast;
