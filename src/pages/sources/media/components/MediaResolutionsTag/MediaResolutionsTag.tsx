import { TvMinimalPlay } from "lucide-react";
import type { MediaResolutionItem } from "../../types/sourceMedia.types";
import "./MediaResolutionsTag.css";

interface MediaResolutionsTagProps {
  resolutions: MediaResolutionItem[];
  processingNote?: string;
}

function MediaResolutionsTag({
  resolutions,
  processingNote,
}: MediaResolutionsTagProps) {
  return (
    <div className="media-resolutions">
      <div className="media-resolutions__list">
        {resolutions.map((item) => (
          <span
            key={item.label}
            className={`media-resolutions__badge media-resolutions__badge--${item.state}`}>
            {item.state === "processing" && <TvMinimalPlay size={12} />}
            {item.label}
          </span>
        ))}
      </div>

      {processingNote && (
        <p className="media-resolutions__note">{processingNote}</p>
      )}
    </div>
  );
}

export default MediaResolutionsTag;
