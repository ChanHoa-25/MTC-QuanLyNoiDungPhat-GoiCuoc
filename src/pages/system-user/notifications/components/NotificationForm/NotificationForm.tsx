import React, { useEffect, useState } from "react";
import { Checkbox, message } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { X } from "lucide-react";

import AppModal from "../../../../../components/common/AppModal";
import AppButton from "../../../../../components/common/AppButton";
import AppInput from "../../../../../components/common/AppInput";
import AppTextarea from "../../../../../components/common/AppTextArea";
import AppSelect from "../../../../../components/common/AppSelect";
import AppDatePicker from "../../../../../components/common/AppDatePicker";

import type {
  NotificationFormValues,
  NotificationItem,
} from "../../types/notification.types";

import "./NotificationForm.css";

const AVAILABLE_ORGS = [
  "Hồ Chí Minh",
  "Hậu Giang",
  "Cần Thơ",
  "Gia Lai",
  "Buôn Mê Thuột",
  "Bình Dương",
  "Bình Phước",
  "Đồng Nai",
  "Cà Mau",
  "Bình Thạnh",
  "Bình Tân",
  "Tp.Thủ Đức",
  "Gò Vấp",
  "Quận 1",
  "Quận 3",
  "Quận 7",
  "Quận 12",
];

interface Props {
  open: boolean;
  mode: "create" | "edit";
  initialData?: NotificationItem | null;
  onClose: () => void;
  onSubmit: (data: NotificationFormValues) => void;
}

const createEmptyForm = (): NotificationFormValues => ({
  title: "",
  content: "",
  receivers: [],
  time: "",
  date: "",
  sysNotif: true,
  emailNotif: false,
});

const parseScheduledTime = (sendTime: string) => {
  const match = sendTime.match(/^(\d{2}\/\d{2}\/\d{4})\s+(\d{2}:\d{2})$/);

  if (!match) {
    return { date: "", time: "" };
  }

  return {
    date: match[1],
    time: match[2],
  };
};

const NotificationForm: React.FC<Props> = ({
  open,
  mode,
  initialData,
  onClose,
  onSubmit,
}) => {
  const isEdit = mode === "edit";

  const [form, setForm] = useState<NotificationFormValues>(createEmptyForm);

  useEffect(() => {
    if (!open) return;

    if (isEdit && initialData) {
      const scheduled = parseScheduledTime(initialData.sendTime);

      setForm({
        title: initialData.title,
        content: initialData.content,
        receivers: [...initialData.receiverList],
        date: scheduled.date,
        time: scheduled.time,
        sysNotif: true,
        emailNotif: false,
      });
    } else {
      setForm(createEmptyForm());
    }
  }, [open, isEdit, initialData]);

  const updateForm = (patch: Partial<NotificationFormValues>) => {
    setForm((previous) => ({
      ...previous,
      ...patch,
    }));
  };

  const handleRemoveTag = (tagToRemove: string) => {
    updateForm({
      receivers: form.receivers.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleAddReceiver = (value: string) => {
    if (!value || form.receivers.includes(value)) return;

    updateForm({
      receivers: [...form.receivers, value],
    });
  };

  const selectedDate: Dayjs | null = form.date
    ? dayjs(form.date, "DD/MM/YYYY")
    : null;

  const handleDateChange = (date: Dayjs | null) => {
    updateForm({
      date: date ? date.format("DD/MM/YYYY") : "",
    });
  };

  const handleSubmit = () => {
    const finalPayload: NotificationFormValues = {
      ...form,
      title: form.title.trim(),
      content: form.content.trim(),
      receivers: form.receivers
        .map((receiver) => receiver.trim())
        .filter(Boolean),
    };

    if (
      !finalPayload.title ||
      !finalPayload.content ||
      finalPayload.receivers.length === 0
    ) {
      message.error(
        "Vui lòng nhập tiêu đề, nội dung và chọn ít nhất một tổ chức nhận.",
      );
      return;
    }

    if (!finalPayload.sysNotif && !finalPayload.emailNotif) {
      message.error("Vui lòng chọn ít nhất một kênh gửi thông báo.");
      return;
    }

    if (
      (finalPayload.date && !finalPayload.time) ||
      (!finalPayload.date && finalPayload.time)
    ) {
      message.error("Vui lòng chọn đầy đủ ngày và giờ gửi thông báo.");
      return;
    }

    if (finalPayload.date) {
      const scheduled = dayjs(
        `${finalPayload.date} ${finalPayload.time}`,
        "DD/MM/YYYY HH:mm",
      );

      if (!scheduled.isValid() || scheduled.isBefore(dayjs())) {
        message.error("Thời gian hẹn gửi phải lớn hơn thời gian hiện tại.");
        return;
      }
    }

    onSubmit(finalPayload);
    onClose();
  };

  return (
    <AppModal
      open={open}
      title={isEdit ? "Chỉnh sửa thông báo" : "Thêm thông báo"}
      width={540}
      onCancel={onClose}
      footer={
        <div className="notif-form-footer">
          <AppButton variant="outline" width={120} onClick={onClose}>
            Hủy
          </AppButton>

          <AppButton variant="primary" width={140} onClick={handleSubmit}>
            {isEdit ? "Cập nhật" : "Tạo mới"}
          </AppButton>
        </div>
      }>
      <div className="notif-modal-scroll">
        <div className="notif-form-field">
          <label className="notif-form-label">
            Tiêu đề <span className="notif-required">*</span>
          </label>

          <AppInput
            width="100%"
            value={form.title}
            placeholder="Nhập tiêu đề"
            onChange={(event) => updateForm({ title: event.target.value })}
          />
        </div>

        <div className="notif-form-field">
          <label className="notif-form-label">
            Nội dung <span className="notif-required">*</span>
          </label>

          <AppTextarea
            width="100%"
            value={form.content}
            placeholder="Nhập nội dung thông báo"
            onChange={(event) => updateForm({ content: event.target.value })}
          />
        </div>

        <div className="notif-form-field">
          <label className="notif-form-label">
            Tổ chức nhận thông báo <span className="notif-required">*</span>
          </label>

          <div className="notif-tag-container">
            {form.receivers.length === 0 ? (
              <span className="notif-tag-placeholder">
                Chưa chọn tổ chức nào
              </span>
            ) : (
              form.receivers.map((tag) => (
                <div className="notif-tag" key={tag}>
                  <span>{tag}</span>

                  <button
                    type="button"
                    className="notif-tag-close"
                    aria-label={`Bỏ ${tag}`}
                    onClick={() => handleRemoveTag(tag)}>
                    <X size={14} />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="notif-org-select">
            <AppSelect
              width="100%"
              placeholder="Chọn thêm tổ chức nhận thông báo..."
              value={undefined}
              onChange={(value) => handleAddReceiver(String(value ?? ""))}
              options={AVAILABLE_ORGS.filter(
                (org) => !form.receivers.includes(org),
              ).map((org) => ({
                label: org,
                value: org,
              }))}
            />
          </div>
        </div>

        <div className="notif-form-field">
          <label className="notif-form-label">Hẹn thời gian gửi</label>

          <div className="notif-time-row">
            <input
              type="time"
              className="notif-time-input"
              value={form.time}
              onChange={(event) => updateForm({ time: event.target.value })}
            />

            <AppDatePicker
              width={180}
              value={selectedDate}
              onChange={handleDateChange}
              placeholder="DD/MM/YYYY"
            />
          </div>
        </div>

        <div className="notif-form-field">
          <label className="notif-form-label">
            Kênh gửi thông báo <span className="notif-required">*</span>
          </label>

          <div className="notif-checkbox-group">
            <Checkbox
              checked={form.sysNotif}
              onChange={(event) =>
                updateForm({
                  sysNotif: event.target.checked,
                })
              }>
              Thông báo hệ thống
            </Checkbox>

            <Checkbox
              checked={form.emailNotif}
              onChange={(event) =>
                updateForm({
                  emailNotif: event.target.checked,
                })
              }>
              Email
            </Checkbox>
          </div>
        </div>

        <p className="notif-required-note">
          <span className="notif-required">*</span> là trường bắt buộc
        </p>
      </div>
    </AppModal>
  );
};

export default NotificationForm;
