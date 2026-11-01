import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { sitesMock } from "../pages/sites/data/sites.mock";
import type { Site } from "../pages/sites/types/site.types";
import { findSiteById, findSitePath } from "../pages/sites/utils/site.utils";

interface SiteContextType {
  sites: Site[];
  setSites: (sites: Site[]) => void;

  selectedSiteId: string | null;
  setSelectedSiteId: (id: string | null) => void;

  selectedSite: Site | null;
  selectedSitePath: Site[];

  // Xóa cơ sở
  deleteSite: (id: string) => void;
}

const SiteContext = createContext<SiteContextType | undefined>(undefined);

interface SiteProviderProps {
  children: ReactNode;
}

// Xóa cơ sở khỏi cây, bao gồm các cơ sở trực thuộc
function removeSiteFromTree(sites: Site[], siteId: string): Site[] {
  return sites
    .filter((site) => site.id !== siteId)
    .map((site) => ({
      ...site,
      children: site.children
        ? removeSiteFromTree(site.children, siteId)
        : site.children,
    }));
}

export function SiteProvider({ children }: SiteProviderProps) {
  const [sites, setSites] = useState<Site[]>(sitesMock);

  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(
    sitesMock[0]?.id ?? null,
  );

  // Cơ sở đang được chọn
  const selectedSite = useMemo(() => {
    if (!selectedSiteId) {
      return null;
    }

    return findSiteById(sites, selectedSiteId);
  }, [sites, selectedSiteId]);

  // Đường dẫn cơ sở đang được chọn
  const selectedSitePath = useMemo(() => {
    if (!selectedSiteId) {
      return [];
    }

    return findSitePath(sites, selectedSiteId);
  }, [sites, selectedSiteId]);

  // Xóa cơ sở
  const deleteSite = (id: string) => {
    const nextSites = removeSiteFromTree(sites, id);

    setSites(nextSites);

    // Nếu cơ sở đang chọn bị xóa, kể cả do xóa cơ sở cha,
    // chuyển sang cơ sở đầu tiên còn lại.
    if (selectedSiteId && !findSiteById(nextSites, selectedSiteId)) {
      setSelectedSiteId(nextSites[0]?.id ?? null);
    }
  };

  return (
    <SiteContext.Provider
      value={{
        sites,
        setSites,
        selectedSiteId,
        setSelectedSiteId,
        selectedSite,
        selectedSitePath,
        deleteSite,
      }}>
      {children}
    </SiteContext.Provider>
  );
}

export function useSiteContext() {
  const context = useContext(SiteContext);

  if (!context) {
    throw new Error("useSiteContext phải được sử dụng trong SiteProvider");
  }

  return context;
}
