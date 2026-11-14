import { ChevronRight } from "lucide-react";
import "./AccountSecurity.css";

interface SecurityItem {
  key: string;
  title: string;
  description: string;
  onClick: () => void;
}

interface AccountSecurityProps {
  onChangePassword: () => void;
  onTwoFactor: () => void;
  onLoginActivity: () => void;
}

function AccountSecurity({
  onChangePassword,
  onTwoFactor,
  onLoginActivity,
}: AccountSecurityProps) {
  const items: SecurityItem[] = [
    {
      key: "password",
      title: "Thay đổi mật khẩu",
      description: "Đã thay đổi cách đây 2 ngày trước",
      onClick: onChangePassword,
    },
    {
      key: "two-factor",
      title: "Xác thực hai bước",
      description: "Bật từ 11:00 12/02/2024",
      onClick: onTwoFactor,
    },
    {
      key: "activity",
      title: "Hoạt động đăng nhập",
      description: "Đã đăng nhập cách đây 2 giờ trước",
      onClick: onLoginActivity,
    },
  ];

  return (
    <section className="account-security">
      <h2 className="account-security__title">Mật khẩu và bảo mật</h2>

      <div className="account-security__content">
        <div className="account-security__intro">
          <h3>Đăng nhập &amp; khôi phục</h3>
          <p>
            Quản lý mật khẩu, hoạt động đăng nhập và phương thức khôi phục của
            bạn.
          </p>
        </div>

        <div className="account-security__list">
          {items.map((item) => (
            <button
              key={item.key}
              type="button"
              className="account-security__item"
              onClick={item.onClick}>
              <div className="account-security__item-info">
                <h4>{item.title}</h4>
                <p>{item.description}</p>
              </div>

              <span className="account-security__arrow">
                <ChevronRight size={30} strokeWidth={2} />
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export default AccountSecurity;
