export type FacilityPlaylistPlayMode = "random" | "sequential";

export type FacilityPlaylistSourceType = "media" | "template";

export interface FacilityPlaylistSource {
  id: string;
  sourceId: string;
  sourceType: FacilityPlaylistSourceType;
  name: string;
  duration: string;
  thumbnail?: string;
  mediaType?: string;
}

export interface FacilityPlaylist {
  id: string;
  facilityId: string;
  name: string;
  duration: string;
  category: string;
  createdBy: string;
  createdAt: string;
  newsType: string;
  playMode?: FacilityPlaylistPlayMode;
  description?: string;
  sources?: FacilityPlaylistSource[];
}
