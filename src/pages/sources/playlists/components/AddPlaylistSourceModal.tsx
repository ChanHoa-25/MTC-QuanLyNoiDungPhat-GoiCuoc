import { useState, useMemo } from "react";
import { Checkbox, Form } from "antd";
import { Play } from "lucide-react";
import type { ColumnsType } from "antd/es/table";

import AppModal from "../../../../components/common/AppModal";
import AppButton from "../../../../components/common/AppButton";
import AppSelect from "../../../../components/common/AppSelect";
import AppSearch from "../../../../components/common/AppSearch";
import AppTable from "../../../../components/common/AppTable";
import AppIconButton from "../../../../components/common/AppIconButton";
import AppTimePicker from "../../../../components/common/AppTimePicker";

import { usePlaylistPickableSources } from "../data/usePlaylistPickableSources";
import { PLAYLIST_CATEGORY_OPTIONS } from "../data/sourcePlaylists.mock";
import type { PlaylistEntry, PlaylistPickableSource, PlaylistSourceType } from "../types/sourcePlaylist.types";
import dayjs from "dayjs";
import "./AddPlaylistSourceModal.css";

interface AddPlaylistSourceModalProps {
  open: boolean;
  onCancel: () => void;
  onSave: (newEntries: PlaylistEntry[]) => void;
  onPreview: (source: { sourceId: string; sourceType: PlaylistSourceType; name: string; thumbnail?: string }) => void;
}

interface SelectedCandidate {
  source: PlaylistPickableSource;
  duration: string;
}

export default function AddPlaylistSourceModal({
  open,
  onCancel,
  onSave,
  onPreview,
}: AddPlaylistSourceModalProps) {
  const { approvedMedia, templateSources } = usePlaylistPickableSources();

  // Nguồn thông tin: Bản mẫu | Media
  const [sourceType, setSourceType] = useState<PlaylistSourceType>("template");
  // Lĩnh vực
  const [category, setCategory] = useState<string>("Tin tức");
  // Bộ lọc media types (khi chọn Media)
  const [mediaTypes, setMediaTypes] = useState<string[]>(["video", "audio", "image"]);

  // Tìm kiếm trái / phải
  const [leftSearch, setLeftSearch] = useState("");
  const [rightSearch, setRightSearch] = useState("");

  // Danh sách các nguồn đã được chọn tạm thời ở cột phải
  const [selectedCandidates, setSelectedCandidates] = useState<SelectedCandidate[]>([]);

  // Lọc danh sách nguồn ứng viên ở cột trái
  const availableCandidates = useMemo(() => {
    const list = sourceType === "template" ? templateSources : approvedMedia;
    const search = leftSearch.trim().toLowerCase();

    return list.filter((item) => {
      // Khi là Media: lọc theo checkbox media types (video/audio/image)
      if (sourceType === "media" && item.mediaType && !mediaTypes.includes(item.mediaType)) {
        return false;
      }
      // Lọc theo từ khóa
      if (search && !item.name.toLowerCase().includes(search)) {
        return false;
      }
      return true;
    });
  }, [sourceType, templateSources, approvedMedia, leftSearch, mediaTypes]);

  // Lọc danh sách đã chọn ở cột phải theo từ khóa
  const filteredSelectedCandidates = useMemo(() => {
    const search = rightSearch.trim().toLowerCase();
    if (!search) return selectedCandidates;
    return selectedCandidates.filter((c) => c.source.name.toLowerCase().includes(search));
  }, [selectedCandidates, rightSearch]);

  const handleAddCandidate = (source: PlaylistPickableSource) => {
    setSelectedCandidates((prev) => [
      ...prev,
      {
        source,
        duration: source.duration || "00:05:30",
      },
    ]);
  };

  const handleRemoveCandidate = (index: number) => {
    setSelectedCandidates((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleDurationCandidateChange = (index: number, timeStr: string) => {
    setSelectedCandidates((prev) =>
      prev.map((c, idx) => (idx === index ? { ...c, duration: timeStr } : c))
    );
  };

  const handleSave = () => {
    const newEntries: PlaylistEntry[] = selectedCandidates.map((c, idx) => ({
      id: `entry-${Date.now()}-${idx}`,
      sourceId: c.source.sourceId,
      sourceType: c.source.sourceType,
      name: c.source.name,
      duration: c.duration,
      mediaType: c.source.mediaType,
      thumbnail: c.source.thumbnail,
    }));

    onSave(newEntries);
    setSelectedCandidates([]);
    onCancel();
  };

  // Cột trái dạng bảng (áp dụng cho Bản mẫu hoặc Media dạng table)
  const leftTableColumns: ColumnsType<PlaylistPickableSource> = [
    {
      title: "STT",
      key: "stt",
      width: 50,
      align: "center",
      render: (_: unknown, __: unknown, idx: number) => idx + 1,
    },
    {
      title: "Tên nguồn thông tin",
      dataIndex: "name",
      key: "name",
      ellipsis: true,
      render: (name: string, record: PlaylistPickableSource) => (
        <div className="candidate-name-cell">
          <AppIconButton
            icon={<Play size={14} fill="currentColor" />}
            tooltip="Nghe thử"
            onClick={() =>
              onPreview({
                sourceId: record.sourceId,
                sourceType: record.sourceType,
                name: record.name,
                thumbnail: record.thumbnail,
              })
            }
          />
          <span className="candidate-name-text" title={name}>
            {name}
          </span>
        </div>
      ),
    },
    {
      title: "Thời lượng",
      dataIndex: "duration",
      key: "duration",
      width: 90,
      align: "center",
    },
    {
      title: "",
      key: "action",
      width: 70,
      align: "center",
      render: (_: unknown, record: PlaylistPickableSource) => (
        <button
          type="button"
          className="candidate-action-btn candidate-action-btn--add"
          onClick={() => handleAddCandidate(record)}
        >
          Thêm
        </button>
      ),
    },
  ];

  return (
    <AppModal
      open={open}
      onCancel={onCancel}
      width={1000}
      title={null}
      className="add-playlist-source-modal"
    >
      <div className="add-source-content">
        <h2 className="add-source-title">Tạo Danh sách phát</h2>

        {/* Bộ lọc trên cùng: Nguồn thông tin + Lĩnh vực */}
        <div className="add-source-filters">
          <div className="filter-group">
            <Form.Item label="Nguồn thông tin">
              <AppSelect
                value={sourceType}
                onChange={(val) => setSourceType(val as PlaylistSourceType)}
                options={[
                  { label: "Bản mẫu", value: "template" },
                  { label: "Media", value: "media" },
                ]}
                width={200}
              />
            </Form.Item>
          </div>

          <div className="filter-group">
            <Form.Item label="Lĩnh vực" required>
              <AppSelect
                value={category}
                onChange={(val) => setCategory(String(val))}
                options={PLAYLIST_CATEGORY_OPTIONS}
                width={200}
              />
            </Form.Item>
          </div>
        </div>

        {/* Checkbox lọc Media (chỉ hiện khi chọn nguồn là Media) */}
        {sourceType === "media" && (
          <div className="add-source-media-types">
            <Checkbox.Group
              value={mediaTypes}
              onChange={(values) => setMediaTypes(values as string[])}
            >
              <Checkbox value="video">Video</Checkbox>
              <Checkbox value="audio">Âm thanh</Checkbox>
              <Checkbox value="image">Hình ảnh</Checkbox>
            </Checkbox.Group>
          </div>
        )}

        {/* Hai cột: Chọn nguồn cần thêm (Trái) & Nguồn đã chọn (Phải) */}
        <div className="add-source-columns">
          {/* CỘT TRÁI */}
          <div className="source-col source-col--left">
            <h3 className="source-col-title">Chọn các nguồn thông tin cần thêm vào danh sách phát</h3>
            <AppSearch
              placeholder="Nhập tên nguồn thông tin"
              value={leftSearch}
              onChange={(val) => setLeftSearch(val)}
              onSearch={(val) => setLeftSearch(val)}
              width="100%"
            />

            <div className="candidates-list-wrapper">
              <AppTable<PlaylistPickableSource>
                columns={leftTableColumns}
                dataSource={availableCandidates}
                rowKey="sourceId"
                pagination={false}
                scroll={{ y: 260 }}
              />
            </div>
          </div>

          {/* CỘT PHẢI */}
          <div className="source-col source-col--right">
            <h3 className="source-col-title">Nguồn thông tin đã chọn</h3>
            <AppSearch
              placeholder="Nhập tên nguồn thông tin"
              value={rightSearch}
              onChange={(val) => setRightSearch(val)}
              onSearch={(val) => setRightSearch(val)}
              width="100%"
            />

            <div className="selected-candidates-list">
              <div className="selected-header">
                <span className="col-stt">STT</span>
                <span className="col-name">Tên nguồn thông tin</span>
                <span className="col-duration">Thời lượng</span>
                <span className="col-action"></span>
              </div>
              <div className="selected-body">
                {filteredSelectedCandidates.map((c, idx) => (
                  <div key={`${c.source.sourceId}-${idx}`} className="selected-row">
                    <span className="col-stt">{idx + 1}</span>
                    <div className="col-name candidate-name-cell">
                      <AppIconButton
                        icon={<Play size={14} fill="currentColor" />}
                        tooltip="Nghe thử"
                        onClick={() =>
                          onPreview({
                            sourceId: c.source.sourceId,
                            sourceType: c.source.sourceType,
                            name: c.source.name,
                            thumbnail: c.source.thumbnail,
                          })
                        }
                      />
                      <span className="candidate-name-text" title={c.source.name}>
                        {c.source.name}
                      </span>
                    </div>
                    <div className="col-duration">
                      <AppTimePicker
                        value={c.duration ? dayjs(c.duration, "HH:mm:ss") : null}
                        onChange={(_, timeString) => {
                          if (typeof timeString === "string" && timeString) {
                            handleDurationCandidateChange(idx, timeString);
                          }
                        }}
                        width={100}
                      />
                    </div>
                    <div className="col-action">
                      <button
                        type="button"
                        className="candidate-action-btn candidate-action-btn--remove"
                        onClick={() => handleRemoveCandidate(idx)}
                      >
                        Gỡ
                      </button>
                    </div>
                  </div>
                ))}
                {filteredSelectedCandidates.length === 0 && (
                  <div className="empty-selected-notice">Chưa có nguồn thông tin nào được chọn</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <p className="required-note">* là những trường thông tin bắt buộc</p>

        {/* Nút hành động */}
        <div className="add-source-actions">
          <AppButton variant="outline" width={140} onClick={onCancel}>
            Hủy bỏ
          </AppButton>
          <AppButton
            variant="primary"
            width={140}
            onClick={handleSave}
            disabled={selectedCandidates.length === 0}
          >
            Lưu thay đổi
          </AppButton>
        </div>
      </div>
    </AppModal>
  );
}

