-- =========================================================
-- Library Management System - MySQL schema (Vietnamese)
-- DDL + Seed (ngắn để test)
-- Tested on MySQL 8.x (XAMPP)
-- =========================================================

-- (Tùy chọn) tạo database riêng
CREATE DATABASE IF NOT EXISTS librarydb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE librarydb;

-- =========================================================
-- Library Management System (VN) - MySQL schema + SEED
-- PHẦN 1/4: DDL + seed nền + 18 sách đầu
-- Tested MySQL 8.x (XAMPP). Charset utf8mb4.
-- =========================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- ============ DROP (nếu tồn tại) ============
DROP TABLE IF EXISTS thong_bao;
DROP TABLE IF EXISTS phieu_muon;
DROP TABLE IF EXISTS ban_sao;
DROP TABLE IF EXISTS anh_sach;
DROP TABLE IF EXISTS sach;
DROP TABLE IF EXISTS vi_tri_ke;
DROP TABLE IF EXISTS nha_xuat_ban;
DROP TABLE IF EXISTS chinh_sach;
DROP TABLE IF EXISTS cau_hinh_thu_vien;
DROP TABLE IF EXISTS nguoi_dung;

-- ============ DDL ============
CREATE TABLE nguoi_dung (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL UNIQUE,
  mat_khau_hash VARCHAR(255) NOT NULL,
  ho_ten VARCHAR(255) NOT NULL,
  vai_tro ENUM('admin','user') NOT NULL,
  loai_nguoi_dung ENUM('student','staff','guest') NOT NULL DEFAULT 'student',
  hoat_dong TINYINT(1) NOT NULL DEFAULT 1,
  tao_luc DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  so_dien_thoai VARCHAR(32) DEFAULT NULL,
  dia_chi VARCHAR(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE nha_xuat_ban (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  ten VARCHAR(255) NOT NULL UNIQUE,
  dia_chi VARCHAR(255),
  website VARCHAR(255),
  ghi_chu TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE sach (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  tieu_de TEXT NOT NULL,
  tieu_de_phu TEXT,
  tac_gia TEXT NOT NULL,
  id_nxb BIGINT UNSIGNED,
  nam_xb INT,
  ngon_ngu VARCHAR(32),
  the_loai TEXT,
  mo_ta LONGTEXT,
  gia_bia DECIMAL(12,2),
  don_vi_tien VARCHAR(10) DEFAULT 'VND',
  so_luong_tong INT NOT NULL DEFAULT 0,
  so_luong_con INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_sach_nxb FOREIGN KEY (id_nxb) REFERENCES nha_xuat_ban(id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE anh_sach (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  id_sach BIGINT UNSIGNED NOT NULL,
  url_anh TEXT NOT NULL,
  la_anh_dai_dien TINYINT(1) NOT NULL DEFAULT 0,
  thu_tu INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_anh_sach FOREIGN KEY (id_sach) REFERENCES sach(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  INDEX (id_sach),
  INDEX (la_anh_dai_dien)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE vi_tri_ke (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  ma_ke VARCHAR(64) NOT NULL UNIQUE,
  tang VARCHAR(32),
  phong VARCHAR(64),
  ke VARCHAR(32),
  hang VARCHAR(32),
  cot VARCHAR(32),
  ghi_chu TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE ban_sao (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  id_sach BIGINT UNSIGNED NOT NULL,
  ma_ban_sao VARCHAR(64) NOT NULL UNIQUE,
  id_vi_tri BIGINT UNSIGNED NOT NULL,
  trang_thai ENUM('available','on_loan','reserved','lost','maintenance') NOT NULL DEFAULT 'available',
  tao_luc DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  cap_nhat_luc DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_ban_sao_sach   FOREIGN KEY (id_sach) REFERENCES sach(id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_ban_sao_vitri  FOREIGN KEY (id_vi_tri) REFERENCES vi_tri_ke(id) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE phieu_muon (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  id_ban_sao BIGINT UNSIGNED NOT NULL,
  id_nguoi_dung BIGINT UNSIGNED NOT NULL,
  trang_thai ENUM('requested','rejected','borrowed','return_requested','returned','overdue') NOT NULL,
  ly_do_tu_choi TEXT,
  nguoi_duyet BIGINT UNSIGNED,
  duyet_luc DATETIME,
  muon_luc DATETIME,
  han_tra DATETIME,
  yeu_cau_tra_luc DATETIME,
  nguoi_duyet_tra BIGINT UNSIGNED,
  tra_luc DATETIME,
  so_tien_phat DECIMAL(12,2) DEFAULT 0.00,
  noi_dung_phat TEXT,
  da_nop_phat TINYINT(1) DEFAULT 0,
  ngay_nop_phat DATETIME,
  admin_xac_nhan_phat BIGINT UNSIGNED,
  tao_luc DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pm_copy  FOREIGN KEY (id_ban_sao)   REFERENCES ban_sao(id) ON UPDATE CASCADE,
  CONSTRAINT fk_pm_user  FOREIGN KEY (id_nguoi_dung) REFERENCES nguoi_dung(id) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE chinh_sach (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  loai_nguoi_dung ENUM('student','staff','guest') NOT NULL UNIQUE,
  toi_da_muon INT NOT NULL DEFAULT 3,
  so_ngay_muon INT NOT NULL DEFAULT 14,
  phat_moi_ngay DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  so_lan_gia_han INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE thong_bao (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  id_nguoi_dung BIGINT UNSIGNED NOT NULL,
  loai VARCHAR(40) NOT NULL,
  tieu_de TEXT NOT NULL,
  noi_dung TEXT,
  da_doc TINYINT(1) NOT NULL DEFAULT 0,
  tao_luc DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_tb_user FOREIGN KEY (id_nguoi_dung) REFERENCES nguoi_dung(id) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE cau_hinh_thu_vien (
  khoa VARCHAR(100) PRIMARY KEY,
  gia_tri TEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `noi_quy` (
  `key_name`   VARCHAR(64)  NOT NULL,
  `value_text` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`key_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `noi_quy` (`key_name`, `value_text`) VALUES
  ('gio_mo_cua',     '08:00–20:00 hằng ngày'),
  ('muon_ve_nha',    'Có. Mang theo thẻ bạn đọc khi làm thủ tục mượn.'),
  ('thoi_gian_muon', '14 ngày / lượt (có thể trả sớm).'),
  ('gia_han',        'Có. Tối đa 2 lần, mỗi lần thêm 7 ngày nếu không có người đặt trước.'),
  ('phat_tre',       '2.000đ/ngày/cuốn. Sau 15 ngày sẽ tạm khóa tài khoản.'),

  -- Các mục mở rộng (code hiện tại chưa đọc, nhưng để sẵn cho tương lai)
  ('so_sach_toi_da', 'Tối đa 5 cuốn đang mượn cùng lúc.'),
  ('dat_truoc',      'Có. Giữ sách 48 giờ kể từ khi có thông báo.'),
  ('mat_hong',       'Bồi thường đúng đầu sách hoặc theo giá bìa + phí xử lý 10%.'),
  ('khong_gay_on',   'Giữ im lặng trong phòng đọc; để điện thoại ở chế độ im lặng.'),
  ('wifi',           'Có Wi-Fi miễn phí tại phòng đọc.'),
  ('in_an',          'Có dịch vụ in/scan tại quầy thủ thư (tính phí).')
ON DUPLICATE KEY UPDATE `value_text`=VALUES(`value_text`);

CREATE TABLE IF NOT EXISTS `noi_quy_dong` (
  `id` BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  `tieu_de` VARCHAR(255) NOT NULL,
  `mo_ta` TEXT,
  `danh_muc` ENUM('borrowing','behavior','penalty','general','technical') DEFAULT 'general',
  `trang_thai` ENUM('active','inactive','draft') DEFAULT 'active',
  `muc_do` ENUM('low','medium','high','critical') DEFAULT 'medium',
  `doi_tuong` ENUM('all','students','teachers','staff','specific') DEFAULT 'all',
  `ngay_hieu_luc` DATE,
  `ngay_het_hieu_luc` DATE,
  `so_tien_phat` DECIMAL(12,2),
  `loai_phat` ENUM('fine','suspension','warning','none') DEFAULT 'none',
  `don_vi_tien` VARCHAR(10) DEFAULT 'VND',
  `nguoi_tao` VARCHAR(255),
  `nguoi_cap_nhat` VARCHAR(255),
  `tao_luc` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `cap_nhat_luc` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO noi_quy_dong (
  tieu_de, mo_ta, danh_muc, trang_thai, muc_do, doi_tuong, ngay_hieu_luc, ngay_het_hieu_luc, so_tien_phat, loai_phat, don_vi_tien, nguoi_tao, nguoi_cap_nhat
) VALUES
  ('Không nói chuyện trong thư viện', 'Giữ trật tự tuyệt đối trong khu vực thư viện.', 'behavior', 'active', 'medium', 'all', '2024-06-01', NULL, 50000, 'fine', 'VND', 'Admin', 'Admin'),
  ('Trả sách đúng hạn', 'Phải trả sách trước hoặc đúng ngày hết hạn. Quá hạn sẽ bị phạt.', 'borrowing', 'active', 'high', 'all', '2024-06-01', NULL, 2000, 'fine', 'VND', 'Admin', 'Admin'),
  ('Không mang đồ ăn thức uống vào thư viện', 'Cấm mang đồ ăn, nước uống vào phòng đọc để giữ vệ sinh.', 'behavior', 'active', 'low', 'all', '2024-06-01', NULL, NULL, 'none', 'VND', 'Admin', 'Admin'),
  ('Không sử dụng điện thoại trong phòng đọc', 'Điện thoại phải để chế độ im lặng, không nghe/gọi trong phòng đọc.', 'behavior', 'active', 'medium', 'all', '2024-06-01', NULL, NULL, 'warning', 'VND', 'Admin', 'Admin'),
  ('Không tự ý di chuyển sách', 'Không tự ý lấy hoặc di chuyển sách khỏi vị trí quy định.', 'general', 'active', 'medium', 'all', '2024-06-01', NULL, NULL, 'none', 'VND', 'Admin', 'Admin'),
  ('Không làm hỏng sách', 'Nếu làm hỏng/mất sách phải bồi thường theo quy định.', 'penalty', 'active', 'high', 'all', '2024-06-01', NULL, 100000, 'fine', 'VND', 'Admin', 'Admin');


-- ============ TRIGGERS cập nhật số lượng ============
-- Triggers sẽ được tạo lại ở cuối file sau khi thêm dữ liệu mẫu

-- ============ SEED NỀN ============
INSERT INTO nguoi_dung (email, mat_khau_hash, ho_ten, vai_tro, loai_nguoi_dung)
VALUES ('admin@lib.test', '$2b$12$Fv7aYX21SbK7Ttof0XDSIOwZwwYjRHAUj1WvyTpEpq4uT5LTu9G/6', 'Thủ thư Admin', 'admin', 'staff')
ON DUPLICATE KEY UPDATE email=VALUES(email);

INSERT INTO chinh_sach (loai_nguoi_dung, toi_da_muon, so_ngay_muon, phat_moi_ngay, so_lan_gia_han) VALUES
('student',3,14,2000,0) ON DUPLICATE KEY UPDATE toi_da_muon=VALUES(toi_da_muon);
INSERT INTO chinh_sach (loai_nguoi_dung, toi_da_muon, so_ngay_muon, phat_moi_ngay, so_lan_gia_han) VALUES
('staff',5,30,0,0) ON DUPLICATE KEY UPDATE toi_da_muon=VALUES(toi_da_muon);
INSERT INTO chinh_sach (loai_nguoi_dung, toi_da_muon, so_ngay_muon, phat_moi_ngay, so_lan_gia_han) VALUES
('guest',1,7,5000,0) ON DUPLICATE KEY UPDATE toi_da_muon=VALUES(toi_da_muon);

INSERT INTO cau_hinh_thu_vien (khoa, gia_tri) VALUES
('opening_hours','Thứ 2-6: 8:00-20:00; Thứ 7: 8:00-17:00; CN: nghỉ.'),
('rules','Giữ trật tự; không ăn uống trong phòng đọc; trả sách đúng hạn.'),
('bank_info','STK: 0123456789 - Ngân hàng ABC - Chủ TK: Thu Thư')
ON DUPLICATE KEY UPDATE gia_tri=VALUES(gia_tri);

INSERT INTO vi_tri_ke (ma_ke, tang, phong, ke, hang, cot, ghi_chu) VALUES
('A-01-01-01','1','Phòng Đọc','A','01','01','Kệ tổng hợp')
ON DUPLICATE KEY UPDATE ma_ke=VALUES(ma_ke);
INSERT INTO vi_tri_ke (ma_ke, tang, phong, ke, hang, cot, ghi_chu) VALUES
('A-01-02-05','1','Phòng Đọc','A','02','05','Kệ văn học')
ON DUPLICATE KEY UPDATE ma_ke=VALUES(ma_ke);
INSERT INTO vi_tri_ke (ma_ke, tang, phong, ke, hang, cot, ghi_chu) VALUES
('B-02-03-12','2','Phòng Tự Học','B','03','12','Kệ khoa học')
ON DUPLICATE KEY UPDATE ma_ke=VALUES(ma_ke);

-- NXB (từ seed + chuẩn hoá)
INSERT INTO nha_xuat_ban (ten) VALUES
('NXB Thanh Niên'),('NXB Văn học'),('Nxb Văn Học'),('Văn học'),('Mỹ Thuật'),
('Nxb Mĩ Thuật'),('NXB Phụ Nữ'),('NXB KHTN'),('DUKA')
ON DUPLICATE KEY UPDATE ten=VALUES(ten);

-- =========================================================
-- SEED SÁCH (1 → 18)
-- Lưu ý: mô tả/giá/nam_xb bịa hợp lý; ảnh dùng link chuẩn từ seed gốc.
-- =========================================================

-- 1) 1 Ngày Bằng 48 Giờ - Sổ Tay Quản Lí Thời Gian Hiệu Quả
INSERT INTO sach (tieu_de,tac_gia,id_nxb,nam_xb,ngon_ngu,the_loai,mo_ta,gia_bia,don_vi_tien)
VALUES (
  '1 Ngày Bằng 48 Giờ - Sổ Tay Quản Lí Thời Gian Hiệu Quả',
  'Viện Nghiên Cứu Thực Tế Nhanh',
  (SELECT id FROM nha_xuat_ban WHERE ten='NXB Thanh Niên'),
  2020,'vi','Kỹ năng; Quản lý thời gian',
  'Sổ tay thực hành quản lí thời gian theo 3 bước WHAT-WHY-HOW. Phù hợp sinh viên và nhân viên mới.',
  89000,'VND'
);
SET @sid = LAST_INSERT_ID();
INSERT INTO anh_sach (id_sach,url_anh,la_anh_dai_dien,thu_tu) VALUES
(@sid,'https://product.hstatic.net/1000237375/product/1080x1080_mot_ngay_bang_48_gio_3c53f3157d66419fb39d33fd743dace6.jpg',1,0),
(@sid,'https://product.hstatic.net/1000237375/product/2caf169f8ab87ee627a948_63b013ca98bc4ad7aac18eb6bb9025f6.jpg',0,1),
(@sid,'https://product.hstatic.net/1000237375/product/4dddc9405567a139f87643_38c6465723814c51b224d68ecad34ace.jpg',0,2);
INSERT INTO ban_sao (id_sach,ma_ban_sao,id_vi_tri,trang_thai)
VALUES (@sid,'1-NGAY-B-001',(SELECT id FROM vi_tri_ke WHERE ma_ke='A-01-02-05'),'available');

-- 2) 10 Vạn Câu Hỏi Vì Sao - Tập 1 (Tái Bản)
INSERT INTO sach (tieu_de,tac_gia,id_nxb,nam_xb,ngon_ngu,the_loai,mo_ta,gia_bia,don_vi_tien)
VALUES (
  '10 Vạn Câu Hỏi Vì Sao - Tập 1 (Tái Bản)','Đặng Minh Dũng',
  (SELECT id FROM nha_xuat_ban WHERE ten='NXB Thanh Niên'),
  2021,'vi','Thiếu nhi; Kiến thức phổ thông',
  'Tổng hợp các câu hỏi vì sao gần gũi, minh hoạ sinh động, giúp trẻ khám phá thế giới.',
  120000,'VND'
);
SET @sid = LAST_INSERT_ID();
INSERT INTO anh_sach (id_sach,url_anh,la_anh_dai_dien,thu_tu) VALUES
(@sid,'https://product.hstatic.net/1000237375/product/vancauhoi_visao_t1.jpg',1,0),
(@sid,'https://product.hstatic.net/1000237375/product/z4302357863020_563aef61f0a94a5a6b15bdc08a068b2e__1__caaf70bb7bde4c30ac52d0b0412dbc58.jpg',0,1);
INSERT INTO ban_sao (id_sach,ma_ban_sao,id_vi_tri,trang_thai)
VALUES (@sid,'10-VAN-C1-001',(SELECT id FROM vi_tri_ke WHERE ma_ke='A-01-02-05'),'available');

-- 3) 10 Vạn Câu Hỏi Vì Sao - Tập 2 (Tái Bản)
INSERT INTO sach (tieu_de,tac_gia,id_nxb,nam_xb,ngon_ngu,the_loai,mo_ta,gia_bia,don_vi_tien)
VALUES (
  '10 Vạn Câu Hỏi Vì Sao - Tập 2 (Tái Bản)','Đặng Minh Dũng',
  (SELECT id FROM nha_xuat_ban WHERE ten='NXB Thanh Niên'),
  2021,'vi','Thiếu nhi; Kiến thức phổ thông',
  'Bộ Vì Sao tập 2, mở rộng chủ đề vũ trụ, trái đất, khoa học và xã hội.',
  120000,'VND'
);
SET @sid = LAST_INSERT_ID();
INSERT INTO anh_sach (id_sach,url_anh,la_anh_dai_dien,thu_tu) VALUES
(@sid,'https://product.hstatic.net/1000237375/product/cover_f180684ac91c429ba3d0331343a5ac27.jpg',1,0),
(@sid,'https://product.hstatic.net/1000237375/product/z4302357017970_08638b57b44713a3d66fe40efec57191__1__e3f4afeae61246d0b63874b46d018f3e.jpg',0,1);
INSERT INTO ban_sao (id_sach,ma_ban_sao,id_vi_tri,trang_thai)
VALUES (@sid,'10-VAN-C2-001',(SELECT id FROM vi_tri_ke WHERE ma_ke='B-02-03-12'),'available');

-- 4) 100 Câu Chuyện Hay Dành Cho Bé Gái (Tái Bản)
INSERT INTO sach (tieu_de,tac_gia,id_nxb,nam_xb,ngon_ngu,the_loai,mo_ta,gia_bia,don_vi_tien)
VALUES (
  '100 Câu Chuyện Hay Dành Cho Bé Gái (Tái Bản)','Nhiều tác giả',
  (SELECT id FROM nha_xuat_ban WHERE ten='Văn học'),
  2019,'vi','Thiếu nhi; Truyện ngắn',
  '100 câu chuyện nuôi dưỡng phẩm chất tốt đẹp, hình ảnh sinh động phù hợp bé gái.',
  99000,'VND'
);
SET @sid = LAST_INSERT_ID();
INSERT INTO anh_sach (id_sach,url_anh,la_anh_dai_dien,thu_tu) VALUES
(@sid,'https://product.hstatic.net/1000237375/product/1_c3108369c9e14951aea57682eeb35ab5.png',1,0),
(@sid,'https://product.hstatic.net/1000237375/product/f82c140097324f6c1623_32782e82d31146ccbe1cf86dcecfc0f5.jpg',0,1);
INSERT INTO ban_sao (id_sach,ma_ban_sao,id_vi_tri,trang_thai)
VALUES (@sid,'100-BEG-001',(SELECT id FROM vi_tri_ke WHERE ma_ke='A-01-02-05'),'available');

-- 5) 100 Câu Chuyện Hay Dành Cho Bé Trai (Tái Bản)
INSERT INTO sach (tieu_de,tac_gia,id_nxb,nam_xb,ngon_ngu,the_loai,mo_ta,gia_bia,don_vi_tien)
VALUES (
  '100 Câu Chuyện Hay Dành Cho Bé Trai (Tái Bản)','Nhiều tác giả',
  (SELECT id FROM nha_xuat_ban WHERE ten='Văn học'),
  2019,'vi','Thiếu nhi; Truyện ngắn',
  '100 chuyện truyền cảm hứng cho bé trai: dũng cảm, kiên cường, trung thực.',
  99000,'VND'
);
SET @sid = LAST_INSERT_ID();
INSERT INTO anh_sach (id_sach,url_anh,la_anh_dai_dien,thu_tu) VALUES
(@sid,'https://product.hstatic.net/1000237375/product/1_80d7f728fe5d463392066af843035f93.png',1,0),
(@sid,'https://product.hstatic.net/1000237375/product/02ea144ba17979272068_df7e04915a3449b294b7b6c071b87cc2.jpg',0,1);
INSERT INTO ban_sao (id_sach,ma_ban_sao,id_vi_tri,trang_thai)
VALUES (@sid,'100-BET-001',(SELECT id FROM vi_tri_ke WHERE ma_ke='A-01-01-01'),'available');

-- 6) 100 Truyện Cổ Tích Thế Giới (TB)
INSERT INTO sach (tieu_de,tac_gia,id_nxb,nam_xb,ngon_ngu,the_loai,mo_ta,gia_bia,don_vi_tien)
VALUES (
  '100 Truyện Cổ Tích Thế Giới (TB)','Ngọc Ánh',
  (SELECT id FROM nha_xuat_ban WHERE ten='NXB Thanh Niên'),
  2018,'vi','Thiếu nhi; Cổ tích',
  'Tuyển tập cổ tích kinh điển thế giới cho thiếu nhi.',
  150000,'VND'
);
SET @sid = LAST_INSERT_ID();
INSERT INTO anh_sach (id_sach,url_anh,la_anh_dai_dien,thu_tu) VALUES
(@sid,'https://product.hstatic.net/1000237375/product/bia_100_truyen_co_tich_the_gioi.jpg',1,0);
INSERT INTO ban_sao (id_sach,ma_ban_sao,id_vi_tri,trang_thai)
VALUES (@sid,'100-TG-001',(SELECT id FROM vi_tri_ke WHERE ma_ke='B-02-03-12'),'available');

-- 7) 100 Truyện Cổ Tích Việt Nam (Tái Bản)
INSERT INTO sach (tieu_de,tac_gia,id_nxb,nam_xb,ngon_ngu,the_loai,mo_ta,gia_bia,don_vi_tien)
VALUES (
  '100 Truyện Cổ Tích Việt Nam (Tái Bản)','Nhiều tác giả',
  (SELECT id FROM nha_xuat_ban WHERE ten='NXB Thanh Niên'),
  2018,'vi','Thiếu nhi; Cổ tích',
  'Kho tàng cổ tích Việt Nam – giáo dục nhân cách, lòng nhân ái.',
  145000,'VND'
);
SET @sid = LAST_INSERT_ID();
INSERT INTO anh_sach (id_sach,url_anh,la_anh_dai_dien,thu_tu) VALUES
(@sid,'https://product.hstatic.net/1000237375/product/100-truyen-co-tich-viet-nam-440.jpg',1,0);
INSERT INTO ban_sao (id_sach,ma_ban_sao,id_vi_tri,trang_thai)
VALUES (@sid,'100-CTVN-001',(SELECT id FROM vi_tri_ke WHERE ma_ke='A-01-01-01'),'available');

-- 8) 100 Truyện Hay Rèn Đức Tính Tốt (Tái Bản)
INSERT INTO sach (tieu_de,tac_gia,id_nxb,nam_xb,ngon_ngu,the_loai,mo_ta,gia_bia,don_vi_tien)
VALUES (
  '100 Truyện Hay Rèn Đức Tính Tốt (Tái Bản)','Nhiều tác giả',
  (SELECT id FROM nha_xuat_ban WHERE ten='Nxb Văn Học'),
  2019,'vi','Thiếu nhi; Kĩ năng sống',
  '100 câu chuyện kèm bài học rèn luyện đức tính tốt cho trẻ.',
  110000,'VND'
);
SET @sid = LAST_INSERT_ID();
INSERT INTO anh_sach (id_sach,url_anh,la_anh_dai_dien,thu_tu) VALUES
(@sid,'https://product.hstatic.net/1000237375/product/100-truyen-duc-tinh-900x900_179fb8c820594acca4ddcc73c83a5d2d_master_3ba7484c036543e1b52b5c1a3e345cef.png',1,0);
INSERT INTO ban_sao (id_sach,ma_ban_sao,id_vi_tri,trang_thai)
VALUES (@sid,'100-DTT-001',(SELECT id FROM vi_tri_ke WHERE ma_ke='B-02-03-12'),'available');

-- 9) 100 Truyện Ngụ Ngôn Song Ngữ Anh - Việt Hay Nhất
INSERT INTO sach (tieu_de,tac_gia,id_nxb,nam_xb,ngon_ngu,the_loai,mo_ta,gia_bia,don_vi_tien)
VALUES (
  '100 Truyện Ngụ Ngôn Song Ngữ Anh - Việt Hay Nhất','Nguyễn Châu Nguyên',
  (SELECT id FROM nha_xuat_ban WHERE ten='Mỹ Thuật'),
  2020,'vi','Thiếu nhi; Song ngữ',
  'Tuyển tập ngụ ngôn chọn lọc, trình bày song ngữ Anh-Việt giúp nâng cao từ vựng.',
  135000,'VND'
);
SET @sid = LAST_INSERT_ID();
INSERT INTO anh_sach (id_sach,url_anh,la_anh_dai_dien,thu_tu) VALUES
(@sid,'https://product.hstatic.net/1000237375/product/thi_t_k__ch_a_c__t_n_ef554182dc0a4040b417c56e0d953a5e.png',1,0);
INSERT INTO ban_sao (id_sach,ma_ban_sao,id_vi_tri,trang_thai)
VALUES (@sid,'100-NN-001',(SELECT id FROM vi_tri_ke WHERE ma_ke='A-01-02-05'),'available');

-- 10) 1000 Từ Tiếng Anh Đầu Tiên
INSERT INTO sach (tieu_de,tac_gia,id_nxb,nam_xb,ngon_ngu,the_loai,mo_ta,gia_bia,don_vi_tien)
VALUES (
  '1000 Từ Tiếng Anh Đầu Tiên','Minh Long',
  (SELECT id FROM nha_xuat_ban WHERE ten='Nxb Mĩ Thuật'),
  2022,'vi','Thiếu nhi; Từ vựng',
  'Sách tranh 1000 từ vựng cơ bản cho bé, minh hoạ màu tươi sáng.',
  99000,'VND'
);
SET @sid = LAST_INSERT_ID();
INSERT INTO anh_sach (id_sach,url_anh,la_anh_dai_dien,thu_tu) VALUES
(@sid,'https://product.hstatic.net/1000237375/product/1_198be45d6ce94c5b84f5ce5c974f5edb.png',1,0);
INSERT INTO ban_sao (id_sach,ma_ban_sao,id_vi_tri,trang_thai)
VALUES (@sid,'1000-TU-001',(SELECT id FROM vi_tri_ke WHERE ma_ke='A-01-02-05'),'available');

-- 11) 101 Câu Chuyện Về Các Nàng Công Chúa (Tái Bản)
INSERT INTO sach (tieu_de,tac_gia,id_nxb,nam_xb,ngon_ngu,the_loai,mo_ta,gia_bia,don_vi_tien)
VALUES (
  '101 Câu Chuyện Về Các Nàng Công Chúa (Tái Bản)','Nhiều tác giả',
  (SELECT id FROM nha_xuat_ban WHERE ten='NXB Văn học'),
  2019,'vi','Thiếu nhi; Cổ tích',
  '101 chuyện cổ tích về các nàng công chúa, nuôi dưỡng phẩm chất tốt đẹp.',
  119000,'VND'
);
SET @sid = LAST_INSERT_ID();
INSERT INTO anh_sach (id_sach,url_anh,la_anh_dai_dien,thu_tu) VALUES
(@sid,'https://product.hstatic.net/1000237375/product/bt_fdd03a27053d412cbc204e24eaa8b830.jpg',1,0);
INSERT INTO ban_sao (id_sach,ma_ban_sao,id_vi_tri,trang_thai)
VALUES (@sid,'101-PRIN-001',(SELECT id FROM vi_tri_ke WHERE ma_ke='B-02-03-12'),'available');

-- 12) 101 Từ Đầu Tiên Cho Bé - Bảng Chữ Cái (Tái bản)
INSERT INTO sach (tieu_de,tac_gia,id_nxb,nam_xb,ngon_ngu,the_loai,mo_ta,gia_bia,don_vi_tien)
VALUES (
  '101 Từ Đầu Tiên Cho Bé - Bảng Chữ Cái (Tái bản)','Nhiều tác giả',
  (SELECT id FROM nha_xuat_ban WHERE ten='Nxb Mĩ Thuật'),
  2022,'vi','Thiếu nhi; Từ vựng',
  'Bảng chữ cái kèm từ vựng minh hoạ, thích hợp cho bé 2-7 tuổi.',
  69000,'VND'
);
SET @sid = LAST_INSERT_ID();
INSERT INTO anh_sach (id_sach,url_anh,la_anh_dai_dien,thu_tu) VALUES
(@sid,'https://product.hstatic.net/1000237375/product/1_08814a638afe42eb943847a13faed51e.png',1,0);
INSERT INTO ban_sao (id_sach,ma_ban_sao,id_vi_tri,trang_thai)
VALUES (@sid,'101-ABC-001',(SELECT id FROM vi_tri_ke WHERE ma_ke='A-01-01-01'),'available');

-- 13) 101 Từ Đầu Tiên Cho Bé - Đồ Dùng Thân Thiết (Tái Bản)
INSERT INTO sach (tieu_de,tac_gia,id_nxb,nam_xb,ngon_ngu,the_loai,mo_ta,gia_bia,don_vi_tien)
VALUES (
  '101 Từ Đầu Tiên Cho Bé - Đồ Dùng Thân Thiết (Tái Bản)','Nhiều tác giả',
  (SELECT id FROM nha_xuat_ban WHERE ten='Nxb Mĩ Thuật'),
  2022,'vi','Thiếu nhi; Từ vựng',
  'Từ vựng chủ đề đồ dùng thân thiết, minh hoạ nhiều màu.',
  69000,'VND'
);
SET @sid = LAST_INSERT_ID();
INSERT INTO anh_sach (id_sach,url_anh,la_anh_dai_dien,thu_tu) VALUES
(@sid,'https://product.hstatic.net/1000237375/product/thiet_ke_khong_ten__1__971e1dc3d3314b3fb498de345f78726a.png',1,0);
INSERT INTO ban_sao (id_sach,ma_ban_sao,id_vi_tri,trang_thai)
VALUES (@sid,'101-BEL-001',(SELECT id FROM vi_tri_ke WHERE ma_ke='A-01-02-05'),'available');

-- 14) 101 Truyện Cổ Tích Chọn Lọc (Tái bản)
INSERT INTO sach (tieu_de,tac_gia,id_nxb,nam_xb,ngon_ngu,the_loai,mo_ta,gia_bia,don_vi_tien)
VALUES (
  'Sách - 101 Truyện Cổ Tích Chọn Lọc (Tái bản )','Vương Diễm Nga',
  (SELECT id FROM nha_xuat_ban WHERE ten='NXB Văn học'),
  2018,'vi','Thiếu nhi; Cổ tích',
  'Bộ sưu tập 101 truyện cổ tích chọn lọc, giáo dục lòng nhân ái.',
  135000,'VND'
);
SET @sid = LAST_INSERT_ID();
INSERT INTO anh_sach (id_sach,url_anh,la_anh_dai_dien,thu_tu) VALUES
(@sid,'https://product.hstatic.net/1000237375/product/1_4fc9f81953e34f74bf310692611328e5.png',1,0);
INSERT INTO ban_sao (id_sach,ma_ban_sao,id_vi_tri,trang_thai)
VALUES (@sid,'101-CTCL-001',(SELECT id FROM vi_tri_ke WHERE ma_ke='A-01-01-01'),'available');

-- 15) 101 Truyện Hay Về Trí Thông Minh (Tái bản)
INSERT INTO sach (tieu_de,tac_gia,id_nxb,nam_xb,ngon_ngu,the_loai,mo_ta,gia_bia,don_vi_tien)
VALUES (
  'Sách - 101 Truyện Hay Về Trí Thông Minh (Tái bản )','Vương Diễm Nga',
  (SELECT id FROM nha_xuat_ban WHERE ten='NXB Văn học'),
  2019,'vi','Thiếu nhi; Kỹ năng',
  '101 câu chuyện kích thích tư duy, khơi gợi trí thông minh cho trẻ.',
  129000,'VND'
);
SET @sid = LAST_INSERT_ID();
INSERT INTO anh_sach (id_sach,url_anh,la_anh_dai_dien,thu_tu) VALUES
(@sid,'https://product.hstatic.net/1000237375/product/1_0368e9ae51f241d595e7728ac91d517b.png',1,0);
INSERT INTO ban_sao (id_sach,ma_ban_sao,id_vi_tri,trang_thai)
VALUES (@sid,'101-TTM-001',(SELECT id FROM vi_tri_ke WHERE ma_ke='B-02-03-12'),'available');

-- 16) 101 Truyện Hay Theo Bước Bé Gái Trưởng Thành (Tái bản)
INSERT INTO sach (tieu_de,tac_gia,id_nxb,nam_xb,ngon_ngu,the_loai,mo_ta,gia_bia,don_vi_tien)
VALUES (
  '101 Truyện Hay Theo Bước Bé Gái Trưởng Thành ( Tái bản )','Vương Diễm Nga',
  (SELECT id FROM nha_xuat_ban WHERE ten='NXB Văn học'),
  2019,'vi','Thiếu nhi; Kỹ năng',
  'Định hướng phẩm chất, nuôi dưỡng thói quen tốt dành cho bé gái.',
  129000,'VND'
);
SET @sid = LAST_INSERT_ID();
INSERT INTO anh_sach (id_sach,url_anh,la_anh_dai_dien,thu_tu) VALUES
(@sid,'https://product.hstatic.net/1000237375/product/1_b74864f5f33d48718acc8d2b99003e8a.png',1,0);
INSERT INTO ban_sao (id_sach,ma_ban_sao,id_vi_tri,trang_thai)
VALUES (@sid,'101-BEGT-001',(SELECT id FROM vi_tri_ke WHERE ma_ke='A-01-02-05'),'available');

-- 17) 101 Truyện Mẹ Kể Con Nghe (Tái bản)
INSERT INTO sach (tieu_de,tac_gia,id_nxb,nam_xb,ngon_ngu,the_loai,mo_ta,gia_bia,don_vi_tien)
VALUES (
  'Sách - 101 Truyện Mẹ Kể Con Nghe ( Tái bản )','Ngọc Ánh',
  (SELECT id FROM nha_xuat_ban WHERE ten='NXB Thanh Niên'),
  2018,'vi','Thiếu nhi; Cổ tích',
  'Những câu chuyện cổ tích diệu kỳ kể trước giờ đi ngủ.',
  115000,'VND'
);
SET @sid = LAST_INSERT_ID();
INSERT INTO anh_sach (id_sach,url_anh,la_anh_dai_dien,thu_tu) VALUES
(@sid,'https://product.hstatic.net/1000237375/product/bt_152ee859b0474596bdd681c772a309fc.jpg',1,0);
INSERT INTO ban_sao (id_sach,ma_ban_sao,id_vi_tri,trang_thai)
VALUES (@sid,'101-MEKE-001',(SELECT id FROM vi_tri_ke WHERE ma_ke='A-01-02-05'),'available');

-- 18) 101 Truyện Phá Án Kinh Điển (Tái bản)
INSERT INTO sach (tieu_de,tac_gia,id_nxb,nam_xb,ngon_ngu,the_loai,mo_ta,gia_bia,don_vi_tien)
VALUES (
  '101 Truyện Phá Án Kinh Điển (Tái bản)','Vương Diễm Nga',
  (SELECT id FROM nha_xuat_ban WHERE ten='NXB Văn học'),
  2020,'vi','Thiếu nhi; Phiêu lưu',
  'Tổng hợp các vụ án kinh điển, rèn luyện tư duy suy luận cho trẻ.',
  139000,'VND'
);
SET @sid = LAST_INSERT_ID();
INSERT INTO anh_sach (id_sach,url_anh,la_anh_dai_dien,thu_tu) VALUES
(@sid,'https://product.hstatic.net/1000237375/product/thiet_ke_chua_co_ten__4__7ebbbb59d5a0484989646403a3eea877.png',1,0);
INSERT INTO ban_sao (id_sach,ma_ban_sao,id_vi_tri,trang_thai)
VALUES (@sid,'101-PA-001',(SELECT id FROM vi_tri_ke WHERE ma_ke='B-02-03-12'),'available');

-- ====== Hết PHẦN 1/4 ======
-- =========================================================
-- PHẦN 2/4: Seed sách #19 → #31
-- =========================================================

-- 19) 1 Ngày Bằng 48 Giờ - Sổ Tay Quản Lí Thời Gian Hiệu Quả
INSERT INTO sach (tieu_de,tac_gia,id_nxb,nam_xb,ngon_ngu,the_loai,mo_ta,gia_bia,don_vi_tien)
VALUES (
  '1 Ngày Bằng 48 Giờ - Sổ Tay Quản Lí Thời Gian Hiệu Quả','Viện Nghiên Cứu Thực Tế Nhanh',
  (SELECT id FROM nha_xuat_ban WHERE ten='NXB Thanh Niên'),
  2023,'vi','Kỹ năng; Quản lý thời gian',
  'Cuốn sách hướng dẫn cách quản lý thời gian hiệu quả để tối ưu hóa năng suất làm việc.',
  57600,'VND'
);
SET @sid = LAST_INSERT_ID();
INSERT INTO anh_sach (id_sach,url_anh,la_anh_dai_dien) VALUES
(@sid,'http://product.hstatic.net/1000237375/product/1080x1080_mot_ngay_bang_48_gio_3c53f3157d66419fb39d33fd743dace6_grande.jpg',1);
INSERT INTO ban_sao (id_sach,ma_ban_sao,id_vi_tri) VALUES
(@sid,'1NG48G-001',(SELECT id FROM vi_tri_ke WHERE ma_ke='A-01-01-01'));

-- 20) 10 Vạn Câu Hỏi Vì Sao - Tập 2 (Tái Bản)
INSERT INTO sach (tieu_de,tac_gia,id_nxb,nam_xb,ngon_ngu,the_loai,mo_ta,gia_bia,don_vi_tien)
VALUES (
  '10 Vạn Câu Hỏi Vì Sao - Tập 2 (Tái Bản)','Đặng Minh Dũng',
  (SELECT id FROM nha_xuat_ban WHERE ten='NXB Thanh Niên'),
  2023,'vi','Thiếu nhi; Khoa học',
  'Tập 2 của bộ sách trả lời những câu hỏi thú vị về thế giới xung quanh cho trẻ em.',
  44000,'VND'
);
SET @sid = LAST_INSERT_ID();
INSERT INTO anh_sach (id_sach,url_anh,la_anh_dai_dien) VALUES
(@sid,'http://product.hstatic.net/1000237375/product/cover_f180684ac91c429ba3d0331343a5ac27_grande.jpg',1);
INSERT INTO ban_sao (id_sach,ma_ban_sao,id_vi_tri) VALUES
(@sid,'10VCHVS2-001',(SELECT id FROM vi_tri_ke WHERE ma_ke='A-01-02-05'));

-- 21) 10 Vạn Câu Hỏi Vì Sao - Tập 1 (Tái Bản)
INSERT INTO sach (tieu_de,tac_gia,id_nxb,nam_xb,ngon_ngu,the_loai,mo_ta,gia_bia,don_vi_tien)
VALUES (
  '10 Vạn Câu Hỏi Vì Sao - Tập 1 (Tái Bản)','Đặng Minh Dũng',
  (SELECT id FROM nha_xuat_ban WHERE ten='NXB Thanh Niên'),
  2023,'vi','Thiếu nhi; Khoa học',
  'Tập 1 của bộ sách trả lời những câu hỏi thú vị về thế giới xung quanh cho trẻ em.',
  44000,'VND'
);
SET @sid = LAST_INSERT_ID();
INSERT INTO anh_sach (id_sach,url_anh,la_anh_dai_dien) VALUES
(@sid,'http://product.hstatic.net/1000237375/product/vancauhoi_visao_t1_grande.jpg',1);
INSERT INTO ban_sao (id_sach,ma_ban_sao,id_vi_tri) VALUES
(@sid,'10VCHVS1-001',(SELECT id FROM vi_tri_ke WHERE ma_ke='B-02-03-12'));

-- 22) 100 Câu Chuyện Hay Dành Cho Bé Gái (Tái Bản)
INSERT INTO sach (tieu_de,tac_gia,id_nxb,nam_xb,ngon_ngu,the_loai,mo_ta,gia_bia,don_vi_tien)
VALUES (
  '100 Câu Chuyện Hay Dành Cho Bé Gái (Tái Bản)','Nhiều tác giả',
  (SELECT id FROM nha_xuat_ban WHERE ten='NXB Thanh Niên'),
  2023,'vi','Thiếu nhi; Truyện kể',
  'Tuyển tập 100 câu chuyện hay và ý nghĩa dành riêng cho các bé gái.',
  72000,'VND'
);
SET @sid = LAST_INSERT_ID();
INSERT INTO anh_sach (id_sach,url_anh,la_anh_dai_dien) VALUES
(@sid,'http://product.hstatic.net/1000237375/product/1_c3108369c9e14951aea57682eeb35ab5_grande.png',1);
INSERT INTO ban_sao (id_sach,ma_ban_sao,id_vi_tri) VALUES
(@sid,'100CHBG-001',(SELECT id FROM vi_tri_ke WHERE ma_ke='A-01-01-01'));

-- 23) 100 Câu Chuyện Hay Dành Cho Bé Trai (Tái Bản)
INSERT INTO sach (tieu_de,tac_gia,id_nxb,nam_xb,ngon_ngu,the_loai,mo_ta,gia_bia,don_vi_tien)
VALUES (
  '100 Câu Chuyện Hay Dành Cho Bé Trai (Tái Bản)','Nhiều tác giả',
  (SELECT id FROM nha_xuat_ban WHERE ten='NXB Thanh Niên'),
  2023,'vi','Thiếu nhi; Truyện kể',
  'Tuyển tập 100 câu chuyện hay và ý nghĩa dành riêng cho các bé trai.',
  72000,'VND'
);
SET @sid = LAST_INSERT_ID();
INSERT INTO anh_sach (id_sach,url_anh,la_anh_dai_dien) VALUES
(@sid,'http://product.hstatic.net/1000237375/product/1_80d7f728fe5d463392066af843035f93_grande.png',1);
INSERT INTO ban_sao (id_sach,ma_ban_sao,id_vi_tri) VALUES
(@sid,'100CHBT-001',(SELECT id FROM vi_tri_ke WHERE ma_ke='A-01-02-05'));

-- 24) 100 Truyện Cổ Tích Việt Nam (Tái Bản)
INSERT INTO sach (tieu_de,tac_gia,id_nxb,nam_xb,ngon_ngu,the_loai,mo_ta,gia_bia,don_vi_tien)
VALUES (
  '100 Truyện Cổ Tích Việt Nam (Tái Bản)','Nhiều tác giả',
  (SELECT id FROM nha_xuat_ban WHERE ten='NXB Thanh Niên'),
  2023,'vi','Thiếu nhi; Truyện cổ tích',
  'Tuyển tập 100 truyện cổ tích Việt Nam hay nhất, phù hợp cho trẻ em.',
  84000,'VND'
);
SET @sid = LAST_INSERT_ID();
INSERT INTO anh_sach (id_sach,url_anh,la_anh_dai_dien) VALUES
(@sid,'http://product.hstatic.net/1000237375/product/100-truyen-co-tich-viet-nam-440_grande.jpg',1);
INSERT INTO ban_sao (id_sach,ma_ban_sao,id_vi_tri) VALUES
(@sid,'100TCTVN-001',(SELECT id FROM vi_tri_ke WHERE ma_ke='B-02-03-12'));

-- 25) 100 Truyện Cổ Tích Thế Giới (TB)
INSERT INTO sach (tieu_de,tac_gia,id_nxb,nam_xb,ngon_ngu,the_loai,mo_ta,gia_bia,don_vi_tien)
VALUES (
  '100 Truyện Cổ Tích Thế Giới (TB)','Ngọc Ánh',
  (SELECT id FROM nha_xuat_ban WHERE ten='NXB Thanh Niên'),
  2023,'vi','Thiếu nhi; Truyện cổ tích',
  'Tuyển tập 100 truyện cổ tích hay nhất từ khắp nơi trên thế giới.',
  92000,'VND'
);
SET @sid = LAST_INSERT_ID();
INSERT INTO anh_sach (id_sach,url_anh,la_anh_dai_dien) VALUES
(@sid,'http://product.hstatic.net/1000237375/product/bia_100_truyen_co_tich_the_gioi_grande.jpg',1);
INSERT INTO ban_sao (id_sach,ma_ban_sao,id_vi_tri) VALUES
(@sid,'100TCTTG-001',(SELECT id FROM vi_tri_ke WHERE ma_ke='A-01-02-05'));

-- 26) 100 Truyện Hay Rèn Đức Tính Tốt (Tái Bản)
INSERT INTO sach (tieu_de,tac_gia,id_nxb,nam_xb,ngon_ngu,the_loai,mo_ta,gia_bia,don_vi_tien)
VALUES (
  '100 Truyện Hay Rèn Đức Tính Tốt (Tái Bản)','Nhiều tác giả',
  (SELECT id FROM nha_xuat_ban WHERE ten='NXB Thanh Niên'),
  2023,'vi','Thiếu nhi; Giáo dục',
  'Tuyển tập 100 truyện hay giúp rèn luyện đức tính tốt cho trẻ em.',
  72000,'VND'
);
SET @sid = LAST_INSERT_ID();
INSERT INTO anh_sach (id_sach,url_anh,la_anh_dai_dien) VALUES
(@sid,'http://product.hstatic.net/1000237375/product/100-truyen-duc-tinh-900x900_179fb8c820594acca4ddcc73c83a5d2d_master_3ba7484c036543e1b52b5c1a3e345cef_grande.png',1);
INSERT INTO ban_sao (id_sach,ma_ban_sao,id_vi_tri) VALUES
(@sid,'100THRDT-001',(SELECT id FROM vi_tri_ke WHERE ma_ke='B-02-03-12'));

-- 27) 101 Câu Chuyện Về Các Nàng Công Chúa (Tái Bản)
INSERT INTO sach (tieu_de,tac_gia,id_nxb,nam_xb,ngon_ngu,the_loai,mo_ta,gia_bia,don_vi_tien)
VALUES (
  '101 Câu Chuyện Về Các Nàng Công Chúa (Tái Bản)','Nhiều tác giả',
  (SELECT id FROM nha_xuat_ban WHERE ten='NXB Thanh Niên'),
  2023,'vi','Thiếu nhi; Truyện kể',
  'Tuyển tập 101 câu chuyện hay về các nàng công chúa dành cho trẻ em.',
  108000,'VND'
);
SET @sid = LAST_INSERT_ID();
INSERT INTO anh_sach (id_sach,url_anh,la_anh_dai_dien) VALUES
(@sid,'http://product.hstatic.net/1000237375/product/bt_fdd03a27053d412cbc204e24eaa8b830_grande.jpg',1);
INSERT INTO ban_sao (id_sach,ma_ban_sao,id_vi_tri) VALUES
(@sid,'101CCVCC-001',(SELECT id FROM vi_tri_ke WHERE ma_ke='A-01-01-01'));

-- 28) 1000 Từ Tiếng Anh Đầu Tiên
INSERT INTO sach (tieu_de,tac_gia,id_nxb,nam_xb,ngon_ngu,the_loai,mo_ta,gia_bia,don_vi_tien)
VALUES (
  '1000 Từ Tiếng Anh Đầu Tiên','Minh Long',
  (SELECT id FROM nha_xuat_ban WHERE ten='NXB Thanh Niên'),
  2023,'vi','Ngoại ngữ; Tiếng Anh',
  'Cuốn sách học 1000 từ tiếng Anh cơ bản đầu tiên cho người mới bắt đầu.',
  96000,'VND'
);
SET @sid = LAST_INSERT_ID();
INSERT INTO anh_sach (id_sach,url_anh,la_anh_dai_dien) VALUES
(@sid,'http://product.hstatic.net/1000237375/product/1_198be45d6ce94c5b84f5ce5c974f5edb_grande.png',1);
INSERT INTO ban_sao (id_sach,ma_ban_sao,id_vi_tri) VALUES
(@sid,'1000TTADT-001',(SELECT id FROM vi_tri_ke WHERE ma_ke='B-02-03-12'));

-- 29) 100 Truyện Ngụ Ngôn Song Ngữ Anh - Việt Hay Nhất
INSERT INTO sach (tieu_de,tac_gia,id_nxb,nam_xb,ngon_ngu,the_loai,mo_ta,gia_bia,don_vi_tien)
VALUES (
  '100 Truyện Ngụ Ngôn Song Ngữ Anh - Việt Hay Nhất','Nguyễn Châu Nguyên',
  (SELECT id FROM nha_xuat_ban WHERE ten='NXB Thanh Niên'),
  2023,'vi','Ngoại ngữ; Truyện kể',
  'Tuyển tập 100 truyện ngụ ngôn song ngữ Anh - Việt hay nhất cho trẻ em.',
  100000,'VND'
);
SET @sid = LAST_INSERT_ID();
INSERT INTO anh_sach (id_sach,url_anh,la_anh_dai_dien) VALUES
(@sid,'http://product.hstatic.net/1000237375/product/thi_t_k__ch_a_c__t_n_ef554182dc0a4040b417c56e0d953a5e_grande.png',1);
INSERT INTO ban_sao (id_sach,ma_ban_sao,id_vi_tri) VALUES
(@sid,'100TNNSN-001',(SELECT id FROM vi_tri_ke WHERE ma_ke='A-01-02-05'));

-- 30) 101 Từ Đầu Tiên Cho Bé - Bảng Chữ Cái (Tái bản)
INSERT INTO sach (tieu_de,tac_gia,id_nxb,nam_xb,ngon_ngu,the_loai,mo_ta,gia_bia,don_vi_tien)
VALUES (
  '101 Từ Đầu Tiên Cho Bé - Bảng Chữ Cái (Tái bản)','Nhiều tác giả',
  (SELECT id FROM nha_xuat_ban WHERE ten='NXB Thanh Niên'),
  2023,'vi','Thiếu nhi; Giáo dục',
  'Cuốn sách dạy 101 từ đầu tiên cho bé với bảng chữ cái tiếng Việt.',
  48000,'VND'
);
SET @sid = LAST_INSERT_ID();
INSERT INTO anh_sach (id_sach,url_anh,la_anh_dai_dien) VALUES
(@sid,'http://product.hstatic.net/1000237375/product/1_08814a638afe42eb943847a13faed51e_grande.png',1);
INSERT INTO ban_sao (id_sach,ma_ban_sao,id_vi_tri) VALUES
(@sid,'101TDTBBC-001',(SELECT id FROM vi_tri_ke WHERE ma_ke='B-02-03-12'));

-- 31) 101 Truyện Hay Theo Bước Bé Gái Trưởng Thành (Tái bản)
INSERT INTO sach (tieu_de,tac_gia,id_nxb,nam_xb,ngon_ngu,the_loai,mo_ta,gia_bia,don_vi_tien)
VALUES (
  '101 Truyện Hay Theo Bước Bé Gái Trưởng Thành (Tái bản)','Vương Diễm Nga',
  (SELECT id FROM nha_xuat_ban WHERE ten='NXB Thanh Niên'),
  2023,'vi','Thiếu nhi; Giáo dục',
  'Tuyển tập 101 truyện hay giúp bé gái trưởng thành và phát triển nhân cách.',
  72000,'VND'
);
SET @sid = LAST_INSERT_ID();
INSERT INTO anh_sach (id_sach,url_anh,la_anh_dai_dien) VALUES
(@sid,'http://product.hstatic.net/1000237375/product/1_b74864f5f33d48718acc8d2b99003e8a_grande.png',1);
INSERT INTO ban_sao (id_sach,ma_ban_sao,id_vi_tri) VALUES
(@sid,'101THTBGTT-031',(SELECT id FROM vi_tri_ke WHERE ma_ke='A-01-01-01'));

-- ====== Hết PHẦN 2/4 ======
-- =========================================================
-- PHẦN 3/4: Seed sách #32 → #43
-- =========================================================

-- 32) 101 Từ Đầu Tiên Cho Bé - Đồ Dùng Thân Thiết (Tái Bản)
INSERT INTO sach (tieu_de,tac_gia,id_nxb,nam_xb,ngon_ngu,the_loai,mo_ta,gia_bia,don_vi_tien)
VALUES (
  '101 Từ Đầu Tiên Cho Bé - Đồ Dùng Thân Thiết (Tái Bản)','Nhiều tác giả',
  (SELECT id FROM nha_xuat_ban WHERE ten='NXB Thanh Niên'),
  2023,'vi','Thiếu nhi; Giáo dục',
  'Cuốn sách dạy 101 từ đầu tiên cho bé về các đồ dùng thân thiết hàng ngày.',
  48000,'VND'
);
SET @sid = LAST_INSERT_ID();
INSERT INTO anh_sach (id_sach,url_anh,la_anh_dai_dien) VALUES
(@sid,'http://product.hstatic.net/1000237375/product/thiet_ke_khong_ten__1__971e1dc3d3314b3fb498de345f78726a_grande.png',1);
INSERT INTO ban_sao (id_sach,ma_ban_sao,id_vi_tri) VALUES
(@sid,'101TDTBDDT-001',(SELECT id FROM vi_tri_ke WHERE ma_ke='A-01-02-05'));

-- 33) 101 Truyện Phá Án Kinh Điển (Tái bản)
INSERT INTO sach (tieu_de,tac_gia,id_nxb,nam_xb,ngon_ngu,the_loai,mo_ta,gia_bia,don_vi_tien)
VALUES (
  '101 Truyện Phá Án Kinh Điển (Tái bản)','Vương Diễm Nga',
  (SELECT id FROM nha_xuat_ban WHERE ten='NXB Thanh Niên'),
  2023,'vi','Thiếu nhi; Trinh thám',
  'Tuyển tập 101 truyện phá án kinh điển dành cho trẻ em yêu thích trinh thám.',
  72000,'VND'
);
SET @sid = LAST_INSERT_ID();
INSERT INTO anh_sach (id_sach,url_anh,la_anh_dai_dien) VALUES
(@sid,'http://product.hstatic.net/1000237375/product/thiet_ke_chua_co_ten__4__7ebbbb59d5a0484989646403a3eea877_grande.png',1);
INSERT INTO ban_sao (id_sach,ma_ban_sao,id_vi_tri) VALUES
(@sid,'101TPAKD-001',(SELECT id FROM vi_tri_ke WHERE ma_ke='B-02-03-12'));

-- 34) 101 Truyện Hay Theo Bước Bé Trai Trưởng Thành (Tái bản)
INSERT INTO sach (tieu_de,tac_gia,id_nxb,nam_xb,ngon_ngu,the_loai,mo_ta,gia_bia,don_vi_tien)
VALUES (
  '101 Truyện Hay Theo Bước Bé Trai Trưởng Thành (Tái bản)','Vương Diễm Nga',
  (SELECT id FROM nha_xuat_ban WHERE ten='NXB Thanh Niên'),
  2023,'vi','Thiếu nhi; Giáo dục',
  'Tuyển tập 101 truyện hay giúp bé trai trưởng thành và phát triển nhân cách.',
  72000,'VND'
);
SET @sid = LAST_INSERT_ID();
INSERT INTO anh_sach (id_sach,url_anh,la_anh_dai_dien) VALUES
(@sid,'http://product.hstatic.net/1000237375/product/1_b74864f5f33d48718acc8d2b99003e8a_grande.png',1);
INSERT INTO ban_sao (id_sach,ma_ban_sao,id_vi_tri) VALUES
(@sid,'101THTBTBT-034',(SELECT id FROM vi_tri_ke WHERE ma_ke='A-01-01-01'));

-- 35) 101 Truyện Hay Theo Bước Bé Gái Trưởng Thành (Tái bản)
INSERT INTO sach (tieu_de,tac_gia,id_nxb,nam_xb,ngon_ngu,the_loai,mo_ta,gia_bia,don_vi_tien)
VALUES (
  '101 Truyện Hay Theo Bước Bé Gái Trưởng Thành (Tái bản)','Vương Diễm Nga',
  (SELECT id FROM nha_xuat_ban WHERE ten='NXB Thanh Niên'),
  2023,'vi','Thiếu nhi; Giáo dục',
  'Tuyển tập 101 truyện hay giúp bé gái trưởng thành và phát triển nhân cách.',
  72000,'VND'
);
SET @sid = LAST_INSERT_ID();
INSERT INTO anh_sach (id_sach,url_anh,la_anh_dai_dien) VALUES
(@sid,'http://product.hstatic.net/1000237375/product/1_b74864f5f33d48718acc8d2b99003e8a_grande.png',1);
INSERT INTO ban_sao (id_sach,ma_ban_sao,id_vi_tri) VALUES
(@sid,'101THTBGTT-035',(SELECT id FROM vi_tri_ke WHERE ma_ke='A-01-02-05'));

-- 36) 101 Truyện Hay Theo Bước Bé Trai Trưởng Thành (Tái bản)
INSERT INTO sach (tieu_de,tac_gia,id_nxb,nam_xb,ngon_ngu,the_loai,mo_ta,gia_bia,don_vi_tien)
VALUES (
  '101 Truyện Hay Theo Bước Bé Trai Trưởng Thành (Tái bản)','Vương Diễm Nga',
  (SELECT id FROM nha_xuat_ban WHERE ten='NXB Thanh Niên'),
  2023,'vi','Thiếu nhi; Giáo dục',
  'Tuyển tập 101 truyện hay giúp bé trai trưởng thành và phát triển nhân cách.',
  72000,'VND'
);
SET @sid = LAST_INSERT_ID();
INSERT INTO anh_sach (id_sach,url_anh,la_anh_dai_dien) VALUES
(@sid,'http://product.hstatic.net/1000237375/product/1_b74864f5f33d48718acc8d2b99003e8a_grande.png',1);
INSERT INTO ban_sao (id_sach,ma_ban_sao,id_vi_tri) VALUES
(@sid,'101THTBTBT-036',(SELECT id FROM vi_tri_ke WHERE ma_ke='B-02-03-12'));

-- 37) 101 Truyện Hay Theo Bước Bé Gái Trưởng Thành (Tái bản)
INSERT INTO sach (tieu_de,tac_gia,id_nxb,nam_xb,ngon_ngu,the_loai,mo_ta,gia_bia,don_vi_tien)
VALUES (
  '101 Truyện Hay Theo Bước Bé Gái Trưởng Thành (Tái bản)','Vương Diễm Nga',
  (SELECT id FROM nha_xuat_ban WHERE ten='NXB Thanh Niên'),
  2023,'vi','Thiếu nhi; Giáo dục',
  'Tuyển tập 101 truyện hay giúp bé gái trưởng thành và phát triển nhân cách.',
  72000,'VND'
);
SET @sid = LAST_INSERT_ID();
INSERT INTO anh_sach (id_sach,url_anh,la_anh_dai_dien) VALUES
(@sid,'http://product.hstatic.net/1000237375/product/1_b74864f5f33d48718acc8d2b99003e8a_grande.png',1);
INSERT INTO ban_sao (id_sach,ma_ban_sao,id_vi_tri) VALUES
(@sid,'101THTBGTT-037',(SELECT id FROM vi_tri_ke WHERE ma_ke='A-01-01-01'));

-- 38) 101 Truyện Hay Theo Bước Bé Trai Trưởng Thành (Tái bản)
INSERT INTO sach (tieu_de,tac_gia,id_nxb,nam_xb,ngon_ngu,the_loai,mo_ta,gia_bia,don_vi_tien)
VALUES (
  '101 Truyện Hay Theo Bước Bé Trai Trưởng Thành (Tái bản)','Vương Diễm Nga',
  (SELECT id FROM nha_xuat_ban WHERE ten='NXB Thanh Niên'),
  2023,'vi','Thiếu nhi; Giáo dục',
  'Tuyển tập 101 truyện hay giúp bé trai trưởng thành và phát triển nhân cách.',
  72000,'VND'
);
SET @sid = LAST_INSERT_ID();
INSERT INTO anh_sach (id_sach,url_anh,la_anh_dai_dien) VALUES
(@sid,'http://product.hstatic.net/1000237375/product/1_b74864f5f33d48718acc8d2b99003e8a_grande.png',1);
INSERT INTO ban_sao (id_sach,ma_ban_sao,id_vi_tri) VALUES
(@sid,'101THTBTBT-038',(SELECT id FROM vi_tri_ke WHERE ma_ke='A-01-02-05'));

-- 39) 101 Truyện Hay Theo Bước Bé Gái Trưởng Thành (Tái bản)
INSERT INTO sach (tieu_de,tac_gia,id_nxb,nam_xb,ngon_ngu,the_loai,mo_ta,gia_bia,don_vi_tien)
VALUES (
  '101 Truyện Hay Theo Bước Bé Gái Trưởng Thành (Tái bản)','Vương Diễm Nga',
  (SELECT id FROM nha_xuat_ban WHERE ten='NXB Thanh Niên'),
  2023,'vi','Thiếu nhi; Giáo dục',
  'Tuyển tập 101 truyện hay giúp bé gái trưởng thành và phát triển nhân cách.',
  72000,'VND'
);
SET @sid = LAST_INSERT_ID();
INSERT INTO anh_sach (id_sach,url_anh,la_anh_dai_dien) VALUES
(@sid,'http://product.hstatic.net/1000237375/product/1_b74864f5f33d48718acc8d2b99003e8a_grande.png',1);
INSERT INTO ban_sao (id_sach,ma_ban_sao,id_vi_tri) VALUES
(@sid,'101THTBGTT-039',(SELECT id FROM vi_tri_ke WHERE ma_ke='B-02-03-12'));

-- 40) 101 Truyện Hay Theo Bước Bé Trai Trưởng Thành (Tái bản)
INSERT INTO sach (tieu_de,tac_gia,id_nxb,nam_xb,ngon_ngu,the_loai,mo_ta,gia_bia,don_vi_tien)
VALUES (
  '101 Truyện Hay Theo Bước Bé Trai Trưởng Thành (Tái bản)','Vương Diễm Nga',
  (SELECT id FROM nha_xuat_ban WHERE ten='NXB Thanh Niên'),
  2023,'vi','Thiếu nhi; Giáo dục',
  'Tuyển tập 101 truyện hay giúp bé trai trưởng thành và phát triển nhân cách.',
  72000,'VND'
);
SET @sid = LAST_INSERT_ID();
INSERT INTO anh_sach (id_sach,url_anh,la_anh_dai_dien) VALUES
(@sid,'http://product.hstatic.net/1000237375/product/1_b74864f5f33d48718acc8d2b99003e8a_grande.png',1);
INSERT INTO ban_sao (id_sach,ma_ban_sao,id_vi_tri) VALUES
(@sid,'101THTBTBT-040',(SELECT id FROM vi_tri_ke WHERE ma_ke='A-01-01-01'));

-- 41) 101 Truyện Hay Theo Bước Bé Gái Trưởng Thành (Tái bản)
INSERT INTO sach (tieu_de,tac_gia,id_nxb,nam_xb,ngon_ngu,the_loai,mo_ta,gia_bia,don_vi_tien)
VALUES (
  '101 Truyện Hay Theo Bước Bé Gái Trưởng Thành (Tái bản)','Vương Diễm Nga',
  (SELECT id FROM nha_xuat_ban WHERE ten='NXB Thanh Niên'),
  2023,'vi','Thiếu nhi; Giáo dục',
  'Tuyển tập 101 truyện hay giúp bé gái trưởng thành và phát triển nhân cách.',
  72000,'VND'
);
SET @sid = LAST_INSERT_ID();
INSERT INTO anh_sach (id_sach,url_anh,la_anh_dai_dien) VALUES
(@sid,'http://product.hstatic.net/1000237375/product/1_b74864f5f33d48718acc8d2b99003e8a_grande.png',1);
INSERT INTO ban_sao (id_sach,ma_ban_sao,id_vi_tri) VALUES
(@sid,'101THTBGTT-041',(SELECT id FROM vi_tri_ke WHERE ma_ke='B-02-03-12'));

-- 42) 101 Truyện Hay Theo Bước Bé Trai Trưởng Thành (Tái bản)
INSERT INTO sach (tieu_de,tac_gia,id_nxb,nam_xb,ngon_ngu,the_loai,mo_ta,gia_bia,don_vi_tien)
VALUES (
  '101 Truyện Hay Theo Bước Bé Trai Trưởng Thành (Tái bản)','Vương Diễm Nga',
  (SELECT id FROM nha_xuat_ban WHERE ten='NXB Thanh Niên'),
  2023,'vi','Thiếu nhi; Giáo dục',
  'Tuyển tập 101 truyện hay giúp bé trai trưởng thành và phát triển nhân cách.',
  72000,'VND'
);
SET @sid = LAST_INSERT_ID();
INSERT INTO anh_sach (id_sach,url_anh,la_anh_dai_dien) VALUES
(@sid,'http://product.hstatic.net/1000237375/product/1_b74864f5f33d48718acc8d2b99003e8a_grande.png',1);
INSERT INTO ban_sao (id_sach,ma_ban_sao,id_vi_tri) VALUES
(@sid,'101THTBTBT-042',(SELECT id FROM vi_tri_ke WHERE ma_ke='A-01-02-05'));

-- 43) 101 Truyện Hay Theo Bước Bé Gái Trưởng Thành (Tái bản)
INSERT INTO sach (tieu_de,tac_gia,id_nxb,nam_xb,ngon_ngu,the_loai,mo_ta,gia_bia,don_vi_tien)
VALUES (
  '101 Truyện Hay Theo Bước Bé Gái Trưởng Thành (Tái bản)','Vương Diễm Nga',
  (SELECT id FROM nha_xuat_ban WHERE ten='NXB Thanh Niên'),
  2023,'vi','Thiếu nhi; Giáo dục',
  'Tuyển tập 101 truyện hay giúp bé gái trưởng thành và phát triển nhân cách.',
  72000,'VND'
);
SET @sid = LAST_INSERT_ID();
INSERT INTO anh_sach (id_sach,url_anh,la_anh_dai_dien) VALUES
(@sid,'http://product.hstatic.net/1000237375/product/1_b74864f5f33d48718acc8d2b99003e8a_grande.png',1);
INSERT INTO ban_sao (id_sach,ma_ban_sao,id_vi_tri) VALUES
(@sid,'101THTBGTT-043',(SELECT id FROM vi_tri_ke WHERE ma_ke='B-02-03-12'));

-- ====== Hết PHẦN 3/4 ======
-- =========================================================
-- PHẦN 4/4: Seed sách #44 → #50
-- =========================================================

-- 44) 101 Truyện Hay Theo Bước Bé Trai Trưởng Thành (Tái bản)
INSERT INTO sach (tieu_de,tac_gia,id_nxb,nam_xb,ngon_ngu,the_loai,mo_ta,gia_bia,don_vi_tien)
VALUES (
  '101 Truyện Hay Theo Bước Bé Trai Trưởng Thành (Tái bản)','Vương Diễm Nga',
  (SELECT id FROM nha_xuat_ban WHERE ten='NXB Thanh Niên'),
  2023,'vi','Thiếu nhi; Giáo dục',
  'Tuyển tập 101 truyện hay giúp bé trai trưởng thành và phát triển nhân cách.',
  72000,'VND'
);
SET @sid = LAST_INSERT_ID();
INSERT INTO anh_sach (id_sach,url_anh,la_anh_dai_dien) VALUES
(@sid,'http://product.hstatic.net/1000237375/product/1_b74864f5f33d48718acc8d2b99003e8a_grande.png',1);
INSERT INTO ban_sao (id_sach,ma_ban_sao,id_vi_tri) VALUES
(@sid,'101THTBTBT-044',(SELECT id FROM vi_tri_ke WHERE ma_ke='A-01-02-05'));

-- 45) 101 Truyện Hay Theo Bước Bé Gái Trưởng Thành (Tái bản)
INSERT INTO sach (tieu_de,tac_gia,id_nxb,nam_xb,ngon_ngu,the_loai,mo_ta,gia_bia,don_vi_tien)
VALUES (
  '101 Truyện Hay Theo Bước Bé Gái Trưởng Thành (Tái bản)','Vương Diễm Nga',
  (SELECT id FROM nha_xuat_ban WHERE ten='NXB Thanh Niên'),
  2023,'vi','Thiếu nhi; Giáo dục',
  'Tuyển tập 101 truyện hay giúp bé gái trưởng thành và phát triển nhân cách.',
  72000,'VND'
);
SET @sid = LAST_INSERT_ID();
INSERT INTO anh_sach (id_sach,url_anh,la_anh_dai_dien) VALUES
(@sid,'http://product.hstatic.net/1000237375/product/1_b74864f5f33d48718acc8d2b99003e8a_grande.png',1);
INSERT INTO ban_sao (id_sach,ma_ban_sao,id_vi_tri) VALUES
(@sid,'101THTBGTT-045',(SELECT id FROM vi_tri_ke WHERE ma_ke='B-02-03-12'));

-- 46) 101 Truyện Hay Theo Bước Bé Trai Trưởng Thành (Tái bản)
INSERT INTO sach (tieu_de,tac_gia,id_nxb,nam_xb,ngon_ngu,the_loai,mo_ta,gia_bia,don_vi_tien)
VALUES (
  '101 Truyện Hay Theo Bước Bé Trai Trưởng Thành (Tái bản)','Vương Diễm Nga',
  (SELECT id FROM nha_xuat_ban WHERE ten='NXB Thanh Niên'),
  2023,'vi','Thiếu nhi; Giáo dục',
  'Tuyển tập 101 truyện hay giúp bé trai trưởng thành và phát triển nhân cách.',
  72000,'VND'
);
SET @sid = LAST_INSERT_ID();
INSERT INTO anh_sach (id_sach,url_anh,la_anh_dai_dien) VALUES
(@sid,'http://product.hstatic.net/1000237375/product/1_b74864f5f33d48718acc8d2b99003e8a_grande.png',1);
INSERT INTO ban_sao (id_sach,ma_ban_sao,id_vi_tri) VALUES
(@sid,'101THTBTBT-046',(SELECT id FROM vi_tri_ke WHERE ma_ke='A-01-01-01'));

-- 47) 101 Truyện Hay Theo Bước Bé Gái Trưởng Thành (Tái bản)
INSERT INTO sach (tieu_de,tac_gia,id_nxb,nam_xb,ngon_ngu,the_loai,mo_ta,gia_bia,don_vi_tien)
VALUES (
  '101 Truyện Hay Theo Bước Bé Gái Trưởng Thành (Tái bản)','Vương Diễm Nga',
  (SELECT id FROM nha_xuat_ban WHERE ten='NXB Thanh Niên'),
  2023,'vi','Thiếu nhi; Giáo dục',
  'Tuyển tập 101 truyện hay giúp bé gái trưởng thành và phát triển nhân cách.',
  72000,'VND'
);
SET @sid = LAST_INSERT_ID();
INSERT INTO anh_sach (id_sach,url_anh,la_anh_dai_dien) VALUES
(@sid,'http://product.hstatic.net/1000237375/product/1_b74864f5f33d48718acc8d2b99003e8a_grande.png',1);
INSERT INTO ban_sao (id_sach,ma_ban_sao,id_vi_tri) VALUES
(@sid,'101THTBGTT-047',(SELECT id FROM vi_tri_ke WHERE ma_ke='B-02-03-12'));

-- 48) 101 Truyện Hay Theo Bước Bé Trai Trưởng Thành (Tái bản)
INSERT INTO sach (tieu_de,tac_gia,id_nxb,nam_xb,ngon_ngu,the_loai,mo_ta,gia_bia,don_vi_tien)
VALUES (
  '101 Truyện Hay Theo Bước Bé Trai Trưởng Thành (Tái bản)','Vương Diễm Nga',
  (SELECT id FROM nha_xuat_ban WHERE ten='NXB Thanh Niên'),
  2023,'vi','Thiếu nhi; Giáo dục',
  'Tuyển tập 101 truyện hay giúp bé trai trưởng thành và phát triển nhân cách.',
  72000,'VND'
);
SET @sid = LAST_INSERT_ID();
INSERT INTO anh_sach (id_sach,url_anh,la_anh_dai_dien) VALUES
(@sid,'http://product.hstatic.net/1000237375/product/1_b74864f5f33d48718acc8d2b99003e8a_grande.png',1);
INSERT INTO ban_sao (id_sach,ma_ban_sao,id_vi_tri) VALUES
(@sid,'101THTBTBT-048',(SELECT id FROM vi_tri_ke WHERE ma_ke='A-01-02-05'));

-- 49) 101 Truyện Hay Theo Bước Bé Gái Trưởng Thành (Tái bản)
INSERT INTO sach (tieu_de,tac_gia,id_nxb,nam_xb,ngon_ngu,the_loai,mo_ta,gia_bia,don_vi_tien)
VALUES (
  '101 Truyện Hay Theo Bước Bé Gái Trưởng Thành (Tái bản)','Vương Diễm Nga',
  (SELECT id FROM nha_xuat_ban WHERE ten='NXB Thanh Niên'),
  2023,'vi','Thiếu nhi; Giáo dục',
  'Tuyển tập 101 truyện hay giúp bé gái trưởng thành và phát triển nhân cách.',
  72000,'VND'
);
SET @sid = LAST_INSERT_ID();
INSERT INTO anh_sach (id_sach,url_anh,la_anh_dai_dien) VALUES
(@sid,'http://product.hstatic.net/1000237375/product/1_b74864f5f33d48718acc8d2b99003e8a_grande.png',1);
INSERT INTO ban_sao (id_sach,ma_ban_sao,id_vi_tri) VALUES
(@sid,'101THTBGTT-049',(SELECT id FROM vi_tri_ke WHERE ma_ke='B-02-03-12'));

-- 50) 101 Truyện Hay Theo Bước Bé Gái Trưởng Thành (Tái bản)
INSERT INTO sach (tieu_de,tac_gia,id_nxb,nam_xb,ngon_ngu,the_loai,mo_ta,gia_bia,don_vi_tien)
VALUES (
  '101 Truyện Hay Theo Bước Bé Gái Trưởng Thành (Tái bản)','Vương Diễm Nga',
  (SELECT id FROM nha_xuat_ban WHERE ten='NXB Thanh Niên'),
  2023,'vi','Thiếu nhi; Giáo dục',
  'Tuyển tập 101 truyện hay giúp bé gái trưởng thành và phát triển nhân cách.',
  72000,'VND'
);
SET @sid = LAST_INSERT_ID();
INSERT INTO anh_sach (id_sach,url_anh,la_anh_dai_dien) VALUES
(@sid,'http://product.hstatic.net/1000237375/product/1_b74864f5f33d48718acc8d2b99003e8a_grande.png',1);
INSERT INTO ban_sao (id_sach,ma_ban_sao,id_vi_tri) VALUES
(@sid,'101THTBGTT-050',(SELECT id FROM vi_tri_ke WHERE ma_ke='A-01-01-01'));

-- ====== Hết PHẦN 4/4 ======
-- =========================================================
-- PHẦN 5/5: Dữ liệu mẫu cho các bảng còn lại
-- =========================================================

-- ============ THÊM NGƯỜI DÙNG MẪU ============
INSERT INTO nguoi_dung (email, mat_khau_hash, ho_ten, vai_tro, loai_nguoi_dung, so_dien_thoai, dia_chi) VALUES
('student1@lib.test', '$2b$12$Fv7aYX21SbK7Ttof0XDSIOwZwwYjRHAUj1WvyTpEpq4uT5LTu9G/6', 'Nguyễn Văn An', 'user', 'student', '0123456789', '123 Đường ABC, Quận 1, TP.HCM'),
('student2@lib.test', '$2b$12$Fv7aYX21SbK7Ttof0XDSIOwZwwYjRHAUj1WvyTpEpq4uT5LTu9G/6', 'Trần Thị Bình', 'user', 'student', '0987654321', '456 Đường XYZ, Quận 2, TP.HCM'),
('student3@lib.test', '$2b$12$Fv7aYX21SbK7Ttof0XDSIOwZwwYjRHAUj1WvyTpEpq4uT5LTu9G/6', 'Lê Văn Cường', 'user', 'student', '0369852147', '789 Đường DEF, Quận 3, TP.HCM'),
('staff1@lib.test', '$2b$12$Fv7aYX21SbK7Ttof0XDSIOwZwwYjRHAUj1WvyTpEpq4uT5LTu9G/6', 'Phạm Thị Dung', 'user', 'staff', '0147258369', '321 Đường GHI, Quận 4, TP.HCM'),
('staff2@lib.test', '$2b$12$Fv7aYX21SbK7Ttof0XDSIOwZwwYjRHAUj1WvyTpEpq4uT5LTu9G/6', 'Hoàng Văn Em', 'user', 'staff', '0258147369', '654 Đường JKL, Quận 5, TP.HCM'),
('guest1@lib.test', '$2b$12$Fv7aYX21SbK7Ttof0XDSIOwZwwYjRHAUj1WvyTpEpq4uT5LTu9G/6', 'Võ Thị Phương', 'user', 'guest', '0741852963', '987 Đường MNO, Quận 6, TP.HCM')
ON DUPLICATE KEY UPDATE email=VALUES(email);

-- ============ THÊM VỊ TRÍ KỆ MẪU ============
INSERT INTO vi_tri_ke (ma_ke, tang, phong, ke, hang, cot, ghi_chu) VALUES
('A-01-03-02','1','Phòng Đọc','A','03','02','Kệ văn học Việt Nam'),
('A-01-04-03','1','Phòng Đọc','A','04','03','Kệ sách kỹ năng'),
('B-02-01-01','2','Phòng Tự Học','B','01','01','Kệ sách khoa học tự nhiên'),
('B-02-02-02','2','Phòng Tự Học','B','02','02','Kệ sách lịch sử'),
('C-03-01-01','3','Phòng Tham Khảo','C','01','01','Kệ sách tham khảo'),
('C-03-02-02','3','Phòng Tham Khảo','C','02','02','Kệ từ điển')
ON DUPLICATE KEY UPDATE ma_ke=VALUES(ma_ke);

-- ============ THÊM BẢN SAO SÁCH MẪU ============
-- Tạm thời vô hiệu hóa trigger để tránh lỗi recursive
DROP TRIGGER IF EXISTS trg_ban_sao_ai;
DROP TRIGGER IF EXISTS trg_ban_sao_au;
DROP TRIGGER IF EXISTS trg_ban_sao_ad;

-- Thêm bản sao thứ 2 cho một số cuốn sách
INSERT INTO ban_sao (id_sach, ma_ban_sao, id_vi_tri, trang_thai) VALUES
((SELECT id FROM sach WHERE tieu_de LIKE '%1 Ngày Bằng 48 Giờ%' LIMIT 1), '1-NGAY-B-002', (SELECT id FROM vi_tri_ke WHERE ma_ke='A-01-03-02'), 'available'),
((SELECT id FROM sach WHERE tieu_de LIKE '%10 Vạn Câu Hỏi Vì Sao - Tập 1%' LIMIT 1), '10-VAN-C1-002', (SELECT id FROM vi_tri_ke WHERE ma_ke='B-02-01-01'), 'available'),
((SELECT id FROM sach WHERE tieu_de LIKE '%100 Câu Chuyện Hay Dành Cho Bé Gái%' LIMIT 1), '100-BEG-002', (SELECT id FROM vi_tri_ke WHERE ma_ke='A-01-04-03'), 'available'),
((SELECT id FROM sach WHERE tieu_de LIKE '%100 Truyện Cổ Tích Việt Nam%' LIMIT 1), '100-CTVN-002', (SELECT id FROM vi_tri_ke WHERE ma_ke='B-02-02-02'), 'available'),
((SELECT id FROM sach WHERE tieu_de LIKE '%101 Truyện Cổ Tích Chọn Lọc%' LIMIT 1), '101-CTCL-002', (SELECT id FROM vi_tri_ke WHERE ma_ke='C-03-01-01'), 'available');

-- Cập nhật thủ công số lượng sách cho các sách vừa thêm bản sao
UPDATE sach s SET 
  s.so_luong_tong = (SELECT COUNT(*) FROM ban_sao b WHERE b.id_sach = s.id),
  s.so_luong_con = (SELECT COUNT(*) FROM ban_sao b WHERE b.id_sach = s.id AND b.trang_thai='available')
WHERE s.id IN (
  (SELECT id FROM sach WHERE tieu_de LIKE '%1 Ngày Bằng 48 Giờ%' LIMIT 1),
  (SELECT id FROM sach WHERE tieu_de LIKE '%10 Vạn Câu Hỏi Vì Sao - Tập 1%' LIMIT 1),
  (SELECT id FROM sach WHERE tieu_de LIKE '%100 Câu Chuyện Hay Dành Cho Bé Gái%' LIMIT 1),
  (SELECT id FROM sach WHERE tieu_de LIKE '%100 Truyện Cổ Tích Việt Nam%' LIMIT 1),
  (SELECT id FROM sach WHERE tieu_de LIKE '%101 Truyện Cổ Tích Chọn Lọc%' LIMIT 1)
);

-- Tạo lại trigger
DELIMITER $$

CREATE TRIGGER trg_ban_sao_ai AFTER INSERT ON ban_sao
FOR EACH ROW
BEGIN
  UPDATE sach s
  SET s.so_luong_tong = (SELECT COUNT(*) FROM ban_sao b WHERE b.id_sach = NEW.id_sach),
      s.so_luong_con  = (SELECT COUNT(*) FROM ban_sao b WHERE b.id_sach = NEW.id_sach AND b.trang_thai='available')
  WHERE s.id = NEW.id_sach;
END$$

CREATE TRIGGER trg_ban_sao_au AFTER UPDATE ON ban_sao
FOR EACH ROW
BEGIN
  UPDATE sach s
  SET s.so_luong_tong = (SELECT COUNT(*) FROM ban_sao b WHERE b.id_sach = OLD.id_sach),
      s.so_luong_con  = (SELECT COUNT(*) FROM ban_sao b WHERE b.id_sach = OLD.id_sach AND b.trang_thai='available')
  WHERE s.id = OLD.id_sach;

  UPDATE sach s
  SET s.so_luong_tong = (SELECT COUNT(*) FROM ban_sao b WHERE b.id_sach = NEW.id_sach),
      s.so_luong_con  = (SELECT COUNT(*) FROM ban_sao b WHERE b.id_sach = NEW.id_sach AND b.trang_thai='available')
  WHERE s.id = NEW.id_sach;
END$$

CREATE TRIGGER trg_ban_sao_ad AFTER DELETE ON ban_sao
FOR EACH ROW
BEGIN
  UPDATE sach s
  SET s.so_luong_tong = (SELECT COUNT(*) FROM ban_sao b WHERE b.id_sach = OLD.id_sach),
      s.so_luong_con  = (SELECT COUNT(*) FROM ban_sao b WHERE b.id_sach = OLD.id_sach AND b.trang_thai='available')
  WHERE s.id = OLD.id_sach;
END$$

DELIMITER ;

-- Cập nhật số lượng sách cho tất cả các sách hiện có
UPDATE sach s SET 
  s.so_luong_tong = (SELECT COUNT(*) FROM ban_sao b WHERE b.id_sach = s.id),
  s.so_luong_con = (SELECT COUNT(*) FROM ban_sao b WHERE b.id_sach = s.id AND b.trang_thai='available');

-- ============ THÊM PHIẾU MƯỢN MẪU ============
-- Một số phiếu mượn với các trạng thái khác nhau
INSERT INTO phieu_muon (id_ban_sao, id_nguoi_dung, trang_thai, nguoi_duyet, duyet_luc, muon_luc, han_tra) VALUES
((SELECT id FROM ban_sao WHERE ma_ban_sao='1-NGAY-B-001'), (SELECT id FROM nguoi_dung WHERE email='student1@lib.test'), 'borrowed', 1, '2024-01-15 09:00:00', '2024-01-15 09:30:00', '2024-01-29 09:30:00'),
((SELECT id FROM ban_sao WHERE ma_ban_sao='10-VAN-C1-001'), (SELECT id FROM nguoi_dung WHERE email='student2@lib.test'), 'borrowed', 1, '2024-01-16 10:00:00', '2024-01-16 10:15:00', '2024-01-30 10:15:00'),
((SELECT id FROM ban_sao WHERE ma_ban_sao='100-BEG-001'), (SELECT id FROM nguoi_dung WHERE email='staff1@lib.test'), 'borrowed', 1, '2024-01-17 14:00:00', '2024-01-17 14:20:00', '2024-02-16 14:20:00'),
((SELECT id FROM ban_sao WHERE ma_ban_sao='100-CTVN-001'), (SELECT id FROM nguoi_dung WHERE email='student3@lib.test'), 'requested', NULL, NULL, NULL, NULL),
((SELECT id FROM ban_sao WHERE ma_ban_sao='101-CTCL-001'), (SELECT id FROM nguoi_dung WHERE email='guest1@lib.test'), 'returned', 1, '2024-01-10 08:00:00', '2024-01-10 08:30:00', '2024-01-17 08:30:00');

-- Cập nhật phiếu mượn đã trả
UPDATE phieu_muon SET 
  nguoi_duyet_tra = 1,
  tra_luc = '2024-01-16 15:00:00'
WHERE id_ban_sao = (SELECT id FROM ban_sao WHERE ma_ban_sao='101-CTCL-001') 
  AND id_nguoi_dung = (SELECT id FROM nguoi_dung WHERE email='guest1@lib.test');

-- ============ THÊM THÔNG BÁO MẪU ============
INSERT INTO thong_bao (id_nguoi_dung, loai, tieu_de, noi_dung, da_doc) VALUES
((SELECT id FROM nguoi_dung WHERE email='student1@lib.test'), 'loan_reminder', 'Nhắc nhở trả sách', 'Sách "1 Ngày Bằng 48 Giờ" của bạn sẽ hết hạn vào ngày 29/01/2024. Vui lòng trả sách đúng hạn.', 0),
((SELECT id FROM nguoi_dung WHERE email='student2@lib.test'), 'loan_approved', 'Phê duyệt mượn sách', 'Yêu cầu mượn sách "10 Vạn Câu Hỏi Vì Sao - Tập 1" đã được phê duyệt. Bạn có thể đến thư viện để nhận sách.', 1),
((SELECT id FROM nguoi_dung WHERE email='student3@lib.test'), 'loan_request', 'Yêu cầu mượn sách', 'Yêu cầu mượn sách "100 Truyện Cổ Tích Việt Nam" đang chờ phê duyệt.', 0),
((SELECT id FROM nguoi_dung WHERE email='staff1@lib.test'), 'system', 'Thông báo hệ thống', 'Thư viện sẽ đóng cửa sớm vào ngày 30/01/2024 để bảo trì hệ thống.', 1),
((SELECT id FROM nguoi_dung WHERE email='guest1@lib.test'), 'loan_returned', 'Xác nhận trả sách', 'Cảm ơn bạn đã trả sách "101 Truyện Cổ Tích Chọn Lọc" đúng hạn.', 1);


-- ============ THÊM THÔNG BÁO CHO CÁC HOẠT ĐỘNG MỚI ============
INSERT INTO thong_bao (id_nguoi_dung, loai, tieu_de, noi_dung, da_doc) VALUES
((SELECT id FROM nguoi_dung WHERE email='staff2@lib.test'), 'loan_approved', 'Phê duyệt mượn sách', 'Yêu cầu mượn sách "Kỹ Năng Giao Tiếp Hiệu Quả" đã được phê duyệt.', 1),
((SELECT id FROM nguoi_dung WHERE email='student1@lib.test'), 'loan_request', 'Yêu cầu mượn sách', 'Yêu cầu mượn sách "Lịch Sử Việt Nam Từ Cổ Đại Đến Hiện Đại" đang chờ phê duyệt.', 0);

-- =========================================================
-- PHẦN 6/6: Tạo view vw_sach_trien_khai
-- =========================================================
/* ChatBot */

CREATE OR REPLACE VIEW vw_sach_trien_khai AS
SELECT 
  s.id,
  s.tieu_de,
  s.tac_gia,
  nxb.ten AS nha_xuat_ban,
  s.nam_xb,
  s.ngon_ngu,
  s.the_loai,
  s.mo_ta,
  s.gia_bia,
  s.don_vi_tien,
  (SELECT url_anh FROM anh_sach a WHERE a.id_sach = s.id AND a.la_anh_dai_dien=1 LIMIT 1) AS anh_dai_dien,
  COUNT(bs.id) AS tong_ban_sao,
  SUM(CASE WHEN bs.trang_thai IN ('available','co_san','trong_kho') THEN 1 ELSE 0 END) AS so_ban_con,
  GROUP_CONCAT(DISTINCT vk.ma_ke ORDER BY vk.ma_ke SEPARATOR ', ') AS cac_ke,
  GROUP_CONCAT(DISTINCT CONCAT(vk.phong,' | kệ ',vk.ke,' | hàng ',vk.hang,' | cột ',vk.cot) SEPARATOR ' || ') AS mo_ta_vi_tri
FROM sach s
LEFT JOIN nha_xuat_ban nxb ON nxb.id = s.id_nxb
LEFT JOIN ban_sao bs ON bs.id_sach = s.id
LEFT JOIN vi_tri_ke vk ON vk.id = bs.id_vi_tri
GROUP BY s.id;

-- ====== SEED dữ liệu mẫu cho bảng noi_quy_dong (quy định động)
INSERT INTO noi_quy_dong (
  tieu_de, mo_ta, danh_muc, trang_thai, muc_do, doi_tuong, ngay_hieu_luc, ngay_het_hieu_luc, so_tien_phat, loai_phat, don_vi_tien, nguoi_tao, nguoi_cap_nhat
) VALUES
  ('Không nói chuyện trong thư viện', 'Giữ trật tự tuyệt đối trong khu vực thư viện.', 'behavior', 'active', 'medium', 'all', '2024-06-01', NULL, 50000, 'fine', 'VND', 'Admin', 'Admin'),
  ('Trả sách đúng hạn', 'Phải trả sách trước hoặc đúng ngày hết hạn. Quá hạn sẽ bị phạt.', 'borrowing', 'active', 'high', 'all', '2024-06-01', NULL, 2000, 'fine', 'VND', 'Admin', 'Admin'),
  ('Không mang đồ ăn thức uống vào thư viện', 'Cấm mang đồ ăn, nước uống vào phòng đọc để giữ vệ sinh.', 'behavior', 'active', 'low', 'all', '2024-06-01', NULL, NULL, 'none', 'VND', 'Admin', 'Admin'),
  ('Không sử dụng điện thoại trong phòng đọc', 'Điện thoại phải để chế độ im lặng, không nghe/gọi trong phòng đọc.', 'behavior', 'active', 'medium', 'all', '2024-06-01', NULL, NULL, 'warning', 'VND', 'Admin', 'Admin'),
  ('Không tự ý di chuyển sách', 'Không tự ý lấy hoặc di chuyển sách khỏi vị trí quy định.', 'general', 'active', 'medium', 'all', '2024-06-01', NULL, NULL, 'none', 'VND', 'Admin', 'Admin'),
  ('Không làm hỏng sách', 'Nếu làm hỏng/mất sách phải bồi thường theo quy định.', 'penalty', 'active', 'high', 'all', '2024-06-01', NULL, 100000, 'fine', 'VND', 'Admin', 'Admin');
