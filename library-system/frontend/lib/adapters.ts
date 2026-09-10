// Mock adapters for frontend pages
// TODO: Replace with real API calls (e.g., fetch('/api/...'))

export type BookLite = {
  id: number;
  title: string;
  authors: string;
  publisher?: string | null;
  pub_year?: number | null;
  primary_image_url?: string | null;
};

export type BooksLiteResponse = {
  items: BookLite[];
  page: number;
  limit: number;
  total: number;
};

export async function fetchBooksLite(query: string): Promise<BooksLiteResponse> {
  await new Promise((r) => setTimeout(r, 350));
  const q = query.trim();
  if (!q) return { items: [], page: 1, limit: 10, total: 0 };
  if (q === 'error') throw new Error('Mocked network error');
  const items: BookLite[] = Array.from({ length: 6 }).map((_, i) => ({
    id: i + 1,
    title: `${q} – Kết quả #${i + 1}`,
    authors: i % 2 === 0 ? 'Nguyễn Văn A' : 'Trần Thị B',
    publisher: i % 2 === 0 ? 'NXB KHTN' : 'NXB Văn học',
    pub_year: 2019 + i,
    primary_image_url: null,
  }));
  return { items, page: 1, limit: 10, total: 24 };
}

export type SettingsData = { opening_hours: string | null; rules: string | null; bank_info: string | null };

export async function fetchSettings(): Promise<SettingsData> {
  await new Promise((r) => setTimeout(r, 200));
  return {
    opening_hours: 'Thứ 2–6: 8:00–20:00; Thứ 7: 8:00–17:00; CN nghỉ.',
    rules: 'Giữ trật tự; không ăn uống trong phòng đọc; trả sách đúng hạn.',
    bank_info: 'STK: 0123456789 - Ngân hàng ABC - Chủ TK: Thu Thư',
  };
}

export type BookDetail = {
  id: number;
  title: string;
  subtitle?: string | null;
  authors: string;
  publisher?: string | null;
  pub_year?: number | null;
  language?: string | null;
  subjects?: string | null;
  description?: string | null;
  cover_price?: number | null;
  currency?: string | null;
  quantity_total: number;
  quantity_avail: number;
  images: { id: number; image_url: string; is_primary: boolean; sort_order: number }[];
  copies: { id: number; copy_code: string; status: string; location: { id?: number; code: string; room?: string | null; floor?: string | null } }[];
};

export async function fetchBookDetail(id: number): Promise<BookDetail> {
  await new Promise((r) => setTimeout(r, 250));
  return {
    id,
    title: `Sách mẫu #${id}`,
    subtitle: null,
    authors: 'Tác giả A',
    publisher: 'NXB KHTN',
    pub_year: 2022,
    language: 'vi',
    subjects: null,
    description: 'Mô tả ngắn gọn về cuốn sách mẫu, dùng để duyệt UI.',
    cover_price: 120000,
    currency: 'VND',
    quantity_total: 3,
    quantity_avail: 2,
    images: [
      { id: 1, image_url: 'https://picsum.photos/seed/book/640/360', is_primary: true, sort_order: 0 },
    ],
    copies: [
      { id: 5, copy_code: 'DEMO-001', status: 'available', location: { code: 'A-01-01-01', room: 'Phòng Đọc', floor: '1' } },
    ],
  };
}


