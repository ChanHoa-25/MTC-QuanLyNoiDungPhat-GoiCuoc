import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import {
  FilePlus,
  Info,
  Menu,
  Plus,
  SquarePen,
  Trash2,
  X,
  AlertTriangle,
} from "lucide-react";
import { message } from "antd";

import { SYSTEM_ROUTES } from "../../../constants/route.constants";
import { useActionPanel } from "../../../contexts/ActionPanelContext";

import AppTable from "../../../components/common/AppTable";
import AppTableActions from "../../../components/common/AppTableActions";
import AppSearch from "../../../components/common/AppSearch";
import AppFilter, {
  AppFilterField,
} from "../../../components/common/AppFilter";
import AppDateRangePicker from "../../../components/common/AppDateRangePicker";
import AppSelect from "../../../components/common/AppSelect";
import AppConfirmModal from "../../../components/common/AppConfirmModal";
import AppStatusTag from "../../../components/common/AppStatusTag";

import type {
  OrganizationItem,
  ConfirmModalType,
} from "./types/organization.types";

import { INITIAL_ORGS } from "./data/organizations.mock";

import OrganizationDetailPage from "./OrganizationDetailPage";
import OrganizationForm from "./components/OrganizationForm";
import OrganizationPackage from "./components/OrganizationPackage";

import "./OrganizationsPage.css";

const OrganizationsPage: React.FC = () => {
  const { id: routeOrgId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setActions } = useActionPanel();

  const [organizations, setOrganizations] = useState<OrganizationItem[]>(() => [
    ...INITIAL_ORGS,
  ]);

  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<OrganizationItem | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);

  const [confirmType, setConfirmType] = useState<ConfirmModalType>(null);
  const [targetOrg, setTargetOrg] = useState<OrganizationItem | null>(null);

  const targetId = routeOrgId || searchParams.get("id");

  const isEditAction =
    searchParams.get("action") === "edit" ||
    searchParams.get("view") === "detail" ||
    Boolean(targetId);

  useEffect(() => {
    if (targetId) {
      const found = organizations.find(
        (item) => item.id === targetId || item.code === targetId,
      );

      if (found) {
        setSelectedOrg(found);
      } else if (organizations.length > 0) {
        setSelectedOrg(organizations[0]);
      }
    } else if (isEditAction && organizations.length > 0 && !selectedOrg) {
      setSelectedOrg(organizations[0]);
    } else if (!isEditAction && !targetId && selectedOrg) {
      setSelectedOrg(null);
    }
  }, [targetId, isEditAction, organizations, selectedOrg]);

  useEffect(() => {
    if (selectedOrg) {
      setActions([]);
      return;
    }

    setActions([
      {
        key: "add",
        icon: <Plus />,
        tooltip: "Thêm mới",
        onClick: () => setIsCreateModalOpen(true),
      },
      {
        key: "trash",
        icon: <Trash2 />,
        tooltip: "Thùng rác",
        danger: true,
        onClick: () => {
          const org = organizations.find(
            (item) => item.id === selectedRowKeys[0],
          );

          if (!org) {
            message.warning("Vui lòng chọn tổ chức cần xóa");
            return;
          }

          setTargetOrg(org);
          setConfirmType("DELETE_ORG");
        },
      },
    ]);

    return () => setActions([]);
  }, [setActions, selectedOrg, organizations, selectedRowKeys]);

  const handleSelectOrg = (org: OrganizationItem, openEdit = false) => {
    setSelectedOrg(org);
    setSearchParams({ action: "edit", id: org.id });

    if (openEdit) {
      setIsEditModalOpen(true);
    }
  };

  const handleBackFromDetail = () => {
    setSelectedOrg(null);
    setSearchParams({});
    navigate(SYSTEM_ROUTES.ORGANIZATIONS);
  };

  const filteredOrganizations = useMemo(() => {
    return organizations.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        item.code.toLowerCase().includes(searchKeyword.toLowerCase());

      const matchStatus =
        statusFilter === "ALL" || item.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [organizations, searchKeyword, statusFilter]);

  const handleCreateOrganization = (payload: Record<string, any>) => {
    const newOrg: OrganizationItem = {
      id: `org-${Date.now()}`,
      stt: organizations.length + 1,
      code: payload.code || `ORG-${String(Date.now()).slice(-4)}`,
      name: payload.name || "Tổ chức mới",
      districtCount: 0,
      packageInfo: "Chưa có gói",
      effectiveDate: payload.effectiveDate || "—",
      expiryDate: payload.expiryDate || "—",
      expiredDays: "—",
      status: "orange",
      statusLabel: "Chưa diễn ra",
      representativeLastName: payload.lastName || "",
      representativeFirstName: payload.firstName || "",
      phone: payload.phone || "",
      birthday: payload.birthday || "",
      username: payload.username || "",
      email: payload.email || "",
      timezone: payload.timezone || "Hà Nội (GMT+07:00)",
    };

    setOrganizations((prev) => [newOrg, ...prev]);
  };

  const handleEditOrganization = (payload: Record<string, any>) => {
    if (!selectedOrg) return;

    const updatedOrg: OrganizationItem = {
      ...selectedOrg,
      code: payload.code || selectedOrg.code,
      name: payload.name || selectedOrg.name,
      representativeLastName:
        payload.lastName || selectedOrg.representativeLastName || "",
      representativeFirstName:
        payload.firstName || selectedOrg.representativeFirstName || "",
      phone: payload.phone || selectedOrg.phone || "",
      birthday: payload.birthday || selectedOrg.birthday || "",
      username: payload.username || selectedOrg.username || "",
      email: payload.email || selectedOrg.email || "",
      timezone:
        payload.timezone || selectedOrg.timezone || "Hà Nội (GMT+07:00)",
    };

    setOrganizations((prev) =>
      prev.map((item) => (item.id === selectedOrg.id ? updatedOrg : item)),
    );

    setSelectedOrg(updatedOrg);
  };

  const handleConfirmAction = () => {
    if (confirmType === "DELETE_ORG" && targetOrg) {
      const currentOrgId = targetOrg.id;

      setOrganizations((prev) =>
        prev.filter((item) => item.id !== currentOrgId),
      );

      setSelectedRowKeys((prev) => prev.filter((key) => key !== currentOrgId));

      if (selectedOrg?.id === currentOrgId) {
        setSelectedOrg(null);
        setSearchParams({});
      }
    } else if (confirmType === "CANCEL_ORG" && targetOrg) {
      setOrganizations((prev) =>
        prev.map((item) =>
          item.id === targetOrg.id
            ? {
                ...item,
                status: "darkRed",
                statusLabel: "Hủy bỏ tổ chức",
              }
            : item,
        ),
      );
    }

    setConfirmType(null);
    setTargetOrg(null);
  };

  const orgColumns = [
    {
      title: "Mã định danh",
      dataIndex: "code",
      key: "code",
      width: 120,
    },
    {
      title: "Tên tổ chức",
      dataIndex: "name",
      key: "name",
      width: 220,
      render: (name: string, record: OrganizationItem) => (
        <span
          className="org-table-name"
          onClick={() => handleSelectOrg(record)}>
          {name}
        </span>
      ),
    },
    {
      title: "Địa bàn trực thuộc",
      dataIndex: "districtCount",
      key: "districtCount",
      width: 150,
    },
    {
      title: "Gói cước gia hạn",
      dataIndex: "packageInfo",
      key: "packageInfo",
      width: 150,
    },
    {
      title: "Thời gian hiệu lực",
      dataIndex: "effectiveDate",
      key: "effectiveDate",
      width: 150,
    },
    {
      title: "Thời gian hết hạn",
      dataIndex: "expiryDate",
      key: "expiryDate",
      width: 150,
    },
    {
      title: "Số ngày hết hạn",
      dataIndex: "expiredDays",
      key: "expiredDays",
      width: 130,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 160,
      render: (status: string, record: OrganizationItem) => (
        <AppStatusTag
          type="status"
          variant={status as any}
          label={record.statusLabel}
        />
      ),
    },

    {
      title: "Thao tác",
      key: "actions",
      width: 210,
      render: (_: unknown, record: OrganizationItem) => (
        <AppTableActions
          actions={[
            {
              key: "edit",
              icon: <SquarePen />,
              tooltip: "Chỉnh sửa",
              onClick: () => handleSelectOrg(record, true),
            },
            {
              key: "add",
              icon: <FilePlus />,
              tooltip: "Thêm mới",
              onClick: () => setIsCreateModalOpen(true),
            },
            {
              key: "cancel",
              icon: <X />,
              tooltip: "Hủy tổ chức",
              onClick: () => {
                setTargetOrg(record);
                setConfirmType("CANCEL_ORG");
              },
            },
            {
              key: "list",
              icon: <Menu />,
              tooltip: "Danh sách",
              onClick: () => handleSelectOrg(record),
            },
            {
              key: "info",
              icon: <Info />,
              tooltip: "Thông tin chi tiết",
              onClick: () => handleSelectOrg(record),
            },
          ]}
        />
      ),
    },
  ];

  const getConfirmConfig = () => {
    switch (confirmType) {
      case "DELETE_ORG":
        return {
          title: "Xác nhận xóa tổ chức",
          description: "Tổ chức này sẽ bị xóa và không thể khôi phục.",
          type: "delete" as const,
          icon: <Trash2 size={42} />,
          confirmText: "Tiếp tục",
        };

      case "CANCEL_ORG":
        return {
          title: "Xác nhận hủy bỏ tổ chức",
          description: (
            <>
              Gói cước <strong>{targetOrg?.packageInfo || "—"}</strong> sẽ bị
              hủy và dữ liệu sẽ bị xóa sau khi hủy bỏ tổ chức.
            </>
          ),
          type: "delete" as const,
          icon: <X size={42} />,
          confirmText: "Đồng ý",
        };

      case "RENEW_PACKAGE":
        return {
          title: "Xác nhận gia hạn gói cước",
          description: (
            <>
              Gói cước <strong>{targetOrg?.packageInfo || "—"}</strong> sẽ được
              tiếp tục gia hạn. Vui lòng xác nhận để tiếp tục.
            </>
          ),
          type: "restart" as const,
          icon: <FilePlus size={42} />,
          confirmText: "Tiếp tục",
        };

      case "PACKAGE_INACTIVE":
        return {
          title: "Gói cước ngừng hoạt động",
          description: (
            <>
              Không thể gia hạn vì gói cước{" "}
              <strong>{targetOrg?.packageInfo || "—"}</strong> đã ngừng hoạt
              động. Vui lòng lựa chọn gói cước khác để sử dụng.
            </>
          ),
          type: "delete" as const,
          icon: <AlertTriangle size={42} />,
          confirmText: "Tiếp tục",
        };

      case "CANCEL_PACKAGE_CHANGE":
        return {
          title: "Xác nhận hủy gói cước thay đổi",
          description: (
            <>
              Gói cước thay đổi <strong>{targetOrg?.packageInfo || "—"}</strong>{" "}
              sẽ hủy bỏ.
            </>
          ),
          type: "delete" as const,
          icon: <X size={42} />,
          confirmText: "Đồng ý",
        };

      default:
        return {
          title: "",
          description: "",
          type: "success" as const,
          icon: <X size={42} />,
          confirmText: "Đồng ý",
        };
    }
  };

  const confirmCfg = getConfirmConfig();

  return (
    <div className="org-page-wrapper">
      {!selectedOrg ? (
        <div className="org-list-container">
          <div className="org-summary-cards">
            <div className="org-stat-card org-stat-card--pink">
              <div className="org-stat-card__value">20</div>
              <div className="org-stat-card__label">Tổng số tổ chức</div>
            </div>

            <div className="org-stat-card org-stat-card--blue">
              <div className="org-stat-card__value">300</div>
              <div className="org-stat-card__label">Tổng số địa bàn</div>
            </div>
          </div>

          <div className="org-filter-container">
            <AppFilter showActions={false} gap={16} className="org-filter">
              <AppFilterField width="100%" className="org-filter-status">
                <label className="org-filter-label">Trạng thái</label>

                <AppSelect
                  width="100%"
                  value={statusFilter}
                  onChange={(value) =>
                    setStatusFilter((value as string) ?? "ALL")
                  }
                  options={[
                    { label: "Tất cả", value: "ALL" },
                    { label: "Còn hạn", value: "green" },
                    { label: "Hết hạn", value: "red" },
                    { label: "Chưa diễn ra", value: "orange" },
                    { label: "Hủy bỏ tổ chức", value: "darkRed" },
                  ]}
                />
              </AppFilterField>

              <AppFilterField width="100%" className="org-filter-effective">
                <label className="org-filter-label">Thời gian hiệu lực</label>

                <AppDateRangePicker
                  width="100%"
                  startPlaceholder="02/02/2000"
                  endPlaceholder="00/00/0000"
                />
              </AppFilterField>

              <AppFilterField width="100%" className="org-filter-expiry">
                <label className="org-filter-label">Thời gian hết hạn</label>

                <AppDateRangePicker
                  width="100%"
                  startPlaceholder="02/02/2000"
                  endPlaceholder="00/00/0000"
                />
              </AppFilterField>

              <AppFilterField width="100%" className="org-filter-search">
                <label className="org-filter-label">Từ khóa</label>

                <AppSearch
                  width="100%"
                  placeholder="Tên đăng nhập/ tên người dùng..."
                  value={searchKeyword}
                  onChange={(value) => setSearchKeyword(value)}
                />
              </AppFilterField>
            </AppFilter>
          </div>

          <div className="org-table-section">
            <h3 className="org-table-title">Danh sách tổ chức</h3>
            <div className="org-table-wrapper">
              <AppTable
                className="org-table"
                columns={orgColumns}
                dataSource={filteredOrganizations}
                rowKey="id"
                selectable
                rowSelection={{
                  selectedRowKeys,
                  onChange: (keys) => setSelectedRowKeys([...keys]),
                }}
                pagination={{ pageSize: 10 }}
              />
            </div>
          </div>
        </div>
      ) : (
        <OrganizationDetailPage
          org={selectedOrg}
          onBack={handleBackFromDetail}
          onEdit={() => setIsEditModalOpen(true)}
          onChangePackage={() => setIsPackageModalOpen(true)}
        />
      )}

      <OrganizationForm
        open={isCreateModalOpen}
        mode="create"
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={(data) => {
          handleCreateOrganization(data);
          setIsCreateModalOpen(false);
        }}
      />

      <OrganizationForm
        open={isEditModalOpen}
        mode="edit"
        initialData={selectedOrg}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={(data) => {
          handleEditOrganization(data);
          setIsEditModalOpen(false);
        }}
      />

      <OrganizationPackage
        open={isPackageModalOpen}
        onClose={() => setIsPackageModalOpen(false)}
      />

      {confirmType && (
        <AppConfirmModal
          open={confirmType !== null}
          type={confirmCfg.type}
          icon={confirmCfg.icon}
          title={confirmCfg.title}
          description={confirmCfg.description}
          confirmText={confirmCfg.confirmText}
          onConfirm={handleConfirmAction}
          onCancel={() => {
            setConfirmType(null);
            setTargetOrg(null);
          }}
        />
      )}
    </div>
  );
};

export default OrganizationsPage;
