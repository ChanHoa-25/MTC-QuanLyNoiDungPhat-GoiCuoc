import { useEffect, useMemo, useState } from "react";
import { Empty, message } from "antd";
import { Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import AppTabs from "../../../components/common/AppTabs";
import AppButton from "../../../components/common/AppButton";
import AppConfirmModal from "../../../components/common/AppConfirmModal";

import TemplateForm from "../../../components/templates/TemplateForm";
import TemplateUsedNews from "../../../components/templates/TemplateUsedNews/TemplateUsedNews";

import { useActionPanel } from "../../../contexts/ActionPanelContext";

import { sourceTemplateSourcesMock } from "./data/sourceTemplateSources.mock";

import {
  createSourceTemplateUsedNewsMock,
  deleteSourceTemplateUsedNews,
} from "./data/SourceTemplateUsedNews.mock";

import {
  findSourceTemplate,
  saveStoredSourceTemplate,
  deleteStoredSourceTemplates,
} from "./data/sourceTemplateStorage";

import {
  facilityNewsTypeOptions,
  facilityNewsApprovalOptions,
  facilityNewsBroadcastOptions,
  facilityNewsRepeatOptions,
} from "../../facilities/data/facilitiesPlaylistNews.mock";

import type {
  TemplateFormData,
  TemplateFormMode,
} from "../../../types/template.types";

import "./SourceTemplateFormPage.css";

interface SourceTemplateFormPageProps {
  mode: TemplateFormMode;
}

type DetailTab = "information" | "news";

const filterOptions = {
  newsTypes: facilityNewsTypeOptions,
  approvals: facilityNewsApprovalOptions,
  broadcasts: facilityNewsBroadcastOptions,
  repeats: facilityNewsRepeatOptions,
};

function SourceTemplateFormPage({ mode }: SourceTemplateFormPageProps) {
  const navigate = useNavigate();
  const { setActions } = useActionPanel();

  const { templateId } = useParams<{
    templateId: string;
  }>();

  const [activeTab, setActiveTab] = useState<DetailTab>("information");

  const [deleteOpen, setDeleteOpen] = useState(false);

  const isCreate = mode === "create";
  const isEdit = mode === "edit";
  const isView = mode === "view";

  // Lấy dữ liệu bản mẫu
  const template = useMemo(() => {
    if (isCreate || !templateId) {
      return undefined;
    }

    return findSourceTemplate(templateId);
  }, [isCreate, templateId]);

  const isInUse = template?.usageStatus === "in_use";

  // Quay lại danh sách hoặc trang chi tiết
  const handleCancel = () => {
    if (isEdit && templateId) {
      navigate(`/sources/templates/${templateId}`);
      return;
    }

    navigate("/sources/templates");
  };

  // Chuyển sang trang chỉnh sửa
  const handleEdit = () => {
    if (!templateId) return;

    if (isInUse) {
      message.warning("Không thể chỉnh sửa bản mẫu đang sử dụng");
      return;
    }

    navigate(`/sources/templates/${templateId}/edit`);
  };

  // Thêm hoặc cập nhật bản mẫu
  const handleSave = (data: TemplateFormData) => {
    try {
      if (isCreate) {
        saveStoredSourceTemplate(data);

        message.success("Thêm bản mẫu thành công");
        navigate("/sources/templates");
        return;
      }

      if (isEdit && templateId) {
        saveStoredSourceTemplate(data, templateId);

        message.success("Cập nhật bản mẫu thành công");
        navigate(`/sources/templates/${templateId}`);
      }
    } catch (error) {
      message.error(
        error instanceof Error
          ? error.message
          : isCreate
            ? "Không thể lưu bản mẫu"
            : "Không thể cập nhật bản mẫu",
      );
    }
  };

  // Xóa bản mẫu
  const handleDelete = () => {
    if (!templateId) return;

    try {
      deleteStoredSourceTemplates([templateId]);

      setDeleteOpen(false);
      message.success("Xóa bản mẫu thành công");

      navigate("/sources/templates");
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "Không thể xóa bản mẫu",
      );
    }
  };

  // ActionPanel:
  // - Không hiển thị khi thêm mới
  // - Không cho xóa bản mẫu đang sử dụng
  // - Tab Bản tin sử dụng tự quản lý ActionPanel
  useEffect(() => {
    if (!template || isInUse || (isView && activeTab === "news")) {
      setActions([]);
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
  }, [setActions, template, isInUse, isView, activeTab]);

  // Không tìm thấy bản mẫu
  if (!isCreate && !template) {
    return (
      <div className="source-template-detail__not-found">
        <Empty description="Không tìm thấy bản mẫu">
          <AppButton
            variant="outline"
            onClick={() => navigate("/sources/templates")}>
            Quay lại
          </AppButton>
        </Empty>
      </div>
    );
  }

  // Không cho chỉnh sửa bản mẫu đang sử dụng
  if (isEdit && isInUse) {
    return (
      <div className="source-template-detail__not-found">
        <Empty description="Không thể chỉnh sửa bản mẫu đang sử dụng">
          <AppButton
            variant="outline"
            onClick={() => navigate(`/sources/templates/${templateId}`)}>
            Quay lại
          </AppButton>
        </Empty>
      </div>
    );
  }

  return (
    <div className="source-template-detail">
      {/* Tab chỉ hiển thị khi xem chi tiết */}
      {isView && (
        <AppTabs
          className="source-template-detail__tabs"
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

      {/* Form thêm / sửa / xem chi tiết */}
      {(!isView || activeTab === "information") && (
        <TemplateForm
          mode={mode}
          sources={sourceTemplateSourcesMock}
          initialData={template}
          onCancel={handleCancel}
          onSave={handleSave}
          onEdit={handleEdit}
        />
      )}

      {/* Tab bản tin sử dụng */}
      {isView && activeTab === "news" && template && (
        <TemplateUsedNews
          templateId={template.id}
          loadNews={createSourceTemplateUsedNewsMock}
          deleteNews={deleteSourceTemplateUsedNews}
          filterOptions={filterOptions}
        />
      )}

      {/* Modal xác nhận xóa */}
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

export default SourceTemplateFormPage;
