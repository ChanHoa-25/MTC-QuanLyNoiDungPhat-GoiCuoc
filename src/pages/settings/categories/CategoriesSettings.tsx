import { useCallback, useEffect, useMemo, useState } from "react";
import type { Key } from "react";
import type { ColumnsType } from "antd/es/table";
import { message } from "antd";
import { Info, Plus, SquarePen, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import AppTable from "../../../components/common/AppTable";
import AppSearch from "../../../components/common/AppSearch";
import AppTableActions from "../../../components/common/AppTableActions";
import AppConfirmModal from "../../../components/common/AppConfirmModal";

import { useActionPanel } from "../../../contexts/ActionPanelContext";
import type { AppActionPanelItem } from "../../../components/common/AppActionPanel";

import CategoryModal from "./CategoryModal";
import type { CategoryModalMode } from "./CategoryModal";

import type { Category, CategoryFormValues } from "../types/categories.types";

import { mockCategories } from "../data/categories.mock";

import "./CategoriesSettings.css";

function CategoriesSettings() {
  const { setActions } = useActionPanel();

  const [categories, setCategories] = useState<Category[]>(() =>
    mockCategories.map((item) => ({ ...item })),
  );

  const [keyword, setKeyword] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<CategoryModalMode>("create");

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const navigate = useNavigate();

  const filteredCategories = useMemo(() => {
    const search = keyword.trim().toLowerCase();

    if (!search) return categories;

    return categories.filter((item) =>
      [item.code, item.name].some((value) =>
        value.toLowerCase().includes(search),
      ),
    );
  }, [categories, keyword]);

  const openCreateModal = useCallback(() => {
    setEditingCategory(null);
    setModalMode("create");
    setModalOpen(true);
  }, []);

  const openEditModal = useCallback((category: Category) => {
    setEditingCategory(category);
    setModalMode("edit");
    setModalOpen(true);
  }, []);

  const openViewModal = useCallback(
    (category: Category) => {
      navigate(`/settings/categories/${category.id}`);
    },
    [navigate],
  );

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingCategory(null);
  }, []);

  const handleSaveCategory = (values: CategoryFormValues) => {
    if (modalMode === "create") {
      const nextId =
        categories.reduce((max, item) => Math.max(max, item.id), 0) + 1;

      setCategories((prev) => [...prev, { id: nextId, ...values }]);

      message.success("Thêm lĩnh vực thành công");
    } else if (modalMode === "edit" && editingCategory) {
      setCategories((prev) =>
        prev.map((item) =>
          item.id === editingCategory.id ? { ...item, ...values } : item,
        ),
      );

      message.success("Cập nhật lĩnh vực thành công");
    }

    closeModal();
  };

  const openDeleteModal = useCallback(() => {
    if (selectedRowKeys.length === 0) {
      message.warning("Vui lòng chọn lĩnh vực cần xóa");
      return;
    }

    setDeleteModalOpen(true);
  }, [selectedRowKeys.length]);

  const handleConfirmDelete = () => {
    const selectedIds = new Set(selectedRowKeys);

    setCategories((prev) => prev.filter((item) => !selectedIds.has(item.id)));

    setSelectedRowKeys([]);
    setCurrentPage(1);
    setDeleteModalOpen(false);

    message.success("Xóa lĩnh vực thành công");
  };

  const actions = useMemo<AppActionPanelItem[]>(
    () => [
      {
        key: "add-category",
        icon: <Plus size={24} />,
        tooltip: "Thêm lĩnh vực",
        onClick: openCreateModal,
      },
      {
        key: "delete-category",
        icon: <Trash2 size={24} />,
        tooltip: "Xóa lĩnh vực",
        danger: true,
        disabled: selectedRowKeys.length === 0,
        onClick: openDeleteModal,
      },
    ],
    [openCreateModal, openDeleteModal, selectedRowKeys.length],
  );

  useEffect(() => {
    setActions(actions);
  }, [actions, setActions]);

  useEffect(() => {
    return () => {
      setActions([]);
    };
  }, [setActions]);

  const columns = useMemo<ColumnsType<Category>>(
    () => [
      {
        title: "STT",
        key: "stt",
        width: 80,
        align: "center",
        render: (_value, _record, index) =>
          (currentPage - 1) * pageSize + index + 1,
      },
      {
        title: "Mã lĩnh vực",
        dataIndex: "code",
        key: "code",
        width: 260,
      },
      {
        title: "Tên lĩnh vực",
        dataIndex: "name",
        key: "name",
      },
      {
        title: "Cập nhật",
        key: "actions",
        width: 180,
        align: "center",
        render: (_value, record) => (
          <AppTableActions
            actions={[
              {
                key: "edit",
                icon: <SquarePen size={20} />,
                tooltip: "Cập nhật lĩnh vực",
                onClick: () => openEditModal(record),
              },
              {
                key: "info",
                icon: <Info size={20} />,
                tooltip: "Xem thông tin lĩnh vực",
                onClick: () => openViewModal(record),
              },
            ]}
          />
        ),
      },
    ],
    [currentPage, pageSize, openEditModal, openViewModal],
  );

  return (
    <div className="categories-settings">
      <h2 className="categories-settings__title">
        Danh sách danh mục và lĩnh vực
      </h2>

      <div className="categories-settings__filter">
        <label htmlFor="categories-search">Từ khóa</label>

        <AppSearch
          id="categories-search"
          width={345}
          placeholder="Nhập từ khóa"
          value={keyword}
          onChange={(value) => {
            setKeyword(value);
            setCurrentPage(1);
          }}
        />
      </div>

      <div className="categories-settings__table">
        <AppTable<Category>
          rowKey="id"
          columns={columns}
          dataSource={filteredCategories}
          selectable
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => {
              setSelectedRowKeys([...keys]);
            },
            preserveSelectedRowKeys: true,
          }}
          showSelectedCount
          selectedLabel="lĩnh vực"
          pagination={{
            current: currentPage,
            pageSize,
            total: filteredCategories.length,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
        />
      </div>

      <CategoryModal
        open={modalOpen}
        mode={modalMode}
        category={editingCategory}
        categories={categories}
        onSave={handleSaveCategory}
        onCancel={closeModal}
      />

      <AppConfirmModal
        open={deleteModalOpen}
        type="delete"
        title="Xác nhận xóa lĩnh vực"
        description="Lĩnh vực này sẽ bị xóa khỏi hệ thống"
        confirmText="Tiếp tục"
        cancelText="Hủy"
        showIcon={false}
        width={500}
        className="categories-delete-modal"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}

export default CategoriesSettings;
