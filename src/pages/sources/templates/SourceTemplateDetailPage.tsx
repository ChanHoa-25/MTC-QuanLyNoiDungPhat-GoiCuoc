import { useState, useEffect, useCallback } from "react";
import type { Key } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Trash2, XCircle } from "lucide-react";
import { message } from "antd";

import AppTabs from "../../../components/common/AppTabs";
import type { AppTabItem } from "../../../components/common/AppTabs";
import AppButton from "../../../components/common/AppButton";
import { useActionPanel } from "../../../contexts/ActionPanelContext";
import SourceUsedNewsPanel from "../components/SourceUsedNewsPanel";
import type { SourceUsedNewsAction } from "../types/sourceUsedNews.types";

import type {
  SourceTemplateItem,
  TemplateUsedNewsItem,
} from "./types/sourceTemplate.types";
import { useSourceTemplatesStore } from "./data/sourceTemplates.store";
import { MOCK_TEMPLATE_USED_NEWS } from "./data/sourceTemplates.mock";
import SourceTemplateCanvas from "./components/SourceTemplateCanvas";
import DeleteTemplateModal from "./components/DeleteTemplateModal";
import "./SourceTemplateDetailPage.css";

const DETAIL_TABS: AppTabItem[] = [
  { key: "info", label: "Thông tin bản mẫu" },
  { key: "used_news", label: "Bản tin sử dụng" },
];

export default function SourceTemplateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const { setActions } = useActionPanel();
  const { getTemplateById, deleteTemplates } = useSourceTemplatesStore();

  const [activeTab, setActiveTab] = useState("info");
  const [template, setTemplate] = useState<SourceTemplateItem | null>(null);

  // Modal xóa bản mẫu
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Tab 2: Danh sách bản tin sử dụng (mock - xem sourceTemplates.mock.ts)
  const [newsList, setNewsList] = useState<TemplateUsedNewsItem[]>(MOCK_TEMPLATE_USED_NEWS);
  const [selectedNewsKeys, setSelectedNewsKeys] = useState<Key[]>([]);
  const [newsAction, setNewsAction] = useState<SourceUsedNewsAction | null>(null);

  useEffect(() => {
    if (id) {
      const found = getTemplateById(id);
      if (found) {
        setTemplate(found);
      } else {
        messageApi.error("Không tìm thấy bản mẫu!");
        navigate("/sources/templates");
      }
    }
  }, [id, getTemplateById, navigate, messageApi]);

  // Xóa bản mẫu
  const handleOpenDelete = useCallback(() => {
    if (!template) return;
    if (template.usageStatus === "in_use") {
      messageApi.error("Bản mẫu đang được sử dụng, không thể xóa!");
      return;
    }
    setDeleteModalOpen(true);
  }, [template, messageApi]);

  const handleConfirmDelete = () => {
    if (template) {
      deleteTemplates([template.id]);
      setDeleteModalOpen(false);
      messageApi.success("Đã xóa bản mẫu thành công!");
      navigate("/sources/templates");
    }
  };

  // Cấu hình ActionPanel
  useEffect(() => {
    if (activeTab === "info") {
      setActions([
        {
          key: "delete-template",
          icon: <Trash2 />,
          tooltip: "Xóa bản mẫu",
          danger: true,
          disabled: template?.usageStatus === "in_use",
          onClick: handleOpenDelete,
        },
      ]);
    } else {
      setActions([
        {
          key: "delete-news",
          icon: <Trash2 />,
          tooltip: "Xóa bản tin đã chọn",
          danger: true,
          disabled: selectedNewsKeys.length === 0,
          onClick: () => setNewsAction("delete"),
        },
        {
          key: "cancel-news",
          icon: <XCircle />,
          tooltip: "Hủy bản tin đã chọn",
          disabled: selectedNewsKeys.length === 0,
          onClick: () => setNewsAction("cancel"),
        },
      ]);
    }

    return () => setActions([]);
  }, [setActions, activeTab, template, handleOpenDelete, selectedNewsKeys.length]);

  if (!template) return null;

  return (
    <div className="source-template-detail-page">
      {contextHolder}

      {/* Tabs đầu trang */}
      <div className="detail-top-tabs">
        <AppTabs
          items={DETAIL_TABS}
          activeKey={activeTab}
          onChange={(k: string) => setActiveTab(k)}
        />
      </div>

      {/* TAB 1: THÔNG TIN BẢN MẪU */}
      {activeTab === "info" && (
        <div className="detail-info-card">
          <div className="detail-info-layout">
            {/* Cột trái */}
            <div className="detail-left-pane">
              <h2 className="detail-section-title">Chi tiết</h2>

              <div className="detail-field">
                <label className="detail-label">Tên bản mẫu</label>
                <div className="detail-value-box">{template.name}</div>
              </div>

              <div className="detail-field">
                <label className="detail-label">Tỷ lệ màn hình</label>
                <div className="detail-ratio-box">
                  <span>{template.screenHeight}</span>
                  <span>{template.screenWidth}</span>
                </div>
              </div>

              <div className="detail-field">
                <label className="detail-label">Nguồn thông tin đã gán</label>
                <div className="detail-assigned-media">
                  {template.zones.map((zone) => (
                    <div key={zone.id} className="assigned-media-card">
                      {zone.mediaThumbnail ? (
                        <img src={zone.mediaThumbnail} alt={zone.name} />
                      ) : (
                        <div className="empty-zone-thumb" />
                      )}
                      <div className="assigned-media-card__text">
                        <p>{zone.mediaTitle ?? zone.name}</p>
                        <span>{zone.widthPercent}% x {zone.heightPercent}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Cột giữa: Canvas */}
            <div className="detail-center-pane">
              <SourceTemplateCanvas
                zones={template.zones}
                activeZoneId={null}
                onSelectZone={() => { }}
                readOnly
              />

              <div className="detail-actions">
                <AppButton
                  variant="outline"
                  onClick={() => navigate("/sources/templates")}
                  width={120}
                >
                  Hủy
                </AppButton>
                {/* SRS: Chỉ cho phép chỉnh sửa khi bản mẫu Chưa sử dụng */}
                <AppButton
                  variant="primary"
                  disabled={template.usageStatus === "in_use"}
                  onClick={() => navigate(`/sources/templates/${template.id}/edit`)}
                  width={120}
                >
                  Chỉnh sửa
                </AppButton>
              </div>
            </div>

            {/* Cột phải: Layers thu nhỏ */}
            <div className="detail-right-pane">
              <div className="detail-layers-list">
                {template.zones.map((zone) => (
                  <div key={zone.id} className="detail-layer-item">
                    {zone.mediaThumbnail ? (
                      <img src={zone.mediaThumbnail} alt={zone.name} />
                    ) : (
                      <div className="empty-layer-box" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BẢN TIN SỬ DỤNG (panel dùng chung với Danh sách phát) */}
      {activeTab === "used_news" && (
        <SourceUsedNewsPanel
          title="Danh sách bản tin sử dụng bản mẫu"
          items={newsList}
          onItemsChange={setNewsList}
          selectedKeys={selectedNewsKeys}
          onSelectedKeysChange={setSelectedNewsKeys}
          pendingAction={newsAction}
          onPendingActionChange={setNewsAction}
        />
      )}

      {/* Modal xác nhận xóa template */}
      <DeleteTemplateModal
        open={deleteModalOpen}
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />

    </div>
  );
}
