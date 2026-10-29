import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Progress,
  Button,
  Tag,
  Typography,
  Table,
  Modal,
  Alert,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  CreditCard,
  HardDrive,
  Tv,
  ArrowUpRight,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';
import { useMtcData } from '../../context/MtcDataContext';
import { useAuth } from '../../context/AuthContext';
import type { UpgradePackage, PackageTransaction } from '../../types';
import { formatVND, formatStorage, formatDate } from '../../utils/formatters';

const { Title, Text, Paragraph } = Typography;

export const OrgPackageManagerView: React.FC = () => {
  const {
    organizations,
    packages,
    upgradePackages,
    transactions,
    buyUpgradePackage,
    renewOrganizationPackage,
    cancelAutoRenew,
  } = useMtcData();
  const { currentUser } = useAuth();

  const [selectedUpg, setSelectedUpg] = useState<UpgradePackage | null>(null);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);

  const org = organizations.find((o) => o.id === currentUser.orgId) || organizations[0];
  const currentPkg = packages.find((p) => p.id === org.currentPackageId);

  const percentStorage = Math.min(
    100,
    Math.round((org.storageUsedMB / org.storageTotalMB) * 100)
  );

  const orgTransactions = transactions.filter((t) => t.orgId === org.id);

  const handleOpenBuyModal = (upg: UpgradePackage) => {
    setSelectedUpg(upg);
    setIsBuyModalOpen(true);
  };

  const handleConfirmBuyUpgrade = () => {
    if (!selectedUpg) return;
    buyUpgradePackage(org.id, selectedUpg.id);
    message.success(`Nâng cấp thành công gói [${selectedUpg.name}]! Dung lượng và số thiết bị đã được mở rộng.`);
    setIsBuyModalOpen(false);
  };

  const upgradeColumns: ColumnsType<UpgradePackage> = [
    {
      title: 'Tên gói nâng cấp',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record) => (
        <div>
          <Text strong style={{ fontSize: 14 }}>{name}</Text>
          <div style={{ fontSize: 12, color: '#6B7280' }}>{record.description}</div>
        </div>
      ),
    },
    {
      title: 'Bổ sung dung lượng',
      dataIndex: 'extraStorageGB',
      key: 'extraStorageGB',
      render: (gb: number) => <Tag color="blue">+{gb} GB</Tag>,
      width: 150,
    },
    {
      title: 'Bổ sung thiết bị',
      dataIndex: 'extraDevices',
      key: 'extraDevices',
      render: (dev: number) => <Tag color="purple">+{dev} Thiết bị</Tag>,
      width: 150,
    },
    {
      title: 'Giá gói',
      dataIndex: 'priceVND',
      key: 'priceVND',
      render: (p: number) => <span style={{ fontWeight: 700, color: '#FF7506' }}>{formatVND(p)}</span>,
      width: 140,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<ShoppingBag size={13} />}
          style={{ background: '#FF7506', borderColor: '#FF7506' }}
          onClick={() => handleOpenBuyModal(record)}
        >
          Mua gói này
        </Button>
      ),
      width: 130,
    },
  ];

  return (
    <div style={{ padding: '24px 28px' }}>
      <div style={{ marginBottom: 20 }}>
        <Title level={3} style={{ margin: 0, fontWeight: 800 }}>
          Gói Cước & Dung Lượng Tổ Chức (USR-PKG)
        </Title>
        <Text type="secondary" style={{ fontSize: 13 }}>
          Theo dõi hạn mức dung lượng lưu trữ, màn hình thiết bị và mua thêm các gói nâng cấp bổ sung
        </Text>
      </div>

      {/* Cảnh báo nếu sắp hết dung lượng (>90%) theo SRS NTF-11 */}
      {percentStorage >= 90 && (
        <Alert
          message="Cảnh báo sắp hết dung lượng lưu trữ (SRS NTF-11)"
          description={`Tổ chức đã sử dụng ${percentStorage}% dung lượng (${formatStorage(org.storageUsedMB)} / ${formatStorage(org.storageTotalMB)}). Vui lòng mua thêm gói nâng cấp để đảm bảo việc tải lên video không bị gián đoạn.`}
          type="error"
          showIcon
          style={{ marginBottom: 20 }}
        />
      )}

      {/* Thông tin gói cước hiện tại (USR-PKG-01) */}
      <Card
        style={{
          borderRadius: 12,
          marginBottom: 24,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <Row gutter={24} align="middle">
          <Col span={8}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  padding: 12,
                  borderRadius: 12,
                  background: '#FFF7ED',
                  color: '#FF7506',
                  display: 'flex',
                }}
              >
                <CreditCard size={28} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#6B7280' }}>Gói cước đang sử dụng:</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#111827' }}>
                  {currentPkg?.name || 'Gói tùy chỉnh'}
                </div>
                <div style={{ marginTop: 4 }}>
                  <Tag color="success">Đang gia hạn tự động</Tag>
                  <Tag color="blue">Hết hạn: {formatDate(org.expiryDate)}</Tag>
                </div>
              </div>
            </div>
          </Col>

          <Col span={8}>
            <div style={{ borderLeft: '1px solid #F3F4F6', paddingLeft: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#4B5563' }}>
                  Dung lượng lưu trữ:
                </span>
                <span style={{ fontSize: 12, fontWeight: 700 }}>
                  {formatStorage(org.storageUsedMB)} / {formatStorage(org.storageTotalMB)} ({percentStorage}%)
                </span>
              </div>
              <Progress
                percent={percentStorage}
                status={percentStorage >= 90 ? 'exception' : 'active'}
                strokeColor={percentStorage >= 90 ? '#EF4444' : '#FF7506'}
              />
            </div>
          </Col>

          <Col span={8}>
            <div style={{ borderLeft: '1px solid #F3F4F6', paddingLeft: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#4B5563', marginBottom: 4 }}>
                Số lượng thiết bị kết nối:
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#111827' }}>
                {org.deviceCount} <span style={{ fontSize: 13, color: '#6B7280', fontWeight: 400 }}>/ tối đa {org.maxDevices} thiết bị</span>
              </div>
              <div style={{ marginTop: 8 }}>
                <Button
                  size="small"
                  icon={<RefreshCw size={12} />}
                  onClick={() => {
                    renewOrganizationPackage(org.id);
                    message.success('Đã gia hạn gói cước thành công!');
                  }}
                >
                  Gia hạn gói (USR-PKG-02)
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Danh sách Gói Nâng Cấp Bán Sẵn (USR-PKG-04) */}
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ArrowUpRight size={18} color="#FF7506" />
            <span style={{ fontWeight: 700 }}>Danh Sách Gói Nâng Cấp Mua Thêm (USR-PKG-04)</span>
          </div>
        }
        style={{
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <Table
          dataSource={upgradePackages.filter((u) => u.status === 'selling')}
          columns={upgradeColumns}
          rowKey="id"
          pagination={false}
        />
      </Card>

      {/* Modal Mua Gói Nâng Cấp */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShoppingBag size={18} color="#FF7506" />
            <span>Xác Nhận Mua Gói Nâng Cấp (USR-PKG-04)</span>
          </div>
        }
        open={isBuyModalOpen}
        onCancel={() => setIsBuyModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsBuyModalOpen(false)}>Hủy</Button>,
          <Button
            key="buy"
            type="primary"
            style={{ background: '#FF7506', borderColor: '#FF7506' }}
            onClick={handleConfirmBuyUpgrade}
          >
            Thanh toán & Kích hoạt
          </Button>,
        ]}
      >
        {selectedUpg && (
          <div style={{ padding: '12px 0' }}>
            <Paragraph style={{ fontSize: 13, color: '#4B5563' }}>
              Bạn đang chọn mua gói nâng cấp: <strong>{selectedUpg.name}</strong>. Dung lượng và hạn mức thiết bị sẽ được cộng trực tiếp vào tổ chức ngay sau khi thanh toán.
            </Paragraph>

            <Card size="small" style={{ background: '#F8FAFC' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span>Dung lượng cộng thêm:</span>
                <strong style={{ color: '#2563EB' }}>+{selectedUpg.extraStorageGB} GB</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span>Thiết bị cộng thêm:</span>
                <strong style={{ color: '#7C3AED' }}>+{selectedUpg.extraDevices} màn hình</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E2E8F0', paddingTop: 6 }}>
                <span>Tổng chi phí:</span>
                <strong style={{ fontSize: 16, color: '#FF7506' }}>{formatVND(selectedUpg.priceVND)}</strong>
              </div>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};
