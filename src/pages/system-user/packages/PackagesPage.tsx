import { useCallback, useEffect, useMemo, useState } from "react";
import type { Key } from "react";
import { Table, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Info, Minus, Plus, SquarePen, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useActionPanel } from "../../../contexts/ActionPanelContext";

import AppTabs from "../../../components/common/AppTabs";
import AppTable from "../../../components/common/AppTable";
import AppTableActions from "../../../components/common/AppTableActions";
import AppSelect from "../../../components/common/AppSelect";
import AppSearch from "../../../components/common/AppSearch";
import AppStatusTag from "../../../components/common/AppStatusTag";
import AppConfirmModal from "../../../components/common/AppConfirmModal";

import { INITIAL_PACKAGE_GROUPS } from "./data/packages.mock";

import type {
  PackageGroup,
  PackageItem,
  PackageStatus,
} from "./types/package.types";

import { PACKAGE_STATUS_LABELS } from "./types/package.types";

import "./PackagesPage.css";
import PackageHistory from "./PackageHistory/PackageHistory";

type PackageTab = "list" | "history";

type PackageTableRow = {
  key: string;
  id: string;
  capacity: string;
  name: string;
  duration: string;
  deviceLimit: string;
  price: number | null;
  visibility: string;
  registrations: number | null;
  createdAt: string;
  status: PackageStatus | null;
  isGroup: boolean;
  children?: PackageTableRow[];
};

const PAGE_SIZE = 10;

const STATUS_VARIANTS: Record<
  PackageStatus,
  "green" | "yellow" | "red" | "gray"
> = {
  active: "green",
  inactive: "yellow",
  stopped: "red",
  expired: "gray",
};

const formatPrice = (price: number | null): string => {
  if (price === null) return "";

  return `${new Intl.NumberFormat("vi-VN").format(price)} VND`;
};

const toTableRow = (item: PackageItem): PackageTableRow => ({
  key: item.id,
  id: item.id,
  capacity: item.capacity,
  name: item.name,
  duration: item.duration,
  deviceLimit: item.deviceLimit,
  price: item.price,
  visibility: item.visibility,
  registrations: item.registrations,
  createdAt: item.createdAt,
  status: item.status,
  isGroup: false,
});

function PackagesPage() {
  const navigate = useNavigate();
  const { setActions } = useActionPanel();

  const [activeTab, setActiveTab] = useState<PackageTab>("list");

  const [groups, setGroups] = useState<PackageGroup[]>(
    () => INITIAL_PACKAGE_GROUPS,
  );

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [durationFilter, setDurationFilter] = useState("ALL");
  const [keyword, setKeyword] = useState("");

  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);

  const [expandedRowKeys, setExpandedRowKeys] = useState<Key[]>(() =>
    INITIAL_PACKAGE_GROUPS.map((group) => group.id),
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const allPackages = useMemo(
    () => groups.flatMap((group) => group.packages),
    [groups],
  );

  const selectedPackageIds = useMemo(() => {
    const selectedGroupIds = new Set(selectedRowKeys.map(String));

    return groups
      .filter((group) => selectedGroupIds.has(group.id))
      .flatMap((group) => group.packages.map((item) => item.id));
  }, [groups, selectedRowKeys]);

  const durationOptions = useMemo(() => {
    const durations = Array.from(
      new Set(allPackages.map((item) => item.duration)),
    );

    return [
      { label: "Tất cả", value: "ALL" },
      ...durations.map((duration) => ({
        label: duration,
        value: duration,
      })),
    ];
  }, [allPackages]);

  const filteredGroups = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return groups
      .map((group) => {
        const packages = group.packages.filter((item) => {
          const matchesStatus =
            statusFilter === "ALL" || item.status === statusFilter;

          const matchesDuration =
            durationFilter === "ALL" || item.duration === durationFilter;

          const matchesKeyword =
            normalizedKeyword.length === 0 ||
            [group.capacity, group.name, item.name, item.visibility].some(
              (value) => value.toLowerCase().includes(normalizedKeyword),
            );

          return matchesStatus && matchesDuration && matchesKeyword;
        });

        return {
          ...group,
          packages,
        };
      })
      .filter((group) => group.packages.length > 0);
  }, [groups, statusFilter, durationFilter, keyword]);

  const filteredPackages = useMemo(
    () => filteredGroups.flatMap((group) => group.packages),
    [filteredGroups],
  );

  const tableData = useMemo<PackageTableRow[]>(() => {
    const startIndex = (currentPage - 1) * pageSize;

    const pageIds = new Set(
      filteredPackages
        .slice(startIndex, startIndex + pageSize)
        .map((item) => item.id),
    );

    return filteredGroups
      .map((group): PackageTableRow => {
        const children = group.packages
          .filter((item) => pageIds.has(item.id))
          .map(toTableRow);

        return {
          key: group.id,
          id: group.id,
          capacity: group.capacity,
          name: group.name,
          duration: "",
          deviceLimit: "",
          price: null,
          visibility: "",
          registrations: null,
          createdAt: "",
          status: null,
          isGroup: true,
          children,
        };
      })
      .filter((group) => (group.children?.length ?? 0) > 0);
  }, [filteredGroups, filteredPackages, currentPage, pageSize]);

  const resetPagination = () => {
    setCurrentPage(1);
    setSelectedRowKeys([]);
  };

  const handleToggleGroup = useCallback((groupId: string) => {
    setExpandedRowKeys((previous) =>
      previous.includes(groupId)
        ? previous.filter((key) => key !== groupId)
        : [...previous, groupId],
    );
  }, []);

  const handleAdd = useCallback(() => {
    navigate("/system/packages/create");
  }, [navigate]);

  const handleEdit = useCallback((row: PackageTableRow) => {
    message.info(
      row.isGroup
        ? `Chưa triển khai chỉnh sửa nhóm ${row.capacity}`
        : `Chưa triển khai chỉnh sửa gói ${row.name}`,
    );
  }, []);

  const handleDetail = useCallback(
    (row: PackageTableRow) => {
      if (!row.isGroup) return;

      navigate(`/system/packages/${row.id}`);
    },
    [navigate],
  );

  const handleRequestDelete = useCallback(() => {
    if (selectedPackageIds.length === 0) {
      message.warning("Vui lòng chọn nhóm gói cước cần xóa");
      return;
    }

    setDeleteOpen(true);
  }, [selectedPackageIds]);

  const handleConfirmDelete = () => {
    const idsToDelete = new Set(selectedPackageIds);

    setGroups((previous) =>
      previous
        .map((group) => ({
          ...group,
          packages: group.packages.filter((item) => !idsToDelete.has(item.id)),
        }))
        .filter((group) => group.packages.length > 0),
    );

    setSelectedRowKeys([]);
    setCurrentPage(1);
    setDeleteOpen(false);

    message.success("Đã xóa gói cước khỏi dữ liệu mẫu");
  };

  useEffect(() => {
    if (activeTab !== "list") {
      setActions([]);
      return;
    }

    setActions([
      {
        key: "add",
        icon: <Plus />,
        tooltip: "Thêm gói cước",
        onClick: handleAdd,
      },
      {
        key: "delete",
        icon: <Trash2 />,
        tooltip: "Xóa gói cước",
        danger: true,
        onClick: handleRequestDelete,
      },
    ]);

    return () => setActions([]);
  }, [activeTab, setActions, handleAdd, handleRequestDelete]);

  const columns: ColumnsType<PackageTableRow> = useMemo(
    () => [
      {
        title: "",
        key: "expander",
        width: 24,
        className: "packages-expander-col",
        render: (_: unknown, row: PackageTableRow) => {
          if (!row.isGroup) return null;

          const expanded = expandedRowKeys.includes(row.key);

          return (
            <button
              type="button"
              className="packages-expand-button"
              aria-label={
                expanded
                  ? `Thu gọn nhóm ${row.capacity}`
                  : `Mở rộng nhóm ${row.capacity}`
              }
              aria-expanded={expanded}
              onClick={(event) => {
                event.stopPropagation();
                handleToggleGroup(row.key);
              }}>
              {expanded ? <Minus size={12} /> : <Plus size={12} />}
            </button>
          );
        },
      },
      Table.SELECTION_COLUMN,
      {
        title: "Dung lượng",
        dataIndex: "capacity",
        key: "capacity",
        width: 110,
        render: (value: string, row: PackageTableRow) =>
          row.isGroup ? value : null,
      },
      {
        title: "Tên",
        dataIndex: "name",
        key: "name",
        width: 125,
      },
      {
        title: "Thời hạn",
        dataIndex: "duration",
        key: "duration",
        width: 95,
      },
      {
        title: "GH thiết bị",
        dataIndex: "deviceLimit",
        key: "deviceLimit",
        width: 115,
      },
      {
        title: "Giá gói cước",
        dataIndex: "price",
        key: "price",
        width: 120,
        render: (value: number | null) => formatPrice(value),
      },
      {
        title: "Công khai gói cước",
        dataIndex: "visibility",
        key: "visibility",
        width: 170,
      },
      {
        title: "Lượt đăng ký",
        dataIndex: "registrations",
        key: "registrations",
        width: 100,
        render: (value: number | null) => value ?? "",
      },
      {
        title: "Thời gian tạo",
        dataIndex: "createdAt",
        key: "createdAt",
        width: 110,
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        width: 145,
        render: (status: PackageStatus | null) => {
          if (!status) return null;

          return (
            <AppStatusTag
              type="status"
              variant={STATUS_VARIANTS[status]}
              label={PACKAGE_STATUS_LABELS[status]}
            />
          );
        },
      },
      {
        title: "Hành động",
        key: "actions",
        width: 100,
        align: "center",
        render: (_: unknown, row: PackageTableRow) => {
          if (!row.isGroup) return null;

          return (
            <AppTableActions
              actions={[
                {
                  key: "edit",
                  icon: <SquarePen />,
                  tooltip: "Chỉnh sửa",
                  onClick: () => handleEdit(row),
                },
                {
                  key: "detail",
                  icon: <Info />,
                  tooltip: "Xem chi tiết",
                  onClick: () => handleDetail(row),
                },
              ]}
            />
          );
        },
      },
    ],
    [expandedRowKeys, handleToggleGroup, handleEdit, handleDetail],
  );

  return (
    <div className="packages-page">
      <AppTabs
        className="packages-tabs"
        activeKey={activeTab}
        onChange={(key) => {
          setActiveTab(key as PackageTab);
          setSelectedRowKeys([]);
        }}
        items={[
          {
            key: "list",
            label: "Quản lý gói cước",
          },
          {
            key: "history",
            label: "Lịch sử gia hạn gói cước",
          },
        ]}
        ariaLabel="Quản lý gói cước"
      />

      <div className="packages-card">
        {activeTab === "list" ? (
          <>
            <h2 className="packages-title">Danh sách gói cước</h2>

            <div className="packages-filters">
              <div className="packages-filter-left">
                <div className="packages-filter-field">
                  <label>Trạng thái</label>

                  <AppSelect
                    width="100%"
                    value={statusFilter}
                    onChange={(value) => {
                      setStatusFilter((value as string) ?? "ALL");
                      resetPagination();
                    }}
                    options={[
                      {
                        label: "Tất cả",
                        value: "ALL",
                      },
                      {
                        label: "Đang kinh doanh",
                        value: "active",
                      },
                      {
                        label: "Chưa kinh doanh",
                        value: "inactive",
                      },
                      {
                        label: "Ngừng kinh doanh",
                        value: "stopped",
                      },
                      {
                        label: "Đã kết thúc",
                        value: "expired",
                      },
                    ]}
                  />
                </div>

                <div className="packages-filter-field">
                  <label>Thời hạn</label>

                  <AppSelect
                    width="100%"
                    value={durationFilter}
                    onChange={(value) => {
                      setDurationFilter((value as string) ?? "ALL");
                      resetPagination();
                    }}
                    options={durationOptions}
                  />
                </div>
              </div>

              <div className="packages-filter-search">
                <label>Từ khóa</label>

                <AppSearch
                  width="100%"
                  placeholder="Nhập từ khóa"
                  value={keyword}
                  onChange={(value) => {
                    setKeyword(value);
                    resetPagination();
                  }}
                />
              </div>
            </div>

            <div className="packages-table-area">
              <AppTable<PackageTableRow>
                className="packages-table"
                rowKey="key"
                columns={columns}
                dataSource={tableData}
                selectable
                showSelectedCount={false}
                rowSelection={{
                  selectedRowKeys,
                  checkStrictly: true,
                  preserveSelectedRowKeys: false,
                  columnWidth: 46,
                  getCheckboxProps: (row) => ({
                    disabled: !row.isGroup,
                    className: !row.isGroup ? "packages-hidden-checkbox" : "",
                  }),
                  renderCell: (_checked, row, _index, originNode) =>
                    row.isGroup ? originNode : null,
                  onChange: (keys) => {
                    const groupIds = new Set(groups.map((group) => group.id));

                    setSelectedRowKeys(
                      keys.filter((key) => groupIds.has(String(key))),
                    );
                  },
                }}
                expandable={{
                  expandedRowKeys,
                  onExpandedRowsChange: (keys) => {
                    setExpandedRowKeys([...keys]);
                  },
                  childrenColumnName: "children",
                  indentSize: 0,
                  expandRowByClick: false,
                  showExpandColumn: false,
                  expandIcon: () => null,
                }}
                rowClassName={(row) =>
                  row.isGroup
                    ? "packages-table__group-row"
                    : "packages-table__child-row"
                }
                scroll={{ x: "max-content" }}
                serverSidePagination
                pagination={{
                  current: currentPage,
                  pageSize,
                  total: filteredPackages.length,
                  onChange: (page, size) => {
                    setCurrentPage(page);
                    setPageSize(size);
                    setSelectedRowKeys([]);
                  },
                }}
              />

              {selectedRowKeys.length > 0 && (
                <div className="packages-selected-count" aria-live="polite">
                  {String(selectedRowKeys.length).padStart(2, "0")} nhóm đã được
                  chọn
                </div>
              )}
            </div>
          </>
        ) : (
          <PackageHistory />
        )}
      </div>

      <AppConfirmModal
        open={deleteOpen}
        type="delete"
        title="Xác nhận xóa gói cước"
        description={`Bạn có chắc chắn muốn xóa ${selectedPackageIds.length} gói cước thuộc các nhóm đã chọn?`}
        confirmText="Tiếp tục"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}

export default PackagesPage;
