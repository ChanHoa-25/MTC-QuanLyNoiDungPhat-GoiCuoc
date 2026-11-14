import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Key } from "react";
import type { TableColumnsType } from "antd";
import { Form, Input, message } from "antd";
import { SquarePen, Search } from "lucide-react";
import axios from "axios";

import AppTable from "../../../components/common/AppTable";
import AppTableActions from "../../../components/common/AppTableActions";
import AppSelect from "../../../components/common/AppSelect";
import AppFilter, {
  AppFilterField,
} from "../../../components/common/AppFilter";

import {
  userApi,
  type UserDto,
  type CreateUserDto,
  type UpdateUserDto,
} from "../../../api/userApi";
import { rolesApi, type Role } from "../../../api/rolesApi";

import FacilityUserFormModal from "./FacilityUserFormModal";
import type { FacilityUserFormValues } from "./FacilityUserFormModal";
import type { Facility } from "../types/facility.types";
import type { FacilityUser } from "../types/facilityUser.types";

import "./FacilityUsers.css";

interface FacilityUsersProps {
  facility: Facility;
  selectedRowKeys: Key[];
  onSelectionChange: (keys: Key[]) => void;
  openCreate: boolean;
  onCloseCreate: () => void;
  deleteRequestId: number;
  onDeleteComplete: () => void;
}

const mapUserToFacilityUser = (user: UserDto): FacilityUser => ({
  id: user.id,
  facilityId: user.facilityId ?? "",
  username: user.username,
  fullName: user.fullName,
  phone: user.phoneNumber ?? "",
  email: user.email,
  roleId: user.roleId,
  role: user.roleName ?? user.roleCode ?? "",
  status: user.isActive ? "active" : "inactive",
  updatedAt: user.lastActivityAt
    ? new Date(user.lastActivityAt).toLocaleString("vi-VN")
    : "",
});

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;

    if (Array.isArray(data?.errors) && data.errors.length > 0) {
      return data.errors.map(String).join("; ");
    }

    if (typeof data?.message === "string" && data.message) {
      return data.message;
    }
  }

  return error instanceof Error ? error.message : fallback;
};

function FacilityUsers({
  facility,
  selectedRowKeys,
  onSelectionChange,
  openCreate,
  onCloseCreate,
  deleteRequestId,
  onDeleteComplete,
}: FacilityUsersProps) {
  const [users, setUsers] = useState<FacilityUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);

  const [loading, setLoading] = useState(false);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);

  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [keyword, setKeyword] = useState("");

  const [editingUser, setEditingUser] = useState<FacilityUser | null>(null);

  const handledDeleteRequestRef = useRef(deleteRequestId);
  const requestIdRef = useRef(0);

  const facilityId = facility.id;
  const organizationId = facility.organizationId;

  // Lấy danh sách tài khoản từ Backend
  const fetchUsers = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);

    try {
      const allUsers: UserDto[] = [];
      let page = 1;
      let hasNextPage = true;

      while (hasNextPage) {
        const result = await userApi.getAll({
          FacilityId: facilityId,
          Page: page,
          PageSize: 100,
        });

        if (requestId !== requestIdRef.current) return;

        allUsers.push(...result.items);
        hasNextPage = result.hasNextPage;
        page += 1;
      }

      if (requestId !== requestIdRef.current) return;

      setUsers(
        allUsers
          .filter((user) => user.facilityId === facilityId)
          .map(mapUserToFacilityUser),
      );
    } catch (error) {
      if (requestId !== requestIdRef.current) return;

      setUsers([]);
      message.error(
        getErrorMessage(error, "Không thể tải danh sách tài khoản"),
      );
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [facilityId]);

  // Tải lại khi thay đổi cơ sở
  useEffect(() => {
    setUsers([]);
    setRoleFilter("all");
    setStatusFilter("all");
    setKeyword("");
    setEditingUser(null);
    onSelectionChange([]);

    void fetchUsers();

    return () => {
      requestIdRef.current += 1;
    };
    // onSelectionChange được cung cấp bởi component cha.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facilityId, fetchUsers]);

  // Lấy danh sách vai trò từ Backend
  useEffect(() => {
    let cancelled = false;

    const fetchRoles = async () => {
      setRoles([]);
      setRolesLoading(true);

      try {
        const result = await rolesApi.getRoles(organizationId);

        if (!cancelled) {
          setRoles(result);
        }
      } catch (error) {
        if (!cancelled) {
          message.error(
            getErrorMessage(error, "Không thể tải danh sách vai trò"),
          );
        }
      } finally {
        if (!cancelled) {
          setRolesLoading(false);
        }
      }
    };

    void fetchRoles();

    return () => {
      cancelled = true;
    };
  }, [organizationId]);

  // Các vai trò Backend trả về.
  // Chưa tự ý giới hạn hoặc tự gán quyền.
  const formRoleOptions = useMemo(
    () =>
      roles.map((role) => ({
        label: role.roleName,
        value: role.id,
      })),
    [roles],
  );

  // Bộ lọc danh sách
  const filteredUsers = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return users.filter((user) => {
      const matchFacility = user.facilityId === facilityId;

      const matchRole = roleFilter === "all" || user.role === roleFilter;

      const matchStatus =
        statusFilter === "all" || user.status === statusFilter;

      const matchKeyword =
        !normalizedKeyword ||
        user.username.toLowerCase().includes(normalizedKeyword) ||
        user.fullName.toLowerCase().includes(normalizedKeyword);

      return matchFacility && matchRole && matchStatus && matchKeyword;
    });
  }, [users, facilityId, roleFilter, statusFilter, keyword]);

  const filterRoleOptions = useMemo(() => {
    const roleNames = [...new Set(users.map((user) => user.role))]
      .filter(Boolean)
      .sort();

    return [
      { label: "Tất cả", value: "all" },
      ...roleNames.map((role) => ({
        label: role,
        value: role,
      })),
    ];
  }, [users]);

  const isUsernameExists = (username: string, excludeId?: string) =>
    users.some(
      (user) =>
        user.id !== excludeId &&
        user.username.toLowerCase() === username.trim().toLowerCase(),
    );

  // Đóng popup thêm
  const handleCloseCreateModal = () => {
    if (creating) return;
    onCloseCreate();
  };

  // Thêm tài khoản vào Database
  const handleCreateUser = async (values: FacilityUserFormValues) => {
    if (creating) return;

    if (isUsernameExists(values.username)) {
      message.error("Tên đăng nhập đã tồn tại trong cơ sở");
      return;
    }

    if (!values.password) {
      message.error("Vui lòng nhập mật khẩu");
      return;
    }

    if (!organizationId) {
      message.error("Cơ sở chưa có thông tin tổ chức");
      return;
    }

    const selectedRole = roles.find((role) => role.id === values.roleId);

    if (!selectedRole) {
      message.error("Vai trò không hợp lệ");
      return;
    }

    const payload: CreateUserDto = {
      username: values.username.trim(),
      password: values.password,
      fullName: values.fullName.trim(),
      email: values.email.trim(),
      phoneNumber: values.phone.trim(),
      organizationId,
      facilityId,
      roleId: values.roleId,
      isActive: true,
    };

    setCreating(true);

    try {
      await userApi.create(payload);

      message.success("Thêm tài khoản thành công");
      onCloseCreate();

      await fetchUsers();
    } catch (error) {
      message.error(getErrorMessage(error, "Không thể thêm tài khoản"));
    } finally {
      setCreating(false);
    }
  };

  // Chức năng cập nhật:

  const handleOpenEditModal = (user: FacilityUser) => {
    setEditingUser(user);
  };

  const handleCloseEditModal = () => {
    if (updating) return;
    setEditingUser(null);
  };

  const handleUpdateUser = async (values: FacilityUserFormValues) => {
    if (!editingUser || updating) return;

    if (!organizationId) {
      message.error("Cơ sở chưa có thông tin tổ chức");
      return;
    }

    const selectedRole = roles.find((role) => role.id === values.roleId);

    if (!selectedRole) {
      message.error("Vai trò không hợp lệ");
      return;
    }

    const payload: UpdateUserDto = {
      fullName: values.fullName.trim(),
      email: values.email.trim(),
      phoneNumber: values.phone.trim(),
      organizationId,
      facilityId,
      roleId: values.roleId,
      isActive: editingUser.status === "active",
    };

    setUpdating(true);

    try {
      await userApi.update(editingUser.id, payload);

      message.success("Cập nhật tài khoản thành công");

      setEditingUser(null);

      await fetchUsers();
    } catch (error) {
      message.error(getErrorMessage(error, "Không thể cập nhật tài khoản"));
    } finally {
      setUpdating(false);
    }
  };

  // Chức năng xóa:
  useEffect(() => {
    if (deleteRequestId === handledDeleteRequestRef.current) {
      return;
    }

    handledDeleteRequestRef.current = deleteRequestId;

    const ids = selectedRowKeys.map(String);

    const handleDeleteUsers = async () => {
      if (ids.length === 0) {
        onDeleteComplete();
        return;
      }

      try {
        const results = await Promise.allSettled(
          ids.map((id) => userApi.remove(id)),
        );

        const deletedIds = ids.filter(
          (_, index) => results[index].status === "fulfilled",
        );

        const failedIds = ids.filter(
          (_, index) => results[index].status === "rejected",
        );

        if (deletedIds.length > 0) {
          message.success(`Đã xóa thành công ${deletedIds.length} tài khoản`);

          await fetchUsers();
        }

        if (failedIds.length > 0) {
          message.error(
            `Không thể xóa ${failedIds.length} tài khoản. Vui lòng thử lại.`,
          );
        }
      } catch (error) {
        message.error(getErrorMessage(error, "Không thể xóa tài khoản"));
      } finally {
        onDeleteComplete();
      }
    };

    void handleDeleteUsers();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleteRequestId]);
  // Cột bảng
  const columns: TableColumnsType<FacilityUser> = [
    {
      title: "Tên đăng nhập",
      dataIndex: "username",
      key: "username",
      width: 125,
    },
    {
      title: "Tên người dùng",
      dataIndex: "fullName",
      key: "fullName",
      width: 155,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 200,
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      width: 110,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 125,
      render: (status: FacilityUser["status"]) => (
        <span
          className={`facility-users__status facility-users__status--${status}`}>
          {status === "active" ? "Đang hoạt động" : "Ngưng hoạt động"}
        </span>
      ),
    },
    {
      title: "Cập nhật lần cuối",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 150,
    },
    {
      title: "Cập nhật",
      key: "actions",
      width: 85,
      align: "center",
      render: (_, record) => (
        <AppTableActions
          actions={[
            {
              key: "edit",
              icon: <SquarePen />,
              tooltip: "Cập nhật tài khoản",
              onClick: () => handleOpenEditModal(record),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="facility-users">
      <div className="facility-users__panel">
        <h2 className="facility-users__title">Tài khoản quản trị</h2>

        <AppFilter
          showActions={false}
          gap={28}
          className="facility-users__filters">
          <AppFilterField width={180}>
            <Form.Item label="Vai trò">
              <AppSelect
                width="100%"
                value={roleFilter}
                onChange={setRoleFilter}
                options={filterRoleOptions}
              />
            </Form.Item>
          </AppFilterField>

          <AppFilterField width={180}>
            <Form.Item label="Trạng thái">
              <AppSelect
                width="100%"
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  {
                    label: "Tất cả",
                    value: "all",
                  },
                  {
                    label: "Đang hoạt động",
                    value: "active",
                  },
                  {
                    label: "Ngưng hoạt động",
                    value: "inactive",
                  },
                ]}
              />
            </Form.Item>
          </AppFilterField>

          <AppFilterField width={353} className="facility-users__search">
            <Form.Item label="Từ khóa">
              <Input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Tên đăng nhập/ tên người dùng/..."
                suffix={<Search size={20} />}
                allowClear
              />
            </Form.Item>
          </AppFilterField>
        </AppFilter>

        <AppTable<FacilityUser>
          rowKey="id"
          columns={columns}
          dataSource={filteredUsers}
          loading={loading}
          selectable
          selectedLabel="tài khoản"
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => {
              onSelectionChange([...keys]);
            },
          }}
          pagination={{
            pageSize: 10,
          }}
          scroll={{
            x: 1050,
          }}
        />
      </div>

      <FacilityUserFormModal
        open={openCreate}
        mode="create"
        loading={creating || rolesLoading}
        roleOptions={formRoleOptions}
        onCancel={handleCloseCreateModal}
        onSubmit={handleCreateUser}
      />

      <FacilityUserFormModal
        open={editingUser !== null}
        mode="edit"
        initialValues={editingUser ?? undefined}
        loading={updating || rolesLoading}
        roleOptions={formRoleOptions}
        onCancel={handleCloseEditModal}
        onSubmit={handleUpdateUser}
      />
    </div>
  );
}

export default FacilityUsers;
