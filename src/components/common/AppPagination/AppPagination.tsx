import { Pagination } from "antd";
import type { PaginationProps } from "antd";

import "./AppPagination.css";
import { Triangle } from "lucide-react";

export interface AppPaginationProps extends Omit<PaginationProps, "showTotal"> {
  showSummary?: boolean;
  itemLabel?: string;
}

function AppPagination({
  current = 1,
  pageSize = 10,
  total = 0,
  showSummary = true,
  itemLabel = "nội dung",
  showSizeChanger = false,
  showQuickJumper = false,
  className = "",
  size = "middle",
  ...rest
}: AppPaginationProps) {
  return (
    <div className={`app-pagination ${className}`.trim()}>
      {showSummary && (
        <div className="app-pagination__summary">
          <span>Hiển thị</span>

          <span className="app-pagination__page-size">{pageSize}</span>

          <span>{itemLabel} trong mỗi trang</span>
        </div>
      )}

      <Pagination
        {...rest}
        current={current}
        pageSize={pageSize}
        total={total}
        size={size}
        showSizeChanger={showSizeChanger}
        showQuickJumper={showQuickJumper}
        itemRender={(_, type, originalElement) => {
          if (type === "prev") {
            return (
              <Triangle
                size={12}
                fill="currentColor"
                strokeWidth={0}
                className="app-pagination__arrow app-pagination__arrow--prev"
              />
            );
          }

          if (type === "next") {
            return (
              <Triangle
                size={12}
                fill="currentColor"
                strokeWidth={0}
                className="app-pagination__arrow app-pagination__arrow--next"
              />
            );
          }

          return originalElement;
        }}
      />
    </div>
  );
}

export default AppPagination;
