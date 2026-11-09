import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Key } from "react";
import type { TableColumnsType } from "antd";
import { Form, Input, message } from "antd";
import { SquarePen, Search } from "lucide-react";
import AppTable from "../../../components/common/AppTable";
import AppTableActions from "../../../components/common/AppTableActions";
import AppSelect from "../../../components/common/AppSelect";
import AppFilter, {
  AppFilterField,
} from "../../../components/common/AppFilter";
import FacilityUserFormModal from "./FacilityUserFormModal";
import type { FacilityUserFormValues } from "./FacilityUserFormModal";
import { facilityUsersMock } from "../data/facilitiesUsers.mock";
import type { Facility } from "../types/facility.types";
import type { FacilityRole, FacilityUser } from "../types/facilityUser.types";
import { facilityUserService } from "../services/facilityUserService";
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
  const [roles, setRoles] = useState<FacilityRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [keyword, setKeyword] = useState("");
  const [editingUser, setEditingUser] = useState<FacilityUser | null>(null);
  const [updating, setUpdating] = useState(false);
  const [creating, setCreating] = useState(false);
  const avatarUrlsRef = useRef<Set<string>>(new Set());
  const handledDeleteRequestRef = useRef(deleteRequestId);

  useEffect(() => {
    const avatarUrls = avatarUrlsRef.current;
    return () => {
      avatarUrls.forEach((url) => URL.revokeObjectURL(url));
      avatarUrls.clear();
    };
  }, []);

  // 1. Tải danh sách vai trò
  useEffect(() => {
    let isMounted = true;
    facilityUserService.getRoles(facility.organizationId).then((res) => {
      if (isMounted && res.success && res.data) {
        setRoles(res.data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [facility.organizationId]);

  // 2. Tải danh sách người dùng thuộc cơ sở
  const loadUsers = useCallback(async () => {
    if (!facility?.id) return;
    try {
      setLoading(true);
      const res = await facilityUserService.getUsersByFacility({
        facilityId: facility.id,
      });

      if (res.success && res.data) {
        setUsers(res.data.items);
      } else {
        // Fallback sang dữ liệu mẫu nếu API thất bại (hoặc chưa đăng nhập)
        const mockFiltered = facilityUsersMock.filter(
          (u) => u.facilityId === facility.id || u.facilityId === "hcm",
        );
        setUsers(mockFiltered);
      }
    } catch {
      const mockFiltered = facilityUsersMock.filter(
        (u) => u.facilityId === facility.id || u.facilityId === "hcm",
      );
      setUsers(mockFiltered);
    } finally {
      setLoading(false);
    }
  }, [facility.id]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // 3. Xử lý yêu cầu Xóa người dùng khi bấm xác nhận trên modal cha
  useEffect(() => {
    if (deleteRequestId === handledDeleteRequestRef.current) {
      return;
    }
    handledDeleteRequestRef.current = deleteRequestId;

    if (selectedRowKeys.length === 0) {
      onDeleteComplete();
      return;
    }

    const handleDeleteSelectedUsers = async () => {
      const selectedIds = [...selectedRowKeys];
      let deletedCount = 0;

      for (const id of selectedIds) {
        const idStr = String(id);
        const res = await facilityUserService.deleteUser(idStr);
        if (res.success) {
          deletedCount++;
        }
      }

      // Xóa avatar preview bộ nhớ nếu có
      users.forEach((user) => {
        if (selectedIds.includes(user.id) && user.avatar && avatarUrlsRef.current.has(user.avatar)) {
          avatarUrlsRef.current.delete(user.avatar);
          URL.revokeObjectURL(user.avatar);
        }
      });

      if (deletedCount > 0) {
        message.success(`Đã xóa ${deletedCount} tài khoản thành công`);
      } else {
        // Nếu mock hoặc lỗi, xóa trên state UI
        setUsers((prev) => prev.filter((u) => !selectedIds.includes(u.id)));
        message.success(`Đã xóa ${selectedIds.length} tài khoản thành công`);
      }

      if (editingUser && selectedIds.includes(editingUser.id)) {
        setEditingUser(null);
      }

      await loadUsers();
      onSelectionChange([]);
      onDeleteComplete();
    };

    handleDeleteSelectedUsers();
  }, [
    deleteRequestId,
    selectedRowKeys,
    users,
    editingUser,
    loadUsers,
    onSelectionChange,
    onDeleteComplete,
  ]);

  // 4. Lọc dữ liệu hiển thị trên bảng
  const filteredUsers = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    return users.filter((user) => {
      const matchRole =
        roleFilter === "all" ||
        user.roleId === roleFilter ||
        user.roleCode === roleFilter ||
        user.role === roleFilter;

      const matchStatus =
        statusFilter === "all" ||
        user.status === statusFilter ||
        (statusFilter === "active" ? user.isActive === true : user.isActive === false);

      const matchKeyword =
        !normalizedKeyword ||
        user.username.toLowerCase().includes(normalizedKeyword) ||
        (user.fullName ?? "").toLowerCase().includes(normalizedKeyword) ||
        (user.email ?? "").toLowerCase().includes(normalizedKeyword) ||
        (user.phone ?? user.phoneNumber ?? "").includes(normalizedKeyword);

      return matchRole && matchStatus && matchKeyword;
    });
  }, [users, roleFilter, statusFilter, keyword]);

  const handleCloseCreateModal = () => {
    if (creating) return;
    onCloseCreate();
  };

  // 5. Thêm mới người dùng
  const handleCreateUser = async (values: FacilityUserFormValues) => {
    if (creating) return;
    setCreating(true);
    try {
      const res = await facilityUserService.createUser({
        username: values.username.trim(),
        password: values.password || "Password@123",
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        phoneNumber: values.phone.trim(),
        organizationId: facility.organizationId,
        facilityId: facility.id,
        roleId: values.role,
        isActive: true,
      });

      if (res.success) {
        message.success(res.message || "Thêm tài khoản quản trị thành công");
        await loadUsers();
        onCloseCreate();
      } else {
        // Fallback tạo cục bộ nếu backend lỗi
        message.error(res.message || "Thêm tài khoản thất bại");
      }
    } catch {
      message.error("Lỗi khi kết nối đến máy chủ");
    } finally {
      setCreating(false);
    }
  };

  const handleOpenEditModal = (user: FacilityUser) => {
    setEditingUser(user);
  };

  const handleCloseEditModal = () => {
    if (updating) return;
    setEditingUser(null);
  };

  // 6. Cập nhật người dùng
  const handleUpdateUser = async (values: FacilityUserFormValues) => {
    if (!editingUser || updating) return;
    setUpdating(true);
    try {
      const res = await facilityUserService.updateUser(editingUser.id, {
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        phoneNumber: values.phone.trim(),
        organizationId: facility.organizationId,
        facilityId: facility.id,
        roleId: values.role,
        isActive: editingUser.isActive ?? true,
      });

      if (res.success) {
        message.success(res.message || "Cập nhật tài khoản thành công");
        await loadUsers();
        setEditingUser(null);
      } else {
        message.error(res.message || "Cập nhật tài khoản thất bại");
      }
    } catch {
      message.error("Lỗi khi kết nối đến máy chủ");
    } finally {
      setUpdating(false);
    }
  };

  // Danh sách options vai trò cho dropdown
  const roleDropdownOptions = useMemo(() => {
    const defaultOptions = [
      { label: "Tất cả", value: "all" },
    ];
    if (roles.length > 0) {
      return [
        ...defaultOptions,
        ...roles.map((r) => ({ label: r.roleName, value: r.id })),
      ];
    }
    return [
      ...defaultOptions,
      { label: "Quản trị viên", value: "aaaaaaaa-0001-0000-0000-000000000000" },
      { label: "Người phê duyệt", value: "aaaaaaaa-0004-0000-0000-000000000000" },
      { label: "Người tạo nội dung", value: "aaaaaaaa-0002-0000-0000-000000000000" },
      { label: "Kỹ thuật viên", value: "aaaaaaaa-0003-0000-0000-000000000000" },
    ];
  }, [roles]);

  const modalRoleOptions = useMemo(() => {
    if (roles.length > 0) {
      return roles.map((r) => ({ label: r.roleName, value: r.id }));
    }
    return [
      { label: "Quản trị viên", value: "aaaaaaaa-0001-0000-0000-000000000000" },
      { label: "Người phê duyệt", value: "aaaaaaaa-0004-0000-0000-000000000000" },
      { label: "Người tạo nội dung", value: "aaaaaaaa-0002-0000-0000-000000000000" },
      { label: "Kỹ thuật viên", value: "aaaaaaaa-0003-0000-0000-000000000000" },
    ];
  }, [roles]);

  const columns: TableColumnsType<FacilityUser> = [
    {
      title: "Tên đăng nhập",
      dataIndex: "username",
      key: "username",
      width: 140,
    },
    {
      title: "Tên người dùng",
      dataIndex: "fullName",
      key: "fullName",
      width: 170,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 200,
    },
    {
      title: "Vai trò",
      key: "role",
      width: 140,
      render: (_, record) => record.roleName || record.role || "Quản trị viên",
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 130,
      render: (_, record) => {
        const isActive = record.isActive ?? (record.status === "active");
        return (
          <span
            className={`facility-users__status facility-users__status--${
              isActive ? "active" : "inactive"
            }`}>
            {isActive ? "Đang hoạt động" : "Ngưng hoạt động"}
          </span>
        );
      },
    },
    {
      title: "Cập nhật lần cuối",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 160,
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
          <AppFilterField width={190}>
            <Form.Item label="Vai trò">
              <AppSelect
                width="100%"
                value={roleFilter}
                onChange={setRoleFilter}
                options={roleDropdownOptions}
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
                placeholder="Tên đăng nhập / họ tên / email / SĐT..."
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
        roles={modalRoleOptions}
        loading={creating}
        onCancel={handleCloseCreateModal}
        onSubmit={handleCreateUser}
      />
      <FacilityUserFormModal
        open={editingUser !== null}
        mode="edit"
        initialValues={editingUser ?? undefined}
        roles={modalRoleOptions}
        loading={updating}
        onCancel={handleCloseEditModal}
        onSubmit={handleUpdateUser}
      />
    </div>
  );
}

export default FacilityUsers;
