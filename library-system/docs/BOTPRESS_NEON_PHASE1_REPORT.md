# BÁO CÁO DỰ ÁN PHASE 1: CHATBOT THƯ VIỆN TÍCH HỢP NEON POSTGRESQL & BOTPRESS CLOUD

---

## 1. Database Schema Đã Sử Dụng

Dự án sử dụng mô hình cơ sở dữ liệu thư viện chuẩn hóa (chuẩn hóa quan hệ sách, bản sao và phiếu mượn). Toàn bộ schema đã được chuyển đổi tương thích 100% từ MySQL sang PostgreSQL trên Neon:

### 1.1. Bảng `sach` (Đầu sách)
- `id`: BIGSERIAL PRIMARY KEY
- `tieu_de`: TEXT NOT NULL (Tên đầu sách)
- `tieu_de_phu`: TEXT
- `tac_gia`: TEXT NOT NULL (Tác giả)
- `id_nxb`: BIGINT REFERENCES `nha_xuat_ban(id)`
- `nam_xb`: INT
- `ngon_ngu`: VARCHAR(32)
- `the_loai`: TEXT
- `mo_ta`: TEXT
- `gia_bia`: NUMERIC(12, 2)
- `don_vi_tien`: VARCHAR(10) DEFAULT 'VND'
- `so_luong_tong`: INT NOT NULL DEFAULT 0 (Tổng số cuốn)
- `so_luong_con`: INT NOT NULL DEFAULT 0 (Số cuốn còn trong thư viện)

### 1.2. Bảng `ban_sao` (Cuốn sách vật lý - Source of Truth)
- `id`: BIGSERIAL PRIMARY KEY
- `id_sach`: BIGINT NOT NULL REFERENCES `sach(id)` ON DELETE CASCADE
- `ma_ban_sao`: VARCHAR(64) NOT NULL UNIQUE (Barcode / Mã vạch cuốn sách)
- `id_vi_tri`: BIGINT NOT NULL REFERENCES `vi_tri_ke(id)`
- `trang_thai`: VARCHAR(32) NOT NULL DEFAULT 'available'
  - Giá trị: `'available'`, `'on_loan'`, `'reserved'`, `'lost'`, `'maintenance'`
  - **Quy tắc xác định**:
    - Cuốn còn trong thư viện (chưa mượn): `trang_thai = 'available'`
    - Cuốn đang mượn / đặt mượn: `trang_thai IN ('on_loan', 'reserved')`
- `tao_luc`: TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
- `cap_nhat_luc`: TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP

### 1.3. Bảng `phieu_muon` (Phiếu mượn)
- `id`: BIGSERIAL PRIMARY KEY
- `id_ban_sao`: BIGINT NOT NULL REFERENCES `ban_sao(id)`
- `id_nguoi_dung`: BIGINT NOT NULL REFERENCES `nguoi_dung(id)`
- `trang_thai`: VARCHAR(32) NOT NULL (`requested`, `rejected`, `borrowed`, `return_requested`, `returned`, `overdue`)
- `nguoi_duyet`, `duyet_luc`, `muon_luc`, `han_tra`, `tra_luc`, `so_tien_phat`, `da_nop_phat`, `tao_luc`...

### 1.4. Các bảng hỗ trợ khác
- `nha_xuat_ban`: Quản lý nhà xuất bản
- `vi_tri_ke`: Quản lý vị trí giá/kệ sách (phòng, tầng, kệ, hàng, cột)
- `anh_sach`: Lưu trữ ảnh bìa sách
- `nguoi_dung`, `chinh_sach`, `noi_quy`, `noi_quy_dong`, `thong_bao`, `cau_hinh_thu_vien`

---

## 2. Neon Configuration

- **Platform**: Neon Serverless PostgreSQL (v18.6 trên AWS `ap-southeast-1` Singapore)
- **Project ID**: `fragrant-unit-44921688` (Branch: `production`)
- **Host Endpoint**: `ep-calm-snow-azqgx0da-pooler.c-3.ap-southeast-1.aws.neon.tech`
- **Database Name**: `neondb`
- **Bảo mật**: Chuỗi kết nối `DATABASE_URL` được lưu trong biến môi trường `.env.local` của frontend (đã được cấu hình trong `.gitignore`, tuyệt đối không commit lên Git).

---

## 3. Migration Result

Quá trình chuyển đổi dữ liệu từ MySQL local lên Neon PostgreSQL được thực hiện tự động bằng script chuyển đổi `scratch/migrate.py`:
- **Database Local (MySQL)**: Giữ nguyên 100%, không bị sửa đổi hay xóa dữ liệu.
- **Đối chiếu số lượng bản ghi**:
  - `nguoi_dung`: MySQL = 8 | Neon = 8 (MATCH)
  - `nha_xuat_ban`: MySQL = 8 | Neon = 8 (MATCH)
  - `vi_tri_ke`: MySQL = 9 | Neon = 9 (MATCH)
  - `sach`: MySQL = 50 (+1 Clean Code test = 51) | Neon = 51 (MATCH)
  - `anh_sach`: MySQL = 56 | Neon = 56 (MATCH)
  - `ban_sao`: MySQL = 55 (+10 Clean Code copies = 65) | Neon = 65 (MATCH)
  - `phieu_muon`: MySQL = 6 | Neon = 6 (MATCH)
  - `chinh_sach`: MySQL = 3 | Neon = 3 (MATCH)
  - `thong_bao`: MySQL = 17 | Neon = 17 (MATCH)
  - `cau_hinh_thu_vien`: MySQL = 3 | Neon = 3 (MATCH)
  - `noi_quy`: MySQL = 11 | Neon = 11 (MATCH)
  - `noi_quy_dong`: MySQL = 12 | Neon = 12 (MATCH)
- **Toàn vẹn dữ liệu tiếng Việt**: Tiếng Việt UTF-8 được bảo toàn 100% không bị lỗi font hay mất dấu.

---

## 4. API Endpoints (Read-Only)

Tất cả các API được cài đặt trong thư mục `library-system/frontend/app/api/` sử dụng TypeScript và thư viện chuẩn `@neondatabase/serverless`:

| Phương thức | Endpoint | Chức năng | Parameter | Response mẫu |
|------------|----------|-----------|-----------|--------------|
| `GET` | `/api/books/search?q={query}` | Tìm kiếm sách theo tên hoặc tác giả | `q` (string) | `[{"id": 51, "title": "Clean Code", "author": "Robert C. Martin", "totalCopies": 10, "borrowedCopies": 7, "availableCopies": 3}]` |
| `GET` | `/api/books/:id/availability` | Lấy tình trạng tồn kho cụ thể của 1 sách | `:id` (number) | `{"id": 51, "title": "Clean Code", "totalCopies": 10, "borrowedCopies": 7, "availableCopies": 3}` |
| `GET` | `/api/library/stats` | Thống kê số liệu toàn bộ thư viện | Không | `{"totalTitles": 51, "totalCopies": 65, "borrowedCopies": 8, "availableCopies": 57}` |
| `GET` | `/api/books/available?q={query}` | Lấy danh sách các sách đang còn cuốn mượn được | `q` (tùy chọn) | Danh sách các sách có `availableCopies > 0` |

> **Bảo mật**: Tất cả query đều sử dụng **Parameterized Query** (Template SQL tag chống SQL Injection 100%). Tuyệt đối không hỗ trợ thao tác ghi (`POST`, `PUT`, `DELETE`).

---

## 5. Botpress Actions / Tools

Botpress bot hiện tại:
- **Bot Name**: Thu vien - Customer Support
- **Bot ID**: `9569ca68-d6f0-43fc-8321-21fee40cdd03`
- **Public API URL**: `https://whom-pubs-strengths-mainly.trycloudflare.com/api`

### 5.1. Tool 1: `searchBooks`
- **Mô tả (Description)**: `Use this tool whenever the user asks whether a book exists, searches for a book by title, author or keyword.`
- **Tham số đầu vào (Input)**:
  - `query` (string, bắt buộc): Từ khóa tìm kiếm sách hoặc tên tác giả.
- **Code thực thi**:
```javascript
const axios = require('axios');
const url = `https://whom-pubs-strengths-mainly.trycloudflare.com/api/books/search?q=${encodeURIComponent(args.query)}`;
const res = await axios.get(url);
return { books: res.data };
```

### 5.2. Tool 2: `getBookAvailability`
- **Mô tả (Description)**: `Use this whenever the user asks how many copies of a specific book exist, how many are borrowed or how many remain available.`
- **Tham số đầu vào (Input)**:
  - `bookId` (number, bắt buộc): ID của cuốn sách cần kiểm tra.
- **Code thực thi**:
```javascript
const axios = require('axios');
const url = `https://whom-pubs-strengths-mainly.trycloudflare.com/api/books/${args.bookId}/availability`;
const res = await axios.get(url);
return { availability: res.data };
```

### 5.3. Tool 3: `getLibraryStats`
- **Mô tả (Description)**: `Use whenever the user asks for total library statistics such as total books, borrowed books or available books.`
- **Tham số đầu vào (Input)**: Không có.
- **Code thực thi**:
```javascript
const axios = require('axios');
const url = `https://whom-pubs-strengths-mainly.trycloudflare.com/api/library/stats`;
const res = await axios.get(url);
return { stats: res.data };
```

---

## 6. Quy Tắc Hoạt Động Của Chatbot (System Prompt)

Cấu hình trong phần Instructions / Personality của Botpress:

```markdown
Bạn là Trợ Lý AI của Thư Viện, hỗ trợ độc giả tra cứu thông tin sách và thư viện.

Quy tắc bắt buộc:
1. Luôn trả lời bằng tiếng Việt lịch sự, thân thiện, rõ ràng.
2. ĐỐI VỚI CÁC CÂU HỎI VỀ SÁCH, TỒN KHO, SỐ LƯỢNG, BẠN BẮT BUỘC PHẢI GỌI TOOL/API:
   - Khi người dùng hỏi tìm sách, hỏi xem thư viện có cuốn sách nào đó không: Gọi tool `searchBooks(query)`.
   - Khi người dùng hỏi số lượng cuốn sách cụ thể còn hay mượn: 
     + Nếu chưa có bookId: gọi `searchBooks(query)` để tìm ID cuốn sách.
     + Sau đó gọi `getBookAvailability(bookId)` để lấy số lượng realtime.
   - Khi người dùng hỏi tổng số sách trong thư viện, số sách đang được mượn, số sách còn lại: Gọi tool `getLibraryStats()`.
3. TUYỆT ĐỐI KHÔNG TỰ BỊA ĐẶT SỐ LIỆU SÁCH. KHÔNG DÙNG KIẾN THỨC NỘI TẠI HOẶC KNOWLEDGE BASE ĐỂ TRẢ LỜI SỐ LƯỢNG THỜI GIAN THỰC.
```

---

## 7. Kết Quả Kiểm Thử Backend (Automated Tests)

Chạy bộ test `scratch/test_backend_api.py` tự động kiểm tra 10 tiêu chí:
1. ✅ **Search sách tồn tại**: Tìm thấy 4 kết quả với từ khóa `10 Vạn Câu Hỏi`.
2. ✅ **Search sách không tồn tại**: Trả về danh sách rỗng `[]`.
3. ✅ **Search không phân biệt hoa/thường**: `1 ngày bằng 48 giờ` và `1 NGÀY BẰNG 48 GIỜ` đều trả về đúng 2 kết quả.
4. ✅ **Availability đúng**: Sách #2 khớp trực tiếp Neon DB (`total: 2`, `borrowed: 1`, `available: 1`).
5. ✅ **totalCopies đúng**: Khớp 100% với số lượng bản sao trong Neon.
6. ✅ **borrowedCopies đúng**: Khớp 100% số bản sao `on_loan` hoặc `reserved`.
7. ✅ **availableCopies đúng**: Khớp 100% số bản sao `available`.
8. ✅ **Library stats đúng**: `totalTitles: 51`, `totalCopies: 65`, `borrowedCopies: 8`, `availableCopies: 57` khớp tuyệt đối với Neon.
9. ✅ **availableCopies không âm**: Tất cả các sách đều có `availableCopies >= 0`.
10. ✅ **Phương trình bảo toàn**: `totalCopies = borrowedCopies + availableCopies` thỏa mãn trên 100% các sách.

---

## 8. Quy Trình Kiểm Thử Thời Gian Thực (Acceptance Test Realtime)

1. **Bước 1: Trạng thái ban đầu**
   - Sách `Clean Code` (ID 51): `totalCopies = 10`, `borrowedCopies = 7`, `availableCopies = 3`.
   - Hỏi bot: *"Clean Code còn bao nhiêu quyển?"*
   - Bot gọi `searchBooks("Clean Code")` -> `getBookAvailability(51)` -> Trả về: **3 quyển**.

2. **Bước 2: Thay đổi dữ liệu trực tiếp trong Neon PostgreSQL**
   - Chạy lệnh SQL:
     ```sql
     UPDATE ban_sao SET trang_thai = 'on_loan' WHERE ma_ban_sao = 'CC-COPY-003';
     UPDATE sach SET so_luong_con = 2 WHERE id = 51;
     ```
   - Dữ liệu mới: `borrowedCopies = 8`, `availableCopies = 2`.
   - **KHÔNG** redeploy Botpress, **KHÔNG** sửa Knowledge Base.

3. **Bước 3: Hỏi lại Botpress**
   - Hỏi lại: *"Clean Code còn bao nhiêu quyển?"*
   - Bot gọi API thời gian thực và trả về kết quả mới: **2 quyển**.

---

## 9. Các Bước Thực Hiện Trên Botpress Studio (Thủ Công Nếu Cần)

1. Mở [Botpress Studio](https://app.botpress.cloud/workspaces/wkspace_01K4Q1D76QVRW8GE9PA6PJH7GG/bots/9569ca68-d6f0-43fc-8321-21fee40cdd03).
2. Vào mục **Actions / Tools** (hoặc trong node Autonomous Agent / Main Flow).
3. Thêm 3 Tool tương ứng:
   - `searchBooks(query)`
   - `getBookAvailability(bookId)`
   - `getLibraryStats()`
   *(Điền URL endpoint Cloudflare Tunnel như ở Mục 5)*.
4. Cập nhật System Prompt / Instructions như ở Mục 6.
5. Bấm nút **Publish** ở góc trên bên phải.

---

## 10. Chi Phí Hiện Tại

- **Neon PostgreSQL**: $0 (Gói Free Tier của Neon bao gồm 0.5 GB lưu trữ, không giới hạn branch, tính theo nhu cầu sử dụng).
- **Botpress Cloud**: $0 (Gói Free Tier của Botpress Cloud bao gồm $5 credit hàng tháng, 2,000 tin nhắn miễn phí).
- **Cloudflare Tunnel / Next.js**: $0 (Miễn phí 100%).
- **Tổng chi phí hiện tại**: **0 VNĐ / $0**.

---

## 11. Các Chức Năng Dành Cho Phase 2 (Chưa Triển Khai Trong Phase 1)

Tuân thủ nghiêm ngặt yêu cầu không làm trong Phase 1:
- Không triển khai đăng nhập người dùng qua chatbot (`auth/login`).
- Không truy cập thông tin cá nhân độc giả (`/users/me`).
- Không xem lịch sử sách đang mượn của cá nhân (`/loans/me`).
- Không tra cứu hạn trả, tiền phạt cá nhân (`/fines`).
- Không thực hiện đặt mượn sách (`POST /loans/request`).
- Không thực hiện trả sách (`POST /loans/return`).
- Không thực hiện gia hạn sách (`POST /loans/renew`).
- Không cho phép chatbot thực hiện bất kỳ lệnh ghi dữ liệu (`INSERT / UPDATE / DELETE`).
