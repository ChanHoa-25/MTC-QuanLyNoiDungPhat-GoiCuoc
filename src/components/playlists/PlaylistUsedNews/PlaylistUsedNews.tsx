import type { Key, ReactNode } from "react";
import type { TableColumnsType } from "antd";

import AppTable from "../../common/AppTable";

import "./PlaylistUsedNews.css";

interface PlaylistUsedNewsProps<T extends object> {
  data: T[];
  columns: TableColumnsType<T>;
  selectedRowKeys: Key[];
  onSelectionChange: (keys: Key[]) => void;
  rowKey?: string;
  filters?: ReactNode;
  title?: string;
  tableKey?: string;
}

function PlaylistUsedNews<T extends object>({
  data,
  columns,
  selectedRowKeys,
  onSelectionChange,
  rowKey = "id",
  filters,
  title = "Danh sách bản tin sử dụng danh sách phát",
  tableKey,
}: PlaylistUsedNewsProps<T>) {
  return (
    <div className="playlist-used-news">
      <div className="playlist-used-news__heading">
        <h2>{title}</h2>
      </div>

      {filters && <div className="playlist-used-news__filters">{filters}</div>}

      <AppTable<T>
        key={tableKey}
        className="playlist-used-news__table"
        rowKey={rowKey}
        columns={columns}
        dataSource={data}
        selectable
        selectedLabel="bản tin"
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => onSelectionChange([...keys]),
        }}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1450 }}
      />
    </div>
  );
}

export default PlaylistUsedNews;
