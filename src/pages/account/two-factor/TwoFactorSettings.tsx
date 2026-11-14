import { useState } from "react";
import { Switch, message } from "antd";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";

import "./TwoFactorSettings.css";

function TwoFactorSettings() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  // Dữ liệu mẫu, chưa kết nối API xác thực
  const [enabled] = useState(false);

  const handleToggle = () => {
    messageApi.info(
      "Cần hoàn tất thiết lập phương thức xác thực trước khi bật 2FA.",
    );
  };

  const handleAuthenticator = () => {
    navigate("/account/two-factor/authenticator");
  };

  const handleRecoveryCodes = () => {
    navigate("/account/two-factor/recovery-codes");
  };

  return (
    <div className="two-factor-settings">
      {contextHolder}

      <div className="two-factor-settings__card">
        {/* Trạng thái xác thực */}
        <div className="two-factor-settings__status">
          <div className="two-factor-settings__status-content">
            <h2>
              Tính năng xác thực hai bước của bạn đang {enabled ? "bật" : "tắt"}
            </h2>

            <p>
              Hãy ngăn chặn người lạ truy cập vào tài khoản của bạn bằng một lớp
              bảo mật nữa.
            </p>
          </div>

          <Switch
            checked={enabled}
            onChange={handleToggle}
            className="two-factor-settings__switch"
            aria-label="Bật hoặc tắt xác thực hai bước"
          />
        </div>

        {/* Các hình thức xác thực */}
        <section className="two-factor-settings__methods">
          <h3>Các hình thức xác thực</h3>

          <div className="two-factor-settings__list">
            {/* Ứng dụng xác thực */}
            <button
              type="button"
              className="two-factor-settings__method"
              onClick={handleAuthenticator}>
              <div className="two-factor-settings__method-info">
                <h4>Ứng dụng xác thực</h4>
                <span>Không kết nối</span>
              </div>

              <div className="two-factor-settings__method-action">
                <strong>Thêm ứng dụng xác thực</strong>

                <span className="two-factor-settings__arrow">
                  <ChevronRight size={30} />
                </span>
              </div>
            </button>

            {/* Mã dự phòng */}
            <button
              type="button"
              className="two-factor-settings__method"
              onClick={handleRecoveryCodes}>
              <div className="two-factor-settings__method-info">
                <h4>Mã dự phòng:</h4>
                <span>Không kết nối</span>
              </div>

              <div className="two-factor-settings__method-action">
                <strong>Nhận mã dự phòng</strong>

                <span className="two-factor-settings__arrow">
                  <ChevronRight size={30} />
                </span>
              </div>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default TwoFactorSettings;
