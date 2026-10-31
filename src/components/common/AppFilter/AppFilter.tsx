import type { CSSProperties, ReactNode } from "react";
import { Button, Form } from "antd";
import type { FormInstance } from "antd";
import { FilterOutlined, ReloadOutlined } from "@ant-design/icons";
import "./AppFilter.css";

type FilterValues = Record<string, unknown>;

export interface AppFilterProps {
  children: ReactNode;
  form?: FormInstance;
  onFilter?: (values: FilterValues) => void;
  onReset?: () => void;
  onValuesChange?: (
    changedValues: FilterValues,
    allValues: FilterValues,
  ) => void;
  loading?: boolean;
  showActions?: boolean;
  gap?: number;
  className?: string;
}

export interface AppFilterFieldProps {
  children: ReactNode;
  width?: number | string;
  className?: string;
}

export function AppFilterField({
  children,
  width = 210,
  className = "",
}: AppFilterFieldProps) {
  const style: CSSProperties = {
    width,
  };

  return (
    <div className={`app-filter__field ${className}`.trim()} style={style}>
      {children}
    </div>
  );
}

function AppFilter({
  children,
  form,
  onFilter,
  onReset,
  onValuesChange,
  loading = false,
  showActions = false,
  gap = 16,
  className = "",
}: AppFilterProps) {
  const [internalForm] = Form.useForm();
  const filterForm = form ?? internalForm;

  const handleReset = () => {
    filterForm.resetFields();
    onReset?.();
  };

  return (
    <div className={`app-filter ${className}`.trim()}>
      <Form
        form={filterForm}
        layout="vertical"
        onFinish={(values) => onFilter?.(values)}
        onValuesChange={onValuesChange}>
        <div className="app-filter__fields" style={{ gap }}>
          {children}
        </div>

        {showActions && (
          <div className="app-filter__actions">
            <Button
              icon={<ReloadOutlined />}
              onClick={handleReset}
              disabled={loading}>
              Đặt lại
            </Button>

            <Button
              type="primary"
              htmlType="submit"
              icon={<FilterOutlined />}
              loading={loading}>
              Lọc
            </Button>
          </div>
        )}
      </Form>
    </div>
  );
}

export default AppFilter;
