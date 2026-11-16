import React, { useState, useEffect } from 'react';
import './NotificationForm.css';
import AppModal from '../../../../components/common/AppModal';
import AppButton from '../../../../components/common/AppButton';
import AppInput from '../../../../components/common/AppInput';
import AppSelect from '../../../../components/common/AppSelect';
import { message } from 'antd';

import type {
  NotificationFormValues,
  NotificationItem,
} from '../../types/notification.types';

const AVAILABLE_ORGS = [
  'Hồ Chí Minh',
  'Hậu Giang',
  'Cần Thơ',
  'Gia Lai',
  'Buôn Mê Thuột',
  'Bình Dương',
  'Bình Phước',
  'Đồng Nai',
  'Cà Mau',
  'Bình Thạnh',
  'Bình Tân',
  'Tp.Thủ Đức',
  'Gò Vấp',
  'Quận 1',
  'Quận 3',
  'Quận 7',
  'Quận 12',
];

interface Props {
  open: boolean;
  mode: 'create' | 'edit';
  initialData?: NotificationItem | null;
  onClose: () => void;
  onSubmit: (data: NotificationFormValues) => void;
}

const NotificationForm: React.FC<Props> = ({ open, mode, initialData, onClose, onSubmit }) => {
  const isEdit = mode === 'edit';
  
  const [form, setForm] = useState<NotificationFormValues>({
    title: '',
    content: '',
    receivers: [] as string[],
    time: '10:00',
    date: '10/03/2023',
    sysNotif: true,
    emailNotif: false,
  });

  useEffect(() => {
    if (open && initialData && isEdit) {
      const scheduledTime = initialData.sendTime.match(/^(.*)\s(\d{2}:\d{2})$/);
      setForm((prev) => ({
        ...prev,
        title: initialData.title,
        content: initialData.content,
        receivers: [...initialData.receiverList],
        date: scheduledTime?.[1] ?? '',
        time: scheduledTime?.[2] ?? '',
        sysNotif: true,
        emailNotif: false,
      }));
    } else if (open && !isEdit) {
      setForm({ title: '', content: '', receivers: ['Bình Thạnh', 'Bình Tân'], time: '', date: '', sysNotif: true, emailNotif: false });
    }
  }, [open, initialData, isEdit]);

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = form.receivers.filter((tag) => tag !== tagToRemove);
    setForm((previous) => ({ ...previous, receivers: updatedTags }));
  };

  const handleSubmit = () => {
    const finalPayload = {
      ...form,
      title: form.title.trim(),
      content: form.content.trim(),
      receivers: form.receivers.map((receiver) => receiver.trim()).filter(Boolean),
    };

    if (!finalPayload.title || !finalPayload.content || finalPayload.receivers.length === 0) {
      message.error('Vui lòng nhập tiêu đề, nội dung và chọn ít nhất một tổ chức nhận.');
      return;
    }

    if (!finalPayload.sysNotif && !finalPayload.emailNotif) {
      message.error('Vui lòng chọn ít nhất một kênh gửi thông báo.');
      return;
    }

    onSubmit(finalPayload);
    onClose();
  };

  return (
    <AppModal
      open={open} title={isEdit ? "Chỉnh sửa thông báo" : "Thêm thông báo"} width={520} onCancel={onClose}
      footer={
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '24px' }}>
          <AppButton variant="outline" width={120} onClick={onClose}>Hủy</AppButton>
          <AppButton type="primary" width={140} onClick={handleSubmit}>{isEdit ? "Cập nhật" : "Tạo mới"}</AppButton>
        </div>
      }
    >
      <div className="notif-modal-scroll">
        <div className="notif-form-field">
          <label className="notif-form-label">Tiêu đề *</label>
          <AppInput value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} width="100%" placeholder="Nhập tiêu đề" />
        </div>
        
        <div className="notif-form-field">
          <label className="notif-form-label">Nội dung *</label>
          <textarea 
            style={{ width: '100%', minHeight: '100px', padding: '12px', borderRadius: '8px', border: '1px solid #d9d9d9', fontFamily: 'inherit', resize: 'vertical' }}
            value={form.content} 
            onChange={(e) => setForm({...form, content: e.target.value})} 
          />
        </div>

        <div className="notif-form-field">
          <label className="notif-form-label">Tổ chức nhận thông báo *</label>
          <div className="notif-tag-container">
            {form.receivers.length === 0 ? (
              <span style={{ color: '#8c8c8c', fontSize: '13px' }}>Chưa chọn tổ chức nào</span>
            ) : (
              form.receivers.map((tag, index) => (
                <div key={index} className="notif-tag">
                  {tag} <span className="notif-tag-close" onClick={() => handleRemoveTag(tag)}>×</span>
                </div>
              ))
            )}
          </div>
          <div style={{ marginTop: '8px' }}>
            <AppSelect
              width="100%"
              placeholder="Chọn thêm tổ chức nhận thông báo..."
              value={undefined}
              onChange={(val) => {
                if (val && !form.receivers.includes(String(val))) {
                  setForm((prev) => ({ ...prev, receivers: [...prev.receivers, String(val)] }));
                }
              }}
              options={AVAILABLE_ORGS.filter((org) => !form.receivers.includes(org)).map((org) => ({
                label: org,
                value: org,
              }))}
            />
          </div>
        </div>

        <div className="notif-form-field">
          <label className="notif-form-label">Hẹn thời gian gửi</label>
          <div className="notif-time-row">
            <input type="time" className="notif-time-input" value={form.time} onChange={(e) => setForm({...form, time: e.target.value})} />
            <input type="text" className="notif-time-input" style={{ width: '140px' }} value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} placeholder="DD/MM/YYYY" />
          </div>
        </div>

        <div className="notif-form-field">
          <label className="notif-form-label">Kênh gửi thông báo *</label>
          <div className="notif-checkbox-group">
            <label className="notif-checkbox-label">
              <input type="checkbox" checked={form.sysNotif} onChange={(e) => setForm({...form, sysNotif: e.target.checked})} style={{ accentColor: '#F26522' }} />
              Thông báo hệ thống
            </label>
            <label className="notif-checkbox-label">
              <input type="checkbox" checked={form.emailNotif} onChange={(e) => setForm({...form, emailNotif: e.target.checked})} style={{ accentColor: '#F26522' }} />
              Email
            </label>
          </div>
        </div>
      </div>
    </AppModal>
  );
};
export default NotificationForm;