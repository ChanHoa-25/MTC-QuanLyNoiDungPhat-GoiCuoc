import AppModal from "../../../../../components/common/AppModal";
import type { SharedMediaItem } from "../../types/sourceShared.types";
import "./SharedMediaDetailModal.css";

interface SharedMediaDetailModalProps {
  item: SharedMediaItem | null;
  onClose: () => void;
}

function SharedMediaDetailModal({
  item,
  onClose,
}: SharedMediaDetailModalProps) {
  return (
    <AppModal
      open={Boolean(item)}
      title="Chi tiết media được chia sẻ"
      width={560}
      footer={null}
      onCancel={onClose}
      className="shared-media-detail-modal">
      {item && (
        <div className="shared-media-detail__grid">
          <div className="shared-media-detail__column">
            <div className="shared-media-detail__field">
              <span className="shared-media-detail__label">
                Tên file media:
              </span>
              <span className="shared-media-detail__value">
                {item.detailTitle}
              </span>
            </div>

            <div className="shared-media-detail__field">
              <span className="shared-media-detail__label">Lĩnh vực:</span>
              <span className="shared-media-detail__value">
                {item.detailCategory}
              </span>
            </div>

            <div className="shared-media-detail__field">
              <span className="shared-media-detail__label">
                Định dạng file - Loại file:
              </span>
              <span className="shared-media-detail__value">
                {item.formatLabel}
              </span>
            </div>

            <div className="shared-media-detail__field">
              <span className="shared-media-detail__label">
                File đính kèm hoặc link nội dung:
              </span>
              <span className="shared-media-detail__value">
                {item.attachmentOrLink}
              </span>
            </div>

            <div className="shared-media-detail__field">
              <span className="shared-media-detail__label">
                Thời lượng phát:
              </span>
              <span className="shared-media-detail__value">
                {item.duration}
              </span>
            </div>
          </div>

          <div className="shared-media-detail__column">
            <div className="shared-media-detail__field">
              <span className="shared-media-detail__label">
                Người phê duyệt:
              </span>
              <span className="shared-media-detail__value">
                {item.approvedBy}
              </span>
            </div>

            <div className="shared-media-detail__field">
              <span className="shared-media-detail__label">Người tạo:</span>
              <span className="shared-media-detail__value">
                {item.detailCreatedBy}
              </span>
            </div>

            <div className="shared-media-detail__field">
              <span className="shared-media-detail__label">Ngày tạo:</span>
              <span className="shared-media-detail__value">
                {item.detailCreatedAtDisplay}
              </span>
            </div>

            <div className="shared-media-detail__field">
              <span className="shared-media-detail__label">
                Cơ sở chia sẻ:
              </span>
              <span className="shared-media-detail__value">
                {item.sharedFacility}
              </span>
            </div>

            <div className="shared-media-detail__field">
              <span className="shared-media-detail__label">Ngày chia sẻ:</span>
              <span className="shared-media-detail__value">
                {item.detailSharedAtDisplay}
              </span>
            </div>
          </div>
        </div>
      )}
    </AppModal>
  );
}

export default SharedMediaDetailModal;
