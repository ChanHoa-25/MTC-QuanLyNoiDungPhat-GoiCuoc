import React, { useState, useEffect } from 'react';
import './OrganizationForm.css';
import AppModal from '../../../../components/common/AppModal';
import AppButton from '../../../../components/common/AppButton';
import AppInput from '../../../../components/common/AppInput';
import AppSelect from '../../../../components/common/AppSelect';
import AppDatePicker from '../../../../components/common/AppDatePicker';

import type { OrganizationItem } from '../../types/organization.types';

interface Props {
  open: boolean;
  mode: 'create' | 'edit';
  initialData?: OrganizationItem | null;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const OrganizationForm: React.FC<Props> = ({ open, mode, initialData, onClose, onSubmit }) => {
  const isEdit = mode === 'edit';
  
  const [form, setForm] = useState({
    code: '', name: '', lastName: '', firstName: '',
    phone: '', birthday: '', username: '', email: '', timezone: 'Hà Nội (GMT+07:00)',
    effectiveDate: '', expiryDate: '',
  });

  useEffect(() => {
    if (open && initialData && isEdit) {
      let loadedData = { ...initialData };
      setForm({
        code: loadedData.code || '',
        name: loadedData.name || '',
        lastName: loadedData.representativeLastName || '',
        firstName: loadedData.representativeFirstName || '',
        phone: loadedData.phone || '',
        birthday: loadedData.birthday || '',
        username: loadedData.username || '',
        email: loadedData.email || '',
        timezone: loadedData.timezone || 'Hà Nội (GMT+07:00)',
        effectiveDate: loadedData.effectiveDate || '',
        expiryDate: loadedData.expiryDate || '',
      });
    } else if (open && !isEdit) {
      setForm({ code: '', name: '', lastName: '', firstName: '', phone: '', birthday: '', username: '', email: '', timezone: 'Hà Nội (GMT+07:00)', effectiveDate: '', expiryDate: '' });
    }
  }, [open, initialData, isEdit]);

  const handleSubmit = () => {
    let finalPayload = { ...form };
    onSubmit(finalPayload);
    onClose();
  };

  return (
    <AppModal
      open={open} title={isEdit ? "Cập nhật thông tin tổ chức" : "Thêm tổ chức"} width={560} onCancel={onClose}
      footer={
        <div className="org-modal-footer">
          <AppButton variant="outline" width={120} onClick={onClose}>Hủy</AppButton>
          <AppButton type="primary" width={140} onClick={handleSubmit}>{isEdit ? "Cập nhật" : "Tạo tổ chức"}</AppButton>
        </div>
      }
    >
      <div className="org-modal-form-scroll">
        <h4 className="org-form-section-title">Thông tin tổ chức</h4>
        <div className="org-form-field">
          <label className="org-form-label">Mã định danh tổ chức *</label>
          <AppInput placeholder="Nhập mã định danh tổ chức" value={form.code} onChange={(e) => setForm({...form, code: e.target.value})} width="100%" />
        </div>
        <div className="org-form-field">
          <label className="org-form-label">Tên tổ chức *</label>
          <AppInput placeholder="Nhập tên tổ chức" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} width="100%" />
        </div>
        
        {isEdit && (
          <div className="org-form-checkbox-row">
            <span className="org-form-checkbox-text">Gia hạn tự động:</span>
            <input type="checkbox" defaultChecked className="org-form-checkbox" />
          </div>
        )}

        <h4 className="org-form-section-title dark">Thông tin tài khoản</h4>
        <div className="org-form-grid-2">
          <div>
            <label className="org-form-label">Họ *</label>
            <AppInput value={form.lastName} onChange={(e) => setForm({...form, lastName: e.target.value})} width="100%" />
          </div>
          <div>
            <label className="org-form-label">Tên *</label>
            <AppInput value={form.firstName} onChange={(e) => setForm({...form, firstName: e.target.value})} width="100%" />
          </div>
        </div>
        <div className="org-form-grid-2 mt-16">
          <div>
            <label className="org-form-label">Số điện thoại *</label>
            <AppInput value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} width="100%" />
          </div>
          <div>
            <label className="org-form-label">Ngày sinh</label>
            <AppInput value={form.birthday} onChange={(e) => setForm({...form, birthday: e.target.value})} width="100%" />
          </div>
        </div>
        <div className="org-form-grid-2 mt-16">
          <div>
            <label className="org-form-label">Tên đăng nhập *</label>
            <AppInput value={form.username} onChange={(e) => setForm({...form, username: e.target.value})} width="100%" />
          </div>
          {!isEdit && (
            <div>
              <label className="org-form-label">Mật khẩu *</label>
              <AppInput type="password" placeholder="Mật khẩu" width="100%" />
            </div>
          )}
        </div>
        <div className="org-form-field mt-16">
          <label className="org-form-label">Email *</label>
          <AppInput value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} width="100%" />
        </div>
        <div className="org-form-field mt-16">
          <label className="org-form-label">Múi giờ *</label>
          <AppSelect width="100%" value={form.timezone} onChange={(value) => setForm({ ...form, timezone: String(value ?? 'Hà Nội (GMT+07:00)') })} options={[{ label: 'Hà Nội (GMT+07:00)', value: 'Hà Nội (GMT+07:00)' }]} />
        </div>
        
        {!isEdit && (
          <>
            <h4 className="org-form-section-title dark">Thông tin gói cước sử dụng</h4>
            <div className="org-form-radio-group">
              <label className="org-form-radio-label"><input type="radio" name="pkg" defaultChecked className="org-form-radio" /> Gói có sẵn</label>
              <label className="org-form-radio-label"><input type="radio" name="pkg" className="org-form-radio" /> Gói khác</label>
            </div>
            <div className="org-form-grid-2">
              <div>
                <label className="org-form-label">Dung lượng *</label>
                <AppInput placeholder="Nhập số GB" width="100%" />
              </div>
              <div>
                <label className="org-form-label">Thời hạn *</label>
                <AppSelect width="100%" placeholder="Chọn loại" options={[{ label: 'Tháng', value: 'Tháng' }]} />
              </div>
            </div>
            <div className="org-form-grid-2 mt-16">
              <div>
                <label className="org-form-label">Thời gian hiệu lực *</label>
                <AppDatePicker width="100%" placeholder="12/12/2023" />
              </div>
              <div>
                <label className="org-form-label">Thời gian hết hạn</label>
                <AppInput value="12/12/2023" disabled width="100%" />
              </div>
            </div>
            <div className="org-form-field mt-16">
              <label className="org-form-label">Giá tiền *</label>
              <AppInput placeholder="Nhập số tiền VND" width="100%" />
            </div>
          </>
        )}
      </div>
    </AppModal>
  );
};
export default OrganizationForm;