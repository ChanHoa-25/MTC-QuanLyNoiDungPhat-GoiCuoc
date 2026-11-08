import AppConfirmModal from "../../../../components/common/AppConfirmModal";

interface DeletePlaylistModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

/** Popup "Xác nhận xóa danh sách phát" theo Figma. */
export default function DeletePlaylistModal({ open, onCancel, onConfirm }: DeletePlaylistModalProps) {
  return (
    <AppConfirmModal
      open={open}
      type="delete"
      title="Xác nhận xóa danh sách phát"
      description="Các danh sách phát được chọn sẽ bị xóa khỏi hệ thống và không thể khôi phục."
      confirmText="Tiếp tục"
      cancelText="Hủy"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}

