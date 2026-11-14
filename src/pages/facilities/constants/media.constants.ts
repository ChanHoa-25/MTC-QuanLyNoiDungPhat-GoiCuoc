export const MEDIA_SOURCE_TYPE = {
  FILE: 0,
  URL_DOWNLOAD: 1,
  STREAM_URL: 2,
  FREQUENCY_CHANNEL: 3,
} as const;

export const MEDIA_FILE_TYPE = {
  IMAGE: "Image",
  AUDIO: "Audio",
  VIDEO: "Video",
  LIVE_STREAM: "LiveStream",
  FREQUENCY: "Frequency",
} as const;
