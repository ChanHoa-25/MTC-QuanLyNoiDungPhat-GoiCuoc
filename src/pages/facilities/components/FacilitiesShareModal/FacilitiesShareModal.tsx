import { useEffect, useState } from "react";
import { Checkbox } from "antd";
import { UpOutlined, DownOutlined } from "@ant-design/icons";

import AppModal from "../../../../components/common/AppModal";
import AppButton from "../../../../components/common/AppButton";
import AppStatusTag from "../../../../components/common/AppStatusTag";

import "./FacilitiesShareModal.css";

interface ShareFacility {
  id: string;
  name: string;
}

interface ShareChannelInfo {
  name: string;
  relayChannel: string;
  fmChannel: string;
  managingFacility: string;
  active: boolean;
  description: string;
}

interface FacilitiesShareModalProps {
  open: boolean;
  onCancel: () => void;
  onShare: (selectedIds: string[]) => void;
  channel?: ShareChannelInfo;
  facilities?: ShareFacility[];
  initialSelectedIds?: string[];
}

const defaultFacilities: ShareFacility[] = [
  { id: "quan-1", name: "Quận 1" },
  { id: "quan-2", name: "Quận 2" },
  { id: "quan-3", name: "Quận 3" },
  { id: "quan-4", name: "Quận 4" },
  { id: "quan-5", name: "Quận 5" },
  { id: "quan-6", name: "Quận 6" },
  { id: "tan-binh", name: "Quận Tân Bình" },
  { id: "binh-thanh", name: "Quận Bình Thạnh" },
];

const defaultChannel: ShareChannelInfo = {
  name: "Kênh phát thanh 1",
  relayChannel: "Kênh tiếp sóng 1",
  fmChannel: "Kênh tiếp sóng 1",
  managingFacility: "Tp. Hồ Chí Minh",
  active: true,
  description: "Kênh phát thanh 1",
};

const emptySelectedIds: string[] = [];

function FacilitiesShareModal({
  open,
  onCancel,
  onShare,
  channel = defaultChannel,
  facilities = defaultFacilities,
  initialSelectedIds = emptySelectedIds,
}: FacilitiesShareModalProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    if (open) {
      setSelectedIds([...initialSelectedIds]);
      setExpanded(true);
    }
  }, [open, initialSelectedIds]);

  const handleSelect = (id: string, checked: boolean) => {
    setSelectedIds((previous) =>
      checked
        ? [...new Set([...previous, id])]
        : previous.filter((item) => item !== id),
    );
  };

  const handleShare = () => {
    if (selectedIds.length === 0) return;

    onShare(selectedIds);
  };

  return (
    <AppModal
      open={open}
      onCancel={onCancel}
      title="Chia sẻ kênh phát thanh đến cơ sở"
      width={844}
      footer={null}
      className="facilities-share-modal">
      <div className="facilities-share-modal__layout">
        <section className="facilities-share-modal__left">
          <h3>Chọn cơ sở để chia sẻ</h3>

          <div className="facilities-share-modal__tree">
            <button
              type="button"
              className="facilities-share-modal__tree-header"
              onClick={() => setExpanded((previous) => !previous)}
              aria-expanded={expanded}>
              <span className="facilities-share-modal__tree-root">
                <span className="facilities-share-modal__root-icon">
                  {expanded ? "−" : "+"}
                </span>
                Tp. Hồ Chí Minh
              </span>

              {expanded ? <UpOutlined /> : <DownOutlined />}
            </button>

            {expanded && (
              <div className="facilities-share-modal__tree-list">
                {facilities.map((facility) => {
                  const checked = selectedIds.includes(facility.id);

                  return (
                    <label
                      key={facility.id}
                      className={`facilities-share-modal__tree-item ${
                        checked ? "is-selected" : ""
                      }`}>
                      <Checkbox
                        checked={checked}
                        onChange={(event) =>
                          handleSelect(facility.id, event.target.checked)
                        }
                      />

                      <span>{facility.name}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <section className="facilities-share-modal__right">
          <h3>Thông tin kênh truyền thanh</h3>

          <div className="facilities-share-modal__info">
            <span>Tên kênh:</span>
            <span>{channel.name}</span>

            <span>Kênh tiếp sóng:</span>
            <span>{channel.relayChannel}</span>

            <span>Kênh FM:</span>
            <span>{channel.fmChannel}</span>

            <span>Cơ sở quản lý:</span>
            <span>{channel.managingFacility}</span>

            <span>Trạng thái hoạt động:</span>
            <AppStatusTag
              variant={channel.active ? "green" : "gray"}
              label={channel.active ? "Đang hoạt động" : "Ngưng hoạt động"}
            />

            <span>Mô tả:</span>
            <span>{channel.description}</span>
          </div>
        </section>
      </div>

      <div className="facilities-share-modal__footer">
        <AppButton variant="outline" width={148} height={44} onClick={onCancel}>
          Hủy
        </AppButton>

        <AppButton
          variant="primary"
          width={148}
          height={44}
          onClick={handleShare}
          disabled={selectedIds.length === 0}>
          Chia sẻ kênh
        </AppButton>
      </div>
    </AppModal>
  );
}

export default FacilitiesShareModal;
