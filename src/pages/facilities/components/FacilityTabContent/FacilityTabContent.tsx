import type { Key } from "react";

import FacilityInfo from "../../FacilityInfo/FacilityInfo";
import FacilityUsers from "../../FacilityUsers";
import FacilityDevices from "../../FacilityDevices";
import FacilityMedia from "../../FacilityMedia";
import FacilityTemplates from "../../FacilityTemplates";
import FacilityPlaylists from "../../FacilityPlaylists";

import type { Facility } from "../../types/facility.types";
import { findFacilityById } from "../../utils/facility.utils";

type FacilityTabKey =
  | "info"
  | "users"
  | "devices"
  | "media"
  | "templates"
  | "playlists";

interface FacilityTabContentProps {
  activeTab: FacilityTabKey;
  selectedFacility: Facility | null;
  facilities: Facility[];

  selectedUserKeys: Key[];
  setSelectedUserKeys: (keys: Key[]) => void;
  openCreateUser: boolean;
  onCloseCreateUser: () => void;
  deleteUserRequestId: number;
  onDeleteUserComplete: () => void;

  selectedDeviceKeys: Key[];
  setSelectedDeviceKeys: (keys: Key[]) => void;
  openCreateDevice: boolean;
  onCloseCreateDevice: () => void;
  deleteDeviceRequestId: number;
  onDeleteDeviceComplete: () => void;

  selectedMediaIds: string[];
  setSelectedMediaIds: (ids: string[]) => void;
  openCreateMedia: boolean;
  onCloseCreateMedia: () => void;
  deleteMediaRequestId: number;
  approveMediaRequestId: number;
  onShareMedia: () => void;

  selectedTemplateKeys: Key[];
  setSelectedTemplateKeys: (keys: Key[]) => void;
  openCreateTemplate: boolean;
  onCloseCreateTemplate: () => void;
  deleteTemplateRequestId: number;
  onDeleteTemplateComplete: () => void;

  selectedPlaylistKeys: Key[];
  setSelectedPlaylistKeys: (keys: Key[]) => void;
  openCreatePlaylist: boolean;
  onCloseCreatePlaylist: () => void;
  deletePlaylistRequestId: number;
  onDeletePlaylistComplete: () => void;
}

function FacilityTabContent({
  activeTab,
  selectedFacility,
  facilities,

  selectedUserKeys,
  setSelectedUserKeys,
  openCreateUser,
  onCloseCreateUser,
  deleteUserRequestId,
  onDeleteUserComplete,

  selectedDeviceKeys,
  setSelectedDeviceKeys,
  openCreateDevice,
  onCloseCreateDevice,
  deleteDeviceRequestId,
  onDeleteDeviceComplete,

  selectedMediaIds,
  setSelectedMediaIds,
  openCreateMedia,
  onCloseCreateMedia,
  deleteMediaRequestId,
  approveMediaRequestId,
  onShareMedia,

  selectedTemplateKeys,
  setSelectedTemplateKeys,
  openCreateTemplate,
  onCloseCreateTemplate,
  deleteTemplateRequestId,
  onDeleteTemplateComplete,

  selectedPlaylistKeys,
  setSelectedPlaylistKeys,
  openCreatePlaylist,
  onCloseCreatePlaylist,
  deletePlaylistRequestId,
  onDeletePlaylistComplete,
}: FacilityTabContentProps) {
  if (!selectedFacility) {
    return (
      <div className="facilities-empty">
        Vui lòng chọn một cơ sở để xem thông tin.
      </div>
    );
  }

  switch (activeTab) {
    case "info": {
      const parentFacility = selectedFacility.parentId
        ? findFacilityById(facilities, selectedFacility.parentId)
        : null;

      return (
        <FacilityInfo
          facility={selectedFacility}
          parentName={parentFacility?.facilityName ?? "—"}
        />
      );
    }

    case "users":
      return (
        <FacilityUsers
          facility={selectedFacility}
          selectedRowKeys={selectedUserKeys}
          onSelectionChange={setSelectedUserKeys}
          openCreate={openCreateUser}
          onCloseCreate={onCloseCreateUser}
          deleteRequestId={deleteUserRequestId}
          onDeleteComplete={onDeleteUserComplete}
        />
      );

    case "devices":
      return (
        <FacilityDevices
          facility={selectedFacility}
          selectedRowKeys={selectedDeviceKeys}
          onSelectionChange={setSelectedDeviceKeys}
          openCreate={openCreateDevice}
          onCloseCreate={onCloseCreateDevice}
          deleteRequestId={deleteDeviceRequestId}
          onDeleteComplete={onDeleteDeviceComplete}
        />
      );

    case "media":
      return (
        <FacilityMedia
          facilityId={selectedFacility.id}
          selectedIds={selectedMediaIds}
          onSelectionChange={setSelectedMediaIds}
          openCreate={openCreateMedia}
          onCloseCreate={onCloseCreateMedia}
          deleteRequestId={deleteMediaRequestId}
          approveRequestId={approveMediaRequestId}
          onShare={onShareMedia}
        />
      );

    case "templates":
      return (
        <FacilityTemplates
          facility={selectedFacility}
          selectedRowKeys={selectedTemplateKeys}
          onSelectionChange={setSelectedTemplateKeys}
          openCreate={openCreateTemplate}
          onCloseCreate={onCloseCreateTemplate}
          deleteRequestId={deleteTemplateRequestId}
          onDeleteComplete={onDeleteTemplateComplete}
        />
      );

    case "playlists":
      return (
        <FacilityPlaylists
          facility={selectedFacility}
          selectedRowKeys={selectedPlaylistKeys}
          onSelectionChange={setSelectedPlaylistKeys}
          openCreate={openCreatePlaylist}
          onCloseCreate={onCloseCreatePlaylist}
          deleteRequestId={deletePlaylistRequestId}
          onDeleteComplete={onDeletePlaylistComplete}
        />
      );

    default:
      return null;
  }
}

export default FacilityTabContent;
