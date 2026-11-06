import type {
  FacilityPlaylistNews,
  FacilityNewsApprovalStatus,
  FacilityNewsBroadcastStatus,
  FacilityNewsRepeatType,
  FacilityNewsType,
} from "../types/facilityPlaylistNews.types";

type NewsMockData = Omit<FacilityPlaylistNews, "id" | "playlistId">;

const newsMockData: NewsMockData[] = [
  {
    code: "Bản tin 1",
    title: "Khám phá Hội An - Việt Nam",
    newsType: "Tin ưu tiên",
    approvalStatus: "Chờ duyệt",
    facilityName: "TP. Hồ Chí Minh",
    createdBy: "Nguyễn Văn A",
  },
  {
    code: "Bản tin 2",
    title: "Khám phá Hội An - Việt Nam",
    newsType: "Tin ưu tiên",
    approvalStatus: "Đã duyệt",
    broadcastStatus: "Đang phát",
    startDate: "2022-03-02",
    endDate: "2022-03-03",
    broadcastTime: "12:00:00 - 12:15:00",
    facilityName: "TP. Hồ Chí Minh",
    createdBy: "Nguyễn Văn A",
  },
  {
    code: "Bản tin 3",
    title: "Khám phá Hội An - Việt Nam",
    newsType: "Tin thường",
    approvalStatus: "Từ chối duyệt",
    repeatType: "Không lặp",
    startDate: "2022-03-01",
    endDate: "2022-03-03",
    broadcastTime: "10:00:00 - 15:15:00",
    facilityName: "Thủ Đức, Bình Thạnh",
    createdBy: "Nguyễn Văn A",
  },
  {
    code: "Bản tin 4",
    title: "Khám phá Hội An - Việt Nam",
    newsType: "Tin thường",
    approvalStatus: "Đã duyệt",
    broadcastStatus: "Tạm ngưng",
    repeatType: "Ngày trong tháng",
    startDate: "2022-03-01",
    endDate: "2022-03-03",
    broadcastTime: "10:00:00 - 15:15:00",
    facilityName: "Thủ Đức, Bình Thạnh",
    createdBy: "Nguyễn Văn A",
  },
  {
    code: "Bản tin 5",
    title: "Khám phá Hội An - Việt Nam",
    newsType: "Tin thường",
    approvalStatus: "Đã duyệt",
    broadcastStatus: "Chờ phát",
    repeatType: "Hàng ngày",
    startDate: "2022-03-01",
    endDate: "2022-03-03",
    broadcastTime: "10:00:00 - 15:15:00",
    facilityName: "Thủ Đức, Bình Thạnh",
    createdBy: "Nguyễn Văn A",
  },
  {
    code: "Bản tin 6",
    title: "Khám phá Hội An - Việt Nam",
    newsType: "Tin ưu tiên",
    approvalStatus: "Đã duyệt",
    broadcastStatus: "Đã kết thúc",
    startDate: "2022-03-02",
    endDate: "2022-03-02",
    broadcastTime: "12:00:00 - 12:15:00",
    facilityName: "Thủ Đức, Bình Thạnh",
    createdBy: "Nguyễn Văn A",
  },
  {
    code: "Bản tin 7",
    title: "Khám phá Hội An - Việt Nam",
    newsType: "Tin thường",
    approvalStatus: "Chờ duyệt",
    repeatType: "Ngày trong tuần",
    startDate: "2022-03-01",
    endDate: "2022-03-03",
    broadcastTime: "10:00:00 - 15:15:00",
    facilityName: "Thủ Đức, Bình Thạnh",
    createdBy: "Nguyễn Văn A",
  },
  {
    code: "Bản tin 8",
    title: "Khám phá Hội An - Việt Nam",
    newsType: "Tin thường",
    approvalStatus: "Đã duyệt",
    broadcastStatus: "Chưa phát",
    repeatType: "Ngày trong tháng",
    startDate: "2022-03-01",
    endDate: "2022-03-03",
    broadcastTime: "10:00:00 - 15:15:00",
    facilityName: "Thủ Đức, Bình Thạnh",
    createdBy: "Nguyễn Văn A",
  },
  {
    code: "Bản tin 9",
    title: "Khám phá Hội An - Việt Nam",
    newsType: "Tin thường",
    approvalStatus: "Đã duyệt",
    broadcastStatus: "Sắp tới lịch",
    repeatType: "Ngày trong tuần",
    startDate: "2022-03-01",
    endDate: "2022-03-03",
    broadcastTime: "10:00:00 - 15:15:00",
    facilityName: "Thủ Đức, Bình Thạnh",
    createdBy: "Nguyễn Văn A",
  },
  {
    code: "Bản tin 10",
    title: "Khám phá Hội An - Việt Nam",
    newsType: "Tin thường",
    approvalStatus: "Đã duyệt",
    broadcastStatus: "Đã hủy",
    repeatType: "Ngày trong tháng",
    startDate: "2022-03-01",
    endDate: "2022-03-03",
    broadcastTime: "10:00:00 - 15:15:00",
    facilityName: "Thủ Đức, Bình Thạnh",
    createdBy: "Nguyễn Văn A",
  },
];

// Tạo dữ liệu mock theo từng danh sách phát
export function createFacilityPlaylistNewsMock(
  playlistId: string,
): FacilityPlaylistNews[] {
  return newsMockData.map((item, index) => ({
    ...item,
    id: `${playlistId}-news-${index + 1}`,
    playlistId,
  }));
}

// Các tùy chọn dùng cho bộ lọc
const createOptions = (values: readonly string[]) => [
  { label: "Tất cả", value: "all" },
  ...values.map((value) => ({
    label: value,
    value,
  })),
];

export const facilityNewsTypeOptions = createOptions([
  "Tin ưu tiên",
  "Tin thường",
] satisfies FacilityNewsType[]);

export const facilityNewsApprovalOptions = createOptions([
  "Chờ duyệt",
  "Đã duyệt",
  "Từ chối duyệt",
] satisfies FacilityNewsApprovalStatus[]);

export const facilityNewsBroadcastOptions = createOptions([
  "Đang phát",
  "Tạm ngưng",
  "Chờ phát",
  "Đã kết thúc",
  "Chưa phát",
  "Sắp tới lịch",
  "Đã hủy",
] satisfies FacilityNewsBroadcastStatus[]);

export const facilityNewsRepeatOptions = createOptions([
  "Không lặp",
  "Hàng ngày",
  "Ngày trong tuần",
  "Ngày trong tháng",
] satisfies FacilityNewsRepeatType[]);
