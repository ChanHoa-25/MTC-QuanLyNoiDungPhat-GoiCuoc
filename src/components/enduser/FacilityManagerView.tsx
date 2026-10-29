import React, { useState } from 'react';
import {
  Card,
  Tree,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Typography,
  message,
  Row,
  Col,
  Descriptions,
} from 'antd';
import type { DataNode } from 'antd/es/tree';
import {
  FolderTree,
  Building,
  Plus,
  Trash2,
  Edit3,
  MapPin,
  Phone,
  Layers,
  AlertTriangle,
} from 'lucide-react';
import { useMtcData } from '../../context/MtcDataContext';
import { useAuth } from '../../context/AuthContext';
import type { Facility } from '../../types';

const { Title, Text, Paragraph } = Typography;

export const FacilityManagerView: React.FC = () => {
  const { facilities, addFacility, updateFacility, deleteFacility, devices, mediaList } = useMtcData();
  const { currentUser } = useAuth();

  const [selectedFacilityId, setSelectedFacilityId] = useState<string>(
    facilities.find((f) => f.orgId === currentUser.orgId)?.id || facilities[0]?.id || ''
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [parentIdForNew, setParentIdForNew] = useState<string | null>(null);

  const [form] = Form.useForm();

  // Lọc cơ sở thuộc tổ chức hiện tại
  const currentOrgFacilities = facilities.filter((f) => f.orgId === currentUser.orgId);

  // Xây dựng cây địa bàn đệ quy theo SRS USR-FAC-01
  const buildFacilityTree = (parentId: string | null): DataNode[] => {
    return currentOrgFacilities
      .filter((f) => f.parentId === parentId)
      .map((f) => {
        const deviceCount = devices.filter((d) => d.facilityId === f.id).length;
        const mediaCount = mediaList.filter((m) => m.facilityId === f.id).length;
        return {
          key: f.id,
          title: (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '2px 0' }}>
              <span style={{ fontWeight: 600, fontSize: 13, color: '#1F2937' }}>
                {f.name}
              </span>
              <Tag color="blue" style={{ fontSize: 11 }}>{f.code}</Tag>
              <Tag color={f.status === 'active' ? 'success' : 'default'} style={{ fontSize: 10 }}>
                {f.status === 'active' ? 'Hoạt động' : 'Ngưng'}
              </Tag>
              <span style={{ fontSize: 11, color: '#9CA3AF' }}>
                ({deviceCount} thiết bị, {mediaCount} media)
              </span>
            </div>
          ),
          children: buildFacilityTree(f.id),
        };
      });
  };

  const treeData = buildFacilityTree(null);

  const selectedFacility = facilities.find((f) => f.id === selectedFacilityId);
  const parentFacility = facilities.find((f) => f.id === selectedFacility?.parentId);

  const selectedFacilityDevices = devices.filter((d) => d.facilityId === selectedFacilityId);
  const selectedFacilityMedia = mediaList.filter((m) => m.facilityId === selectedFacilityId);

  const handleDelete = () => {
    if (!selectedFacility) return;
    const res = deleteFacility(selectedFacility.id);
    if (res.success) {
      message.success(res.message);
      setSelectedFacilityId(currentOrgFacilities[0]?.id || '');
    } else {
      message.error(res.message);
    }
  };

  const handleToggleStatus = () => {
    if (!selectedFacility) return;
    const nextStatus = selectedFacility.status === 'active' ? 'inactive' : 'active';
    updateFacility(selectedFacility.id, { status: nextStatus });
    if (nextStatus === 'inactive') {
      message.warning(
        'Lưu ý (SRS 2.1): Cơ sở cha ngưng hoạt động thì toàn bộ cơ sở con sẽ không thực hiện được tác vụ!'
      );
    } else {
      message.success('Đã kích hoạt lại trạng thái cơ sở.');
    }
  };

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
            Quản Lý Cơ Sở / Địa Bàn (USR-FAC)
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Cấu trúc phân cấp địa bàn Tổ chức → Cơ sở → Cơ sở con (Quy tắc thừa kế và giới hạn quyền hạn mục 2.1)
          </Text>
        </div>

        <Button
          type="primary"
          icon={<Plus size={16} />}
          style={{ background: '#FF7506', borderColor: '#FF7506' }}
          onClick={() => {
            setParentIdForNew(selectedFacilityId || null);
            setIsAddModalOpen(true);
          }}
        >
          Thêm cơ sở con trực thuộc
        </Button>
      </div>

      <Row gutter={24}>
        {/* Cột trái: Cây cơ sở */}
        <Col span={10}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FolderTree size={18} color="#FF7506" />
                <span style={{ fontWeight: 700 }}>Cây Phân Cấp Địa Bàn (USR-FAC-01)</span>
              </div>
            }
            style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
          >
            <Tree
              showLine={{ showLeafIcon: false }}
              defaultExpandAll
              treeData={treeData}
              selectedKeys={[selectedFacilityId]}
              onSelect={(keys) => {
                if (keys.length > 0) setSelectedFacilityId(keys[0] as string);
              }}
            />
          </Card>
        </Col>

        {/* Cột phải: Chi tiết cơ sở đã chọn */}
        <Col span={14}>
          {selectedFacility ? (
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Building size={18} color="#2563EB" />
                    <span style={{ fontWeight: 700 }}>Thông Tin Chi Tiết Cơ Sở (USR-FAC-03)</span>
                  </div>
                  <Tag color={selectedFacility.status === 'active' ? 'success' : 'error'}>
                    {selectedFacility.status === 'active' ? 'Đang hoạt động' : 'Ngưng hoạt động'}
                  </Tag>
                </div>
              }
              style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
              actions={[
                <Button key="toggle" onClick={handleToggleStatus}>
                  {selectedFacility.status === 'active' ? 'Tạm ngưng hoạt động' : 'Kích hoạt lại'}
                </Button>,
                <Button
                  key="add-sub"
                  type="primary"
                  style={{ background: '#FF7506', borderColor: '#FF7506' }}
                  onClick={() => {
                    setParentIdForNew(selectedFacility.id);
                    setIsAddModalOpen(true);
                  }}
                >
                  + Thêm cấp con
                </Button>,
                <Button key="delete" danger onClick={handleDelete}>
                  Xóa cơ sở (USR-FAC-05)
                </Button>,
              ]}
            >
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="Mã cơ sở (Không được sửa theo SRS)">
                  <Text strong>{selectedFacility.code}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Tên cơ sở">
                  <Text strong style={{ fontSize: 14 }}>{selectedFacility.name}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Cơ sở trực thuộc cấp cha">
                  {parentFacility ? (
                    <Tag color="cyan">{parentFacility.name} ({parentFacility.code})</Tag>
                  ) : (
                    <Tag color="purple">Cấp cao nhất của Tổ chức (Trụ sở chính)</Tag>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Địa chỉ lắp đặt">
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MapPin size={14} color="#6B7280" /> {selectedFacility.address}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="Số điện thoại liên hệ">
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Phone size={14} color="#6B7280" /> {selectedFacility.phone || 'Chưa cập nhật'}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="Tổng thiết bị quản lý">
                  <Tag color="blue">{selectedFacilityDevices.length} thiết bị phát</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Nguồn tin / Media lưu trữ">
                  <Tag color="orange">{selectedFacilityMedia.length} files media</Tag>
                </Descriptions.Item>
              </Descriptions>

              {selectedFacility.status === 'inactive' && (
                <div
                  style={{
                    marginTop: 16,
                    padding: '10px 14px',
                    borderRadius: 8,
                    background: '#FEF2F2',
                    border: '1px solid #FEE2E2',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    color: '#B91C1C',
                    fontSize: 12,
                  }}
                >
                  <AlertTriangle size={16} />
                  <span>
                    <strong>Cảnh báo (SRS 2.1):</strong> Cơ sở này đang ngưng hoạt động. Mọi cơ sở con trực thuộc sẽ bị khóa tác vụ phát sóng.
                  </span>
                </div>
              )}
            </Card>
          ) : (
            <Card style={{ borderRadius: 12, textAlign: 'center', padding: 40 }}>
              <Text type="secondary">Vui lòng chọn cơ sở từ cây bên trái để xem chi tiết</Text>
            </Card>
          )}
        </Col>
      </Row>

      {/* Modal Thêm Cơ Sở Con (USR-FAC-02) */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Building size={18} color="#FF7506" />
            <span>Tạo Cơ Sở Trực Thuộc (USR-FAC-02)</span>
          </div>
        }
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        footer={null}
        width={550}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            // SRS USR-FAC-02: Mã cơ sở không được trùng
            const exists = facilities.some((f) => f.code === values.code.toUpperCase());
            if (exists) {
              message.error(`Mã cơ sở "${values.code}" đã tồn tại trên hệ thống.`);
              return;
            }

            addFacility({
              orgId: currentUser.orgId,
              parentId: values.parentId || null,
              code: values.code.toUpperCase(),
              name: values.name,
              status: 'active',
              address: values.address,
              phone: values.phone,
            });

            message.success('Tạo cơ sở trực thuộc thành công!');
            setIsAddModalOpen(false);
            form.resetFields();
          }}
          initialValues={{
            parentId: parentIdForNew,
          }}
        >
          <Form.Item
            name="parentId"
            label="Trực thuộc cơ sở cha (Tự động gán theo SRS)"
          >
            <Select placeholder="Chọn cơ sở cha hoặc để trống nếu là Trụ sở chính" allowClear>
              {currentOrgFacilities.map((f) => (
                <Select.Option key={f.id} value={f.id}>
                  {f.name} ({f.code})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="code"
            label="Mã cơ sở (Không được trùng, không cho sửa sau khi tạo)"
            rules={[{ required: true, message: 'Nhập mã cơ sở' }]}
          >
            <Input placeholder="Ví dụ: ALTA-HCM-D3" />
          </Form.Item>

          <Form.Item
            name="name"
            label="Tên cơ sở"
            rules={[{ required: true, message: 'Nhập tên cơ sở' }]}
          >
            <Input placeholder="Chi nhánh Quận 3..." />
          </Form.Item>

          <Form.Item
            name="address"
            label="Địa chỉ cơ sở"
            rules={[{ required: true, message: 'Nhập địa chỉ' }]}
          >
            <Input placeholder="Số nhà, đường, phường, quận..." />
          </Form.Item>

          <Form.Item name="phone" label="Số điện thoại liên lạc">
            <Input placeholder="028.xxxx.xxxx" />
          </Form.Item>

          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsAddModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" style={{ background: '#FF7506', borderColor: '#FF7506' }}>
                Lưu cơ sở
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};
