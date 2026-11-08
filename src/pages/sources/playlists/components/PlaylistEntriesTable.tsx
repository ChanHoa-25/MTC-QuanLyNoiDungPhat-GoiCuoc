import { useState } from "react";
import { ChevronUp, ChevronDown, Trash2, Play } from "lucide-react";
import type { ColumnsType } from "antd/es/table";

import AppTable from "../../../../components/common/AppTable";
import AppIconButton from "../../../../components/common/AppIconButton";
import AppTimePicker from "../../../../components/common/AppTimePicker";
import type { PlaylistEntry } from "../types/sourcePlaylist.types";
import dayjs from "dayjs";
import "./PlaylistEntriesTable.css";

interface PlaylistEntriesTableProps {
  entries: PlaylistEntry[];
  onChange?: (entries: PlaylistEntry[]) => void;
  onPreviewEntry: (entry: PlaylistEntry) => void;
  readOnly?: boolean;
  selectedRowKeys?: React.Key[];
  onSelectedRowKeysChange?: (keys: React.Key[]) => void;
}

export default function PlaylistEntriesTable({
  entries,
  onChange,
  onPreviewEntry,
  readOnly = false,
  selectedRowKeys,
  onSelectedRowKeysChange,
}: PlaylistEntriesTableProps) {
  const [internalSelectedKeys, setInternalSelectedKeys] = useState<React.Key[]>([]);
  const effectiveSelectedKeys = selectedRowKeys ?? internalSelectedKeys;

  const handleSelectKeys = (keys: React.Key[]) => {
    if (onSelectedRowKeysChange) {
      onSelectedRowKeysChange(keys);
    } else {
      setInternalSelectedKeys(keys);
    }
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0 || !onChange) return;
    const next = [...entries];
    const temp = next[index];
    next[index] = next[index - 1];
    next[index - 1] = temp;
    onChange(next);
  };

  const handleMoveDown = (index: number) => {
    if (index >= entries.length - 1 || !onChange) return;
    const next = [...entries];
    const temp = next[index];
    next[index] = next[index + 1];
    next[index + 1] = temp;
    onChange(next);
  };

  const handleDeleteEntry = (entryId: string) => {
    if (!onChange) return;
    onChange(entries.filter((e) => e.id !== entryId));
  };

  const handleDurationChange = (entryId: string, timeStr: string) => {
    if (!onChange) return;
    onChange(
      entries.map((e) => (e.id === entryId ? { ...e, duration: timeStr } : e))
    );
  };

  const columns: ColumnsType<PlaylistEntry> = [
    {
      title: "Thứ tự phát",
      key: "order",
      width: 100,
      align: "center",
      render: (_: unknown, __: unknown, index: number) => (
        <span className="playlist-entry-order">{index + 1}</span>
      ),
    },
    {
      title: "Tên nguồn phát",
      dataIndex: "name",
      key: "name",
      ellipsis: true,
      render: (name: string, record: PlaylistEntry) => (
        <div className="playlist-entry-name-cell">
          {record.thumbnail ? (
            <img
              src={record.thumbnail}
              alt={name}
              className="playlist-entry-thumb"
            />
          ) : (
            <div className="playlist-entry-thumb-empty" />
          )}
          <span className="playlist-entry-name-text" title={name}>
            {name}
          </span>
        </div>
      ),
    },
    {
      title: "Thời lượng",
      dataIndex: "duration",
      key: "duration",
      width: 160,
      render: (duration: string, record: PlaylistEntry) => {
        if (readOnly) {
          return <span>{duration}</span>;
        }
        return (
          <AppTimePicker
            value={duration ? dayjs(duration, "HH:mm:ss") : null}
            onChange={(_, timeString) => {
              if (typeof timeString === "string" && timeString) {
                handleDurationChange(record.id, timeString);
              }
            }}
            width={130}
          />
        );
      },
    },
    {
      title: "Nguồn thông tin",
      dataIndex: "sourceType",
      key: "sourceType",
      width: 130,
      render: (type: PlaylistEntry["sourceType"]) =>
        type === "media" ? "Media" : "Bản mẫu",
    },
    {
      title: "Nghe thử",
      key: "preview",
      width: 130,
      align: "center",
      render: (_: unknown, record: PlaylistEntry, index: number) => (
        <div className="playlist-entry-action-cell">
          <AppIconButton
            icon={<Play size={16} fill="currentColor" />}
            tooltip="Nghe thử"
            onClick={() => onPreviewEntry(record)}
          />
          {!readOnly && (
            <>
              <button
                type="button"
                className="reorder-btn"
                disabled={index === 0}
                onClick={() => handleMoveUp(index)}
                title="Di chuyển lên"
              >
                <ChevronUp size={16} />
              </button>
              <button
                type="button"
                className="reorder-btn"
                disabled={index === entries.length - 1}
                onClick={() => handleMoveDown(index)}
                title="Di chuyển xuống"
              >
                <ChevronDown size={16} />
              </button>
              <AppIconButton
                icon={<Trash2 size={16} />}
                tooltip="Xóa khỏi danh sách"
                danger
                onClick={() => handleDeleteEntry(record.id)}
              />
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="playlist-entries-table-wrapper">
      <AppTable<PlaylistEntry>
        columns={columns}
        dataSource={entries}
        rowKey="id"
        selectable={!readOnly}
        showSelectedCount={!readOnly}
        selectedLabel="nguồn thông tin"
        rowSelection={
          !readOnly
            ? {
                selectedRowKeys: effectiveSelectedKeys,
                onChange: handleSelectKeys,
              }
            : undefined
        }
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}

