import "./AccountSidebar.css";

export type AccountTab = "information" | "security";

interface AccountSidebarProps {
  activeTab: AccountTab;
  onChange: (tab: AccountTab) => void;
}

function AccountSidebar({ activeTab, onChange }: AccountSidebarProps) {
  return (
    <aside className="account-sidebar">
      <div className="account-sidebar__heading">Menu</div>

      <button
        type="button"
        className={`account-sidebar__item ${
          activeTab === "information" ? "account-sidebar__item--active" : ""
        }`}
        onClick={() => onChange("information")}>
        Thông tin cá nhân
      </button>

      <button
        type="button"
        className={`account-sidebar__item ${
          activeTab === "security" ? "account-sidebar__item--active" : ""
        }`}
        onClick={() => onChange("security")}>
        Mật khẩu và bảo mật
      </button>
    </aside>
  );
}

export default AccountSidebar;
