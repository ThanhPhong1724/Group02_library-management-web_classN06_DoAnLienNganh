"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  BookOpen, 
  Copy, 
  Calendar,
  Download,
  Filter,
  Eye,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Activity,
  PieChart,
  LineChart
} from 'lucide-react';
import { DefaultLayout } from '@/components/layout/default-layout';
import { toast } from 'sonner';
import { reportsAPI } from '@/lib/api';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

// Types
interface OverviewReport {
  total_books: number;
  total_copies: number;
  total_users: number;
  total_loans: number;
  total_returns: number;
  total_overdue: number;
  total_fines: number;
}
interface TopBook {
  id: number;
  title: string;
  authors: string;
  loan_count: number;
}
interface TopUser {
  id: number;
  full_name: string;
  email: string;
  user_type: string;
  loan_count: number;
}
interface TopOverdueBook {
  id: number;
  title: string;
  authors: string;
  overdue_count: number;
}
interface FineStat {
  date: string;
  total_fine: number;
}
interface LoansByMonthStat {
  month: string;
  borrow_count: number;
  return_count: number;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string;
    borderWidth?: number;
  }[];
}

// Mock data for reports
const getMockReportData = (period: string): ReportData => {
  const baseData = {
    totalLoans: 1250,
    totalReturns: 1180,
    totalOverdue: 70,
    totalUsers: 156,
    totalBooks: 89,
    totalCopies: 267,
    revenue: 2500000,
    fines: 350000
  };

  // Adjust data based on period
  switch (period) {
    case 'week':
      return {
        period,
        ...baseData,
        totalLoans: Math.floor(baseData.totalLoans / 4),
        totalReturns: Math.floor(baseData.totalReturns / 4),
        totalOverdue: Math.floor(baseData.totalOverdue / 4),
        revenue: Math.floor(baseData.revenue / 4),
        fines: Math.floor(baseData.fines / 4)
      };
    case 'month':
      return {
        period,
        ...baseData
      };
    case 'quarter':
      return {
        period,
        ...baseData,
        totalLoans: baseData.totalLoans * 3,
        totalReturns: baseData.totalReturns * 3,
        totalOverdue: baseData.totalOverdue * 3,
        revenue: baseData.revenue * 3,
        fines: baseData.fines * 3
      };
    case 'year':
      return {
        period,
        ...baseData,
        totalLoans: baseData.totalLoans * 12,
        totalReturns: baseData.totalReturns * 12,
        totalOverdue: baseData.totalOverdue * 12,
        revenue: baseData.revenue * 12,
        fines: baseData.fines * 12
      };
    default:
      return {
        period,
        ...baseData
      };
  }
};

const getMockChartData = (period: string): ChartData => {
  const labels = period === 'week' 
    ? ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
    : period === 'month'
    ? ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4']
    : period === 'quarter'
    ? ['Tháng 1', 'Tháng 2', 'Tháng 3']
    : ['Q1', 'Q2', 'Q3', 'Q4'];

  return {
    labels,
    datasets: [
      {
        label: 'Mượn sách',
        data: labels.map(() => Math.floor(Math.random() * 100) + 50),
        backgroundColor: ['rgba(59, 130, 246, 0.8)'],
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2
      },
      {
        label: 'Trả sách',
        data: labels.map(() => Math.floor(Math.random() * 90) + 40),
        backgroundColor: ['rgba(34, 197, 94, 0.8)'],
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 2
      }
    ]
  };
};

const getMockTopBooks = (): TopBook[] => [
  {
    id: 1,
    title: 'Đắc Nhân Tâm',
    authors: 'Dale Carnegie',
    loanCount: 45,
    returnRate: 95.6
  },
  {
    id: 2,
    title: 'Nhà Giả Kim',
    authors: 'Paulo Coelho',
    loanCount: 38,
    returnRate: 92.1
  },
  {
    id: 3,
    title: 'Tuổi Trẻ Đáng Giá Bao Nhiêu',
    authors: 'Rosie Nguyễn',
    loanCount: 32,
    returnRate: 89.3
  },
  {
    id: 4,
    title: 'Sapiens: Lược Sử Loài Người',
    authors: 'Yuval Noah Harari',
    loanCount: 28,
    returnRate: 94.7
  },
  {
    id: 5,
    title: 'Atomic Habits',
    authors: 'James Clear',
    loanCount: 25,
    returnRate: 91.2
  }
];

const getMockTopUsers = (): TopUser[] => [
  {
    id: 1,
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@example.com',
    loanCount: 12,
    overdueCount: 1
  },
  {
    id: 2,
    name: 'Trần Thị B',
    email: 'tranthib@example.com',
    loanCount: 10,
    overdueCount: 0
  },
  {
    id: 3,
    name: 'Lê Văn C',
    email: 'levanc@example.com',
    loanCount: 8,
    overdueCount: 2
  },
  {
    id: 4,
    name: 'Phạm Thị D',
    email: 'phamthid@example.com',
    loanCount: 7,
    overdueCount: 0
  },
  {
    id: 5,
    name: 'Hoàng Văn E',
    email: 'hoangvane@example.com',
    loanCount: 6,
    overdueCount: 1
  }
];

// Stat Card Component
const StatCard = ({ 
  title, 
  value, 
  change, 
  changeType, 
  icon: Icon, 
  description 
}: {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'up' | 'down' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    transition={{ duration: 0.2 }}
  >
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <div className="flex items-center text-xs text-muted-foreground">
            {changeType === 'up' && <TrendingUp className="h-3 w-3 text-green-500 mr-1" />}
            {changeType === 'down' && <TrendingDown className="h-3 w-3 text-red-500 mr-1" />}
            {changeType === 'neutral' && <Activity className="h-3 w-3 text-blue-500 mr-1" />}
            {change}
          </div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  </motion.div>
);

// Chart Placeholder Component
const ChartPlaceholder = ({ title, height = "h-64" }: { title: string; height?: string }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <BarChart3 className="w-5 h-5" />
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className={`${height} flex items-center justify-center bg-muted rounded-lg`}>
        <div className="text-center text-muted-foreground">
          <BarChart3 className="w-12 h-12 mx-auto mb-2" />
          <p>Biểu đồ {title}</p>
          <p className="text-sm">Sẽ hiển thị dữ liệu thống kê</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Top Books Table Component
const TopBooksTable = ({ books }: { books: TopBook[] }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <BookOpen className="w-5 h-5" />
        Sách được mượn nhiều nhất
      </CardTitle>
      <CardDescription>
        Top 5 sách có lượt mượn cao nhất
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {books.map((book, index) => (
          <div key={book.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="w-8 h-8 flex items-center justify-center p-0">
                {index + 1}
              </Badge>
              <div>
                <h4 className="font-medium text-sm">{book.title}</h4>
                <p className="text-xs text-muted-foreground">{book.authors}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium text-sm">{book.loanCount} lượt mượn</div>
              <div className="text-xs text-muted-foreground">
                Tỷ lệ trả: {book.returnRate}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// Top Users Table Component
const TopUsersTable = ({ users }: { users: TopUser[] }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Users className="w-5 h-5" />
        Người dùng tích cực nhất
      </CardTitle>
      <CardDescription>
        Top 5 người dùng có lượt mượn cao nhất
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {users.map((user, index) => (
          <div key={user.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="w-8 h-8 flex items-center justify-center p-0">
                {index + 1}
              </Badge>
              <div>
                <h4 className="font-medium text-sm">{user.name}</h4>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium text-sm">{user.loanCount} lượt mượn</div>
              <div className="text-xs text-muted-foreground">
                {user.overdueCount > 0 ? (
                  <span className="text-red-600">Quá hạn: {user.overdueCount}</span>
                ) : (
                  <span className="text-green-600">Không quá hạn</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// Loading skeleton
const StatCardSkeleton = () => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-4" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-8 w-20 mb-2" />
      <Skeleton className="h-3 w-16" />
    </CardContent>
  </Card>
);

// Chart thực cho mượn/trả theo tháng
const LoansByMonthChart = ({ data }: { data: LoansByMonthStat[] }) => {
  const labels = data.map((d) => d.month);
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Lượt mượn',
        data: data.map((d) => d.borrow_count),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
      },
      {
        label: 'Lượt trả',
        data: data.map((d) => d.return_count),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 2,
      },
    ],
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Biểu đồ mượn trả theo thời gian
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <Bar data={chartData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
        </div>
      </CardContent>
    </Card>
  );
};
// Chart thực cho tiền phạt
const FinesChart = ({ data }: { data: FineStat[] }) => {
  const labels = data.map((d) => d.date);
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Tiền phạt',
        data: data.map((d) => d.total_fine),
        backgroundColor: 'rgba(239, 68, 68, 0.7)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 2,
        fill: true,
      },
    ],
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LineChart className="w-5 h-5" />
          Biểu đồ tiền phạt theo tháng
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <Line data={chartData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
        </div>
      </CardContent>
    </Card>
  );
};

export default function AdminReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week'|'month'|'quarter'|'year'>('month');
  const [overview, setOverview] = useState<OverviewReport|null>(null);
  const [topBooks, setTopBooks] = useState<TopBook[]>([]);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [topOverdue, setTopOverdue] = useState<TopOverdueBook[]>([]);
  const [fines, setFines] = useState<FineStat[]>([]);
  const [loansByMonth, setLoansByMonth] = useState<LoansByMonthStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Helper: Chuyển period sang from/to
  const getPeriodRange = (period: string) => {
    const now = new Date();
    let from: string, to: string;
    to = now.toISOString().slice(0, 10);
    if (period === 'week') {
      const d = new Date(now); d.setDate(now.getDate() - 6);
      from = d.toISOString().slice(0, 10);
    } else if (period === 'month') {
      const d = new Date(now); d.setDate(1);
      from = d.toISOString().slice(0, 10);
    } else if (period === 'quarter') {
      const d = new Date(now);
      d.setMonth(Math.floor(d.getMonth() / 3) * 3, 1);
      from = d.toISOString().slice(0, 10);
    } else if (period === 'year') {
      const d = new Date(now); d.setMonth(0, 1);
      from = d.toISOString().slice(0, 10);
    } else {
      from = to;
    }
    return { from, to };
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setIsLoading(true);
        const { from, to } = getPeriodRange(selectedPeriod);
        // Gọi đồng thời các API
        const [overviewRes, topBooksRes, topUsersRes, topOverdueRes, finesRes, loansByMonthRes] = await Promise.all([
          reportsAPI.getOverview(),
          reportsAPI.getTopBooks(from, to, 5),
          reportsAPI.getTopUsers(from, to, 5),
          reportsAPI.getTopOverdue(from, to, 5),
          reportsAPI.getFines(from, to, 'month'),
          reportsAPI.getLoansByMonth(from, to),
        ]);
        if (overviewRes.success) setOverview(overviewRes.data);
        if (topBooksRes.success) setTopBooks(topBooksRes.data);
        if (topUsersRes.success) setTopUsers(topUsersRes.data);
        if (topOverdueRes.success) setTopOverdue(topOverdueRes.data);
        if (finesRes.success) setFines(finesRes.data);
        if (loansByMonthRes.success) setLoansByMonth(loansByMonthRes.data);
      } catch (error) {
        toast.error('Không thể tải dữ liệu báo cáo');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, [selectedPeriod]);

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period as 'week'|'month'|'quarter'|'year');
  };

  const handleExportReport = () => {
    try {
      // Tổng quan
      const overviewSheet = [
        ['Chỉ số', 'Giá trị'],
        ['Tổng sách', overview?.total_books ?? 0],
        ['Tổng bản sao', overview?.total_copies ?? 0],
        ['Tổng thành viên', overview?.total_users ?? 0],
        ['Tổng lượt mượn', overview?.total_loans ?? 0],
        ['Tổng lượt trả', overview?.total_returns ?? 0],
        ['Tổng quá hạn', overview?.total_overdue ?? 0],
        ['Tổng tiền phạt', overview?.total_fines ?? 0],
      ];
      // Top sách
      const topBooksSheet = [
        ['#', 'Tên sách', 'Tác giả', 'Số lượt mượn'],
        ...topBooks.map((b, i) => [i + 1, b.title, b.authors, b.loan_count]),
      ];
      // Top user
      const topUsersSheet = [
        ['#', 'Họ tên', 'Email', 'Loại', 'Số lượt mượn'],
        ...topUsers.map((u, i) => [i + 1, u.full_name, u.email, u.user_type, u.loan_count]),
      ];
      // Top quá hạn
      const topOverdueSheet = [
        ['#', 'Tên sách', 'Tác giả', 'Số lượt quá hạn'],
        ...topOverdue.map((b, i) => [i + 1, b.title, b.authors, b.overdue_count]),
      ];
      // Tiền phạt
      const finesSheet = [
        ['Thời gian', 'Tổng tiền phạt'],
        ...fines.map((f) => [f.date, f.total_fine]),
      ];
      // Lượt mượn/trả
      const loansByMonthSheet = [
        ['Tháng', 'Lượt mượn', 'Lượt trả'],
        ...loansByMonth.map((l) => [l.month, l.borrow_count, l.return_count]),
      ];
      // Build workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(overviewSheet), 'Tổng quan');
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(topBooksSheet), 'Top sách');
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(topUsersSheet), 'Top user');
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(topOverdueSheet), 'Top quá hạn');
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(finesSheet), 'Tiền phạt');
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(loansByMonthSheet), 'Lượt mượn trả');
      // Xuất file
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      saveAs(new Blob([wbout], { type: 'application/octet-stream' }), `BaoCaoThuVien_${new Date().toISOString().slice(0,10)}.xlsx`);
    } catch (err) {
      toast.error('Xuất báo cáo thất bại!');
    }
  };

  const handleRefreshData = () => {
    toast.info('Làm mới dữ liệu (chức năng sẽ được phát triển)');
    // TODO: Implement refresh functionality
  };

  if (isLoading) {
    return (
      <DefaultLayout showSidebar>
        <div className="container mx-auto max-w-screen-2xl px-4 py-8">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="h-10 w-64 mb-2" />
                <Skeleton className="h-6 w-96" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>

            {/* Period Selector */}
            <Skeleton className="h-16 w-full" />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <StatCardSkeleton key={i} />
              ))}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>

            {/* Tables Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Skeleton className="h-80 w-full" />
              <Skeleton className="h-80 w-full" />
            </div>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout showSidebar>
      <div className="container mx-auto max-w-screen-2xl px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Báo cáo & Thống kê</h1>
              <p className="text-gray-600">
                Phân tích dữ liệu hoạt động thư viện và xuất báo cáo chi tiết
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleRefreshData}>
                <Clock className="w-4 h-4 mr-2" />
                Làm mới
              </Button>
              <Button onClick={handleExportReport}>
                <Download className="w-4 h-4 mr-2" />
                Xuất báo cáo
              </Button>
            </div>
          </div>

          {/* Period Selector */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Chọn khoảng thời gian
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Tuần này</SelectItem>
                    <SelectItem value="month">Tháng này</SelectItem>
                    <SelectItem value="quarter">Quý này</SelectItem>
                    <SelectItem value="year">Năm nay</SelectItem>
                  </SelectContent>
                </Select>
                <div className="text-sm text-muted-foreground flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Dữ liệu được cập nhật theo thời gian thực
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Tổng lượt mượn"
              value={overview?.total_loans.toLocaleString() || '0'}
              change="+12.5% so với kỳ trước"
              changeType="up"
              icon={BookOpen}
              description="Tổng số lượt mượn sách"
            />
            <StatCard
              title="Lượt trả"
              value={overview?.total_returns.toLocaleString() || '0'}
              change="+8.3% so với kỳ trước"
              changeType="up"
              icon={CheckCircle}
              description="Số lượt trả sách đúng hạn"
            />
            <StatCard
              title="Quá hạn"
              value={overview?.total_overdue.toLocaleString() || '0'}
              change="-5.2% so với kỳ trước"
              changeType="down"
              icon={AlertCircle}
              description="Số lượt mượn quá hạn"
            />
            <StatCard
              title="Doanh thu"
              value={`${(overview?.total_fines || 0).toLocaleString()}đ`}
              change="+15.7% so với kỳ trước"
              changeType="up"
              icon={TrendingUp}
              description="Tổng doanh thu từ phí mượn"
            />
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Thành viên mới"
              value={overview?.total_users || '0'}
              change="+3 thành viên mới"
              changeType="up"
              icon={Users}
              description="Tổng số thành viên thư viện"
            />
            <StatCard
              title="Sách trong kho"
              value={overview?.total_books || '0'}
              change="+5 sách mới"
              changeType="up"
              icon={Copy}
              description="Tổng số đầu sách"
            />
            <StatCard
              title="Tiền phạt"
              value={`${(overview?.total_fines || 0).toLocaleString()}đ`}
              change="-2.1% so với kỳ trước"
              changeType="down"
              icon={XCircle}
              description="Tổng tiền phạt quá hạn"
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LoansByMonthChart data={loansByMonth} />
            <FinesChart data={fines} />
          </div>

          {/* Tables Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopBooksTable books={topBooks} />
            <TopUsersTable users={topUsers} />
          </div>

          {/* Additional Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ChartPlaceholder title="Tỷ lệ sách được mượn" height="h-48" />
            <ChartPlaceholder title="Phân bố người dùng theo nhóm" height="h-48" />
            <ChartPlaceholder title="Hiệu suất kệ sách" height="h-48" />
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}
