import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Edit3, Info } from "lucide-react";
import { Form, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";

import AppTable from "../../../components/common/AppTable";
import AppStatusTag from "../../../components/common/AppStatusTag";
import AppSearch from "../../../components/common/AppSearch";
import AppSelect from "../../../components/common/AppSelect";
import AppDateRangePicker from "../../../components/common/AppDateRangePicker";
import type { DateRangeValue } from "../../../components/common/AppDateRangePicker";
import AppFilter, { AppFilterField } from "../../../components/common/AppFilter";
import AppIconButton from "../../../components/common/AppIconButton";
import { useActionPanel } from "../../../contexts/ActionPanelContext";
import SourceNavigationTabs from "../components/SourceNavigationTabs";

import type { SourceTemplateItem } from "./types/sourceTemplate.types";
import { useSourceTemplatesStore } from "./data/sourceTemplates.store";
import DeleteTemplateModal from "./components/DeleteTemplateModal";
import "./SourceTemplatesPage.css";

const ASPECT_RATIO_OPTIONS = [
  { label: "Tất cả", value: "all" },
  { label: "16:9", value: "16:9" },
  { label: "1920 x 1080", value: "1920 x 1080" },
  { label: "4:3", value: "4:3" },
];

export default function SourceTemplatesPage() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const { setActions } = useActionPanel();
  const { templates, subscribe, deleteTemplates } = useSourceTemplatesStore();

  useEffect(() => {
    return subscribe();
  }, [subscribe]);

  // Bộ lọc
  const [aspectRatio, setAspectRatio] = useState("all");
  const [dateRange, setDateRange] = useState<DateRangeValue>([null, null]);
  const [keyword, setKeyword] = useState("");

  // Chọn dòng
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Lọc dữ liệu
  const filteredTemplates = useMemo(() => {
    const search = keyword.trim().toLowerCase();
    const [startDate, endDate] = dateRange;

    return templates.filter((item) => {
      const matchRatio = aspectRatio === "all" || item.aspectRatio === aspectRatio;

      let matchDate = true;
      if (startDate || endDate) {
        const [dPart] = item.createdAt.split(" ");
        if (dPart) {
          const [d, m, y] = dPart.split("/");
          const itemDate = dayjs(`${y}-${m}-${d}`);
          if (startDate && itemDate.isBefore(startDate, "day")) matchDate = false;
          if (endDate && itemDate.isAfter(endDate, "day")) matchDate = false;
        }
      }

      const matchKeyword =
        !search ||
        item.name.toLowerCase().includes(search) ||
        item.createdBy.toLowerCase().includes(search);

      return matchRatio && matchDate && matchKeyword;
    });
  }, [templates, aspectRatio, dateRange, keyword]);

  const handleOpenDelete = useCallback(() => {
    if (selectedRowKeys.length === 0) return;

    // Kiểm tra theo SRS: Không được xóa bản mẫu đang có bản tin sử dụng
    const inUseItems = templates.filter(
      (t) => selectedRowKeys.includes(t.id) && t.usageStatus === "in_use"
    );

    if (inUseItems.length > 0) {
      messageApi.error(
        `Không thể xóa bản mẫu "${inUseItems[0].name}" vì đang được bản tin sử dụng!`
      );
      return;
    }

    setDeleteModalOpen(true);
  }, [selectedRowKeys, templates, messageApi]);

  const handleConfirmDelete = () => {
    deleteTemplates(selectedRowKeys.map(String));
    setSelectedRowKeys([]);
    setDeleteModalOpen(false);
    messageApi.success("Đã xóa bản mẫu thành công!");
  };

  // Cấu hình ActionPanel bên phải
  useEffect(() => {
    setActions([
      {
        key: "add-template",
        icon: <Plus />,
        tooltip: "Thêm bản mẫu",
        onClick: () => navigate("/sources/templates/create"),
      },
      {
        key: "delete-template",
        icon: <Trash2 />,
        tooltip: "Xóa bản mẫu",
        danger: true,
        disabled: selectedRowKeys.length === 0,
        onClick: handleOpenDelete,
      },
    ]);

    return () => setActions([]);
  }, [setActions, selectedRowKeys.length, handleOpenDelete, navigate]);

  // Cấu hình cột bảng Table
  const columns: ColumnsType<SourceTemplateItem> = [
    {
      title: "Tên bản mẫu",
      dataIndex: "name",
      key: "name",
      render: (name: string, record: SourceTemplateItem) => (
        <span
          className="template-name-cell"
          onClick={() => navigate(`/sources/templates/${record.id}`)}
        >
          {name}
        </span>
      ),
    },
    {
      title: "Tỉ lệ màn hình",
      dataIndex: "aspectRatio",
      key: "aspectRatio",
      width: 150,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 200,
    },
    {
      title: "Người tạo",
      dataIndex: "createdBy",
      key: "createdBy",
      width: 160,
    },
    {
      title: "Trạng thái sử dụng",
      dataIndex: "usageStatus",
      key: "usageStatus",
      width: 170,
      render: (status: SourceTemplateItem["usageStatus"]) =>
        status === "in_use" ? (
          <AppStatusTag variant="green" label="Đang sử dụng" />
        ) : (
          <AppStatusTag variant="blue" label="Chưa sử dụng" />
        ),
    },
    {
      title: "Hành động",
      key: "actions",
      width: 120,
      render: (_: unknown, record: SourceTemplateItem) => (
        <div className="template-row-actions">
          {/* SRS: Chỉ cho phép sửa khi chưa được sử dụng */}
          {record.usageStatus === "unused" && (
            <AppIconButton
              icon={<Edit3 size={16} />}
              tooltip="Chỉnh sửa"
              onClick={() => navigate(`/sources/templates/${record.id}/edit`)}
            />
          )}
          <AppIconButton
            icon={<Info size={16} />}
            tooltip="Xem chi tiết"
            onClick={() => navigate(`/sources/templates/${record.id}`)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="source-templates-page">
      {contextHolder}
      <SourceNavigationTabs />

      <div className="source-templates-page__body">
        <h1 className="source-templates-page__title">Danh sách bản mẫu</h1>

        {/* Thanh Bộ lọc */}
        <AppFilter showActions={false} gap={14}>
          <AppFilterField width={175}>
            <Form.Item label="Tỉ lệ màn hình">
              <AppSelect
                options={ASPECT_RATIO_OPTIONS}
                value={aspectRatio}
                onChange={(val: unknown) => setAspectRatio(String(val))}
                width="100%"
              />
            </Form.Item>
          </AppFilterField>

          <AppFilterField width={300}>
            <Form.Item label="Ngày tạo">
              <AppDateRangePicker
                value={dateRange}
                onChange={(dates: DateRangeValue) => setDateRange(dates)}
                width="100%"
              />
            </Form.Item>
          </AppFilterField>

          <AppFilterField width={260}>
            <Form.Item label="Từ khóa">
              <AppSearch
                placeholder="Nhập tên bản mẫu"
                value={keyword}
                onChange={(val: string) => setKeyword(val)}
                onSearch={(val: string) => setKeyword(val)}
                width="100%"
              />
            </Form.Item>
          </AppFilterField>
        </AppFilter>

        {/* Bảng danh sách */}
        <div className="source-templates-page__table-wrapper">
          <AppTable<SourceTemplateItem>
            columns={columns}
            dataSource={filteredTemplates}
            rowKey="id"
            rowSelection={{
              selectedRowKeys,
              onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
            }}
            pagination={{
              pageSize: 10,
              showTotal: (total: number, range: [number, number]) => (
                <span>
                  Hiển thị {range[1] - range[0] + 1} nội dung trong mỗi trang (Tổng số: {total})
                </span>
              ),
            }}
          />
        </div>
      </div>

      <DeleteTemplateModal
        open={deleteModalOpen}
        count={selectedRowKeys.length}
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
