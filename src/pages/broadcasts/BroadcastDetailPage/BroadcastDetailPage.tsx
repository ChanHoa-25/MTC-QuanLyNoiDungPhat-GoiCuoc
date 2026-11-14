import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button, Empty, message } from "antd";
import type { TableColumnsType } from "antd";
import { Info, Play, Plus, CopyPlus, FileText } from "lucide-react";

import AppTabs from "../../../components/common/AppTabs";
import AppStatusTag from "../../../components/common/AppStatusTag";
import AppTable from "../../../components/common/AppTable";
import AppTableActions from "../../../components/common/AppTableActions";

import { useActionPanel } from "../../../contexts/ActionPanelContext";

import {
  broadcastsMock,
  typeLabels,
  approvalLabels,
  broadcastLabels,
  repeatLabels,
} from "../data/broadcasts.mock";

import type {
  BroadcastItem,
  BroadcastSource,
  BroadcastDevice,
  BroadcastStatus,
} from "../data/broadcasts.mock";

import type { AppStatusVariant } from "../../../components/common/AppStatusTag";

import "./BroadcastDetailPage.css";
import BroadcastHistory from "../BroadcastHistory/BroadcastHistory";

type DetailTab = "information" | "history";

const broadcastVariants: Record<BroadcastStatus, AppStatusVariant> = {
  playing: "blue",
  paused: "yellow",
  waiting: "outlineOrange",
  finished: "gray",
  "not-playing": "green",
  scheduled: "orange",
  cancelled: "red",
};

const formatDate = (date?: string | null): string => {
  if (!date) return "-";

  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
};

interface InfoRowProps {
  label: string;
  children: ReactNode;
}

function InfoRow({ label, children }: InfoRowProps) {
  return (
    <div className="broadcast-detail__info-row">
      <span className="broadcast-detail__label">{label}</span>
      <div className="broadcast-detail__value">{children}</div>
    </div>
  );
}

function BroadcastDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isChildFacility = searchParams.get("tab") === "child-facility";

  const backToList = isChildFacility
    ? "/broadcasts?tab=child-facility"
    : "/broadcasts";
  const { setActions } = useActionPanel();

  const [activeTab, setActiveTab] = useState<DetailTab>("information");

  const broadcast = useMemo<BroadcastItem | undefined>(
    () => broadcastsMock.find((item) => item.id === id),
    [id],
  );

  // ActionPanel dùng chung từ MainLayout
  useEffect(() => {
    if (!broadcast || activeTab === "history") {
      setActions([]);
      return;
    }

    setActions([
      {
        key: "create",
        icon: <Plus />,
        tooltip: "Thêm bản tin",
        onClick: () => navigate("/broadcasts/create"),
      },
      {
        key: "duplicate",
        icon: <CopyPlus />,
        tooltip: "Sao chép bản tin",
        disabled: true,
      },
    ]);

    return () => {
      setActions([]);
    };
  }, [broadcast, activeTab, navigate, setActions]);

  if (!broadcast) {
    return (
      <div className="broadcast-detail__empty-page">
        <Empty description="Không tìm thấy bản tin" />
        <Button onClick={() => navigate(backToList)}>
          Quay lại danh sách bản tin
        </Button>
      </div>
    );
  }

  const approvalVariant: AppStatusVariant =
    broadcast.approvalStatus === "approved"
      ? "green"
      : broadcast.approvalStatus === "rejected"
        ? "red"
        : "yellow";

  // Cột danh sách nguồn tin
  const sourceColumns: TableColumnsType<BroadcastSource> = [
    {
      title: "STT",
      key: "index",
      width: 55,
      align: "center",
      render: (_value, _record, index) => index + 1,
    },
    {
      title: "Nguồn tin",
      dataIndex: "name",
      key: "name",
      render: (_value, record) => (
        <div className="broadcast-detail__source">
          <span className="broadcast-detail__source-icon">
            <Play size={18} />
          </span>

          <div>
            <div className="broadcast-detail__source-name">{record.name}</div>
            {record.description && (
              <div className="broadcast-detail__source-description">
                {record.description}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Chất lượng",
      dataIndex: "qualities",
      key: "qualities",
      width: 155,
      render: (qualities: BroadcastSource["qualities"]) => (
        <div className="broadcast-detail__qualities">
          {qualities.map((quality) => (
            <span
              key={quality}
              className={`broadcast-detail__quality broadcast-detail__quality--${quality.toLowerCase()}`}>
              {quality}
            </span>
          ))}
        </div>
      ),
    },
    {
      title: "Thời lượng",
      dataIndex: "duration",
      key: "duration",
      width: 95,
      align: "center",
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 100,
      align: "center",
      render: (_value, record) => (
        <AppTableActions
          actions={[
            {
              key: "detail",
              icon: <Info size={16} />,
              tooltip: "Thông tin nguồn tin",
              onClick: () => message.info(`Nguồn tin: ${record.name}`),
            },
            {
              key: "play",
              icon: <Play size={16} />,
              tooltip: "Phát nguồn tin",
              disabled: true,
            },
          ]}
        />
      ),
    },
  ];

  // Cột danh sách thiết bị
  const deviceColumns: TableColumnsType<BroadcastDevice> = [
    {
      title: "STT",
      key: "index",
      width: 55,
      align: "center",
      render: (_value, _record, index) => index + 1,
    },
    {
      title: "Tên thiết bị",
      dataIndex: "name",
      key: "name",
      width: 140,
    },
    {
      title: "Cơ sở",
      dataIndex: "facility",
      key: "facility",
      width: 110,
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
    },
  ];

  return (
    <div className="broadcast-detail">
      <AppTabs
        className="broadcast-detail__tabs"
        items={[
          {
            key: "information",
            label: "Thông tin bản tin",
          },
          {
            key: "history",
            label: "Lịch sử phát bản tin",
          },
        ]}
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as DetailTab)}
      />

      <main className="broadcast-detail__panel">
        {activeTab === "history" ? (
          <BroadcastHistory />
        ) : (
          <>
            <h2>Thông tin bản tin</h2>

            <div className="broadcast-detail__grid">
              {/* Cột bên trái */}
              <div className="broadcast-detail__column">
                <section className="broadcast-detail__section">
                  <h3>1. Thông tin cơ bản</h3>

                  <InfoRow label="Mã bản tin:">{broadcast.code}</InfoRow>

                  <InfoRow label="Tiêu đề:">{broadcast.title}</InfoRow>

                  <InfoRow label="Loại bản tin:">
                    {typeLabels[broadcast.type]}
                  </InfoRow>

                  <InfoRow label="Lĩnh vực:">
                    {broadcast.category || "-"}
                  </InfoRow>

                  <InfoRow label="Loại nguồn tin:">
                    {broadcast.sourceType || "-"}
                  </InfoRow>

                  <InfoRow label="Nguồn phát bản tin:">
                    {broadcast.sourceName || "-"}
                  </InfoRow>

                  <InfoRow label="Trạng thái phê duyệt:">
                    <AppStatusTag
                      type="status"
                      variant={approvalVariant}
                      label={approvalLabels[broadcast.approvalStatus]}
                    />
                  </InfoRow>

                  {broadcast.approvalStatus === "rejected" ? (
                    <InfoRow label="Lý do từ chối:">
                      {broadcast.rejectReason || "-"}
                    </InfoRow>
                  ) : (
                    <InfoRow label="Trạng thái phát:">
                      <AppStatusTag
                        type="status"
                        variant={broadcastVariants[broadcast.broadcastStatus]}
                        label={broadcastLabels[broadcast.broadcastStatus]}
                      />
                    </InfoRow>
                  )}
                </section>

                <section className="broadcast-detail__section">
                  <h3>2. Cơ sở</h3>

                  {broadcast.facilityDisplay === "tags" ? (
                    <>
                      <InfoRow label="Trạng thái cơ sở:">
                        <div className="broadcast-detail__status-list">
                          <AppStatusTag
                            type="status"
                            variant="green"
                            label="Đang hoạt động"
                          />
                          <AppStatusTag
                            type="status"
                            variant="red"
                            label="Ngưng hoạt động"
                          />
                        </div>
                      </InfoRow>

                      <div className="broadcast-detail__facility-list">
                        {(broadcast.facilities ?? []).map((facility) => (
                          <AppStatusTag
                            key={facility.id}
                            type="label"
                            variant={facility.active ? "green" : "orange"}
                            label={facility.name}
                          />
                        ))}
                      </div>
                    </>
                  ) : broadcast.facilityDisplay === "devices" ? (
                    <AppTable<BroadcastDevice>
                      rowKey="id"
                      columns={deviceColumns}
                      dataSource={broadcast.devices ?? []}
                      pagination={false}
                      scroll={{ x: 500 }}
                      locale={{
                        emptyText: "Chưa có thiết bị",
                      }}
                    />
                  ) : (
                    <>
                      <InfoRow label="Cơ sở phát:">
                        {broadcast.facility || "-"}
                      </InfoRow>

                      <p className="broadcast-detail__note">
                        Chưa có dữ liệu chi tiết cơ sở.
                      </p>
                    </>
                  )}
                </section>
              </div>

              {/* Cột bên phải */}
              <div className="broadcast-detail__column">
                <section className="broadcast-detail__section">
                  <h3>3. Danh sách nguồn tin</h3>

                  <AppTable<BroadcastSource>
                    rowKey="id"
                    columns={sourceColumns}
                    dataSource={broadcast.sources ?? []}
                    pagination={false}
                    scroll={{ x: 580 }}
                    locale={{
                      emptyText: "Chưa có dữ liệu nguồn tin",
                    }}
                  />
                </section>

                <section className="broadcast-detail__section">
                  <h3>4. Lịch phát bản tin</h3>

                  <InfoRow label="Ngày phát:">
                    {formatDate(broadcast.startDate)} -{" "}
                    {formatDate(broadcast.endDate)}
                  </InfoRow>

                  <InfoRow label="Giờ phát:">
                    <div className="broadcast-detail__time-list">
                      {broadcast.timeSlots?.length ? (
                        broadcast.timeSlots.map((slot, index) => (
                          <div key={index}>
                            {slot.startTime} - {slot.endTime} | Phát{" "}
                            {slot.times} lần
                          </div>
                        ))
                      ) : (
                        <span>
                          {broadcast.startTime} - {broadcast.endTime}
                        </span>
                      )}
                    </div>
                  </InfoRow>

                  <InfoRow label="Chế độ phát bản tin:">
                    {broadcast.broadcastMode || "-"}
                  </InfoRow>

                  <InfoRow label="Kiểu lặp lại bản tin:">
                    <div>
                      <div>{repeatLabels[broadcast.repeatType]}</div>

                      {broadcast.repeatDays &&
                        broadcast.repeatDays.length > 0 && (
                          <div className="broadcast-detail__repeat-days">
                            {broadcast.repeatDays.map((day) => (
                              <span key={day}>{day}</span>
                            ))}
                          </div>
                        )}
                    </div>
                  </InfoRow>
                </section>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default BroadcastDetailPage;
