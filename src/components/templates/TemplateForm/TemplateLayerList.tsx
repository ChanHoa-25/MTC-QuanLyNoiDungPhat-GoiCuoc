import { Maximize, Minus, Volume2, VolumeX } from "lucide-react";

import type {
  TemplateSource,
  TemplateLayer,
} from "../../../types/template.types";

import "./TemplateLayerList.css";

interface TemplateLayerListProps {
  layers: TemplateLayer[];
  sources: TemplateSource[];
  activeLayerId: string | null;
  onSelect: (layerId: string) => void;
  onUpdateLayer?: (layerId: string, changes: Partial<TemplateLayer>) => void;
  disabled?: boolean;
}

function TemplateLayerList({
  layers,
  sources,
  activeLayerId,
  onSelect,
  onUpdateLayer,
  disabled = false,
}: TemplateLayerListProps) {
  const resizeLayer = (layer: TemplateLayer, amount: number) => {
    if (disabled || !onUpdateLayer) return;

    const width = Math.min(100, Math.max(10, layer.width + amount));
    const height = Math.min(100, Math.max(10, layer.height + amount));

    onUpdateLayer(layer.id, { width, height });
  };

  const toggleAudio = (layer: TemplateLayer) => {
    if (disabled || !onUpdateLayer) return;

    onUpdateLayer(layer.id, {
      hasAudio: !(layer.hasAudio ?? true),
    });
  };

  return (
    <div className="template-layer-list">
      {layers.map((layer) => {
        const source = sources.find((item) => item.id === layer.sourceId);

        if (!source) return null;

        const isActive = activeLayerId === layer.id;
        const hasAudio = layer.hasAudio ?? true;

        return (
          <div
            key={layer.id}
            className={[
              "template-layer-list__item",
              isActive ? "is-active" : "",
            ]
              .filter(Boolean)
              .join(" ")}>
            <button
              type="button"
              className="template-layer-list__select"
              onClick={() => onSelect(layer.id)}
              title={source.name}
              aria-label={`Chọn layer ${source.name}`}>
              <img src={source.thumbnail} alt={source.name} loading="lazy" />
            </button>

            <div className="template-layer-list__controls">
              <button
                type="button"
                title="Phóng to layer"
                aria-label="Phóng to layer"
                disabled={disabled}
                onClick={() => resizeLayer(layer, 10)}>
                <Maximize size={16} />
              </button>

              <button
                type="button"
                title="Thu nhỏ layer"
                aria-label="Thu nhỏ layer"
                disabled={disabled}
                onClick={() => resizeLayer(layer, -10)}>
                <Minus size={16} />
              </button>

              <button
                type="button"
                title={hasAudio ? "Tắt âm thanh" : "Bật âm thanh"}
                aria-label={hasAudio ? "Tắt âm thanh" : "Bật âm thanh"}
                aria-pressed={hasAudio}
                disabled={disabled}
                onClick={() => toggleAudio(layer)}>
                {hasAudio ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>
            </div>

            <div className="template-layer-list__badges">
              <span className="template-layer-list__badge template-layer-list__badge--folder">
                FHD
              </span>

              {source.resolution?.map((resolution, index) => (
                <span
                  key={`${resolution}-${index}`}
                  className={[
                    "template-layer-list__badge",
                    `template-layer-list__badge--${resolution.toLowerCase()}`,
                  ].join(" ")}>
                  {resolution}
                </span>
              ))}
            </div>
          </div>
        );
      })}

      {layers.length === 0 && (
        <p className="template-layer-list__empty">Chưa có nguồn thông tin</p>
      )}
    </div>
  );
}

export default TemplateLayerList;
