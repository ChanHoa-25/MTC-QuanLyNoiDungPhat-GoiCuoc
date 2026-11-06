import { useCallback, useEffect, useMemo, useState } from "react";
import type { Key } from "react";
import type { ColumnsType } from "antd/es/table";
import { message } from "antd";
import { Plus, SquarePen, Trash2 } from "lucide-react";

// Common components
import AppTable from "../../../components/common/AppTable";
import AppSearch from "../../../components/common/AppSearch";
import AppTableActions from "../../../components/common/AppTableActions";
import AppConfirmModal from "../../../components/common/AppConfirmModal";

// ActionPanel
import { useActionPanel } from "../../../contexts/ActionPanelContext";
import type { AppActionPanelItem } from "../../../components/common/AppActionPanel";

// Modal thêm / sửa
import DeviceDistributorModal from "./DeviceDistributorModal";
import type { DeviceDistributorFormValues } from "./DeviceDistributorModal";

// Types & Mock data
import type { DeviceDistributor } from "../types/deviceDistributors.types";
import { mockDeviceDistributors } from "../data/deviceDistributors.mock";

// CSS
import "./DeviceDistributorsSettings.css";

function DeviceDistributorsSettings() {
  const { setActions } = useActionPanel();

  // =========================
  // DATA
  // =========================

  const [distributors, setDistributors] = useState<DeviceDistributor[]>(() =>
    mockDeviceDistributors.map((item) => ({ ...item })),
  );

  // =========================
  // SEARCH
  // =========================

  const [keyword, setKeyword] = useState("");

  const filteredDistributors = useMemo(() => {
    const search = keyword.trim().toLowerCase();

    if (!search) {
      return distributors;
    }

    return distributors.filter((item) =>
      [item.code, item.name, item.description].some((value) =>
        value.toLowerCase().includes(search),
      ),
    );
  }, [distributors, keyword]);

  // =========================
  // PAGINATION
  // =========================

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // =========================
  // ROW SELECTION
  // =========================

  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);

  const handleSelectionChange = (keys: Key[]) => {
    setSelectedRowKeys(keys);
  };

  // =========================
  // CREATE / EDIT MODAL
  // =========================

  const [modalOpen, setModalOpen] = useState(false);

  const [modalMode, setModalMode] = useState<"create" | "edit">("create");

  const [editingDistributor, setEditingDistributor] =
    useState<DeviceDistributor | null>(null);

  const openCreateModal = useCallback(() => {
    setEditingDistributor(null);
    setModalMode("create");
    setModalOpen(true);
  }, []);

  const openEditModal = useCallback((distributor: DeviceDistributor) => {
    setEditingDistributor(distributor);
    setModalMode("edit");
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingDistributor(null);
  }, []);

  // =========================
  // SAVE DISTRIBUTOR
  // =========================

  const handleSaveDistributor = (values: DeviceDistributorFormValues) => {
    if (modalMode === "create") {
      const nextId =
        distributors.reduce((max, item) => Math.max(max, item.id), 0) + 1;

      const newDistributor: DeviceDistributor = {
        id: nextId,
        ...values,
      };

      setDistributors((prev) => [...prev, newDistributor]);

      message.success("Thêm nhà phân phối thành công");
    } else if (editingDistributor) {
      setDistributors((prev) =>
        prev.map((item) =>
          item.id === editingDistributor.id ? { ...item, ...values } : item,
        ),
      );

      message.success("Cập nhật nhà phân phối thành công");
    }

    closeModal();
  };

  // =========================
  // DELETE MODAL
  // =========================

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const openDeleteModal = useCallback(() => {
    if (selectedRowKeys.length === 0) {
      message.warning("Vui lòng chọn nhà phân phối cần xóa");
      return;
    }

    setDeleteModalOpen(true);
  }, [selectedRowKeys.length]);

  const closeDeleteModal = useCallback(() => {
    setDeleteModalOpen(false);
  }, []);

  const handleConfirmDelete = () => {
    const selectedIds = new Set(selectedRowKeys);

    setDistributors((prev) => prev.filter((item) => !selectedIds.has(item.id)));

    setSelectedRowKeys([]);
    setCurrentPage(1);
    setDeleteModalOpen(false);

    message.success("Xóa nhà phân phối thành công");
  };

  // =========================
  // ACTION PANEL
  // =========================

  const actions = useMemo<AppActionPanelItem[]>(
    () => [
      {
        key: "add-device-distributor",
        icon: <Plus size={24} />,
        tooltip: "Thêm nhà phân phối",
        onClick: openCreateModal,
      },
      {
        key: "delete-device-distributor",
        icon: <Trash2 size={24} />,
        tooltip: "Xóa nhà phân phối",
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

  // =========================
  // TABLE COLUMNS
  // =========================

  const columns = useMemo<ColumnsType<DeviceDistributor>>(
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
        title: "Mã nhà cung cấp",
        dataIndex: "code",
        key: "code",
        width: 190,
      },
      {
        title: "Tên nhà cung cấp",
        dataIndex: "name",
        key: "name",
        width: 250,
      },
      {
        title: "Mô tả",
        dataIndex: "description",
        key: "description",
      },
      {
        title: "Cập nhật",
        key: "actions",
        width: 120,
        align: "center",
        render: (_value, record) => (
          <AppTableActions
            actions={[
              {
                key: "edit",
                icon: <SquarePen size={20} />,
                tooltip: "Cập nhật nhà phân phối",
                onClick: () => openEditModal(record),
              },
            ]}
          />
        ),
      },
    ],
    [currentPage, pageSize, openEditModal],
  );

  // =========================
  // RENDER
  // =========================

  return (
    <div className="device-distributors">
      {/* PAGE TITLE */}
      <h2 className="device-distributors__title">
        Danh sách nhà phân phối thiết bị
      </h2>

      {/* SEARCH */}
      <div className="device-distributors__filter">
        <label htmlFor="device-distributors-search">Từ khóa</label>

        <AppSearch
          id="device-distributors-search"
          width={345}
          placeholder="Nhập từ khóa"
          value={keyword}
          onChange={(value) => {
            setKeyword(value);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* TABLE */}
      <div className="device-distributors__table">
        <AppTable<DeviceDistributor>
          rowKey="id"
          columns={columns}
          dataSource={filteredDistributors}
          selectable
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => {
              handleSelectionChange([...keys]);
            },
            preserveSelectedRowKeys: true,
          }}
          showSelectedCount
          selectedLabel="nhà cung cấp"
          pagination={{
            current: currentPage,
            pageSize,
            total: filteredDistributors.length,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
        />
      </div>

      {/* CREATE / EDIT MODAL */}
      <DeviceDistributorModal
        open={modalOpen}
        mode={modalMode}
        distributor={editingDistributor}
        distributors={distributors}
        onSave={handleSaveDistributor}
        onCancel={closeModal}
      />

      {/* DELETE CONFIRM MODAL */}
      <AppConfirmModal
        open={deleteModalOpen}
        type="delete"
        title="Xóa nhà phân phối"
        description={`Bạn có chắc chắn muốn xóa ${selectedRowKeys.length} nhà phân phối đã chọn?`}
        confirmText="Xóa"
        cancelText="Hủy"
        onConfirm={handleConfirmDelete}
        onCancel={closeDeleteModal}
      />
    </div>
  );
}

export default DeviceDistributorsSettings;
