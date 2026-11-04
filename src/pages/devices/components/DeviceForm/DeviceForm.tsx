import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Form, message } from "antd";

import AppForm from "../../../../components/common/AppForm";
import AppInput from "../../../../components/common/AppInput";
import AppSelect from "../../../../components/common/AppSelect";
import AppTextArea from "../../../../components/common/AppTextArea";
import AppButton from "../../../../components/common/AppButton";

import { ROUTES } from "../../../../constants/route.constants";
import { useDevices } from "../../../../contexts/DeviceContext";

import { facilitiesMock } from "../../../facilities/data/facilities.mock";
import {
  findFacilityById,
  flattenFacilities,
} from "../../../facilities/utils/facility.utils";

import type { Device, DeviceStatus } from "../../types/device.types";

import "./DeviceForm.css";

interface DeviceFormProps {
  mode: "create" | "edit";
}

interface DeviceFormValues {
  name: string;
  code: string;
  facilityId: string;
  simSerial?: string;
  simPhone?: string;
  supplier: string;
  status: DeviceStatus;
  description?: string;
}

// Danh sách nhà cung cấp
const supplierOptions = [
  {
    label: "Alta",
    value: "Alta Software",
  },
  {
    label: "MOBIFONE",
    value: "MOBIFONE",
  },
];

// Danh sách trạng thái hoạt động
const statusOptions = [
  {
    label: "Đang hoạt động",
    value: "active",
  },
  {
    label: "Ngưng hoạt động",
    value: "inactive",
  },
];

// Danh sách cơ sở quản lý
const facilityOptions = flattenFacilities(facilitiesMock).map((facility) => ({
  label: facility.facilityName,
  value: facility.id,
}));

function DeviceForm({ mode }: DeviceFormProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [form] = Form.useForm<DeviceFormValues>();

  const isEdit = mode === "edit";

  // Lấy dữ liệu và các hàm CRUD từ DeviceContext
  const { devices, getDeviceById, addDevice, updateDevice } = useDevices();

  // Lấy thông tin thiết bị cần chỉnh sửa
  const device = isEdit && id ? getDeviceById(id) : undefined;

  // Đổ dữ liệu vào form khi chỉnh sửa
  useEffect(() => {
    form.resetFields();

    if (isEdit && device) {
      form.setFieldsValue({
        name: device.name,
        code: device.code,
        facilityId: device.facilityId,
        supplier: device.supplier,
        status: device.status,
        simSerial: device.simSerial ?? "",
        simPhone: device.simPhone ?? "",
        description: device.description ?? "",
      });
    }
  }, [isEdit, device, form]);

  // Hủy thao tác
  const handleCancel = () => {
    if (isEdit && id) {
      navigate(`${ROUTES.DEVICES}/${id}`);
    } else {
      navigate(ROUTES.DEVICES);
    }
  };

  // Lưu thông tin thiết bị
  const handleSubmit = (values: DeviceFormValues) => {
    const name = values.name.trim();
    const code = values.code.trim();

    // Kiểm tra mã định danh trùng
    const isDuplicate = devices.some(
      (item) =>
        item.code.trim().toLowerCase() === code.toLowerCase() &&
        (!isEdit || item.id !== id),
    );

    if (isDuplicate) {
      form.setFields([
        {
          name: "code",
          errors: ["Mã định danh thiết bị đã tồn tại"],
        },
      ]);
      return;
    }

    // Kiểm tra cơ sở quản lý
    const facility = findFacilityById(facilitiesMock, values.facilityId);

    if (!facility) {
      message.error("Cơ sở quản lý không hợp lệ");
      return;
    }

    if (isEdit) {
      // Kiểm tra thiết bị cần chỉnh sửa
      if (!id || !device) {
        message.error("Không tìm thấy thiết bị");
        return;
      }

      // Cập nhật thiết bị qua DeviceContext
      updateDevice(id, {
        name,
        code,
        facilityId: facility.id,
        facilityName: facility.facilityName,
        supplier: values.supplier,
        status: values.status,
        simSerial: values.simSerial?.trim() ?? "",
        simPhone: values.simPhone?.trim() ?? "",
        description: values.description?.trim() ?? "",
      });

      message.success("Cập nhật thiết bị thành công!");
    } else {
      // Tạo thiết bị mới
      const newDevice: Device = {
        id: crypto.randomUUID(),
        name,
        code,

        facilityId: facility.id,
        facilityName: facility.facilityName,

        supplier: values.supplier,
        status: values.status,

        simSerial: values.simSerial?.trim() ?? "",
        simPhone: values.simPhone?.trim() ?? "",
        description: values.description?.trim() ?? "",

        location: "",
        connection: "offline",
        broadcast: "stopped",

        longitude: "",
        latitude: "",
        supplierPhone: "",
      };

      // Thêm thiết bị qua DeviceContext
      addDevice(newDevice);

      message.success("Thêm thiết bị thành công!");
    }

    // Quay về danh sách thiết bị
    navigate(ROUTES.DEVICES);
  };

  // Kiểm tra thiết bị có tồn tại không
  if (isEdit && !device) {
    return (
      <div className="device-form-page">
        <h2>Không tìm thấy thiết bị</h2>

        <AppButton
          variant="primary"
          width="auto"
          onClick={() => navigate(ROUTES.DEVICES)}>
          Quay lại danh sách thiết bị
        </AppButton>
      </div>
    );
  }

  return (
    <div className="device-form-page">
      {/* Tiêu đề */}
      <h2 className="device-form-page__title">
        {isEdit ? "Chỉnh sửa thiết bị" : "Thêm thiết bị"}
      </h2>

      <AppForm<DeviceFormValues>
        form={form}
        layout="vertical"
        columns={1}
        gap={24}
        initialValues={{
          supplier: "Alta Software",
          status: "active",
        }}
        onFinish={handleSubmit}
        className="device-form-page__form">
        <div className="device-form-page__fields">
          {/* Cột bên trái */}
          <div className="device-form-page__column">
            {/* Tên thiết bị */}
            <Form.Item
              label="Tên thiết bị"
              name="name"
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: "Vui lòng nhập tên thiết bị",
                },
              ]}>
              <AppInput
                width="100%"
                height={40}
                placeholder="Nhập tên thiết bị"
              />
            </Form.Item>

            {/* Mã định danh thiết bị */}
            <Form.Item
              label="Mã định danh thiết bị"
              name="code"
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: "Vui lòng nhập mã định danh thiết bị",
                },
              ]}>
              <AppInput
                width="100%"
                height={40}
                placeholder="Nhập mã định danh thiết bị"
              />
            </Form.Item>

            {/* Số Seri SIM */}
            <Form.Item label="Số Seri SIM" name="simSerial">
              <AppInput
                width="100%"
                height={40}
                placeholder="Nhập số Seri SIM"
              />
            </Form.Item>

            {/* Số thuê bao SIM */}
            <Form.Item label="Số thuê bao SIM" name="simPhone">
              <AppInput
                width="100%"
                height={40}
                placeholder="Nhập số thuê bao SIM"
              />
            </Form.Item>
          </div>

          {/* Cột bên phải */}
          <div className="device-form-page__column">
            {/* Cơ sở quản lý */}
            <Form.Item
              label="Cơ sở quản lý"
              name="facilityId"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn cơ sở quản lý",
                },
              ]}>
              <AppSelect
                width="100%"
                placeholder="Chọn cơ sở quản lý"
                options={facilityOptions}
              />
            </Form.Item>

            {/* Nhà cung cấp */}
            <Form.Item
              label="Nhà cung cấp"
              name="supplier"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn nhà cung cấp",
                },
              ]}>
              <AppSelect
                width="100%"
                placeholder="Chọn nhà cung cấp"
                options={supplierOptions}
              />
            </Form.Item>

            {/* Trạng thái hoạt động */}
            <Form.Item
              label="Trạng thái hoạt động"
              name="status"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn trạng thái hoạt động",
                },
              ]}>
              <AppSelect
                width="100%"
                placeholder="Chọn trạng thái hoạt động"
                options={statusOptions}
              />
            </Form.Item>

            {/* Mô tả */}
            <Form.Item label="Mô tả" name="description">
              <AppTextArea width="100%" height={116} placeholder="Nhập mô tả" />
            </Form.Item>
          </div>
        </div>

        {/* Nút thao tác */}
        <div className="device-form-page__actions">
          <AppButton
            variant="outline"
            width={136}
            htmlType="button"
            onClick={handleCancel}>
            Hủy
          </AppButton>

          <AppButton variant="primary" width={136} htmlType="submit">
            Lưu
          </AppButton>
        </div>
      </AppForm>
    </div>
  );
}

export default DeviceForm;
