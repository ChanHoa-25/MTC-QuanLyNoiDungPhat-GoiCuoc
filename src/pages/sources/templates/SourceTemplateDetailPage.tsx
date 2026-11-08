import { useState, useMemo, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Trash2, XCircle } from "lucide-react";
import { Form, message } from "antd";
import type { ColumnsType } from "antd/es/table";

import AppTabs from "../../../components/common/AppTabs";
import type { AppTabItem } from "../../../components/common/AppTabs";
import AppButton from "../../../components/common/AppButton";
import AppTable from "../../../components/common/AppTable";
import AppStatusTag from "../../../components/common/AppStatusTag";
import AppSelect from "../../../components/common/AppSelect";
import AppSearch from "../../../components/common/AppSearch";
import AppDateRangePicker from "../../../components/common/AppDateRangePicker";
import type { DateRangeValue } from "../../../components/common/AppDateRangePicker";
import AppFilter, { AppFilterField } from "../../../components/common/AppFilter";
import AppConfirmModal from "../../../components/common/AppConfirmModal";
import { useActionPanel } from "../../../contexts/ActionPanelContext";

import type {
  SourceTemplateItem,
  TemplateUsedNewsItem,
  BroadcastApprovalStatus,
  BroadcastPlayStatus,
  BroadcastType,
} from "./types/sourceTemplate.types";
import { useSourceTemplatesStore } from "./data/sourceTemplates.store";
import { MOCK_TEMPLATE_USED_NEWS } from "./data/sourceTemplates.mock";
import SourceTemplateCanvas from "./components/SourceTemplateCanvas";
import DeleteTemplateModal from "./components/DeleteTemplateModal";
import "./SourceTemplateDetailPage.css";

const DETAIL_TABS: AppTabItem[] = [
  { key: "info", label: "Thông tin bản mẫu" },
  { key: "used_news", label: "Bản tin sử dụng" },
];

export default function SourceTemplateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const { setActions } = useActionPanel();
  const { getTemplateById, deleteTemplates } = useSourceTemplatesStore();

  const [activeTab, setActiveTab] = useState("info");
  const [template, setTemplate] = useState<SourceTemplateItem | null>(null);

  // Modal xóa bản mẫu
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Tab 2: Danh sách bản tin sử dụng
  const [newsList, setNewsList] = useState<TemplateUsedNewsItem[]>(MOCK_TEMPLATE_USED_NEWS);
  const [selectedNewsKeys, setSelectedNewsKeys] = useState<React.Key[]>([]);

  // Bộ lọc bản tin
  const [newsType, setNewsType] = useState("all");
  const [approvalStatus, setApprovalStatus] = useState("all");
  const [playStatus, setPlayStatus] = useState("all");
  const [repeatType, setRepeatType] = useState("all");
  const [broadcastDateRange, setBroadcastDateRange] = useState<DateRangeValue>([null, null]);
  const [newsKeyword, setNewsKeyword] = useState("");

  // Modal hủy / xóa bản tin
  const [cancelNewsModalOpen, setCancelNewsModalOpen] = useState(false);
  const [deleteNewsModalOpen, setDeleteNewsModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      const found = getTemplateById(id);
      if (found) {
        setTemplate(found);
      } else {
        messageApi.error("Không tìm thấy bản mẫu!");
        navigate("/sources/templates");
      }
    }
  }, [id, getTemplateById, navigate, messageApi]);

  // Xóa bản mẫu
  const handleOpenDelete = useCallback(() => {
    if (!template) return;
    if (template.usageStatus === "in_use") {
      messageApi.error("Bản mẫu đang được sử dụng, không thể xóa!");
      return;
    }
    setDeleteModalOpen(true);
  }, [template, messageApi]);

  const handleConfirmDelete = () => {
    if (template) {
      deleteTemplates([template.id]);
      setDeleteModalOpen(false);
      messageApi.success("Đã xóa bản mẫu thành công!");
      navigate("/sources/templates");
    }
  };

  // Cấu hình ActionPanel
  useEffect(() => {
    if (activeTab === "info") {
      setActions([
        {
          key: "delete-template",
          icon: <Trash2 />,
          tooltip: "Xóa bản mẫu",
          danger: true,
          disabled: template?.usageStatus === "in_use",
          onClick: handleOpenDelete,
        },
      ]);
    } else {
      setActions([
        {
          key: "delete-news",
          icon: <Trash2 />,
          tooltip: "Xóa bản tin đã chọn",
          danger: true,
          disabled: selectedNewsKeys.length === 0,
          onClick: () => setDeleteNewsModalOpen(true),
        },
        {
          key: "cancel-news",
          icon: <XCircle />,
          tooltip: "Hủy bản tin đã chọn",
          disabled: selectedNewsKeys.length === 0,
          onClick: () => setCancelNewsModalOpen(true),
        },
      ]);
    }

    return () => setActions([]);
  }, [setActions, activeTab, template, handleOpenDelete, selectedNewsKeys.length]);

  // Lọc bản tin sử dụng
  const filteredNews = useMemo(() => {
    const search = newsKeyword.trim().toLowerCase();
    return newsList.filter((item) => {
      if (newsType !== "all" && item.type !== newsType) return false;
      if (approvalStatus !== "all" && item.approvalStatus !== approvalStatus) return false;
      if (playStatus !== "all" && item.playStatus !== playStatus) return false;
      if (repeatType !== "all" && item.repeatType !== repeatType) return false;
      if (search && !item.title.toLowerCase().includes(search) && !item.code.toLowerCase().includes(search)) {
        return false;
      }
      return true;
    });
  }, [newsList, newsType, approvalStatus, playStatus, repeatType, newsKeyword]);

  const newsColumns: ColumnsType<TemplateUsedNewsItem> = [
    { title: "Mã bản tin", dataIndex: "code", key: "code", width: 110 },
    { title: "Tiêu đề", dataIndex: "title", key: "title" },
    {
      title: "Loại bản tin",
      dataIndex: "type",
      key: "type",
      width: 130,
      render: (type: BroadcastType) =>
        type === "urgent" ? (
          <AppStatusTag variant="green" label="Tin ưu tiên" />
        ) : (
          <AppStatusTag variant="blue" label="Tin thường" />
        ),
    },
    {
      title: "Trạng thái duyệt",
      dataIndex: "approvalStatus",
      key: "approvalStatus",
      width: 140,
      render: (status: BroadcastApprovalStatus) => {
        if (status === "approved") return <AppStatusTag variant="green" label="Đã duyệt" />;
        if (status === "pending") return <AppStatusTag variant="yellow" label="Chờ duyệt" />;
        return <AppStatusTag variant="red" label="Từ chối duyệt" />;
      },
    },
    {
      title: "Trạng thái phát",
      dataIndex: "playStatus",
      key: "playStatus",
      width: 140,
      render: (status: BroadcastPlayStatus) => {
        if (status === "playing") return <AppStatusTag variant="blue" label="Đang phát" />;
        if (status === "paused") return <AppStatusTag variant="yellow" label="Tạm ngưng" />;
        if (status === "waiting") return <AppStatusTag variant="yellow" label="Chờ phát" />;
        if (status === "ended") return <AppStatusTag variant="gray" label="Đã kết thúc" />;
        return <AppStatusTag variant="red" label="Đã hủy" />;
      },
    },
    {
      title: "Kiểu lặp",
      dataIndex: "repeatType",
      key: "repeatType",
      width: 140,
      render: (r: string) => {
        if (r === "daily") return <span className="repeat-badge orange">Hàng ngày</span>;
        if (r === "weekly") return <span className="repeat-badge blue">Ngày trong tuần</span>;
        if (r === "monthly") return <span className="repeat-badge green">Ngày trong tháng</span>;
        return <span>-</span>;
      },
    },
    { title: "Ngày phát", dataIndex: "broadcastDate", key: "broadcastDate", width: 170 },
    { title: "Giờ phát", dataIndex: "broadcastTime", key: "broadcastTime", width: 160 },
    { title: "Cơ sở phát", dataIndex: "facilityName", key: "facilityName", width: 160 },
    { title: "Người tạo", dataIndex: "createdBy", key: "createdBy", width: 140 },
  ];

  if (!template) return null;

  return (
    <div className="source-template-detail-page">
      {contextHolder}

      {/* Tabs đầu trang */}
      <div className="detail-top-tabs">
        <AppTabs
          items={DETAIL_TABS}
          activeKey={activeTab}
          onChange={(k: string) => setActiveTab(k)}
        />
      </div>

      {/* TAB 1: THÔNG TIN BẢN MẪU */}
      {activeTab === "info" && (
        <div className="detail-info-card">
          <div className="detail-info-layout">
            {/* Cột trái */}
            <div className="detail-left-pane">
              <h2 className="detail-section-title">Chi tiết</h2>

              <div className="detail-field">
                <label className="detail-label">Tên bản mẫu</label>
                <div className="detail-value-box">{template.name}</div>
              </div>

              <div className="detail-field">
                <label className="detail-label">Tỷ lệ màn hình</label>
                <div className="detail-ratio-box">
                  <span>{template.screenHeight}</span>
                  <span>{template.screenWidth}</span>
                </div>
              </div>

              <div className="detail-field">
                <label className="detail-label">Nguồn thông tin đã gán</label>
                <div className="detail-assigned-media">
                  {template.zones.map((zone) => (
                    <div key={zone.id} className="assigned-media-card">
                      {zone.mediaThumbnail ? (
                        <img src={zone.mediaThumbnail} alt={zone.name} />
                      ) : (
                        <div className="empty-zone-thumb" />
                      )}
                      <div className="assigned-media-card__text">
                        <p>{zone.mediaTitle ?? zone.name}</p>
                        <span>{zone.widthPercent}% x {zone.heightPercent}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Cột giữa: Canvas */}
            <div className="detail-center-pane">
              <SourceTemplateCanvas
                zones={template.zones}
                activeZoneId={null}
                onSelectZone={() => { }}
                readOnly
              />

              <div className="detail-actions">
                <AppButton
                  variant="outline"
                  onClick={() => navigate("/sources/templates")}
                  width={120}
                >
                  Hủy
                </AppButton>
                {/* SRS: Chỉ cho phép chỉnh sửa khi bản mẫu Chưa sử dụng */}
                <AppButton
                  variant="primary"
                  disabled={template.usageStatus === "in_use"}
                  onClick={() => navigate(`/sources/templates/${template.id}/edit`)}
                  width={120}
                >
                  Chỉnh sửa
                </AppButton>
              </div>
            </div>

            {/* Cột phải: Layers thu nhỏ */}
            <div className="detail-right-pane">
              <div className="detail-layers-list">
                {template.zones.map((zone) => (
                  <div key={zone.id} className="detail-layer-item">
                    {zone.mediaThumbnail ? (
                      <img src={zone.mediaThumbnail} alt={zone.name} />
                    ) : (
                      <div className="empty-layer-box" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BẢN TIN SỬ DỤNG */}
      {activeTab === "used_news" && (
        <div className="detail-news-card">
          <h2 className="detail-news-title">Danh sách bản tin sử dụng bản mẫu</h2>

          {/* Bộ lọc */}
          <AppFilter showActions={false} gap={14}>
            <AppFilterField width={140}>
              <Form.Item label="Loại bản tin">
                <AppSelect
                  value={newsType}
                  onChange={(v: unknown) => setNewsType(String(v))}
                  options={[
                    { label: "Tất cả", value: "all" },
                    { label: "Tin ưu tiên", value: "urgent" },
                    { label: "Tin thường", value: "normal" },
                  ]}
                  width="100%"
                />
              </Form.Item>
            </AppFilterField>

            <AppFilterField width={150}>
              <Form.Item label="Trạng thái duyệt">
                <AppSelect
                  value={approvalStatus}
                  onChange={(v: unknown) => setApprovalStatus(String(v))}
                  options={[
                    { label: "Tất cả", value: "all" },
                    { label: "Đã duyệt", value: "approved" },
                    { label: "Chờ duyệt", value: "pending" },
                    { label: "Từ chối duyệt", value: "rejected" },
                  ]}
                  width="100%"
                />
              </Form.Item>
            </AppFilterField>

            <AppFilterField width={150}>
              <Form.Item label="Trạng thái phát">
                <AppSelect
                  value={playStatus}
                  onChange={(v: unknown) => setPlayStatus(String(v))}
                  options={[
                    { label: "Tất cả", value: "all" },
                    { label: "Đang phát", value: "playing" },
                    { label: "Tạm ngưng", value: "paused" },
                    { label: "Chờ phát", value: "waiting" },
                    { label: "Đã kết thúc", value: "ended" },
                  ]}
                  width="100%"
                />
              </Form.Item>
            </AppFilterField>

            <AppFilterField width={160}>
              <Form.Item label="Kiểu lặp">
                <AppSelect
                  value={repeatType}
                  onChange={(v: unknown) => setRepeatType(String(v))}
                  options={[
                    { label: "Tất cả", value: "all" },
                    { label: "Hàng ngày", value: "daily" },
                    { label: "Ngày trong tuần", value: "weekly" },
                    { label: "Ngày trong tháng", value: "monthly" },
                  ]}
                  width="100%"
                />
              </Form.Item>
            </AppFilterField>

            <AppFilterField width={300}>
              <Form.Item label="Thời gian bắt đầu phát">
                <AppDateRangePicker
                  value={broadcastDateRange}
                  onChange={(dates: DateRangeValue) => setBroadcastDateRange(dates)}
                  width="100%"
                />
              </Form.Item>
            </AppFilterField>

            <AppFilterField width={230}>
              <Form.Item label="Từ khóa">
                <AppSearch
                  placeholder="Tên kênh/ URL/ Tần số"
                  value={newsKeyword}
                  onChange={(v: string) => setNewsKeyword(v)}
                  onSearch={(v: string) => setNewsKeyword(v)}
                  width="100%"
                />
              </Form.Item>
            </AppFilterField>
          </AppFilter>

          {/* Bảng danh sách bản tin */}
          <div className="detail-news-table-wrapper">
            <AppTable<TemplateUsedNewsItem>
              columns={newsColumns}
              dataSource={filteredNews}
              rowKey="id"
              rowSelection={{
                selectedRowKeys: selectedNewsKeys,
                onChange: (keys: React.Key[]) => setSelectedNewsKeys(keys),
              }}
              pagination={{
                pageSize: 10,
                showTotal: (total: number, range: [number, number]) => (
                  <span>
                    Hiển thị {range[1] - range[0] + 1} nội dung trong mỗi trang (Tổng số: {total})
                  </span>
                ),
              }}
            />
          </div>
        </div>
      )}

      {/* Modal xác nhận xóa template */}
      <DeleteTemplateModal
        open={deleteModalOpen}
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />

      {/* Modal xác nhận xóa bản tin */}
      <AppConfirmModal
        open={deleteNewsModalOpen}
        type="delete"
        title="Xác nhận xóa bản tin"
        description={`Bạn có chắc chắn muốn xóa ${selectedNewsKeys.length} bản tin đã chọn khỏi danh sách?`}
        confirmText="Xác nhận"
        cancelText="Hủy"
        onConfirm={() => {
          setNewsList((prev) => prev.filter((n) => !selectedNewsKeys.includes(n.id)));
          setSelectedNewsKeys([]);
          setDeleteNewsModalOpen(false);
          messageApi.success("Đã xóa bản tin thành công!");
        }}
        onCancel={() => setDeleteNewsModalOpen(false)}
      />

      {/* Modal xác nhận hủy bản tin */}
      <AppConfirmModal
        open={cancelNewsModalOpen}
        type="restart"
        title="Xác nhận hủy bản tin"
        description={`Bạn có chắc chắn muốn hủy ${selectedNewsKeys.length} bản tin đã chọn?`}
        confirmText="Xác nhận"
        cancelText="Hủy"
        onConfirm={() => {
          setNewsList((prev) =>
            prev.map((n) => (selectedNewsKeys.includes(n.id) ? { ...n, playStatus: "cancelled" } : n))
          );
          setSelectedNewsKeys([]);
          setCancelNewsModalOpen(false);
          messageApi.success("Đã hủy bản tin thành công!");
        }}
        onCancel={() => setCancelNewsModalOpen(false)}
      />
    </div>
  );
}
