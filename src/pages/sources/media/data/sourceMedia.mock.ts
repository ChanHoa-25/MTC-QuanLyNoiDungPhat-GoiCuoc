import mediaDefaultThumb from "../../../../assets/images/media.png";
import type {
  MediaBroadcastUsageItem,
  MediaResolutionItem,
  MediaSharedFacilityItem,
  SourceMediaItem,
} from "../types/sourceMedia.types";

export const DEFAULT_MEDIA_THUMBNAIL = mediaDefaultThumb;

const SAMPLE_THUMBNAILS = [
  "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=640&q=80",
  mediaDefaultThumb,
  "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=640&q=80",
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=640&q=80",
  "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=640&q=80",
];

const DEFAULT_RESOLUTIONS: MediaResolutionItem[] = [
  { label: "4K", state: "processing" },
  { label: "2K", state: "disabled" },
  { label: "FHD", state: "ready-blue" },
  { label: "HD", state: "ready-green" },
];

const CATEGORIES = [
  "Tin tức",
  "Thể dục dưỡng sinh",
  "Văn nghệ giải trí",
  "Giáo dục",
  "Thông báo hành chính",
];

const TITLES = [
  "Thông tin buổi sáng",
  "Thông tin buổi sáng",
  "Thông tin buổi sáng",
  "Bản tin thời sự buổi trưa",
  "Chuyên mục chuyển đổi số",
  "Tuyên truyền văn minh đô thị",
  "Hướng dẫn dịch vụ công trực tuyến",
  "Điểm tin kinh tế - xã hội",
];

export const initialSourceMediaMock: SourceMediaItem[] = Array.from(
  { length: 45 },
  (_, index) => {
    const id = `source-media-${index + 1}`;
    const mediaTypes: SourceMediaItem["type"][] = [
      "video",
      "video",
      "audio",
      "image",
    ];
    const type = mediaTypes[index % mediaTypes.length];

    const approvalStatus: SourceMediaItem["approvalStatus"] =
      index === 4 ? "rejected" : index % 7 === 5 ? "pending" : "approved";

    const day = String((index % 20) + 10).padStart(2, "0");

    return {
      id,
      title: index < 15 ? "Thông tin buổi sáng" : TITLES[index % TITLES.length],
      fileName:
        "GREENfinity_Recycled_Plastic_3D_Printing_Closed_Loop_Process_Product_Showcase_Alta_Media_Version01",
      category: CATEGORIES[index % CATEGORIES.length],
      type,
      approvalStatus,
      duration: type === "image" ? "00:00:15" : "00:01:30",
      sizeMB: 165,
      detailSizeLabel: "300MB",
      thumbnail: SAMPLE_THUMBNAILS[index % SAMPLE_THUMBNAILS.length],
      attachmentOrLink: "Snail.com/tintuc/ttbs.mp4",
      approvedBy: "Tòng Sỹ Nguyên",
      createdBy: "Tuyết Nguyễn",
      createdAt:
        index < 15
          ? "2021-08-31T19:00:00"
          : `2021-08-${day === "30" ? "31" : day}T19:00:00`,
      sharedArea: "Thủ Đức",
      isProcessing: index >= 5 && index <= 9,
      processingNote: "Đang tiến hành xử lý các phiên bản",
      resolutions: DEFAULT_RESOLUTIONS,
    };
  },
);

export function createMediaBroadcastUsageMock(
  mediaId: string,
): MediaBroadcastUsageItem[] {
  const rows: Omit<MediaBroadcastUsageItem, "id" | "mediaId">[] = [
    {
      title: "Khám phá Hội An - Di sản văn hóa thế giới",
      broadcastType: "priority",
      approvalStatus: "pending",
      playStatus: undefined,
      startDate: null,
      endDate: null,
      playTimeSlots: [],
      facilitiesText: "TP. Hồ Chí Minh, Thủ Đức",
    },
    {
      title: "Khám phá Hội An - Điểm tin du lịch buổi sáng",
      broadcastType: "priority",
      approvalStatus: "approved",
      playStatus: "playing",
      startDate: "2022-03-02",
      endDate: "2022-03-02",
      playTimeSlots: ["12:00:00 - 12:15:00"],
      facilitiesText: "TP. Hồ Chí Minh, Quận 1",
    },
    {
      title: "Khám phá Hội An - Làng nghề truyền thống",
      broadcastType: "normal",
      approvalStatus: "rejected",
      playStatus: undefined,
      startDate: "2022-03-01",
      endDate: "2022-03-03",
      playTimeSlots: ["10:00:00 - 15:15:00"],
      facilitiesText: "Thủ Đức, Bình Thạnh, Quận 3",
    },
    {
      title: "Khám phá Hội An - Ẩm thực miền Trung",
      broadcastType: "normal",
      approvalStatus: "approved",
      playStatus: "paused",
      startDate: "2022-03-01",
      endDate: "2022-03-03",
      playTimeSlots: ["10:00:00 - 15:15:00", "10:00:00 - 15:15:00"],
      facilitiesText: "Thủ Đức, Bình Thạnh",
    },
    {
      title: "Khám phá Hội An - Phố cổ về đêm",
      broadcastType: "normal",
      approvalStatus: "approved",
      playStatus: "waiting",
      startDate: "2022-03-01",
      endDate: "2022-03-03",
      playTimeSlots: ["10:00:00 - 15:15:00"],
      facilitiesText: "Thủ Đức, Bình Thạnh",
    },
    {
      title: "Khám phá Hội An - Lễ hội đèn lồng",
      broadcastType: "priority",
      approvalStatus: "approved",
      playStatus: "ended",
      startDate: "2022-03-02",
      endDate: "2022-03-02",
      playTimeSlots: ["12:00:00 - 12:15:00"],
      facilitiesText: "Thủ Đức, Bình Thạnh",
    },
    {
      title: "Khám phá Hội An - Bảo tồn kiến trúc cổ",
      broadcastType: "normal",
      approvalStatus: "pending",
      playStatus: undefined,
      startDate: "2022-03-01",
      endDate: "2022-03-03",
      playTimeSlots: ["10:00:00 - 15:15:00", "10:00:00 - 15:15:00"],
      facilitiesText: "Thủ Đức, Bình Thạnh",
    },
    {
      title: "Khám phá Hội An - Hành trình kết nối",
      broadcastType: "normal",
      approvalStatus: "approved",
      playStatus: "not_started",
      startDate: "2022-03-01",
      endDate: "2022-03-03",
      playTimeSlots: ["10:00:00 - 15:15:00"],
      facilitiesText: "Thủ Đức, Bình Thạnh",
    },
    {
      title: "Khám phá Hội An - Nhịp sống phố hội",
      broadcastType: "normal",
      approvalStatus: "approved",
      playStatus: "upcoming",
      startDate: "2022-03-01",
      endDate: "2022-03-03",
      playTimeSlots: ["10:00:00 - 15:15:00"],
      facilitiesText: "Thủ Đức, Bình Thạnh",
    },
    {
      title: "Khám phá Hội An - Đêm trăng Hoài Giang",
      broadcastType: "normal",
      approvalStatus: "approved",
      playStatus: "cancelled",
      startDate: "2022-03-01",
      endDate: "2022-03-03",
      playTimeSlots: ["10:00:00 - 15:15:00", "10:00:00 - 15:15:00"],
      facilitiesText: "Thủ Đức, Bình Thạnh",
    },
  ];

  return Array.from({ length: 30 }, (_, idx) => {
    const base = rows[idx % rows.length];
    return {
      ...base,
      id: `${mediaId}-broadcast-${idx + 1}`,
      mediaId,
    };
  });
}

export function createMediaSharedFacilitiesMock(
  mediaId: string,
): MediaSharedFacilityItem[] {
  const facilitySeeds: Array<{
    facilityName: string;
    sharedAt: string | null;
    receiveStatus: MediaSharedFacilityItem["receiveStatus"];
  }> = [
    {
      facilityName: "Cơ sở 1",
      sharedAt: "2021-07-25T19:00:00",
      receiveStatus: "received",
    },
    {
      facilityName: "Cơ sở 2",
      sharedAt: "2021-07-25T19:00:00",
      receiveStatus: "received",
    },
    {
      facilityName: "Cơ sở 3",
      sharedAt: "2021-07-25T19:00:00",
      receiveStatus: "received",
    },
    {
      facilityName: "Cơ sở 4",
      sharedAt: "2021-07-25T19:00:00",
      receiveStatus: "received",
    },
    {
      facilityName: "Cơ sở 6",
      sharedAt: "2021-07-25T19:00:00",
      receiveStatus: "received",
    },
    {
      facilityName: "Cơ sở 7",
      sharedAt: "2021-07-25T19:00:00",
      receiveStatus: "received",
    },
    {
      facilityName: "Cơ sở 89",
      sharedAt: "2021-07-25T19:00:00",
      receiveStatus: "not_received",
    },
    {
      facilityName: "Cơ sở 82",
      sharedAt: "2021-07-25T19:00:00",
      receiveStatus: "received",
    },
    {
      facilityName: "Cơ sở 32",
      sharedAt: null,
      receiveStatus: "received",
    },
    {
      facilityName: "Cơ sở 65",
      sharedAt: "2021-07-25T19:00:00",
      receiveStatus: "received",
    },
  ];

  return Array.from({ length: 20 }, (_, idx) => {
    const seed = facilitySeeds[idx % facilitySeeds.length];
    return {
      id: `${mediaId}-shared-facility-${idx + 1}`,
      facilityName:
        idx < facilitySeeds.length
          ? seed.facilityName
          : `${seed.facilityName} (${Math.floor(idx / facilitySeeds.length) + 1})`,
      sharedAt: seed.sharedAt,
      receiveStatus: seed.receiveStatus,
    };
  });
}
