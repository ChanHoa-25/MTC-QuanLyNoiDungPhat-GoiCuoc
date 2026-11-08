import { useState, useEffect, useMemo } from "react";
import type { ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Volume2 as SpeakerOn, VolumeX as SpeakerOff } from "lucide-react";
import { Checkbox, message, Modal } from "antd";

import AppButton from "../../../components/common/AppButton";
import AppInput from "../../../components/common/AppInput";
import AppSearch from "../../../components/common/AppSearch";
import AppTabs from "../../../components/common/AppTabs";
import type { AppTabItem } from "../../../components/common/AppTabs";

import type {
  TemplateZone,
  TemplatePresetLayout,
} from "./types/sourceTemplate.types";
import { TEMPLATE_PRESETS } from "./data/sourceTemplates.mock";
import { useSourceTemplatesStore } from "./data/sourceTemplates.store";
import { initialSourceMediaMock } from "../media/data/sourceMedia.mock";
import type { SourceMediaItem } from "../media/types/sourceMedia.types";
import SourceTemplatePresets from "./components/SourceTemplatePresets";
import SourceTemplateCanvas from "./components/SourceTemplateCanvas";
import AddZoneModal from "./components/AddZoneModal";
import "./SourceTemplateFormPage.css";

interface SourceTemplateFormPageProps {
  mode: "create" | "edit";
}

const LEFT_TAB_ITEMS: AppTabItem[] = [
  { key: "sources", label: "Nguồn thông tin" },
  { key: "layout", label: "Bố cục" },
];

export default function SourceTemplateFormPage({
  mode,
}: SourceTemplateFormPageProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [messageApi, contextHolder] = message.useMessage();
  const { getTemplateById, addTemplate, updateTemplate } =
    useSourceTemplatesStore();

  const isEdit = mode === "edit";

  // Bước 1 hoặc Bước 2 (Chỉnh sửa thì mặc định luôn vào bước 2)
  const [step, setStep] = useState<1 | 2>(isEdit ? 2 : 1);

  // Form thông tin bản mẫu
  const [name, setName] = useState("");
  const [screenHeight, setScreenHeight] = useState("1080");
  const [screenWidth, setScreenWidth] = useState("1920");
  const [duration, setDuration] = useState("00:00:00");

  // Bố cục & zones
  const [isCustom, setIsCustom] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(
    TEMPLATE_PRESETS[0].id
  );
  const [zones, setZones] = useState<TemplateZone[]>(
    TEMPLATE_PRESETS[0].zones.map((z, idx) => ({
      ...z,
      name: `Vùng ${idx + 1}`,
      hasAudio: idx === 0,
    }))
  );
  const [activeZoneId, setActiveZoneId] = useState<string | null>(
    TEMPLATE_PRESETS[0].zones[0]?.id ?? null
  );

  // Modal thêm ô mới khi tùy chỉnh
  const [addZoneModalOpen, setAddZoneModalOpen] = useState(false);

  // Trình chiếu toàn màn hình
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  // Tab bên trái ở Bước 2
  const [leftTab, setLeftTab] = useState("sources");

  // Bộ lọc media ở cột trái
  const [mediaKeyword, setMediaKeyword] = useState("");
  const [enabledMediaTypes, setEnabledMediaTypes] = useState<string[]>([
    "video",
    "audio",
    "image",
  ]);

  // Load dữ liệu khi ở chế độ chỉnh sửa
  useEffect(() => {
    if (isEdit && id) {
      const existing = getTemplateById(id);
      if (!existing) {
        messageApi.error("Không tìm thấy bản mẫu!");
        navigate("/sources/templates");
        return;
      }
      if (existing.usageStatus === "in_use") {
        messageApi.warning("Bản mẫu đang được sử dụng, không thể chỉnh sửa!");
        navigate(`/sources/templates/${id}`);
        return;
      }

      setName(existing.name);
      setScreenWidth(String(existing.screenWidth));
      setScreenHeight(String(existing.screenHeight));
      setDuration(existing.duration ?? "00:00:00");
      setZones(existing.zones);
      setActiveZoneId(existing.zones[0]?.id ?? null);
      if (existing.presetId) {
        setSelectedPresetId(existing.presetId);
        setIsCustom(false);
      } else {
        setIsCustom(true);
      }
    }
  }, [isEdit, id, getTemplateById, navigate, messageApi]);

  // Lọc kho media đã duyệt để đưa vào bản mẫu (loại bỏ media FM/tần số theo SRS)
  const approvedMediaList = useMemo(() => {
    const search = mediaKeyword.trim().toLowerCase();
    return initialSourceMediaMock.filter((media: SourceMediaItem) => {
      // Chỉ lấy media đã duyệt
      if (media.approvalStatus !== "approved") return false;
      // Lọc theo loại
      if (!enabledMediaTypes.includes(media.type)) return false;
      // Tìm kiếm
      if (search && !media.title.toLowerCase().includes(search)) return false;
      return true;
    });
  }, [mediaKeyword, enabledMediaTypes]);

  // Xử lý chọn preset
  const handleSelectPreset = (preset: TemplatePresetLayout) => {
    setIsCustom(false);
    setSelectedPresetId(preset.id);
    const newZones: TemplateZone[] = preset.zones.map((z, idx) => ({
      ...z,
      name: `Vùng ${idx + 1}`,
      hasAudio: idx === 0,
    }));
    setZones(newZones);
    setActiveZoneId(newZones[0]?.id ?? null);
  };

  const handleSelectCustom = () => {
    setIsCustom(true);
    setSelectedPresetId(null);
  };

  // Thêm ô mới khi tùy chỉnh
  const handleAddZone = (widthPercent: number, heightPercent: number) => {
    const newZone: TemplateZone = {
      id: `zone-${Date.now()}`,
      name: `Vùng ${zones.length + 1}`,
      x: 0,
      y: 0,
      widthPercent,
      heightPercent,
      zIndex: zones.length + 1,
      hasAudio: zones.length === 0,
    };
    const nextZones = [...zones, newZone];
    setZones(nextZones);
    setActiveZoneId(newZone.id);
  };

  // Gán media vào ô đang chọn
  const handleAssignMedia = (media: SourceMediaItem) => {
    if (!activeZoneId) {
      messageApi.warning("Vui lòng nhấp chọn một ô trên màn hình trước!");
      return;
    }

    setZones((prev) =>
      prev.map((z) => {
        if (z.id === activeZoneId) {
          return {
            ...z,
            mediaId: media.id,
            mediaTitle: media.title,
            mediaThumbnail: media.thumbnail,
            mediaType: media.type,
          };
        }
        return z;
      })
    );
    messageApi.success(`Đã gán "${media.title}" vào ô đang chọn!`);
  };

  // Bật/tắt âm thanh cho layer
  const handleToggleAudio = (zoneId: string) => {
    setZones((prev) =>
      prev.map((z) => ({
        ...z,
        hasAudio: z.id === zoneId ? !z.hasAudio : false, // chỉ cho 1 zone phát tiếng
      }))
    );
  };

  // Cập nhật thông số ô active
  const handleUpdateActiveZone = (updates: Partial<TemplateZone>) => {
    if (!activeZoneId) return;
    setZones((prev) =>
      prev.map((z) => (z.id === activeZoneId ? { ...z, ...updates } : z))
    );
  };

  // Chuyển sang Bước 2
  const handleGoToStep2 = () => {
    if (!name.trim()) {
      messageApi.error("Vui lòng nhập tên bản mẫu!");
      return;
    }
    if (!screenWidth || !screenHeight) {
      messageApi.error("Vui lòng nhập tỷ lệ màn hình!");
      return;
    }
    setStep(2);
  };

  // Lưu bản mẫu
  const handleSave = () => {
    if (!name.trim()) {
      messageApi.error("Vui lòng nhập tên bản mẫu!");
      return;
    }

    const payload = {
      name: name.trim(),
      screenWidth: Number(screenWidth) || 1920,
      screenHeight: Number(screenHeight) || 1080,
      aspectRatio: `${screenWidth} x ${screenHeight}`,
      duration: duration || "00:00:00",
      presetId: isCustom ? undefined : selectedPresetId ?? undefined,
      zones,
    };

    if (isEdit && id) {
      updateTemplate(id, payload);
      messageApi.success("Cập nhật bản mẫu thành công!");
    } else {
      addTemplate(payload);
      messageApi.success("Thêm mới bản mẫu thành công!");
    }

    setTimeout(() => {
      navigate("/sources/templates");
    }, 600);
  };

  return (
    <div className="source-template-form-page">
      {contextHolder}

      {/* ========================================================
          BƯỚC 1: KHỞI TẠO THÔNG TIN & CHỌN BỐ CỤC (khớp ảnh image 031751)
         ======================================================== */}
      {step === 1 && (
        <div className="step1-card">
          <h1 className="step1-card__title">Thêm mới</h1>

          <div className="step1-card__form">
            <div className="step1-row">
              <div className="step1-field">
                <label className="step1-label">
                  Tên bản mẫu<span className="req">*</span>
                </label>
                <AppInput
                  placeholder="Nhập tại đây"
                  value={name}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                  style={{ width: "100%", maxWidth: 360 }}
                />
              </div>

              <div className="step1-field">
                <label className="step1-label">
                  Tỷ lệ màn hình<span className="req">*</span>
                </label>
                <div className="step1-ratio-inputs">
                  <AppInput
                    placeholder="Chiều cao"
                    value={screenHeight}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setScreenHeight(e.target.value)}
                    type="number"
                  />
                  <AppInput
                    placeholder="Chiều ngang"
                    value={screenWidth}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setScreenWidth(e.target.value)}
                    type="number"
                  />
                </div>
              </div>
            </div>

            <div className="step1-layout-section">
              <label className="step1-label">Bố cục</label>
              <SourceTemplatePresets
                selectedPresetId={selectedPresetId}
                isCustom={isCustom}
                onSelectPreset={handleSelectPreset}
                onSelectCustom={handleSelectCustom}
              />
            </div>

            <div className="step1-actions">
              <AppButton
                variant="outline"
                onClick={() => navigate("/sources/templates")}
                width={120}
              >
                Hủy
              </AppButton>
              <AppButton variant="primary" onClick={handleGoToStep2} width={120}>
                Tiếp theo
              </AppButton>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          BƯỚC 2: THIẾT KẾ BẢN MẪU & GÁN MEDIA (khớp ảnh image 031847)
         ======================================================== */}
      {step === 2 && (
        <div className="step2-container">
          {/* Subheader */}
          <div className="step2-header">
            <div className="step2-header__left">
              {!isEdit && (
                <button
                  type="button"
                  className="step2-back-btn"
                  onClick={() => setStep(1)}
                >
                  <ArrowLeft size={18} /> Thiết kế
                </button>
              )}
            </div>

            <div className="step2-header__right">
              <div className="step2-badge-name">{name || "Bản mẫu"}</div>
              <div className="step2-badge-ratio">
                {screenWidth} : {screenHeight}
              </div>
              <AppButton variant="primary" onClick={handleSave} width={120}>
                Lưu
              </AppButton>
            </div>
          </div>

          {/* 3 Cột chính: Cột trái (Nguồn/Bố cục), Giữa (Canvas), Phải (Layers) */}
          <div className="step2-workspace">
            {/* Cột trái */}
            <div className="step2-left-pane">
              <div className="left-duration">
                <span className="left-duration__label">Thời lượng</span>
                <AppInput
                  value={duration}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setDuration(e.target.value)}
                  placeholder="00:00:00"
                />
              </div>

              <AppTabs
                items={LEFT_TAB_ITEMS}
                activeKey={leftTab}
                onChange={(k: string) => setLeftTab(k)}
              />

              {leftTab === "sources" ? (
                <div className="left-sources-tab">
                  <AppSearch
                    placeholder="Nhập từ khóa"
                    value={mediaKeyword}
                    onChange={(val: string) => setMediaKeyword(val)}
                    width="100%"
                    style={{ marginBottom: 12 }}
                  />

                  <div className="left-sources-filter">
                    <Checkbox
                      checked={enabledMediaTypes.includes("video")}
                      onChange={(e) =>
                        setEnabledMediaTypes((prev) =>
                          e.target.checked
                            ? [...prev, "video"]
                            : prev.filter((t) => t !== "video")
                        )
                      }
                    >
                      Video
                    </Checkbox>
                    <Checkbox
                      checked={enabledMediaTypes.includes("audio")}
                      onChange={(e) =>
                        setEnabledMediaTypes((prev) =>
                          e.target.checked
                            ? [...prev, "audio"]
                            : prev.filter((t) => t !== "audio")
                        )
                      }
                    >
                      Âm thanh
                    </Checkbox>
                    <Checkbox
                      checked={enabledMediaTypes.includes("image")}
                      onChange={(e) =>
                        setEnabledMediaTypes((prev) =>
                          e.target.checked
                            ? [...prev, "image"]
                            : prev.filter((t) => t !== "image")
                        )
                      }
                    >
                      Hình ảnh
                    </Checkbox>
                  </div>

                  <div className="left-media-grid">
                    {approvedMediaList.map((media: SourceMediaItem) => (
                      <div
                        key={media.id}
                        className="left-media-card"
                        onClick={() => handleAssignMedia(media)}
                        title={`Click để gán vào ô: ${media.title}`}
                      >
                        <img src={media.thumbnail} alt={media.title} />
                        <div className="left-media-card__body">
                          <p className="card-title">{media.title}</p>
                          <span className="card-type">{media.type}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="left-layout-tab">
                  <SourceTemplatePresets
                    selectedPresetId={selectedPresetId}
                    isCustom={isCustom}
                    onSelectPreset={handleSelectPreset}
                    onSelectCustom={handleSelectCustom}
                  />
                </div>
              )}
            </div>

            {/* Giữa: Canvas Viewport */}
            <div className="step2-center-pane">
              <SourceTemplateCanvas
                zones={zones}
                activeZoneId={activeZoneId}
                onSelectZone={(zid) => setActiveZoneId(zid)}
                onUpdateActiveZone={handleUpdateActiveZone}
                onOpenAddZoneModal={() => setAddZoneModalOpen(true)}
                isCustom={isCustom}
                onPresent={() => setPreviewModalOpen(true)}
              />

              <div className="step2-bottom-actions">
                <AppButton
                  variant="outline"
                  onClick={() => navigate("/sources/templates")}
                  width={120}
                >
                  Hủy
                </AppButton>
                <AppButton variant="primary" onClick={handleSave} width={120}>
                  Lưu
                </AppButton>
              </div>
            </div>

            {/* Cột phải: Layers thu nhỏ & âm thanh */}
            <div className="step2-right-pane">
              <div className="right-layers-list">
                {zones.map((zone) => (
                  <div
                    key={zone.id}
                    className={`right-layer-item ${activeZoneId === zone.id ? "is-active" : ""
                      }`}
                    onClick={() => setActiveZoneId(zone.id)}
                  >
                    <div className="right-layer-thumb">
                      {zone.mediaThumbnail ? (
                        <img src={zone.mediaThumbnail} alt={zone.name} />
                      ) : (
                        <div className="right-layer-empty" />
                      )}
                    </div>
                    <button
                      type="button"
                      className={`layer-sound-btn ${zone.hasAudio ? "has-sound" : ""
                        }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleAudio(zone.id);
                      }}
                      title={
                        zone.hasAudio
                          ? "Đang phát âm thanh"
                          : "Bấm để bật âm thanh"
                      }
                    >
                      {zone.hasAudio ? (
                        <SpeakerOn size={16} />
                      ) : (
                        <SpeakerOff size={16} />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Thêm ô mới */}
      <AddZoneModal
        open={addZoneModalOpen}
        onCancel={() => setAddZoneModalOpen(false)}
        onConfirm={handleAddZone}
      />

      {/* Modal Trình chiếu xem thử */}
      <Modal
        open={previewModalOpen}
        onCancel={() => setPreviewModalOpen(false)}
        footer={null}
        width={960}
        centered
        title={`Xem thử bản mẫu: ${name}`}
      >
        <div style={{ marginTop: 16 }}>
          <SourceTemplateCanvas
            zones={zones}
            activeZoneId={null}
            onSelectZone={() => { }}
            readOnly
          />
        </div>
      </Modal>
    </div>
  );
}
