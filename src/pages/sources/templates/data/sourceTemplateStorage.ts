import type { TemplateFormData } from "../../../../types/template.types";
import type { StoredSourceTemplate } from "../types/sourceTemplate.types";
import { createSourceTemplatesMock } from "./sourceTemplates.mock";

const STORAGE_KEY = "mtc-source-templates";
const DELETED_STORAGE_KEY = "mtc-source-templates-deleted";
const CHANGE_EVENT = "mtc-source-templates-changed";

export function getStoredSourceTemplates(): StoredSourceTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    return raw ? (JSON.parse(raw) as StoredSourceTemplate[]) : [];
  } catch {
    return [];
  }
}

export function getDeletedSourceTemplateIds(): string[] {
  try {
    const raw = localStorage.getItem(DELETED_STORAGE_KEY);

    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeSourceTemplates(templates: StoredSourceTemplate[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function getStoredSourceTemplate(
  templateId: string,
): StoredSourceTemplate | undefined {
  if (getDeletedSourceTemplateIds().includes(templateId)) {
    return undefined;
  }

  return getStoredSourceTemplates().find((item) => item.id === templateId);
}

export function findSourceTemplate(
  templateId: string,
): StoredSourceTemplate | undefined {
  if (getDeletedSourceTemplateIds().includes(templateId)) {
    return undefined;
  }

  const storedTemplate = getStoredSourceTemplate(templateId);

  if (storedTemplate) {
    return storedTemplate;
  }

  const mockTemplate = createSourceTemplatesMock().find(
    (item) => item.id === templateId,
  );

  if (!mockTemplate) {
    return undefined;
  }

  const isPortrait = mockTemplate.aspectRatio === "9:16";

  return {
    id: mockTemplate.id,
    name: mockTemplate.name,
    screenWidth: isPortrait ? 1080 : 1920,
    screenHeight: isPortrait ? 1920 : 1080,
    duration: "00:00:00",
    layers: [],
    createdAt: mockTemplate.createdAt,
    updatedAt: mockTemplate.createdAt,
    createdBy: mockTemplate.createdBy,
    usageStatus: mockTemplate.usageStatus,
  };
}

export function saveStoredSourceTemplate(
  data: TemplateFormData,
  templateId?: string,
): StoredSourceTemplate {
  const templates = getStoredSourceTemplates();

  const existing = templateId ? findSourceTemplate(templateId) : undefined;

  if (templateId && !existing) {
    throw new Error("Không tìm thấy bản mẫu");
  }

  if (existing?.usageStatus === "in_use") {
    throw new Error("Không thể chỉnh sửa bản mẫu đang sử dụng");
  }

  const now = new Date().toISOString();

  const saved: StoredSourceTemplate = {
    ...data,
    id: existing?.id ?? crypto.randomUUID(),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    createdBy: existing?.createdBy ?? "Tuyết Nguyễn",
    usageStatus: existing?.usageStatus ?? "unused",
  };

  const deletedIds = getDeletedSourceTemplateIds().filter(
    (id) => id !== saved.id,
  );

  localStorage.setItem(DELETED_STORAGE_KEY, JSON.stringify(deletedIds));

  writeSourceTemplates([
    ...templates.filter((item) => item.id !== saved.id),
    saved,
  ]);

  return saved;
}

export function deleteStoredSourceTemplates(ids: string[]) {
  const selectedIds = new Set(ids);

  const inUseTemplate = ids
    .map((id) => findSourceTemplate(id))
    .find((item) => item?.usageStatus === "in_use");

  if (inUseTemplate) {
    throw new Error(
      `Không thể xóa bản mẫu "${inUseTemplate.name}" vì đang sử dụng`,
    );
  }

  const remainingTemplates = getStoredSourceTemplates().filter(
    (item) => !selectedIds.has(item.id),
  );

  const deletedIds = [...new Set([...getDeletedSourceTemplateIds(), ...ids])];

  localStorage.setItem(DELETED_STORAGE_KEY, JSON.stringify(deletedIds));

  writeSourceTemplates(remainingTemplates);
}

export function getAllSourceTemplates(): StoredSourceTemplate[] {
  const deletedIds = new Set(getDeletedSourceTemplateIds());

  const storedTemplates = getStoredSourceTemplates();

  const storedIds = new Set(storedTemplates.map((item) => item.id));

  const mockTemplates = createSourceTemplatesMock()
    .filter((item) => !deletedIds.has(item.id) && !storedIds.has(item.id))
    .map((item) => findSourceTemplate(item.id))
    .filter((item): item is StoredSourceTemplate => item !== undefined);

  return [...storedTemplates, ...mockTemplates].filter(
    (item) => !deletedIds.has(item.id),
  );
}
