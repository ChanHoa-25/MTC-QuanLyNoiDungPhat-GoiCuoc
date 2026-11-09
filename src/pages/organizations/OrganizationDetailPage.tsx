import React from 'react';
import './OrganizationDetailPage.css';
import AppButton from '../../components/common/AppButton';
import AppStatusTag from '../../components/common/AppStatusTag';
import AppTable from '../../components/common/AppTable';
import AppDateRangePicker from '../../components/common/AppDateRangePicker';
import AppSearch from '../../components/common/AppSearch';

import type { OrganizationItem, TransactionRecord } from './types/organization.types';
import { MOCK_TRANSACTIONS } from './data/organizations.mock';

interface Props {
  org: OrganizationItem;
  onBack: () => void;
  onEdit: () => void;
  onChangePackage: () => void;
}

const OrganizationDetailPage: React.FC<Props> = ({ org, onBack, onEdit, onChangePackage }) => {
  const transactionColumns = [
    { title: 'Thời gian gia hạn', dataIndex: 'time', key: 'time', width: 170 },
    { title: 'Dung lượng', dataIndex: 'storage', key: 'storage', width: 100 },
    { title: 'Thời gian hiệu lực', dataIndex: 'validity', key: 'validity', width: 180 },
    { title: 'Giá gói cước', dataIndex: 'price', key: 'price', width: 130 },
    { title: 'Người gia hạn', dataIndex: 'handler', key: 'handler', width: 140 },
    { title: 'Số điện thoại', dataIndex: 'phone', key: 'phone', width: 130 },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 140,
      render: (status: string, record: TransactionRecord) => {
        const variantMap: Record<string, string> = { success: 'green', cancelled: 'orange', pending: 'blue', failed: 'red' };
        return <AppStatusTag type="status" variant={variantMap[status] as any || 'green'} label={record.statusLabel} />;
      },
    },
    { title: 'Phương thức', dataIndex: 'method', key: 'method', width: 130 },
  ];

  return (
    <div className="org-detail-container">
      <div className="org-detail-grid">
        {/* CỘT TRÁI */}
        <div className="org-detail-card">
          <h3 className="org-detail-title">Thông tin tổ chức</h3>
          <div className="org-detail-info-row">
            <span className="org-detail-label">Mã định danh tổ chức:</span> <strong>{org.code}</strong>
          </div>
          <div className="org-detail-info-row">
            <span className="org-detail-label">Tên tổ chức:</span> <strong>{org.name}</strong>
          </div>
          <div className="org-detail-info-row">
            <span className="org-detail-label">Trạng thái:</span>{" "}
            <AppStatusTag
              type="status"
              variant={(org.status as any) || "green"}
              label={org.statusLabel || "Còn hạn"}
            />
          </div>
          <div className="org-detail-info-row mb-8">
            <span className="org-detail-label">Dung lượng sử dụng:</span> <strong>2GB / 3GB</strong>
          </div>
          <div className="org-progress-bg">
            <div className="org-progress-fill"></div>
          </div>
          
          <h3 className="org-detail-title mt-32">Thông tin tài khoản</h3>
          <div className="org-detail-info-row">
            <span className="org-detail-label">Họ và tên:</span> <strong>{org.representativeLastName} {org.representativeFirstName}</strong>
          </div>
          <div className="org-detail-info-row">
            <span className="org-detail-label">Tên đăng nhập:</span> <strong>{org.username}</strong>
          </div>
          <div className="org-detail-info-row">
            <span className="org-detail-label">Email:</span> <strong>{org.email}</strong>
          </div>
          <div className="org-detail-info-row">
            <span className="org-detail-label">Số điện thoại:</span> <strong>{org.phone}</strong>
          </div>
          <div className="org-detail-info-row">
            <span className="org-detail-label">Ngày sinh:</span> <strong>{org.birthday}</strong>
          </div>
          <div className="org-detail-info-row">
            <span className="org-detail-label">Múi giờ:</span> <strong>{org.timezone}</strong>
          </div>
          <div className="org-detail-actions" style={{ display: 'flex', gap: '12px' }}>
            <AppButton variant="primary" onClick={onEdit} width={140}>Chỉnh sửa</AppButton>
            <AppButton variant="outline" onClick={onBack} width={120}>Trở về</AppButton>
          </div>
        </div>

        {/* CỘT PHẢI */}
        <div className="org-detail-card">
          <h3 className="org-detail-title">Thông tin gói cước</h3>
          <div className="org-package-banner">
            <div className="org-package-box">
              <span className="org-package-box-gb">3GB</span>
              <div className="org-package-box-info">
                <span className="org-package-box-date">25/07/2023 - 25/08/2023</span>
                <div className="org-package-box-tags">
                  <span className="org-package-tag warning">3 ngày</span>
                  <span className="org-package-tag danger">Ngừng kinh doanh</span>
                </div>
              </div>
            </div>
            <button className="org-package-add-btn" onClick={onChangePackage}>+</button>
          </div>
          
          <h3 className="org-detail-title">Lịch sử giao dịch</h3>
          <div className="org-detail-filter-row">
            <div>
              <label className="org-detail-filter-label">Thời gian gia hạn</label>
              <AppDateRangePicker width={300} startPlaceholder="02/02/2000" endPlaceholder="00/00/0000" />
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label className="org-detail-filter-label">Từ khóa</label>
              <AppSearch width="100%" placeholder="Tên kênh/ URL/ Tần số" />
            </div>
          </div>
          
          {/* LỚP BỌC CHỐNG TRÀN BẢNG */}
          <div className="org-table-responsive-wrapper">
            <AppTable columns={transactionColumns} dataSource={MOCK_TRANSACTIONS} rowKey="id" pagination={{ pageSize: 10 }} />
          </div>
        </div>
      </div>
    </div>
  );
};
export default OrganizationDetailPage;