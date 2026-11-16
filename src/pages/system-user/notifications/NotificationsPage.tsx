import React, { useState, useMemo, useEffect } from "react";
import { message } from "antd";
import { Info, Plus, Trash2 } from "lucide-react";

import { useActionPanel } from "../../../contexts/ActionPanelContext";

import AppTable from "../../../components/common/AppTable";
import AppTableActions from "../../../components/common/AppTableActions";
import AppSearch from "../../../components/common/AppSearch";
import AppSelect from "../../../components/common/AppSelect";
import AppConfirmModal from "../../../components/common/AppConfirmModal";
import AppStatusTag from "../../../components/common/AppStatusTag";

import type {
  NotificationFormValues,
  NotificationItem,
  ConfirmModalType,
} from "./types/notification.types";

import { INITIAL_NOTIFS } from "./data/notifications.mock";
import NotificationForm from "./components/NotificationForm";

import "./NotificationsPage.css";

const NotificationsPage: React.FC = () => {
  const { setActions } = useActionPanel();

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => [
    ...INITIAL_NOTIFS,
  ]);

  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const [selectedNotif, setSelectedNotif] = useState<NotificationItem | null>(
    null,
  );

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");

  const [confirmType, setConfirmType] = useState<ConfirmModalType>(null);
  const [targetNotif, setTargetNotif] = useState<NotificationItem | null>(null);

  const filteredNotifs = useMemo(() => {
    return notifications.filter((item) => {
      const matchSearch =
        item.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        item.content.toLowerCase().includes(searchKeyword.toLowerCase());

      const matchStatus =
        statusFilter === "ALL" || item.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [notifications, searchKeyword, statusFilter]);

  const handleConfirmAction = () => {
    if (confirmType === "DELETE_NOTIF" && targetNotif) {
      const currentId = targetNotif.id;

      setNotifications((prev) => prev.filter((item) => item.id !== currentId));

      setSelectedRowKeys((prev) => prev.filter((key) => key !== currentId));
    }

    setConfirmType(null);
    setTargetNotif(null);
  };

  const openCreateModal = () => {
    setSelectedNotif(null);
    setFormMode("create");
    setIsFormModalOpen(true);
  };

  const openEditModal = (record: NotificationItem) => {
    setSelectedNotif(record);
    setFormMode("edit");
    setIsFormModalOpen(true);
  };

  const handleSubmitNotification = (values: NotificationFormValues) => {
    const now = new Date();

    const dateParts = [
      String(now.getDate()).padStart(2, "0"),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getFullYear()).slice(-2),
    ];

    const currentTimestamp = `${dateParts.join("/")} ${String(
      now.getHours(),
    ).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const sendTime =
      values.date && values.time
        ? `${values.date} ${values.time}`
        : "Chưa lên lịch";

    const receivers =
      values.receivers.length > 2
        ? `${values.receivers.slice(0, 2).join(", ")}, ...`
        : values.receivers.join(", ");

    if (formMode === "edit" && selectedNotif) {
      setNotifications((previous) =>
        previous.map((item) =>
          item.id === selectedNotif.id
            ? {
                ...item,
                title: values.title,
                content: values.content,
                receivers,
                receiverList: values.receivers,
                sendTime,
              }
            : item,
        ),
      );
    } else {
      const newNotification: NotificationItem = {
        id: `nt-${Date.now()}`,
        title: values.title,
        content: values.content,
        status: "unsent",
        statusLabel: "Chưa gửi",
        receivers,
        receiverList: values.receivers,
        sendTime,
        createTime: currentTimestamp,
        creator: "Admin",
      };

      setNotifications((previous) => [newNotification, ...previous]);

      setSelectedRowKeys([]);
      setStatusFilter("ALL");
      setSearchKeyword("");
    }
  };

  useEffect(() => {
    setActions([
      {
        key: "add",
        icon: <Plus />,
        tooltip: "Thêm mới",
        onClick: openCreateModal,
      },
      {
        key: "trash",
        icon: <Trash2 />,
        tooltip: "Xóa",
        danger: true,
        onClick: () => {
          const target = notifications.find(
            (item) => item.id === selectedRowKeys[0],
          );

          if (!target) {
            message.warning("Vui lòng chọn thông báo để xóa");
            return;
          }

          setTargetNotif(target);
          setConfirmType("DELETE_NOTIF");
        },
      },
    ]);

    return () => setActions([]);
  }, [setActions, notifications, selectedRowKeys]);

  const columns = [
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      width: 220,
      ellipsis: true,
    },
    {
      title: "Nội dung",
      dataIndex: "content",
      key: "content",
      width: 250,
      ellipsis: true,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string, record: NotificationItem) => (
        <AppStatusTag
          type="status"
          variant={status === "sent" ? "green" : "orange"}
          label={record.statusLabel}
        />
      ),
    },
    {
      title: "Tổ chức nhận thông báo",
      dataIndex: "receivers",
      key: "receivers",
      width: 200,
      ellipsis: true,
    },
    {
      title: "Thời gian gửi",
      dataIndex: "sendTime",
      key: "sendTime",
      width: 140,
    },
    {
      title: "Thời gian tạo",
      dataIndex: "createTime",
      key: "createTime",
      width: 140,
    },
    {
      title: "Người tạo",
      dataIndex: "creator",
      key: "creator",
      width: 140,
    },
    {
      title: "Chi tiết",
      key: "actions",
      width: 80,
      align: "center" as const,
      render: (_: unknown, record: NotificationItem) => (
        <AppTableActions
          actions={[
            {
              key: "detail",
              icon: <Info />,
              tooltip: "Xem chi tiết",
              onClick: () => openEditModal(record),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="notif-page-wrapper">
      <div className="notif-main-card">
        <h2 className="notif-header-title">Danh sách thông báo</h2>

        <div className="notif-filter-row">
          <div className="notif-filter-status">
            <label className="notif-filter-label">Trạng thái</label>

            <AppSelect
              width="100%"
              value={statusFilter}
              onChange={(value) => setStatusFilter((value as string) ?? "ALL")}
              options={[
                { label: "Tất cả", value: "ALL" },
                { label: "Đã gửi", value: "sent" },
                { label: "Chưa gửi", value: "unsent" },
              ]}
            />
          </div>

          <div className="notif-filter-search">
            <label className="notif-filter-label">Từ khóa</label>

            <AppSearch
              width="100%"
              placeholder="Nhập từ khóa"
              value={searchKeyword}
              onChange={(value) => setSearchKeyword(value)}
            />
          </div>
        </div>

        <div className="notif-table-wrapper">
          <AppTable
            columns={columns}
            dataSource={filteredNotifs}
            rowKey="id"
            selectable
            rowSelection={{
              selectedRowKeys,
              onChange: (keys) => setSelectedRowKeys([...keys]),
            }}
            pagination={{ pageSize: 10 }}
            scroll={{ x: "max-content" }}
          />
        </div>
      </div>

      <NotificationForm
        open={isFormModalOpen}
        mode={formMode}
        initialData={formMode === "edit" ? selectedNotif : null}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleSubmitNotification}
      />

      {confirmType && (
        <AppConfirmModal
          open={confirmType !== null}
          type="delete"
          title="Xác nhận xóa thông báo"
          description="Thông báo này sẽ bị xóa và không thể khôi phục."
          confirmText="Tiếp tục"
          onConfirm={handleConfirmAction}
          onCancel={() => {
            setConfirmType(null);
            setTargetNotif(null);
          }}
        />
      )}
    </div>
  );
};

export default NotificationsPage;
