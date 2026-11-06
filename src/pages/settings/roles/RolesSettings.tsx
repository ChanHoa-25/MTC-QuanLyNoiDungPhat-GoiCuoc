import { useCallback, useEffect, useMemo, useState } from "react";
import type { Key } from "react";
import type { ColumnsType } from "antd/es/table";
import { message } from "antd";
import { Info, Plus, SquarePen, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import AppTabs from "../../../components/common/AppTabs";
import AppSearch from "../../../components/common/AppSearch";
import AppTable from "../../../components/common/AppTable";
import AppTableActions from "../../../components/common/AppTableActions";
import AppConfirmModal from "../../../components/common/AppConfirmModal";

import { useActionPanel } from "../../../contexts/ActionPanelContext";
import type { AppActionPanelItem } from "../../../components/common/AppActionPanel";

import type { Role } from "../types/roles.types";
import { mockRoles } from "../data/roles.mock";

import RoleUsersSettings from "./user/RoleUsersSettings";

import "./RolesSettings.css";

type RoleTab = "roles" | "users";

const roleTabs = [
  { key: "roles", label: "Danh sách vai trò" },
  { key: "users", label: "Người dùng" },
];

function RolesSettings() {
  const { setActions } = useActionPanel();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<RoleTab>("roles");

  const [roles, setRoles] = useState<Role[]>(() =>
    mockRoles.map((item) => ({ ...item })),
  );

  const [keyword, setKeyword] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const filteredRoles = useMemo(() => {
    const search = keyword.trim().toLowerCase();

    if (!search) return roles;

    return roles.filter((role) =>
      [role.name, role.code, role.description].some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(search),
      ),
    );
  }, [roles, keyword]);

  const openCreateRole = useCallback(() => {
    navigate("/settings/roles/create");
  }, [navigate]);

  const openDeleteModal = useCallback(() => {
    if (selectedRowKeys.length === 0) {
      message.warning("Vui lòng chọn vai trò cần xóa");
      return;
    }

    setDeleteModalOpen(true);
  }, [selectedRowKeys.length]);

  const handleConfirmDelete = () => {
    const selectedIds = new Set(selectedRowKeys);

    setRoles((prev) => prev.filter((role) => !selectedIds.has(role.id)));

    setSelectedRowKeys([]);
    setCurrentPage(1);
    setDeleteModalOpen(false);

    message.success("Xóa vai trò thành công");
  };

  const actions = useMemo<AppActionPanelItem[]>(
    () => [
      {
        key: "add-role",
        icon: <Plus size={24} />,
        tooltip: "Thêm vai trò",
        onClick: openCreateRole,
      },
      {
        key: "delete-role",
        icon: <Trash2 size={24} />,
        tooltip: "Xóa vai trò",
        danger: true,
        disabled: selectedRowKeys.length === 0,
        onClick: openDeleteModal,
      },
    ],
    [openCreateRole, openDeleteModal, selectedRowKeys.length],
  );

  useEffect(() => {
    if (activeTab !== "roles") return;

    setActions(actions);
  }, [activeTab, actions, setActions]);

  useEffect(() => {
    return () => {
      setActions([]);
    };
  }, [setActions]);

  const columns = useMemo<ColumnsType<Role>>(
    () => [
      {
        title: "Tên vai trò",
        dataIndex: "name",
        key: "name",
        width: 220,
      },
      {
        title: "Mã vai trò",
        dataIndex: "code",
        key: "code",
        width: 220,
      },
      {
        title: "Mô tả vai trò",
        dataIndex: "description",
        key: "description",
        width: 220,
      },
      {
        title: "Cập nhật lần cuối",
        dataIndex: "updatedAt",
        key: "updatedAt",
        width: 240,
      },
      {
        title: "Hành động",
        key: "actions",
        width: 150,
        align: "center",
        render: (_value, record) => (
          <AppTableActions
            actions={[
              {
                key: "edit",
                icon: <SquarePen size={20} />,
                tooltip: "Cập nhật vai trò",
                onClick: () => navigate(`/settings/roles/${record.id}/edit`),
              },
              {
                key: "detail",
                icon: <Info size={20} />,
                tooltip: "Chi tiết vai trò",
                onClick: () => navigate(`/settings/roles/${record.id}`),
              },
            ]}
          />
        ),
      },
    ],
    [navigate],
  );

  const handleTabChange = (key: string) => {
    if (key !== "roles" && key !== "users") return;

    setActiveTab(key);

    if (key === "users") {
      setActions([]);
    }
  };

  return (
    <div className="roles-settings">
      <AppTabs
        items={roleTabs}
        activeKey={activeTab}
        onChange={handleTabChange}
        ariaLabel="Quản lý vai trò"
      />

      {activeTab === "roles" ? (
        <section className="roles-settings__content">
          <h2 className="roles-settings__title">Danh sách vai trò</h2>

          <div className="roles-settings__filter">
            <label htmlFor="roles-search">Từ khóa</label>

            <AppSearch
              id="roles-search"
              width={345}
              placeholder="Nhập từ khóa"
              value={keyword}
              onChange={(value) => {
                setKeyword(value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="roles-settings__table">
            <AppTable<Role>
              rowKey="id"
              columns={columns}
              dataSource={filteredRoles}
              selectable
              rowSelection={{
                selectedRowKeys,
                onChange: (keys) => {
                  setSelectedRowKeys([...keys]);
                },
                preserveSelectedRowKeys: true,
              }}
              selectedLabel="vai trò"
              showSelectedCount
              pagination={{
                current: currentPage,
                pageSize,
                total: filteredRoles.length,
                onChange: (page, size) => {
                  setCurrentPage(page);
                  setPageSize(size);
                },
              }}
            />
          </div>
        </section>
      ) : (
        <RoleUsersSettings />
      )}

      <AppConfirmModal
        open={deleteModalOpen}
        type="delete"
        title="Xác nhận xóa vai trò"
        description="Các vai trò được chọn sẽ bị xóa khỏi hệ thống"
        confirmText="Tiếp tục"
        cancelText="Hủy"
        showIcon={false}
        width={500}
        className="roles-delete-modal"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}

export default RolesSettings;
