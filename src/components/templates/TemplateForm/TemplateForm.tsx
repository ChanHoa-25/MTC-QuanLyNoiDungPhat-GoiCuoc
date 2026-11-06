import { useEffect, useMemo, useState } from "react";
import { Form, Input, InputNumber, message } from "antd";

import AppButton from "../../common/AppButton";
import AppModal from "../../common/AppModal";

import TemplateSourcePicker from "./TemplateSourcePicker";
import TemplatePreview from "./TemplatePreview";
import TemplateLayerList from "./TemplateLayerList";

import type {
  TemplateSource,
  TemplateFormData,
  TemplateFormMode,
  TemplateLayer,
} from "../../../types/template.types";

import "./TemplateForm.css";

interface TemplateFormProps {
  mode: TemplateFormMode;
  sources: TemplateSource[];
  initialData?: TemplateFormData;
  onCancel: () => void;
  onSave?: (data: TemplateFormData) => void;
  onEdit?: () => void;
}

const emptyData: TemplateFormData = {
  name: "",
  screenHeight: null,
  screenWidth: null,
  duration: "00:00:00",
  layers: [],
};

function TemplateForm({
  mode,
  sources,
  initialData,
  onCancel,
  onSave,
  onEdit,
}: TemplateFormProps) {
  const isView = mode === "view";
  const isCreate = mode === "create";

  const [form] = Form.useForm<TemplateFormData>();

  const [layers, setLayers] = useState<TemplateLayer[]>([]);
  const [activeLayerId, setActiveLayerId] = useState<string | null>(null);
  const [isPresenting, setIsPresenting] = useState(false);

  const screenWidth = Form.useWatch("screenWidth", form);
  const screenHeight = Form.useWatch("screenHeight", form);

  const previewWidth = Number(screenWidth) || 1920;
  const previewHeight = Number(screenHeight) || 1080;

  // Khởi tạo dữ liệu khi thêm, sửa hoặc xem chi tiết
  useEffect(() => {
    const data = initialData ?? emptyData;

    form.setFieldsValue({
      name: data.name,
      screenWidth: data.screenWidth,
      screenHeight: data.screenHeight,
      duration: data.duration,
    });

    setLayers(data.layers.map((layer) => ({ ...layer })));
    setActiveLayerId(data.layers[0]?.id ?? null);
  }, [initialData, form]);

  // Danh sách ID nguồn thông tin đã chọn
  const selectedIds = useMemo(
    () => layers.map((layer) => layer.sourceId),
    [layers],
  );

  // Layer đang được chọn
  const activeLayer = layers.find((layer) => layer.id === activeLayerId);

  // Thêm hoặc bỏ nguồn thông tin
  const toggleSource = (sourceId: string) => {
    if (isView) return;

    const existing = layers.find((layer) => layer.sourceId === sourceId);

    // Nếu đã tồn tại thì xóa layer
    if (existing) {
      const nextLayers = layers.filter((layer) => layer.sourceId !== sourceId);

      setLayers(nextLayers);

      if (activeLayerId === existing.id) {
        setActiveLayerId(nextLayers[0]?.id ?? null);
      }

      return;
    }

    // Nếu chưa tồn tại thì thêm layer mới
    const newLayer: TemplateLayer = {
      id: crypto.randomUUID(),
      sourceId,
      width: 100,
      height: 100,
      x: 0,
      y: 0,
      zIndex: layers.length + 1,
    };

    setLayers((previous) => [...previous, newLayer]);
    setActiveLayerId(newLayer.id);
  };

  // Cập nhật thuộc tính của layer đang chọn
  const updateActiveLayer = (
    field: keyof Omit<TemplateLayer, "id" | "sourceId">,
    value: number | null,
  ) => {
    if (isView || !activeLayer || value === null) return;

    setLayers((previous) =>
      previous.map((layer) =>
        layer.id === activeLayerId ? { ...layer, [field]: value } : layer,
      ),
    );
  };

  // Mở chế độ trình chiếu
  const handlePresent = () => {
    if (layers.length === 0) {
      message.warning("Vui lòng chọn ít nhất một nguồn thông tin");
      return;
    }

    setIsPresenting(true);
  };

  // Lưu dữ liệu bản mẫu
  const handleSave = async () => {
    if (isView) return;

    try {
      const values = await form.validateFields();

      if (layers.length === 0) {
        message.warning("Vui lòng chọn ít nhất một nguồn thông tin");
        return;
      }

      onSave?.({
        name: values.name.trim(),
        screenHeight: values.screenHeight ?? null,
        screenWidth: values.screenWidth ?? null,
        duration: values.duration ?? "00:00:00",
        layers,
      });
    } catch {
      // Ant Design tự hiển thị lỗi validation.
    }
  };

  return (
    <div className="template-form">
      {/* SIDEBAR - THÔNG TIN BẢN MẪU */}
      <section className="template-form__sidebar">
        <h2>{isCreate ? "Thêm mới" : isView ? "Chi tiết" : "Chỉnh sửa"}</h2>

        <Form form={form} layout="vertical" className="template-form__fields">
          {/* Tên bản mẫu */}
          <Form.Item
            label="Tên bản mẫu"
            name="name"
            rules={[
              {
                required: true,
                whitespace: true,
                message: "Vui lòng nhập tên bản mẫu",
              },
            ]}>
            <Input
              placeholder="Nhập tại đây"
              disabled={isView}
              maxLength={200}
            />
          </Form.Item>

          {/* Tỷ lệ màn hình */}
          <div className="template-form__field-group">
            <label>Tỷ lệ màn hình</label>

            <div className="template-form__two-inputs">
              <Form.Item name="screenHeight">
                <InputNumber
                  min={1}
                  placeholder="Chiều cao"
                  disabled={isView}
                  controls={false}
                />
              </Form.Item>

              <Form.Item name="screenWidth">
                <InputNumber
                  min={1}
                  placeholder="Chiều ngang"
                  disabled={isView}
                  controls={false}
                />
              </Form.Item>
            </div>
          </div>

          {/* Thời lượng */}
          {isCreate && (
            <Form.Item
              label="Thời lượng"
              name="duration"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập thời lượng",
                },
                {
                  pattern: /^([0-9]{2,}):[0-5][0-9]:[0-5][0-9]$/,
                  message: "Định dạng phải là HH:mm:ss",
                },
              ]}>
              <Input placeholder="00:00:00" />
            </Form.Item>
          )}
        </Form>

        {/* Ghi chú trường bắt buộc */}
        {isCreate && (
          <p className="template-form__required-note">
            <span>*</span> là những trường thông tin bắt buộc
          </p>
        )}

        {/* Danh sách nguồn thông tin */}
        <div className="template-form__sources">
          <h3>Nguồn thông tin</h3>

          <TemplateSourcePicker
            sources={sources}
            selectedIds={selectedIds}
            disabled={isView}
            onToggle={toggleSource}
          />
        </div>
      </section>

      {/* WORKSPACE */}
      <section className="template-form__workspace">
        <div className="template-form__design">
          {/* CỘT TRÁI - PREVIEW VÀ THUỘC TÍNH */}
          <div className="template-form__editor">
            <TemplatePreview
              layers={layers}
              sources={sources}
              activeLayerId={activeLayerId}
              screenWidth={previewWidth}
              screenHeight={previewHeight}
              onSelect={setActiveLayerId}
            />

            {/* THUỘC TÍNH LAYER */}
            <div className="template-form__properties">
              {/* Kích thước (%) */}
              <div className="template-form__property-group">
                <label>Kích thước (%)</label>

                <div className="template-form__two-inputs">
                  <InputNumber
                    placeholder="Chiều cao"
                    min={1}
                    max={100}
                    controls={false}
                    disabled={isView || !activeLayer}
                    value={activeLayer?.height}
                    onChange={(value) => updateActiveLayer("height", value)}
                  />

                  <InputNumber
                    placeholder="Chiều ngang"
                    min={1}
                    max={100}
                    controls={false}
                    disabled={isView || !activeLayer}
                    value={activeLayer?.width}
                    onChange={(value) => updateActiveLayer("width", value)}
                  />
                </div>
              </div>

              {/* Vị trí hiển thị */}
              <div className="template-form__property-group">
                <label>Vị trí hiển thị (pixel)</label>

                <div className="template-form__two-inputs">
                  <InputNumber
                    min={0}
                    controls={false}
                    placeholder="0"
                    disabled={isView || !activeLayer}
                    value={activeLayer?.x}
                    onChange={(value) => updateActiveLayer("x", value)}
                  />

                  <InputNumber
                    min={0}
                    controls={false}
                    placeholder="0"
                    disabled={isView || !activeLayer}
                    value={activeLayer?.y}
                    onChange={(value) => updateActiveLayer("y", value)}
                  />
                </div>
              </div>

              {/* z-index */}
              <div className="template-form__property-group">
                <label>z-index</label>

                <InputNumber
                  min={0}
                  controls={false}
                  placeholder="0"
                  disabled={isView || !activeLayer}
                  value={activeLayer?.zIndex}
                  onChange={(value) => updateActiveLayer("zIndex", value)}
                />
              </div>

              {/* Nút trình chiếu - chỉ hiển thị khi thêm mới */}
              {isCreate && (
                <div className="template-form__present-action">
                  <AppButton
                    variant="primary"
                    width="100%"
                    onClick={handlePresent}>
                    Trình chiếu
                  </AppButton>
                </div>
              )}
            </div>
          </div>

          {/* CỘT PHẢI - DANH SÁCH LAYER */}
          <TemplateLayerList
            layers={layers}
            sources={sources}
            activeLayerId={activeLayerId}
            onSelect={setActiveLayerId}
          />
        </div>

        {/* NÚT CHỨC NĂNG */}
        <div className="template-form__actions">
          <AppButton variant="outline" width={136} onClick={onCancel}>
            Hủy
          </AppButton>

          {isView ? (
            <AppButton variant="primary" width={158} onClick={onEdit}>
              Chỉnh sửa
            </AppButton>
          ) : (
            <AppButton variant="primary" width={158} onClick={handleSave}>
              Lưu
            </AppButton>
          )}
        </div>
      </section>

      {/* MODAL TRÌNH CHIẾU */}
      <AppModal
        open={isPresenting}
        onCancel={() => setIsPresenting(false)}
        footer={null}
        width="90vw"
        centered
        className="template-form__presentation-modal">
        <div className="template-form__presentation">
          <TemplatePreview
            layers={layers}
            sources={sources}
            activeLayerId={null}
            screenWidth={previewWidth}
            screenHeight={previewHeight}
            onSelect={() => {}}
            presentation
          />
        </div>
      </AppModal>
    </div>
  );
}

export default TemplateForm;
