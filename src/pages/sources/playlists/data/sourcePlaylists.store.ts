/**
 * ==============================================================================
 * [DATA ACCESS / STORE LAYER - DANH SÁCH PHÁT]
 *
 * - Tách tầng giao diện khỏi tầng truy cập dữ liệu (AGENTS_MTC_TV4.md mục 5, 9).
 * - Hiện tại: lưu in-memory từ mock (sourcePlaylists.mock.ts), mất khi tải lại trang.
 * - Khi có API playlist từ backend (.NET), chỉ cần thay phần thân các hàm bên dưới
 *   bằng lời gọi service HTTP (kèm loading / lỗi); các trang UI giữ nguyên cách gọi:
 *   + getPlaylistById(id)        -> lấy chi tiết playlist
 *   + addPlaylist(values)        -> tạo playlist
 *   + updatePlaylist(id, values) -> cập nhật playlist (chỉ khi chưa sử dụng)
 *   + deletePlaylists(ids)       -> xóa playlist (chỉ khi chưa sử dụng)
 *   Endpoint, DTO và quy tắc ghi log (tên + thời lượng, SRS) phải theo hợp đồng backend.
 * ==============================================================================
 */

import { useSyncExternalStore } from "react";
import dayjs from "dayjs";

import { sumDurations } from "../../utils/duration";
import { INITIAL_SOURCE_PLAYLISTS } from "./sourcePlaylists.mock";
import type {
  PlaylistEntry,
  PlaylistNewsType,
  SourcePlaylistFormValues,
  SourcePlaylistItem,
} from "../types/sourcePlaylist.types";

/** [MOCK] Người dùng hiện tại - sau này lấy từ thông tin đăng nhập. */
const MOCK_CURRENT_USER = "Tuyết Nguyễn";

let playlistsState: SourcePlaylistItem[] = [...INITIAL_SOURCE_PLAYLISTS];
const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return playlistsState;
}

/** Tổng thời lượng playlist = tổng thời lượng các nguồn phát. */
export function getPlaylistDuration(entries: PlaylistEntry[]): string {
  return sumDurations(entries.map((entry) => entry.duration));
}

/**
 * [CẦN XÁC NHẬN] Quy tắc loại bản tin chưa có trong SRS.
 * Tạm thời: playlist chỉ gồm media âm thanh -> "radio" (phát thanh), còn lại -> "electronic".
 */
export function resolvePlaylistNewsType(entries: PlaylistEntry[]): PlaylistNewsType {
  const isRadioOnly =
    entries.length > 0 &&
    entries.every((entry) => entry.sourceType === "media" && entry.mediaType === "audio");
  return isRadioOnly ? "radio" : "electronic";
}

export function getPlaylistById(id: string) {
  return playlistsState.find((item) => item.id === id) ?? null;
}

export function addPlaylist(values: SourcePlaylistFormValues): SourcePlaylistItem {
  const newItem: SourcePlaylistItem = {
    id: `pl-${Date.now()}`,
    name: values.name.trim(),
    category: values.category,
    playMode: values.playMode,
    description: values.description.trim(),
    entries: values.entries,
    newsType: resolvePlaylistNewsType(values.entries),
    createdBy: MOCK_CURRENT_USER,
    createdAt: dayjs().format("DD/MM/YYYY HH:mm:ss"),
    usageStatus: "unused",
  };
  playlistsState = [newItem, ...playlistsState];
  emitChange();
  return newItem;
}

/** Trả về false nếu playlist không tồn tại hoặc đang được sử dụng (SRS 4.3.2). */
export function updatePlaylist(id: string, values: SourcePlaylistFormValues): boolean {
  const current = getPlaylistById(id);
  if (!current || current.usageStatus === "in_use") return false;

  playlistsState = playlistsState.map((item) =>
    item.id === id
      ? {
          ...item,
          name: values.name.trim(),
          category: values.category,
          playMode: values.playMode,
          description: values.description.trim(),
          entries: values.entries,
          newsType: resolvePlaylistNewsType(values.entries),
        }
      : item,
  );
  emitChange();
  return true;
}

/** Chỉ xóa các playlist chưa sử dụng; trả về danh sách id bị chặn (đang sử dụng). */
export function deletePlaylists(ids: string[]): { deletedIds: string[]; blockedIds: string[] } {
  const idSet = new Set(ids);
  const blockedIds = playlistsState
    .filter((item) => idSet.has(item.id) && item.usageStatus === "in_use")
    .map((item) => item.id);
  const deletedIds = ids.filter((id) => !blockedIds.includes(id));
  const deletedSet = new Set(deletedIds);

  playlistsState = playlistsState.filter((item) => !deletedSet.has(item.id));
  emitChange();
  return { deletedIds, blockedIds };
}

export function useSourcePlaylistsStore() {
  const playlists = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return {
    playlists,
    getPlaylistById,
    addPlaylist,
    updatePlaylist,
    deletePlaylists,
  };
}

