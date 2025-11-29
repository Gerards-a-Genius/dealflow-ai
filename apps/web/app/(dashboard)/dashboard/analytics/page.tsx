'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import Card from '@/components/ui/Card';
import MetricCard from '@/components/ui/MetricCard';
import {
  Users,
  FileText,
  DollarSign,
  TrendingUp,
  Calendar,
  Target,
  Clock,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

interface AnalyticsData {
  // Overview
  totalLeads: number;
  activeTransactions: number;
  totalRevenue: number;
  conversionRate: number;
  leadsTrend: number;
  transactionsTrend: number;
  revenueTrend: number;
  conversionTrend: number;

  // Pipeline
  leadsByStatus: { status: string; count: number }[];
  transactionsByStatus: { status: string; count: number; value: number }[];

  // Time-based
  leadsOverTime: { date: string; count: number }[];
  revenueOverTime: { date: string; amount: number }[];

  // Performance
  avgDaysToClose: number;
  avgDealSize: number;
  topSources: { source: string; count: number; converted: number }[];
}

export default function AnalyticsPage() {
  const { token } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  useEffect(() => {
    fetchAnalytics();
  }, [token, period]);

  const fetchAnalytics = async () => {
    if (!token) return;

    try {
      const [dashboardRes, trendsRes, pipelineRes] = await Promise.all([
        apiClient.get<any>('/api/analytics/dashboard', token),
        apiClient.get<any>(`/api/analytics/trends?period=${period}`, token),
        apiClient.get<any>('/api/analytics/pipeline', token),
      ]);

      // Combine the data
      const analyticsData: AnalyticsData = {
        totalLeads: dashboardRes.data?.totalLeads || 0,
        activeTransactions: dashboardRes.data?.activeTransactions || 0,
        totalRevenue: dashboardRes.data?.totalRevenue || 0,
        conversionRate: dashboardRes.data?.conversionRate || 0,
        leadsTrend: dashboardRes.data?.leadsTrend || 0,
        transactionsTrend: dashboardRes.data?.transactionsTrend || 0,
        revenueTrend: dashboardRes.data?.revenueTrend || 0,
        conversionTrend: dashboardRes.data?.conversionTrend || 0,
        leadsByStatus: pipelineRes.data?.leadsByStatus || [],
        transactionsByStatus: pipelineRes.data?.transactionsByStatus || [],
        leadsOverTime: trendsRes.data?.leadsOverTime || [],
        revenueOverTime: trendsRes.data?.revenueOverTime || [],
        avgDaysToClose: dashboardRes.data?.avgDaysToClose || 0,
        avgDealSize: dashboardRes.data?.avgDealSize || 0,
        topSources: pipelineRes.data?.topSources || [],
      };

      setData(analyticsData);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      NEW: 'bg-blue-500',
      CONTACTED: 'bg-neutral-400',
      QUALIFIED: 'bg-secondary-500',
      NURTURING: 'bg-accent-500',
      CONVERTED: 'bg-green-500',
      LOST: 'bg-red-500',
      ACTIVE: 'bg-blue-500',
      UNDER_CONTRACT: 'bg-accent-500',
      PENDING: 'bg-purple-500',
      CLOSED: 'bg-secondary-500',
      CANCELLED: 'bg-red-500',
    };
    return colors[status] || 'bg-neutral-400';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-neutral-200 rounded w-32 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-neutral-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-500">Failed to load analytics data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Analytics</h1>
          <p className="text-neutral-500 mt-1">Track your performance and growth</p>
        </div>

        {/* Period Selector */}
        <div className="flex bg-neutral-100 rounded-lg p-1">
          {(['week', 'month', 'quarter', 'year'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                period === p ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          label="Total Leads"
          value={data.totalLeads}
          icon={Users}
          variant="primary"
          trend={
            data.leadsTrend
              ? { value: Math.abs(data.leadsTrend), direction: data.leadsTrend >= 0 ? 'up' : 'down' }
              : undefined
          }
        />
        <MetricCard
          label="Active Transactions"
          value={data.activeTransactions}
          icon={FileText}
          variant="secondary"
          trend={
            data.transactionsTrend
              ? { value: Math.abs(data.transactionsTrend), direction: data.transactionsTrend >= 0 ? 'up' : 'down' }
              : undefined
          }
        />
        <MetricCard
          label="Total Revenue"
          value={formatCurrency(data.totalRevenue)}
          icon={DollarSign}
          variant="accent"
          trend={
            data.revenueTrend
              ? { value: Math.abs(data.revenueTrend), direction: data.revenueTrend >= 0 ? 'up' : 'down' }
              : undefined
          }
        />
        <MetricCard
          label="Conversion Rate"
          value={`${data.conversionRate}%`}
          icon={Target}
          variant="default"
          trend={
            data.conversionTrend
              ? { value: Math.abs(data.conversionTrend), direction: data.conversionTrend >= 0 ? 'up' : 'down' }
              : undefined
          }
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Pipeline */}
        <Card>
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Lead Pipeline</h2>
          <div className="space-y-3">
            {data.leadsByStatus.length > 0 ? (
              data.leadsByStatus.map((item) => {
                const total = data.leadsByStatus.reduce((sum, i) => sum + i.count, 0);
                const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
                return (
                  <div key={item.status}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-neutral-600">{item.status}</span>
                      <span className="text-sm font-medium text-neutral-900">
                        {item.count} ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${getStatusColor(item.status)}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-neutral-500 text-center py-4">No data available</p>
            )}
          </div>
        </Card>

        {/* Transaction Pipeline */}
        <Card>
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Transaction Pipeline</h2>
          <div className="space-y-3">
            {data.transactionsByStatus.length > 0 ? (
              data.transactionsByStatus.map((item) => {
                const totalValue = data.transactionsByStatus.reduce((sum, i) => sum + i.value, 0);
                const percentage = totalValue > 0 ? Math.round((item.value / totalValue) * 100) : 0;
                return (
                  <div key={item.status}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-neutral-600">
                        {item.status} ({item.count})
                      </span>
                      <span className="text-sm font-medium text-neutral-900">
                        {formatCurrency(item.value)}
                      </span>
                    </div>
                    <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${getStatusColor(item.status)}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-neutral-500 text-center py-4">No data available</p>
            )}
          </div>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="text-center">
            <Clock className="h-8 w-8 text-primary-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-neutral-900">{data.avgDaysToClose}</p>
            <p className="text-sm text-neutral-500">Avg Days to Close</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <DollarSign className="h-8 w-8 text-secondary-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-neutral-900">{formatCurrency(data.avgDealSize)}</p>
            <p className="text-sm text-neutral-500">Avg Deal Size</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <Target className="h-8 w-8 text-accent-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-neutral-900">{data.conversionRate}%</p>
            <p className="text-sm text-neutral-500">Win Rate</p>
          </div>
        </Card>
      </div>

      {/* Lead Sources */}
      <Card>
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Lead Sources Performance</h2>
        {data.topSources.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 text-left">
                <tr>
                  <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Leads
                  </th>
                  <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Converted
                  </th>
                  <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Conversion Rate
                  </th>
                  <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Performance
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {data.topSources.map((source) => {
                  const rate = source.count > 0 ? Math.round((source.converted / source.count) * 100) : 0;
                  const avgRate = data.conversionRate;
                  const isAboveAvg = rate > avgRate;

                  return (
                    <tr key={source.source}>
                      <td className="px-4 py-4 font-medium text-neutral-900">{source.source}</td>
                      <td className="px-4 py-4 text-neutral-600">{source.count}</td>
                      <td className="px-4 py-4 text-neutral-600">{source.converted}</td>
                      <td className="px-4 py-4 font-medium text-neutral-900">{rate}%</td>
                      <td className="px-4 py-4">
                        <div className={`flex items-center gap-1 ${isAboveAvg ? 'text-secondary-600' : 'text-red-600'}`}>
                          {isAboveAvg ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                          <span className="text-sm font-medium">
                            {Math.abs(rate - avgRate)}% {isAboveAvg ? 'above' : 'below'} avg
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-neutral-500 text-center py-8">No source data available</p>
        )}
      </Card>

      {/* Trends Charts (Placeholder - would use Recharts in production) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Leads Over Time</h2>
          <div className="h-64 flex items-center justify-center bg-neutral-50 rounded-lg">
            {data.leadsOverTime.length > 0 ? (
              <div className="w-full h-full flex items-end justify-around px-4 pb-4 pt-8">
                {data.leadsOverTime.slice(-7).map((item, i) => {
                  const maxCount = Math.max(...data.leadsOverTime.map((d) => d.count));
                  const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                  return (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <div
                        className="w-8 bg-primary-500 rounded-t"
                        style={{ height: `${Math.max(height, 5)}%` }}
                      ></div>
                      <span className="text-xs text-neutral-500">
                        {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-neutral-400">No data available</p>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Revenue Over Time</h2>
          <div className="h-64 flex items-center justify-center bg-neutral-50 rounded-lg">
            {data.revenueOverTime.length > 0 ? (
              <div className="w-full h-full flex items-end justify-around px-4 pb-4 pt-8">
                {data.revenueOverTime.slice(-7).map((item, i) => {
                  const maxAmount = Math.max(...data.revenueOverTime.map((d) => d.amount));
                  const height = maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0;
                  return (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <div
                        className="w-8 bg-secondary-500 rounded-t"
                        style={{ height: `${Math.max(height, 5)}%` }}
                      ></div>
                      <span className="text-xs text-neutral-500">
                        {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-neutral-400">No data available</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
