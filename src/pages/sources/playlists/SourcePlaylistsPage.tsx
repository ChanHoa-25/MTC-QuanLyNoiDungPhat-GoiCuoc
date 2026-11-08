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

import type { SourcePlaylistItem } from "./types/sourcePlaylist.types";
import { useSourcePlaylistsStore, getPlaylistDuration } from "./data/sourcePlaylists.store";
import { PLAYLIST_CATEGORY_OPTIONS } from "./data/sourcePlaylists.mock";
import DeletePlaylistModal from "./components/DeletePlaylistModal";
import "./SourcePlaylistsPage.css";

const NEWS_TYPE_FILTER_OPTIONS = [
  { label: "Tất cả", value: "all" },
  { label: "Bản tin phát thanh", value: "radio" },
  { label: "Bản tin điện tử", value: "electronic" },
];

export default function SourcePlaylistsPage() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const { setActions } = useActionPanel();
  const { playlists, deletePlaylists } = useSourcePlaylistsStore();

  // Bộ lọc
  const [category, setCategory] = useState("all");
  const [newsType, setNewsType] = useState("all");
  const [dateRange, setDateRange] = useState<DateRangeValue>([null, null]);
  const [keyword, setKeyword] = useState("");

  // Chọn dòng
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Lọc dữ liệu
  const filteredPlaylists = useMemo(() => {
    const search = keyword.trim().toLowerCase();
    const [startDate, endDate] = dateRange;

    return playlists.filter((item) => {
      const matchCategory = category === "all" || item.category === category;
      const matchNewsType = newsType === "all" || item.newsType === newsType;

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

      return matchCategory && matchNewsType && matchDate && matchKeyword;
    });
  }, [playlists, category, newsType, dateRange, keyword]);

  const handleOpenDelete = useCallback(() => {
    if (selectedRowKeys.length === 0) return;

    // Kiểm tra SRS 4.3.2: Không được xóa danh sách phát đang có bản tin sử dụng
    const inUseItems = playlists.filter(
      (p) => selectedRowKeys.includes(p.id) && p.usageStatus === "in_use"
    );

    if (inUseItems.length > 0) {
      messageApi.error(
        `Không thể xóa danh sách phát "${inUseItems[0].name}" vì đang được bản tin sử dụng!`
      );
      return;
    }

    setDeleteModalOpen(true);
  }, [selectedRowKeys, playlists, messageApi]);

  const handleConfirmDelete = () => {
    const { deletedIds, blockedIds } = deletePlaylists(selectedRowKeys.map(String));
    setSelectedRowKeys([]);
    setDeleteModalOpen(false);

    if (blockedIds.length > 0) {
      messageApi.warning(
        `Đã xóa ${deletedIds.length} danh sách phát. ${blockedIds.length} danh sách phát không thể xóa do đang được sử dụng.`
      );
    } else {
      messageApi.success("Đã xóa danh sách phát thành công!");
    }
  };

  // Cấu hình ActionPanel bên phải
  useEffect(() => {
    setActions([
      {
        key: "add-playlist",
        icon: <Plus />,
        tooltip: "Thêm danh sách phát",
        onClick: () => navigate("/sources/playlists/create"),
      },
      {
        key: "delete-playlist",
        icon: <Trash2 />,
        tooltip: "Xóa danh sách phát",
        danger: true,
        disabled: selectedRowKeys.length === 0,
        onClick: handleOpenDelete,
      },
    ]);

    return () => setActions([]);
  }, [setActions, selectedRowKeys.length, handleOpenDelete, navigate]);

  // Cấu hình cột bảng Table
  const columns: ColumnsType<SourcePlaylistItem> = [
    {
      title: "Tên danh sách phát",
      dataIndex: "name",
      key: "name",
      render: (name: string, record: SourcePlaylistItem) => (
        <span
          className="playlist-name-cell"
          onClick={() => navigate(`/sources/playlists/${record.id}`)}
        >
          {name}
        </span>
      ),
    },
    {
      title: "Thời lượng phát",
      key: "duration",
      width: 140,
      render: (_: unknown, record: SourcePlaylistItem) => getPlaylistDuration(record.entries),
    },
    {
      title: "Lĩnh vực",
      dataIndex: "category",
      key: "category",
      width: 160,
    },
    {
      title: "Người tạo",
      dataIndex: "createdBy",
      key: "createdBy",
      width: 140,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
    },
    {
      title: "Trạng thái sử dụng",
      dataIndex: "usageStatus",
      key: "usageStatus",
      width: 170,
      render: (status: SourcePlaylistItem["usageStatus"]) =>
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
      render: (_: unknown, record: SourcePlaylistItem) => (
        <div className="playlist-row-actions">
          {/* SRS: Chỉ cho phép sửa khi chưa được sử dụng */}
          {record.usageStatus === "unused" && (
            <AppIconButton
              icon={<Edit3 size={16} />}
              tooltip="Chỉnh sửa"
              onClick={() => navigate(`/sources/playlists/${record.id}/edit`)}
            />
          )}
          <AppIconButton
            icon={<Info size={16} />}
            tooltip="Xem chi tiết"
            onClick={() => navigate(`/sources/playlists/${record.id}`)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="source-playlists-page">
      {contextHolder}
      <SourceNavigationTabs />

      <div className="source-playlists-page__body">
        <h1 className="source-playlists-page__title">Danh sách danh sách phát</h1>

        {/* Thanh Bộ lọc */}
        <AppFilter showActions={false} gap={14}>
          <AppFilterField width={175}>
            <Form.Item label="Lĩnh vực">
              <AppSelect
                options={[{ label: "Tất cả", value: "all" }, ...PLAYLIST_CATEGORY_OPTIONS]}
                value={category}
                onChange={(val: unknown) => setCategory(String(val))}
                width="100%"
              />
            </Form.Item>
          </AppFilterField>

          <AppFilterField width={180}>
            <Form.Item label="Loại bản tin">
              <AppSelect
                options={NEWS_TYPE_FILTER_OPTIONS}
                value={newsType}
                onChange={(val: unknown) => setNewsType(String(val))}
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
                placeholder="Nhập tên danh sách phát"
                value={keyword}
                onChange={(val: string) => setKeyword(val)}
                onSearch={(val: string) => setKeyword(val)}
                width="100%"
              />
            </Form.Item>
          </AppFilterField>
        </AppFilter>

        {/* Bảng danh sách */}
        <div className="source-playlists-page__table-wrapper">
          <AppTable<SourcePlaylistItem>
            columns={columns}
            dataSource={filteredPlaylists}
            rowKey="id"
            selectable
            showSelectedCount
            selectedLabel="danh sách phát"
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

      <DeletePlaylistModal
        open={deleteModalOpen}
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

