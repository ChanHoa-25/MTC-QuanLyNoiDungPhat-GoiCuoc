import { useMemo, useState } from "react";
import type { Key } from "react";
import type { TableColumnsType } from "antd";
import { Form, Input } from "antd";
import { Info, Search, SquarePen } from "lucide-react";
import dayjs from "dayjs";

import AppFilter, { AppFilterField } from "../../common/AppFilter";
import AppSelect from "../../common/AppSelect";
import AppTable from "../../common/AppTable";
import AppTableActions from "../../common/AppTableActions";
import AppDateRangePicker from "../../common/AppDateRangePicker";
import type { DateRangeValue } from "../../common/AppDateRangePicker";
import AppStatusTag from "../../common/AppStatusTag";

import "./TemplateList.css";

export interface TemplateListItem {
  id: string;
  name: string;
  aspectRatio: string;
  createdAt: string;
  createdBy: string;
  usageStatus?: string;
}

interface TemplateListProps<T extends TemplateListItem> {
  templates: T[];
  selectedRowKeys: Key[];
  onSelectionChange: (keys: Key[]) => void;
  onEdit: (id: string) => void;
  onDetail: (id: string) => void;
  showUsageStatus?: boolean;
  pageSize?: number;
  canEdit?: (template: T) => boolean;
}

const aspectRatioOptions = [
  { label: "Tất cả", value: "all" },
  { label: "16:9", value: "16:9" },
  { label: "9:16", value: "9:16" },
  { label: "1920 x 1080", value: "1920 x 1080" },
];

function TemplateList<T extends TemplateListItem>({
  templates,
  selectedRowKeys,
  onSelectionChange,
  onEdit,
  onDetail,
  showUsageStatus = false,
  pageSize = 10,
  canEdit,
}: TemplateListProps<T>) {
  const [aspectRatio, setAspectRatio] = useState("all");
  const [keyword, setKeyword] = useState("");
  const [dateRange, setDateRange] = useState<DateRangeValue>([null, null]);

  const filteredTemplates = useMemo(() => {
    const search = keyword.trim().toLowerCase();
    const [startDate, endDate] = dateRange ?? [null, null];

    return templates.filter((template) => {
      const matchAspectRatio =
        aspectRatio === "all" || template.aspectRatio === aspectRatio;

      const matchKeyword =
        !search || template.name.toLowerCase().includes(search);

      const createdDate = dayjs(template.createdAt);

      const matchDate =
        (!startDate && !endDate) ||
        (createdDate.isValid() &&
          (!startDate || !createdDate.isBefore(startDate, "day")) &&
          (!endDate || !createdDate.isAfter(endDate, "day")));

      return matchAspectRatio && matchKeyword && matchDate;
    });
  }, [templates, aspectRatio, keyword, dateRange]);

  const columns: TableColumnsType<T> = [
    {
      title: "Tên bản mẫu",
      dataIndex: "name",
      key: "name",
      width: 240,
      ellipsis: true,
    },
    {
      title: "Tỉ lệ màn hình",
      dataIndex: "aspectRatio",
      key: "aspectRatio",
      width: 160,
      render: (value?: string) => value || "-",
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 190,
      render: (value?: string) =>
        value && dayjs(value).isValid()
          ? dayjs(value).format("DD/MM/YYYY HH:mm:ss")
          : "-",
    },
    {
      title: "Người tạo",
      dataIndex: "createdBy",
      key: "createdBy",
      width: 150,
      ellipsis: true,
    },
  ];

  if (showUsageStatus) {
    columns.push({
      title: "Trạng thái sử dụng",
      dataIndex: "usageStatus",
      key: "usageStatus",
      width: 170,
      render: (value?: string) => {
        if (!value) return "-";

        if (value === "in_use" || value === "Đang sử dụng") {
          return <AppStatusTag variant="green" label="Đang sử dụng" />;
        }

        if (value === "unused" || value === "Chưa sử dụng") {
          return <AppStatusTag variant="blue" label="Chưa sử dụng" />;
        }

        return value;
      },
    });
  }
  columns.push({
    title: "Hành động",
    key: "actions",
    width: 120,
    align: "center",
    render: (_, record) => {
      const showEdit = canEdit ? canEdit(record) : true;

      return (
        <AppTableActions
          actions={[
            ...(showEdit
              ? [
                  {
                    key: "edit",
                    icon: <SquarePen />,
                    tooltip: "Chỉnh sửa bản mẫu",
                    onClick: () => onEdit(record.id),
                  },
                ]
              : []),
            {
              key: "detail",
              icon: <Info />,
              tooltip: "Xem chi tiết bản mẫu",
              onClick: () => onDetail(record.id),
            },
          ]}
        />
      );
    },
  });

  return (
    <div className="template-list">
      <div className="template-list__panel">
        <h2 className="template-list__title">Danh sách bản mẫu</h2>

        <AppFilter
          showActions={false}
          gap={28}
          className="template-list__filters">
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

          <AppFilterField width={345} className="template-list__search">
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

        <AppTable<T>
          className="template-list__table"
          rowKey="id"
          columns={columns}
          dataSource={filteredTemplates}
          selectable
          selectedLabel="bản mẫu"
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => onSelectionChange([...keys]),
          }}
          pagination={{ pageSize }}
          scroll={{ x: showUsageStatus ? 1120 : 950 }}
        />
      </div>
    </div>
  );
}

export default TemplateList;
