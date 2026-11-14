import { useEffect, useMemo, useState } from "react";
import type { Key } from "react";
import { Button, Input, Tag } from "antd";
import { Plus, Search, SquarePlus, SquareX } from "lucide-react";

import AppModal from "../../../../components/common/AppModal";
import AppButton from "../../../../components/common/AppButton";

import { broadcastDevicesMock } from "../../data/createBroadcast.mock";
import type { BroadcastDevice } from "../../data/createBroadcast.mock";

import "./DeviceSelectionModal.css";

interface DeviceSelectionModalProps {
  open: boolean;
  selectedIds: Key[];
  onCancel: () => void;
  onSave: (ids: Key[]) => void;
}

function DeviceSelectionModal({
  open,
  selectedIds,
  onCancel,
  onSave,
}: DeviceSelectionModalProps) {
  const [draftIds, setDraftIds] = useState<Key[]>([]);
  const [availableKeyword, setAvailableKeyword] = useState("");
  const [selectedKeyword, setSelectedKeyword] = useState("");
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [showAllFacilities, setShowAllFacilities] = useState(false);

  const facilities = useMemo(
    () =>
      Array.from(new Set(broadcastDevicesMock.map((item) => item.facility))),
    [],
  );

  useEffect(() => {
    if (!open) return;

    setDraftIds([...selectedIds]);
    setAvailableKeyword("");
    setSelectedKeyword("");
    setSelectedFacilities(facilities);
    setShowAllFacilities(false);
  }, [open, selectedIds, facilities]);

  const availableDevices = useMemo(() => {
    const keyword = availableKeyword.trim().toLowerCase();

    return broadcastDevicesMock.filter((device) => {
      const matchesFacility = selectedFacilities.includes(device.facility);

      const matchesKeyword = [device.name, device.facility, device.address]
        .join(" ")
        .toLowerCase()
        .includes(keyword);

      return matchesFacility && matchesKeyword;
    });
  }, [availableKeyword, selectedFacilities]);

  const selectedDevices = useMemo(() => {
    const keyword = selectedKeyword.trim().toLowerCase();

    return broadcastDevicesMock.filter(
      (device) =>
        draftIds.includes(device.id) &&
        [device.name, device.facility, device.address]
          .join(" ")
          .toLowerCase()
          .includes(keyword),
    );
  }, [draftIds, selectedKeyword]);

  const addDevice = (id: Key) => {
    setDraftIds((current) =>
      current.includes(id) ? current : [...current, id],
    );
  };

  const removeDevice = (id: Key) => {
    setDraftIds((current) => current.filter((item) => item !== id));
  };

  const addAll = () => {
    setDraftIds((current) =>
      Array.from(
        new Set([...current, ...availableDevices.map((item) => item.id)]),
      ),
    );
  };

  const removeAll = () => {
    setDraftIds([]);
  };

  const removeFacility = (facility: string) => {
    setSelectedFacilities((current) =>
      current.filter((item) => item !== facility),
    );
  };

  const addFacility = (facility: string) => {
    setSelectedFacilities((current) =>
      current.includes(facility) ? current : [...current, facility],
    );
  };

  const renderTable = (
    devices: BroadcastDevice[],
    type: "available" | "selected",
  ) => (
    <div className="device-selection__table">
      <div className="device-selection__table-header">
        <span>STT</span>
        <span>Thiết bị</span>
        <span>Cơ sở lắp đặt</span>
        <span>Địa chỉ lắp đặt</span>
        <span />
      </div>

      <div className="device-selection__table-body">
        {devices.length === 0 ? (
          <div className="device-selection__empty">Không có thiết bị</div>
        ) : (
          devices.map((device, index) => {
            const isSelected = draftIds.includes(device.id);

            return (
              <div className="device-selection__table-row" key={device.id}>
                <span>{index + 1}</span>

                <span title={device.name}>{device.name}</span>

                <span title={device.facility}>{device.facility}</span>

                <span
                  className="device-selection__address"
                  title={device.address}>
                  {device.address}
                </span>

                <Button
                  type="link"
                  className="device-selection__row-action"
                  onClick={() =>
                    type === "available"
                      ? addDevice(device.id)
                      : removeDevice(device.id)
                  }
                  disabled={type === "available" && isSelected}>
                  {type === "available"
                    ? isSelected
                      ? "Đã thêm"
                      : "Thêm"
                    : "Gỡ"}
                </Button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <AppModal
      title={
        <span className="device-selection__title">
          Chọn thiết bị phát bản tin
        </span>
      }
      open={open}
      width={1460}
      onCancel={onCancel}
      footer={null}>
      <div className="device-selection">
        <div className="device-selection__columns">
          <section className="device-selection__column">
            <div className="device-selection__filters">
              <div className="device-selection__facility">
                <label>Cơ sở</label>

                <div className="device-selection__facility-box">
                  {selectedFacilities
                    .slice(0, showAllFacilities ? undefined : 3)
                    .map((facility) => (
                      <Tag
                        key={facility}
                        closable
                        onClose={() => removeFacility(facility)}
                        className="device-selection__facility-tag">
                        {facility}
                      </Tag>
                    ))}

                  <Button
                    type="text"
                    icon={<Plus size={16} />}
                    className="device-selection__facility-add"
                    onClick={() => setShowAllFacilities((value) => !value)}
                  />

                  <Button
                    type="link"
                    className="device-selection__view-more"
                    onClick={() => setShowAllFacilities((value) => !value)}>
                    {showAllFacilities ? "Thu gọn" : "Xem thêm"}
                  </Button>
                </div>

                {showAllFacilities && (
                  <div className="device-selection__facility-options">
                    {facilities
                      .filter(
                        (facility) => !selectedFacilities.includes(facility),
                      )
                      .map((facility) => (
                        <Button
                          key={facility}
                          size="small"
                          onClick={() => addFacility(facility)}>
                          {facility}
                        </Button>
                      ))}
                  </div>
                )}
              </div>

              <Input
                className="device-selection__search"
                placeholder="Nhập tên thiết bị"
                value={availableKeyword}
                onChange={(event) => setAvailableKeyword(event.target.value)}
                suffix={<Search size={20} />}
                allowClear
              />
            </div>

            <div className="device-selection__toolbar">
              <Button
                type="link"
                className="device-selection__bulk-action"
                onClick={addAll}
                icon={<SquarePlus size={20} />}
                iconPlacement="end">
                Thêm tất cả
              </Button>
            </div>

            {renderTable(availableDevices, "available")}
          </section>

          <section className="device-selection__column">
            <div className="device-selection__selected-filter">
              <label>Danh sách thiết bị đã chọn</label>

              <Input
                className="device-selection__search"
                placeholder="Nhập tên nguồn thông tin"
                value={selectedKeyword}
                onChange={(event) => setSelectedKeyword(event.target.value)}
                suffix={<Search size={20} />}
                allowClear
              />
            </div>

            <div className="device-selection__toolbar">
              <Button
                type="link"
                className="device-selection__bulk-action"
                onClick={removeAll}
                icon={<SquareX size={20} />}
                iconPlacement="end">
                Gỡ tất cả
              </Button>
            </div>

            {renderTable(selectedDevices, "selected")}
          </section>
        </div>

        <div className="device-selection__footer">
          <AppButton variant="outline" width={162} onClick={onCancel}>
            Trở về
          </AppButton>

          <AppButton
            variant="primary"
            width={173}
            onClick={() => onSave([...draftIds])}>
            Lưu
          </AppButton>
        </div>
      </div>
    </AppModal>
  );
}

export default DeviceSelectionModal;
