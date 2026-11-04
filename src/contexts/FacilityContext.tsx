import { createContext, useContext, useMemo, useState } from "react";

import type { ReactNode } from "react";

import { facilitiesMock } from "../pages/facilities/data/facilities.mock";

import type {
  Facility,
  FacilityFormValues,
} from "../pages/facilities/types/facility.types";

import {
  findFacilityById,
  findFacilityPath,
} from "../pages/facilities/utils/facility.utils";

interface FacilityContextType {
  facilities: Facility[];
  setFacilities: (facilities: Facility[]) => void;

  selectedFacilityId: string | null;
  setSelectedFacilityId: (id: string | null) => void;

  selectedFacility: Facility | null;
  selectedFacilityPath: Facility[];

  addFacility: (parentId: string, values: FacilityFormValues) => void;

  updateFacility: (id: string, values: FacilityFormValues) => void;

  deleteFacility: (id: string) => void;
}

const FacilityContext = createContext<FacilityContextType | undefined>(
  undefined,
);

interface FacilityProviderProps {
  children: ReactNode;
}

function addFacilityToTree(
  facilities: Facility[],
  parentId: string,
  newFacility: Facility,
): Facility[] {
  return facilities.map((facility) => {
    if (facility.id === parentId) {
      return {
        ...facility,
        children: [...(facility.children ?? []), newFacility],
      };
    }

    if (facility.children?.length) {
      return {
        ...facility,
        children: addFacilityToTree(facility.children, parentId, newFacility),
      };
    }

    return facility;
  });
}

function updateFacilityInTree(
  facilities: Facility[],
  id: string,
  values: FacilityFormValues,
): Facility[] {
  return facilities.map((facility) => {
    if (facility.id === id) {
      return {
        ...facility,
        facilityCode: values.facilityCode,
        facilityName: values.facilityName,
        isActive: values.isActive,
      };
    }

    if (facility.children?.length) {
      return {
        ...facility,
        children: updateFacilityInTree(facility.children, id, values),
      };
    }

    return facility;
  });
}

function removeFacilityFromTree(
  facilities: Facility[],
  facilityId: string,
): Facility[] {
  return facilities
    .filter((facility) => facility.id !== facilityId)
    .map((facility) => ({
      ...facility,
      children: facility.children
        ? removeFacilityFromTree(facility.children, facilityId)
        : facility.children,
    }));
}

export function FacilityProvider({ children }: FacilityProviderProps) {
  const [facilities, setFacilities] = useState<Facility[]>(facilitiesMock);

  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(
    facilitiesMock[0]?.id ?? null,
  );

  const selectedFacility = useMemo(() => {
    if (!selectedFacilityId) {
      return null;
    }

    return findFacilityById(facilities, selectedFacilityId);
  }, [facilities, selectedFacilityId]);

  const selectedFacilityPath = useMemo(() => {
    if (!selectedFacilityId) {
      return [];
    }

    return findFacilityPath(facilities, selectedFacilityId);
  }, [facilities, selectedFacilityId]);

  const addFacility = (parentId: string, values: FacilityFormValues) => {
    if (!findFacilityById(facilities, parentId)) {
      return;
    }

    const newFacility: Facility = {
      id: crypto.randomUUID(),
      organizationId:
        findFacilityById(facilities, parentId)?.organizationId ?? "",
      facilityCode: values.facilityCode,
      facilityName: values.facilityName,
      parentId,
      isActive: values.isActive,
      createdAt: new Date().toISOString(),
      children: [],
    };

    setFacilities((previous) =>
      addFacilityToTree(previous, parentId, newFacility),
    );

    setSelectedFacilityId(newFacility.id);
  };

  const updateFacility = (id: string, values: FacilityFormValues) => {
    setFacilities((previous) => updateFacilityInTree(previous, id, values));
  };

  const deleteFacility = (id: string) => {
    const nextFacilities = removeFacilityFromTree(facilities, id);

    setFacilities(nextFacilities);

    if (
      selectedFacilityId &&
      !findFacilityById(nextFacilities, selectedFacilityId)
    ) {
      setSelectedFacilityId(nextFacilities[0]?.id ?? null);
    }
  };

  return (
    <FacilityContext.Provider
      value={{
        facilities,
        setFacilities,
        selectedFacilityId,
        setSelectedFacilityId,
        selectedFacility,
        selectedFacilityPath,
        addFacility,
        updateFacility,
        deleteFacility,
      }}>
      {children}
    </FacilityContext.Provider>
  );
}

export function useFacilityContext() {
  const context = useContext(FacilityContext);

  if (!context) {
    throw new Error(
      "useFacilityContext phải được sử dụng trong FacilityProvider",
    );
  }

  return context;
}
