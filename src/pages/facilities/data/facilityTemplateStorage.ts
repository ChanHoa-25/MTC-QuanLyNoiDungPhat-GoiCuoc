import type { TemplateFormData } from "../types/facilityTemplate.types";
import { createFacilityTemplatesMock } from "./facilitiesTemplates.mock";

export interface StoredFacilityTemplate extends TemplateFormData {
  id: string;
  facilityId: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "mtc-facility-templates";
const DELETED_STORAGE_KEY = "mtc-facility-templates-deleted";

export function getStoredTemplates(): StoredFacilityTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredFacilityTemplate[]) : [];
  } catch {
    return [];
  }
}

export function getDeletedTemplateIds(facilityId: string): string[] {
  try {
    const raw = localStorage.getItem(DELETED_STORAGE_KEY);

    const deleted = raw ? (JSON.parse(raw) as Record<string, string[]>) : {};

    return deleted[facilityId] ?? [];
  } catch {
    return [];
  }
}

function writeTemplates(templates: StoredFacilityTemplate[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  window.dispatchEvent(new Event("mtc-templates-changed"));
}

export function getStoredTemplate(facilityId: string, templateId: string) {
  if (getDeletedTemplateIds(facilityId).includes(templateId)) {
    return undefined;
  }

  return getStoredTemplates().find(
    (item) => item.facilityId === facilityId && item.id === templateId,
  );
}

export function saveStoredTemplate(
  facilityId: string,
  data: TemplateFormData,
  templateId?: string,
) {
  const templates = getStoredTemplates();

  const existing = templateId
    ? templates.find(
        (item) => item.id === templateId && item.facilityId === facilityId,
      )
    : undefined;

  const now = new Date().toISOString();

  const saved: StoredFacilityTemplate = {
    ...data,
    id: existing?.id ?? templateId ?? crypto.randomUUID(),
    facilityId,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  const deletedIds = getDeletedTemplateIds(facilityId).filter(
    (id) => id !== saved.id,
  );

  const rawDeleted = localStorage.getItem(DELETED_STORAGE_KEY);

  let deleted: Record<string, string[]> = {};

  try {
    deleted = rawDeleted
      ? (JSON.parse(rawDeleted) as Record<string, string[]>)
      : {};
  } catch {
    deleted = {};
  }

  deleted[facilityId] = deletedIds;

  localStorage.setItem(DELETED_STORAGE_KEY, JSON.stringify(deleted));

  writeTemplates([
    ...templates.filter(
      (item) => !(item.facilityId === facilityId && item.id === saved.id),
    ),
    saved,
  ]);

  return saved;
}

export function deleteStoredTemplates(facilityId: string, ids: string[]) {
  const selectedIds = new Set(ids);

  const remainingTemplates = getStoredTemplates().filter(
    (item) => !(item.facilityId === facilityId && selectedIds.has(item.id)),
  );

  const raw = localStorage.getItem(DELETED_STORAGE_KEY);

  let deleted: Record<string, string[]> = {};

  try {
    deleted = raw ? (JSON.parse(raw) as Record<string, string[]>) : {};
  } catch {
    deleted = {};
  }

  deleted[facilityId] = [...new Set([...(deleted[facilityId] ?? []), ...ids])];

  localStorage.setItem(DELETED_STORAGE_KEY, JSON.stringify(deleted));

  writeTemplates(remainingTemplates);
}

export function findFacilityTemplate(
  facilityId: string,
  templateId: string,
): StoredFacilityTemplate | undefined {
  if (getDeletedTemplateIds(facilityId).includes(templateId)) {
    return undefined;
  }

  const storedTemplate = getStoredTemplate(facilityId, templateId);

  if (storedTemplate) {
    return storedTemplate;
  }

  const mockTemplate = createFacilityTemplatesMock(facilityId).find(
    (template) => template.id === templateId,
  );

  if (!mockTemplate) {
    return undefined;
  }

  let screenWidth = 1920;
  let screenHeight = 1080;

  if (mockTemplate.aspectRatio === "9:16") {
    screenWidth = 1080;
    screenHeight = 1920;
  }

  return {
    id: mockTemplate.id,
    facilityId: mockTemplate.facilityId,
    name: mockTemplate.name,
    screenWidth,
    screenHeight,
    duration: "00:00:00",
    layers: [],
    createdAt: mockTemplate.createdAt,
    updatedAt: mockTemplate.createdAt,
  };
}
