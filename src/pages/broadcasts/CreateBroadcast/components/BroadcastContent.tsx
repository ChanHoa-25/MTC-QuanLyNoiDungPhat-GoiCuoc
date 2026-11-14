import { useMemo } from "react";
import type { Key } from "react";
import { message, Tag } from "antd";
import type { TableColumnsType } from "antd";
import { Info, ListFilter, Play } from "lucide-react";

import AppInput from "../../../../components/common/AppInput";
import AppSelect from "../../../../components/common/AppSelect";
import AppTable from "../../../../components/common/AppTable";
import AppTableActions from "../../../../components/common/AppTableActions";
import AppIconButton from "../../../../components/common/AppIconButton";

import {
  broadcastSourceTypes,
  broadcastSources,
  broadcastMediaMock,
} from "../../data/createBroadcast.mock";

import type { BroadcastMedia } from "../../data/createBroadcast.mock";

interface BroadcastContentProps {
  sourceType: string;
  onSourceTypeChange: (value: string) => void;

  sourceId: string;
  onSourceIdChange: (value: string) => void;

  duration: string;
  onDurationChange: (value: string) => void;

  mediaIds: Key[];
  onMediaIdsChange: (values: Key[]) => void;
}

function BroadcastContent({
  sourceType,
  onSourceTypeChange,
  sourceId,
  onSourceIdChange,
  duration,
  onDurationChange,
  mediaIds,
  onMediaIdsChange,
}: BroadcastContentProps) {
  const sourceOptions = useMemo(
    () =>
      broadcastSources
        .filter((item) => item.type === sourceType)
        .map((item) => ({
          value: item.value,
          label: item.label,
        })),
    [sourceType],
  );

  const handleSourceTypeChange = (value: string) => {
    onSourceTypeChange(value);

    const firstSource = broadcastSources.find((item) => item.type === value);

    onSourceIdChange(firstSource?.value ?? "");
  };

  const mediaColumns: TableColumnsType<BroadcastMedia> = [
    {
      title: "STT",
      key: "index",
      width: 50,
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Nguồn tin",
      dataIndex: "name",
      key: "name",
      render: (_, record) => (
        <div className="create-broadcast__media-name">
          <span className="create-broadcast__play-icon">
            <Play size={16} fill="currentColor" />
          </span>

          <div>
            <strong>{record.name}</strong>
            <span>{record.description}</span>
          </div>
        </div>
      ),
    },
    {
      title: "Độ phân giải",
      dataIndex: "resolution",
      key: "resolution",
      width: 155,
      render: (items: string[]) => (
        <div className="create-broadcast__resolutions">
          {items.map((item) => (
            <Tag key={item} className={`resolution-${item.toLowerCase()}`}>
              {item}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: "Thời lượng",
      dataIndex: "duration",
      key: "duration",
      width: 100,
    },
    {
      title: "",
      key: "actions",
      width: 90,
      render: (_, record) => (
        <AppTableActions
          actions={[
            {
              key: "info",
              icon: <Info />,
              tooltip: "Thông tin nguồn tin",
              onClick: () => message.info(record.name),
            },
            {
              key: "preview",
              icon: <Play />,
              tooltip: "Xem trước",
              onClick: () =>
                message.info(`Chưa có tệp xem trước cho ${record.name}`),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <section className="create-broadcast__section">
      <h2>3. Nội dung phát</h2>

      <div className="create-broadcast__media-fields">
        <div className="create-broadcast__field">
          <label>Loại nguồn tin</label>

          <AppSelect
            width="100%"
            value={sourceType}
            options={broadcastSourceTypes}
            onChange={handleSourceTypeChange}
          />
        </div>

        <div className="create-broadcast__field">
          <label>Nguồn phát bản tin</label>

          <AppSelect
            width="100%"
            value={sourceId}
            options={sourceOptions}
            onChange={onSourceIdChange}
          />
        </div>

        <div className="create-broadcast__field">
          <label>
            Thời lượng
            <span className="required">*</span>
          </label>

          <AppInput
            width="100%"
            value={duration}
            placeholder="00:00:00"
            onChange={(event) => onDurationChange(event.target.value)}
          />
        </div>

        <AppIconButton
          icon={<ListFilter size={20} />}
          tooltip="Chọn nguồn phát"
          size={44}
          iconSize={20}
          className="create-broadcast__outline-icon"
          onClick={() =>
            message.info("Chọn nguồn tin bằng checkbox trong bảng")
          }
        />
      </div>

      <p className="create-broadcast__note">
        <Info size={16} />

        <span>
          Lưu ý: Khi phát bản tin, hệ thống sẽ tự động chọn phiên bản media có
          độ phân giải phù hợp nhất với từng thiết bị.
        </span>
      </p>

      <div className="create-broadcast__table-wrap">
        <AppTable<BroadcastMedia>
          rowKey="id"
          className="create-broadcast__media-table"
          columns={mediaColumns}
          dataSource={broadcastMediaMock}
          pagination={false}
          size="small"
          scroll={{ x: 650 }}
          selectable={false}
          showSelectedCount={false}
        />
      </div>
    </section>
  );
}

export default BroadcastContent;
