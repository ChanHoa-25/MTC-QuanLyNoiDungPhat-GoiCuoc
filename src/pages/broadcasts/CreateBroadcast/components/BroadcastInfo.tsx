import { Form } from "antd";

import AppInput from "../../../../components/common/AppInput";
import AppSelect from "../../../../components/common/AppSelect";

import { broadcastCategories } from "../../data/createBroadcast.mock";

function BroadcastInfo() {
  return (
    <section className="create-broadcast__section">
      <h2>1. Thông tin bản tin</h2>

      <div className="create-broadcast__info-grid">
        <Form.Item
          name="code"
          label="Mã bản tin"
          rules={[
            {
              required: true,
              whitespace: true,
              message: "Vui lòng nhập mã bản tin",
            },
          ]}>
          <AppInput width="100%" placeholder="Bản tin 001" />
        </Form.Item>

        <Form.Item
          name="title"
          label="Tiêu đề"
          rules={[
            {
              required: true,
              whitespace: true,
              message: "Vui lòng nhập tiêu đề",
            },
          ]}>
          <AppInput width="100%" placeholder="Khám phá Hội An" />
        </Form.Item>

        <Form.Item
          name="category"
          label="Lĩnh vực"
          rules={[
            {
              required: true,
              message: "Vui lòng chọn lĩnh vực",
            },
          ]}>
          <AppSelect
            width="100%"
            placeholder="Chọn lĩnh vực"
            options={broadcastCategories}
          />
        </Form.Item>
      </div>
    </section>
  );
}

export default BroadcastInfo;
