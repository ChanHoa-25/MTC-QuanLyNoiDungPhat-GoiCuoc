import type { Site } from "../types/site.types";

export function findSiteById(sites: Site[], id: string): Site | null {
  for (const site of sites) {
    if (site.id === id) {
      return site;
    }

    const found = findSiteById(site.children ?? [], id);

    if (found) {
      return found;
    }
  }

  return null;
}

export function findSitePath(sites: Site[], targetId: string): Site[] {
  for (const site of sites) {
    if (site.id === targetId) {
      return [site];
    }

    const childPath = findSitePath(site.children ?? [], targetId);

    if (childPath.length > 0) {
      return [site, ...childPath];
    }
  }

  return [];
}
