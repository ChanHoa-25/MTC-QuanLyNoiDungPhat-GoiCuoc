import { useEffect, useMemo, useRef, useState } from "react";
import type { Key } from "react";
import type { TableColumnsType } from "antd";
import { Form, Input, message } from "antd";
import { SquarePen, Search } from "lucide-react";

import AppTable from "../../../../components/common/AppTable";
import AppTableActions from "../../../../components/common/AppTableActions";
import AppSelect from "../../../../components/common/AppSelect";
import AppFilter, {
  AppFilterField,
} from "../../../../components/common/AppFilter";

import SiteUserFormModal from "../SiteUserFormModal";
import type { SiteUserFormValues } from "../SiteUserFormModal";

import { siteUsersMock } from "../../data/siteUsers.mock";

import type { Site } from "../../types/site.types";
import type { SiteUser } from "../../types/siteuser.types";

import "./SiteUsers.css";

interface SiteUsersProps {
  site: Site;
  selectedRowKeys: Key[];
  onSelectionChange: (keys: Key[]) => void;
  openCreate: boolean;
  onCloseCreate: () => void;
  deleteRequestId: number;
  onDeleteComplete: () => void;
}

function SiteUsers({
  site,
  selectedRowKeys,
  onSelectionChange,
  openCreate,
  onCloseCreate,
  deleteRequestId,
  onDeleteComplete,
}: SiteUsersProps) {
  const [users, setUsers] = useState<SiteUser[]>(() => [...siteUsersMock]);

  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [keyword, setKeyword] = useState("");

  const [editingUser, setEditingUser] = useState<SiteUser | null>(null);

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

  const createAvatarUrl = (file?: File): string | undefined => {
    if (!file) return undefined;

    const url = URL.createObjectURL(file);
    avatarUrlsRef.current.add(url);

    return url;
  };

  useEffect(() => {
    if (deleteRequestId === handledDeleteRequestRef.current) {
      return;
    }

    handledDeleteRequestRef.current = deleteRequestId;

    if (selectedRowKeys.length === 0) {
      onDeleteComplete();
      return;
    }

    const selectedIds = new Set(selectedRowKeys);

    const deletedUsers = users.filter(
      (user) => user.siteId === site.id && selectedIds.has(user.id),
    );

    if (deletedUsers.length === 0) {
      onSelectionChange([]);
      onDeleteComplete();
      return;
    }

    deletedUsers.forEach((user) => {
      if (user.avatar && avatarUrlsRef.current.has(user.avatar)) {
        avatarUrlsRef.current.delete(user.avatar);
        URL.revokeObjectURL(user.avatar);
      }
    });

    setUsers((previousUsers) =>
      previousUsers.filter(
        (user) => !(user.siteId === site.id && selectedIds.has(user.id)),
      ),
    );

    if (editingUser && selectedIds.has(editingUser.id)) {
      setEditingUser(null);
    }

    onSelectionChange([]);
    onDeleteComplete();

    message.success(`Đã xóa ${deletedUsers.length} tài khoản thành công`);
  }, [
    deleteRequestId,
    selectedRowKeys,
    users,
    site.id,
    editingUser,
    onSelectionChange,
    onDeleteComplete,
  ]);

  const filteredUsers = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return users.filter((user) => {
      const matchSite = user.siteId === site.id;

      const matchRole = roleFilter === "all" || user.role === roleFilter;

      const matchStatus =
        statusFilter === "all" || user.status === statusFilter;

      const matchKeyword =
        !normalizedKeyword ||
        user.username.toLowerCase().includes(normalizedKeyword) ||
        (user.fullName ?? "").toLowerCase().includes(normalizedKeyword);

      return matchSite && matchRole && matchStatus && matchKeyword;
    });
  }, [users, site.id, roleFilter, statusFilter, keyword]);

  const isUsernameExists = (username: string, excludeId?: string) => {
    return users.some(
      (user) =>
        user.id !== excludeId &&
        user.username.toLowerCase() === username.trim().toLowerCase(),
    );
  };

  const handleCloseCreateModal = () => {
    if (creating) return;

    onCloseCreate();
  };

  const handleCreateUser = (values: SiteUserFormValues) => {
    if (creating) return;

    if (isUsernameExists(values.username)) {
      message.error("Tên đăng nhập đã tồn tại");
      return;
    }

    setCreating(true);

    try {
      const newUser: SiteUser = {
        id: crypto.randomUUID(),
        siteId: site.id,
        username: values.username.trim(),
        fullName: values.fullName,
        identityNumber: values.identityNumber,
        phone: values.phone,
        email: values.email,
        role: values.role,
        avatar: createAvatarUrl(values.avatar),
        status: "active",
        updatedAt: new Date().toLocaleString("vi-VN"),
      };

      setUsers((previousUsers) => [newUser, ...previousUsers]);

      message.success("Thêm tài khoản quản trị thành công");

      onCloseCreate();
    } finally {
      setCreating(false);
    }
  };

  const handleOpenEditModal = (user: SiteUser) => {
    setEditingUser(user);
  };

  const handleCloseEditModal = () => {
    if (updating) return;

    setEditingUser(null);
  };

  const handleUpdateUser = (values: SiteUserFormValues) => {
    if (!editingUser || updating) return;

    if (isUsernameExists(values.username, editingUser.id)) {
      message.error("Tên đăng nhập đã tồn tại");
      return;
    }

    setUpdating(true);

    try {
      const oldAvatar = editingUser.avatar;

      const newAvatar = values.avatar
        ? createAvatarUrl(values.avatar)
        : undefined;

      const avatarUrl = newAvatar ?? oldAvatar;

      setUsers((previousUsers) =>
        previousUsers.map((user) =>
          user.id === editingUser.id
            ? {
                ...user,
                username: values.username.trim(),
                fullName: values.fullName,
                identityNumber: values.identityNumber,
                phone: values.phone,
                email: values.email,
                role: values.role,
                avatar: avatarUrl,
                updatedAt: new Date().toLocaleString("vi-VN"),
              }
            : user,
        ),
      );

      if (newAvatar && oldAvatar && avatarUrlsRef.current.has(oldAvatar)) {
        avatarUrlsRef.current.delete(oldAvatar);
        URL.revokeObjectURL(oldAvatar);
      }

      message.success("Cập nhật tài khoản thành công");

      setEditingUser(null);
    } finally {
      setUpdating(false);
    }
  };

  const columns: TableColumnsType<SiteUser> = [
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
      render: (status: SiteUser["status"]) => (
        <span className={`site-users__status site-users__status--${status}`}>
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
    <div className="site-users">
      <div className="site-users__panel">
        <h2 className="site-users__title">Tài khoản quản trị</h2>

        <AppFilter showActions={false} gap={28} className="site-users__filters">
          <AppFilterField width={180}>
            <Form.Item label="Vai trò">
              <AppSelect
                width="100%"
                value={roleFilter}
                onChange={setRoleFilter}
                options={[
                  {
                    label: "Tất cả",
                    value: "all",
                  },
                  {
                    label: "Group Admin",
                    value: "Group Admin",
                  },
                ]}
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

          <AppFilterField width={353} className="site-users__search">
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

        <AppTable<SiteUser>
          rowKey="id"
          columns={columns}
          dataSource={filteredUsers}
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

      <SiteUserFormModal
        open={openCreate}
        mode="create"
        loading={creating}
        onCancel={handleCloseCreateModal}
        onSubmit={handleCreateUser}
      />

      <SiteUserFormModal
        open={editingUser !== null}
        mode="edit"
        initialValues={editingUser ?? undefined}
        loading={updating}
        onCancel={handleCloseEditModal}
        onSubmit={handleUpdateUser}
      />
    </div>
  );
}

export default SiteUsers;
