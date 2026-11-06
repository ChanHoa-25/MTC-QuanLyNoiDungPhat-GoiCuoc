import type {
  TemplateSource,
  TemplateLayer,
} from "../../../types/template.types";

import "./TemplatePreview.css";

interface TemplatePreviewProps {
  layers: TemplateLayer[];
  sources: TemplateSource[];
  activeLayerId: string | null;
  screenWidth: number;
  screenHeight: number;
  onSelect: (layerId: string) => void;
  presentation?: boolean;
}

function TemplatePreview({
  layers,
  sources,
  activeLayerId,
  screenWidth,
  screenHeight,
  onSelect,
  presentation = false,
}: TemplatePreviewProps) {
  const safeWidth = screenWidth > 0 ? screenWidth : 1920;
  const safeHeight = screenHeight > 0 ? screenHeight : 1080;

  return (
    <div
      className={[
        "template-preview",
        presentation ? "template-preview--presentation" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        aspectRatio: `${safeWidth} / ${safeHeight}`,
      }}>
      {layers.map((layer) => {
        const source = sources.find((item) => item.id === layer.sourceId);

        if (!source) return null;

        const style = {
          left: `${(layer.x / safeWidth) * 100}%`,
          top: `${(layer.y / safeHeight) * 100}%`,
          width: `${layer.width}%`,
          height: `${layer.height}%`,
          zIndex: layer.zIndex,
        };

        const content =
          source.type === "image" ? (
            <img src={source.url} alt={source.name} />
          ) : (
            <div className="template-preview__media">
              {source.type === "video" ? "Video" : "Âm thanh"}
              <span>{source.name}</span>
            </div>
          );

        if (presentation) {
          return (
            <div
              key={layer.id}
              className="template-preview__layer"
              style={style}>
              {content}
            </div>
          );
        }

        return (
          <button
            key={layer.id}
            type="button"
            className={[
              "template-preview__layer",
              activeLayerId === layer.id ? "is-active" : "",
            ].join(" ")}
            style={style}
            onClick={() => onSelect(layer.id)}
            title={source.name}>
            {content}
          </button>
        );
      })}

      {layers.length === 0 && (
        <div className="template-preview__empty">
          Chọn nguồn thông tin để thiết kế bản mẫu
        </div>
      )}
    </div>
  );
}

export default TemplatePreview;
