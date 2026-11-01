import { Form } from "antd";
import type { FormProps } from "antd";
import type { CSSProperties, ReactNode } from "react";
import "./AppForm.css";

export interface AppFormProps<T extends object> extends FormProps<T> {
  columns?: 1 | 2 | 3;
  gap?: number;
  children?: ReactNode;
}

function AppForm<T extends object>({
  columns = 1,
  gap = 16,
  layout = "vertical",
  requiredMark = true,
  colon = false,
  className = "",
  style,
  children,
  ...props
}: AppFormProps<T>) {
  const formStyle = {
    ...style,
    "--app-form-gap": `${gap}px`,
  } as CSSProperties;

  return (
    <Form<T>
      {...props}
      layout={layout}
      requiredMark={requiredMark}
      colon={colon}
      className={["app-form", `app-form--cols-${columns}`, className]
        .filter(Boolean)
        .join(" ")}
      style={formStyle}>
      {children}
    </Form>
  );
}

export default AppForm;
