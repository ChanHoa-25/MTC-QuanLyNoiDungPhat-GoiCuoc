import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Key } from "react";
import type { TableColumnsType } from "antd";
import { Form, Input, Radio, message } from "antd";
import { ChevronDown, ChevronUp, Minus, Play, Plus } from "lucide-react";

import AppButton from "../../common/AppButton";
import AppSelect from "../../common/AppSelect";
import AppTable from "../../common/AppTable";
import { useActionPanel } from "../../../contexts/ActionPanelContext";

import "./PlaylistForm.css";

export type PlaylistFormMode = "create" | "edit";
export type PlaylistPlayMode = "random" | "sequential";
export type PlaylistSourceType = "media" | "template";

export interface PlaylistFormSource {
  id: string;
  sourceId: string;
  sourceType: PlaylistSourceType;
  name: string;
  duration: string;
  thumbnail?: string;
  mediaType?: string;
}

export interface PlaylistFormData {
  name: string;
  category: string;
  playMode: PlaylistPlayMode;
  duration: string;
  description: string;
  sources: PlaylistFormSource[];
}

export interface PlaylistFormProps {
  mode: PlaylistFormMode;
  initialData?: PlaylistFormData;
  categoryOptions: {
    label: string;
    value: string;
  }[];
  onSave: (data: PlaylistFormData) => void | Promise<void>;
  onCancel: () => void;
  onOpenSourcePicker: (
    selectedSources: PlaylistFormSource[],
    onConfirm: (sources: PlaylistFormSource[]) => void,
  ) => void;
}

const DEFAULT_DATA: PlaylistFormData = {
  name: "",
  category: "",
  playMode: "random",
  duration: "00:00:00",
  description: "",
  sources: [],
};

function durationToSeconds(value: string): number {
  const parts = value.split(":").map(Number);

  if (
    parts.length !== 3 ||
    parts.some((part) => !Number.isInteger(part) || part < 0) ||
    parts[1] >= 60 ||
    parts[2] >= 60
  ) {
    return 0;
  }

  return parts[0] * 3600 + parts[1] * 60 + parts[2];
}

function secondsToDuration(value: number): string {
  const hours = Math.floor(value / 3600);
  const minutes = Math.floor((value % 3600) / 60);
  const seconds = value % 60;

  return [hours, minutes, seconds]
    .map((part) => String(part).padStart(2, "0"))
    .join(":");
}

function PlaylistForm({
  mode,
  initialData,
  categoryOptions,
  onSave,
  onCancel,
  onOpenSourcePicker,
}: PlaylistFormProps) {
  const { setActions } = useActionPanel();
  const [form] = Form.useForm();

  const [sources, setSources] = useState<PlaylistFormSource[]>(
    initialData?.sources ?? [],
  );

  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [saving, setSaving] = useState(false);

  const addSourcesRef = useRef<() => void>(() => {});
  const removeSourcesRef = useRef<() => void>(() => {});

  const calculatedDuration = useMemo(() => {
    const totalSeconds = sources.reduce(
      (total, source) => total + durationToSeconds(source.duration),
      0,
    );

    return secondsToDuration(totalSeconds);
  }, [sources]);

  const totalDuration = useMemo(() => {
    const hasRealDuration = sources.some(
      (source) => durationToSeconds(source.duration) > 0,
    );

    if (!hasRealDuration && mode === "edit") {
      return initialData?.duration ?? "00:00:00";
    }

    return calculatedDuration;
  }, [sources, mode, initialData?.duration, calculatedDuration]);

  useEffect(() => {
    const data = initialData ?? DEFAULT_DATA;

    form.setFieldsValue({
      name: data.name,
      category: data.category,
      playMode: data.playMode,
      description: data.description,
    });

    setSources(data.sources);
    setSelectedRowKeys([]);
  }, [initialData, form]);

  const handleAddSources = useCallback(() => {
    onOpenSourcePicker(sources, (newSources) => {
      setSources(newSources);
      setSelectedRowKeys([]);
    });
  }, [onOpenSourcePicker, sources]);

  const handleRemoveSources = useCallback(() => {
    if (selectedRowKeys.length === 0) {
      message.warning("Vui lòng chọn nguồn phát cần xóa");
      return;
    }

    const selectedIds = new Set(selectedRowKeys);

    setSources((previous) =>
      previous.filter((source) => !selectedIds.has(source.id)),
    );

    setSelectedRowKeys([]);
  }, [selectedRowKeys]);

  addSourcesRef.current = handleAddSources;
  removeSourcesRef.current = handleRemoveSources;

  useEffect(() => {
    setActions([
      {
        key: "add",
        icon: <Plus size={24} />,
        tooltip: "Thêm nguồn phát",
        onClick: () => addSourcesRef.current(),
      },
      {
        key: "remove",
        icon: <Minus size={24} />,
        tooltip: "Xóa nguồn phát",
        onClick: () => removeSourcesRef.current(),
      },
    ]);

    return () => {
      setActions([]);
    };
  }, [setActions]);

  const handleMoveSource = (index: number, direction: -1 | 1) => {
    setSources((previous) => {
      const nextIndex = index + direction;

      if (nextIndex < 0 || nextIndex >= previous.length) {
        return previous;
      }

      const updated = [...previous];

      [updated[index], updated[nextIndex]] = [
        updated[nextIndex],
        updated[index],
      ];

      return updated;
    });
  };

  const handlePreview = (source: PlaylistFormSource) => {
    message.info(`Chưa có dữ liệu phát thử cho nguồn: ${source.name}`);
  };

  const handleSubmit = async () => {
    if (saving) return;

    try {
      const values = await form.validateFields();

      if (sources.length === 0) {
        message.warning("Vui lòng thêm ít nhất một nguồn phát");
        return;
      }

      const data: PlaylistFormData = {
        name: values.name.trim(),
        category: values.category,
        playMode: values.playMode,
        description: values.description ?? "",
        duration: totalDuration,
        sources,
      };

      setSaving(true);
      await onSave(data);
    } catch (error) {
      if (error && typeof error === "object" && "errorFields" in error) {
        return;
      }

      message.error("Không thể lưu danh sách phát");
    } finally {
      setSaving(false);
    }
  };

  const columns: TableColumnsType<PlaylistFormSource> = [
    {
      title: "Thứ tự phát",
      key: "order",
      width: 125,
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Tên nguồn phát",
      dataIndex: "name",
      key: "name",
      ellipsis: true,
    },
    {
      title: "Thời lượng",
      dataIndex: "duration",
      key: "duration",
      width: 150,
    },
    {
      title: "Nguồn thông tin",
      dataIndex: "sourceType",
      key: "sourceType",
      width: 160,
      render: (value: PlaylistSourceType) =>
        value === "media" ? "Media" : "Bản mẫu",
    },
    {
      title: "Nghe thử",
      key: "actions",
      width: 140,
      align: "center",
      render: (_, record, index) => (
        <div className="playlist-form__row-actions">
          <button
            type="button"
            title="Nghe thử"
            onClick={() => handlePreview(record)}>
            <Play size={18} />
          </button>

          <button
            type="button"
            title="Di chuyển lên"
            disabled={index === 0}
            onClick={() => handleMoveSource(index, -1)}>
            <ChevronUp size={18} />
          </button>

          <button
            type="button"
            title="Di chuyển xuống"
            disabled={index === sources.length - 1}
            onClick={() => handleMoveSource(index, 1)}>
            <ChevronDown size={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="playlist-form">
      <div className="playlist-form__content">
        <aside className="playlist-form__sidebar">
          <h2>
            {mode === "create"
              ? "Thêm danh sách phát"
              : "Cập nhật danh sách phát"}
          </h2>

          <Form
            form={form}
            layout="vertical"
            initialValues={initialData ?? DEFAULT_DATA}
            requiredMark>
            <Form.Item
              label="Tên danh sách phát"
              name="name"
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: "Vui lòng nhập tên danh sách phát",
                },
              ]}>
              <Input placeholder="Nhập tên danh sách phát" />
            </Form.Item>

            <Form.Item
              label="Lĩnh vực"
              name="category"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn lĩnh vực",
                },
              ]}>
              <AppSelect
                width="100%"
                options={categoryOptions}
                placeholder="Chọn lĩnh vực"
              />
            </Form.Item>

            <Form.Item name="playMode">
              <Radio.Group>
                <Radio value="random">Phát ngẫu nhiên</Radio>
                <Radio value="sequential">Phát theo thứ tự</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item label="Thời lượng danh sách phát" required>
              <Input value={totalDuration} disabled />
            </Form.Item>

            <Form.Item label="Mô tả" name="description">
              <Input.TextArea rows={4} placeholder="Nhập mô tả" />
            </Form.Item>
          </Form>

          <p className="playlist-form__required-note">
            <span>*</span> là những trường thông tin bắt buộc
          </p>
        </aside>

        <section className="playlist-form__main">
          <h2>Danh sách các nguồn thông tin</h2>

          <AppTable<PlaylistFormSource>
            rowKey="id"
            columns={columns}
            dataSource={sources}
            selectable
            selectedLabel="nguồn thông tin"
            rowSelection={{
              selectedRowKeys,
              onChange: (keys) => setSelectedRowKeys([...keys]),
            }}
            pagination={false}
            scroll={{ x: 850 }}
          />
        </section>
      </div>

      <div className="playlist-form__footer">
        <AppButton variant="outline" onClick={onCancel}>
          Hủy
        </AppButton>

        <AppButton onClick={handleSubmit} loading={saving}>
          Lưu
        </AppButton>
      </div>
    </div>
  );
}

export default PlaylistForm;
