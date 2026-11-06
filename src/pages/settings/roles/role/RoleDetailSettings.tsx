import { useEffect, useMemo, useState } from "react";
import type { ColumnsType } from "antd/es/table";
import { Form, message } from "antd";
import { SquarePen } from "lucide-react";
import { useParams } from "react-router-dom";

import AppTable from "../../../../components/common/AppTable";
import AppTableActions from "../../../../components/common/AppTableActions";
import AppConfirmModal from "../../../../components/common/AppConfirmModal";
import AppModal from "../../../../components/common/AppModal";
import AppButton from "../../../../components/common/AppButton";
import AppForm from "../../../../components/common/AppForm";
import AppSelect from "../../../../components/common/AppSelect";

import { useActionPanel } from "../../../../contexts/ActionPanelContext";

import type { RoleUser } from "../../types/roleUsers.types";
import { mockRoleUsers } from "../../data/roleUsers.mock";
import { mockRoles } from "../../data/roles.mock";

import "./RoleDetailSettings.css";

interface RoleDetailSettingsProps {
  roleId?: number;
}

interface EditUserRoleValues {
  role: string;
}

function RoleDetailSettings({ roleId }: RoleDetailSettingsProps) {
  const params = useParams<{ id: string }>();
  const { setActions } = useActionPanel();

  const currentRoleId = roleId ?? Number(params.id);

  const role = useMemo(
    () => mockRoles.find((item) => item.id === currentRoleId),
    [currentRoleId],
  );

  const [users, setUsers] = useState<RoleUser[]>(() =>
    mockRoleUsers.map((user) => ({ ...user })),
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [editingUser, setEditingUser] = useState<RoleUser | null>(null);
  const [removeUser, setRemoveUser] = useState<RoleUser | null>(null);

  const [form] = Form.useForm<EditUserRoleValues>();

  useEffect(() => {
    setActions([]);
  }, [setActions]);

  const roleOptions = useMemo(
    () =>
      mockRoles.map((item) => ({
        label: item.name,
        value: item.code,
      })),
    [],
  );

  const roleUsers = useMemo(
    () => users.filter((user) => user.role === role?.code),
    [users, role],
  );

  useEffect(() => {
    if (editingUser) {
      form.setFieldsValue({ role: editingUser.role });
    }
  }, [editingUser, form]);

  const handleSaveUserRole = async () => {
    try {
      const values = await form.validateFields();

      if (!editingUser) return;

      setUsers((prev) =>
        prev.map((user) =>
          user.id === editingUser.id
            ? {
                ...user,
                role: values.role,
                updatedAt: new Date().toLocaleString("vi-VN"),
              }
            : user,
        ),
      );

      setEditingUser(null);
      message.success("Cập nhật vai trò người dùng thành công");
    } catch {
      return;
    }
  };

  const handleRemoveRole = () => {
    if (!removeUser) return;

    setUsers((prev) =>
      prev.map((user) =>
        user.id === removeUser.id ? { ...user, role: "" } : user,
      ),
    );

    setRemoveUser(null);
    message.success("Gỡ vai trò người dùng thành công");
  };

  const columns = useMemo<ColumnsType<RoleUser>>(
    () => [
      {
        title: "STT",
        key: "index",
        width: 80,
        align: "center",
        render: (_value, _record, index) =>
          (currentPage - 1) * pageSize + index + 1,
      },
      {
        title: "Tên người dùng",
        dataIndex: "username",
        key: "username",
      },
      {
        title: "Vai trò",
        dataIndex: "role",
        key: "role",
        render: (value: string) =>
          roleOptions.find((item) => item.value === value)?.label ?? value,
      },
      {
        title: "Cập nhật",
        key: "actions",
        width: 130,
        align: "center",
        render: (_value, record) => (
          <AppTableActions
            actions={[
              {
                key: "edit",
                icon: <SquarePen size={20} />,
                tooltip: "Chỉnh sửa vai trò người dùng",
                onClick: () => setEditingUser(record),
              },
            ]}
          />
        ),
      },
    ],
    [currentPage, pageSize, roleOptions],
  );

  if (!role) {
    return <div>Không tìm thấy thông tin vai trò.</div>;
  }

  return (
    <div className="role-detail-settings">
      <section className="role-detail-settings__info">
        <h2 className="role-detail-settings__title">Chi tiết vai trò</h2>

        <div className="role-detail-settings__field">
          <strong>Tên vai trò:</strong>
          <span>{role.name}</span>
        </div>

        <div className="role-detail-settings__field">
          <strong>Mã vai trò:</strong>
          <span>{role.code}</span>
        </div>

        <div className="role-detail-settings__field">
          <strong>Cập nhật lần cuối:</strong>
          <span>{role.updatedAt}</span>
        </div>

        <div className="role-detail-settings__field">
          <strong>Mô tả</strong>
          <span>{role.description || "Không có mô tả"}</span>
        </div>
      </section>

      <section className="role-detail-settings__users">
        <h2 className="role-detail-settings__title">
          Chỉnh sửa vai trò người dùng
        </h2>

        <div className="role-detail-settings__table">
          <AppTable<RoleUser>
            rowKey="id"
            columns={columns}
            dataSource={roleUsers}
            selectable={false}
            pagination={{
              current: currentPage,
              pageSize,
              total: roleUsers.length,
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              },
            }}
          />
        </div>
      </section>

      <AppModal
        open={editingUser !== null}
        title="Cập nhật vai trò người dùng"
        width={500}
        onCancel={() => setEditingUser(null)}
        footer={
          <div className="role-detail-settings__modal-actions">
            <AppButton
              variant="outline"
              width={120}
              onClick={() => setEditingUser(null)}>
              Hủy
            </AppButton>

            <AppButton width={120} onClick={handleSaveUserRole}>
              Lưu
            </AppButton>
          </div>
        }>
        <AppForm<EditUserRoleValues> form={form}>
          <Form.Item
            name="role"
            label="Vai trò"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn vai trò",
              },
            ]}>
            <AppSelect
              width="100%"
              options={roleOptions}
              placeholder="Chọn vai trò"
            />
          </Form.Item>
        </AppForm>

        <AppButton
          variant="outline"
          width="100%"
          onClick={() => {
            setRemoveUser(editingUser);
            setEditingUser(null);
          }}>
          Gỡ vai trò khỏi người dùng
        </AppButton>
      </AppModal>

      <AppConfirmModal
        open={removeUser !== null}
        type="delete"
        title="Xác nhận gỡ vai trò người dùng"
        description="Các vai trò người dùng được chọn sẽ bị gỡ đi"
        confirmText="Tiếp tục"
        cancelText="Hủy"
        width={500}
        onConfirm={handleRemoveRole}
        onCancel={() => setRemoveUser(null)}
        className="role-detail-settings__confirm"
      />
    </div>
  );
}

export default RoleDetailSettings;
