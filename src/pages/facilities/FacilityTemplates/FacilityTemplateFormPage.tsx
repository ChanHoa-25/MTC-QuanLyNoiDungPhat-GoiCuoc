import { useEffect, useMemo, useState } from "react";
import { Empty, message } from "antd";
import { Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import AppTabs from "../../../components/common/AppTabs";
import AppButton from "../../../components/common/AppButton";
import AppConfirmModal from "../../../components/common/AppConfirmModal";

import TemplateForm from "../../../components/templates/TemplateForm";

import { useActionPanel } from "../../../contexts/ActionPanelContext";

import TemplateUsedNews from "../../../components/templates/TemplateUsedNews/TemplateUsedNews";

import { facilityTemplateSourcesMock } from "../data/facilitiesTemplateSources.mock";
import {
  createFacilityTemplateUsedNewsMock,
  deleteFacilityTemplateUsedNews,
} from "../data/facilitiesTemplateUsedNews.mock";

import {
  facilityNewsTypeOptions,
  facilityNewsApprovalOptions,
  facilityNewsBroadcastOptions,
  facilityNewsRepeatOptions,
} from "../data/facilitiesPlaylistNews.mock";

import {
  findFacilityTemplate,
  saveStoredTemplate,
  deleteStoredTemplates,
} from "../data/facilityTemplateStorage";

import type {
  TemplateFormData,
  TemplateFormMode,
} from "../../../types/template.types";

import "./FacilityTemplateFormPage.css";

interface FacilityTemplateFormPageProps {
  mode: TemplateFormMode;
}

type DetailTab = "information" | "news";

function FacilityTemplateFormPage({ mode }: FacilityTemplateFormPageProps) {
  const navigate = useNavigate();
  const { setActions } = useActionPanel();

  const { facilityId, templateId } = useParams<{
    facilityId: string;
    templateId: string;
  }>();
  const filterOptions = {
    newsTypes: facilityNewsTypeOptions,
    approvals: facilityNewsApprovalOptions,
    broadcasts: facilityNewsBroadcastOptions,
    repeats: facilityNewsRepeatOptions,
  };

  const [activeTab, setActiveTab] = useState<DetailTab>("information");
  const [deleteOpen, setDeleteOpen] = useState(false);

  const isCreate = mode === "create";
  const isEdit = mode === "edit";
  const isView = mode === "view";

  // Lấy dữ liệu khi xem hoặc chỉnh sửa
  const template = useMemo(() => {
    if (isCreate || !facilityId || !templateId) {
      return undefined;
    }

    return findFacilityTemplate(facilityId, templateId);
  }, [isCreate, facilityId, templateId]);

  // Quay lại
  const handleCancel = () => {
    if (isEdit && facilityId && templateId) {
      navigate(`/facilities/${facilityId}/templates/${templateId}`);
      return;
    }

    navigate(`/facilities/${facilityId}`);
  };

  // Chuyển sang chỉnh sửa
  const handleEdit = () => {
    if (!facilityId || !templateId) return;

    navigate(`/facilities/${facilityId}/templates/${templateId}/edit`);
  };

  // Thêm hoặc cập nhật bản mẫu
  const handleSave = (data: TemplateFormData) => {
    if (!facilityId) return;

    try {
      if (isCreate) {
        saveStoredTemplate(facilityId, data);

        message.success("Thêm bản mẫu thành công");
        navigate(`/facilities/${facilityId}`);
        return;
      }

      if (isEdit && templateId) {
        saveStoredTemplate(facilityId, data, templateId);

        message.success("Cập nhật bản mẫu thành công");
        navigate(`/facilities/${facilityId}/templates/${templateId}`);
      }
    } catch {
      message.error(
        isCreate ? "Không thể lưu bản mẫu" : "Không thể cập nhật bản mẫu",
      );
    }
  };

  // Xóa bản mẫu
  const handleDelete = () => {
    if (!facilityId || !templateId) return;

    try {
      deleteStoredTemplates(facilityId, [templateId]);

      setDeleteOpen(false);
      message.success("Xóa bản mẫu thành công");

      navigate(`/facilities/${facilityId}`);
    } catch {
      message.error("Không thể xóa bản mẫu");
    }
  };

  // ActionPanel chỉ dành cho form chỉnh sửa
  // hoặc tab Thông tin bản mẫu.
  // Tab Bản tin sử dụng tự quản lý ActionPanel.
  useEffect(() => {
    if (!template || (isView && activeTab === "news")) {
      return;
    }

    setActions([
      {
        key: "delete",
        icon: <Trash2 />,
        tooltip: "Xóa bản mẫu",
        danger: true,
        onClick: () => setDeleteOpen(true),
      },
    ]);

    return () => {
      setActions([]);
    };
  }, [setActions, template, isView, activeTab]);

  // Không tìm thấy dữ liệu
  if (!isCreate && !template) {
    return (
      <div className="facility-template-detail__not-found">
        <Empty description="Không tìm thấy bản mẫu">
          <AppButton
            variant="outline"
            onClick={() => navigate(`/facilities/${facilityId}`)}>
            Quay lại
          </AppButton>
        </Empty>
      </div>
    );
  }

  return (
    <div className="facility-template-detail">
      {/* TAB CHỈ HIỂN THỊ TRONG CHẾ ĐỘ XEM */}
      {isView && (
        <AppTabs
          className="facility-template-detail__tabs"
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as DetailTab)}
          items={[
            {
              key: "information",
              label: "Thông tin bản mẫu",
            },
            {
              key: "news",
              label: "Bản tin sử dụng",
            },
          ]}
        />
      )}

      {/* FORM THÊM / SỬA / CHI TIẾT */}
      {(!isView || activeTab === "information") && (
        <TemplateForm
          mode={mode}
          sources={facilityTemplateSourcesMock}
          initialData={template}
          onCancel={handleCancel}
          onSave={handleSave}
          onEdit={handleEdit}
        />
      )}

      {/* TAB BẢN TIN SỬ DỤNG */}
      {isView && activeTab === "news" && template && (
        <TemplateUsedNews
          templateId={template.id}
          loadNews={createFacilityTemplateUsedNewsMock}
          deleteNews={deleteFacilityTemplateUsedNews}
          filterOptions={filterOptions}
        />
      )}

      {/* MODAL XÓA BẢN MẪU */}
      <AppConfirmModal
        open={deleteOpen}
        type="delete"
        title="Xóa bản mẫu"
        description={`Bạn có chắc chắn muốn xóa bản mẫu "${template?.name ?? ""}" không?`}
        confirmText="Xóa"
        cancelText="Hủy"
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}

export default FacilityTemplateFormPage;
