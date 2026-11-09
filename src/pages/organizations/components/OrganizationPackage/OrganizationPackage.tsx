import React, { useState } from 'react';
import './OrganizationPackage.css';
import AppModal from '../../../../components/common/AppModal';
import AppButton from '../../../../components/common/AppButton';
import AppInput from '../../../../components/common/AppInput';
import AppSelect from '../../../../components/common/AppSelect';
import AppDatePicker from '../../../../components/common/AppDatePicker';

interface Props {
  open: boolean;
  onClose: () => void;
}

const OrganizationPackage: React.FC<Props> = ({ open, onClose }) => {
  const [capacity, setCapacity] = useState('10');

  return (
    <AppModal
      open={open} title="Thay đổi gói cước" width={560} onCancel={onClose}
      footer={
        <div className="org-pkg-footer">
          <AppButton variant="outline" width={120} onClick={onClose}>Hủy</AppButton>
          <AppButton type="primary" width={120} onClick={onClose}>Lưu</AppButton>
        </div>
      }
    >
      <div className="org-pkg-modal-scroll">
        <div className="org-pkg-radio-group">
          <label className="org-pkg-radio-label"><input type="radio" name="pkgMode" defaultChecked className="org-pkg-radio" /> Gói có sẵn</label>
          <label className="org-pkg-radio-label"><input type="radio" name="pkgMode" className="org-pkg-radio" /> Gói khác</label>
        </div>
        <div className="org-pkg-field">
          <label className="org-pkg-label">Dung lượng *</label>
          <AppInput value={capacity} onChange={(e) => setCapacity(e.target.value)} width="100%" suffix="GB" />
        </div>
        <div className="org-pkg-grid-2">
          <div>
            <label className="org-pkg-label">Thời hạn *</label>
            <AppSelect width="100%" value="Tháng" options={[{ label: 'Tháng', value: 'Tháng' }]} />
          </div>
          <div>
            <label className="org-pkg-label">Thời hạn</label>
            <AppInput value="Tháng" disabled width="100%" />
          </div>
        </div>
        <div className="org-pkg-grid-2">
          <div>
            <label className="org-pkg-label">Thời gian hiệu lực *</label>
            <AppDatePicker width="100%" value={undefined} placeholder="12/12/2023" />
          </div>
          <div>
            <label className="org-pkg-label">Thời gian hết hạn</label>
            <AppInput value="12/12/2023" disabled width="100%" />
          </div>
        </div>
        <div className="org-pkg-field mt-16">
          <label className="org-pkg-label">Giá tiền *</label>
          <AppInput value="300.000" width="100%" suffix="VND" />
          <div className="org-pkg-summary">
            - 100.000 VND<br /><strong className="org-pkg-summary-total">Tổng thực thu 200.000 VND</strong>
          </div>
        </div>
      </div>
    </AppModal>
  );
};
export default OrganizationPackage;