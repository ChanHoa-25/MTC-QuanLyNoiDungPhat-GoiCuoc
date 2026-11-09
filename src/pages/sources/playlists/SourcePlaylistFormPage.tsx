import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Minus } from "lucide-react";
import { Form, Radio, message } from "antd";

import AppInput from "../../../components/common/AppInput";
import AppSelect from "../../../components/common/AppSelect";
import AppTextArea from "../../../components/common/AppTextArea";
import AppButton from "../../../components/common/AppButton";
import { useActionPanel } from "../../../contexts/ActionPanelContext";

import type { PlaylistEntry, PlaylistPlayMode } from "./types/sourcePlaylist.types";
import { useSourcePlaylistsStore, getPlaylistDuration } from "./data/sourcePlaylists.store";
import { PLAYLIST_CATEGORY_OPTIONS } from "./data/sourcePlaylists.mock";
import PlaylistEntriesTable from "./components/PlaylistEntriesTable";
import AddPlaylistSourceModal from "./components/AddPlaylistSourceModal";
import PlaylistPreviewModal from "./components/PlaylistPreviewModal";
import "./SourcePlaylistFormPage.css";

interface SourcePlaylistFormPageProps {
  mode: "create" | "edit";
}

export default function SourcePlaylistFormPage({ mode }: SourcePlaylistFormPageProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const { setActions } = useActionPanel();
  const { getPlaylistById, addPlaylist, updatePlaylist } = useSourcePlaylistsStore();

  // Form state
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Tin tức");
  const [playMode, setPlayMode] = useState<PlaylistPlayMode>("random");
  const [description, setDescription] = useState("");
  const [entries, setEntries] = useState<PlaylistEntry[]>([]);

  // Selection state inside table (dành cho nút Minus để gỡ nhiều nguồn)
  const [selectedEntryKeys, setSelectedEntryKeys] = useState<React.Key[]>([]);

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [previewEntry, setPreviewEntry] = useState<PlaylistEntry | null>(null);

  // Load data for edit mode
  useEffect(() => {
    if (mode === "edit" && id) {
      const current = getPlaylistById(id);
      if (!current) {
        messageApi.error("Không tìm thấy danh sách phát!");
        navigate("/sources/playlists");
        return;
      }
      if (current.usageStatus === "in_use") {
        messageApi.error("Danh sách phát đang được sử dụng, không thể chỉnh sửa!");
        navigate(`/sources/playlists/${id}`);
        return;
      }
      setName(current.name);
      setCategory(current.category);
      setPlayMode(current.playMode);
      setDescription(current.description);
      setEntries(current.entries);
    }
  }, [mode, id, getPlaylistById, navigate, messageApi]);

  // Cấu hình ActionPanel bên phải: Nút + (Thêm nguồn) và Nút - (Xóa nguồn đã chọn)
  useEffect(() => {
    setActions([
      {
        key: "add-source",
        icon: <Plus />,
        tooltip: "Thêm nguồn thông tin vào danh sách",
        onClick: () => setAddModalOpen(true),
      },
      {
        key: "remove-selected-sources",
        icon: <Minus />,
        tooltip: "Gỡ các nguồn thông tin đã chọn",
        danger: true,
        disabled: selectedEntryKeys.length === 0,
        onClick: () => {
          setEntries((prev) => prev.filter((e) => !selectedEntryKeys.includes(e.id)));
          setSelectedEntryKeys([]);
          messageApi.success("Đã gỡ các nguồn đã chọn khỏi danh sách phát!");
        },
      },
    ]);

    return () => setActions([]);
  }, [setActions, selectedEntryKeys, messageApi]);

  const calculatedDuration = getPlaylistDuration(entries);

  const handleSave = () => {
    if (!name.trim()) {
      messageApi.error("Vui lòng nhập tên danh sách phát!");
      return;
    }
    if (!category) {
      messageApi.error("Vui lòng chọn lĩnh vực!");
      return;
    }
    if (entries.length === 0) {
      messageApi.warning("Vui lòng thêm ít nhất một nguồn phát vào danh sách!");
      return;
    }

    if (mode === "create") {
      const created = addPlaylist({
        name,
        category,
        playMode,
        description,
        entries,
      });
      messageApi.success("Tạo danh sách phát thành công!");
      navigate(`/sources/playlists/${created.id}`);
    } else if (mode === "edit" && id) {
      const success = updatePlaylist(id, {
        name,
        category,
        playMode,
        description,
        entries,
      });
      if (success) {
        messageApi.success("Cập nhật danh sách phát thành công!");
        navigate(`/sources/playlists/${id}`);
      } else {
        messageApi.error("Không thể cập nhật danh sách phát đang được sử dụng!");
      }
    }
  };

  const handleAddEntries = (newEntries: PlaylistEntry[]) => {
    setEntries((prev) => [...prev, ...newEntries]);
    messageApi.success(`Đã thêm ${newEntries.length} nguồn vào danh sách phát!`);
  };

  return (
    <div className="source-playlist-form-page">
      {contextHolder}

      <div className="playlist-form-card">
        <div className="playlist-form-layout">
          {/* CỘT TRÁI: FORM CƠ BẢN */}
          <div className="playlist-form-left">
            <h2 className="form-pane-title">
              {mode === "create" ? "Thêm danh sách phát" : "Cập nhật danh sách phát"}
            </h2>

            <Form layout="vertical">
              <Form.Item label="Tên danh sách phát" required>
                <AppInput
                  placeholder="Nhập tên danh sách phát"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  width="100%"
                />
              </Form.Item>

              <Form.Item label="Lĩnh vực" required>
                <AppSelect
                  value={category}
                  onChange={(val) => setCategory(String(val))}
                  options={PLAYLIST_CATEGORY_OPTIONS}
                  width="100%"
                />
              </Form.Item>

              <Form.Item label="Chế độ phát">
                <Radio.Group
                  value={playMode}
                  onChange={(e) => setPlayMode(e.target.value)}
                  className="playlist-mode-radios"
                >
                  <Radio value="random">Phát ngẫu nhiên</Radio>
                  <Radio value="sequential">Phát theo thứ tự</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item label="Thời lượng danh sách phát" required>
                <div className="playlist-calc-duration-box">
                  {calculatedDuration}
                </div>
              </Form.Item>

              <Form.Item label="Mô tả">
                <AppTextArea
                  placeholder="Nhập mô tả"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  width="100%"
                  height={100}
                />
              </Form.Item>
            </Form>

            <p className="required-note">* là những trường thông tin bắt buộc</p>
          </div>

          {/* CỘT PHẢI: BẢNG NGUỒN THÔNG TIN */}
          <div className="playlist-form-right">
            <h2 className="form-pane-title">Danh sách các nguồn thông tin</h2>

            {entries.length === 0 ? (
              <div className="playlist-form-empty-state">
                <p>Chưa có nguồn phát nào trong danh sách phát này.</p>
                <AppButton
                  variant="outline"
                  width={180}
                  onClick={() => setAddModalOpen(true)}
                >
                  + Thêm nguồn thông tin
                </AppButton>
              </div>
            ) : (
              <div className="playlist-form-entries-table">
                <PlaylistEntriesTable
                  entries={entries}
                  onChange={setEntries}
                  onPreviewEntry={(entry) => setPreviewEntry(entry)}
                  selectedRowKeys={selectedEntryKeys}
                  onSelectedRowKeysChange={setSelectedEntryKeys}
                />
              </div>
            )}
          </div>
        </div>

        {/* Nút Hủy và Lưu dưới đáy trang */}
        <div className="playlist-form-bottom-actions">
          <AppButton
            variant="outline"
            width={140}
            onClick={() => navigate("/sources/playlists")}
          >
            Hủy
          </AppButton>
          <AppButton
            variant="primary"
            width={140}
            onClick={handleSave}
          >
            Lưu
          </AppButton>
        </div>
      </div>

      {/* Modal Thêm nguồn vào playlist */}
      <AddPlaylistSourceModal
        open={addModalOpen}
        onCancel={() => setAddModalOpen(false)}
        onSave={handleAddEntries}
        onPreview={(source) =>
          setPreviewEntry({
            id: `temp-${source.sourceId}`,
            sourceId: source.sourceId,
            sourceType: source.sourceType,
            name: source.name,
            duration: "00:05:30",
            thumbnail: source.thumbnail,
          })
        }
      />

      {/* Popup nghe thử */}
      <PlaylistPreviewModal
        entry={previewEntry}
        onClose={() => setPreviewEntry(null)}
      />
    </div>
  );
}

