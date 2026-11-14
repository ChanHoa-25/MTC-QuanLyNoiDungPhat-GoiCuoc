import { useMemo, useState } from "react";
import { Checkbox, Input } from "antd";
import { CalendarDays, Folder, Search, UserRound } from "lucide-react";

import type {
  TemplateSource,
  TemplateSourceType,
} from "../../../types/template.types";

import "./TemplateSourcePicker.css";

interface TemplateSourcePickerProps {
  sources: TemplateSource[];
  selectedIds: string[];
  disabled?: boolean;
  onToggle: (sourceId: string) => void;
}

const sourceTypes: {
  label: string;
  value: TemplateSourceType;
}[] = [
  { label: "Video", value: "video" },
  { label: "Âm thanh", value: "audio" },
  { label: "Hình ảnh", value: "image" },
];

function TemplateSourcePicker({
  sources,
  selectedIds,
  disabled = false,
  onToggle,
}: TemplateSourcePickerProps) {
  const [keyword, setKeyword] = useState("");

  const [enabledTypes, setEnabledTypes] = useState<TemplateSourceType[]>([
    "video",
    "audio",
    "image",
  ]);

  const filteredSources = useMemo(() => {
    const search = keyword.trim().toLowerCase();

    return sources.filter(
      (source) =>
        enabledTypes.includes(source.type) &&
        source.name.toLowerCase().includes(search),
    );
  }, [sources, keyword, enabledTypes]);

  const toggleType = (type: TemplateSourceType) => {
    setEnabledTypes((previous) =>
      previous.includes(type)
        ? previous.filter((item) => item !== type)
        : [...previous, type],
    );
  };

  return (
    <div className="template-source-picker">
      <Input
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
        placeholder="Nhập từ khóa"
        suffix={<Search size={18} />}
        allowClear
      />

      <div className="template-source-picker__filters">
        {sourceTypes.map((type) => (
          <Checkbox
            key={type.value}
            checked={enabledTypes.includes(type.value)}
            onChange={() => toggleType(type.value)}>
            {type.label}
          </Checkbox>
        ))}
      </div>

      <div className="template-source-picker__grid">
        {filteredSources.map((source) => {
          const selected = selectedIds.includes(source.id);

          return (
            <div
              key={source.id}
              className={[
                "template-source-picker__item",
                selected ? "is-selected" : "",
                disabled ? "is-disabled" : "",
              ]
                .filter(Boolean)
                .join(" ")}>
              <button
                type="button"
                disabled={disabled}
                className="template-source-picker__select"
                onClick={() => onToggle(source.id)}
                aria-label={`${selected ? "Bỏ chọn" : "Chọn"} ${source.name}`}
                aria-pressed={selected}>
                <div className="template-source-picker__thumbnail">
                  <img
                    src={source.thumbnail}
                    alt={source.name}
                    loading="lazy"
                  />
                </div>

                <div className="template-source-picker__info">
                  <span className="template-source-picker__name">
                    {source.name}
                  </span>

                  <div className="template-source-picker__badges">
                    <span className="template-source-picker__badge template-source-picker__badge--folder">
                      <Folder size={13} />
                      FHD
                    </span>

                    {source.resolution?.map((resolution, index) => (
                      <span
                        key={`${resolution}-${index}`}
                        className={[
                          "template-source-picker__badge",
                          `template-source-picker__badge--${resolution.toLowerCase()}`,
                        ].join(" ")}>
                        {resolution}
                      </span>
                    ))}
                  </div>

                  {(source.createdBy || source.createdAt) && (
                    <div className="template-source-picker__meta">
                      {source.createdBy && (
                        <span>
                          <UserRound size={14} />
                          <span>{source.createdBy}</span>
                        </span>
                      )}

                      {source.createdAt && (
                        <span>
                          <CalendarDays size={14} />
                          <span>{source.createdAt}</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </button>

              <span
                className="template-source-picker__checkbox"
                onClick={(event) => event.stopPropagation()}>
                <Checkbox
                  checked={selected}
                  disabled={disabled}
                  onChange={() => onToggle(source.id)}
                  aria-label={`Chọn ${source.name}`}
                />
              </span>
            </div>
          );
        })}

        {filteredSources.length === 0 && (
          <div className="template-source-picker__empty">
            Không tìm thấy nguồn thông tin
          </div>
        )}
      </div>
    </div>
  );
}

export default TemplateSourcePicker;
