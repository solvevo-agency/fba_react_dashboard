import { useState, useEffect } from 'react';
import { useAppSelector } from '@/app/store/hooks';
import {
  Users,
  GraduationCap,
  Award,
  TrendingUp,
  Sparkles,
  Star,
  Mail,
  Send,
  MessageSquare,
  UserPlus,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  dashboardApi,
  type DashboardOverviewData,
  type DashboardActivityItem,
} from '@/services/dashboardApi';

export default function DashboardPage() {
  const { user } = useAppSelector((state) => state.auth);
  const [overview, setOverview] = useState<DashboardOverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const data = await dashboardApi.getOverview();
        if (mounted) {
          setOverview(data);
        }
      } catch (error) {
        console.error('Failed to load dashboard overview data:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchDashboard();
    return () => {
      mounted = false;
    };
  }, []);

  const quickStats = [
    {
      title: 'Active Students',
      value: overview?.stats.active_students?.toLocaleString() ?? (loading ? '...' : '0'),
      icon: Users,
    },
    {
      title: 'Active Courses',
      value: overview?.stats.active_courses?.toLocaleString() ?? (loading ? '...' : '0'),
      icon: GraduationCap,
    },
    {
      title: 'Exam Pass Rate',
      value: overview?.stats.exam_pass_rate ?? (loading ? '...' : '0%'),
      icon: Award,
    },
    {
      title: 'Monthly Revenue',
      value: overview?.stats.formatted_monthly_revenue ?? (loading ? '...' : '$0'),
      icon: TrendingUp,
    },
  ];

  // Helper for activity styling and icons
  const getActivityMeta = (type: DashboardActivityItem['type']) => {
    switch (type) {
      case 'student_enroll':
        return {
          icon: UserPlus,
          bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
        };
      case 'review':
        return {
          icon: Star,
          bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
        };
      case 'contact':
        return {
          icon: Mail,
          bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
        };
      case 'newsletter':
        return {
          icon: Send,
          bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        };
      case 'community_post':
        return {
          icon: MessageSquare,
          bg: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
        };
      default:
        return {
          icon: Sparkles,
          bg: 'bg-primary/10 text-primary',
        };
    }
  };

  const chartData = overview?.analytics || [];
  const activities = overview?.activities || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="rounded-2xl border bg-gradient-to-r from-primary/10 via-background to-secondary/10 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Welcome back, {user?.name || 'Super Admin'}
            </h2>
            <Badge variant="outline" className="border-primary/40 text-primary text-[11px] gap-1">
              <Sparkles className="h-3 w-3" /> FBA Live
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Here is your live overview of courses, student progress, exam scores, and certifications.
          </p>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {quickStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="border shadow-xs hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-2xl font-bold tracking-tight font-secondary">
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts & Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Enrollment Analytics Chart */}
        <Card className="lg:col-span-2 border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Enrollment & Student Growth</CardTitle>
              <CardDescription className="text-xs">
                Monthly student enrollments across all training courses
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-xs">
              2026 Trend
            </Badge>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[280px] w-full">
              {loading && chartData.length === 0 ? (
                <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" /> Loading chart data...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="studentGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="month"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '0.5rem',
                        color: 'hsl(var(--popover-foreground))',
                        fontSize: '12px',
                      }}
                      formatter={(val: number) => [`${val} students`, 'Learners']}
                    />
                    <Area
                      type="monotone"
                      dataKey="students"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#studentGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent System Activity with custom scrolling */}
        <Card className="border shadow-xs flex flex-col">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
            <CardDescription className="text-xs">
              Latest system updates and student achievements
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-4 max-h-[310px] overflow-y-auto pr-1">
              {loading && activities.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-muted-foreground text-xs gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span>Loading recent activities...</span>
                </div>
              ) : activities.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted-foreground">
                  No recent activities recorded yet.
                </div>
              ) : (
                activities.map((activity, i) => {
                  const meta = getActivityMeta(activity.type);
                  const Icon = meta.icon;
                  return (
                    <div
                      key={activity.id || i}
                      className="flex items-start gap-3 text-xs pb-3.5 border-b last:border-0 last:pb-0"
                    >
                      <div
                        className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${meta.bg}`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <p className="font-semibold text-foreground truncate">{activity.title}</p>
                        <p className="text-muted-foreground line-clamp-2 text-[11px] leading-relaxed">
                          {activity.desc}
                        </p>
                      </div>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap pl-1 shrink-0">
                        {activity.time}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
