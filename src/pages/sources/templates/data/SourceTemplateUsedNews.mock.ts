import type { TemplateUsedNewsItem } from "../../../../components/templates/TemplateUsedNews/TemplateUsedNews";

export type SourceTemplateUsedNews = TemplateUsedNewsItem;

const STORAGE_KEY = "mtc-source-template-used-news-deleted";

// Dữ liệu bản tin mẫu
const INITIAL_SOURCE_TEMPLATE_USED_NEWS: Omit<
  TemplateUsedNewsItem,
  "templateId"
>[] = [
  {
    id: "news-1",
    code: "BT001",
    title: "Thông báo lịch phát thanh",
    newsType: "Tin thường",
    approvalStatus: "Đã duyệt",
    broadcastStatus: "Đang phát",
    repeatType: "Không lặp",
    startDate: "2026-11-01",
    endDate: "2026-11-01",
    broadcastTime: "07:00",
    facilityName: "Cơ sở 1",
    createdBy: "Tuyết Nguyễn",
  },
  {
    id: "news-2",
    code: "BT002",
    title: "Bản tin tuyên truyền",
    newsType: "Tin ưu tiên",
    approvalStatus: "Chờ duyệt",
    broadcastStatus: "Chờ phát",
    repeatType: "Hàng ngày",
    startDate: "2026-11-10",
    endDate: "2026-11-20",
    broadcastTime: "08:00",
    facilityName: "Cơ sở 2",
    createdBy: "Tuyết Nguyễn",
  },
  {
    id: "news-3",
    code: "BT003",
    title: "Thông tin cộng đồng",
    newsType: "Tin thường",
    approvalStatus: "Đã duyệt",
    broadcastStatus: "Đã kết thúc",
    repeatType: "Không lặp",
    startDate: "2026-10-25",
    endDate: "2026-10-25",
    broadcastTime: "17:00",
    facilityName: "Cơ sở 3",
    createdBy: "Tuyết Nguyễn",
  },
];

// Lấy danh sách ID bản tin đã xóa
function getDeletedNewsIds(templateId: string): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) return [];

    const data = JSON.parse(raw) as Record<string, string[]>;

    return data[templateId] ?? [];
  } catch {
    return [];
  }
}

// Tạo danh sách bản tin theo bản mẫu
export function createSourceTemplateUsedNewsMock(
  templateId: string,
): TemplateUsedNewsItem[] {
  const deletedIds = new Set(getDeletedNewsIds(templateId));

  return INITIAL_SOURCE_TEMPLATE_USED_NEWS.map((news) => ({
    ...news,
    id: `${templateId}-${news.id}`,
    templateId,
  })).filter((news) => !deletedIds.has(news.id));
}

// Xóa bản tin khỏi danh sách sử dụng bản mẫu
export function deleteSourceTemplateUsedNews(
  templateId: string,
  newsIds: string[],
): void {
  const raw = localStorage.getItem(STORAGE_KEY);

  let data: Record<string, string[]> = {};

  try {
    data = raw ? (JSON.parse(raw) as Record<string, string[]>) : {};
  } catch {
    data = {};
  }

  const deletedIds = new Set([...(data[templateId] ?? []), ...newsIds]);

  data[templateId] = [...deletedIds];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
