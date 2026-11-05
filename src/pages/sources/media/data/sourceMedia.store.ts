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

export function deleteSourceMediaByIds(ids: string[]) {
  const idSet = new Set(ids);
  mediaItemsState = mediaItemsState.filter((item) => !idSet.has(item.id));
  emitChange();
}

export function updateSourceMediaApproval(
  ids: string[],
  status: SourceMediaApprovalStatus,
) {
  const idSet = new Set(ids);
  mediaItemsState = mediaItemsState.map((item) =>
    idSet.has(item.id) ? { ...item, approvalStatus: status } : item,
  );
  emitChange();
}

export function useSourceMediaStore() {
  const items = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const getMediaById = (id: string) => items.find((item) => item.id === id);

  return {
    mediaItems: items,
    getMediaById,
    deleteMediaByIds: deleteSourceMediaByIds,
    updateApproval: updateSourceMediaApproval,
  };
}
