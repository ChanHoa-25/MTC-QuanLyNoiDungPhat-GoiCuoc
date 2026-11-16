# MTC CMS – Quản lý nội dung phát & gói cước

MTC CMS là hệ thống quản lý nội dung phát và gói cước, hỗ trợ quản lý cơ sở, thiết bị phát tin, nguồn nội dung, bản tin và các hoạt động quản trị hệ thống.

Dự án được phát triển trong quá trình **Học kỳ doanh nghiệp**, tập trung xây dựng giao diện Front-end theo thiết kế Figma và tích hợp với hệ thống Back-end thông qua REST API.

## Giới thiệu hệ thống

Hệ thống MTC CMS được tổ chức thành hai phân hệ chính:

### End User – Quản lý nội dung phát

Phân hệ dành cho người dùng quản lý các hoạt động liên quan đến cơ sở và nội dung phát.

Các chức năng chính:

- **Dashboard:** Tổng quan và thống kê dữ liệu.
- **Quản lý cơ sở:** Quản lý thông tin cơ sở, tài khoản và các nội dung liên quan.
- **Quản lý thiết bị:** Theo dõi và quản lý thiết bị phát tin.
- **Quản lý Media:** Quản lý tệp media, nguồn tin, bản mẫu và danh sách phát.
- **Quản lý bản tin:** Quản lý thông tin và hoạt động phát bản tin.
- **Báo cáo:** Thống kê dữ liệu theo các nhóm chức năng.
- **Cài đặt:** Quản lý tài khoản, vai trò và các thiết lập liên quan.

### System User – Quản trị hệ thống

Phân hệ dành cho người dùng thực hiện các chức năng quản trị hệ thống.

Các chức năng chính:

- **Dashboard:** Tổng quan hoạt động hệ thống.
- **Quản lý tổ chức:** Quản lý thông tin và chi tiết tổ chức.
- **Quản lý thông báo:** Quản lý và cấu hình thông báo.
- **Quản lý gói cước:** Quản lý gói cước, chi tiết và lịch sử gói cước.
- **Báo cáo:** Thống kê thiết bị, bản tin và nguồn tin theo tổ chức.
- **Cài đặt hệ thống:** Quản lý vai trò, người dùng và các thiết lập hệ thống.

## Công nghệ sử dụng

| Công nghệ               | Vai trò                   |
| ----------------------- | ------------------------- |
| React                   | Xây dựng giao diện        |
| TypeScript              | Ngôn ngữ phát triển       |
| Create React App        | Công cụ xây dựng ứng dụng |
| Ant Design              | Thư viện UI               |
| React Router            | Điều hướng                |
| Axios                   | Tích hợp REST API         |
| Recharts                | Biểu đồ thống kê          |
| Leaflet / React Leaflet | Bản đồ                    |
| Lucide React            | Biểu tượng                |
| Day.js                  | Xử lý ngày giờ            |

**Back-end tích hợp:** ASP.NET Core (.NET 8) và PostgreSQL.

## Cấu trúc dự án

```text
src/
├── api/                 # Cấu hình và xử lý API
├── assets/              # Hình ảnh, biểu tượng
├── components/          # Component dùng chung
├── config/              # Cấu hình ứng dụng
├── constants/           # Hằng số, đường dẫn
├── contexts/            # React Context
├── data/                # Dữ liệu mock
├── features/            # Các module chức năng
├── layouts/             # Bố cục giao diện
├── pages/               # Các trang của hệ thống
│   ├── system-user/     # Phân hệ System User
│   ├── reports/         # Báo cáo
│   └── settings/        # Cài đặt
├── routes/              # Cấu hình định tuyến
├── types/               # Kiểu dữ liệu TypeScript
├── App.tsx
├── AppProviders.tsx
└── index.tsx
```

Các component dùng chung được xây dựng nhằm tái sử dụng giữa các màn hình và hai phân hệ, giúp thống nhất giao diện và thuận tiện cho việc bảo trì.

## Cài đặt và khởi chạy

**Yêu cầu:** Node.js, npm và Git.

Clone repository:

```bash
git clone https://github.com/ChanHoa-25/MTC-QuanLyNoiDungPhat-GoiCuoc.git
cd MTC-QuanLyNoiDungPhat-GoiCuoc
```

Cài đặt dependencies:

```bash
npm install
```

Khởi chạy ứng dụng:

```bash
npm start
```

Truy cập tại: **http://localhost:3000**

Build ứng dụng:

```bash
npm run build
```

## Cấu hình API

Trong môi trường phát triển, Front-end sử dụng proxy để kết nối với Back-end.

Cấu hình trong `package.json`:

```json
"proxy": "http://localhost:5006"
```

Các yêu cầu API sử dụng đường dẫn `/api`, ví dụ:

```text
/api/Organizations
```

Back-end cần được khởi chạy riêng để sử dụng các chức năng có kết nối API.

## Quy trình phát triển

Dự án được phát triển theo nhóm, sử dụng Git và GitHub để quản lý mã nguồn.

- Phát triển chức năng trên các nhánh riêng.
- Sử dụng component dùng chung để thống nhất giao diện.
- Kiểm tra TypeScript và build trước khi cập nhật mã nguồn.
- Sử dụng Pull Request để kiểm tra và tích hợp thay đổi.

## Trạng thái dự án

**Đang phát triển.**

Giao diện được xây dựng dựa trên Figma. Một số chức năng đang sử dụng dữ liệu mock và sẽ tiếp tục được tích hợp với Back-end thông qua API.

---

**Repository:** [MTC – Quản lý nội dung phát &amp; gói cước](https://github.com/ChanHoa-25/MTC-QuanLyNoiDungPhat-GoiCuoc)

**Dự án Học kỳ doanh nghiệp – Front-end Development**
