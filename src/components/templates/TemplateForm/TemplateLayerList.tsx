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
}

function TemplateLayerList({
  layers,
  sources,
  activeLayerId,
  onSelect,
}: TemplateLayerListProps) {
  return (
    <div className="template-layer-list">
      {layers.map((layer) => {
        const source = sources.find((item) => item.id === layer.sourceId);

        if (!source) return null;

        return (
          <button
            key={layer.id}
            type="button"
            className={[
              "template-layer-list__item",
              activeLayerId === layer.id ? "is-active" : "",
            ].join(" ")}
            onClick={() => onSelect(layer.id)}
            title={source.name}>
            <img src={source.thumbnail} alt={source.name} />
          </button>
        );
      })}

      {layers.length === 0 && (
        <p className="template-layer-list__empty">Chưa có nguồn thông tin</p>
      )}
    </div>
  );
}

export default TemplateLayerList;
