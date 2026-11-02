# MTC – Quản lý nội dung phát & gói cước

Dự án Front-end xây dựng giao diện hệ thống **MTC CMS** phục vụ quản lý cơ sở, thiết bị, media, bản mẫu, danh sách phát và các chức năng quản trị liên quan.

## 1. Công nghệ sử dụng

- **React** + **TypeScript**
- **Vite** – công cụ chạy môi trường phát triển và build
- **Ant Design** – thư viện giao diện
- **React Router** – điều hướng trang
- **Lucide React / Ant Design Icons** – biểu tượng giao diện
- **Day.js** – xử lý ngày tháng

Một số thư viện khác có thể được sử dụng theo từng chức năng; xem danh sách chính xác trong `package.json`.

## 2. Yêu cầu trước khi chạy

Cài đặt:

- **Node.js**: khuyến nghị phiên bản 24.x (phiên bản đang dùng khi phát triển: 24.13.0).
- **npm**: đi kèm Node.js (phiên bản đang dùng khi phát triển: 11.6.2).
- **Git**: để tải source code.
- **Visual Studio Code** (khuyến nghị).

Kiểm tra trong Terminal:

```bash
node -v
npm -v
git --version
```

## 3. Tải source code

Mở Terminal tại thư mục muốn lưu dự án:

```bash
git clone https://github.com/ChanHoa-25/MTC-QuanLyNoiDungPhat-GoiCuoc.git
cd MTC-QuanLyNoiDungPhat-GoiCuoc
```

Nếu đã clone dự án trước đó, cập nhật mã nguồn từ nhánh đang làm việc theo quy trình Git của nhóm (ví dụ với nhánh `main`):

```bash
git checkout main
git pull origin main
```

## 4. Cài đặt thư viện

Tại thư mục gốc của dự án (nơi có `package.json`), chạy:

```bash
npm install
```

Lệnh này sẽ cài các dependencies vào thư mục `node_modules/`.

> Nếu repository có `package-lock.json` và muốn cài chính xác theo lockfile, có thể dùng `npm ci` thay cho `npm install`.

## 5. Chạy dự án trên máy cá nhân

Chạy môi trường phát triển:

```bash
npm run dev
```

Terminal sẽ hiển thị đường dẫn truy cập, thường là:

```text
http://localhost:5173/
```

Mở đường dẫn được in ra trong Terminal bằng trình duyệt. Nếu cổng 5173 đang được sử dụng, Vite có thể tự chọn cổng khác; hãy dùng đúng URL hiển thị.

Để dừng server, nhấn **Ctrl + C** trong Terminal.

## 6. Các lệnh thường dùng

| Lệnh              | Mục đích                               |
| ----------------- | -------------------------------------- |
| `npm install`     | Cài đặt dependencies                   |
| `npm run dev`     | Chạy dự án trong môi trường phát triển |
| `npm run build`   | Build phiên bản production             |
| `npm run preview` | Xem thử bản build production           |

Các lệnh bổ sung như lint hoặc kiểm tra TypeScript phụ thuộc vào phần `scripts` trong `package.json` hiện tại.

## 7. Quy trình làm việc dành cho thành viên nhóm

1. Cập nhật mã nguồn mới nhất trước khi bắt đầu làm việc.
2. Tạo nhánh riêng cho chức năng hoặc công việc được phân công.
3. Chỉnh sửa code và chạy `npm run dev` để kiểm tra giao diện.
4. Kiểm tra lỗi và chạy build trước khi gửi code.
5. Commit với nội dung rõ ràng và push nhánh lên GitHub.
6. Tạo Pull Request để nhóm review trước khi merge vào `main`.

Ví dụ:

```bash
git checkout main
git pull origin main
git checkout -b feature/site-media

# Sau khi hoàn thành công việc
git add .
git commit -m "feat: hoàn thiện giao diện quản lý media"
git push -u origin feature/site-media
```

## 8. Một số lỗi thường gặp

### `npm` hoặc `node` không được nhận diện

Kiểm tra Node.js đã được cài đặt và có trong PATH. Đóng rồi mở lại Terminal sau khi cài.

### `Cannot find module` / thiếu thư viện

Chạy lại:

```bash
npm install
```

Nếu vừa chuyển nhánh hoặc pull code mới, cần cài lại dependencies khi `package.json` hoặc lockfile thay đổi.

### Cổng 5173 đã được sử dụng

Dùng đúng đường dẫn Vite in ra trong Terminal, hoặc chạy:

```bash
npm run dev -- --port 5174
```

### Lỗi khi build

Chạy:

```bash
npm run build
```

Đọc thông báo trong Terminal và sửa lỗi TypeScript/import tương ứng. Đảm bảo tên file và đường dẫn import đúng cả chữ hoa, chữ thường.

## 9. Lưu ý về dữ liệu và API

Dự án đang trong giai đoạn phát triển giao diện Front-end; một số chức năng sử dụng **dữ liệu mock** và các thao tác có thể chưa kết nối Backend/API thực tế. Vì vậy, việc hiển thị thông báo thành công chưa đồng nghĩa dữ liệu đã được lưu trên server.

Nếu dự án bổ sung file môi trường như `.env.example`, hãy tạo file `.env` theo hướng dẫn được cập nhật của nhóm. Không commit mật khẩu, token hoặc khóa bí mật lên GitHub.

---

**Repository:** https://github.com/ChanHoa-25/MTC-QuanLyNoiDungPhat-GoiCu

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
