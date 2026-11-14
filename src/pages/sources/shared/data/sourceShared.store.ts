import { useSyncExternalStore } from "react";
import { addSourceMediaItems } from "../../media/data/sourceMedia.store";
import type { SourceMediaItem } from "../../media/types/sourceMedia.types";
import { initialSharedMediaMock } from "./sourceShared.mock";
import type { SharedMediaItem } from "../types/sourceShared.types";

let sharedItemsState: SharedMediaItem[] = [...initialSharedMediaMock];
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
  return sharedItemsState;
}

export function deleteSharedMediaByIds(ids: string[]) {
  const idSet = new Set(ids);
  sharedItemsState = sharedItemsState.filter((item) => !idSet.has(item.id));
  emitChange();
}

export function acceptSharedMediaByIds(ids: string[]) {
  const idSet = new Set(ids);
  const selected = sharedItemsState.filter((item) => idSet.has(item.id));

  if (selected.length > 0) {
    const convertedMedia: SourceMediaItem[] = selected.map((item) => ({
      id: `accepted-${item.id}`,
      title: item.title,
      fileName: item.title,
      category: item.category,
      type: item.type,
      status: "approved",
      duration: item.duration,
      sizeMB: 165,
      detailSizeLabel: "300MB",
      thumbnail: item.thumbnail,
      attachmentOrLink: item.attachmentOrLink,
      approvedBy: item.approvedBy,
      createdBy: item.detailCreatedBy,
      createdAt: item.createdAt,
      sharedArea: item.sharedFacility,
      resolutions: [
        { label: "4K", state: "processing" },
        { label: "2K", state: "disabled" },
        { label: "FHD", state: "ready-blue" },
        { label: "HD", state: "ready-green" },
      ],
    }));

    addSourceMediaItems(convertedMedia);
  }

  sharedItemsState = sharedItemsState.filter((item) => !idSet.has(item.id));
  emitChange();
}

export function useSourceSharedStore() {
  const items = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return {
    sharedItems: items,
    deleteSharedByIds: deleteSharedMediaByIds,
    acceptSharedByIds: acceptSharedMediaByIds,
  };
}
