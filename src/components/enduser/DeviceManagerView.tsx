import React, { useState, useMemo } from 'react';
import {
  Table,
  Button,
  Input,
  Select,
  Modal,
  Form,
  Slider,
  message,
  Steps,
  Timeline,
  Tag,
  Tooltip,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  Plus,
  Trash2,
  RotateCw,
  Volume2,
  SquarePen,
  Info,
  Radio,
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Download,
  Play,
  XCircle,
  WifiOff,
} from 'lucide-react';
import { useMtcData } from '../../context/MtcDataContext';
import { useAuth } from '../../context/AuthContext';
import type { Device } from '../../types';

export const DeviceManagerView: React.FC = () => {
  const {
    devices,
    facilities,
    addDevice,
    updateDevice,
    deleteDevice,
    setDevicesVolume,
    restartDevice,
  } = useMtcData();
  const { currentUser } = useAuth();

  // Mặc định chọn 2 dòng dev-mcls-09 và dev-mcls-10 theo đúng ảnh Figma
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([
    'dev-mcls-09',
    'dev-mcls-10',
  ]);

  // Bộ lọc 5 tiêu chí chuẩn theo ảnh Figma
  const [facilityFilter, setFacilityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [connectionFilter, setConnectionFilter] = useState('all');
  const [broadcastFilter, setBroadcastFilter] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isVolumeModalOpen, setIsVolumeModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [currentDevice, setCurrentDevice] = useState<Device | null>(null);

  const [volumeValue, setVolumeValue] = useState<number>(50);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  // Lọc danh sách thiết bị
  const filteredDevices = useMemo(() => {
    return devices.filter((d) => {
      // Lọc cơ sở
      if (facilityFilter !== 'all' && d.facilityId !== facilityFilter) return false;
      // Lọc trạng thái hoạt động
      if (statusFilter !== 'all' && d.status !== statusFilter) return false;
      // Lọc trạng thái kết nối
      if (connectionFilter !== 'all' && d.connectionStatus !== connectionFilter) return false;
      // Lọc trạng thái phát bản tin
      if (broadcastFilter !== 'all' && d.broadcastStatus !== broadcastFilter) return false;
      // Lọc từ khóa
      if (searchKeyword.trim() !== '') {
        const q = searchKeyword.toLowerCase();
        const matchName = d.name.toLowerCase().includes(q);
        const matchCode = d.deviceCode.toLowerCase().includes(q);
        const matchAddress = d.address.toLowerCase().includes(q);
        const matchSupplier = d.supplier.toLowerCase().includes(q);
        if (!matchName && !matchCode && !matchAddress && !matchSupplier) return false;
      }
      return true;
    });
  }, [devices, facilityFilter, statusFilter, connectionFilter, broadcastFilter, searchKeyword]);

  // Phân trang danh sách
  const paginatedDevices = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredDevices.slice(start, start + pageSize);
  }, [filteredDevices, currentPage]);

  const totalPages = Math.ceil(filteredDevices.length / pageSize) || 10;

  // Xử lý Checkbox row selection
  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  // Mở modal chỉnh sửa
  const handleOpenEdit = (record: Device) => {
    setCurrentDevice(record);
    editForm.setFieldsValue({
      name: record.name,
      deviceCode: record.deviceCode,
      supplier: record.supplier,
      address: record.address,
      status: record.status,
      connectionStatus: record.connectionStatus,
      broadcastStatus: record.broadcastStatus,
      volume: record.volume,
    });
    setIsEditModalOpen(true);
  };

  // Mở modal chi tiết & timeline phản hồi
  const handleOpenDetail = (record: Device) => {
    setCurrentDevice(record);
    setIsDetailModalOpen(true);
  };

  // Chỉnh âm lượng hàng loạt (USR-DEV-07)
  const handleOpenVolumeModal = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Vui lòng chọn ít nhất 1 thiết bị để điều chỉnh âm lượng.');
      return;
    }
    setVolumeValue(50);
    setIsVolumeModalOpen(true);
  };

  const handleApplyVolume = () => {
    setDevicesVolume(selectedRowKeys as string[], volumeValue);
    message.success(`Đã cập nhật âm lượng ${volumeValue}% cho ${selectedRowKeys.length} thiết bị.`);
    setIsVolumeModalOpen(false);
  };

  // Xóa thiết bị đã chọn
  const handleDeleteSelected = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Vui lòng chọn thiết bị cần xóa.');
      return;
    }
    Modal.confirm({
      title: 'Xác nhận xóa thiết bị',
      content: `Bạn có chắc chắn muốn xóa ${selectedRowKeys.length} thiết bị đã chọn? Thao tác này không thể hoàn tác.`,
      okText: 'Xóa ngay',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: () => {
        selectedRowKeys.forEach((key) => deleteDevice(key as string));
        setSelectedRowKeys([]);
        message.success('Đã xóa các thiết bị được chọn thành công.');
      },
    });
  };

  // Đồng bộ / Làm mới dữ liệu
  const handleReload = () => {
    message.loading({ content: 'Đang đồng bộ trạng thái kết nối và bản tin...', key: 'sync' });
    setTimeout(() => {
      message.success({ content: 'Đồng bộ toàn bộ danh sách thiết bị thành công!', key: 'sync' });
    }, 700);
  };

  // Định nghĩa các cột bảng chuẩn 100% Figma
  const columns: ColumnsType<Device> = [
    {
      title: 'Tên thiết bị',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <span style={{ color: '#374151', fontSize: 13, fontWeight: 500 }}>{text}</span>
      ),
    },
    {
      title: 'Mã định danh',
      dataIndex: 'deviceCode',
      key: 'deviceCode',
      render: (code: string) => (
        <span style={{ color: '#4B5563', fontSize: 13 }}>{code}</span>
      ),
    },
    {
      title: 'Nhà cung cấp',
      dataIndex: 'supplier',
      key: 'supplier',
      render: (supplier: string) => (
        <span style={{ color: '#4B5563', fontSize: 13 }}>{supplier}</span>
      ),
    },
    {
      title: 'Địa chỉ lắp đặt',
      dataIndex: 'address',
      key: 'address',
      render: (addr: string) => (
        <span style={{ color: '#4B5563', fontSize: 13 }}>{addr}</span>
      ),
    },
    {
      title: 'Trạng thái hoạt động',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (status: Device['status']) => {
        if (status === 'active') {
          return (
            <div className="status-pill green">
              <span className="status-pill-dot" />
              Đang hoạt động
            </div>
          );
        }
        return (
          <div className="status-pill red">
            <span className="status-pill-dot" />
            Ngưng hoạt động
          </div>
        );
      },
    },
    {
      title: 'Trạng thái kết nối',
      dataIndex: 'connectionStatus',
      key: 'connectionStatus',
      align: 'center',
      render: (cStatus: Device['connectionStatus']) => {
        if (cStatus === 'online') {
          return (
            <div className="status-pill green">
              <span className="status-pill-dot" />
              Đang kết nối
            </div>
          );
        }
        return (
          <div className="status-pill red">
            <span className="status-pill-dot" />
            Mất kết nối
          </div>
        );
      },
    },
    {
      title: 'Trạng thái phát bản tin',
      dataIndex: 'broadcastStatus',
      key: 'broadcastStatus',
      align: 'center',
      render: (bStatus: Device['broadcastStatus']) => {
        if (bStatus === 'broadcasting') {
          return (
            <div className="status-pill green">
              <span className="status-pill-dot" />
              Đang phát bản tin
            </div>
          );
        }
        return (
          <div className="status-pill red">
            <span className="status-pill-dot" />
            Dừng phát bản tin
          </div>
        );
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          {/* Nút Sửa */}
          <button
            onClick={() => handleOpenEdit(record)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#FF7506',
              display: 'flex',
              alignItems: 'center',
              padding: 2,
            }}
            title="Chỉnh sửa thiết bị"
          >
            <SquarePen size={18} strokeWidth={2} />
          </button>

          {/* Nút Xem chi tiết & Timeline phản hồi */}
          <button
            onClick={() => handleOpenDetail(record)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#FF7506',
              display: 'flex',
              alignItems: 'center',
              padding: 2,
            }}
            title="Xem chi tiết & Timeline phản hồi"
          >
            <Info size={18} strokeWidth={2} />
          </button>

          {/* Nút Điều khiển / Phát tức thì */}
          <button
            onClick={() => {
              message.info(`Điều khiển thiết bị: ${record.name} (${record.deviceCode})`);
              handleOpenDetail(record);
            }}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#FF7506',
              display: 'flex',
              alignItems: 'center',
              padding: 2,
            }}
            title="Cài đặt phát & cấu hình"
          >
            <Radio size={18} strokeWidth={2} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: '0 32px 32px 28px', position: 'relative' }}>
      {/* Khung Card chính màu trắng bo tròn theo mẫu Figma */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
          padding: '24px 28px 20px 28px',
          border: '1px solid #F3F4F6',
        }}
      >
        {/* Tiêu đề Card */}
        <h2
          style={{
            color: '#E05300',
            fontSize: 20,
            fontWeight: 700,
            marginBottom: 20,
            letterSpacing: -0.2,
          }}
        >
          Quản lý thiết bị phát bản tin điện tử
        </h2>

        {/* Thanh 5 Bộ Lọc nằm ngang chuẩn Figma */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr) 1.4fr',
            gap: 16,
            marginBottom: 20,
          }}
        >
          {/* Lọc 1: Cơ sở */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
              Cơ sở
            </div>
            <Select
              value={facilityFilter}
              onChange={(val) => setFacilityFilter(val)}
              style={{ width: '100%' }}
              options={[
                { value: 'all', label: 'Tất cả' },
                ...facilities.map((f) => ({ value: f.id, label: f.name })),
              ]}
            />
          </div>

          {/* Lọc 2: Trạng thái hoạt động */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
              Trạng thái hoạt động
            </div>
            <Select
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              style={{ width: '100%' }}
              options={[
                { value: 'all', label: 'Tất cả' },
                { value: 'active', label: 'Đang hoạt động' },
                { value: 'inactive', label: 'Ngưng hoạt động' },
              ]}
            />
          </div>

          {/* Lọc 3: Trạng thái kết nối */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
              Trạng thái kết nối
            </div>
            <Select
              value={connectionFilter}
              onChange={(val) => setConnectionFilter(val)}
              style={{ width: '100%' }}
              options={[
                { value: 'all', label: 'Tất cả' },
                { value: 'online', label: 'Đang kết nối' },
                { value: 'offline', label: 'Mất kết nối' },
              ]}
            />
          </div>

          {/* Lọc 4: Trạng thái phát bản tin */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
              Trạng thái phát bản tin
            </div>
            <Select
              value={broadcastFilter}
              onChange={(val) => setBroadcastFilter(val)}
              style={{ width: '100%' }}
              options={[
                { value: 'all', label: 'Tất cả' },
                { value: 'broadcasting', label: 'Đang phát bản tin' },
                { value: 'stopped', label: 'Dừng phát bản tin' },
              ]}
            />
          </div>

          {/* Lọc 5: Từ khóa */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
              Từ khóa
            </div>
            <Input
              placeholder="Tên media/người tạo"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              suffix={<Search size={15} color="#9CA3AF" />}
              style={{ borderRadius: 6 }}
            />
          </div>
        </div>

        {/* Bảng danh sách thiết bị chuẩn Peach Header */}
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={paginatedDevices}
          rowKey="id"
          pagination={false}
          className="mtc-table"
          style={{ width: '100%' }}
        />

        {/* Dòng chữ đếm số lượng thiết bị đã được chọn */}
        <div
          style={{
            marginTop: 14,
            marginBottom: 16,
            color: '#FF7506',
            fontSize: 13,
            fontWeight: 500,
            fontStyle: 'italic',
          }}
        >
          {String(selectedRowKeys.length).padStart(2, '0')} thiết bị đã được chọn
        </div>

        {/* Dòng Footer Phân trang & AltaSoftware */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 8,
            borderTop: '1px solid #F3F4F6',
          }}
        >
          {/* Trái: Hiển thị 10 nội dung trong mỗi trang */}
          <div style={{ fontSize: 13, color: '#4B5563', display: 'flex', alignItems: 'center' }}>
            Hiển thị <span className="mtc-page-size-box">10</span> nội dung trong mỗi trang
          </div>

          {/* Giữa: Powered by AltaSoftware */}
          <div
            style={{
              color: '#FF7506',
              fontSize: 13,
              fontStyle: 'italic',
              fontWeight: 500,
              userSelect: 'none',
            }}
          >
            Powered by <span style={{ fontWeight: 700 }}>AltaSoftware</span>
          </div>

          {/* Phải: Phân trang < [1] 2 3 4 5 ... 10 > */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {/* Prev */}
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                color: currentPage === 1 ? '#D1D5DB' : '#FF7506',
                display: 'flex',
                alignItems: 'center',
                padding: '4px',
              }}
            >
              <ChevronLeft size={16} />
            </button>

            {/* Trang 1 */}
            <button
              onClick={() => setCurrentPage(1)}
              style={{
                background: currentPage === 1 ? '#FF7506' : 'transparent',
                color: currentPage === 1 ? '#FFFFFF' : '#4B5563',
                border: 'none',
                borderRadius: 4,
                width: 26,
                height: 26,
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              1
            </button>

            {/* Trang 2 */}
            <button
              onClick={() => setCurrentPage(2)}
              style={{
                background: currentPage === 2 ? '#FF7506' : 'transparent',
                color: currentPage === 2 ? '#FFFFFF' : '#4B5563',
                border: 'none',
                borderRadius: 4,
                width: 26,
                height: 26,
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: 13,
              }}
            >
              2
            </button>

            {/* Trang 3 */}
            <button
              onClick={() => setCurrentPage(3)}
              style={{
                background: currentPage === 3 ? '#FF7506' : 'transparent',
                color: currentPage === 3 ? '#FFFFFF' : '#4B5563',
                border: 'none',
                borderRadius: 4,
                width: 26,
                height: 26,
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: 13,
              }}
            >
              3
            </button>

            {/* Trang 4 */}
            <button
              onClick={() => setCurrentPage(4)}
              style={{
                background: currentPage === 4 ? '#FF7506' : 'transparent',
                color: currentPage === 4 ? '#FFFFFF' : '#4B5563',
                border: 'none',
                borderRadius: 4,
                width: 26,
                height: 26,
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: 13,
              }}
            >
              4
            </button>

            {/* Trang 5 */}
            <button
              onClick={() => setCurrentPage(5)}
              style={{
                background: currentPage === 5 ? '#FF7506' : 'transparent',
                color: currentPage === 5 ? '#FFFFFF' : '#4B5563',
                border: 'none',
                borderRadius: 4,
                width: 26,
                height: 26,
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: 13,
              }}
            >
              5
            </button>

            <span style={{ color: '#9CA3AF', fontSize: 12 }}>...</span>

            {/* Trang 10 */}
            <button
              onClick={() => setCurrentPage(10)}
              style={{
                background: currentPage === 10 ? '#FF7506' : 'transparent',
                color: currentPage === 10 ? '#FFFFFF' : '#4B5563',
                border: 'none',
                borderRadius: 4,
                width: 26,
                height: 26,
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: 13,
              }}
            >
              10
            </button>

            {/* Next */}
            <button
              onClick={() => setCurrentPage((p) => Math.min(10, p + 1))}
              disabled={currentPage === 10}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: currentPage === 10 ? 'not-allowed' : 'pointer',
                color: currentPage === 10 ? '#D1D5DB' : '#FF7506',
                display: 'flex',
                alignItems: 'center',
                padding: '4px',
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Action Bar bên phải chuẩn 100% Figma */}
      <div className="floating-action-bar">
        {/* Nút 1: Thêm thiết bị mới (+) */}
        <button
          className="floating-action-btn"
          onClick={() => {
            form.resetFields();
            setIsAddModalOpen(true);
          }}
          title="Thêm thiết bị mới"
        >
          <Plus size={22} strokeWidth={2.5} />
        </button>

        {/* Nút 2: Xóa thiết bị đã chọn (Thùng rác) */}
        <button
          className="floating-action-btn"
          onClick={handleDeleteSelected}
          title="Xóa thiết bị đã chọn"
        >
          <Trash2 size={20} strokeWidth={2} />
        </button>

        {/* Nút 3: Đồng bộ / Làm mới dữ liệu */}
        <button
          className="floating-action-btn"
          onClick={handleReload}
          title="Đồng bộ & Làm mới"
        >
          <RotateCw size={20} strokeWidth={2} />
        </button>

        {/* Nút 4: Điều chỉnh âm lượng / Phát (Loa) */}
        <button
          className="floating-action-btn"
          onClick={handleOpenVolumeModal}
          title="Điều chỉnh âm lượng thiết bị"
        >
          <Volume2 size={20} strokeWidth={2} />
        </button>
      </div>

      {/* Modal 1: Thêm thiết bị mới */}
      <Modal
        title={<span style={{ color: '#E05300', fontWeight: 700 }}>Thêm Thiết Bị Phát Bản Tin Mới</span>}
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        onOk={() => {
          form.validateFields().then((vals) => {
            addDevice({
              orgId: currentUser.orgId || 'org-alta',
              name: vals.name,
              deviceCode: vals.deviceCode,
              facilityId: vals.facilityId || 'fac-root-alta',
              supplier: vals.supplier || 'MOBIFONE',
              os: 'Linux',
              simPhone: '0901234999',
              simSerial: '898401000000999',
              address: vals.address,
              lat: 10.7715,
              lng: 106.6548,
              volume: 50,
              status: 'active',
              connectionStatus: 'online',
              broadcastStatus: 'broadcasting',
            });
            message.success('Đã thêm thiết bị mới thành công!');
            setIsAddModalOpen(false);
          });
        }}
        okText="Thêm thiết bị"
        cancelText="Hủy"
        okButtonProps={{ style: { background: '#FF7506', borderColor: '#FF7506' } }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Tên thiết bị" rules={[{ required: true, message: 'Nhập tên thiết bị' }]}>
            <Input placeholder="Ví dụ: Cụm loa 11" />
          </Form.Item>
          <Form.Item name="deviceCode" label="Mã định danh" rules={[{ required: true, message: 'Nhập mã định danh' }]}>
            <Input placeholder="Ví dụ: MCLS11" />
          </Form.Item>
          <Form.Item name="supplier" label="Nhà cung cấp" initialValue="MOBIFONE">
            <Input placeholder="MOBIFONE" />
          </Form.Item>
          <Form.Item name="address" label="Địa chỉ lắp đặt" rules={[{ required: true, message: 'Nhập địa chỉ' }]}>
            <Input placeholder="Ví dụ: 86/33 Âu Cơ, P.9, Q.Tân Bình, TP.HCM" />
          </Form.Item>
          <Form.Item name="facilityId" label="Thuộc cơ sở" initialValue="fac-root-alta">
            <Select options={facilities.map((f) => ({ value: f.id, label: f.name }))} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal 2: Chỉnh sửa thiết bị */}
      <Modal
        title={<span style={{ color: '#E05300', fontWeight: 700 }}>Chỉnh Sửa Thiết Bị [{currentDevice?.deviceCode}]</span>}
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        onOk={() => {
          editForm.validateFields().then((vals) => {
            if (currentDevice) {
              updateDevice(currentDevice.id, vals);
              message.success('Đã cập nhật thông tin thiết bị thành công!');
              setIsEditModalOpen(false);
            }
          });
        }}
        okText="Lưu thay đổi"
        cancelText="Hủy"
        okButtonProps={{ style: { background: '#FF7506', borderColor: '#FF7506' } }}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item name="name" label="Tên thiết bị">
            <Input />
          </Form.Item>
          <Form.Item name="address" label="Địa chỉ lắp đặt">
            <Input />
          </Form.Item>
          <Form.Item name="status" label="Trạng thái hoạt động">
            <Select
              options={[
                { value: 'active', label: 'Đang hoạt động' },
                { value: 'inactive', label: 'Ngưng hoạt động' },
              ]}
            />
          </Form.Item>
          <Form.Item name="connectionStatus" label="Trạng thái kết nối">
            <Select
              options={[
                { value: 'online', label: 'Đang kết nối' },
                { value: 'offline', label: 'Mất kết nối' },
              ]}
            />
          </Form.Item>
          <Form.Item name="broadcastStatus" label="Trạng thái phát bản tin">
            <Select
              options={[
                { value: 'broadcasting', label: 'Đang phát bản tin' },
                { value: 'stopped', label: 'Dừng phát bản tin' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal 3: Điều chỉnh âm lượng hàng loạt (USR-DEV-07) */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#E05300' }}>
            <Volume2 size={20} />
            <span style={{ fontWeight: 700 }}>Điều Chỉnh Âm Lượng Thiết Bị</span>
          </div>
        }
        open={isVolumeModalOpen}
        onCancel={() => setIsVolumeModalOpen(false)}
        onOk={handleApplyVolume}
        okText="Áp dụng âm lượng"
        cancelText="Hủy"
        okButtonProps={{ style: { background: '#FF7506', borderColor: '#FF7506' } }}
      >
        <p style={{ color: '#4B5563', fontSize: 13, marginBottom: 16 }}>
          Đang điều chỉnh cho <strong>{selectedRowKeys.length}</strong> thiết bị được chọn. Theo tiêu chuẩn, âm lượng mặc định bắt đầu từ 50%.
        </p>
        <div style={{ padding: '0 12px' }}>
          <Slider
            min={0}
            max={100}
            value={volumeValue}
            onChange={(val) => setVolumeValue(val)}
            tooltip={{ formatter: (v) => `${v}%` }}
          />
          <div style={{ textAlign: 'center', fontSize: 24, fontWeight: 700, color: '#FF7506' }}>
            {volumeValue}%
          </div>
        </div>
      </Modal>

      {/* Modal 4: Chi tiết thiết bị & Timeline 5 bước phản hồi bản tin (Màn hình 4) */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#E05300' }}>
            <Info size={20} />
            <span style={{ fontWeight: 700 }}>Chi Tiết & Phản Hồi Bản Tin: {currentDevice?.name}</span>
          </div>
        }
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalOpen(false)}>
            Đóng
          </Button>,
          <Button
            key="restart"
            type="primary"
            style={{ background: '#FF7506', borderColor: '#FF7506' }}
            onClick={() => {
              if (currentDevice) {
                restartDevice(currentDevice.id);
                message.success(`Đã gửi lệnh đồng bộ & phát lại tới [${currentDevice.name}]`);
                setIsDetailModalOpen(false);
              }
            }}
          >
            Đồng bộ & Phát lại
          </Button>,
        ]}
        width={680}
      >
        {currentDevice && (
          <div>
            {/* Thông tin cơ bản */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 12,
                background: '#FAF6F2',
                padding: 16,
                borderRadius: 8,
                marginBottom: 20,
                fontSize: 13,
              }}
            >
              <div><strong>Mã định danh:</strong> {currentDevice.deviceCode}</div>
              <div><strong>Nhà cung cấp:</strong> {currentDevice.supplier}</div>
              <div><strong>Địa chỉ:</strong> {currentDevice.address}</div>
              <div><strong>Âm lượng hiện tại:</strong> {currentDevice.volume}%</div>
              <div>
                <strong>Kết nối:</strong>{' '}
                {currentDevice.connectionStatus === 'online' ? (
                  <span style={{ color: '#16A34A', fontWeight: 600 }}>Đang kết nối</span>
                ) : (
                  <span style={{ color: '#EF4444', fontWeight: 600 }}>Mất kết nối</span>
                )}
              </div>
              <div>
                <strong>Trạng thái phát:</strong>{' '}
                {currentDevice.broadcastStatus === 'broadcasting' ? (
                  <span style={{ color: '#16A34A', fontWeight: 600 }}>Đang phát bản tin</span>
                ) : (
                  <span style={{ color: '#EF4444', fontWeight: 600 }}>Dừng phát</span>
                )}
              </div>
            </div>

            {/* Timeline 5 bước phản hồi bản tin */}
            <h4 style={{ color: '#374151', marginBottom: 16, fontWeight: 600 }}>
              Tiến trình phản hồi phát bản tin (5 bước):
            </h4>
            <Steps
              direction="vertical"
              current={currentDevice.broadcastStatus === 'broadcasting' ? 3 : 1}
              status={currentDevice.connectionStatus === 'offline' ? 'error' : 'process'}
              items={[
                {
                  title: '1. Nhận lịch phát',
                  description: 'Đã nhận lịch phát từ trung tâm điều hành lúc 07:00:00',
                  icon: <Clock size={16} />,
                },
                {
                  title: '2. Tải bản tin',
                  description: 'Tải thành công file âm thanh MP3 (14.2 MB) qua mạng di động',
                  icon: <Download size={16} />,
                },
                {
                  title: '3. Sẵn sàng phát',
                  description: 'Kiểm tra phần cứng loa, bộ giải mã và đồng bộ thời gian đạt chuẩn',
                  icon: <CheckCircle2 size={16} />,
                },
                {
                  title: '4. Đang phát bản tin',
                  description:
                    currentDevice.broadcastStatus === 'broadcasting'
                      ? 'Đang phát sóng bản tin truyền thanh cơ sở với công suất đạt chuẩn'
                      : 'Đang tạm dừng phát hoặc mất kết nối tới trung tâm',
                  icon: <Play size={16} />,
                },
                {
                  title: '5. Hoàn thành',
                  description: 'Gửi báo cáo hoàn tất phát bản tin và ghi nhận nhật ký hệ thống',
                  icon: <CheckCircle2 size={16} />,
                },
              ]}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};
