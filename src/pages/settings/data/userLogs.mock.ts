import type { UserLog } from "../types/userLogs.types";

export const mockUserLogs: UserLog[] = [
  "TD",
  "SK",
  "TT",
  "KH",
  "DS",
  "AT",
  "MVB",
  "KN4P",
  "GD",
  "GTVT",
].map((actor, index) => ({
  id: index + 1,
  actor,
  actionTime: "2021-07-19 13:35:50",
  functionName: "Chỉnh sửa Media",
  oldContent: "Tên Media: Media 1",
  newContent: "Tên Media: Media 2",
}));
