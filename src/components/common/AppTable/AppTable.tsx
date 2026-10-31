import { useState } from "react";
import type { Key } from "react";
import { Table } from "antd";
import type { TableProps, TablePaginationConfig } from "antd";

import "./AppTable.css";

export interface AppTableProps<T extends object> extends Omit<
  TableProps<T>,
  "pagination" | "rowSelection" | "summary"
> {
  selectable?: boolean;
  pagination?: false | TablePaginationConfig;
  rowSelection?: TableProps<T>["rowSelection"];
  showSelectedCount?: boolean;
  selectedLabel?: string;
}

function AppTable<T extends object>({
  selectable = false,
  pagination,
  rowSelection,
  showSelectedCount = true,
  selectedLabel = "mục",
  ...tableProps
}: AppTableProps<T>) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);

  const pageSize = pagination === false ? 10 : (pagination?.pageSize ?? 10);

  const paginationConfig: false | TablePaginationConfig =
    pagination === false
      ? false
      : {
          ...pagination,
          pageSize,
          showSizeChanger: false,
          showQuickJumper: false,
          showTotal: () => (
            <span className="app-table__pagination-summary">
              <span>Hiển thị</span>
              <span className="app-table__page-size">{pageSize}</span>
              <span>nội dung trong mỗi trang</span>
            </span>
          ),
          position: ["bottomRight"],
        };

  const columnsCount = (tableProps.columns?.length ?? 0) + (selectable ? 1 : 0);

  const handleSelectionChange: NonNullable<
    TableProps<T>["rowSelection"]
  >["onChange"] = (keys, rows, info) => {
    setSelectedRowKeys(keys);
    rowSelection?.onChange?.(keys, rows, info);
  };

  return (
    <div className="app-table">
      <Table<T>
        {...tableProps}
        rowSelection={
          selectable
            ? {
                ...rowSelection,
                type: "checkbox",
                columnWidth: 80,
                align: "center",
                selectedRowKeys,
                onChange: handleSelectionChange,
              }
            : undefined
        }
        pagination={paginationConfig}
        summary={() =>
          selectable && showSelectedCount && selectedRowKeys.length > 0 ? (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={Math.max(columnsCount, 1)}>
                <div className="app-table__selected-count">
                  {String(selectedRowKeys.length).padStart(2, "0")}{" "}
                  {selectedLabel} đã được chọn
                </div>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          ) : null
        }
      />
    </div>
  );
}

export default AppTable;
