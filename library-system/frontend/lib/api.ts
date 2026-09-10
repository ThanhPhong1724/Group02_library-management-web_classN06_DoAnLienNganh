// API Base Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Common API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface RegisterRequest {
  full_name: string;
  email: string;
  phone: string;
  address: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

// Book Types
export interface Book {
  id: number;
  tieu_de: string;
  tac_gia: string;
  ngon_ngu: string;
  the_loai: string;
  so_luong_tong: number;
  so_luong_con: number;
  mo_ta?: string;
  nam_xuat_ban?: number;
  nha_xuat_ban?: string;
  isbn?: string;
  created_at: string;
  updated_at: string;
}

export interface BookCreateRequest {
  tieu_de: string;
  tac_gia: string;
  ngon_ngu: string;
  the_loai: string;
  so_luong_tong: number;
  mo_ta?: string;
  nam_xuat_ban?: number;
  nha_xuat_ban?: string;
  isbn?: string;
}

export type BookUpdateRequest = Partial<BookCreateRequest>;

// Copy Types
export interface Copy {
  id: number;
  copy_code: string;
  book_id: number;
  book_title: string;
  trang_thai: 'available' | 'borrowed' | 'maintenance' | 'lost';
  vi_tri?: string;
  ghi_chu?: string;
  created_at: string;
  updated_at: string;
}

export interface CopyCreateRequest {
  book_id: number;
  copy_code: string;
  vi_tri?: string;
  ghi_chu?: string;
}

export interface CopyUpdateRequest {
  trang_thai?: string;
  vi_tri?: string;
  ghi_chu?: string;
}

// Location Types
export interface Location {
  id: number;
  ten_vi_tri: string;
  mo_ta?: string;
  so_ke?: number;
  trang_thai: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface LocationCreateRequest {
  ten_vi_tri: string;
  mo_ta?: string;
  so_ke?: number;
}

export type LocationUpdateRequest = Partial<LocationCreateRequest>;

// Loan Types
export interface Loan {
  id: number;
  user_id: number;
  user_name: string;
  copy_id: number;
  copy_code: string;
  book_title: string;
  ngay_muon: string;
  ngay_hen_tra: string;
  ngay_tra?: string;
  trang_thai: 'active' | 'returned' | 'overdue';
  ghi_chu?: string;
  created_at: string;
  updated_at: string;
}

export interface LoanCreateRequest {
  user_id: number;
  copy_id: number;
  ngay_hen_tra: string;
  ghi_chu?: string;
}

export interface LoanUpdateRequest {
  ngay_tra?: string;
  trang_thai?: string;
  ghi_chu?: string;
}

// User Types
export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  phone: string;
  address: string;
  role: string;
  trang_thai: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: number;
  email: string;
  full_name: string;
  role: string;
  user_type: string;
  is_active: boolean;
}

export interface UserUpdateRequest {
  full_name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

// Settings Types
export interface Setting {
  key: string;
  value: string;
  description?: string;
  updated_at: string;
}

export interface SettingUpdateRequest {
  value: string;
}

// Notification Types
export interface Notification {
  id: number;
  type: string;
  title: string;
  body?: string;
  is_read: boolean;
  created_at: string;
}

// API Client Class
class ApiClient {
  private baseURL: string;
  private token: string | null;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    // Merge with any additional headers from options
    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // Auth Methods
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await this.request<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success && response.data) {
      this.token = response.data.access_token;
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', response.data.access_token);
      }
    }

    return response;
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<unknown>> {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async forgotPassword(email: ForgotPasswordRequest): Promise<ApiResponse<unknown>> {
    // Backend không có endpoint forgot-password
    return Promise.resolve({
      success: false,
      error: 'Endpoint not implemented in backend'
    });
  }

  async logout(): Promise<void> {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
    }
  }

  // Book Methods
  async getBooks(
    page: number = 1,
    per_page: number = 10,
    search?: string,
    category?: string,
    language?: string
  ): Promise<ApiResponse<PaginatedResponse<Book>>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: per_page.toString(),
    });

    if (search) params.append('search', search);
    // Backend không hỗ trợ category và language filters

    return this.request<PaginatedResponse<Book>>(`/api/books?${params.toString()}`);
  }

  async getBook(id: number): Promise<ApiResponse<Book>> {
    return this.request<Book>(`/api/books/${id}`);
  }

  async createBook(bookData: BookCreateRequest): Promise<ApiResponse<Book>> {
    return this.request<Book>('/api/books', {
      method: 'POST',
      body: JSON.stringify(bookData),
    });
  }

  async updateBook(id: number, bookData: BookUpdateRequest): Promise<ApiResponse<Book>> {
    return this.request<Book>(`/api/books/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bookData),
    });
  }

  async deleteBook(id: number): Promise<ApiResponse<unknown>> {
    return this.request(`/api/books/${id}`, {
      method: 'DELETE',
    });
  }

  // Copy Methods
  async getCopies(
    page: number = 1,
    per_page: number = 10,
    book_id?: number,
    status?: string,
    search?: string // thêm search param
  ): Promise<ApiResponse<PaginatedResponse<Copy>>> {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: per_page.toString(),
    });
    if (book_id) params.append('book_id', book_id.toString());
    if (status) params.append('status', status);
    if (search) params.append('search', search); // truyền search param
    return this.request<PaginatedResponse<Copy>>(`/api/copies?${params.toString()}`);
  }

  async getCopy(copyCode: string): Promise<ApiResponse<Copy>> {
    return this.request<Copy>(`/api/copies/${copyCode}`);
  }

  async createCopy(copyData: CopyCreateRequest): Promise<ApiResponse<Copy>> {
    return this.request<Copy>('/api/copies', {
      method: 'POST',
      body: JSON.stringify(copyData),
    });
  }

  async updateCopy(id: number, copyData: CopyUpdateRequest): Promise<ApiResponse<Copy>> {
    return this.request<Copy>(`/api/copies/${id}`, {
      method: 'PATCH', // Backend sử dụng PATCH, không phải PUT
      body: JSON.stringify(copyData),
    });
  }

  // Location Methods
  async getLocations(
    page: number = 1,
    per_page: number = 10
  ): Promise<ApiResponse<Location[]>> {
    // Backend trả về array, không có pagination
    return this.request<Location[]>('/api/locations');
  }

  async createLocation(locationData: LocationCreateRequest): Promise<ApiResponse<Location>> {
    return this.request<Location>('/api/locations', {
      method: 'POST',
      body: JSON.stringify(locationData),
    });
  }

  async updateLocation(id: number, locationData: LocationUpdateRequest): Promise<ApiResponse<Location>> {
    // Backend không có endpoint update location
    return this.request<Location>(`/api/locations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(locationData),
    });
  }

  async deleteLocation(id: number): Promise<ApiResponse<unknown>> {
    // Backend không có endpoint delete location
    return this.request(`/api/locations/${id}`, {
      method: 'DELETE',
    });
  }

  // Loan Methods
  async getLoans(
    page: number = 1,
    per_page: number = 10,
    status?: string,
    user_id?: number
  ): Promise<ApiResponse<PaginatedResponse<Loan>>> {
    // Backend có endpoint admin/loans cho admin
    const params = new URLSearchParams();
    if (status) params.append('status', status);

    return this.request<PaginatedResponse<Loan>>(`/api/admin/loans?${params.toString()}`);
  }

  async createLoan(loanData: LoanCreateRequest): Promise<ApiResponse<Loan>> {
    return this.request<Loan>('/api/loans/request', {
      method: 'POST',
      body: JSON.stringify(loanData),
    });
  }

  async updateLoan(id: number, loanData: LoanUpdateRequest): Promise<ApiResponse<Loan>> {
    // Backend có endpoint request-return
    if (loanData.trang_thai === 'return_requested') {
      return this.request<Loan>(`/api/loans/${id}/request-return`, {
        method: 'POST',
      });
    }
    // Các trường hợp khác cần implement
    return this.request<Loan>(`/api/loans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(loanData),
    });
  }

  // User Methods
  async getUserProfile(): Promise<ApiResponse<UserProfile>> {
    return this.request<UserProfile>('/api/auth/me');
  }

  async updateUserProfile(userData: UserUpdateRequest): Promise<ApiResponse<UserProfile>> {
    // Backend không có endpoint update profile, có thể cần implement
    // Tạm thời return error
    return Promise.resolve({
      success: false,
      error: 'Endpoint not implemented in backend'
    });
  }

  async getUserLoans(
    page: number = 1,
    per_page: number = 10
  ): Promise<ApiResponse<Loan[]>> {
    // Backend có endpoint /me/loans nhưng không có pagination
    return this.request<Loan[]>('/api/loans/me/loans');
  }

  // Settings Methods
  async getSettings(): Promise<ApiResponse<Setting[]>> {
    return this.request<Setting[]>('/api/settings');
  }

  async updateSetting(key: string, settingData: SettingUpdateRequest): Promise<ApiResponse<Setting>> {
    // Backend không có endpoint update setting
    return this.request<Setting>(`/api/settings/${key}`, {
      method: 'PUT',
      body: JSON.stringify(settingData),
    });
  }

  // Reports Methods
  async getReportOverview(): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/admin/reports/overview`);
  }
  async getReportTopBooks(from?: string, to?: string, limit: number = 5): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    params.append('limit', limit.toString());
    return this.request<any>(`/api/admin/reports/top-books?${params.toString()}`);
  }
  async getReportTopUsers(from?: string, to?: string, limit: number = 5): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    params.append('limit', limit.toString());
    return this.request<any>(`/api/admin/reports/top-users?${params.toString()}`);
  }
  async getReportTopOverdue(from?: string, to?: string, limit: number = 5): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    params.append('limit', limit.toString());
    return this.request<any>(`/api/admin/reports/top-overdue?${params.toString()}`);
  }
  async getReportFines(from?: string, to?: string, group_by: 'day' | 'month' = 'month'): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    params.append('group_by', group_by);
    return this.request<any>(`/api/admin/reports/fines?${params.toString()}`);
  }
  async getReportLoansByMonth(from?: string, to?: string): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    return this.request<any>(`/api/admin/reports/loans-by-month?${params.toString()}`);
  }

  // Notification Methods
  async getNotifications(): Promise<ApiResponse<Notification[]>> {
    return this.request<Notification[]>('/api/notifications');
  }
  async getUnreadCount(): Promise<ApiResponse<number>> {
    return this.request<number>('/api/notifications/unread-count');
  }
  async markAllRead(): Promise<ApiResponse<number>> {
    return this.request<number>('/api/notifications/mark-all-read', { method: 'PATCH' });
  }
  async markRead(notificationId: number): Promise<ApiResponse<Notification>> {
    return this.request<Notification>(`/api/notifications/${notificationId}/read`, {
      method: 'PATCH',
      body: JSON.stringify({ is_read: true }),
    });
  }
  async createNotification(payload: { user_id: number; type: string; title: string; body?: string }): Promise<ApiResponse<Notification>> {
    return this.request<Notification>('/api/notifications', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
  async broadcastNotification(payload: { user_ids: number[]; type: string; title: string; body?: string }): Promise<ApiResponse<Notification[]>> {
    return this.request<Notification[]>('/api/notifications/broadcast', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async sendSystemNotification(payload: { type: string; title: string; body?: string; user_type?: string }): Promise<ApiResponse<Notification[]>> {
    return this.request<Notification[]>('/api/notifications/system', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Notification update/delete
  async updateNotification(id: number, data: { type?: string; title?: string; body?: string }): Promise<ApiResponse<Notification>> {
    return this.request<Notification>(`/api/notifications/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }
  async deleteNotification(id: number): Promise<ApiResponse<{ success: boolean; id: number }>> {
    return this.request<{ success: boolean; id: number }>(`/api/notifications/${id}`, {
      method: 'DELETE',
    });
  }

  // Utility Methods
  isAuthenticated(): boolean {
    return !!this.token;
  }

  getToken(): string | null {
    return this.token;
  }

  setToken(token: string): void {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export individual functions for convenience
export const authAPI = {
  login: (credentials: LoginRequest) => apiClient.login(credentials),
  register: (userData: RegisterRequest) => apiClient.register(userData),
  forgotPassword: (email: ForgotPasswordRequest) => apiClient.forgotPassword(email),
  logout: () => apiClient.logout(),
};

export const booksAPI = {
  getAll: (page?: number, per_page?: number, search?: string, category?: string, language?: string) =>
    apiClient.getBooks(page, per_page, search, category, language),
  getById: (id: number) => apiClient.getBook(id),
  create: (bookData: BookCreateRequest) => apiClient.createBook(bookData),
  update: (id: number, bookData: BookUpdateRequest) => apiClient.updateBook(id, bookData),
  delete: (id: number) => apiClient.deleteBook(id),
};

export const copiesAPI = {
  getAll: (page?: number, per_page?: number, book_id?: number, status?: string, search?: string) =>
    apiClient.getCopies(page, per_page, book_id, status, search),
  getByCode: (copyCode: string) => apiClient.getCopy(copyCode),
  create: (copyData: CopyCreateRequest) => apiClient.createCopy(copyData),
  update: (id: number, copyData: CopyUpdateRequest) => apiClient.updateCopy(id, copyData),
};

export const locationsAPI = {
  getAll: (page?: number, per_page?: number) => apiClient.getLocations(page, per_page),
  create: (locationData: LocationCreateRequest) => apiClient.createLocation(locationData),
  update: (id: number, locationData: LocationUpdateRequest) => apiClient.updateLocation(id, locationData),
  delete: (id: number) => apiClient.deleteLocation(id),
};

export const loansAPI = {
  getAll: (page?: number, per_page?: number, status?: string, user_id?: number) =>
    apiClient.getLoans(page, per_page, status, user_id),
  create: (loanData: LoanCreateRequest) => apiClient.createLoan(loanData),
  update: (id: number, loanData: LoanUpdateRequest) => apiClient.updateLoan(id, loanData),
};

export const usersAPI = {
  getProfile: () => apiClient.getUserProfile(),
  updateProfile: (userData: UserUpdateRequest) => apiClient.updateUserProfile(userData),
  getLoans: (page?: number, per_page?: number) => apiClient.getUserLoans(page, per_page),
};

export const settingsAPI = {
  getAll: () => apiClient.getSettings(),
  update: (key: string, settingData: SettingUpdateRequest) => apiClient.updateSetting(key, settingData),
};

export const reportsAPI = {
  getOverview: () => apiClient.getReportOverview(),
  getTopBooks: (from?: string, to?: string, limit: number = 5) => apiClient.getReportTopBooks(from, to, limit),
  getTopUsers: (from?: string, to?: string, limit: number = 5) => apiClient.getReportTopUsers(from, to, limit),
  getTopOverdue: (from?: string, to?: string, limit: number = 5) => apiClient.getReportTopOverdue(from, to, limit),
  getFines: (from?: string, to?: string, group_by: 'day' | 'month' = 'month') => apiClient.getReportFines(from, to, group_by),
  getLoansByMonth: (from?: string, to?: string) => apiClient.getReportLoansByMonth(from, to),
};

export const notificationsAPI = {
  getAll: () => apiClient.getNotifications(),
  getUnreadCount: () => apiClient.getUnreadCount(),
  markAllRead: () => apiClient.markAllRead(),
  markRead: (id: number) => apiClient.markRead(id),
  create: (payload: { user_id: number; type: string; title: string; body?: string }) => apiClient.createNotification(payload),
  broadcast: (payload: { user_ids: number[]; type: string; title: string; body?: string }) => apiClient.broadcastNotification(payload),
  sendSystem: (payload: { type: string; title: string; body?: string; user_type?: string }) => apiClient.sendSystemNotification(payload),
  update: (id: number, data: { type?: string; title?: string; body?: string }) => apiClient.updateNotification(id, data),
  delete: (id: number) => apiClient.deleteNotification(id),
};

export default apiClient;
