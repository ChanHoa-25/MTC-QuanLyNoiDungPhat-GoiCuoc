import { useEffect, useRef, useState } from "react";
import type { Key } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

import TemplateList from "../../../components/templates/TemplateList";

import { createFacilityTemplatesMock } from "../data/facilitiesTemplates.mock";
import {
  getStoredTemplates,
  getDeletedTemplateIds,
  deleteStoredTemplates,
} from "../data/facilityTemplateStorage";

import type { FacilityTemplate } from "../types/facilityTemplate.types";
import type { Facility } from "../types/facility.types";

interface FacilityTemplatesProps {
  facility: Facility;
  selectedRowKeys: Key[];
  onSelectionChange: (keys: Key[]) => void;
  openCreate?: boolean;
  onCloseCreate?: () => void;
  deleteRequestId?: number;
  onDeleteComplete?: () => void;
}

function loadFacilityTemplates(facilityId: string): FacilityTemplate[] {
  const deletedIds = new Set(getDeletedTemplateIds(facilityId));

  const mockTemplates = createFacilityTemplatesMock(facilityId);

  const storedTemplates = getStoredTemplates().filter(
    (template) =>
      template.facilityId === facilityId && !deletedIds.has(template.id),
  );

  const convertedTemplates: FacilityTemplate[] = storedTemplates.map(
    (template) => ({
      id: template.id,
      facilityId: template.facilityId,
      name: template.name,
      aspectRatio:
        template.screenWidth && template.screenHeight
          ? `${template.screenWidth} x ${template.screenHeight}`
          : "-",
      createdAt: template.createdAt,
      createdBy: "Tuyết Nguyễn",
    }),
  );

  const storedIds = new Set(convertedTemplates.map((template) => template.id));

  const remainingMockTemplates = mockTemplates.filter(
    (template) => !storedIds.has(template.id) && !deletedIds.has(template.id),
  );

  return [...remainingMockTemplates, ...convertedTemplates];
}

function FacilityTemplates({
  facility,
  selectedRowKeys,
  onSelectionChange,
  openCreate = false,
  onCloseCreate,
  deleteRequestId = 0,
  onDeleteComplete,
}: FacilityTemplatesProps) {
  const navigate = useNavigate();

  const [templates, setTemplates] = useState<FacilityTemplate[]>(() =>
    loadFacilityTemplates(facility.id),
  );

  const handledDeleteRequestRef = useRef(deleteRequestId);

  useEffect(() => {
    setTemplates(loadFacilityTemplates(facility.id));
    handledDeleteRequestRef.current = deleteRequestId;
    // Chỉ chạy lại khi đổi cơ sở
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facility.id]);

  useEffect(() => {
    const handleTemplatesChanged = () => {
      setTemplates(loadFacilityTemplates(facility.id));
    };

    window.addEventListener("mtc-templates-changed", handleTemplatesChanged);

    window.addEventListener("focus", handleTemplatesChanged);

    return () => {
      window.removeEventListener(
        "mtc-templates-changed",
        handleTemplatesChanged,
      );

      window.removeEventListener("focus", handleTemplatesChanged);
    };
  }, [facility.id]);

  useEffect(() => {
    if (deleteRequestId === handledDeleteRequestRef.current) {
      return;
    }

    handledDeleteRequestRef.current = deleteRequestId;

    const selectedIds = new Set(selectedRowKeys);

    const idsToDelete = templates
      .filter(
        (template) =>
          template.facilityId === facility.id && selectedIds.has(template.id),
      )
      .map((template) => template.id);

    if (idsToDelete.length > 0) {
      try {
        deleteStoredTemplates(facility.id, idsToDelete);

        setTemplates(loadFacilityTemplates(facility.id));

        message.success(`Đã xóa ${idsToDelete.length} bản mẫu thành công`);
      } catch {
        message.error("Không thể xóa bản mẫu");
      }
    }

    onSelectionChange([]);
    onDeleteComplete?.();
  }, [
    deleteRequestId,
    templates,
    selectedRowKeys,
    facility.id,
    onSelectionChange,
    onDeleteComplete,
  ]);

  useEffect(() => {
    if (!openCreate) return;

    onCloseCreate?.();

    navigate(`/facilities/${facility.id}/templates/create`);
  }, [openCreate, onCloseCreate, facility.id, navigate]);

  return (
    <TemplateList
      key={facility.id}
      templates={templates}
      selectedRowKeys={selectedRowKeys}
      onSelectionChange={onSelectionChange}
      onEdit={(id) =>
        navigate(`/facilities/${facility.id}/templates/${id}/edit`)
      }
      onDetail={(id) => navigate(`/facilities/${facility.id}/templates/${id}`)}
    />
  );
}

export default FacilityTemplates;
