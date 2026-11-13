import { DEFAULT_MEDIA_THUMBNAIL } from "../../media/data/sourceMedia.mock";
import type { SharedMediaItem } from "../types/sourceShared.types";

export const SHARED_CATEGORY_OPTIONS = [
  { label: "Tất cả", value: "all" },
  { label: "Du lịch", value: "Du lịch" },
  { label: "Kinh tế", value: "Kinh tế" },
  { label: "Tin tức", value: "Tin tức" },
];

const SEED_ROWS: Array<{
  title: string;
  category: string;
  formatLabel: string;
  type: SharedMediaItem["type"];
}> = [
  {
    title: "Khám phá Hội An - Việt Nam",
    category: "Du lịch",
    formatLabel: "Audi - mp3",
    type: "audio",
  },
  {
    title: "Hải Phòng yêu cầu người dân không ra khỏi nhà sau 22h",
    category: "Kinh tế",
    formatLabel: "Audi - mp3",
    type: "audio",
  },
  {
    title: "Chuẩn bị gì sau khi tiêm vaccin Covid -19?",
    category: "Tin tức",
    formatLabel: "Audi - mp3",
    type: "audio",
  },
  {
    title: "SNOW CHANNEL 1",
    category: "Du lịch",
    formatLabel: "Video - mp4",
    type: "video",
  },
  {
    title: "Chuẩn bị gì sau khi tiêm vaccin Covid -19?",
    category: "Kinh tế",
    formatLabel: "Audi - mp3",
    type: "audio",
  },
  {
    title: "Hải Phòng yêu cầu người dân không ra khỏi nhà sau 22h",
    category: "Du lịch",
    formatLabel: "Audi - mp3",
    type: "audio",
  },
  {
    title: "Chuẩn bị gì sau khi tiêm vaccin Covid -19?",
    category: "Kinh tế",
    formatLabel: "Audi - mp3",
    type: "audio",
  },
  {
    title: "Du lịch ở Tp.HCM đang như thế nào? 101",
    category: "Du lịch",
    formatLabel: "Video - mp4",
    type: "video",
  },
  {
    title: "SNOW CHANNEL 1",
    category: "Kinh tế",
    formatLabel: "Video - mp4",
    type: "video",
  },
  {
    title: "Hải Phòng yêu cầu người dân không ra khỏi nhà sau 22h",
    category: "Du lịch",
    formatLabel: "Audi - mp3",
    type: "audio",
  },
];

export const initialSharedMediaMock: SharedMediaItem[] = Array.from(
  { length: 100 },
  (_, index) => {
    const seed = SEED_ROWS[index % SEED_ROWS.length];
    const day = String((index % 10) + 10).padStart(2, "0");

    return {
      id: `shared-media-${index + 1}`,
      title: seed.title,
      detailTitle: index === 0 ? "Tin tức buổi sáng" : seed.title,
      category: seed.category,
      detailCategory: index === 0 ? "Tin tức" : seed.category,
      type: seed.type,
      formatLabel: seed.formatLabel,
      attachmentOrLink: "Snall.com/tintuc/ttbs.mp4",
      duration: "00:01:30",
      previewCurrentTime: "00:56",
      previewTotalTime: "04:12",
      approvedBy: "Tống Sỹ Nguyên",
      createdBy: "Tuyet Nguyen",
      detailCreatedBy: "Tuyết Nguyễn",
      createdAt: `2021-10-${day}T22:43:00`,
      createdAtDisplay: "03/03/12 22:43",
      detailCreatedAtDisplay: "22/07/2021 19:00:00",
      sharedFacility: "Thủ Đức",
      sharedAt: `2021-10-${day}T22:43:00`,
      sharedAtDisplay: "03/03/12 22:43",
      detailSharedAtDisplay: "22/07/2021 19:00:00",
      thumbnail: DEFAULT_MEDIA_THUMBNAIL,
    };
  },
);
