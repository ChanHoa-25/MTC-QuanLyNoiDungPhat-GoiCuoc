import { useEffect, useMemo, useState } from "react";
import type { Key } from "react";
import type { TableColumnsType } from "antd";
import { Form, Input, message } from "antd";
import { Info, Search, SquarePen } from "lucide-react";
import dayjs from "dayjs";

import AppFilter, {
  AppFilterField,
} from "../../../../components/common/AppFilter";
import AppSelect from "../../../../components/common/AppSelect";
import AppTable from "../../../../components/common/AppTable";
import AppTableActions from "../../../../components/common/AppTableActions";
import AppDateRangePicker from "../../../../components/common/AppDateRangePicker";
import type { DateRangeValue } from "../../../../components/common/AppDateRangePicker";

import { createFacilityTemplatesMock } from "../../data/facilitesTemplates.mock";
import type { FacilityTemplate } from "../../types/facilityTemplate.types";
import type { Facility } from "../../types/facility.types";

import "./FacilityTemplates.css";

interface FacilityTemplatesProps {
  facility: Facility;
  selectedRowKeys: Key[];
  onSelectionChange: (keys: Key[]) => void;
  openCreate?: boolean;
  onCloseCreate?: () => void;
  deleteRequestId?: number;
  onDeleteComplete?: () => void;
}

const aspectRatioOptions = [
  { label: "Tất cả", value: "all" },
  { label: "16:9", value: "16:9" },
  { label: "9:16", value: "9:16" },
  { label: "1920 x 1080", value: "1920 x 1080" },
];

function FacilityTemplates({
  facility,
  selectedRowKeys,
  onSelectionChange,
  openCreate = false,
  onCloseCreate = () => {},
  deleteRequestId = 0,
  onDeleteComplete = () => {},
}: FacilityTemplatesProps) {
  const [templates, setTemplates] = useState<FacilityTemplate[]>(() =>
    createFacilityTemplatesMock(facility.id),
  );

  const [aspectRatio, setAspectRatio] = useState("all");
  const [keyword, setKeyword] = useState("");
  const [dateRange, setDateRange] = useState<DateRangeValue>([null, null]);

  const [handledDeleteRequest, setHandledDeleteRequest] =
    useState(deleteRequestId);

  useEffect(() => {
    setTemplates(createFacilityTemplatesMock(facility.id));
    setAspectRatio("all");
    setKeyword("");
    setDateRange([null, null]);
  }, [facility.id]);

  const filteredTemplates = useMemo(() => {
    const search = keyword.trim().toLowerCase();
    const [startDate, endDate] = dateRange;

    return templates.filter((template) => {
      const matchFacility = template.facilityId === facility.id;

      const matchAspectRatio =
        aspectRatio === "all" || template.aspectRatio === aspectRatio;

      const matchKeyword =
        !search || template.name.toLowerCase().includes(search);

      const createdDate = dayjs(template.createdAt);

      const matchDate =
        (!startDate || !createdDate.isBefore(startDate, "day")) &&
        (!endDate || !createdDate.isAfter(endDate, "day"));

      return matchFacility && matchAspectRatio && matchKeyword && matchDate;
    });
  }, [templates, facility.id, aspectRatio, keyword, dateRange]);

  useEffect(() => {
    if (deleteRequestId === handledDeleteRequest) return;

    setHandledDeleteRequest(deleteRequestId);

    const selectedIds = new Set(selectedRowKeys);

    const count = templates.filter(
      (template) =>
        template.facilityId === facility.id && selectedIds.has(template.id),
    ).length;

    if (count > 0) {
      setTemplates((previous) =>
        previous.filter(
          (template) =>
            !(
              template.facilityId === facility.id &&
              selectedIds.has(template.id)
            ),
        ),
      );

      message.success(`Đã xóa ${count} bản mẫu thành công`);
    }

    onSelectionChange([]);
    onDeleteComplete();
  }, [
    deleteRequestId,
    handledDeleteRequest,
    templates,
    selectedRowKeys,
    facility.id,
    onSelectionChange,
    onDeleteComplete,
  ]);

  useEffect(() => {
    if (!openCreate) return;

    message.info("Chức năng thêm bản mẫu sẽ được triển khai tiếp.");
    onCloseCreate();
  }, [openCreate, onCloseCreate]);

  const columns: TableColumnsType<FacilityTemplate> = [
    {
      title: "Tên bản mẫu",
      dataIndex: "name",
      key: "name",
      ellipsis: true,
    },
    {
      title: "Tỉ lệ màn hình",
      dataIndex: "aspectRatio",
      key: "aspectRatio",
      width: 160,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 190,
      render: (value: string) => dayjs(value).format("DD/MM/YYYY HH:mm:ss"),
    },
    {
      title: "Người tạo",
      dataIndex: "createdBy",
      key: "createdBy",
      width: 150,
    },
    {
      title: "Hành động",
      key: "actions",
      width: 120,
      align: "center",
      render: (_, record) => (
        <AppTableActions
          actions={[
            {
              key: "edit",
              icon: <SquarePen />,
              tooltip: "Chỉnh sửa bản mẫu",
              onClick: () => {
                message.info(`Chỉnh sửa: ${record.name}`);
              },
            },
            {
              key: "detail",
              icon: <Info />,
              tooltip: "Xem chi tiết bản mẫu",
              onClick: () => {
                message.info(`Chi tiết: ${record.name}`);
              },
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="facility-templates">
      <div className="facility-templates__panel">
        <h2 className="facility-templates__title">Danh sách bản mẫu</h2>

        <AppFilter
          showActions={false}
          gap={28}
          className="facility-templates__filters">
          <AppFilterField width={180}>
            <Form.Item label="Tỉ lệ màn hình">
              <AppSelect
                width="100%"
                value={aspectRatio}
                onChange={setAspectRatio}
                options={aspectRatioOptions}
              />
            </Form.Item>
          </AppFilterField>

          <AppFilterField width={388}>
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

          <AppFilterField width={345} className="facility-templates__search">
            <Form.Item label="Từ khóa">
              <Input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Nhập tên bản mẫu"
                suffix={<Search size={20} />}
                allowClear
              />
            </Form.Item>
          </AppFilterField>
        </AppFilter>

        <AppTable<FacilityTemplate>
          rowKey="id"
          columns={columns}
          dataSource={filteredTemplates}
          selectable
          selectedLabel="bản mẫu"
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => onSelectionChange([...keys]),
          }}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 950 }}
        />
      </div>
    </div>
  );
}

export default FacilityTemplates;
