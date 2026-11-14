import { useCallback, useEffect, useMemo, useState } from "react";
import type { Key } from "react";
import { Form, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { Check, Info, Play, Trash2 } from "lucide-react";

import AppConfirmModal from "../../../components/common/AppConfirmModal";
import AppDateRangePicker from "../../../components/common/AppDateRangePicker";
import type { DateRangeValue } from "../../../components/common/AppDateRangePicker";
import AppFilter, {
  AppFilterField,
} from "../../../components/common/AppFilter";
import AppSearch from "../../../components/common/AppSearch";
import AppSelect from "../../../components/common/AppSelect";
import AppTable from "../../../components/common/AppTable";
import AppTableActions from "../../../components/common/AppTableActions";
import { useActionPanel } from "../../../contexts/ActionPanelContext";

import SourceNavigationTabs from "../components/SourceNavigationTabs";
import SharedMediaDetailModal from "./components/SharedMediaDetailModal";
import SharedMediaPreviewModal from "./components/SharedMediaPreviewModal";
import { SHARED_CATEGORY_OPTIONS } from "./data/sourceShared.mock";
import { useSourceSharedStore } from "./data/sourceShared.store";
import type { SharedMediaItem } from "./types/sourceShared.types";

import "./SourceSharedPage.css";

function SourceSharedPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const { setActions } = useActionPanel();
  const { sharedItems, deleteSharedByIds, acceptSharedByIds } =
    useSourceSharedStore();

  // Bộ lọc
  const [category, setCategory] = useState("all");
  const [dateRange, setDateRange] = useState<DateRangeValue>([null, null]);
  const [keyword, setKeyword] = useState("");

  // Lựa chọn dòng trong bảng
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);

  // Trạng thái các Popup (Modal)
  const [acceptModalOpen, setAcceptModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<SharedMediaItem | null>(null);
  const [previewItem, setPreviewItem] = useState<SharedMediaItem | null>(null);

  // Lọc danh sách media được chia sẻ
  const filteredItems = useMemo(() => {
    const search = keyword.trim().toLowerCase();
    const [startDate, endDate] = dateRange;

    return sharedItems.filter((item) => {
      const matchCategory = category === "all" || item.category === category;

      const sharedDate = dayjs(item.sharedAt);
      const matchDate =
        (!startDate || !sharedDate.isBefore(startDate, "day")) &&
        (!endDate || !sharedDate.isAfter(endDate, "day"));

      const matchKeyword =
        !search ||
        item.title.toLowerCase().includes(search) ||
        item.createdBy.toLowerCase().includes(search) ||
        item.sharedFacility.toLowerCase().includes(search);

      return matchCategory && matchDate && matchKeyword;
    });
  }, [sharedItems, category, dateRange, keyword]);

  const handleOpenAcceptModal = useCallback(() => {
    if (selectedRowKeys.length === 0) {
      messageApi.warning("Vui lòng chọn nguồn tin cần tiếp nhận");
      return;
    }
    setAcceptModalOpen(true);
  }, [selectedRowKeys.length, messageApi]);

  const handleOpenDeleteModal = useCallback(() => {
    if (selectedRowKeys.length === 0) {
      messageApi.warning("Vui lòng chọn media được chia sẻ cần xóa");
      return;
    }
    setDeleteModalOpen(true);
  }, [selectedRowKeys.length, messageApi]);

  // Cấu hình thanh công cụ nổi bên phải (AppActionPanel)
  useEffect(() => {
    setActions([
      {
        key: "accept-shared-media",
        icon: <Check color="#18B000" strokeWidth={2.5} />,
        tooltip: "Tiếp nhận nguồn tin",
        onClick: handleOpenAcceptModal,
      },
      {
        key: "delete-shared-media",
        icon: <Trash2 />,
        tooltip: "Xóa media được chia sẻ",
        danger: true,
        onClick: handleOpenDeleteModal,
      },
    ]);

    return () => {
      setActions([]);
    };
  }, [setActions, handleOpenAcceptModal, handleOpenDeleteModal]);

  const handleConfirmAccept = () => {
    const ids = selectedRowKeys.map(String);
    if (ids.length === 0) {
      setAcceptModalOpen(false);
      return;
    }

    acceptSharedByIds(ids);
    setSelectedRowKeys([]);
    setAcceptModalOpen(false);
    messageApi.success(
      `Đã tiếp nhận ${ids.length} nguồn tin vào danh sách Media của bạn`,
    );
  };

  const handleConfirmDelete = () => {
    const ids = selectedRowKeys.map(String);
    if (ids.length === 0) {
      setDeleteModalOpen(false);
      return;
    }

    deleteSharedByIds(ids);
    setSelectedRowKeys([]);
    setDeleteModalOpen(false);
    messageApi.success(`Đã xóa ${ids.length} media được chia sẻ thành công`);
  };

  const columns: ColumnsType<SharedMediaItem> = useMemo(
    () => [
      {
        title: "Tên file media",
        dataIndex: "title",
        key: "title",
        ellipsis: true,
      },
      {
        title: "Lĩnh vực",
        dataIndex: "category",
        key: "category",
        width: 140,
      },
      {
        title: "Ngày tạo",
        dataIndex: "createdAtDisplay",
        key: "createdAtDisplay",
        width: 155,
      },
      {
        title: "Người tạo",
        dataIndex: "createdBy",
        key: "createdBy",
        width: 155,
      },
      {
        title: "Cơ sở chia sẻ",
        dataIndex: "sharedFacility",
        key: "sharedFacility",
        width: 155,
      },
      {
        title: "Ngày chia sẻ",
        dataIndex: "sharedAtDisplay",
        key: "sharedAtDisplay",
        width: 155,
      },
      {
        title: "Hành động",
        key: "actions",
        width: 115,
        align: "center",
        render: (_: unknown, record: SharedMediaItem) => (
          <AppTableActions
            actions={[
              {
                key: "preview",
                icon: <Play />,
                tooltip: "Nghe thử",
                onClick: () => setPreviewItem(record),
              },
              {
                key: "detail",
                icon: <Info />,
                tooltip: "Chi tiết media được chia sẻ",
                onClick: () => setDetailItem(record),
              },
            ]}
          />
        ),
      },
    ],
    [],
  );

  return (
    <div className="source-shared-page">
      {contextHolder}

      <SourceNavigationTabs />

      <section className="source-shared-panel">
        <h2 className="source-shared-panel__title">
          Danh sách media được chia sẻ
        </h2>

        <AppFilter
          showActions={false}
          gap={20}
          className="source-shared-panel__filters">
          <AppFilterField width={180}>
            <Form.Item label="Lĩnh vực">
              <AppSelect
                width="100%"
                value={category}
                options={SHARED_CATEGORY_OPTIONS}
                onChange={(value) => setCategory(String(value))}
              />
            </Form.Item>
          </AppFilterField>

          <AppFilterField width={330}>
            <Form.Item label="Thời gian chia sẻ">
              <AppDateRangePicker
                width="100%"
                value={dateRange}
                startPlaceholder="Từ ngày"
                endPlaceholder="Đến ngày"
                onChange={(dates) => setDateRange(dates)}
              />
            </Form.Item>
          </AppFilterField>

          <AppFilterField
            width={310}
            className="source-shared-panel__search-field">
            <Form.Item label="Từ khóa">
              <AppSearch
                width="100%"
                placeholder="Tên kênh nguồn tin"
                value={keyword}
                onChange={(value) => setKeyword(value)}
              />
            </Form.Item>
          </AppFilterField>
        </AppFilter>

        <div className="source-shared-panel__table">
          <AppTable<SharedMediaItem>
            rowKey="id"
            columns={columns}
            dataSource={filteredItems}
            selectable
            showSelectedCount={false}
            rowSelection={{
              selectedRowKeys,
              onChange: (keys) => setSelectedRowKeys([...keys]),
            }}
            pagination={{
              defaultPageSize: 10,
              pageSize: 10,
            }}
          />
        </div>
      </section>

      {/* Popup xác nhận tiếp nhận nguồn tin */}
      <AppConfirmModal
        open={acceptModalOpen}
        type="success"
        title="Xác nhận tiếp nhận nguồn tin"
        description="Các nguồn tin bạn chọn để tiếp nhận sẽ trở thành media của bạn."
        cancelText="Hủy"
        confirmText="Xác nhận"
        onCancel={() => setAcceptModalOpen(false)}
        onConfirm={handleConfirmAccept}
        className="source-shared-confirm-modal"
      />

      {/* Popup xác nhận xóa media được chia sẻ */}
      <AppConfirmModal
        open={deleteModalOpen}
        type="delete"
        title="Xác nhận xóa media được chia sẻ"
        description="Các nguồn tin được chọn sẽ bị xóa khỏi cơ sở của bạn và không thể khôi phục."
        cancelText="Hủy"
        confirmText="Tiếp tục"
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        className="source-shared-confirm-modal"
      />

      {/* Popup chi tiết media được chia sẻ */}
      <SharedMediaDetailModal
        item={detailItem}
        onClose={() => setDetailItem(null)}
      />

      {/* Popup nghe thử / xem trước media */}
      <SharedMediaPreviewModal
        item={previewItem}
        onClose={() => setPreviewItem(null)}
      />
    </div>
  );
}

export default SourceSharedPage;
