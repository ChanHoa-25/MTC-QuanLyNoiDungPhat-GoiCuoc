/**
 * ==============================================================================
 * [DATA ACCESS / STORE LAYER - QUẢN LÝ DỮ LIỆU BẢN MẪU]
 * 
 * Kiến trúc:
 * - Tách biệt hoàn toàn tầng Giao diện (UI Components) khỏi tầng Truy cập dữ liệu (Data Access),
 *   đúng theo mục 5 và mục 9 của AGENTS_MTC_TV4.md.
 * - Hiện tại: Đang lưu trữ và cập nhật qua state in-memory từ Mock Data.
 * - Khi kết nối Backend (.NET):
 *   + getTemplateById(id) -> gọi GET /api/Templates/{id}
 *   + addTemplate(data)   -> gọi POST /api/Templates (với body DTO)
 *   + updateTemplate(id)  -> gọi PUT /api/Templates/{id}
 *   + deleteTemplates(ids)-> gọi DELETE /api/Templates (hoặc bulk delete)
 * Các Component UI (SourceTemplatesPage, Form, Detail) sẽ KHÔNG cần thay đổi logic,
 * chỉ cần gọi cùng các hàm này.
 * ==============================================================================
 */

import { useState, useCallback } from "react";
import type { SourceTemplateItem } from "../types/sourceTemplate.types";
import { INITIAL_SOURCE_TEMPLATES } from "./sourceTemplates.mock";

let memoryTemplates: SourceTemplateItem[] = [...INITIAL_SOURCE_TEMPLATES];
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function useSourceTemplatesStore() {
  const [templates, setTemplates] = useState<SourceTemplateItem[]>(memoryTemplates);

  const subscribe = useCallback(() => {
    const listener = () => setTemplates([...memoryTemplates]);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const getTemplateById = useCallback((id: string) => {
    return memoryTemplates.find((t) => t.id === id) ?? null;
  }, []);

  const addTemplate = useCallback(
    (item: Omit<SourceTemplateItem, "id" | "createdAt" | "createdBy" | "usageStatus">) => {
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, "0");
      const dateStr = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(
        now.getHours()
      )}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

      const newTemplate: SourceTemplateItem = {
        ...item,
        id: `tpl-${Date.now()}`,
        createdAt: dateStr,
        createdBy: "Tuyết Nguyễn",
        usageStatus: "unused",
      };

      memoryTemplates = [newTemplate, ...memoryTemplates];
      notify();
      return newTemplate;
    },
    []
  );

  const updateTemplate = useCallback(
    (id: string, updates: Partial<SourceTemplateItem>) => {
      memoryTemplates = memoryTemplates.map((item) => {
        if (item.id === id) {
          return { ...item, ...updates };
        }
        return item;
      });
      notify();
    },
    []
  );

  const deleteTemplates = useCallback((ids: string[]) => {
    // Chỉ cho phép xóa các bản mẫu chưa sử dụng
    memoryTemplates = memoryTemplates.filter((item) => {
      if (ids.includes(item.id)) {
        return item.usageStatus === "in_use"; // Giữ lại nếu đang dùng
      }
      return true;
    });
    notify();
  }, []);

  return {
    templates,
    subscribe,
    getTemplateById,
    addTemplate,
    updateTemplate,
    deleteTemplates,
  };
}
