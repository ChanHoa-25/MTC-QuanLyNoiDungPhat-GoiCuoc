/**
 * ==============================================================================
 * [MOCK DATA - DANH SÁCH PHÁT]
 *
 * Toàn bộ dữ liệu trong file này là GIẢ LẬP để dựng giao diện khi backend chưa có
 * API cho playlist (đã kiểm tra theo AGENTS_MTC_TV4.md mục 9: backend mới có model
 * `Playlist`, `PlaylistItem` nhưng chưa có controller).
 *
 * Khi tích hợp API, thay thế:
 * - INITIAL_SOURCE_PLAYLISTS      -> danh sách playlist từ API (GET danh sách playlist)
 * - PLAYLIST_CATEGORY_OPTIONS     -> danh mục lĩnh vực từ API danh mục
 * - MOCK_PLAYLIST_USED_NEWS       -> danh sách bản tin sử dụng playlist từ API bản tin
 * Tên endpoint cụ thể phải lấy theo Swagger / hợp đồng backend, không tự đặt.
 * Không chứa dữ liệu nhạy cảm.
 * ==============================================================================
 */

import { initialSourceMediaMock } from "../../media/data/sourceMedia.mock";
import { INITIAL_SOURCE_TEMPLATES } from "../../templates/data/sourceTemplates.mock";
import type { SourceUsedNewsItem } from "../../types/sourceUsedNews.types";
import type { PlaylistEntry, SourcePlaylistItem } from "../types/sourcePlaylist.types";

/** [MOCK] Danh mục lĩnh vực - sau này lấy từ API danh mục lĩnh vực. */
export const PLAYLIST_CATEGORY_OPTIONS = [
  "Tin tức",
  "Thể dục dưỡng sinh",
  "Văn nghệ giải trí",
  "Giáo dục",
  "Thông báo hành chính",
].map((label) => ({ label, value: label }));

let mockEntrySeq = 0;

/** [MOCK] Tạo phần tử playlist từ media mock theo id. */
function mediaEntry(mediaId: string, duration?: string): PlaylistEntry {
  const media = initialSourceMediaMock.find((item) => item.id === mediaId);
  mockEntrySeq += 1;
  return {
    id: `mock-entry-${mockEntrySeq}`,
    sourceId: mediaId,
    sourceType: "media",
    name: media?.title ?? mediaId,
    duration: duration ?? media?.duration ?? "00:00:30",
    mediaType: media?.type,
    thumbnail: media?.thumbnail,
  };
}

/** [MOCK] Tạo phần tử playlist từ bản mẫu mock theo id. */
function templateEntry(templateId: string, duration?: string): PlaylistEntry {
  const template = INITIAL_SOURCE_TEMPLATES.find((item) => item.id === templateId);
  mockEntrySeq += 1;
  return {
    id: `mock-entry-${mockEntrySeq}`,
    sourceId: templateId,
    sourceType: "template",
    name: template?.name ?? templateId,
    duration: duration ?? template?.duration ?? "00:00:30",
    thumbnail: template?.zones.find((zone) => zone.mediaThumbnail)?.mediaThumbnail,
  };
}

const MIXED_ENTRIES = (): PlaylistEntry[] => [
  mediaEntry("source-media-1", "00:00:30"),
  mediaEntry("source-media-2", "00:00:30"),
  mediaEntry("source-media-9", "00:00:30"),
  mediaEntry("source-media-4", "00:00:30"),
  templateEntry("tpl-1", "00:00:30"),
  templateEntry("tpl-2", "00:00:30"),
  templateEntry("tpl-3", "00:00:30"),
  templateEntry("tpl-4", "00:00:30"),
  templateEntry("tpl-5", "00:00:30"),
  templateEntry("tpl-6", "00:01:30"),
];

const RADIO_ENTRIES = (): PlaylistEntry[] => [
  mediaEntry("source-media-3", "00:01:30"),
  mediaEntry("source-media-7", "00:01:30"),
  mediaEntry("source-media-11", "00:01:30"),
  mediaEntry("source-media-15", "00:01:00"),
];

/** [MOCK] Danh sách playlist ban đầu. */
export const INITIAL_SOURCE_PLAYLISTS: SourcePlaylistItem[] = [
  {
    id: "pl-1",
    name: "Thể dục buổi sáng",
    category: "Thể dục dưỡng sinh",
    newsType: "electronic",
    playMode: "random",
    description:
      "Thể dục buổi sáng, thể dục dưỡng sinh lĩnh vực thể thao, bản tin phát thanh.",
    createdBy: "Tuyết Nguyễn",
    createdAt: "03/03/2022 22:43:00",
    usageStatus: "in_use",
    entries: MIXED_ENTRIES(),
  },
  {
    id: "pl-2",
    name: "Thể dục dưỡng sinh",
    category: "Thể dục dưỡng sinh",
    newsType: "radio",
    playMode: "sequential",
    description: "Các bài tập dưỡng sinh dành cho người cao tuổi.",
    createdBy: "Tuyết Nguyễn",
    createdAt: "03/03/2022 22:43:00",
    usageStatus: "in_use",
    entries: RADIO_ENTRIES(),
  },
  {
    id: "pl-3",
    name: "Điểm tin buổi tối",
    category: "Tin tức",
    newsType: "electronic",
    playMode: "sequential",
    description: "Tổng hợp tin tức trong ngày.",
    createdBy: "Tuyết Nguyễn",
    createdAt: "04/03/2022 08:15:00",
    usageStatus: "in_use",
    entries: MIXED_ENTRIES(),
  },
  {
    id: "pl-4",
    name: "Văn nghệ",
    category: "Văn nghệ giải trí",
    newsType: "radio",
    playMode: "random",
    description: "Chương trình ca nhạc, văn nghệ cuối tuần.",
    createdBy: "Vũ Thanh Thảo",
    createdAt: "05/03/2022 10:20:00",
    usageStatus: "in_use",
    entries: RADIO_ENTRIES(),
  },
  {
    id: "pl-5",
    name: "Cập nhật tình hình Covid 19",
    category: "Tin tức",
    newsType: "electronic",
    playMode: "sequential",
    description: "Thông tin phòng chống dịch bệnh.",
    createdBy: "Tuyết Nguyễn",
    createdAt: "06/03/2022 07:00:00",
    usageStatus: "in_use",
    entries: MIXED_ENTRIES().slice(0, 6),
  },
  {
    id: "pl-6",
    name: "Hướng dẫn tập yoga tại nhà",
    category: "Thể dục dưỡng sinh",
    newsType: "electronic",
    playMode: "sequential",
    description: "Chuỗi video hướng dẫn tập yoga cơ bản.",
    createdBy: "Tuyết Nguyễn",
    createdAt: "07/03/2022 09:30:00",
    usageStatus: "unused",
    entries: [
      mediaEntry("source-media-1"),
      mediaEntry("source-media-2"),
      mediaEntry("source-media-10"),
    ],
  },
  {
    id: "pl-7",
    name: "Những bài hát về Tổ quốc tôi",
    category: "Giáo dục",
    newsType: "radio",
    playMode: "random",
    description: "Tuyển tập ca khúc cách mạng.",
    createdBy: "Vũ Thanh Thảo",
    createdAt: "08/03/2022 14:10:00",
    usageStatus: "in_use",
    entries: RADIO_ENTRIES(),
  },
  {
    id: "pl-8",
    name: "Tin nhanh 24/7",
    category: "Thể dục dưỡng sinh",
    newsType: "electronic",
    playMode: "random",
    description: "Tin nhanh cập nhật liên tục.",
    createdBy: "Tuyết Nguyễn",
    createdAt: "09/03/2022 22:43:00",
    usageStatus: "unused",
    entries: [templateEntry("tpl-3"), templateEntry("tpl-5"), mediaEntry("source-media-8")],
  },
  {
    id: "pl-9",
    name: "Chúc bé ngủ ngon",
    category: "Tin tức",
    newsType: "radio",
    playMode: "sequential",
    description: "Chương trình kể chuyện thiếu nhi.",
    createdBy: "Tuyết Nguyễn",
    createdAt: "10/03/2022 20:00:00",
    usageStatus: "unused",
    entries: [mediaEntry("source-media-3"), mediaEntry("source-media-7")],
  },
  {
    id: "pl-10",
    name: "Những tấm gương vượt khó",
    category: "Văn nghệ giải trí",
    newsType: "electronic",
    playMode: "sequential",
    description: "Phóng sự về những tấm gương vượt khó.",
    createdBy: "Vũ Thanh Thảo",
    createdAt: "11/03/2022 16:45:00",
    usageStatus: "in_use",
    entries: MIXED_ENTRIES().slice(2, 8),
  },
  {
    id: "pl-11",
    name: "Phổ biến pháp luật",
    category: "Thông báo hành chính",
    newsType: "electronic",
    playMode: "sequential",
    description: "Phổ biến các văn bản pháp luật mới.",
    createdBy: "Tuyết Nguyễn",
    createdAt: "12/03/2022 08:00:00",
    usageStatus: "unused",
    entries: [templateEntry("tpl-7"), templateEntry("tpl-8")],
  },
  {
    id: "pl-12",
    name: "Thông báo lịch tiêm chủng",
    category: "Thông báo hành chính",
    newsType: "radio",
    playMode: "random",
    description: "Thông báo lịch tiêm chủng tại phường.",
    createdBy: "Tuyết Nguyễn",
    createdAt: "13/03/2022 07:30:00",
    usageStatus: "unused",
    entries: [mediaEntry("source-media-11")],
  },
];

/** [MOCK] Danh sách bản tin sử dụng playlist - sau này lấy từ API bản tin. */
export const MOCK_PLAYLIST_USED_NEWS: SourceUsedNewsItem[] = [
  {
    id: "pl-news-1",
    code: "Bản tin 1",
    title: "Khám phá Hội An-Việt Nam",
    type: "urgent",
    approvalStatus: "pending",
    playStatus: "waiting",
    repeatType: "none",
    broadcastDate: "-",
    broadcastTime: "-",
    facilityName: "TP. Hồ Chí Minh",
    createdBy: "Nguyễn Văn A",
  },
  {
    id: "pl-news-2",
    code: "Bản tin 2",
    title: "Khám phá Hội An-Việt Nam",
    type: "urgent",
    approvalStatus: "approved",
    playStatus: "playing",
    repeatType: "none",
    broadcastDate: "02/03/2022 - 02/03/2022",
    broadcastTime: "12:00:00 - 12:15:00",
    facilityName: "TP. Hồ Chí Minh",
    createdBy: "Nguyễn Văn A",
  },
  {
    id: "pl-news-3",
    code: "Bản tin 3",
    title: "Khám phá Hội An-Việt Nam",
    type: "normal",
    approvalStatus: "rejected",
    playStatus: "waiting",
    repeatType: "none",
    broadcastDate: "01/03/2022 - 03/03/2022",
    broadcastTime: "10:00:00 - 15:15:00",
    facilityName: "Thủ Đức, Bình Thạnh",
    createdBy: "Nguyễn Văn A",
  },
  {
    id: "pl-news-4",
    code: "Bản tin 4",
    title: "Khám phá Hội An-Việt Nam",
    type: "normal",
    approvalStatus: "approved",
    playStatus: "paused",
    repeatType: "monthly",
    broadcastDate: "01/03/2022 - 03/03/2022",
    broadcastTime: "10:00:00 - 15:15:00",
    facilityName: "Thủ Đức, Bình Thạnh",
    createdBy: "Nguyễn Văn A",
  },
  {
    id: "pl-news-5",
    code: "Bản tin 5",
    title: "Khám phá Hội An-Việt Nam",
    type: "normal",
    approvalStatus: "approved",
    playStatus: "waiting",
    repeatType: "daily",
    broadcastDate: "01/03/2022 - 03/03/2022",
    broadcastTime: "10:00:00 - 15:15:00",
    facilityName: "Thủ Đức, Bình Thạnh",
    createdBy: "Nguyễn Văn A",
  },
  {
    id: "pl-news-6",
    code: "Bản tin 6",
    title: "Khám phá Hội An-Việt Nam",
    type: "urgent",
    approvalStatus: "approved",
    playStatus: "ended",
    repeatType: "none",
    broadcastDate: "02/03/2022 - 02/03/2022",
    broadcastTime: "12:00:00 - 12:15:00",
    facilityName: "Thủ Đức, Bình Thạnh",
    createdBy: "Nguyễn Văn A",
  },
  {
    id: "pl-news-7",
    code: "Bản tin 7",
    title: "Khám phá Hội An-Việt Nam",
    type: "normal",
    approvalStatus: "pending",
    playStatus: "waiting",
    repeatType: "weekly",
    broadcastDate: "01/03/2022 - 03/03/2022",
    broadcastTime: "10:00:00 - 15:15:00",
    facilityName: "Thủ Đức, Bình Thạnh",
    createdBy: "Nguyễn Văn A",
  },
  {
    id: "pl-news-8",
    code: "Bản tin 8",
    title: "Khám phá Hội An-Việt Nam",
    type: "normal",
    approvalStatus: "approved",
    playStatus: "cancelled",
    repeatType: "monthly",
    broadcastDate: "01/03/2022 - 03/03/2022",
    broadcastTime: "10:00:00 - 15:15:00",
    facilityName: "Thủ Đức, Bình Thạnh",
    createdBy: "Nguyễn Văn A",
  },
];

