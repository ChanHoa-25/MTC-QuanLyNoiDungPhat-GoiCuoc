import { Form, Input, message } from "antd";
import type { FormRule } from "antd";
import {
  LockOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  UserOutlined,
  MailOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import type { ReactNode } from "react";

import AppInput from "../../components/common/AppInput/AppInput";
import AppButton from "../../components/common/AppButton/AppButton";

import "./AuthForm.css";

export interface AuthField {
  name: string;
  label?: string;
  placeholder: string;
  type: "text" | "email" | "password";
  requiredMessage: string;
  icon?: ReactNode;
  rules?: {
    min?: number;
    message: string;
  }[];
  confirmWith?: string;
}

interface AuthFormProps {
  title: string;
  description?: string;
  fields: AuthField[];
  buttonText: string;
  footer?: ReactNode;
  error?: string;
  onSubmit: (values: Record<string, string>) => Promise<void> | void;
}

function AuthForm({
  title,
  description,
  fields,
  buttonText,
  footer,
  error,
  onSubmit,
}: AuthFormProps) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: Record<string, string>) => {
    setLoading(true);

    try {
      await onSubmit(values);
    } catch {
      message.error("Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const getFieldRules = (field: AuthField): FormRule[] => {
    const rules: FormRule[] = [
      {
        required: true,
        whitespace: field.type !== "password",
        message: field.requiredMessage,
      },
    ];

    if (field.type === "email") {
      rules.push({
        type: "email",
        message: "Email không hợp lệ!",
      });
    }

    if (field.rules) {
      field.rules.forEach((rule) => {
        rules.push({
          min: rule.min,
          message: rule.message,
        });
      });
    }

    if (field.confirmWith) {
      const confirmFieldName = field.confirmWith;

      rules.push(({ getFieldValue }) => ({
        validator(_, value) {
          if (!value || getFieldValue(confirmFieldName) === value) {
            return Promise.resolve();
          }

          return Promise.reject(new Error("Mật khẩu xác nhận không khớp!"));
        },
      }));
    }

    return rules;
  };

  return (
    <div className="auth-form">
      {/* Tiêu đề */}
      <div className="auth-heading">
        <h1>{title}</h1>

        {description && <p>{description}</p>}
      </div>

      <Form layout="vertical" requiredMark={false} onFinish={handleSubmit}>
        {/* Nhóm input */}
        <div className={`auth-fields ${error ? "auth-fields--error" : ""}`}>
          {fields.map((field) => (
            <Form.Item
              key={field.name}
              name={field.name}
              label={field.label}
              dependencies={field.confirmWith ? [field.confirmWith] : undefined}
              rules={getFieldRules(field)}>
              {field.type === "password" ? (
                <Input.Password
                  prefix={field.icon ?? <LockOutlined />}
                  placeholder={field.placeholder}
                  autoComplete={
                    field.name === "password"
                      ? "current-password"
                      : "new-password"
                  }
                  iconRender={(visible) =>
                    visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                  }
                />
              ) : (
                <AppInput
                  width="100%"
                  prefix={
                    field.icon ??
                    (field.type === "email" ? (
                      <MailOutlined />
                    ) : (
                      <UserOutlined />
                    ))
                  }
                  placeholder={field.placeholder}
                  autoComplete={field.type === "email" ? "email" : "username"}
                />
              )}
            </Form.Item>
          ))}
        </div>

        {/* Lỗi trả về từ API */}
        {error && (
          <div className="auth-error" role="alert">
            <ExclamationCircleOutlined />
            <span>{error}</span>
          </div>
        )}

        {/* Footer riêng của từng trang */}
        {footer && <div className="auth-footer">{footer}</div>}

        {/* Nút submit */}
        <Form.Item className="auth-submit">
          <AppButton
            variant="primary"
            width="100%"
            htmlType="submit"
            loading={loading}>
            {buttonText}
          </AppButton>
        </Form.Item>
      </Form>
    </div>
  );
}

export default AuthForm;
