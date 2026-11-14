import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Alert, Button, Empty, Spin, message } from "antd";

import AppTabs from "../../components/common/AppTabs";
import FacilityConfirmModals from "./components/FacilitiesConfirmModals/FacilityConfirmModals";

import { useFacilityContext } from "../../contexts/FacilityContext";
import { useActionPanel } from "../../contexts/ActionPanelContext";
import LocationTree from "./components/LocationTree/LocationTree";
import FacilityFormModal from "./components/FacilityFormModal";

import FacilityTabContent from "./components/FacilityTabContent/FacilityTabContent";

import FacilitiesShareModal from "./FacilityMedia/FacilitiesShareModal";

import type { Facility } from "./types/facility.types";

import { facilityTabs, useFacilityTabs } from "./hooks/useFacilityTabs";

import { useFacilitySelection } from "./hooks/useFacilitySelection";
import { findFacilityById } from "./utils/facility.utils";

import "./FacilitiesPage.css";

import { useFacilityModals } from "./hooks/useFacilityModals";
import { useFacilityActions } from "./hooks/useFacilityActions";
import { useFacilityDeviceActions } from "./hooks/useFacilityDeviceActions";
import { useFacilityCrud } from "./hooks/useFacilityCrud";

function FacilitiesPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const {
    facilities,
    selectedFacilityId,
    setSelectedFacilityId,
    selectedFacility,
    refreshFacilities,
    loading,
    error,
  } = useFacilityContext();
  const { setActions } = useActionPanel();
  const { activeTab, changeTab, resetTab } = useFacilityTabs();
  const [searchParams, setSearchParams] = useSearchParams();

  const facilityIdFromUrl = searchParams.get("facilityId");
  const {
    selectedUserKeys,
    setSelectedUserKeys,

    selectedDeviceKeys,
    setSelectedDeviceKeys,

    selectedMediaIds,
    setSelectedMediaIds,

    selectedTemplateKeys,
    setSelectedTemplateKeys,

    selectedPlaylistKeys,
    setSelectedPlaylistKeys,

    resetSelection,
  } = useFacilitySelection();
  const {
    activeModal,
    setActiveModal,
    targetFacility,
    setTargetFacility,

    openDeleteUser,
    setOpenDeleteUser,

    deviceConfirmType,
    setDeviceConfirmType,

    openDeleteMedia,
    setOpenDeleteMedia,

    openDeleteTemplate,
    setOpenDeleteTemplate,

    openDeletePlaylist,
    setOpenDeletePlaylist,

    closeFacilityModal,
  } = useFacilityModals();
  const {
    openCreateDevice,
    deleteDeviceRequestId,
    volumePopoverOpen,
    deviceVolume,
    commandLoading,

    handleAddDevice,
    handleCloseCreateDevice,
    handleVolumeChange,

    handleOpenRestartDevice,
    handleOpenDeleteDevice,
    handleCloseDeviceConfirm,
    handleConfirmDeviceAction,
    handleVolumePopoverOpenChange,

    resetDeviceState,
  } = useFacilityDeviceActions({
    selectedDeviceKeys,
    deviceConfirmType,
    setDeviceConfirmType,

    onWarning: messageApi.warning,
    onInfo: messageApi.info,
  });
  const {
    handleFacilityAction,
    handleCloseModal,
    handleSubmitFacility,
    handleDeleteFacility,
    initialValues,
    submitting,
  } = useFacilityCrud({
    facilities,
    activeModal,
    setActiveModal,
    targetFacility,
    setTargetFacility,
    closeFacilityModal,
    refreshFacilities,
    onInfo: messageApi.info,
    onSuccess: messageApi.success,
    onError: messageApi.error,
  });
  const [openCreateUser, setOpenCreateUser] = useState(false);

  const [deleteUserRequestId, setDeleteUserRequestId] = useState(0);

  const [openCreateMedia, setOpenCreateMedia] = useState(false);

  const [deleteMediaRequestId, setDeleteMediaRequestId] = useState(0);
  const [approveMediaRequestId, setApproveMediaRequestId] = useState(0);

  const [openCreateTemplate, setOpenCreateTemplate] = useState(false);

  const [deleteTemplateRequestId, setDeleteTemplateRequestId] = useState(0);

  const [openCreatePlaylist, setOpenCreatePlaylist] = useState(false);

  const [deletePlaylistRequestId, setDeletePlaylistRequestId] = useState(0);
  const [shareOpen, setShareOpen] = useState(false);
  const resetTabState = () => {
    resetSelection();

    setOpenCreateUser(false);
    setOpenDeleteUser(false);

    resetDeviceState();

    setOpenCreateTemplate(false);
    setOpenDeleteTemplate(false);

    setOpenCreatePlaylist(false);
    setOpenDeletePlaylist(false);

    setOpenCreateMedia(false);
    setOpenDeleteMedia(false);
    setShareOpen(false);
  };

  const handleSelectFacility = (facility: Facility) => {
    setSelectedFacilityId(facility.id);

    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);

      next.set("facilityId", facility.id);
      next.delete("tab");

      return next;
    });

    resetTabState();
    setActiveModal(null);
    setTargetFacility(null);
  };

  const handleConfirmDeleteUser = () => {
    if (selectedUserKeys.length > 0) {
      setDeleteUserRequestId((previous) => previous + 1);
    }
    setOpenDeleteUser(false);
  };
  const handleDeleteUserComplete = () => {
    setOpenDeleteUser(false);
    setSelectedUserKeys([]);
  };

  const handleConfirmDeleteTemplate = () => {
    if (selectedTemplateKeys.length > 0) {
      setDeleteTemplateRequestId((previous) => previous + 1);
    }
    setOpenDeleteTemplate(false);
  };
  const handleConfirmDeletePlaylist = () => {
    if (selectedPlaylistKeys.length > 0) {
      setDeletePlaylistRequestId((previous) => previous + 1);
    }
    setOpenDeletePlaylist(false);
  };
  const handleConfirmDeleteMedia = () => {
    if (selectedMediaIds.length > 0) {
      setDeleteMediaRequestId((previous) => previous + 1);
    }
    setOpenDeleteMedia(false);
  };
  const handleApproveMedia = useCallback(() => {
    setApproveMediaRequestId((previous) => previous + 1);
  }, []);
  const handleChangeTab = (key: string) => {
    const changed = changeTab(key);
    if (!changed) return;
    resetTabState();
  };
  const handleAddUser = useCallback(() => {
    setOpenCreateUser(true);
  }, []);

  const handleDeleteUser = useCallback(() => {
    setOpenDeleteUser(true);
  }, [setOpenDeleteUser]);

  const handleAddMedia = useCallback(() => {
    setOpenCreateMedia(true);
  }, []);

  const handleDeleteMedia = useCallback(() => {
    setOpenDeleteMedia(true);
  }, [setOpenDeleteMedia]);

  const handleAddTemplate = useCallback(() => {
    setOpenCreateTemplate(true);
  }, []);

  const handleDeleteTemplate = useCallback(() => {
    setOpenDeleteTemplate(true);
  }, [setOpenDeleteTemplate]);

  const handleAddPlaylist = useCallback(() => {
    setOpenCreatePlaylist(true);
  }, []);

  const handleDeletePlaylist = useCallback(() => {
    setOpenDeletePlaylist(true);
  }, [setOpenDeletePlaylist]);
  const tabActions = useFacilityActions({
    activeTab,
    hasSelectedFacility: Boolean(selectedFacility),

    selectedUserCount: selectedUserKeys.length,
    selectedDeviceCount: selectedDeviceKeys.length,
    selectedMediaCount: selectedMediaIds.length,
    selectedTemplateCount: selectedTemplateKeys.length,
    selectedPlaylistCount: selectedPlaylistKeys.length,

    deviceVolume,
    volumePopoverOpen,

    onVolumeChange: handleVolumeChange,
    onVolumePopoverOpenChange: handleVolumePopoverOpenChange,

    onAddUser: handleAddUser,
    onDeleteUser: handleDeleteUser,

    onAddDevice: handleAddDevice,
    onRestartDevice: handleOpenRestartDevice,
    onDeleteDevice: handleOpenDeleteDevice,

    onAddMedia: handleAddMedia,
    onDeleteMedia: handleDeleteMedia,
    onApproveMedia: handleApproveMedia,

    onAddTemplate: handleAddTemplate,
    onDeleteTemplate: handleDeleteTemplate,

    onAddPlaylist: handleAddPlaylist,
    onDeletePlaylist: handleDeletePlaylist,
  });
  useEffect(() => {
    setActions(tabActions);
  }, [setActions, tabActions]);
  useEffect(() => {
    return () => {
      setActions([]);
    };
  }, [setActions]);
  useEffect(() => {
    if (loading || facilities.length === 0) return;

    if (facilityIdFromUrl) {
      const facility = findFacilityById(facilities, facilityIdFromUrl);

      if (facility && selectedFacilityId !== facility.id) {
        setSelectedFacilityId(facility.id);
      }

      return;
    }

    if (!selectedFacilityId) return;

    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        next.set("facilityId", selectedFacilityId);
        return next;
      },
      { replace: true },
    );
  }, [
    loading,
    facilities,
    facilityIdFromUrl,
    selectedFacilityId,
    setSelectedFacilityId,
    setSearchParams,
  ]);

  return (
    <div className="facilities-page">
      {contextHolder}
      <div className="facilities-tree-wrapper">
        {loading && facilities.length === 0 ? (
          <div className="facilities-tree-state">
            <Spin size="large" />
            <span>Đang tải danh sách cơ sở...</span>
          </div>
        ) : error ? (
          <div className="facilities-tree-state">
            <Alert
              type="error"
              showIcon
              title="Không thể tải danh sách cơ sở"
              description={error}
            />

            <Button
              type="primary"
              onClick={() => {
                void refreshFacilities().catch(() => {
                  // Lỗi được quản lý trong FacilityContext.
                });
              }}>
              Thử lại
            </Button>
          </div>
        ) : facilities.length === 0 ? (
          <div className="facilities-tree-state">
            <Empty description="Chưa có cơ sở nào" />
          </div>
        ) : (
          <LocationTree
            facilities={facilities}
            selectedId={selectedFacilityId}
            onSelect={handleSelectFacility}
            onAction={handleFacilityAction}
          />
        )}
      </div>
      <main className="facilities-main">
        <AppTabs
          items={facilityTabs}
          activeKey={activeTab}
          onChange={handleChangeTab}
          className="facilities-page-tabs"
          ariaLabel="Các chức năng quản lý cơ sở"
        />
        <div className="facilities-content" role="tabpanel">
          <FacilityTabContent
            activeTab={activeTab}
            selectedFacility={selectedFacility}
            facilities={facilities}
            selectedUserKeys={selectedUserKeys}
            setSelectedUserKeys={setSelectedUserKeys}
            openCreateUser={openCreateUser}
            onCloseCreateUser={() => setOpenCreateUser(false)}
            deleteUserRequestId={deleteUserRequestId}
            onDeleteUserComplete={handleDeleteUserComplete}
            selectedDeviceKeys={selectedDeviceKeys}
            setSelectedDeviceKeys={setSelectedDeviceKeys}
            openCreateDevice={openCreateDevice}
            onCloseCreateDevice={handleCloseCreateDevice}
            deleteDeviceRequestId={deleteDeviceRequestId}
            onDeleteDeviceComplete={() => setSelectedDeviceKeys([])}
            selectedMediaIds={selectedMediaIds}
            setSelectedMediaIds={setSelectedMediaIds}
            openCreateMedia={openCreateMedia}
            onCloseCreateMedia={() => setOpenCreateMedia(false)}
            deleteMediaRequestId={deleteMediaRequestId}
            approveMediaRequestId={approveMediaRequestId}
            onShareMedia={() => setShareOpen(true)}
            selectedTemplateKeys={selectedTemplateKeys}
            setSelectedTemplateKeys={setSelectedTemplateKeys}
            openCreateTemplate={openCreateTemplate}
            onCloseCreateTemplate={() => setOpenCreateTemplate(false)}
            deleteTemplateRequestId={deleteTemplateRequestId}
            onDeleteTemplateComplete={() => setSelectedTemplateKeys([])}
            selectedPlaylistKeys={selectedPlaylistKeys}
            setSelectedPlaylistKeys={setSelectedPlaylistKeys}
            openCreatePlaylist={openCreatePlaylist}
            onCloseCreatePlaylist={() => setOpenCreatePlaylist(false)}
            deletePlaylistRequestId={deletePlaylistRequestId}
            onDeletePlaylistComplete={() => setSelectedPlaylistKeys([])}
          />
        </div>
      </main>
      <FacilityFormModal
        open={activeModal === "create" || activeModal === "edit"}
        mode={activeModal === "edit" ? "edit" : "create"}
        initialValues={initialValues}
        loading={submitting}
        onCancel={handleCloseModal}
        onSubmit={handleSubmitFacility}
      />
      <FacilityConfirmModals
        openDeleteFacility={activeModal === "delete"}
        deviceCommandLoading={commandLoading}
        deletingFacility={submitting}
        onCloseFacility={handleCloseModal}
        onConfirmDeleteFacility={handleDeleteFacility}
        openDeleteUser={openDeleteUser}
        onCloseDeleteUser={() => setOpenDeleteUser(false)}
        onConfirmDeleteUser={handleConfirmDeleteUser}
        deviceConfirmType={deviceConfirmType}
        selectedDeviceCount={selectedDeviceKeys.length}
        onCloseDeviceConfirm={handleCloseDeviceConfirm}
        onConfirmDeviceAction={handleConfirmDeviceAction}
        openDeleteTemplate={openDeleteTemplate}
        selectedTemplateCount={selectedTemplateKeys.length}
        onCloseDeleteTemplate={() => setOpenDeleteTemplate(false)}
        onConfirmDeleteTemplate={handleConfirmDeleteTemplate}
        openDeletePlaylist={openDeletePlaylist}
        selectedPlaylistCount={selectedPlaylistKeys.length}
        onCloseDeletePlaylist={() => setOpenDeletePlaylist(false)}
        onConfirmDeletePlaylist={handleConfirmDeletePlaylist}
        openDeleteMedia={openDeleteMedia}
        selectedMediaCount={selectedMediaIds.length}
        onCloseDeleteMedia={() => setOpenDeleteMedia(false)}
        onConfirmDeleteMedia={handleConfirmDeleteMedia}
      />

      <FacilitiesShareModal
        open={shareOpen}
        onCancel={() => setShareOpen(false)}
        onShare={(selectedIds) => {
          console.log("Cơ sở được chia sẻ:", selectedIds);
          setShareOpen(false);
        }}
      />
    </div>
  );
}
export default FacilitiesPage;
