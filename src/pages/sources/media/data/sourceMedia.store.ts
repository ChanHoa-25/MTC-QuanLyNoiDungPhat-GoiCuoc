import { useSyncExternalStore } from "react";
import { initialSourceMediaMock } from "./sourceMedia.mock";
import type {
  SourceMediaApprovalStatus,
  SourceMediaItem,
} from "../types/sourceMedia.types";

let mediaItemsState: SourceMediaItem[] = [...initialSourceMediaMock];
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
  return mediaItemsState;
}

export function addSourceMediaItems(newItems: SourceMediaItem[]) {
  if (newItems.length === 0) return;
  const existingIds = new Set(mediaItemsState.map((item) => item.id));
  const uniqueItems = newItems.filter((item) => !existingIds.has(item.id));
  if (uniqueItems.length === 0) return;
  mediaItemsState = [...uniqueItems, ...mediaItemsState];
  emitChange();
}

export function updateSourceMediaItem(
  id: string,
  patch: Partial<SourceMediaItem>,
) {
  mediaItemsState = mediaItemsState.map((item) =>
    item.id === id ? { ...item, ...patch } : item,
  );
  emitChange();
}

export function deleteSourceMediaByIds(ids: string[]) {
  const idSet = new Set(ids);
  mediaItemsState = mediaItemsState.filter((item) => !idSet.has(item.id));
  emitChange();
}

export function updateSourceMediaApproval(
  ids: string[],
  status: SourceMediaApprovalStatus,
  rejectionReason?: string,
) {
  const idSet = new Set(ids);
  mediaItemsState = mediaItemsState.map((item) =>
    idSet.has(item.id)
      ? {
          ...item,
          approvalStatus: status,
          isProcessing: false,
          ...(rejectionReason !== undefined ? { rejectionReason } : {}),
        }
      : item,
  );
  emitChange();
}

export function useSourceMediaStore() {
  const items = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const getMediaById = (id: string) => items.find((item) => item.id === id);

  return {
    mediaItems: items,
    getMediaById,
    addMediaItems: addSourceMediaItems,
    updateMediaItem: updateSourceMediaItem,
    deleteMediaByIds: deleteSourceMediaByIds,
    updateApproval: updateSourceMediaApproval,
  };
}
