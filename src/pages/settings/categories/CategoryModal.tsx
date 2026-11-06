import { useEffect } from "react";
import { Form } from "antd";
import { CircleAlert } from "lucide-react";

import AppModal from "../../../components/common/AppModal";
import AppForm from "../../../components/common/AppForm";
import AppInput from "../../../components/common/AppInput";
import AppButton from "../../../components/common/AppButton";

import type { Category, CategoryFormValues } from "../types/categories.types";

import "./CategoryModal.css";

export type CategoryModalMode = "create" | "edit" | "view";

interface CategoryModalProps {
  open: boolean;
  mode: CategoryModalMode;
  category: Category | null;
  categories: Category[];
  onSave: (values: CategoryFormValues) => void;
  onCancel: () => void;
}

const modalTitles: Record<CategoryModalMode, string> = {
  create: "Thêm mới lĩnh vực",
  edit: "Cập nhật lĩnh vực",
  view: "Thông tin lĩnh vực",
};

function CategoryModal({
  open,
  mode,
  category,
  categories,
  onSave,
  onCancel,
}: CategoryModalProps) {
  const [form] = Form.useForm<CategoryFormValues>();
  const codeValue = Form.useWatch("code", form);

  const isViewMode = mode === "view";

  const normalizedCode = String(codeValue ?? "")
    .trim()
    .toLowerCase();

  const isDuplicateCode =
    !isViewMode &&
    normalizedCode.length > 0 &&
    categories.some(
      (item) =>
        item.code.trim().toLowerCase() === normalizedCode &&
        item.id !== category?.id,
    );

  useEffect(() => {
    if (!open) return;

    form.resetFields();

    if (category) {
      form.setFieldsValue({
        code: category.code,
        name: category.name,
      });
    }
  }, [open, category, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      const code = values.code.trim();
      const name = values.name.trim();

      const duplicate = categories.some(
        (item) =>
          item.code.trim().toLowerCase() === code.toLowerCase() &&
          item.id !== category?.id,
      );

      if (duplicate) {
        form.setFields([
          {
            name: "code",
            errors: ["Mã lĩnh vực đã tồn tại trên hệ thống"],
          },
        ]);
        return;
      }

      onSave({ code, name });
    } catch {
      return;
    }
  };

  return (
    <AppModal
      open={open}
      title={null}
      width={700}
      onCancel={onCancel}
      className="category-modal"
      footer={
        <div className="category-modal__footer">
          {isViewMode ? (
            <AppButton
              variant="outline"
              width={158}
              height={44}
              onClick={onCancel}>
              Đóng
            </AppButton>
          ) : (
            <>
              <AppButton
                variant="outline"
                width={158}
                height={44}
                onClick={onCancel}>
                Hủy
              </AppButton>

              <AppButton
                variant="primary"
                width={158}
                height={44}
                onClick={handleSave}>
                Lưu
              </AppButton>
            </>
          )}
        </div>
      }>
      <h2 className="category-modal__title">{modalTitles[mode]}</h2>

      <AppForm<CategoryFormValues>
        form={form}
        layout="vertical"
        requiredMark={!isViewMode}
        className="category-modal__form">
        <Form.Item
          name="code"
          label="Mã lĩnh vực"
          rules={
            isViewMode
              ? []
              : [
                  {
                    required: true,
                    whitespace: true,
                    message: "Vui lòng nhập mã lĩnh vực",
                  },
                  {
                    max: 50,
                    message: "Mã lĩnh vực tối đa 50 ký tự",
                  },
                  {
                    validator: async (_, value: string | undefined) => {
                      const code = value?.trim().toLowerCase();

                      if (!code) return;

                      const exists = categories.some(
                        (item) =>
                          item.code.trim().toLowerCase() === code &&
                          item.id !== category?.id,
                      );

                      if (exists) {
                        throw new Error("Mã lĩnh vực đã tồn tại trên hệ thống");
                      }
                    },
                  },
                ]
          }
          help={
            isDuplicateCode ? (
              <div className="category-modal__duplicate">
                <CircleAlert size={20} />
                <span>Mã lĩnh vực đã tồn tại trên hệ thống</span>
              </div>
            ) : undefined
          }
          validateStatus={isDuplicateCode ? "warning" : undefined}>
          <AppInput
            width="100%"
            placeholder="Nhập mã lĩnh vực"
            readOnly={isViewMode}
          />
        </Form.Item>

        <Form.Item
          name="name"
          label="Tên lĩnh vực"
          rules={
            isViewMode
              ? []
              : [
                  {
                    required: true,
                    whitespace: true,
                    message: "Vui lòng nhập tên lĩnh vực",
                  },
                  {
                    max: 200,
                    message: "Tên lĩnh vực tối đa 200 ký tự",
                  },
                ]
          }>
          <AppInput
            width="100%"
            placeholder="Nhập nhóm chức năng"
            readOnly={isViewMode}
          />
        </Form.Item>
      </AppForm>

      {!isViewMode && (
        <p className="category-modal__note">
          <span>*</span> là những trường thông tin bắt buộc
        </p>
      )}
    </AppModal>
  );
}

export default CategoryModal;
