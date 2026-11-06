import { useEffect, useMemo, useState } from "react";
import type { Key } from "react";
import type { TableColumnsType } from "antd";
import { Form, Input, message } from "antd";
import { Info, Search, SquarePen } from "lucide-react";
import dayjs from "dayjs";

import AppFilter, {
  AppFilterField,
} from "../../../components/common/AppFilter";
import AppSelect from "../../../components/common/AppSelect";
import AppTable from "../../../components/common/AppTable";
import AppTableActions from "../../../components/common/AppTableActions";
import AppDateRangePicker from "../../../components/common/AppDateRangePicker";
import type { DateRangeValue } from "../../../components/common/AppDateRangePicker";

import { createFacilityPlaylistsMock } from "../data/facilitiesPlaylists.mock";
import type { FacilityPlaylist } from "../types/facilityPlaylist.types";
import type { Facility } from "../types/facility.types";
import { useNavigate } from "react-router-dom";

import "./FacilityPlaylists.css";

interface FacilityPlaylistsProps {
  facility: Facility;
  selectedRowKeys: Key[];
  onSelectionChange: (keys: Key[]) => void;
  openCreate?: boolean;
  onCloseCreate?: () => void;
  deleteRequestId?: number;
  onDeleteComplete?: () => void;
}

const categoryOptions = [
  { label: "Tất cả", value: "all" },
  { label: "Thể dục dưỡng sinh", value: "Thể dục dưỡng sinh" },
  { label: "Tin tức", value: "Tin tức" },
  { label: "Văn nghệ giải trí", value: "Văn nghệ giải trí" },
  { label: "Giáo dục", value: "Giáo dục" },
];

const newsTypeOptions = [
  { label: "Tất cả", value: "all" },
  { label: "Bản tin phát thanh", value: "Bản tin phát thanh" },
  { label: "Bản tin điện tử", value: "Bản tin điện tử" },
  { label: "Bản tin tiếp sóng", value: "Bản tin tiếp sóng" },
];

function FacilityPlaylists({
  facility,
  selectedRowKeys,
  onSelectionChange,
  openCreate = false,
  onCloseCreate = () => {},
  deleteRequestId = 0,
  onDeleteComplete = () => {},
}: FacilityPlaylistsProps) {
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState<FacilityPlaylist[]>(() =>
    createFacilityPlaylistsMock(facility.id),
  );

  const [category, setCategory] = useState("all");
  const [newsType, setNewsType] = useState("all");
  const [keyword, setKeyword] = useState("");
  const [dateRange, setDateRange] = useState<DateRangeValue>([null, null]);

  const [handledDeleteRequest, setHandledDeleteRequest] =
    useState(deleteRequestId);

  useEffect(() => {
    setPlaylists(createFacilityPlaylistsMock(facility.id));

    setCategory("all");
    setNewsType("all");
    setKeyword("");
    setDateRange([null, null]);
  }, [facility.id]);

  const filteredPlaylists = useMemo(() => {
    const search = keyword.trim().toLowerCase();
    const [startDate, endDate] = dateRange;

    return playlists.filter((playlist) => {
      const matchFacility = playlist.facilityId === facility.id;

      const matchCategory =
        category === "all" || playlist.category === category;

      const matchNewsType =
        newsType === "all" || playlist.newsType === newsType;

      const matchKeyword =
        !search || playlist.name.toLowerCase().includes(search);

      const createdDate = dayjs(playlist.createdAt);

      const matchDate =
        (!startDate || !createdDate.isBefore(startDate, "day")) &&
        (!endDate || !createdDate.isAfter(endDate, "day"));

      return (
        matchFacility &&
        matchCategory &&
        matchNewsType &&
        matchKeyword &&
        matchDate
      );
    });
  }, [playlists, facility.id, category, newsType, keyword, dateRange]);

  useEffect(() => {
    if (deleteRequestId === handledDeleteRequest) return;

    setHandledDeleteRequest(deleteRequestId);

    const selectedIds = new Set(selectedRowKeys);

    const count = playlists.filter(
      (playlist) =>
        playlist.facilityId === facility.id && selectedIds.has(playlist.id),
    ).length;

    if (count > 0) {
      setPlaylists((previous) =>
        previous.filter(
          (playlist) =>
            !(
              playlist.facilityId === facility.id &&
              selectedIds.has(playlist.id)
            ),
        ),
      );

      message.success(`Đã xóa ${count} danh sách phát thành công`);
    }

    onSelectionChange([]);
    onDeleteComplete();
  }, [
    deleteRequestId,
    handledDeleteRequest,
    playlists,
    selectedRowKeys,
    facility.id,
    onSelectionChange,
    onDeleteComplete,
  ]);

  useEffect(() => {
    if (!openCreate) return;

    message.info("Chức năng thêm danh sách phát sẽ được triển khai tiếp.");

    onCloseCreate();
  }, [openCreate, onCloseCreate]);

  const columns: TableColumnsType<FacilityPlaylist> = [
    {
      title: "Tên danh sách phát",
      dataIndex: "name",
      key: "name",
      ellipsis: true,
      width: 210,
    },
    {
      title: "Thời lượng phát",
      dataIndex: "duration",
      key: "duration",
      width: 120,
    },
    {
      title: "Lĩnh vực",
      dataIndex: "category",
      key: "category",
      width: 155,
    },
    {
      title: "Người tạo",
      dataIndex: "createdBy",
      key: "createdBy",
      width: 120,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 125,
      render: (value: string) =>
        value ? dayjs(value).format("DD/MM/YY HH:mm") : "-",
    },
    {
      title: "Loại bản tin",
      dataIndex: "newsType",
      key: "newsType",
      width: 145,
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
              onClick: () => {
                message.info(`Chỉnh sửa: ${record.name}`);
              },
            },
            {
              key: "detail",
              icon: <Info />,
              tooltip: "Xem chi tiết danh sách phát",
              onClick: () => {
                navigate(`/facilities/${facility.id}/playlists/${record.id}`);
              },
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="facility-playlists">
      <div className="facility-playlists__panel">
        <h2 className="facility-playlists__title">Danh sách phát</h2>

        <AppFilter
          showActions={false}
          gap={10}
          className="facility-playlists__filters">
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

          <AppFilterField width={223} className="facility-playlists__search">
            <Form.Item label="Từ khóa">
              <Input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Nhập tên danh sách phát"
                suffix={<Search size={20} />}
                allowClear
              />
            </Form.Item>
          </AppFilterField>
        </AppFilter>

        <AppTable<FacilityPlaylist>
          rowKey="id"
          columns={columns}
          dataSource={filteredPlaylists}
          selectable
          selectedLabel="danh sách phát"
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => onSelectionChange([...keys]),
          }}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1050 }}
        />
      </div>
    </div>
  );
}

export default FacilityPlaylists;
