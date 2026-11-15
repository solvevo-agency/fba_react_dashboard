import { apiClient, type ApiResponse } from './api';

export interface DashboardQuickStats {
  active_students: number;
  active_courses: number;
  exam_pass_rate: string;
  monthly_revenue: number;
  formatted_monthly_revenue: string;
  total_revenue?: number;
  total_students?: number;
  total_courses?: number;
}

export interface MonthlyAnalyticsItem {
  month: string;
  students: number;
  revenue: number;
}

export interface DashboardActivityItem {
  id: string;
  type: 'student_enroll' | 'review' | 'contact' | 'newsletter' | 'community_post';
  title: string;
  desc: string;
  time: string;
  timestamp: string;
}

export interface DashboardOverviewData {
  stats: DashboardQuickStats;
  analytics: MonthlyAnalyticsItem[];
  activities: DashboardActivityItem[];
}

export const dashboardApi = {
  getOverview: async (): Promise<DashboardOverviewData> => {
    const res = await apiClient.get<ApiResponse<DashboardOverviewData>>('/super-admin/dashboard/overview');
    return res.data.data;
  },

  getStats: async (): Promise<DashboardQuickStats> => {
    const res = await apiClient.get<ApiResponse<DashboardQuickStats>>('/super-admin/dashboard/stats');
    return res.data.data;
  },

  getAnalytics: async (): Promise<MonthlyAnalyticsItem[]> => {
    const res = await apiClient.get<ApiResponse<MonthlyAnalyticsItem[]>>('/super-admin/dashboard/analytics');
    return res.data.data;
  },

  getActivities: async (): Promise<DashboardActivityItem[]> => {
    const res = await apiClient.get<ApiResponse<DashboardActivityItem[]>>('/super-admin/dashboard/activities');
    return res.data.data;
  },
};

