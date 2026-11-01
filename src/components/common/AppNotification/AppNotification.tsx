import { useMemo, useState } from "react";
import { Badge, Button, Popover } from "antd";
import { Bell } from "lucide-react";
import "./AppNotification.css";

type NotificationTab = "organization" | "system";

interface NotificationItem {
  id: number;
  type: NotificationTab;
  title: string;
  content: string;
  location?: string;
  time: string;
  dateGroup: string;
  isRead: boolean;
}

const initialNotifications: NotificationItem[] = [
  {
    id: 1,
    type: "organization",
    title: "Chia sẻ bản tin từ Trung Ương",
    content:
      "Bạn có bản tin Khám phá Hội An - Việt Nam được chia sẻ từ Trung Ương.",
    location: "TP. Hồ Chí Minh",
    time: "15 phút trước",
    dateGroup: "Hôm nay",
    isRead: false,
  },
  {
    id: 2,
    type: "organization",
    title: "Phê duyệt bản tin",
    content: "Bản tin Khám phá Hội An - Việt Nam đã được phê duyệt.",
    time: "1 giờ trước",
    dateGroup: "Hôm nay",
    isRead: false,
  },
  {
    id: 3,
    type: "organization",
    title: "Chia sẻ nguồn tin",
    content:
      "Bạn có bản tin Khám phá Hội An - Việt Nam được chia sẻ đến Quận 1, Quận Tân Phú, Quận Phú Nhuận.",
    time: "5 giờ trước",
    dateGroup: "12/12/2023",
    isRead: true,
  },
  {
    id: 4,
    type: "organization",
    title: "Chia sẻ bản tin từ Trung Ương",
    content:
      "Bạn có bản tin Khám phá Hội An - Việt Nam được chia sẻ từ Trung Ương.",
    location: "TP. Hồ Chí Minh",
    time: "13:44:20 19/07/2021",
    dateGroup: "12/12/2023",
    isRead: true,
  },
  {
    id: 5,
    type: "organization",
    title: "Phê duyệt bản tin",
    content: "Bản tin Khám phá Hội An - Việt Nam đã được phê duyệt.",
    time: "13:44:20 19/07/2021",
    dateGroup: "12/12/2023",
    isRead: true,
  },
  {
    id: 6,
    type: "system",
    title: "Thông báo hệ thống",
    content: "Hệ thống đã cập nhật thành công.",
    time: "30 phút trước",
    dateGroup: "Hôm nay",
    isRead: false,
  },
];

const INITIAL_VISIBLE_COUNT = 5;

function AppNotification() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<NotificationTab>("organization");

  const [notifications, setNotifications] =
    useState<NotificationItem[]>(initialNotifications);

  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  const filteredNotifications = useMemo(
    () => notifications.filter((item) => item.type === activeTab),
    [notifications, activeTab],
  );

  const visibleNotifications = filteredNotifications.slice(0, visibleCount);

  const groupedNotifications = useMemo(() => {
    return visibleNotifications.reduce<Record<string, NotificationItem[]>>(
      (groups, notification) => {
        const group = notification.dateGroup;

        if (!groups[group]) {
          groups[group] = [];
        }

        groups[group].push(notification);

        return groups;
      },
      {},
    );
  }, [visibleNotifications]);

  const handleTabChange = (tab: NotificationTab) => {
    setActiveTab(tab);
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((item) =>
        item.type === activeTab ? { ...item, isRead: true } : item,
      ),
    );
  };

  const handleNotificationClick = (id: number) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isRead: true } : item)),
    );
  };

  const handleViewMore = () => {
    setVisibleCount((prev) => prev + INITIAL_VISIBLE_COUNT);
  };

  const notificationContent = (
    <div className="notification-popup">
      {/* Header */}
      <div className="notification-popup-header">
        <h3>Thông báo</h3>

        <button
          type="button"
          className="notification-mark-read"
          onClick={handleMarkAllAsRead}>
          Đánh dấu đã đọc
        </button>
      </div>

      {/* Tabs */}
      <div
        className="notification-tabs"
        role="tablist"
        aria-label="Loại thông báo">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "organization"}
          className={`notification-tab ${
            activeTab === "organization" ? "active" : ""
          }`}
          onClick={() => handleTabChange("organization")}>
          Thông báo tổ chức
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "system"}
          className={`notification-tab ${
            activeTab === "system" ? "active" : ""
          }`}
          onClick={() => handleTabChange("system")}>
          Thông báo hệ thống
        </button>
      </div>

      {/* Danh sách thông báo */}
      <div className="notification-list">
        {visibleNotifications.length === 0 ? (
          <div className="notification-empty">Không có thông báo</div>
        ) : (
          Object.entries(groupedNotifications).map(([date, items]) => (
            <section className="notification-group" key={date}>
              <div className="notification-date">
                <span>{date}</span>
                <div className="notification-date-line" />
              </div>

              <div className="notification-group-items">
                {items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`notification-card ${
                      !item.isRead ? "unread" : "read"
                    }`}
                    onClick={() => handleNotificationClick(item.id)}>
                    <div className="notification-card-heading">
                      <span className="notification-card-title">
                        {item.title}
                      </span>

                      <span className="notification-card-time">
                        {item.time}
                      </span>
                    </div>

                    <div className="notification-card-body">
                      <p>{item.content}</p>

                      {item.location && <p>Địa điểm: {item.location}.</p>}
                    </div>
                  </button>
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="notification-footer">
        {visibleCount < filteredNotifications.length && (
          <button
            type="button"
            className="notification-view-more"
            onClick={handleViewMore}>
            Xem thêm
          </button>
        )}
      </div>
    </div>
  );

  return (
    <Popover
      content={notificationContent}
      trigger="click"
      placement="bottomRight"
      open={open}
      onOpenChange={setOpen}
      arrow={false}
      overlayClassName="app-notification-popover">
      <Button
        type="text"
        className="header-icon-button notification-button"
        aria-label={`Thông báo, ${unreadCount} chưa đọc`}
        aria-expanded={open}>
        <Badge count={unreadCount} size="small" offset={[-2, 2]}>
          <Bell size={24} />
        </Badge>
      </Button>
    </Popover>
  );
}

export default AppNotification;
