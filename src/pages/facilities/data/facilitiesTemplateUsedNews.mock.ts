import { createFacilityPlaylistNewsMock } from "./facilitiesPlaylistNews.mock";

import type { FacilityPlaylistNews } from "../types/facilityPlaylistNews.types";

export interface FacilityTemplateUsedNews extends FacilityPlaylistNews {
  templateId: string;
}

const STORAGE_KEY = "mtc-template-used-news-deleted";

function getDeletedNewsIds(templateId: string): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    const data: Record<string, string[]> = raw ? JSON.parse(raw) : {};

    return data[templateId] ?? [];
  } catch {
    return [];
  }
}

export function createFacilityTemplateUsedNewsMock(
  templateId: string,
): FacilityTemplateUsedNews[] {
  // Dữ liệu demo: 10 bản tin sử dụng bản mẫu hiện tại
  const mockNews = createFacilityPlaylistNewsMock(`template-${templateId}`);

  const deletedIds = new Set(getDeletedNewsIds(templateId));

  return mockNews
    .map((news) => ({
      ...news,
      templateId,
    }))
    .filter((news) => !deletedIds.has(news.id));
}

export function deleteFacilityTemplateUsedNews(
  templateId: string,
  newsIds: string[],
): void {
  const raw = localStorage.getItem(STORAGE_KEY);

  let data: Record<string, string[]> = {};

  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    data = {};
  }

  data[templateId] = [...new Set([...(data[templateId] ?? []), ...newsIds])];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
