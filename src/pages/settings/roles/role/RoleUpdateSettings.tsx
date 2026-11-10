import { useCallback, useEffect, useMemo, useState } from "react";
import { Checkbox, Form, message } from "antd";
import { Check, X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import AppForm from "../../../../components/common/AppForm";
import AppInput from "../../../../components/common/AppInput";
import { useActionPanel } from "../../../../contexts/ActionPanelContext";

import type { AppActionPanelItem } from "../../../../components/common/AppActionPanel";
import type { RolePermissionGroup } from "../../types/rolePermissions.types";

import { mockRolePermissionGroups } from "../../data/rolePermissions.mock";
import { mockRoles } from "../../data/roles.mock";

import "./RoleUpdateSettings.css";

interface RoleFormValues {
  name: string;
  code: string;
  description: string;
}

interface RoleUpdateSettingsProps {
  roleId?: number;
  onCancel?: () => void;
  onSaved?: (values: RoleFormValues, permissions: string[]) => void;
}

function RoleUpdateSettings({
  roleId,
  onCancel,
  onSaved,
}: RoleUpdateSettingsProps) {
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const { setActions } = useActionPanel();

  const [form] = Form.useForm<RoleFormValues>();

  const currentRoleId = roleId ?? Number(params.id);

  const role = useMemo(
    () => mockRoles.find((item) => item.id === currentRoleId),
    [currentRoleId],
  );

  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  useEffect(() => {
    if (!role) return;

    form.setFieldsValue({
      name: role.name,
      code: role.code,
      description: role.description ?? "",
    });

    setSelectedPermissions([]);
  }, [role, form]);

  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel();
      return;
    }

    navigate("/settings/roles");
  }, [navigate, onCancel]);

  const handleSave = useCallback(async () => {
    try {
      const values = await form.validateFields();

      if (onSaved) {
        onSaved(values, selectedPermissions);
      } else {
        message.success("Cập nhật vai trò thành công (dữ liệu demo)");
        navigate("/settings/roles");
      }
    } catch {
      return;
    }
  }, [form, selectedPermissions, onSaved, navigate]);

  const actions = useMemo<AppActionPanelItem[]>(
    () => [
      {
        key: "save-role",
        icon: <Check size={24} color="#52C41A" />,
        tooltip: "Lưu thay đổi",
        onClick: handleSave,
      },
      {
        key: "cancel-role",
        icon: <X size={24} color="#FF4D4F" />,
        tooltip: "Hủy",
        onClick: handleCancel,
      },
    ],
    [handleSave, handleCancel],
  );

  useEffect(() => {
    setActions(actions);
  }, [actions, setActions]);

  const togglePermission = (permissionId: string, checked: boolean) => {
    setSelectedPermissions((prev) =>
      checked
        ? Array.from(new Set([...prev, permissionId]))
        : prev.filter((id) => id !== permissionId),
    );
  };

  const toggleGroup = (group: RolePermissionGroup, checked: boolean) => {
    const groupIds = group.permissions.map((item) => item.id);

    setSelectedPermissions((prev) =>
      checked
        ? Array.from(new Set([...prev, ...groupIds]))
        : prev.filter((id) => !groupIds.includes(id)),
    );
  };

  if (!role) {
    return <div>Không tìm thấy vai trò cần cập nhật.</div>;
  }

  return (
    <div className="role-update-settings">
      <section className="role-update-settings__info">
        <h2 className="role-update-settings__title">Cập nhật vai trò</h2>

        <AppForm<RoleFormValues>
          form={form}
          className="role-update-settings__form">
          <Form.Item name="name" label="Tên vai trò">
            <AppInput width="100%" placeholder="Tên vai trò" />
          </Form.Item>

          <Form.Item
            name="code"
            label="Mã vai trò"
            rules={[
              {
                required: true,
                whitespace: true,
                message: "Vui lòng nhập mã vai trò",
              },
            ]}>
            <AppInput width="100%" placeholder="Mã vai trò" />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <AppInput width="100%" placeholder="Nhập mô tả" />
          </Form.Item>
        </AppForm>

        <p className="role-update-settings__note">
          <span>*</span> là những trường thông tin bắt buộc
        </p>
      </section>

      <section className="role-update-settings__permissions">
        <h2 className="role-update-settings__title">Phân quyền chức năng</h2>

        <div className="role-update-settings__permission-table">
          <div className="role-update-settings__table-head">
            <span>STT</span>
            <span>Nhóm chức năng</span>
            <span>Chức năng</span>
          </div>

          <div className="role-update-settings__table-body">
            {mockRolePermissionGroups.map((group, index) => {
              const groupIds = group.permissions.map((item) => item.id);

              const selectedCount = groupIds.filter((id) =>
                selectedPermissions.includes(id),
              ).length;

              const allChecked =
                groupIds.length > 0 && selectedCount === groupIds.length;

              const indeterminate =
                selectedCount > 0 && selectedCount < groupIds.length;

              return (
                <div
                  className="role-update-settings__permission-row"
                  key={group.id}>
                  <div className="role-update-settings__row-index">
                    {index + 1}
                  </div>

                  <div className="role-update-settings__group-name">
                    {group.name}
                  </div>

                  <div className="role-update-settings__permission-list">
                    <Checkbox
                      checked={allChecked}
                      indeterminate={indeterminate}
                      onChange={(event) =>
                        toggleGroup(group, event.target.checked)
                      }>
                      Chọn tất cả
                    </Checkbox>

                    {group.permissions.map((permission) => (
                      <Checkbox
                        key={permission.id}
                        checked={selectedPermissions.includes(permission.id)}
                        onChange={(event) =>
                          togglePermission(permission.id, event.target.checked)
                        }>
                        {permission.name}
                      </Checkbox>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

export default RoleUpdateSettings;
