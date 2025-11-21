# Botpress Chatbot Integration

## Tổng quan
Chatbot được tích hợp vào giao diện frontend để hỗ trợ người dùng tìm kiếm sách, kiểm tra tồn kho, và trả lời các câu hỏi về thư viện.

## Cấu trúc files

### 1. `botpress-script.tsx`
- Load các script cần thiết từ Botpress CDN
- Sử dụng Next.js Script component để tối ưu performance

### 2. `botpress-config.tsx`
- Cấu hình giao diện và hành vi của chatbot
- Tùy chỉnh màu sắc, font chữ, thông báo
- Thiết lập các tính năng như xóa cuộc trò chuyện, tải transcript

### 3. `botpress-chatbot.tsx` (backup)
- Phiên bản backup sử dụng useEffect
- Có thể sử dụng nếu gặp vấn đề với Next.js Script

## Cấu hình

### Scripts được load:
- `https://cdn.botpress.cloud/webchat/v3.3/inject.js` - Core Botpress library
- `https://files.bpcontent.cloud/2025/09/09/10/20250909104747-QMTNNPZB.js` - Bot configuration

### Tùy chỉnh giao diện:
- **Màu chính**: #2563eb (Blue)
- **Màu phụ**: #f3f4f6 (Light gray)
- **Font**: Inter, sans-serif
- **Border radius**: 12px

### Tính năng được bật:
- Xóa cuộc trò chuyện
- Reset chatbot
- Tải transcript
- Xóa lịch sử

## Sử dụng

Chatbot sẽ tự động xuất hiện ở góc dưới bên phải màn hình. Người dùng có thể:

1. **Tìm sách**: "Còn sách X không?"
2. **Vị trí kệ**: "Sách Y ở kệ nào?"
3. **Thông tin sách**: "Tác giả của sách Z là ai?"
4. **Quy định**: "Mượn được bao lâu?"
5. **Giờ mở cửa**: "Thư viện mở cửa lúc mấy giờ?"

## Troubleshooting

Nếu chatbot không hiển thị:
1. Kiểm tra console browser có lỗi không
2. Đảm bảo internet connection ổn định
3. Thử refresh trang
4. Kiểm tra các script có load thành công không

## Customization

Để tùy chỉnh thêm, chỉnh sửa file `botpress-config.tsx`:
- Thay đổi màu sắc trong `styles`
- Cập nhật thông báo trong `messages`
- Bật/tắt tính năng trong `features`
