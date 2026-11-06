import AppConfirmModal from "../../../../components/common/AppConfirmModal";

type DeviceConfirmType = "restart" | "delete" | null;

interface FacilityConfirmModalsProps {
  openDeleteFacility: boolean;
  onCloseFacility: () => void;
  onConfirmDeleteFacility: () => void;

  openDeleteUser: boolean;
  onCloseDeleteUser: () => void;
  onConfirmDeleteUser: () => void;

  deviceConfirmType: DeviceConfirmType;
  selectedDeviceCount: number;
  onCloseDeviceConfirm: () => void;
  onConfirmDeviceAction: () => void;

  openDeleteTemplate: boolean;
  selectedTemplateCount: number;
  onCloseDeleteTemplate: () => void;
  onConfirmDeleteTemplate: () => void;

  openDeletePlaylist: boolean;
  selectedPlaylistCount: number;
  onCloseDeletePlaylist: () => void;
  onConfirmDeletePlaylist: () => void;

  openDeleteMedia: boolean;
  selectedMediaCount: number;
  onCloseDeleteMedia: () => void;
  onConfirmDeleteMedia: () => void;
}

function FacilityConfirmModals({
  openDeleteFacility,
  onCloseFacility,
  onConfirmDeleteFacility,

  openDeleteUser,
  onCloseDeleteUser,
  onConfirmDeleteUser,

  deviceConfirmType,
  selectedDeviceCount,
  onCloseDeviceConfirm,
  onConfirmDeviceAction,

  openDeleteTemplate,
  selectedTemplateCount,
  onCloseDeleteTemplate,
  onConfirmDeleteTemplate,

  openDeletePlaylist,
  selectedPlaylistCount,
  onCloseDeletePlaylist,
  onConfirmDeletePlaylist,

  openDeleteMedia,
  selectedMediaCount,
  onCloseDeleteMedia,
  onConfirmDeleteMedia,
}: FacilityConfirmModalsProps) {
  return (
    <>
      <AppConfirmModal
        open={openDeleteFacility}
        type="delete"
        title="Xác nhận xóa cơ sở"
        description="Cơ sở này sẽ bị xóa và không thể khôi phục."
        confirmText="Xác nhận"
        cancelText="Hủy"
        width={500}
        onCancel={onCloseFacility}
        onConfirm={onConfirmDeleteFacility}
      />

      <AppConfirmModal
        open={openDeleteUser}
        type="delete"
        title="Xác nhận xóa tài khoản"
        description="Các tài khoản quản trị cơ sở được chọn sẽ bị xóa và không thể khôi phục."
        confirmText="Xác nhận"
        cancelText="Hủy"
        width={500}
        className="app-confirm-modal--facility-users-delete"
        onCancel={onCloseDeleteUser}
        onConfirm={onConfirmDeleteUser}
      />

      <AppConfirmModal
        open={deviceConfirmType === "restart"}
        type="restart"
        title="Xác nhận khởi động lại thiết bị"
        description={`Bạn có chắc chắn muốn khởi động lại ${selectedDeviceCount} thiết bị đã chọn?`}
        confirmText="Xác nhận"
        cancelText="Hủy"
        width={500}
        onCancel={onCloseDeviceConfirm}
        onConfirm={onConfirmDeviceAction}
      />

      <AppConfirmModal
        open={deviceConfirmType === "delete"}
        type="delete"
        title="Xác nhận xóa thiết bị"
        description={`Bạn có chắc chắn muốn xóa ${selectedDeviceCount} thiết bị đã chọn?`}
        confirmText="Xác nhận"
        cancelText="Hủy"
        width={500}
        onCancel={onCloseDeviceConfirm}
        onConfirm={onConfirmDeviceAction}
      />

      <AppConfirmModal
        open={openDeleteTemplate}
        type="delete"
        title="Xác nhận xóa bản mẫu"
        description={`Bạn có chắc chắn muốn xóa ${selectedTemplateCount} bản mẫu đã chọn?`}
        confirmText="Xác nhận"
        cancelText="Hủy"
        width={500}
        onCancel={onCloseDeleteTemplate}
        onConfirm={onConfirmDeleteTemplate}
      />

      <AppConfirmModal
        open={openDeletePlaylist}
        type="delete"
        title="Xác nhận xóa danh sách phát"
        description={`Bạn có chắc chắn muốn xóa ${selectedPlaylistCount} danh sách phát đã chọn?`}
        confirmText="Xác nhận"
        cancelText="Hủy"
        width={500}
        onCancel={onCloseDeletePlaylist}
        onConfirm={onConfirmDeletePlaylist}
      />

      <AppConfirmModal
        open={openDeleteMedia}
        type="delete"
        title="Xác nhận xóa Media"
        description={`Bạn có chắc chắn muốn xóa ${selectedMediaCount} Media đã chọn?`}
        confirmText="Xác nhận"
        cancelText="Hủy"
        width={500}
        onCancel={onCloseDeleteMedia}
        onConfirm={onConfirmDeleteMedia}
      />
    </>
  );
}

export default FacilityConfirmModals;
