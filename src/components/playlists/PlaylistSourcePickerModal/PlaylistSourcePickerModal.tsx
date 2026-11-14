import { useEffect, useMemo, useRef, useState } from "react";
import { Checkbox, Empty, Input, message } from "antd";
import { Image as ImageIcon, Play, Plus, Search, X } from "lucide-react";

import AppModal from "../../common/AppModal";
import AppButton from "../../common/AppButton";
import AppSelect from "../../common/AppSelect";

import type {
  PlaylistFormSource,
  PlaylistSourceType,
} from "../PlaylistForm/PlaylistForm";

import "./PlaylistSourcePickerModal.css";

export interface PlaylistPickableSource {
  sourceId: string;
  sourceType: PlaylistSourceType;
  name: string;
  duration: string;
  category?: string;
  mediaType?: string;
  thumbnail?: string;
  createdBy?: string;
  createdAt?: string;
}

interface PlaylistSourcePickerModalProps {
  open: boolean;
  sources: PlaylistPickableSource[];
  selectedSources: PlaylistFormSource[];
  onConfirm: (sources: PlaylistFormSource[]) => void;
  onCancel: () => void;
}

type SourceFilter = "media" | "template";
type MediaType = "video" | "audio" | "image";

const sourceTypeOptions = [
  { label: "Media", value: "media" },
  { label: "Bản mẫu", value: "template" },
];

const mediaTypeOptions = [
  { label: "Video", value: "video" },
  { label: "Âm thanh", value: "audio" },
  { label: "Hình ảnh", value: "image" },
];

const DEFAULT_MEDIA_TYPES: MediaType[] = ["video", "audio", "image"];

function getSourceKey(
  source: Pick<PlaylistPickableSource, "sourceType" | "sourceId">,
): string {
  return `${source.sourceType}-${source.sourceId}`;
}

function createEntry(source: PlaylistPickableSource): PlaylistFormSource {
  return {
    id: getSourceKey(source),
    sourceId: source.sourceId,
    sourceType: source.sourceType,
    name: source.name,
    duration: source.duration,
    thumbnail: source.thumbnail,
    mediaType: source.mediaType,
  };
}

function isValidDuration(value: string): boolean {
  const match = /^(\d+):([0-5]\d):([0-5]\d)$/.exec(value);

  return Boolean(match);
}

function formatDate(value?: string): string {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("vi-VN");
}

function getMediaLabel(source: PlaylistPickableSource) {
  if (source.sourceType === "template") {
    return "Bản mẫu";
  }

  switch (source.mediaType) {
    case "video":
      return "Video";
    case "audio":
      return "Âm thanh";
    case "image":
      return "Hình ảnh";
    default:
      return "Media";
  }
}

function PlaylistSourcePickerModal({
  open,
  sources,
  selectedSources,
  onConfirm,
  onCancel,
}: PlaylistSourcePickerModalProps) {
  const [sourceType, setSourceType] = useState<SourceFilter>("media");

  const [category, setCategory] = useState("all");

  const [mediaTypes, setMediaTypes] =
    useState<MediaType[]>(DEFAULT_MEDIA_TYPES);

  const [availableKeyword, setAvailableKeyword] = useState("");

  const [pickedKeyword, setPickedKeyword] = useState("");

  const [pickedSources, setPickedSources] = useState<PlaylistFormSource[]>([]);

  const [durationErrors, setDurationErrors] = useState<Record<string, boolean>>(
    {},
  );

  // Giữ dữ liệu ban đầu ổn định khi popup đang mở.
  const selectedSourcesRef = useRef(selectedSources);
  selectedSourcesRef.current = selectedSources;

  useEffect(() => {
    if (!open) return;

    setSourceType("media");
    setCategory("all");
    setMediaTypes(DEFAULT_MEDIA_TYPES);
    setAvailableKeyword("");
    setPickedKeyword("");
    setPickedSources([...selectedSourcesRef.current]);
    setDurationErrors({});
  }, [open]);

  const categoryOptions = useMemo(() => {
    const categories = Array.from(
      new Set(
        sources
          .filter((source) => source.sourceType === sourceType)
          .map((source) => source.category)
          .filter((value): value is string => Boolean(value)),
      ),
    );

    return [
      { label: "Tất cả", value: "all" },
      ...categories.map((value) => ({
        label: value,
        value,
      })),
    ];
  }, [sources, sourceType]);

  const availableSources = useMemo(() => {
    const pickedIds = new Set(pickedSources.map(getSourceKey));

    const keyword = availableKeyword.trim().toLowerCase();

    return sources.filter((source) => {
      if (source.sourceType !== sourceType) {
        return false;
      }

      if (pickedIds.has(getSourceKey(source))) {
        return false;
      }

      if (category !== "all" && source.category !== category) {
        return false;
      }

      if (
        sourceType === "media" &&
        (!source.mediaType ||
          !mediaTypes.includes(source.mediaType as MediaType))
      ) {
        return false;
      }

      if (keyword && !source.name.toLowerCase().includes(keyword)) {
        return false;
      }

      return true;
    });
  }, [
    sources,
    sourceType,
    category,
    mediaTypes,
    availableKeyword,
    pickedSources,
  ]);

  const filteredPickedSources = useMemo(() => {
    const keyword = pickedKeyword.trim().toLowerCase();

    if (!keyword) return pickedSources;

    return pickedSources.filter((source) =>
      source.name.toLowerCase().includes(keyword),
    );
  }, [pickedSources, pickedKeyword]);

  const handleAdd = (source: PlaylistPickableSource) => {
    const key = getSourceKey(source);

    setPickedSources((previous) => {
      if (previous.some((item) => getSourceKey(item) === key)) {
        return previous;
      }

      return [...previous, createEntry(source)];
    });
  };

  const handleRemove = (id: string) => {
    setPickedSources((previous) =>
      previous.filter((source) => source.id !== id),
    );

    setDurationErrors((previous) => {
      const updated = { ...previous };
      delete updated[id];
      return updated;
    });
  };

  const handleDurationChange = (id: string, value: string) => {
    setPickedSources((previous) =>
      previous.map((source) =>
        source.id === id ? { ...source, duration: value } : source,
      ),
    );

    setDurationErrors((previous) => ({
      ...previous,
      [id]: value !== "" && !isValidDuration(value),
    }));
  };

  const handlePreview = (source: PlaylistFormSource) => {
    message.info(`Chưa có dữ liệu phát thử cho nguồn: ${source.name}`);
  };

  const handleConfirm = () => {
    if (category === "all") {
      message.warning("Vui lòng chọn lĩnh vực");
      return;
    }

    if (pickedSources.length === 0) {
      message.warning("Vui lòng chọn ít nhất một nguồn thông tin");
      return;
    }

    const invalidSources = pickedSources.filter(
      (source) => !isValidDuration(source.duration),
    );

    if (invalidSources.length > 0) {
      const errors: Record<string, boolean> = {};

      invalidSources.forEach((source) => {
        errors[source.id] = true;
      });

      setDurationErrors(errors);

      message.warning("Thời lượng phải có định dạng HH:MM:SS");
      return;
    }

    onConfirm(pickedSources);
  };

  return (
    <AppModal
      open={open}
      onCancel={onCancel}
      width={1145}
      title="Tạo Danh sách phát"
      className="playlist-source-picker-modal">
      <div className="playlist-source-picker">
        <div className="playlist-source-picker__filters">
          <div className="playlist-source-picker__field">
            <label>Nguồn thông tin</label>

            <AppSelect
              width="100%"
              value={sourceType}
              onChange={(value) => {
                setSourceType(value as SourceFilter);
                setCategory("all");
              }}
              options={sourceTypeOptions}
            />
          </div>

          <div className="playlist-source-picker__field">
            <label>
              Lĩnh vực <span className="required">*</span>
            </label>

            <AppSelect
              width="100%"
              value={category}
              onChange={setCategory}
              options={categoryOptions}
            />
          </div>
        </div>

        {sourceType === "media" && (
          <div className="playlist-source-picker__media-types">
            <Checkbox.Group
              value={mediaTypes}
              onChange={(values) => setMediaTypes(values as MediaType[])}
              options={mediaTypeOptions}
            />
          </div>
        )}

        <div className="playlist-source-picker__content">
          <section className="playlist-source-picker__left">
            <h3>Chọn các nguồn thông tin cần thêm vào danh sách phát</h3>

            <Input
              className="playlist-source-picker__search"
              value={availableKeyword}
              onChange={(event) => setAvailableKeyword(event.target.value)}
              placeholder="Nhập tên nguồn thông tin"
              suffix={<Search size={19} />}
              allowClear
            />

            <div className="playlist-source-picker__cards">
              {availableSources.length > 0 ? (
                availableSources.map((source) => (
                  <article
                    key={getSourceKey(source)}
                    className="playlist-source-card">
                    <div className="playlist-source-card__image">
                      {source.thumbnail ? (
                        <img src={source.thumbnail} alt={source.name} />
                      ) : (
                        <div className="playlist-source-card__placeholder">
                          <ImageIcon size={36} />
                        </div>
                      )}

                      <button
                        type="button"
                        className="playlist-source-card__add"
                        title="Thêm nguồn thông tin"
                        onClick={() => handleAdd(source)}>
                        <Plus size={18} />
                      </button>

                      {source.mediaType === "video" && (
                        <span className="playlist-source-card__play">
                          <Play size={17} fill="currentColor" />
                        </span>
                      )}
                    </div>

                    <div className="playlist-source-card__body">
                      <h4 title={source.name}>{source.name}</h4>

                      <div className="playlist-source-card__meta">
                        <span>Người tạo:</span>
                        <span>{source.createdBy ?? "-"}</span>

                        <span>Ngày tạo:</span>
                        <span>{formatDate(source.createdAt)}</span>

                        <span>Loại:</span>
                        <span>{getMediaLabel(source)}</span>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="playlist-source-picker__empty">
                  <Empty description="Không có nguồn thông tin" />
                </div>
              )}
            </div>
          </section>

          <section className="playlist-source-picker__right">
            <h3>Nguồn thông tin đã chọn</h3>

            <Input
              className="playlist-source-picker__search"
              value={pickedKeyword}
              onChange={(event) => setPickedKeyword(event.target.value)}
              placeholder="Nhập tên nguồn thông tin"
              suffix={<Search size={19} />}
              allowClear
            />

            <div className="playlist-source-picker__table">
              <div className="playlist-source-picker__table-head">
                <span />
                <span>STT</span>
                <span>Tên nguồn thông tin</span>
                <span>Thời lượng</span>
                <span />
              </div>

              <div className="playlist-source-picker__table-body">
                {filteredPickedSources.length > 0 ? (
                  filteredPickedSources.map((source) => (
                    <div
                      className="playlist-source-picker__table-row"
                      key={source.id}>
                      <button
                        type="button"
                        className="playlist-source-picker__preview"
                        title="Nghe thử"
                        onClick={() => handlePreview(source)}>
                        <Play size={17} />
                      </button>

                      <span className="playlist-source-picker__order">
                        {pickedSources.findIndex(
                          (item) => item.id === source.id,
                        ) + 1}
                      </span>

                      <span
                        className="playlist-source-picker__source-name"
                        title={source.name}>
                        {source.name}
                      </span>

                      <Input
                        className={
                          durationErrors[source.id]
                            ? "playlist-source-picker__duration playlist-source-picker__duration--error"
                            : "playlist-source-picker__duration"
                        }
                        value={source.duration}
                        onChange={(event) =>
                          handleDurationChange(source.id, event.target.value)
                        }
                        placeholder="00:00:00"
                      />

                      <button
                        type="button"
                        className="playlist-source-picker__remove"
                        onClick={() => handleRemove(source.id)}>
                        Gỡ
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="playlist-source-picker__empty">
                    <Empty
                      description={
                        pickedSources.length > 0
                          ? "Không tìm thấy nguồn thông tin"
                          : "Chưa chọn nguồn thông tin"
                      }
                    />
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>

        <p className="playlist-source-picker__required-note">
          <span>*</span> là những trường thông tin bắt buộc
        </p>

        <div className="playlist-source-picker__footer">
          <AppButton variant="outline" onClick={onCancel}>
            Hủy bỏ
          </AppButton>

          <AppButton onClick={handleConfirm}>Lưu thay đổi</AppButton>
        </div>
      </div>
    </AppModal>
  );
}

export default PlaylistSourcePickerModal;
