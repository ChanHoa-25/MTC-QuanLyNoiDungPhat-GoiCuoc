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

function getSnapshot(): SourceMediaItem[] {
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
  const exists = mediaItemsState.some((item) => item.id === id);

  if (!exists) return;

  mediaItemsState = mediaItemsState.map((item) =>
    item.id === id
      ? {
          ...item,
          ...patch,
        }
      : item,
  );

  emitChange();
}

export function deleteSourceMediaByIds(ids: string[]) {
  if (ids.length === 0) return;

  const idSet = new Set(ids);

  const updatedItems = mediaItemsState.filter((item) => !idSet.has(item.id));

  if (updatedItems.length === mediaItemsState.length) return;

  mediaItemsState = updatedItems;

  emitChange();
}

export function updateSourceMediaApproval(
  ids: string[],
  status: SourceMediaApprovalStatus,
  rejectionReason?: string,
) {
  if (ids.length === 0) return;

  const idSet = new Set(ids);

  const hasMatchingItems = mediaItemsState.some(
    (item) => idSet.has(item.id) && item.status === "pending",
  );

  if (!hasMatchingItems) return;

  mediaItemsState = mediaItemsState.map((item) => {
    if (!idSet.has(item.id) || item.status !== "pending") {
      return item;
    }

    return {
      ...item,
      status,
      rejectionReason:
        status === "rejected"
          ? (rejectionReason ?? item.rejectionReason)
          : undefined,
    };
  });

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
