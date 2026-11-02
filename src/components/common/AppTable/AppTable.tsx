import { useState } from "react";
import type { Key } from "react";
import { Table } from "antd";
import type { TableProps, TablePaginationConfig } from "antd";

import AppPagination from "../AppPagination";

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
  serverSidePagination?: boolean;
}

function AppTable<T extends object>({
  selectable = false,
  pagination,
  rowSelection,
  showSelectedCount = true,
  selectedLabel = "mục",
  serverSidePagination = false,
  className = "",
  dataSource = [],
  ...tableProps
}: AppTableProps<T>) {
  const [internalSelectedRowKeys, setInternalSelectedRowKeys] = useState<Key[]>(
    [],
  );

  const [internalPage, setInternalPage] = useState(
    pagination === false ? 1 : (pagination?.defaultCurrent ?? 1),
  );

  const selectionEnabled = selectable || !!rowSelection;

  const selectedRowKeys =
    rowSelection?.selectedRowKeys ?? internalSelectedRowKeys;

  const pageSize =
    pagination === false
      ? 10
      : (pagination?.pageSize ?? pagination?.defaultPageSize ?? 10);

  const currentPage =
    pagination === false ? 1 : (pagination?.current ?? internalPage);

  const total =
    pagination === false
      ? dataSource.length
      : (pagination?.total ?? dataSource.length);

  const paginatedData =
    pagination === false || serverSidePagination
      ? dataSource
      : dataSource.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const columnsCount =
    (tableProps.columns?.length ?? 0) + (selectionEnabled ? 1 : 0);

  const handleSelectionChange: NonNullable<
    NonNullable<TableProps<T>["rowSelection"]>["onChange"]
  > = (keys, rows, info) => {
    if (rowSelection?.selectedRowKeys === undefined) {
      setInternalSelectedRowKeys([...keys]);
    }

    rowSelection?.onChange?.(keys, rows, info);
  };

  const handlePageChange = (page: number, size: number) => {
    if (pagination === false) return;

    setInternalPage(page);
    pagination?.onChange?.(page, size);
  };

  return (
    <div className={`app-table ${className}`.trim()}>
      <Table<T>
        {...tableProps}
        dataSource={paginatedData}
        pagination={false}
        rowSelection={
          selectionEnabled
            ? {
                type: "checkbox",
                columnWidth: 80,
                align: "center",
                ...rowSelection,
                selectedRowKeys,
                onChange: handleSelectionChange,
              }
            : undefined
        }
        summary={() =>
          selectionEnabled &&
          showSelectedCount &&
          selectedRowKeys.length > 0 ? (
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

      {pagination !== false && (
        <AppPagination
          current={currentPage}
          pageSize={pageSize}
          total={total}
          onChange={handlePageChange}
        />
      )}
    </div>
  );
}

export default AppTable;
