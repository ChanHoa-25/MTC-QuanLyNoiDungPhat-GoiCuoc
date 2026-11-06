import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import type { ColumnsType } from "antd/es/table";
import { message } from "antd";
import { SquarePen } from "lucide-react";

import AppTable from "../../../components/common/AppTable";
import AppTableActions from "../../../components/common/AppTableActions";

import { useActionPanel } from "../../../contexts/ActionPanelContext";

import CategoryUserModal from "./CategoryUserModal";

import type { Category } from "../types/categories.types";
import type {
  CategoryUser,
  CategoryUserFormValues,
} from "../types/categoryUsers.types";

import { mockCategories } from "../data/categories.mock";
import { mockCategoryUsers } from "../data/categoryUsers.mock";

import "./CategoryDetailSettings.css";

function CategoryDetailSettings() {
  const { id } = useParams<{ id: string }>();
  const { setActions } = useActionPanel();

  const categoryId = Number(id);

  const category = useMemo<Category | undefined>(
    () => mockCategories.find((item) => item.id === categoryId),
    [categoryId],
  );

  const [users, setUsers] = useState<CategoryUser[]>(() =>
    mockCategoryUsers.map((item) => ({ ...item })),
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<CategoryUser | null>(null);

  useEffect(() => {
    setActions([]);
  }, [setActions]);

  const categoryUsers = useMemo(
    () => users.filter((user) => user.categoryId === categoryId),
    [users, categoryId],
  );

  const openEditModal = (user: CategoryUser) => {
    setEditingUser(user);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingUser(null);
  };

  const handleSaveUser = (values: CategoryUserFormValues) => {
    if (!editingUser) return;

    setUsers((prev) =>
      prev.map((user) =>
        user.id === editingUser.id ? { ...user, ...values } : user,
      ),
    );

    message.success("Cập nhật tài khoản thành công");
    closeModal();
  };

  const columns = useMemo<ColumnsType<CategoryUser>>(
    () => [
      {
        title: "STT",
        key: "stt",
        width: 70,
        align: "center",
        render: (_value, _record, index) =>
          (currentPage - 1) * pageSize + index + 1,
      },
      {
        title: "Tên người dùng",
        dataIndex: "fullName",
        key: "fullName",
      },
      {
        title: "Vai trò",
        dataIndex: "role",
        key: "role",
      },
      {
        title: "Cập nhật",
        key: "actions",
        width: 160,
        align: "center",
        render: (_value, record) => (
          <AppTableActions
            actions={[
              {
                key: "edit",
                icon: <SquarePen size={20} />,
                tooltip: "Cập nhật tài khoản quản trị",
                onClick: () => openEditModal(record),
              },
            ]}
          />
        ),
      },
    ],
    [currentPage, pageSize],
  );

  if (!category) {
    return (
      <div className="category-detail__not-found">
        Không tìm thấy thông tin lĩnh vực.
      </div>
    );
  }

  return (
    <div className="category-detail">
      <section className="category-detail__info">
        <h2 className="category-detail__title">Chi tiết lĩnh vực</h2>

        <div className="category-detail__field">
          <span className="category-detail__label">Tên lĩnh vực:</span>
          <span className="category-detail__value">{category.name}</span>
        </div>

        <div className="category-detail__field">
          <span className="category-detail__label">Mã lĩnh vực:</span>
          <span className="category-detail__value">{category.code}</span>
        </div>

        <div className="category-detail__field">
          <span className="category-detail__label">Cập nhật lần cuối:</span>
          <span className="category-detail__value">25/07/2021 19:00:00</span>
        </div>

        <div className="category-detail__field">
          <span className="category-detail__label">Mô tả</span>
          <span className="category-detail__value">Mô tả vai trò 1</span>
        </div>
      </section>

      <section className="category-detail__users">
        <h2 className="category-detail__title">
          Chỉnh sửa lĩnh vực người dùng
        </h2>

        <div className="category-detail__table">
          <AppTable<CategoryUser>
            rowKey="id"
            columns={columns}
            dataSource={categoryUsers}
            selectable={false}
            pagination={{
              current: currentPage,
              pageSize,
              total: categoryUsers.length,
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              },
            }}
          />
        </div>
      </section>

      <CategoryUserModal
        open={modalOpen}
        user={editingUser}
        onSave={handleSaveUser}
        onCancel={closeModal}
      />
    </div>
  );
}

export default CategoryDetailSettings;
