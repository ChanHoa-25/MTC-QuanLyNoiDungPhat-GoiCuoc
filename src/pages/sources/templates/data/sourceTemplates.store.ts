import { useCallback, useEffect, useState } from "react";

import type { TemplateFormData } from "../../../../types/template.types";
import type { StoredSourceTemplate } from "../types/sourceTemplate.types";

import {
  getAllSourceTemplates,
  findSourceTemplate,
  saveStoredSourceTemplate,
  deleteStoredSourceTemplates,
} from "./sourceTemplateStorage";

type SourceTemplateUpdates = Partial<TemplateFormData>;

function loadTemplates(): StoredSourceTemplate[] {
  return getAllSourceTemplates();
}

export function useSourceTemplatesStore() {
  const [templates, setTemplates] =
    useState<StoredSourceTemplate[]>(loadTemplates);

  const refreshTemplates = useCallback(() => {
    setTemplates(loadTemplates());
  }, []);

  useEffect(() => {
    window.addEventListener("mtc-source-templates-changed", refreshTemplates);

    window.addEventListener("focus", refreshTemplates);

    return () => {
      window.removeEventListener(
        "mtc-source-templates-changed",
        refreshTemplates,
      );

      window.removeEventListener("focus", refreshTemplates);
    };
  }, [refreshTemplates]);

  const subscribe = useCallback(() => {
    refreshTemplates();

    return () => {};
  }, [refreshTemplates]);

  const getTemplateById = useCallback((id: string) => {
    return findSourceTemplate(id) ?? null;
  }, []);

  const addTemplate = useCallback(
    (data: TemplateFormData) => {
      const template = saveStoredSourceTemplate(data);
      refreshTemplates();
      return template;
    },
    [refreshTemplates],
  );

  const updateTemplate = useCallback(
    (id: string, updates: SourceTemplateUpdates) => {
      const existing = findSourceTemplate(id);

      if (!existing) {
        throw new Error("Không tìm thấy bản mẫu");
      }

      const data: TemplateFormData = {
        name: updates.name ?? existing.name,
        screenWidth: updates.screenWidth ?? existing.screenWidth,
        screenHeight: updates.screenHeight ?? existing.screenHeight,
        duration: updates.duration ?? existing.duration,
        layers: updates.layers ?? existing.layers,
      };

      const template = saveStoredSourceTemplate(data, id);
      refreshTemplates();

      return template;
    },
    [refreshTemplates],
  );

  const deleteTemplates = useCallback(
    (ids: string[]) => {
      deleteStoredSourceTemplates(ids);
      refreshTemplates();
    },
    [refreshTemplates],
  );

  return {
    templates,
    subscribe,
    getTemplateById,
    addTemplate,
    updateTemplate,
    deleteTemplates,
  };
}
