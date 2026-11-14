import { Pagination } from "antd";
import type { PaginationProps } from "antd";
import { Triangle } from "lucide-react";

import "./AppPagination.css";

export interface AppPaginationProps extends Omit<PaginationProps, "showTotal"> {
  showSummary?: boolean;
  itemLabel?: string;
  displayedCount?: number;
}

function AppPagination({
  current = 1,
  pageSize = 10,
  total = 0,
  showSummary = true,
  itemLabel = "nội dung",
  displayedCount,
  showSizeChanger = false,
  showQuickJumper = false,
  className = "",
  size = "middle",
  ...rest
}: AppPaginationProps) {
  // Số dòng thực tế trên trang hiện tại
  const actualDisplayedCount =
    displayedCount ??
    Math.max(0, Math.min(pageSize, total - (current - 1) * pageSize));

  return (
    <div className={`app-pagination ${className}`.trim()}>
      {showSummary && (
        <div className="app-pagination__summary">
          <span>Hiển thị</span>

          <span className="app-pagination__page-size">
            {actualDisplayedCount}
          </span>

          <span>{itemLabel} trong trang hiện tại</span>
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
