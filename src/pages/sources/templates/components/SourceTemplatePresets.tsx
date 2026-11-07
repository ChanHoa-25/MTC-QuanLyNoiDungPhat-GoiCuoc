import type { TemplatePresetLayout } from "../types/sourceTemplate.types";
import { TEMPLATE_PRESETS } from "../data/sourceTemplates.mock";
import "./SourceTemplatePresets.css";

interface SourceTemplatePresetsProps {
  selectedPresetId: string | null;
  isCustom: boolean;
  onSelectPreset: (preset: TemplatePresetLayout) => void;
  onSelectCustom: () => void;
}

export default function SourceTemplatePresets({
  selectedPresetId,
  isCustom,
  onSelectPreset,
  onSelectCustom,
}: SourceTemplatePresetsProps) {
  return (
    <div className="source-template-presets">
      <div className="source-template-presets__grid">
        {/* Nút Tùy chỉnh */}
        <button
          type="button"
          className={`preset-btn preset-btn--custom ${isCustom ? "is-active" : ""}`}
          onClick={onSelectCustom}
        >
          <span>Tùy chỉnh</span>
        </button>

        {/* Các preset mẫu */}
        {TEMPLATE_PRESETS.map((preset) => {
          const isActive = !isCustom && selectedPresetId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              className={`preset-btn ${isActive ? "is-active" : ""}`}
              onClick={() => onSelectPreset(preset)}
              title={preset.name}
            >
              <div className="preset-preview">
                {preset.zones.map((zone) => (
                  <div
                    key={zone.id}
                    className="preset-preview__zone"
                    style={{
                      left: `${(zone.x / 1920) * 100}%`,
                      top: `${(zone.y / 1080) * 100}%`,
                      width: `${zone.widthPercent}%`,
                      height: `${zone.heightPercent}%`,
                    }}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
