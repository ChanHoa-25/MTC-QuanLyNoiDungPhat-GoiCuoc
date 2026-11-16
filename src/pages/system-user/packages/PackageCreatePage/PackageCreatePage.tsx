import { useState } from "react";
import type { FormEvent } from "react";
import { InputNumber, message, Radio } from "antd";
import type { Dayjs } from "dayjs";
import { PlusCircle, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import AppButton from "../../../../components/common/AppButton";
import AppInput from "../../../../components/common/AppInput";
import AppSelect from "../../../../components/common/AppSelect";
import AppDatePicker from "../../../../components/common/AppDatePicker";

import "./PackageCreatePage.css";

type DeviceLimitMode = "unlimited" | "limited";
type VisibilityMode = "private" | "public" | "scheduled";
type PackageStatus = "active" | "inactive" | "stopped";

interface PackageDuration {
  id: number;
  name: string;
  price: number | null;
  duration: string;
  status: PackageStatus;
  deviceLimitMode: DeviceLimitMode;
  deviceLimit: number | null;
  visibilityMode: VisibilityMode;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
}

const createPackageDuration = (id: number): PackageDuration => ({
  id,
  name: "",
  price: null,
  duration: "1 tháng",
  status: "active",
  deviceLimitMode: "unlimited",
  deviceLimit: null,
  visibilityMode: "private",
  startDate: null,
  endDate: null,
});

function PackageCreatePage() {
  const navigate = useNavigate();

  const [capacity, setCapacity] = useState<number | null>(null);
  const [capacityName, setCapacityName] = useState("");

  const [durations, setDurations] = useState<PackageDuration[]>([
    createPackageDuration(1),
  ]);

  const updateDuration = (id: number, changes: Partial<PackageDuration>) => {
    setDurations((previous) =>
      previous.map((item) => (item.id === id ? { ...item, ...changes } : item)),
    );
  };

  const handleAddDuration = () => {
    setDurations((previous) => {
      const nextId = Math.max(0, ...previous.map((item) => item.id)) + 1;

      return [...previous, createPackageDuration(nextId)];
    });
  };

  const handleRemoveDuration = (id: number) => {
    if (durations.length <= 1) {
      message.warning("Cần có ít nhất một gói cước");
      return;
    }

    setDurations((previous) => previous.filter((item) => item.id !== id));
  };

  const handleCancel = () => {
    navigate("/system/packages");
  };

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (capacity === null || capacity <= 0) {
      message.warning("Vui lòng nhập số dung lượng hợp lệ");
      return;
    }
    if (!capacityName.trim()) {
      message.warning("Vui lòng nhập tên dung lượng");
      return;
    }

    for (const item of durations) {
      if (!item.name.trim()) {
        message.warning("Vui lòng nhập tên gói cước");
        return;
      }

      if (!item.duration) {
        message.warning("Vui lòng chọn thời hạn");
        return;
      }

      if (!item.status) {
        message.warning("Vui lòng chọn trạng thái");
        return;
      }

      if (
        item.deviceLimitMode === "limited" &&
        (item.deviceLimit === null || item.deviceLimit <= 0)
      ) {
        message.warning("Vui lòng nhập giới hạn thiết bị");
        return;
      }

      if (item.visibilityMode === "scheduled") {
        if (!item.startDate || !item.endDate) {
          message.warning("Vui lòng chọn thời gian công khai");
          return;
        }

        if (item.endDate.isBefore(item.startDate, "day")) {
          message.warning("Ngày kết thúc phải bằng hoặc sau ngày bắt đầu");
          return;
        }
      }
    }

    const draft = {
      capacity,
      capacityName: capacityName.trim(),
      packages: durations.map((item) => ({
        name: item.name.trim(),
        price: item.price,
        duration: item.duration,
        status: item.status,
        deviceLimit:
          item.deviceLimitMode === "unlimited" ? null : item.deviceLimit,
        visibilityMode: item.visibilityMode,
        startDate:
          item.visibilityMode === "scheduled"
            ? item.startDate?.format("YYYY-MM-DD")
            : null,
        endDate:
          item.visibilityMode === "scheduled"
            ? item.endDate?.format("YYYY-MM-DD")
            : null,
      })),
    };

    console.log("Package draft:", draft);

    message.info("Dữ liệu hợp lệ. Chưa kết nối API tạo gói cước.");
  };

  return (
    <form className="package-create-page" onSubmit={handleSave}>
      <div className="package-create-card">
        <h2 className="package-create-title">Thêm gói cước</h2>

        <div className="package-create-capacity">
          <div className="package-create-field">
            <label>
              Số dung lượng:
              <span className="package-create-required">*</span>
            </label>

            <InputNumber
              min={1}
              precision={0}
              value={capacity}
              onChange={setCapacity}
              placeholder="Nhập số dung lượng"
              addonAfter="GB"
              style={{ width: "100%" }}
            />
          </div>

          <div className="package-create-field">
            <label>
              Tên dung lượng:
              <span className="package-create-required">*</span>
            </label>

            <AppInput
              width="100%"
              value={capacityName}
              onChange={(event) => setCapacityName(event.target.value)}
              placeholder="Nhập tên dung lượng"
            />
          </div>
        </div>

        <div className="package-create-duration-list">
          {durations.map((item) => (
            <div className="package-create-duration" key={item.id}>
              <button
                type="button"
                className="package-create-remove"
                title="Xóa gói cước"
                disabled={durations.length === 1}
                onClick={() => handleRemoveDuration(item.id)}>
                <Trash2 size={19} />
              </button>

              <div className="package-create-content">
                <div className="package-create-left">
                  <h3>Thông tin gói cước</h3>

                  <div className="package-create-field">
                    <label>
                      Tên gói cước:
                      <span className="package-create-required">*</span>
                    </label>
                    <AppInput
                      width="100%"
                      value={item.name}
                      onChange={(event) =>
                        updateDuration(item.id, {
                          name: event.target.value,
                        })
                      }
                      placeholder="Nhập tên gói cước"
                    />
                  </div>

                  <div className="package-create-field">
                    <label>Giá gói cước:</label>
                    <InputNumber
                      min={0}
                      precision={0}
                      value={item.price}
                      onChange={(value) =>
                        updateDuration(item.id, { price: value })
                      }
                      placeholder="Nhập giá gói cước"
                      addonAfter="VND"
                      style={{ width: "100%" }}
                    />
                  </div>

                  <div className="package-create-field">
                    <label>
                      Trạng thái:
                      <span className="package-create-required">*</span>
                    </label>
                    <AppSelect
                      width="100%"
                      value={item.status}
                      onChange={(value) =>
                        updateDuration(item.id, {
                          status: value as PackageStatus,
                        })
                      }
                      options={[
                        { label: "Kinh doanh", value: "active" },
                        { label: "Chưa kinh doanh", value: "inactive" },
                        { label: "Ngừng kinh doanh", value: "stopped" },
                      ]}
                    />
                  </div>

                  <div className="package-create-field">
                    <label>
                      Thời hạn:
                      <span className="package-create-required">*</span>
                    </label>

                    <div className="package-create-duration-options">
                      {["1 tháng", "3 tháng", "12 tháng"].map((duration) => (
                        <button
                          key={duration}
                          type="button"
                          className={`package-create-duration-button ${
                            item.duration === duration ? "is-active" : ""
                          }`}
                          onClick={() => updateDuration(item.id, { duration })}>
                          {duration}
                        </button>
                      ))}

                      <span className="package-create-duration-separator" />

                      <button
                        type="button"
                        className={`package-create-duration-button ${
                          !["1 tháng", "3 tháng", "12 tháng"].includes(
                            item.duration,
                          )
                            ? "is-active"
                            : ""
                        }`}
                        onClick={() =>
                          updateDuration(item.id, {
                            duration: "6 tháng",
                          })
                        }>
                        Tùy chọn
                      </button>

                      {!["1 tháng", "3 tháng", "12 tháng"].includes(
                        item.duration,
                      ) && (
                        <InputNumber
                          min={1}
                          precision={0}
                          value={parseInt(item.duration, 10) || null}
                          onChange={(value) =>
                            updateDuration(item.id, {
                              duration: value ? `${value} tháng` : "",
                            })
                          }
                          addonAfter="tháng"
                          className="package-create-custom-duration"
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="package-create-right">
                  <div className="package-create-option-section">
                    <h3>Giới hạn số lượng thiết bị kết nối</h3>

                    <Radio.Group
                      value={item.deviceLimitMode}
                      onChange={(event) =>
                        updateDuration(item.id, {
                          deviceLimitMode: event.target.value,
                        })
                      }>
                      <div className="package-create-radio-option">
                        <Radio value="unlimited">Không giới hạn</Radio>
                      </div>

                      <div className="package-create-radio-option">
                        <Radio value="limited">Giới hạn số lượng</Radio>

                        <InputNumber
                          min={1}
                          precision={0}
                          value={item.deviceLimit}
                          disabled={item.deviceLimitMode !== "limited"}
                          onChange={(value) =>
                            updateDuration(item.id, {
                              deviceLimit: value,
                            })
                          }
                          placeholder="Nhập số lượng"
                          addonAfter="Thiết bị/Tổ chức"
                        />
                      </div>
                    </Radio.Group>
                  </div>

                  <div className="package-create-option-section">
                    <h3>Công khai lên trang bán gói cước</h3>

                    <Radio.Group
                      value={item.visibilityMode}
                      onChange={(event) =>
                        updateDuration(item.id, {
                          visibilityMode: event.target.value,
                        })
                      }>
                      <div className="package-create-radio-option">
                        <Radio value="private">Không công khai</Radio>
                      </div>

                      <div className="package-create-radio-option">
                        <Radio value="public">Công khai không thời hạn</Radio>
                      </div>

                      <div className="package-create-radio-option">
                        <Radio value="scheduled">Công khai có thời hạn</Radio>

                        <div className="package-create-date-range">
                          <AppDatePicker
                            width={125}
                            value={item.startDate}
                            onChange={(value) =>
                              updateDuration(item.id, {
                                startDate: value,
                              })
                            }
                            disabled={item.visibilityMode !== "scheduled"}
                          />

                          <span className="package-create-date-arrow">›</span>

                          <AppDatePicker
                            width={125}
                            value={item.endDate}
                            onChange={(value) =>
                              updateDuration(item.id, {
                                endDate: value,
                              })
                            }
                            disabled={item.visibilityMode !== "scheduled"}
                          />
                        </div>
                      </div>
                    </Radio.Group>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          className="package-create-add-duration"
          onClick={handleAddDuration}>
          <PlusCircle size={18} />
          Thêm gói cước cho thời hạn khác
        </button>

        <div className="package-create-footer">
          <AppButton variant="outline" onClick={handleCancel}>
            Hủy
          </AppButton>

          <button type="submit" className="package-create-save">
            Lưu
          </button>
        </div>
      </div>
    </form>
  );
}

export default PackageCreatePage;
