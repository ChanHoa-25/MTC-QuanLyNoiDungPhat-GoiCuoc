import { useCallback, useEffect, useRef, useState } from "react";
import type { Key } from "react";
import { message } from "antd";
import { Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import TemplateList from "../../../components/templates/TemplateList";
import SourceNavigationTabs from "../components/SourceNavigationTabs";
import AppConfirmModal from "../../../components/common/AppConfirmModal";

import { useActionPanel } from "../../../contexts/ActionPanelContext";

import {
  getAllSourceTemplates,
  deleteStoredSourceTemplates,
} from "./data/sourceTemplateStorage";

import type { SourceTemplate } from "./types/sourceTemplate.types";

interface SourceTemplatesPageProps {
  selectedRowKeys?: Key[];
  onSelectionChange?: (keys: Key[]) => void;
  openCreate?: boolean;
  onCloseCreate?: () => void;
  deleteRequestId?: number;
  onDeleteComplete?: () => void;
}

function loadSourceTemplates(): SourceTemplate[] {
  return getAllSourceTemplates().map((template) => ({
    id: template.id,
    name: template.name,
    aspectRatio:
      template.screenWidth && template.screenHeight
        ? `${template.screenWidth} x ${template.screenHeight}`
        : "-",
    createdAt: template.createdAt,
    createdBy: template.createdBy,
    usageStatus: template.usageStatus,
  }));
}

function SourceTemplatesPage({
  selectedRowKeys: controlledSelectedRowKeys,
  onSelectionChange,
  openCreate = false,
  onCloseCreate,
  deleteRequestId = 0,
  onDeleteComplete,
}: SourceTemplatesPageProps) {
  const navigate = useNavigate();
  const { setActions } = useActionPanel();

  const [templates, setTemplates] =
    useState<SourceTemplate[]>(loadSourceTemplates);

  const [internalSelectedRowKeys, setInternalSelectedRowKeys] = useState<Key[]>(
    [],
  );

  const [deleteOpen, setDeleteOpen] = useState(false);

  const selectedRowKeys = controlledSelectedRowKeys ?? internalSelectedRowKeys;

  const handleSelectionChange = useCallback(
    (keys: Key[]) => {
      if (onSelectionChange) {
        onSelectionChange(keys);
      } else {
        setInternalSelectedRowKeys(keys);
      }
    },
    [onSelectionChange],
  );

  const handledDeleteRequestRef = useRef(deleteRequestId);

  // Làm mới danh sách bản mẫu
  useEffect(() => {
    const handleTemplatesChanged = () => {
      setTemplates(loadSourceTemplates());
    };

    window.addEventListener(
      "mtc-source-templates-changed",
      handleTemplatesChanged,
    );

    window.addEventListener("focus", handleTemplatesChanged);

    return () => {
      window.removeEventListener(
        "mtc-source-templates-changed",
        handleTemplatesChanged,
      );

      window.removeEventListener("focus", handleTemplatesChanged);
    };
  }, []);

  // Chỉ cho phép xóa bản mẫu chưa sử dụng
  const selectedTemplates = templates.filter((template) =>
    selectedRowKeys.includes(template.id),
  );

  const deletableTemplates = selectedTemplates.filter(
    (template) => template.usageStatus !== "in_use",
  );

  const inUseCount = selectedTemplates.length - deletableTemplates.length;

  // Thực hiện xóa bản mẫu
  const handleDelete = useCallback(() => {
    if (deletableTemplates.length === 0) {
      message.warning("Không có bản mẫu hợp lệ để xóa");
      setDeleteOpen(false);
      return;
    }

    try {
      deleteStoredSourceTemplates(
        deletableTemplates.map((template) => template.id),
      );

      setTemplates(loadSourceTemplates());
      handleSelectionChange([]);
      setDeleteOpen(false);

      message.success(`Đã xóa ${deletableTemplates.length} bản mẫu thành công`);
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "Không thể xóa bản mẫu",
      );
    }
  }, [deletableTemplates, handleSelectionChange]);

  // ActionPanel: Thêm và xóa bản mẫu
  useEffect(() => {
    setActions([
      {
        key: "add-source-template",
        icon: <Plus />,
        tooltip: "Thêm bản mẫu",
        onClick: () => navigate("/sources/templates/create"),
      },
      {
        key: "delete-source-template",
        icon: <Trash2 />,
        tooltip: "Xóa bản mẫu",
        danger: true,
        disabled: deletableTemplates.length === 0,
        onClick: () => setDeleteOpen(true),
      },
    ]);

    return () => {
      setActions([]);
    };
  }, [setActions, navigate, deletableTemplates.length]);

  // Xử lý yêu cầu xóa từ component cha
  useEffect(() => {
    if (deleteRequestId === handledDeleteRequestRef.current) {
      return;
    }

    handledDeleteRequestRef.current = deleteRequestId;

    if (deletableTemplates.length > 0) {
      setDeleteOpen(true);
    } else {
      onDeleteComplete?.();
    }
  }, [deleteRequestId, deletableTemplates.length, onDeleteComplete]);

  // Điều hướng khi có yêu cầu thêm từ component cha
  useEffect(() => {
    if (!openCreate) return;

    onCloseCreate?.();
    navigate("/sources/templates/create");
  }, [openCreate, onCloseCreate, navigate]);

  const handleEdit = (id: string) => {
    const template = templates.find((item) => item.id === id);

    if (template?.usageStatus === "in_use") {
      message.warning("Không thể chỉnh sửa bản mẫu đang sử dụng");
      return;
    }

    navigate(`/sources/templates/${id}/edit`);
  };

  const handleDetail = (id: string) => {
    navigate(`/sources/templates/${id}`);
  };

  return (
    <>
      <SourceNavigationTabs />
      <TemplateList
        templates={templates}
        selectedRowKeys={selectedRowKeys}
        onSelectionChange={handleSelectionChange}
        onEdit={handleEdit}
        onDetail={handleDetail}
        showUsageStatus
        pageSize={10}
      />

      <AppConfirmModal
        open={deleteOpen}
        type="delete"
        title="Xóa bản mẫu"
        description={
          inUseCount > 0
            ? `Bạn có chắc chắn muốn xóa ${deletableTemplates.length} bản mẫu chưa sử dụng? Có ${inUseCount} bản mẫu đang sử dụng sẽ được giữ lại.`
            : `Bạn có chắc chắn muốn xóa ${deletableTemplates.length} bản mẫu đã chọn không?`
        }
        confirmText="Xóa"
        cancelText="Hủy"
        onConfirm={() => {
          handleDelete();
          onDeleteComplete?.();
        }}
        onCancel={() => {
          setDeleteOpen(false);
          onDeleteComplete?.();
        }}
      />
    </>
  );
}

export default SourceTemplatesPage;
