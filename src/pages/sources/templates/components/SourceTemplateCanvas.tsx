import type { ChangeEvent } from "react";
import { FilePlus } from "lucide-react";
import type { TemplateZone } from "../types/sourceTemplate.types";
import AppInput from "../../../../components/common/AppInput";
import AppButton from "../../../../components/common/AppButton";
import "./SourceTemplateCanvas.css";

interface SourceTemplateCanvasProps {
  zones: TemplateZone[];
  activeZoneId: string | null;
  onSelectZone: (zoneId: string) => void;
  onUpdateActiveZone?: (updates: Partial<TemplateZone>) => void;
  onOpenAddZoneModal?: () => void;
  isCustom?: boolean;
  readOnly?: boolean;
  onPresent?: () => void;
}

export default function SourceTemplateCanvas({
  zones,
  activeZoneId,
  onSelectZone,
  onUpdateActiveZone,
  onOpenAddZoneModal,
  isCustom = false,
  readOnly = false,
  onPresent,
}: SourceTemplateCanvasProps) {
  const activeZone = zones.find((z) => z.id === activeZoneId) ?? null;

  return (
    <div className="source-template-canvas-container">
      {/* Top action bar if custom */}
      {isCustom && !readOnly && onOpenAddZoneModal && (
        <div className="source-template-canvas__top-actions">
          <AppButton
            variant="primary"
            onClick={onOpenAddZoneModal}
            width={120}
          >
            + Thêm ô
          </AppButton>
        </div>
      )}

      {/* Main Canvas Viewport */}
      <div className="source-template-canvas">
        {zones.length === 0 ? (
          <div
            className="source-template-canvas__empty"
            onClick={() => {
              if (isCustom && !readOnly && onOpenAddZoneModal) {
                onOpenAddZoneModal();
              }
            }}
          >
            <FilePlus size={48} className="empty-icon" />
            <p className="empty-title">Hãy thêm ô trên bố cục của bạn</p>
            <p className="empty-sub">Nhấn vào để thêm ô hoặc bằng nút thêm</p>
          </div>
        ) : (
          zones.map((zone) => {
            const isActive = activeZoneId === zone.id;
            return (
              <div
                key={zone.id}
                className={`source-template-canvas__zone ${
                  isActive ? "is-active" : ""
                }`}
                style={{
                  left: `${(zone.x / 1920) * 100}%`,
                  top: `${(zone.y / 1080) * 100}%`,
                  width: `${zone.widthPercent}%`,
                  height: `${zone.heightPercent}%`,
                  zIndex: zone.zIndex,
                }}
                onClick={() => onSelectZone(zone.id)}
              >
                {zone.mediaThumbnail ? (
                  <div className="zone-media-preview">
                    <img
                      src={zone.mediaThumbnail}
                      alt={zone.mediaTitle ?? zone.name}
                    />
                    <div className="zone-media-info">
                      <span>{zone.mediaTitle ?? zone.name}</span>
                    </div>
                  </div>
                ) : (
                  <div className="zone-placeholder">
                    <FilePlus size={36} color="#8c8d92" />
                    <p className="zone-placeholder__title">Chọn media của bạn</p>
                    <p className="zone-placeholder__sub">
                      Kéo thả media vào đây
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Thông số ô bên dưới Canvas (khớp ảnh Figma) */}
      <div className="source-template-canvas__params">
        <div className="param-group">
          <span className="param-label">Kích thước (%)</span>
          <div className="param-inputs">
            <AppInput
              placeholder="Chiều cao"
              value={activeZone ? String(Math.round(activeZone.heightPercent)) : ""}
              disabled={readOnly || !activeZone}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                onUpdateActiveZone?.({ heightPercent: Number(e.target.value) || 0 })
              }
              type="number"
            />
            <AppInput
              placeholder="Chiều ngang"
              value={activeZone ? String(Math.round(activeZone.widthPercent)) : ""}
              disabled={readOnly || !activeZone}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                onUpdateActiveZone?.({ widthPercent: Number(e.target.value) || 0 })
              }
              type="number"
            />
          </div>
        </div>

        <div className="param-group">
          <span className="param-label">Vị trí hiển thị (pixel)</span>
          <div className="param-inputs">
            <AppInput
              placeholder="X"
              value={activeZone ? String(activeZone.x) : ""}
              disabled={readOnly || !activeZone}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                onUpdateActiveZone?.({ x: Number(e.target.value) || 0 })
              }
              type="number"
            />
            <AppInput
              placeholder="Y"
              value={activeZone ? String(activeZone.y) : ""}
              disabled={readOnly || !activeZone}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                onUpdateActiveZone?.({ y: Number(e.target.value) || 0 })
              }
              type="number"
            />
          </div>
        </div>

        <div className="param-group param-group--zindex">
          <span className="param-label">z-index</span>
          <AppInput
            placeholder="0"
            value={activeZone ? String(activeZone.zIndex) : ""}
            disabled={readOnly || !activeZone}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onUpdateActiveZone?.({ zIndex: Number(e.target.value) || 0 })
            }
            type="number"
          />
        </div>

        {onPresent && (
          <div className="param-group--btn">
            <AppButton variant="primary" onClick={onPresent} width={130}>
              Trình chiếu
            </AppButton>
          </div>
        )}
      </div>
    </div>
  );
}
