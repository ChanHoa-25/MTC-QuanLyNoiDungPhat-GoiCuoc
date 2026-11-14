import { useCallback, useEffect, useMemo, useState } from "react";
import type { Key } from "react";
import type { TableColumnsType } from "antd";
import { Form, message } from "antd";
import { Info, Plus, SquarePen, Trash2 } from "lucide-react";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

import AppFilter, {
  AppFilterField,
} from "../../../components/common/AppFilter";
import AppSelect from "../../../components/common/AppSelect";
import AppTable from "../../../components/common/AppTable";
import AppTableActions from "../../../components/common/AppTableActions";
import AppDateRangePicker from "../../../components/common/AppDateRangePicker";
import type { DateRangeValue } from "../../../components/common/AppDateRangePicker";
import AppConfirmModal from "../../../components/common/AppConfirmModal";
import AppStatusTag from "../../../components/common/AppStatusTag";
import AppSearch from "../../../components/common/AppSearch";
import PlaylistForm from "../../../components/playlists/PlaylistForm/PlaylistForm";
import type {
  PlaylistFormData,
  PlaylistFormSource,
} from "../../../components/playlists/PlaylistForm/PlaylistForm";
import PlaylistSourcePickerModal from "../../../components/playlists/PlaylistSourcePickerModal/PlaylistSourcePickerModal";
import SourceNavigationTabs from "../components/SourceNavigationTabs";
import type { PlaylistPickableSource } from "../../../components/playlists/PlaylistSourcePickerModal/PlaylistSourcePickerModal";

import { useActionPanel } from "../../../contexts/ActionPanelContext";
import type { AppActionPanelItem } from "../../../components/common/AppActionPanel";

import { initialSourceMediaMock } from "../media/data/sourceMedia.mock";
import { createSourceTemplatesMock } from "../templates/data/sourceTemplates.mock";

import { PLAYLIST_CATEGORY_OPTIONS } from "./data/sourcePlaylists.mock";
import {
  getPlaylistDuration,
  useSourcePlaylistsStore,
} from "./data/sourcePlaylists.store";
import type {
  PlaylistEntry,
  SourcePlaylistItem,
} from "./types/sourcePlaylist.types";

import "./SourcePlaylistsPage.css";

type FormMode = "create" | "edit";

const categoryOptions = [
  { label: "Tất cả", value: "all" },
  ...PLAYLIST_CATEGORY_OPTIONS,
];

const newsTypeOptions = [
  { label: "Tất cả", value: "all" },
  { label: "Bản tin phát thanh", value: "radio" },
  { label: "Bản tin điện tử", value: "electronic" },
];

const parseCreatedAt = (value: string) => dayjs(value, "DD/MM/YYYY HH:mm:ss");

function SourcePlaylistsPage() {
  const navigate = useNavigate();
  const { setActions } = useActionPanel();

  const { playlists, addPlaylist, updatePlaylist, deletePlaylists } =
    useSourcePlaylistsStore();

  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [category, setCategory] = useState("all");
  const [newsType, setNewsType] = useState("all");
  const [keyword, setKeyword] = useState("");
  const [dateRange, setDateRange] = useState<DateRangeValue>([null, null]);

  const [formMode, setFormMode] = useState<FormMode | null>(null);
  const [editingPlaylist, setEditingPlaylist] =
    useState<SourcePlaylistItem | null>(null);

  const [sourcePickerOpen, setSourcePickerOpen] = useState(false);
  const [pickerSelectedSources, setPickerSelectedSources] = useState<
    PlaylistFormSource[]
  >([]);
  const [pickerConfirm, setPickerConfirm] = useState<
    ((sources: PlaylistFormSource[]) => void) | null
  >(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const availableSources = useMemo<PlaylistPickableSource[]>(() => {
    const mediaSources: PlaylistPickableSource[] = initialSourceMediaMock.map(
      (media) => ({
        sourceId: media.id,
        sourceType: "media",
        name: media.title,
        duration: media.duration || "00:00:30",
        category: media.category,
        mediaType: media.type,
        thumbnail: media.thumbnail,
        createdBy: media.createdBy,
        createdAt: media.createdAt,
      }),
    );

    const templateSources: PlaylistPickableSource[] =
      createSourceTemplatesMock().map((template) => ({
        sourceId: template.id,
        sourceType: "template",
        name: template.name,
        duration: "00:00:30",
        createdBy: template.createdBy,
        createdAt: template.createdAt,
      }));

    return [...mediaSources, ...templateSources];
  }, []);

  const filteredPlaylists = useMemo(() => {
    const search = keyword.trim().toLowerCase();
    const [startDate, endDate] = dateRange;

    return playlists.filter((playlist) => {
      if (category !== "all" && playlist.category !== category) {
        return false;
      }

      if (newsType !== "all" && playlist.newsType !== newsType) {
        return false;
      }

      if (search && !playlist.name.toLowerCase().includes(search)) {
        return false;
      }

      const createdDate = parseCreatedAt(playlist.createdAt);

      if (!createdDate.isValid()) return false;

      if (startDate && createdDate.isBefore(startDate, "day")) {
        return false;
      }

      if (endDate && createdDate.isAfter(endDate, "day")) {
        return false;
      }

      return true;
    });
  }, [playlists, category, newsType, keyword, dateRange]);

  const handleCreate = useCallback(() => {
    setEditingPlaylist(null);
    setFormMode("create");
  }, []);

  const handleEdit = (playlist: SourcePlaylistItem) => {
    if (playlist.usageStatus === "in_use") {
      message.warning("Danh sách phát đang được sử dụng, không thể sửa");
      return;
    }

    setEditingPlaylist(playlist);
    setFormMode("edit");
  };

  const handleCancelForm = () => {
    setFormMode(null);
    setEditingPlaylist(null);
    setSourcePickerOpen(false);
    setPickerConfirm(null);
  };

  const handleDelete = useCallback(() => {
    if (selectedRowKeys.length === 0) {
      message.warning("Vui lòng chọn danh sách phát cần xóa");
      return;
    }

    const selectedIds = new Set(selectedRowKeys.map(String));

    const hasInUse = playlists.some(
      (item) => selectedIds.has(item.id) && item.usageStatus === "in_use",
    );

    if (hasInUse) {
      message.warning("Không thể xóa danh sách phát đang được sử dụng");
      return;
    }

    setDeleteModalOpen(true);
  }, [selectedRowKeys, playlists]);

  const handleConfirmDelete = () => {
    const result = deletePlaylists(selectedRowKeys.map(String));

    setDeleteModalOpen(false);
    setSelectedRowKeys([]);

    if (result.deletedIds.length > 0) {
      message.success(`Đã xóa ${result.deletedIds.length} danh sách phát`);
    }

    if (result.blockedIds.length > 0) {
      message.warning("Một số danh sách phát đang được sử dụng");
    }
  };

  const handleOpenSourcePicker = (
    selectedSources: PlaylistFormSource[],
    onConfirm: (sources: PlaylistFormSource[]) => void,
  ) => {
    setPickerSelectedSources(selectedSources);
    setPickerConfirm(() => onConfirm);
    setSourcePickerOpen(true);
  };

  const handleConfirmSources = (sources: PlaylistFormSource[]) => {
    pickerConfirm?.(sources);
    setSourcePickerOpen(false);
    setPickerConfirm(null);
  };

  const handleSave = (data: PlaylistFormData) => {
    const entries: PlaylistEntry[] = data.sources.map((source) => ({
      id: source.id,
      sourceId: source.sourceId,
      sourceType: source.sourceType,
      name: source.name,
      duration: source.duration,
      mediaType: source.mediaType as PlaylistEntry["mediaType"],
      thumbnail: source.thumbnail,
    }));

    const values = {
      name: data.name,
      category: data.category,
      playMode: data.playMode,
      description: data.description,
      entries,
    };

    if (formMode === "create") {
      addPlaylist(values);
      message.success("Thêm danh sách phát thành công");
    }

    if (formMode === "edit" && editingPlaylist) {
      const success = updatePlaylist(editingPlaylist.id, values);

      if (!success) {
        message.error("Không thể cập nhật danh sách phát");
        return;
      }

      message.success("Cập nhật danh sách phát thành công");
    }

    setSelectedRowKeys([]);
    handleCancelForm();
  };

  const initialFormData = useMemo<PlaylistFormData | undefined>(() => {
    if (!editingPlaylist) return undefined;

    return {
      name: editingPlaylist.name,
      category: editingPlaylist.category,
      playMode: editingPlaylist.playMode,
      description: editingPlaylist.description,
      duration: getPlaylistDuration(editingPlaylist.entries),
      sources: editingPlaylist.entries.map((entry) => ({
        id: entry.id,
        sourceId: entry.sourceId,
        sourceType: entry.sourceType,
        name: entry.name,
        duration: entry.duration,
        mediaType: entry.mediaType,
        thumbnail: entry.thumbnail,
      })),
    };
  }, [editingPlaylist]);

  useEffect(() => {
    if (formMode) {
      setActions([]);
      return;
    }

    const actions: AppActionPanelItem[] = [
      {
        key: "create-playlist",
        icon: <Plus />,
        tooltip: "Thêm danh sách phát",
        onClick: handleCreate,
      },
      {
        key: "delete-playlist",
        icon: <Trash2 />,
        tooltip: "Xóa danh sách phát",
        danger: true,
        disabled: selectedRowKeys.length === 0,
        onClick: handleDelete,
      },
    ];

    setActions(actions);
  }, [
    formMode,
    setActions,
    handleCreate,
    handleDelete,
    selectedRowKeys.length,
  ]);

  useEffect(() => {
    return () => setActions([]);
  }, [setActions]);

  const columns: TableColumnsType<SourcePlaylistItem> = [
    {
      title: "Tên danh sách phát",
      dataIndex: "name",
      key: "name",
      width: 210,
      ellipsis: true,
    },
    {
      title: "Thời lượng phát",
      key: "duration",
      width: 125,
      render: (_, record) => getPlaylistDuration(record.entries),
    },
    {
      title: "Lĩnh vực",
      dataIndex: "category",
      key: "category",
      width: 165,
    },
    {
      title: "Người tạo",
      dataIndex: "createdBy",
      key: "createdBy",
      width: 135,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 175,
    },
    {
      title: "Loại bản tin",
      key: "newsType",
      width: 160,
      render: (_, record) =>
        record.newsType === "radio" ? "Bản tin phát thanh" : "Bản tin điện tử",
    },
    {
      title: "Trạng thái",
      key: "usageStatus",
      width: 145,
      render: (_, record) => (
        <AppStatusTag
          variant={record.usageStatus === "in_use" ? "blue" : "green"}
          label={
            record.usageStatus === "in_use" ? "Đang sử dụng" : "Chưa sử dụng"
          }
        />
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      width: 100,
      align: "center",
      render: (_, record) => (
        <AppTableActions
          actions={[
            {
              key: "edit",
              icon: <SquarePen />,
              tooltip: "Chỉnh sửa danh sách phát",
              disabled: record.usageStatus === "in_use",
              onClick: () => handleEdit(record),
            },
            {
              key: "detail",
              icon: <Info />,
              tooltip: "Xem chi tiết danh sách phát",
              onClick: () => navigate(`/sources/playlists/${record.id}`),
            },
          ]}
        />
      ),
    },
  ];

  if (formMode) {
    return (
      <>
        <PlaylistForm
          key={formMode === "edit" ? `edit-${editingPlaylist?.id}` : "create"}
          mode={formMode}
          initialData={initialFormData}
          categoryOptions={PLAYLIST_CATEGORY_OPTIONS}
          onSave={handleSave}
          onCancel={handleCancelForm}
          onOpenSourcePicker={handleOpenSourcePicker}
        />

        <PlaylistSourcePickerModal
          open={sourcePickerOpen}
          sources={availableSources}
          selectedSources={pickerSelectedSources}
          onConfirm={handleConfirmSources}
          onCancel={() => {
            setSourcePickerOpen(false);
            setPickerConfirm(null);
          }}
        />
      </>
    );
  }

  return (
    <div className="source-playlists">
      <SourceNavigationTabs />
      <div className="source-playlists__panel">
        <h2 className="source-playlists__title">Danh sách phát</h2>

        <AppFilter
          showActions={false}
          gap={10}
          className="source-playlists__filters">
          {/* Lĩnh vực */}
          <AppFilterField width={180}>
            <Form.Item label="Lĩnh vực">
              <AppSelect
                width="100%"
                value={category}
                onChange={setCategory}
                options={categoryOptions}
              />
            </Form.Item>
          </AppFilterField>

          {/* Loại bản tin */}
          <AppFilterField width={180}>
            <Form.Item label="Loại bản tin">
              <AppSelect
                width="100%"
                value={newsType}
                onChange={setNewsType}
                options={newsTypeOptions}
              />
            </Form.Item>
          </AppFilterField>

          {/* Ngày tạo */}
          <AppFilterField width={344}>
            <Form.Item label="Ngày tạo">
              <AppDateRangePicker
                width="100%"
                value={dateRange}
                onChange={setDateRange}
                startPlaceholder="Từ ngày"
                endPlaceholder="Đến ngày"
              />
            </Form.Item>
          </AppFilterField>

          {/* Từ khóa */}
          <AppFilterField
            width={223}
            className="source-playlists__search-field">
            <Form.Item label="Từ khóa">
              <AppSearch
                width="100%"
                placeholder="Nhập tên danh sách phát"
                value={keyword}
                onChange={(value) => setKeyword(value)}
              />
            </Form.Item>
          </AppFilterField>
        </AppFilter>

        <AppTable<SourcePlaylistItem>
          rowKey="id"
          columns={columns}
          dataSource={filteredPlaylists}
          selectable
          selectedLabel="danh sách phát"
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys([...keys]),
          }}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1200 }}
        />
      </div>

      <AppConfirmModal
        open={deleteModalOpen}
        type="delete"
        title="Xóa danh sách phát?"
        description={`Bạn có chắc chắn muốn xóa ${selectedRowKeys.length} danh sách phát đã chọn?`}
        confirmText="Xóa"
        cancelText="Hủy"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}

export default SourcePlaylistsPage;
