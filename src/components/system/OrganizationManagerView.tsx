import React, { useState } from 'react';
import {
  Table,
  Button,
  Tag,
  Space,
  Input,
  Modal,
  Form,
  Select,
  Typography,
  message,
  Card,
  Row,
  Col,
  Progress,
  Divider,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  Building2,
  Plus,
  RefreshCw,
  Trash2,
  Edit,
  ArrowRightLeft,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useMtcData } from '../../context/MtcDataContext';
import type { Organization } from '../../types';
import { formatVND, formatStorage, formatDate } from '../../utils/formatters';
import { calculatePackageSwitch, type PackageSwitchResult } from '../../utils/packageCalculator';

const { Title, Text, Paragraph } = Typography;

export const OrganizationManagerView: React.FC = () => {
  const {
    organizations,
    packages,
    facilities,
    addOrganization,
    updateOrganization,
    deleteOrganization,
    renewOrganizationPackage,
    cancelAutoRenew,
    switchOrganizationPackage,
  } = useMtcData();

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);

  // Form states
  const [addForm] = Form.useForm();

  // Switch package modal states
  const [selectedNewPkgId, setSelectedNewPkgId] = useState<string>('');
  const [usedDaysInput, setUsedDaysInput] = useState<number>(10);
  const [switchCalculation, setSwitchCalculation] = useState<PackageSwitchResult | null>(null);

  // Lọc tổ chức theo tìm kiếm
  const filteredOrgs = organizations.filter(
    (o) =>
      o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.orgCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Tính số ngày còn lại đến khi hết hạn
  const getDaysRemaining = (expiryDate: string): number => {
    const exp = new Date(expiryDate).getTime();
    const now = new Date().getTime();
    return Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
  };

  // Tính số địa bàn trực thuộc cấp gần nhất (SYS-ORG-01)
  const getFacilityCount = (orgId: string): number => {
    return facilities.filter((f) => f.orgId === orgId && f.parentId === null).length;
  };

  // Mở modal đổi gói cước (SYS-ORG-10)
  const handleOpenSwitchModal = (org: Organization) => {
    setSelectedOrg(org);
    const availableNewPkgs = packages.filter((p) => p.id !== org.currentPackageId && p.status === 'active');
    const firstNew = availableNewPkgs[0]?.id || '';
    setSelectedNewPkgId(firstNew);
    setUsedDaysInput(10);

    // Tính toán sơ bộ
    const oldPkg = packages.find((p) => p.id === org.currentPackageId);
    const newPkg = packages.find((p) => p.id === firstNew);
    if (oldPkg && newPkg) {
      const calc = calculatePackageSwitch({
        oldPrice: oldPkg.priceVND,
        oldTotalDays: oldPkg.durationMonths * 30,
        usedDays: 10,
        newPrice: newPkg.priceVND,
        newTotalDays: newPkg.durationMonths * 30,
      });
      setSwitchCalculation(calc);
    }
    setIsSwitchModalOpen(true);
  };

  // Thay đổi lựa chọn gói mới hoặc số ngày đã dùng
  const handleRecalculateSwitch = (newPkgId: string, usedDays: number) => {
    setSelectedNewPkgId(newPkgId);
    setUsedDaysInput(usedDays);
    if (!selectedOrg) return;

    const oldPkg = packages.find((p) => p.id === selectedOrg.currentPackageId);
    const newPkg = packages.find((p) => p.id === newPkgId);
    if (oldPkg && newPkg) {
      const calc = calculatePackageSwitch({
        oldPrice: oldPkg.priceVND,
        oldTotalDays: oldPkg.durationMonths * 30,
        usedDays,
        newPrice: newPkg.priceVND,
        newTotalDays: newPkg.durationMonths * 30,
      });
      setSwitchCalculation(calc);
    }
  };

  // Xác nhận đổi gói
  const handleConfirmSwitch = () => {
    if (!selectedOrg || !selectedNewPkgId) return;
    try {
      const { result } = switchOrganizationPackage(selectedOrg.id, selectedNewPkgId, usedDaysInput);
      message.success(`Đổi gói cước thành công! ${result.explanation}`);
      setIsSwitchModalOpen(false);
    } catch (err: any) {
      message.error(err.message || 'Lỗi đổi gói');
    }
  };

  // Xóa tổ chức (SYS-ORG-06: Chỉ xóa khi ở trạng thái Hủy bỏ)
  const handleDeleteOrg = (org: Organization) => {
    const res = deleteOrganization(org.id);
    if (res.success) {
      message.success(res.message);
    } else {
      message.error(res.message);
    }
  };

  // Cột bảng tổ chức theo chuẩn SRS SYS-ORG-01
  const columns: ColumnsType<Organization> = [
    {
      title: 'Mã định danh',
      dataIndex: 'orgCode',
      key: 'orgCode',
      render: (code: string) => <Tag color="blue" style={{ fontWeight: 700 }}>{code}</Tag>,
      width: 120,
    },
    {
      title: 'Tên tổ chức',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record) => (
        <div>
          <Text strong style={{ color: '#1F2937', fontSize: 14 }}>{name}</Text>
          <div style={{ fontSize: 11, color: '#6B7280' }}>
            Người liên hệ: {record.adminName} ({record.adminPhone})
          </div>
        </div>
      ),
    },
    {
      title: 'Số địa bàn (Cấp gần nhất)',
      key: 'facilities',
      render: (_, record) => (
        <Tag color="cyan">{getFacilityCount(record.id)} địa bàn</Tag>
      ),
      width: 140,
    },
    {
      title: 'Gói cước & Dung lượng',
      key: 'package',
      render: (_, record) => {
        const pkg = packages.find((p) => p.id === record.currentPackageId);
        const percent = Math.min(100, Math.round((record.storageUsedMB / record.storageTotalMB) * 100));
        return (
          <div style={{ minWidth: 160 }}>
            <div style={{ fontWeight: 600, fontSize: 12, color: '#374151' }}>
              {pkg?.name || record.currentPackageId}
            </div>
            <Progress
              percent={percent}
              size="small"
              status={percent >= 90 ? 'exception' : 'active'}
              strokeColor={percent >= 90 ? '#EF4444' : '#FF7506'}
            />
            <div style={{ fontSize: 11, color: '#6B7280' }}>
              {formatStorage(record.storageUsedMB)} / {formatStorage(record.storageTotalMB)} ({percent}%)
            </div>
          </div>
        );
      },
    },
    {
      title: 'Thời hạn & Hết hạn',
      key: 'validity',
      render: (_, record) => {
        const daysLeft = getDaysRemaining(record.expiryDate);
        return (
          <div style={{ fontSize: 12 }}>
            <div>Hiệu lực: {formatDate(record.startDate)}</div>
            <div>Hết hạn: {formatDate(record.expiryDate)}</div>
            <div style={{ fontWeight: 600, color: daysLeft < 7 ? '#EF4444' : '#10B981' }}>
              {daysLeft > 0 ? `Còn ${daysLeft} ngày` : `Quá hạn ${Math.abs(daysLeft)} ngày`}
            </div>
          </div>
        );
      },
      width: 160,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: Organization['status']) => {
        if (status === 'active') return <Tag color="success">Còn hạn</Tag>;
        if (status === 'expired') return <Tag color="warning">Hết hạn</Tag>;
        return <Tag color="error">Hủy bỏ tổ chức</Tag>;
      },
      width: 130,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size={4}>
          <Button
            size="small"
            icon={<ArrowRightLeft size={13} />}
            onClick={() => handleOpenSwitchModal(record)}
            title="Đổi gói cước (SYS-ORG-10)"
          >
            Đổi gói
          </Button>

          <Button
            size="small"
            type="text"
            icon={<RefreshCw size={13} color="#2563EB" />}
            onClick={() => {
              renewOrganizationPackage(record.id);
              message.success(`Đã gia hạn gói cước cho ${record.name}`);
            }}
            title="Gia hạn gói cước (SYS-ORG-08)"
          />

          <Button
            size="small"
            type="text"
            danger
            icon={<Trash2 size={13} />}
            onClick={() => handleDeleteOrg(record)}
            title="Xóa tổ chức (SYS-ORG-06)"
          />
        </Space>
      ),
      width: 160,
    },
  ];

  return (
    <div style={{ padding: '24px 28px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        <div>
          <Title level={3} style={{ margin: 0, fontWeight: 800 }}>
            Quản Lý Tổ Chức (SYS-ORG)
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Quản lý khách hàng nền tảng MTC, cây địa bàn, theo dõi gói cước và vòng đời tổ chức
          </Text>
        </div>

        <Space>
          <Input.Search
            placeholder="Tìm theo tên hoặc mã tổ chức..."
            allowClear
            style={{ width: 280 }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button
            type="primary"
            icon={<Plus size={16} />}
            style={{ background: '#FF7506', borderColor: '#FF7506' }}
            onClick={() => setIsAddModalOpen(true)}
          >
            Thêm tổ chức mới
          </Button>
        </Space>
      </div>

      <Table
        dataSource={filteredOrgs}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 8 }}
        style={{
          background: '#ffffff',
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      />

      {/* Modal Thêm Tổ Chức Mới (SYS-ORG-02) */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Building2 size={18} color="#FF7506" />
            <span>Thêm Tổ Chức Mới (SYS-ORG-02)</span>
          </div>
        }
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        footer={null}
        width={600}
      >
        <Form
          form={addForm}
          layout="vertical"
          onFinish={(values) => {
            const selectedPkg = packages.find((p) => p.id === values.packageId);
            const totalMB = selectedPkg ? selectedPkg.storageGB * 1024 : 5120;
            const startDate = new Date().toISOString().split('T')[0];
            const expDate = new Date();
            expDate.setMonth(expDate.getMonth() + (selectedPkg?.durationMonths || 1));

            addOrganization({
              orgCode: values.orgCode.toUpperCase(),
              name: values.name,
              currentPackageId: values.packageId,
              storageUsedMB: 0,
              storageTotalMB: totalMB,
              deviceCount: 0,
              maxDevices: 10,
              status: 'active',
              startDate,
              expiryDate: expDate.toISOString().split('T')[0],
              autoRenew: true,
              adminName: values.adminName,
              adminPhone: values.adminPhone,
              adminEmail: values.adminEmail,
            });
            message.success('Thêm tổ chức mới thành công!');
            setIsAddModalOpen(false);
            addForm.resetFields();
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="orgCode"
                label="Mã định danh tổ chức"
                rules={[{ required: true, message: 'Nhập mã tổ chức' }]}
              >
                <Input placeholder="Ví dụ: VNG_CORP" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Tên tổ chức"
                rules={[{ required: true, message: 'Nhập tên tổ chức' }]}
              >
                <Input placeholder="Tập đoàn Công nghệ..." />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="adminName"
                label="Họ tên người quản trị"
                rules={[{ required: true, message: 'Nhập họ tên' }]}
              >
                <Input placeholder="Nguyễn Văn A" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="adminPhone"
                label="Số điện thoại"
                rules={[{ required: true, message: 'Nhập SĐT' }]}
              >
                <Input placeholder="0901234567" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="adminEmail"
            label="Email tài khoản"
            rules={[{ required: true, type: 'email', message: 'Nhập email hợp lệ' }]}
          >
            <Input placeholder="admin@domain.com" />
          </Form.Item>

          <Form.Item
            name="packageId"
            label="Chọn gói cước ban đầu"
            rules={[{ required: true, message: 'Vui lòng chọn gói cước' }]}
          >
            <Select placeholder="Chọn gói cước bán sẵn">
              {packages
                .filter((p) => p.status === 'active')
                .map((p) => (
                  <Select.Option key={p.id} value={p.id}>
                    {p.name} — {formatVND(p.priceVND)} ({p.storageGB} GB, {p.durationMonths} tháng)
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>

          <div style={{ textAlign: 'right', marginTop: 16 }}>
            <Space>
              <Button onClick={() => setIsAddModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" style={{ background: '#FF7506', borderColor: '#FF7506' }}>
                Tạo tổ chức
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Modal Đổi Gói Cước với Công Thức Tính Tiền / Bù Ngày theo SYS-ORG-10 */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ArrowRightLeft size={18} color="#FF7506" />
            <span>Đổi Gói Cước Tổ Chức (SRS SYS-ORG-10)</span>
          </div>
        }
        open={isSwitchModalOpen}
        onCancel={() => setIsSwitchModalOpen(false)}
        footer={null}
        width={720}
      >
        {selectedOrg && (
          <div>
            <Card size="small" style={{ marginBottom: 16, background: '#F8FAFC' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text strong style={{ fontSize: 14 }}>Tổ chức: {selectedOrg.name}</Text>
                  <div style={{ fontSize: 12, color: '#64748B' }}>
                    Gói hiện tại: <strong>{packages.find((p) => p.id === selectedOrg.currentPackageId)?.name}</strong>
                  </div>
                </div>
                <Tag color="blue">{selectedOrg.orgCode}</Tag>
              </div>
            </Card>

            <Row gutter={16}>
              <Col span={14}>
                <Form.Item label={<Text strong>Chọn gói cước mới muốn đổi sang:</Text>}>
                  <Select
                    value={selectedNewPkgId}
                    onChange={(val) => handleRecalculateSwitch(val, usedDaysInput)}
                    style={{ width: '100%' }}
                  >
                    {packages
                      .filter((p) => p.id !== selectedOrg.currentPackageId && p.status === 'active')
                      .map((p) => (
                        <Select.Option key={p.id} value={p.id}>
                          {p.name} ({p.storageGB} GB) — {formatVND(p.priceVND)}
                        </Select.Option>
                      ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col span={10}>
                <Form.Item
                  label={
                    <Text strong>
                      Số ngày đã dùng gói cũ (C):
                    </Text>
                  }
                >
                  <Input
                    type="number"
                    min={0}
                    max={365}
                    value={usedDaysInput}
                    onChange={(e) =>
                      handleRecalculateSwitch(selectedNewPkgId, Number(e.target.value) || 0)
                    }
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Hiển thị kết quả tính toán tự động theo công thức SRS */}
            {switchCalculation && (
              <Card
                size="small"
                style={{
                  background: switchCalculation.isUpgrade ? '#F0FDF4' : '#EFF6FF',
                  borderColor: switchCalculation.isUpgrade ? '#BBF7D0' : '#BFDBFE',
                  marginBottom: 16,
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>
                  {switchCalculation.isUpgrade
                    ? '📈 Đổi sang gói giá cao hơn (Khấu trừ F & Tính thực thu)'
                    : '📉 Đổi sang gói giá thấp hơn (Quy đổi số ngày bù)'}
                </div>

                <div style={{ fontSize: 12, color: '#374151', marginBottom: 8, lineHeight: 1.5 }}>
                  {switchCalculation.explanation}
                </div>

                <Divider style={{ margin: '8px 0' }} />

                <Row gutter={16}>
                  <Col span={8}>
                    <div style={{ fontSize: 11, color: '#6B7280' }}>Giá trị còn lại gói cũ:</div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>
                      {formatVND(switchCalculation.oldResidualValue)}
                    </div>
                  </Col>

                  {switchCalculation.isUpgrade ? (
                    <>
                      <Col span={8}>
                        <div style={{ fontSize: 11, color: '#6B7280' }}>Số tiền được trừ (F):</div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: '#059669' }}>
                          -{formatVND(switchCalculation.deductionAmount || 0)}
                        </div>
                      </Col>
                      <Col span={8}>
                        <div style={{ fontSize: 11, color: '#6B7280' }}>Tổng thực thu (D - F):</div>
                        <div style={{ fontWeight: 800, fontSize: 16, color: '#DC2626' }}>
                          {formatVND(switchCalculation.finalAmountToPay)}
                        </div>
                      </Col>
                    </>
                  ) : (
                    <>
                      <Col span={8}>
                        <div style={{ fontSize: 11, color: '#6B7280' }}>Số ngày bù thêm:</div>
                        <div style={{ fontWeight: 700, fontSize: 16, color: '#2563EB' }}>
                          +{switchCalculation.compensationDays} ngày
                        </div>
                      </Col>
                      <Col span={8}>
                        <div style={{ fontSize: 11, color: '#6B7280' }}>Tổng thực thu:</div>
                        <div style={{ fontWeight: 800, fontSize: 16, color: '#059669' }}>
                          0 đ (Đã trừ hết)
                        </div>
                      </Col>
                    </>
                  )}
                </Row>
              </Card>
            )}

            <div style={{ textAlign: 'right' }}>
              <Space>
                <Button onClick={() => setIsSwitchModalOpen(false)}>Hủy bỏ</Button>
                <Button
                  type="primary"
                  style={{ background: '#FF7506', borderColor: '#FF7506' }}
                  onClick={handleConfirmSwitch}
                >
                  Xác nhận chuyển gói
                </Button>
              </Space>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
