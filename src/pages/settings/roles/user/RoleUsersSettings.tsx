import { useCallback, useEffect, useMemo, useState } from "react";
import type { Key } from "react";
import type { ColumnsType } from "antd/es/table";
import { message } from "antd";
import { Plus, SquarePen, Trash2 } from "lucide-react";
import { useLocation } from "react-router-dom";

import AppSelect from "../../../../components/common/AppSelect";
import AppSearch from "../../../../components/common/AppSearch";
import AppTable from "../../../../components/common/AppTable";
import AppTableActions from "../../../../components/common/AppTableActions";
import AppStatusTag from "../../../../components/common/AppStatusTag";
import AppConfirmModal from "../../../../components/common/AppConfirmModal";

import { useActionPanel } from "../../../../contexts/ActionPanelContext";
import type { AppActionPanelItem } from "../../../../components/common/AppActionPanel";

import RoleUserModal from "./RoleUserModal";
import type { RoleUserModalMode } from "./RoleUserModal";

import type {
  RoleUser,
  RoleUserFormValues,
  RoleUserStatus,
} from "../../types/roleUsers.types";

import { mockRoleUsers } from "../../data/roleUsers.mock";
import { mockRoles } from "../../data/roles.mock";

import "./RoleUsersSettings.css";

type PermissionTab = "assigned" | "unassigned";

// Các trường bổ sung dành cho System User.
// Cần đối chiếu tên trường với API khi tích hợp Backend.
type SystemRoleUser = RoleUser & {
  phoneNumber?: string;
  phone?: string;
  identityNumber?: string;
  citizenId?: string;
  isAssigned?: boolean;
};

const getAssignedStatus = (user: SystemRoleUser): boolean => {
  if (typeof user.isAssigned === "boolean") {
    return user.isAssigned;
  }

  // Quy tắc tạm thời cho dữ liệu mock.
  return Boolean(user.role && user.role.trim());
};

function RoleUsersSettings() {
  const { pathname } = useLocation();
  const isSystemUser = pathname.startsWith("/system/");

  const { setActions } = useActionPanel();

  const [users, setUsers] = useState<RoleUser[]>(() =>
    mockRoleUsers.map((item) => ({ ...item })),
  );

  const [permissionTab, setPermissionTab] = useState<PermissionTab>("assigned");

  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [keyword, setKeyword] = useState("");

  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<RoleUserModalMode>("create");
  const [editingUser, setEditingUser] = useState<RoleUser | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const roleOptions = useMemo(
    () =>
      mockRoles.map((role) => ({
        label: role.name,
        value: role.code,
      })),
    [],
  );

  const filteredUsers = useMemo(() => {
    const search = keyword.trim().toLowerCase();

    return users.filter((user) => {
      const systemUser = user as SystemRoleUser;

      if (isSystemUser) {
        const isAssigned = getAssignedStatus(systemUser);

        if (permissionTab === "assigned" && !isAssigned) {
          return false;
        }

        if (permissionTab === "unassigned" && isAssigned) {
          return false;
        }
      }

      const matchesStatus =
        statusFilter === "all" || user.status === statusFilter;

      const matchesRole =
        isSystemUser || roleFilter === "all" || user.role === roleFilter;

      const matchesKeyword =
        !search ||
        [
          user.username,
          user.fullName,
          user.email,
          user.role,
          systemUser.phoneNumber,
          systemUser.phone,
          systemUser.identityNumber,
          systemUser.citizenId,
        ].some((value) =>
          String(value ?? "")
            .toLowerCase()
            .includes(search),
        );

      return matchesStatus && matchesRole && matchesKeyword;
    });
  }, [users, isSystemUser, permissionTab, statusFilter, roleFilter, keyword]);

  const handlePermissionTabChange = (tab: PermissionTab) => {
    setPermissionTab(tab);
    setSelectedRowKeys([]);
    setCurrentPage(1);
    setStatusFilter("all");
    setKeyword("");
  };

  const openCreateModal = useCallback(() => {
    setEditingUser(null);
    setModalMode("create");
    setModalOpen(true);
  }, []);

  const openEditModal = useCallback((user: RoleUser) => {
    setEditingUser(user);
    setModalMode("edit");
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingUser(null);
  }, []);

  const handleSaveUser = (values: RoleUserFormValues) => {
    if (modalMode === "create") {
      const nextId = users.reduce((max, user) => Math.max(max, user.id), 0) + 1;

      const { password: _password, ...safeValues } = values;
      void _password;

      setUsers((prev) => [
        ...prev,
        {
          id: nextId,
          ...safeValues,
          updatedAt: new Date().toLocaleString("vi-VN"),
        },
      ]);

      message.success("Thêm tài khoản thành công");
    } else if (editingUser) {
      setUsers((prev) =>
        prev.map((user) =>
          user.id === editingUser.id
            ? {
                ...user,
                role: values.role,
                status: values.status,
                timezone: values.timezone,
                updatedAt: new Date().toLocaleString("vi-VN"),
              }
            : user,
        ),
      );

      message.success("Cập nhật tài khoản thành công");
    }

    closeModal();
  };

  const openDeleteModal = useCallback(() => {
    if (selectedRowKeys.length === 0) {
      message.warning("Vui lòng chọn người dùng cần xóa");
      return;
    }

    setDeleteModalOpen(true);
  }, [selectedRowKeys.length]);

  const handleConfirmDelete = () => {
    const selectedIds = new Set(selectedRowKeys);

    setUsers((prev) => prev.filter((user) => !selectedIds.has(user.id)));

    setSelectedRowKeys([]);
    setCurrentPage(1);
    setDeleteModalOpen(false);

    message.success("Xóa người dùng thành công");
  };

  const actions = useMemo<AppActionPanelItem[]>(
    () => [
      ...(!isSystemUser
        ? [
            {
              key: "add-user",
              icon: <Plus size={24} />,
              tooltip: "Thêm tài khoản quản trị",
              onClick: openCreateModal,
            },
          ]
        : []),
      {
        key: "delete-user",
        icon: <Trash2 size={24} />,
        tooltip: "Xóa người dùng",
        danger: true,
        disabled: selectedRowKeys.length === 0,
        onClick: openDeleteModal,
      },
    ],
    [isSystemUser, openCreateModal, openDeleteModal, selectedRowKeys.length],
  );

  useEffect(() => {
    setActions(actions);
  }, [actions, setActions]);

  useEffect(() => {
    return () => {
      setActions([]);
    };
  }, [setActions]);

  const columns = useMemo<ColumnsType<RoleUser>>(() => {
    const result: ColumnsType<RoleUser> = [
      {
        title: "Tên đăng nhập",
        dataIndex: "username",
        key: "username",
        width: 150,
      },
      {
        title: "Tên người dùng",
        dataIndex: "fullName",
        key: "fullName",
        width: 180,
      },
    ];

    if (isSystemUser) {
      result.push({
        title: "Số điện thoại",
        key: "phoneNumber",
        width: 150,
        render: (_value, record) => {
          const user = record as SystemRoleUser;
          return user.phoneNumber || user.phone || "—";
        },
      });
    }

    result.push({
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 220,
    });

    if (isSystemUser) {
      result.push({
        title: "Số CMND/CCCD",
        key: "identityNumber",
        width: 160,
        render: (_value, record) => {
          const user = record as SystemRoleUser;
          return user.identityNumber || user.citizenId || "—";
        },
      });
    }

    if (!isSystemUser || permissionTab === "assigned") {
      result.push({
        title: "Vai trò",
        dataIndex: "role",
        key: "role",
        width: 150,
        render: (value: string) =>
          roleOptions.find((role) => role.value === value)?.label ??
          value ??
          "—",
      });
    }

    result.push({
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 170,
      render: (status: RoleUserStatus) => (
        <AppStatusTag
          type="status"
          variant={status === "active" ? "green" : "yellow"}
          label={status === "active" ? "Đang hoạt động" : "Ngưng hoạt động"}
        />
      ),
    });

    if (!isSystemUser) {
      result.push({
        title: "Cập nhật lần cuối",
        dataIndex: "updatedAt",
        key: "updatedAt",
        width: 190,
      });
    }

    result.push({
      title: "Cập nhật",
      key: "actions",
      width: 100,
      align: "center",
      render: (_value, record) => (
        <AppTableActions
          actions={[
            {
              key: "edit",
              icon: <SquarePen size={20} />,
              tooltip: "Cập nhật người dùng",
              onClick: () => openEditModal(record),
            },
          ]}
        />
      ),
    });

    return result;
  }, [isSystemUser, permissionTab, roleOptions, openEditModal]);

  return (
    <section className="role-users-settings">
      {isSystemUser && (
        <div className="role-users-settings__permission-tabs">
          <button
            type="button"
            className={permissionTab === "assigned" ? "active" : ""}
            onClick={() => handlePermissionTabChange("assigned")}>
            Đã phân quyền
          </button>

          <button
            type="button"
            className={permissionTab === "unassigned" ? "active" : ""}
            onClick={() => handlePermissionTabChange("unassigned")}>
            Chưa phân quyền
          </button>
        </div>
      )}

      <h2 className="role-users-settings__title">
        {isSystemUser && permissionTab === "unassigned"
          ? "Danh sách tài khoản chưa phân quyền"
          : "Danh sách người dùng hệ thống"}
      </h2>

      <div className="role-users-settings__filters">
        <div className="role-users-settings__filter-group">
          <label>Trạng thái</label>

          <AppSelect
            width={180}
            value={statusFilter}
            options={[
              { label: "Tất cả", value: "all" },
              { label: "Đang hoạt động", value: "active" },
              { label: "Ngưng hoạt động", value: "inactive" },
            ]}
            onChange={(value) => {
              setStatusFilter(String(value ?? "all"));
              setCurrentPage(1);
            }}
          />
        </div>

        {!isSystemUser && (
          <div className="role-users-settings__filter-group">
            <label>Vai trò</label>

            <AppSelect
              width={180}
              value={roleFilter}
              options={[{ label: "Tất cả", value: "all" }, ...roleOptions]}
              onChange={(value) => {
                setRoleFilter(String(value ?? "all"));
                setCurrentPage(1);
              }}
            />
          </div>
        )}

        <div className="role-users-settings__filter-group role-users-settings__search">
          <label htmlFor="role-users-search">Từ khóa</label>

          <AppSearch
            id="role-users-search"
            width={345}
            value={keyword}
            placeholder="Nhập từ khóa"
            onChange={(value) => {
              setKeyword(value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      <div className="role-users-settings__table">
        <AppTable<RoleUser>
          rowKey="id"
          columns={columns}
          dataSource={filteredUsers}
          selectable
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => {
              setSelectedRowKeys([...keys]);
            },
            preserveSelectedRowKeys: true,
          }}
          selectedLabel="người dùng"
          showSelectedCount
          pagination={{
            current: currentPage,
            pageSize,
            total: filteredUsers.length,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
        />
      </div>

      <RoleUserModal
        open={modalOpen}
        mode={modalMode}
        user={editingUser}
        existingUsers={users}
        roleOptions={roleOptions}
        onSave={handleSaveUser}
        onCancel={closeModal}
      />

      <AppConfirmModal
        open={deleteModalOpen}
        type="delete"
        title="Xác nhận xóa vai trò người dùng"
        description={
          <>
            Các vai trò người dùng được chọn sẽ bị xóa,
            <br />
            không thể khôi phục. Tiếp tục xóa hay Hủy bỏ?
          </>
        }
        confirmText="Tiếp tục"
        cancelText="Hủy"
        showIcon={false}
        width={500}
        className="role-users-delete-modal"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </section>
  );
}

export default RoleUsersSettings;
