# TÀI LIỆU HOÀN CHỈNH HỆ THỐNG QUẢN LÝ THƯ VIỆN

## MỤC LỤC

1. [Tổng quan dự án](#1-tổng-quan-dự-án)
2. [Kiến trúc hệ thống](#2-kiến-trúc-hệ-thống)
3. [Cấu trúc thư mục](#3-cấu-trúc-thư-mục)
4. [Cơ sở dữ liệu](#4-cơ-sở-dữ-liệu)
5. [Backend API](#5-backend-api)
6. [Frontend](#6-frontend)
7. [Các tính năng chính](#7-các-tính-năng-chính)
8. [Luồng nghiệp vụ](#8-luồng-nghiệp-vụ)
9. [Bảo mật](#9-bảo-mật)
10. [Công nghệ sử dụng](#10-công-nghệ-sử-dụng)

---

## 1. TỔNG QUAN DỰ ÁN

### 1.1. Mô tả
Hệ thống Quản lý Thư viện là một ứng dụng web full-stack được xây dựng để quản lý toàn bộ hoạt động của thư viện, bao gồm:
- Quản lý sách và bản sao
- Quản lý mượn/trả sách
- Quản lý người dùng
- Hệ thống thông báo
- Báo cáo thống kê
- Quản lý quy định và chính sách

### 1.2. Mục tiêu
- Tự động hóa quy trình mượn/trả sách
- Quản lý kho sách hiệu quả
- Theo dõi và báo cáo hoạt động thư viện
- Cung cấp trải nghiệm tốt cho người dùng

### 1.3. Đối tượng sử dụng
- **Admin**: Quản trị viên thư viện
- **User**: Người dùng thư viện (student, staff, guest)

---

## 2. KIẾN TRÚC HỆ THỐNG

### 2.1. Kiến trúc tổng thể
```
┌─────────────┐
│   Frontend  │  Next.js 15.4.6 (React 19)
│  (Port 3000)│
└──────┬──────┘
       │ HTTP/REST API
       │ (Bearer Token)
┌──────▼──────┐
│   Backend   │  FastAPI 0.111.0 (Python)
│  (Port 8000)│
└──────┬──────┘
       │ SQLAlchemy ORM
┌──────▼──────┐
│   Database  │  MySQL 8.x
│  (Port 3306)│
└─────────────┘
```

### 2.2. Mô hình Client-Server
- **Frontend**: Single Page Application (SPA) sử dụng Next.js với App Router
- **Backend**: RESTful API sử dụng FastAPI
- **Database**: MySQL với SQLAlchemy ORM
- **Authentication**: JWT (JSON Web Token)

### 2.3. Thiết kế và triển khai

#### 2.4. Mô hình hệ thống

##### 2.4.1. Tổng quan mô hình

Hệ thống được thiết kế theo mô hình 3 lớp: Presentation Layer (Frontend), Business Logic Layer (Backend API), và Data Access Layer (Database). Mỗi lớp có trách nhiệm riêng biệt và giao tiếp thông qua các interface được định nghĩa rõ ràng.

##### 2.4.2. Mô hình Use-case

Mô hình Use-case mô tả các chức năng chính của hệ thống từ góc nhìn người dùng, bao gồm các tác nhân (Actor) và các use case mà họ thực hiện. Hệ thống có hai tác nhân chính: **Người dùng (User)** và **Quản trị viên (Admin)**.

**Hình 2.1: Sơ đồ Use-case tổng quan của hệ thống**

*[Hình: `docs/diagrams/usecasetongquan.drawio` - Sơ đồ Use-case tổng quan mô tả toàn bộ các chức năng chính của hệ thống Quản lý Thư viện. Sơ đồ bao gồm hai tác nhân chính: Người dùng (User) và Quản trị viên (Admin). Các use case của User bao gồm: Đăng ký tài khoản, Đăng nhập, Xem danh sách sách, Xem chi tiết sách, Tìm kiếm sách, Mượn sách, Xem phiếu mượn, Yêu cầu trả sách, Xem thông báo, Quản lý hồ sơ. Các use case của Admin bao gồm: Quản lý sách, Quản lý bản sao, Duyệt mượn sách, Duyệt trả sách, Quản lý người dùng, Gửi thông báo, Xem báo cáo thống kê, Quản lý chính sách, Cài đặt hệ thống. Sơ đồ thể hiện các mối quan hệ include và extend giữa các use case]*

**Hình 2.2: Sơ đồ Use-case Đăng nhập và Đăng ký**

*[Hình: `docs/diagrams/usecase-dangnhap-dangky.drawio` - Sơ đồ Use-case chi tiết cho module xác thực và quản lý tài khoản. Tác nhân bao gồm Người dùng và Quản trị viên. Các use case chính: Đăng ký tài khoản, Đăng nhập, Đăng xuất, Xem hồ sơ, Cập nhật hồ sơ. Các use case hỗ trợ (include): Kiểm tra email trùng, Mã hóa mật khẩu, Xác thực mật khẩu, Tạo JWT token. Use case Làm mới token có quan hệ extend với Đăng nhập. Sơ đồ thể hiện quy trình xác thực người dùng và quản lý phiên đăng nhập]*

**Hình 2.3: Sơ đồ Use-case Mượn sách**

*[Hình: `docs/diagrams/usecasemuonsach.drawio` - Sơ đồ Use-case chi tiết cho quy trình mượn sách. Tác nhân: Người dùng (User) và Quản trị viên (Admin). Use case chính của User: Xem danh sách sách, Xem chi tiết sách, Mượn sách. Use case chính của Admin: Duyệt mượn sách. Các use case hỗ trợ (include): Kiểm tra chính sách mượn, Tạo phiếu mượn, Cập nhật trạng thái bản sao. Use case Gửi thông báo có quan hệ extend với Mượn sách và Duyệt mượn sách. Sơ đồ thể hiện luồng nghiệp vụ từ khi người dùng xem sách đến khi admin duyệt yêu cầu mượn]*

**Hình 2.4: Sơ đồ Use-case Quản lý sách**

*[Hình: `docs/diagrams/usecase-quanlysach.drawio` - Sơ đồ Use-case cho chức năng quản lý sách của Quản trị viên. Các use case chính: Xem danh sách sách, Xem chi tiết sách, Thêm sách mới, Sửa thông tin sách, Xóa sách, Quản lý ảnh sách, Quản lý nhà xuất bản, Tìm kiếm sách. Các use case hỗ trợ (include): Kiểm tra dữ liệu sách, Upload ảnh sách, Kiểm tra nhà xuất bản, Cập nhật số lượng. Sơ đồ thể hiện quy trình CRUD đầy đủ cho quản lý thông tin sách và các tài nguyên liên quan như ảnh và nhà xuất bản]*

**Hình 2.5: Sơ đồ Use-case Quản lý bản sao**

*[Hình: `docs/diagrams/usecase-quanlybansao.drawio` - Sơ đồ Use-case cho chức năng quản lý bản sao sách của Quản trị viên. Các use case chính: Xem danh sách bản sao, Xem chi tiết bản sao, Thêm bản sao mới, Sửa thông tin bản sao, Xóa bản sao, Cập nhật trạng thái, Quản lý vị trí kệ. Các use case hỗ trợ (include): Kiểm tra mã bản sao, Kiểm tra sách tồn tại, Kiểm tra vị trí kệ, Cập nhật số lượng sách. Sơ đồ thể hiện quy trình quản lý các bản sao vật lý của sách, bao gồm trạng thái và vị trí lưu trữ]*

**Hình 2.6: Sơ đồ Use-case Quản lý mượn trả**

*[Hình: `docs/diagrams/usecase-quanlymuontra.drawio` - Sơ đồ Use-case chi tiết cho quy trình quản lý mượn trả sách. Tác nhân: Người dùng và Quản trị viên. Use case của User: Yêu cầu mượn sách, Xem phiếu mượn của tôi, Yêu cầu trả sách. Use case của Admin: Duyệt mượn sách, Từ chối mượn sách, Duyệt trả sách, Xem tất cả phiếu mượn. Các use case hỗ trợ (include): Kiểm tra chính sách mượn, Tạo phiếu mượn, Cập nhật trạng thái bản sao, Thiết lập hạn trả, Kiểm tra quá hạn, Tính tiền phạt. Use case Gửi thông báo có quan hệ extend với Yêu cầu mượn, Duyệt mượn, Từ chối mượn và Duyệt trả. Sơ đồ thể hiện toàn bộ vòng đời của một phiếu mượn từ yêu cầu đến trả sách và tính phạt]*

**Hình 2.7: Sơ đồ Use-case Quản lý người dùng**

*[Hình: `docs/diagrams/usecase-quanlynguoidung.drawio` - Sơ đồ Use-case cho chức năng quản lý người dùng của Quản trị viên. Các use case chính: Xem danh sách người dùng, Xem chi tiết người dùng, Thêm người dùng mới, Sửa thông tin người dùng, Xóa người dùng, Thay đổi trạng thái, Thay đổi vai trò, Tìm kiếm người dùng. Các use case hỗ trợ (include): Kiểm tra email trùng, Mã hóa mật khẩu, Kiểm tra dữ liệu người dùng. Sơ đồ thể hiện quy trình quản lý tài khoản người dùng, bao gồm việc thay đổi trạng thái hoạt động và phân quyền]*

**Hình 2.8: Sơ đồ Use-case Hệ thống thông báo**

*[Hình: `docs/diagrams/usecase-thongbao.drawio` - Sơ đồ Use-case cho hệ thống thông báo. Tác nhân: Người dùng và Quản trị viên. Use case của User: Xem thông báo, Đánh dấu đã đọc, Đánh dấu tất cả đã đọc, Xem số thông báo chưa đọc. Use case của Admin: Tạo thông báo, Gửi thông báo hàng loạt, Gửi thông báo hệ thống, Sửa thông báo, Xóa thông báo. Các use case hỗ trợ (include): Kiểm tra dữ liệu thông báo, Lấy danh sách người nhận. Sơ đồ thể hiện cơ chế thông báo đa dạng từ thông báo cá nhân đến thông báo hệ thống và hàng loạt]*

**Hình 2.9: Sơ đồ Use-case Báo cáo thống kê**

*[Hình: `docs/diagrams/usecase-baocao.drawio` - Sơ đồ Use-case cho chức năng báo cáo thống kê của Quản trị viên. Các use case chính: Xem tổng quan thống kê, Xem top sách mượn nhiều, Xem top người dùng mượn nhiều, Xem top sách quá hạn, Xem báo cáo tiền phạt, Xem thống kê mượn/trả theo tháng, Xuất báo cáo. Các use case hỗ trợ (include): Lọc theo thời gian, Tổng hợp dữ liệu, Tính toán thống kê, Tạo biểu đồ. Sơ đồ thể hiện các loại báo cáo và thống kê đa dạng giúp admin theo dõi và đánh giá hoạt động thư viện]*

**Hình 2.10: Sơ đồ Use-case Cài đặt hệ thống**

*[Hình: `docs/diagrams/usecase-caidat.drawio` - Sơ đồ Use-case cho chức năng cài đặt và cấu hình hệ thống của Quản trị viên. Các use case chính: Xem cài đặt hệ thống, Cập nhật cài đặt, Quản lý chính sách mượn, Quản lý nội quy, Xem chính sách, Cập nhật chính sách, Xem danh sách nội quy, Thêm nội quy, Sửa nội quy, Xóa nội quy. Các use case hỗ trợ (include): Kiểm tra dữ liệu cài đặt, Kiểm tra dữ liệu chính sách, Kiểm tra dữ liệu nội quy. Sơ đồ thể hiện quy trình quản lý các thông số cấu hình hệ thống, chính sách mượn theo loại người dùng và nội quy thư viện động]*

**Bảng 2.1: Danh sách các Use-case chính của hệ thống**

| Use-case | Actor | Mô tả |
|----------|-------|-------|
| Đăng ký tài khoản | User | Người dùng đăng ký tài khoản mới |
| Đăng nhập | User, Admin | Xác thực người dùng vào hệ thống |
| Xem danh sách sách | User, Admin | Xem danh sách sách có trong thư viện |
| Xem chi tiết sách | User, Admin | Xem thông tin chi tiết của một cuốn sách |
| Tìm kiếm sách | User, Admin | Tìm kiếm sách theo tiêu đề, tác giả |
| Mượn sách | User | Yêu cầu mượn sách từ thư viện |
| Xem phiếu mượn | User | Xem danh sách phiếu mượn của mình |
| Yêu cầu trả sách | User | Yêu cầu trả sách đã mượn |
| Xem thông báo | User, Admin | Xem danh sách thông báo |
| Quản lý hồ sơ | User | Xem và cập nhật thông tin cá nhân |
| Quản lý sách | Admin | Thêm, sửa, xóa sách |
| Quản lý bản sao | Admin | Thêm, sửa, xóa bản sao sách |
| Duyệt mượn sách | Admin | Duyệt hoặc từ chối yêu cầu mượn sách |
| Duyệt trả sách | Admin | Duyệt yêu cầu trả sách và tính phạt |
| Quản lý người dùng | Admin | Thêm, sửa, xóa, thay đổi trạng thái người dùng |
| Gửi thông báo | Admin | Tạo và gửi thông báo cho người dùng |
| Xem báo cáo thống kê | Admin | Xem các báo cáo thống kê về hoạt động thư viện |
| Quản lý chính sách | Admin | Cập nhật chính sách mượn theo loại người dùng |
| Cài đặt hệ thống | Admin | Cấu hình các thông tin hệ thống |

**Bảng 2.2: Các mối quan hệ Include và Extend trong Use-case**

| Quan hệ | Use-case nguồn | Use-case đích | Mô tả |
|---------|----------------|----------------|-------|
| Include | Xem danh sách sách | Xem chi tiết sách | Luôn phải xem chi tiết khi xem danh sách |
| Include | Mượn sách | Kiểm tra chính sách mượn | Luôn kiểm tra chính sách trước khi mượn |
| Include | Mượn sách | Tạo phiếu mượn | Luôn tạo phiếu mượn khi mượn sách |
| Include | Mượn sách | Cập nhật trạng thái bản sao | Luôn cập nhật trạng thái bản sao khi mượn |
| Extend | Gửi thông báo | Mượn sách | Gửi thông báo sau khi mượn sách |
| Extend | Gửi thông báo | Duyệt mượn sách | Gửi thông báo sau khi duyệt mượn |
| Include | Duyệt trả sách | Kiểm tra quá hạn | Luôn kiểm tra quá hạn khi duyệt trả |
| Include | Duyệt trả sách | Tính tiền phạt | Luôn tính phạt nếu trả trễ |
| Include | Thêm sách mới | Kiểm tra dữ liệu sách | Luôn kiểm tra dữ liệu trước khi thêm |
| Include | Thêm bản sao | Cập nhật số lượng sách | Luôn cập nhật số lượng khi thêm bản sao |

---

## 3. CẤU TRÚC THƯ MỤC

### 3.1. Cấu trúc tổng thể
```
library-system/
├── backend/              # Backend API (FastAPI)
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py      # Entry point, FastAPI app
│   │   ├── config.py    # Cấu hình (database, JWT, chatbot)
│   │   ├── db.py        # Database connection
│   │   ├── models/      # SQLAlchemy models
│   │   │   ├── user.py
│   │   │   ├── book.py
│   │   │   ├── copy.py
│   │   │   ├── loan.py
│   │   │   ├── location.py
│   │   │   ├── policy.py
│   │   │   └── misc.py  # Notification, Setting, Rule
│   │   ├── routers/     # API endpoints
│   │   │   ├── auth.py
│   │   │   ├── books.py
│   │   │   ├── copies.py
│   │   │   ├── loans.py
│   │   │   ├── users.py
│   │   │   ├── notifications.py
│   │   │   ├── settings_policies.py
│   │   │   ├── rules.py
│   │   │   ├── locations.py
│   │   │   ├── publishers.py
│   │   │   └── images.py
│   │   ├── schemas/     # Pydantic schemas
│   │   │   ├── auth.py
│   │   │   ├── books.py
│   │   │   ├── copies.py
│   │   │   ├── loans.py
│   │   │   ├── notifications.py
│   │   │   ├── policies.py
│   │   │   ├── settings.py
│   │   │   └── rules.py
│   │   ├── security/    # Authentication & Authorization
│   │   │   ├── auth.py  # JWT, password hashing
│   │   │   └── deps.py  # Dependency injection
│   │   └── seed/        # Seed data
│   │       └── seed.sql
│   └── requirements.txt
├── frontend/            # Frontend (Next.js)
│   ├── app/             # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx     # Trang chủ
│   │   ├── login/       # Đăng nhập
│   │   ├── books/       # Danh sách sách, chi tiết sách
│   │   ├── search/      # Tìm kiếm
│   │   ├── profile/     # Hồ sơ người dùng
│   │   ├── admin/       # Trang admin
│   │   │   ├── page.tsx # Dashboard
│   │   │   ├── books/
│   │   │   ├── copies/
│   │   │   ├── loans/
│   │   │   ├── users/
│   │   │   ├── locations/
│   │   │   ├── publishers/
│   │   │   ├── notifications/
│   │   │   ├── rules/
│   │   │   ├── settings/
│   │   │   └── reports/
│   │   ├── auth/        # Đăng ký, quên mật khẩu
│   │   ├── rules/       # Nội quy
│   │   ├── about/       # Giới thiệu
│   │   ├── contact/     # Liên hệ
│   │   ├── faq/         # Câu hỏi thường gặp
│   │   └── help/        # Trợ giúp
│   ├── components/      # React components
│   │   ├── layout/      # Header, Footer, Sidebar, Navigation
│   │   ├── ui/          # UI components (shadcn/ui)
│   │   ├── shared/      # Shared components
│   │   ├── home/        # Home page components
│   │   └── chatbot/     # Chatbot integration
│   ├── contexts/        # React contexts
│   │   ├── auth-context.tsx
│   │   └── notification-context.tsx
│   ├── lib/             # Utilities
│   │   ├── api.ts       # API client
│   │   ├── adapters.ts
│   │   └── utils.ts
│   └── package.json
├── docs/                # Tài liệu
│   ├── schema.sql       # Database schema
│   └── diagrams/
└── start-dev.bat        # Script khởi động development
```

---

## 4. CƠ SỞ DỮ LIỆU

### 4.1. Sơ đồ ER (Entity Relationship)

#### Các bảng chính:

1. **nguoi_dung** (User)
   - Quản lý thông tin người dùng
   - Vai trò: admin, user
   - Loại người dùng: student, staff, guest

2. **sach** (Book)
   - Thông tin sách (tiêu đề, tác giả, NXB, năm XB, thể loại, mô tả, giá bìa)
   - Số lượng tổng và số lượng còn

3. **ban_sao** (Copy)
   - Bản sao của sách
   - Mã bản sao, trạng thái (available, on_loan, reserved, lost, maintenance)
   - Liên kết với vị trí kệ

4. **phieu_muon** (Loan)
   - Phiếu mượn sách
   - Trạng thái: requested, rejected, borrowed, return_requested, returned, overdue
   - Thông tin phạt tiền (số tiền, nội dung, đã nộp, ngày nộp)

5. **vi_tri_ke** (Location)
   - Vị trí kệ sách (tầng, phòng, kệ, hàng, cột)

6. **nha_xuat_ban** (Publisher)
   - Nhà xuất bản

7. **anh_sach** (BookImage)
   - Ảnh sách (URL, ảnh đại diện, thứ tự)

8. **chinh_sach** (Policy)
   - Chính sách mượn theo loại người dùng
   - Tối đa mượn, số ngày mượn, phạt mỗi ngày, số lần gia hạn

9. **thong_bao** (Notification)
   - Thông báo cho người dùng
   - Loại, tiêu đề, nội dung, đã đọc

10. **cau_hinh_thu_vien** (Setting)
    - Cấu hình thư viện (giờ mở cửa, quy định, thông tin ngân hàng, v.v.)

11. **noi_quy** (Rule - Static)
    - Nội quy tĩnh (key-value)

12. **noi_quy_dong** (Rule - Dynamic)
    - Nội quy động (có thể tạo, sửa, xóa)
    - Danh mục, trạng thái, mức độ, đối tượng, ngày hiệu lực

### 4.2. Quan hệ giữa các bảng

```
nguoi_dung (1) ──< (N) phieu_muon
ban_sao (1) ──< (N) phieu_muon
sach (1) ──< (N) ban_sao
sach (1) ──< (N) anh_sach
nha_xuat_ban (1) ──< (N) sach
vi_tri_ke (1) ──< (N) ban_sao
nguoi_dung (1) ──< (N) thong_bao
```

### 4.3. Triggers

- **trg_ban_sao_ai**: Tự động cập nhật số lượng sách khi thêm bản sao
- **trg_ban_sao_au**: Tự động cập nhật số lượng sách khi cập nhật bản sao
- **trg_ban_sao_ad**: Tự động cập nhật số lượng sách khi xóa bản sao

### 4.4. View

- **vw_sach_trien_khai**: View tổng hợp thông tin sách cho chatbot

---

## 5. BACKEND API

### 5.1. Authentication (`/api/auth`)

#### POST `/api/auth/register`
- Đăng ký tài khoản mới
- Request: `{email, password, full_name, phone?, address?}`
- Response: `{id, email, full_name, role}`

#### POST `/api/auth/login`
- Đăng nhập
- Request: `{email, password}`
- Response: `{access_token, refresh_token, token_type}`

#### POST `/api/auth/refresh`
- Làm mới token
- Request: `{refresh_token}`
- Response: `{access_token, refresh_token}`

#### GET `/api/auth/me`
- Lấy thông tin người dùng hiện tại
- Headers: `Authorization: Bearer <token>`
- Response: `{id, email, full_name, role, user_type, is_active, so_dien_thoai, dia_chi}`

#### PUT `/api/auth/me`
- Cập nhật thông tin người dùng
- Request: `{full_name?, email?, so_dien_thoai?, dia_chi?}`

### 5.2. Books (`/api/books`)

#### GET `/api/books`
- Danh sách sách (có phân trang, tìm kiếm, lọc)
- Query params: `search?, subjects?, language?, publisher?, pub_year?, page=1, limit=20`
- Response: `{items: BookListItem[], page, limit, total}`

#### GET `/api/books/{book_id}`
- Chi tiết sách
- Response: `{book: BookDetail, images: Image[], copies: Copy[]}`

#### POST `/api/books`
- Tạo sách mới (admin)
- Request: `BookCreate`

#### PUT `/api/books/{book_id}`
- Cập nhật sách (admin)
- Request: `BookUpdate`

#### DELETE `/api/books/{book_id}`
- Xóa sách (admin)

#### GET `/api/books/subjects`
- Danh sách thể loại

#### GET `/api/books/languages`
- Danh sách ngôn ngữ

#### GET `/api/books/publishers`
- Danh sách nhà xuất bản

### 5.3. Copies (`/api/copies`)

#### GET `/api/copies`
- Danh sách bản sao
- Query params: `page=1, limit=20, book_id?, status?, search?`
- Response: `{items: CopyListItem[], page, limit, total}`

#### GET `/api/copies/{copy_code}`
- Chi tiết bản sao theo mã

#### POST `/api/copies`
- Tạo bản sao mới (admin)
- Request: `{book_id, copy_code, location_id}`

#### PATCH `/api/copies/{copy_id}`
- Cập nhật bản sao (admin)
- Request: `{status?, location_id?}`

### 5.4. Loans (`/api/loans`)

#### POST `/api/loans/request`
- Yêu cầu mượn sách (user)
- Request: `{copy_id}`
- Kiểm tra: số lượng sách đang mượn, không mượn 2 bản sao cùng sách

#### POST `/api/loans/{loan_id}/request-return`
- Yêu cầu trả sách (user)

#### GET `/api/me/loans`
- Danh sách phiếu mượn của người dùng hiện tại
- Query params: `status?`
- Response: `Loan[]`

#### GET `/api/admin/loans`
- Danh sách tất cả phiếu mượn (admin)
- Query params: `status?, user_type?, borrowed_from?, borrowed_to?, due_from?, due_to?, search?`
- Response: `AdminLoanOut[]`

#### POST `/api/admin/loans/{loan_id}/approve`
- Duyệt yêu cầu mượn (admin)
- Request: `{due_at}`

#### POST `/api/admin/loans/{loan_id}/reject`
- Từ chối yêu cầu mượn (admin)
- Request: `{reason}`

#### POST `/api/admin/loans/{loan_id}/approve-return`
- Duyệt trả sách (admin)
- Tự động tính phạt nếu trả trễ

#### POST `/api/admin/loans`
- Tạo phiếu mượn trực tiếp (admin)
- Request: `AdminLoanCreate`

#### PUT `/api/admin/loans/{loan_id}`
- Cập nhật phiếu mượn (admin)
- Request: `AdminLoanUpdate`

#### DELETE `/api/admin/loans/{loan_id}`
- Xóa phiếu mượn (admin)

### 5.5. Users (`/api/users`)

#### GET `/api/users`
- Danh sách người dùng (admin)
- Query params: `page=1, limit=10, search?, role?, status?, user_type?`
- Response: `User[]`

#### POST `/api/users`
- Tạo người dùng mới (admin)
- Request: `{email, password, full_name, role, user_type, phone?, address?}`

#### PUT `/api/users/{user_id}`
- Cập nhật người dùng (admin)

#### DELETE `/api/users/{user_id}`
- Xóa người dùng (admin)

#### PATCH `/api/users/{user_id}/status`
- Thay đổi trạng thái (active/inactive/suspended)

#### PATCH `/api/users/{user_id}/role`
- Thay đổi vai trò

### 5.6. Notifications (`/api/notifications`)

#### GET `/api/notifications`
- Danh sách thông báo của người dùng hiện tại
- Response: `NotificationOut[]`

#### GET `/api/notifications/unread-count`
- Số thông báo chưa đọc

#### PATCH `/api/notifications/mark-all-read`
- Đánh dấu tất cả đã đọc

#### PATCH `/api/notifications/{notification_id}/read`
- Đánh dấu đã đọc một thông báo

#### POST `/api/notifications`
- Tạo thông báo (admin hoặc chủ sở hữu)
- Request: `{user_id, type, title, body?}`

#### POST `/api/notifications/broadcast`
- Gửi thông báo cho nhiều người dùng (admin)
- Request: `{user_ids[], type, title, body?}`

#### POST `/api/notifications/system`
- Gửi thông báo hệ thống (admin)
- Request: `{type, title, body, user_type?}`

#### PATCH `/api/notifications/{notification_id}`
- Cập nhật thông báo

#### DELETE `/api/notifications/{notification_id}`
- Xóa thông báo

### 5.7. Settings & Policies (`/api/settings`, `/api/policies`)

#### GET `/api/settings`
- Lấy cấu hình thư viện
- Response: `SettingsOut`

#### PUT `/api/settings`
- Cập nhật cấu hình (admin)
- Request: `SettingsUpdate`

#### GET `/api/policies`
- Danh sách chính sách
- Response: `PolicyOut[]`

#### PUT `/api/policies/{user_type}`
- Cập nhật chính sách (admin)
- Request: `PolicyUpdate`

### 5.8. Rules (`/api/rules`)

#### GET `/api/rules`
- Danh sách nội quy
- Query params: `search?, category?, status?, priority?, applies_to?, page=1, limit=20`
- Response: `RuleOut[]`

#### POST `/api/rules`
- Tạo nội quy mới (admin)
- Request: `RuleCreate`

#### PUT `/api/rules/{rule_id}`
- Cập nhật nội quy (admin)
- Request: `RuleUpdate`

#### DELETE `/api/rules/{rule_id}`
- Xóa nội quy (admin)

### 5.9. Locations (`/api/locations`)

#### GET `/api/locations`
- Danh sách vị trí kệ
- Response: `Location[]`

#### POST `/api/locations`
- Tạo vị trí mới (admin)

### 5.10. Publishers (`/api/publishers`)

#### GET `/api/publishers`
- Danh sách nhà xuất bản

#### POST `/api/publishers`
- Tạo nhà xuất bản mới (admin)

### 5.11. Reports (`/api/admin/reports`)

#### GET `/api/admin/reports/overview`
- Tổng quan thống kê
- Response: `{total_books, total_copies, total_users, total_loans, total_returns, total_overdue, total_fines}`

#### GET `/api/admin/reports/top-books`
- Top sách được mượn nhiều nhất
- Query params: `from?, to?, limit=10`

#### GET `/api/admin/reports/top-users`
- Top người dùng mượn nhiều nhất
- Query params: `from?, to?, limit=10`

#### GET `/api/admin/reports/top-overdue`
- Top sách quá hạn nhiều nhất
- Query params: `from?, to?, limit=10`

#### GET `/api/admin/reports/fines`
- Thống kê tiền phạt
- Query params: `from?, to?, group_by=day|month`

#### GET `/api/admin/reports/loans-by-month`
- Thống kê mượn/trả theo tháng
- Query params: `from?, to?`

### 5.12. Health Check

#### GET `/api/health`
- Kiểm tra trạng thái API
- Response: `{status: "ok"}`

---

## 6. FRONTEND

### 6.1. Cấu trúc trang

#### Trang công khai (không cần đăng nhập)
- `/` - Trang chủ
- `/books` - Danh sách sách
- `/books/[id]` - Chi tiết sách
- `/search` - Tìm kiếm
- `/rules` - Nội quy
- `/about` - Giới thiệu
- `/contact` - Liên hệ
- `/faq` - Câu hỏi thường gặp
- `/help` - Trợ giúp

#### Trang xác thực
- `/login` - Đăng nhập
- `/auth/register` - Đăng ký
- `/auth/forgot-password` - Quên mật khẩu

#### Trang người dùng (cần đăng nhập)
- `/profile` - Hồ sơ cá nhân
- (Có thể xem danh sách sách đã mượn từ API `/api/me/loans`)

#### Trang admin (cần đăng nhập + role=admin)
- `/admin` - Dashboard
- `/admin/books` - Quản lý sách
- `/admin/copies` - Quản lý bản sao
- `/admin/loans` - Quản lý mượn trả
- `/admin/users` - Quản lý người dùng
- `/admin/locations` - Quản lý vị trí
- `/admin/publishers` - Quản lý nhà xuất bản
- `/admin/notifications` - Quản lý thông báo
- `/admin/rules` - Quản lý nội quy
- `/admin/settings` - Cài đặt hệ thống
- `/admin/reports` - Báo cáo thống kê

### 6.2. Components chính

#### Layout Components
- `DefaultLayout` - Layout mặc định (Header + Footer)
- `Header` - Header với navigation
- `Footer` - Footer
- `Sidebar` - Sidebar cho admin
- `Navigation` - Navigation menu

#### UI Components (shadcn/ui)
- Button, Card, Input, Label, Select, Dialog, Table, Badge, Tabs, v.v.

#### Shared Components
- `ConfirmDialog` - Dialog xác nhận
- `EmptyState` - Trạng thái rỗng
- `ErrorState` - Trạng thái lỗi
- `Pagination` - Phân trang

#### Home Components
- `HomeContent` - Nội dung trang chủ

#### Chatbot Components
- `BotpressScript` - Script chatbot
- `BotpressConfig` - Cấu hình chatbot

### 6.3. Contexts

#### AuthContext
- Quản lý trạng thái đăng nhập
- `user`, `isAuthenticated`, `isLoading`
- `login()`, `register()`, `logout()`, `checkAuth()`

#### NotificationContext
- Quản lý thông báo (có thể có)

### 6.4. API Client

File `lib/api.ts` chứa:
- `ApiClient` class - Client gọi API
- Các helper functions: `authAPI`, `booksAPI`, `copiesAPI`, `loansAPI`, `usersAPI`, `settingsAPI`, `reportsAPI`, `notificationsAPI`

### 6.5. Routing

Sử dụng Next.js App Router:
- File-based routing
- Server Components và Client Components
- Dynamic routes: `[id]`

---

## 7. CÁC TÍNH NĂNG CHÍNH

### 7.1. Quản lý sách
- ✅ Xem danh sách sách (có phân trang, tìm kiếm, lọc)
- ✅ Xem chi tiết sách (thông tin, ảnh, bản sao)
- ✅ Thêm/sửa/xóa sách (admin)
- ✅ Quản lý ảnh sách
- ✅ Quản lý nhà xuất bản

### 7.2. Quản lý bản sao
- ✅ Xem danh sách bản sao
- ✅ Thêm/sửa/xóa bản sao (admin)
- ✅ Quản lý trạng thái bản sao (available, on_loan, reserved, lost, maintenance)
- ✅ Quản lý vị trí kệ

### 7.3. Quản lý mượn trả
- ✅ Yêu cầu mượn sách (user)
- ✅ Duyệt/từ chối yêu cầu mượn (admin)
- ✅ Yêu cầu trả sách (user)
- ✅ Duyệt trả sách (admin)
- ✅ Tự động tính phạt khi trả trễ
- ✅ Quản lý phạt tiền (đã nộp, xác nhận)
- ✅ Xem lịch sử mượn trả

### 7.4. Quản lý người dùng
- ✅ Đăng ký tài khoản
- ✅ Đăng nhập/đăng xuất
- ✅ Quản lý hồ sơ cá nhân
- ✅ Quản lý người dùng (admin: thêm/sửa/xóa, thay đổi trạng thái, vai trò)

### 7.5. Hệ thống thông báo
- ✅ Xem thông báo
- ✅ Đánh dấu đã đọc
- ✅ Tạo thông báo (admin)
- ✅ Gửi thông báo hàng loạt (admin)
- ✅ Gửi thông báo hệ thống (admin)
- ✅ Đếm thông báo chưa đọc

### 7.6. Quản lý chính sách
- ✅ Xem chính sách mượn theo loại người dùng
- ✅ Cập nhật chính sách (admin)
- ✅ Tự động áp dụng chính sách khi mượn/trả

### 7.7. Quản lý nội quy
- ✅ Xem nội quy (tĩnh và động)
- ✅ Quản lý nội quy động (admin: thêm/sửa/xóa)

### 7.8. Cài đặt hệ thống
- ✅ Xem/cập nhật cấu hình thư viện (admin)
- ✅ Quản lý giờ mở cửa, quy định, thông tin ngân hàng

### 7.9. Báo cáo thống kê
- ✅ Tổng quan thống kê
- ✅ Top sách được mượn nhiều nhất
- ✅ Top người dùng mượn nhiều nhất
- ✅ Top sách quá hạn
- ✅ Thống kê tiền phạt
- ✅ Thống kê mượn/trả theo tháng

### 7.10. Tìm kiếm
- ✅ Tìm kiếm sách (theo tiêu đề, tác giả)
- ✅ Lọc theo thể loại, ngôn ngữ, nhà xuất bản, năm xuất bản

### 7.11. Chatbot
- ✅ Tích hợp chatbot (Botpress)
- ✅ Hỗ trợ tìm kiếm sách qua chatbot

---

## 8. LUỒNG NGHIỆP VỤ

### 8.1. Luồng mượn sách

```
1. User tìm sách trên trang web
   ↓
2. User chọn sách và xem chi tiết
   ↓
3. User chọn bản sao available và click "Mượn sách"
   ↓
4. Hệ thống kiểm tra:
   - Số lượng sách đang mượn < tối đa cho phép (theo Policy)
   - Không mượn 2 bản sao cùng 1 sách
   ↓
5. Tạo phiếu mượn với trạng thái "requested"
   - Bản sao chuyển sang "reserved"
   - Gửi thông báo cho admin
   ↓
6. Admin xem yêu cầu và duyệt/từ chối
   ↓
7a. Nếu duyệt:
   - Phiếu mượn chuyển sang "borrowed"
   - Bản sao chuyển sang "on_loan"
   - Ghi nhận ngày mượn, hạn trả (theo Policy)
   - Gửi thông báo cho user
   ↓
7b. Nếu từ chối:
   - Phiếu mượn chuyển sang "rejected"
   - Bản sao chuyển về "available"
   - Gửi thông báo cho user (kèm lý do)
```

### 8.2. Luồng trả sách

```
1. User click "Yêu cầu trả sách" trên phiếu mượn đang "borrowed"
   ↓
2. Phiếu mượn chuyển sang "return_requested"
   - Gửi thông báo cho admin
   ↓
3. Admin xem yêu cầu và duyệt trả
   ↓
4. Hệ thống:
   - Phiếu mượn chuyển sang "returned"
   - Bản sao chuyển về "available"
   - Kiểm tra ngày trả vs hạn trả
   ↓
5a. Nếu trả đúng hạn:
   - Không tính phạt
   - Gửi thông báo xác nhận cho user
   ↓
5b. Nếu trả trễ:
   - Tính số ngày trễ
   - Tính tiền phạt = số ngày trễ × phạt mỗi ngày (theo Policy)
   - Ghi nhận vào phiếu mượn
   - Gửi thông báo phạt cho user
```

### 8.3. Luồng tính phạt

```
1. Khi duyệt trả sách, hệ thống kiểm tra:
   - Ngày trả > Hạn trả?
   ↓
2. Nếu có:
   - Tính số ngày trễ = (Ngày trả - Hạn trả).days
   - Lấy phạt mỗi ngày từ Policy (theo loại_nguoi_dung)
   - Tiền phạt = số ngày trễ × phạt mỗi ngày
   ↓
3. Ghi nhận:
   - so_tien_phat
   - noi_dung_phat = "Trả trễ X ngày"
   ↓
4. User nộp phạt:
   - Admin cập nhật da_nop_phat = true
   - Ghi nhận ngay_nop_phat, admin_xac_nhan_phat
   - Gửi thông báo xác nhận
```

### 8.4. Luồng đăng nhập

```
1. User nhập email và password
   ↓
2. Backend xác thực:
   - Kiểm tra email tồn tại
   - Kiểm tra password đúng (bcrypt)
   - Kiểm tra tài khoản hoạt động
   ↓
3. Tạo JWT token:
   - access_token (hết hạn sau 60 phút)
   - refresh_token
   ↓
4. Lưu token vào localStorage (frontend)
   ↓
5. Lấy thông tin user từ /api/auth/me
   ↓
6. Redirect:
   - Nếu role = admin → /admin
   - Nếu role = user → /
```

### 8.5. Luồng quản lý sách (Admin)

```
1. Admin vào /admin/books
   ↓
2. Xem danh sách sách (có phân trang, tìm kiếm)
   ↓
3a. Thêm sách mới:
   - Điền thông tin sách
   - Chọn nhà xuất bản (hoặc tạo mới)
   - Upload ảnh
   - Lưu
   ↓
3b. Sửa sách:
   - Click "Sửa" trên sách
   - Cập nhật thông tin
   - Lưu
   ↓
3c. Xóa sách:
   - Click "Xóa"
   - Xác nhận
   - Xóa (cascade: xóa cả bản sao, ảnh)
   ↓
4. Quản lý bản sao:
   - Vào /admin/copies
   - Thêm bản sao cho sách
   - Gán vị trí kệ
   - Quản lý trạng thái
```

---

## 9. BẢO MẬT

### 9.1. Authentication
- **JWT Token**: Sử dụng JWT cho authentication
- **Password Hashing**: Sử dụng bcrypt (passlib)
- **Token Expiration**: Access token hết hạn sau 60 phút
- **Refresh Token**: Có thể làm mới token

### 9.2. Authorization
- **Role-based**: Phân quyền theo vai trò (admin, user)
- **Dependency Injection**: Sử dụng `get_current_user` để kiểm tra quyền
- **Protected Routes**: Một số endpoint chỉ admin mới truy cập được

### 9.3. CORS
- Cấu hình CORS trong FastAPI
- Cho phép tất cả origins (development)

### 9.4. Input Validation
- Sử dụng Pydantic schemas để validate input
- SQL injection protection: Sử dụng SQLAlchemy ORM

### 9.5. Error Handling
- Standardized error format: `{error: {code, message, details}}`
- HTTP status codes phù hợp

---

## 10. CÔNG NGHỆ SỬ DỤNG

### 10.1. Backend

#### Framework & Libraries
- **FastAPI** 0.111.0 - Web framework
- **Uvicorn** 0.30.1 - ASGI server
- **SQLAlchemy** 2.0.30 - ORM
- **PyMySQL** 1.1.1 - MySQL driver
- **Pydantic** 2.7.1 - Data validation
- **Pydantic Settings** 2.3.4 - Settings management
- **Alembic** 1.13.2 - Database migrations
- **Passlib** 1.7.4 (bcrypt) - Password hashing
- **Python-JOSE** 3.3.0 - JWT

#### Database
- **MySQL** 8.x
- Charset: utf8mb4

### 10.2. Frontend

#### Framework & Libraries
- **Next.js** 15.4.6 - React framework
- **React** 19.1.0
- **TypeScript** 5.x
- **Tailwind CSS** 4.x - Styling
- **shadcn/ui** - UI components
- **Framer Motion** 12.23.12 - Animations
- **Lucide React** 0.539.0 - Icons
- **Sonner** 2.0.7 - Toast notifications
- **Chart.js** 4.5.0 - Charts
- **React Chart.js 2** 5.3.0
- **Recharts** 3.1.2 - Charts
- **date-fns** 4.1.0 - Date utilities
- **React Markdown** 10.1.0 - Markdown rendering
- **XLSX** 0.18.5 - Excel export
- **File Saver** 2.0.5 - File download

### 10.3. Development Tools
- **ESLint** - Linting
- **PostCSS** - CSS processing
- **Turbopack** - Fast bundler (Next.js)

### 10.4. Chatbot
- **Botpress** - Chatbot platform
- Hỗ trợ Ollama hoặc Gemini AI

---

## 11. CẤU HÌNH VÀ TRIỂN KHAI

### 11.1. Cấu hình Backend

File `backend/app/config.py`:
```python
- mysql_user, mysql_password, mysql_host, mysql_port, mysql_db
- jwt_secret_key, jwt_algorithm, access_token_expires_minutes
- upload_dir, max_file_size
- chatbot_provider (none/ollama/gemini)
- ollama_url, ollama_model
- gemini_api_key, gemini_model
```

Có thể override bằng file `.env`

### 11.2. Cấu hình Frontend

File `frontend/env.example`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 11.3. Khởi động Development

Chạy script `start-dev.bat`:
1. Tạo virtual environment (nếu chưa có)
2. Cài đặt dependencies (backend và frontend)
3. Khởi động backend (port 8000)
4. Khởi động frontend (port 3000)

### 11.4. Database Setup

1. Tạo database: `librarydb`
2. Chạy file `docs/schema.sql` để tạo schema và seed data
3. Default admin: `admin@lib.test` / `123456`

---

## 12. TÀI KHOẢN MẪU

### Admin
- Email: `admin@lib.test`
- Password: `123456`
- Role: `admin`
- User Type: `staff`

### User (Student)
- Email: `student1@lib.test`
- Password: `123456`
- Role: `user`
- User Type: `student`

---

## 13. GHI CHÚ QUAN TRỌNG

### 13.1. Database
- Sử dụng MySQL 8.x với charset utf8mb4
- Có triggers tự động cập nhật số lượng sách
- Có view `vw_sach_trien_khai` cho chatbot

### 13.2. API
- Tất cả API đều có prefix `/api` (trừ `/api/rules`)
- Authentication sử dụng Bearer Token
- Error format chuẩn: `{error: {code, message, details}}`

### 13.3. Frontend
- Sử dụng Next.js App Router
- Client Components sử dụng `"use client"`
- API client trong `lib/api.ts`
- Context cho authentication trong `contexts/auth-context.tsx`

### 13.4. Chính sách mượn
- Được lưu trong bảng `chinh_sach`
- Áp dụng theo `loai_nguoi_dung` (student, staff, guest)
- Mặc định:
  - Student: tối đa 3 cuốn, 14 ngày, phạt 2000đ/ngày
  - Staff: tối đa 5 cuốn, 30 ngày, phạt 0đ/ngày
  - Guest: tối đa 1 cuốn, 7 ngày, phạt 5000đ/ngày

### 13.5. Trạng thái phiếu mượn
- `requested`: Đã yêu cầu, chờ duyệt
- `rejected`: Bị từ chối
- `borrowed`: Đã mượn
- `return_requested`: Đã yêu cầu trả
- `returned`: Đã trả
- `overdue`: Quá hạn

### 13.6. Trạng thái bản sao
- `available`: Có sẵn
- `on_loan`: Đang mượn
- `reserved`: Đã đặt trước
- `lost`: Mất
- `maintenance`: Bảo trì

---

## 14. KẾT LUẬN

Hệ thống Quản lý Thư viện là một ứng dụng web full-stack hoàn chỉnh với:
- ✅ Backend API RESTful đầy đủ
- ✅ Frontend hiện đại với Next.js
- ✅ Database MySQL với schema rõ ràng
- ✅ Hệ thống authentication và authorization
- ✅ Quản lý mượn trả tự động
- ✅ Hệ thống thông báo
- ✅ Báo cáo thống kê
- ✅ Tích hợp chatbot

Tài liệu này cung cấp cái nhìn toàn diện về hệ thống, có thể sử dụng cho mục đích báo cáo, bảo trì, hoặc phát triển tiếp.

---

**Ngày tạo tài liệu**: 2024
**Phiên bản**: 1.0
**Tác giả**: Hệ thống tự động phân tích

