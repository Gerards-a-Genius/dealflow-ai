'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import MetricCard from '@/components/ui/MetricCard';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import {
  Users,
  FileText,
  DollarSign,
  TrendingUp,
  Plus,
  ArrowRight,
  Calendar,
  Clock,
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalLeads: number;
  activeTransactions: number;
  totalRevenue: number;
  conversionRate: number;
  leadsTrend: number;
  transactionsTrend: number;
  revenueTrend: number;
  conversionTrend: number;
}

interface RecentLead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  score: number;
  createdAt: string;
}

interface RecentTransaction {
  id: string;
  propertyAddress: string;
  status: string;
  price: number;
  clientName: string;
  closingDate?: string;
}

interface UpcomingShowing {
  id: string;
  propertyAddress: string;
  scheduledAt: string;
  leadName: string;
}

export default function DashboardPage() {
  const { token } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentLeads, setRecentLeads] = useState<RecentLead[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [upcomingShowings, setUpcomingShowings] = useState<UpcomingShowing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) return;

      try {
        const [analyticsRes, leadsRes, transactionsRes, showingsRes] = await Promise.all([
          apiClient.get<any>('/api/analytics/dashboard', token),
          apiClient.get<any>('/api/leads?limit=5', token),
          apiClient.get<any>('/api/transactions?limit=5', token),
          apiClient.get<any>('/api/showings?limit=3&upcoming=true', token),
        ]);

        if (analyticsRes.success && analyticsRes.data) {
          const data = analyticsRes.data;
          setStats({
            totalLeads: data.totalLeads || 0,
            activeTransactions: data.activeTransactions || 0,
            totalRevenue: data.totalRevenue || 0,
            conversionRate: data.conversionRate || 0,
            leadsTrend: data.leadsTrend || 0,
            transactionsTrend: data.transactionsTrend || 0,
            revenueTrend: data.revenueTrend || 0,
            conversionTrend: data.conversionTrend || 0,
          });
        }

        if (leadsRes.success && leadsRes.data) {
          setRecentLeads(leadsRes.data);
        }

        if (transactionsRes.success && transactionsRes.data) {
          setRecentTransactions(transactionsRes.data);
        }

        if (showingsRes.success && showingsRes.data) {
          setUpcomingShowings(showingsRes.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: 'success' | 'warning' | 'error' | 'info' | 'neutral'; label: string }> = {
      NEW: { variant: 'info', label: 'New' },
      CONTACTED: { variant: 'neutral', label: 'Contacted' },
      QUALIFIED: { variant: 'success', label: 'Qualified' },
      NURTURING: { variant: 'warning', label: 'Nurturing' },
      CONVERTED: { variant: 'success', label: 'Converted' },
      LOST: { variant: 'error', label: 'Lost' },
      ACTIVE: { variant: 'info', label: 'Active' },
      UNDER_CONTRACT: { variant: 'warning', label: 'Under Contract' },
      PENDING: { variant: 'warning', label: 'Pending' },
      CLOSED: { variant: 'success', label: 'Closed' },
      CANCELLED: { variant: 'error', label: 'Cancelled' },
    };
    const statusInfo = statusMap[status] || { variant: 'neutral' as const, label: status };
    return <Badge variant={statusInfo.variant} size="sm">{statusInfo.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-neutral-200 rounded w-48 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-neutral-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
          <p className="text-neutral-500 mt-1">Welcome back! Here&apos;s your overview.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/leads/new">
            <Button icon={Plus} size="md">
              Add Lead
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          label="Total Leads"
          value={stats?.totalLeads || 0}
          icon={Users}
          variant="primary"
          trend={stats?.leadsTrend ? { value: stats.leadsTrend, direction: stats.leadsTrend >= 0 ? 'up' : 'down' } : undefined}
        />
        <MetricCard
          label="Active Transactions"
          value={stats?.activeTransactions || 0}
          icon={FileText}
          variant="secondary"
          trend={stats?.transactionsTrend ? { value: stats.transactionsTrend, direction: stats.transactionsTrend >= 0 ? 'up' : 'down' } : undefined}
        />
        <MetricCard
          label="Total Revenue"
          value={formatCurrency(stats?.totalRevenue || 0)}
          icon={DollarSign}
          variant="accent"
          trend={stats?.revenueTrend ? { value: stats.revenueTrend, direction: stats.revenueTrend >= 0 ? 'up' : 'down' } : undefined}
        />
        <MetricCard
          label="Conversion Rate"
          value={`${stats?.conversionRate || 0}%`}
          icon={TrendingUp}
          variant="default"
          trend={stats?.conversionTrend ? { value: stats.conversionTrend, direction: stats.conversionTrend >= 0 ? 'up' : 'down' } : undefined}
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Leads */}
        <Card padding="none" className="lg:col-span-2">
          <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-900">Recent Leads</h2>
            <Link href="/dashboard/leads" className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="divide-y divide-neutral-100">
            {recentLeads.length > 0 ? (
              recentLeads.map((lead) => (
                <Link
                  key={lead.id}
                  href={`/dashboard/leads/${lead.id}`}
                  className="flex items-center justify-between p-4 hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-medium">
                      {lead.firstName[0]}{lead.lastName[0]}
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900">{lead.firstName} {lead.lastName}</p>
                      <p className="text-sm text-neutral-500">{lead.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm text-neutral-500">Score</p>
                      <p className="font-semibold text-neutral-900">{lead.score}</p>
                    </div>
                    {getStatusBadge(lead.status)}
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-8 text-center text-neutral-500">
                <Users className="h-8 w-8 mx-auto mb-2 text-neutral-300" />
                <p>No leads yet</p>
                <Link href="/dashboard/leads/new" className="text-primary-500 hover:text-primary-600 text-sm">
                  Add your first lead
                </Link>
              </div>
            )}
          </div>
        </Card>

        {/* Upcoming Showings */}
        <Card padding="none">
          <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-900">Upcoming Showings</h2>
            <Link href="/dashboard/showings" className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="divide-y divide-neutral-100">
            {upcomingShowings.length > 0 ? (
              upcomingShowings.map((showing) => (
                <div key={showing.id} className="p-4">
                  <p className="font-medium text-neutral-900 mb-1">{showing.propertyAddress}</p>
                  <p className="text-sm text-neutral-500 mb-2">{showing.leadName}</p>
                  <div className="flex items-center gap-2 text-sm text-neutral-500">
                    <Calendar className="h-4 w-4" />
                    {formatDateTime(showing.scheduledAt)}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-neutral-500">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-neutral-300" />
                <p>No upcoming showings</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card padding="none">
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900">Active Transactions</h2>
          <Link href="/dashboard/transactions" className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 text-left">
              <tr>
                <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Property</th>
                <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Client</th>
                <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Price</th>
                <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Closing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-4">
                      <Link href={`/dashboard/transactions/${transaction.id}`} className="font-medium text-neutral-900 hover:text-primary-500">
                        {transaction.propertyAddress}
                      </Link>
                    </td>
                    <td className="px-4 py-4 text-neutral-600">{transaction.clientName}</td>
                    <td className="px-4 py-4 font-medium text-neutral-900">{formatCurrency(transaction.price)}</td>
                    <td className="px-4 py-4">{getStatusBadge(transaction.status)}</td>
                    <td className="px-4 py-4 text-neutral-500">
                      {transaction.closingDate ? (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatDate(transaction.closingDate)}
                        </div>
                      ) : (
                        <span className="text-neutral-400">TBD</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-neutral-500">
                    <FileText className="h-8 w-8 mx-auto mb-2 text-neutral-300" />
                    <p>No active transactions</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
