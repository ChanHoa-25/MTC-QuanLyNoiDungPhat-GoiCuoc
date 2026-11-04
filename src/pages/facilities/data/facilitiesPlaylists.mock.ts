import type { FacilityPlaylist } from "../types/facilityPlaylist.types";

export function createFacilityPlaylistsMock(
  facilityId: string,
): FacilityPlaylist[] {
  const playlists = [
    {
      name: "Thể dục buổi sáng",
      category: "Thể dục dưỡng sinh",
      newsType: "Bản tin phát thanh",
    },
    {
      name: "Thể dục dưỡng sinh",
      category: "Thể dục dưỡng sinh",
      newsType: "Bản tin phát thanh",
    },
    {
      name: "Thể dục dưỡng sinh",
      category: "Tin tức",
      newsType: "Bản tin điện tử",
    },
    {
      name: "Văn nghệ",
      category: "Văn nghệ giải trí",
      newsType: "Bản tin phát thanh",
    },
    {
      name: "Cập nhật tình hình Covid 19",
      category: "Tin tức",
      newsType: "Bản tin phát thanh",
    },
    {
      name: "Hướng dẫn tập yoga tại nhà",
      category: "Thể dục dưỡng sinh",
      newsType: "Bản tin điện tử",
    },
    {
      name: "Những bài hát về Tổ quốc tôi",
      category: "Giáo dục",
      newsType: "Bản tin điện tử",
    },
    {
      name: "Tin nhanh 24/7",
      category: "Thể dục dưỡng sinh",
      newsType: "Bản tin phát thanh",
    },
    {
      name: "Chúc bé ngủ ngon",
      category: "Tin tức",
      newsType: "Bản tin phát thanh",
    },
    {
      name: "Những tấm gương vượt khó",
      category: "Văn nghệ giải trí",
      newsType: "Bản tin tiếp sóng",
    },
  ];

  return Array.from({ length: 35 }, (_, index) => {
    const playlist = playlists[index % playlists.length];

    return {
      id: `${facilityId}-playlist-${index + 1}`,
      facilityId,
      name: playlist.name,
      duration: "00:05:30",
      category: playlist.category,
      createdBy: "Tuyết Nguyễn",
      createdAt: "2012-03-03T22:43:00",
      newsType: playlist.newsType,
    };
  });
}
