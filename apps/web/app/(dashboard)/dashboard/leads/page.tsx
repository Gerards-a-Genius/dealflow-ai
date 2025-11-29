'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import {
  Plus,
  Search,
  Filter,
  ChevronDown,
  MoreVertical,
  Mail,
  Phone,
  Star,
  ArrowUpDown,
} from 'lucide-react';
import Link from 'next/link';

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status: string;
  score: number;
  source?: string;
  propertyInterest?: string;
  budget?: number;
  createdAt: string;
  lastContactedAt?: string;
}

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'NEW', label: 'New' },
  { value: 'CONTACTED', label: 'Contacted' },
  { value: 'QUALIFIED', label: 'Qualified' },
  { value: 'NURTURING', label: 'Nurturing' },
  { value: 'CONVERTED', label: 'Converted' },
  { value: 'LOST', label: 'Lost' },
];

const sourceOptions = [
  { value: '', label: 'All Sources' },
  { value: 'WEBSITE', label: 'Website' },
  { value: 'REFERRAL', label: 'Referral' },
  { value: 'ZILLOW', label: 'Zillow' },
  { value: 'REALTOR', label: 'Realtor.com' },
  { value: 'SOCIAL', label: 'Social Media' },
  { value: 'OTHER', label: 'Other' },
];

export default function LeadsPage() {
  const { token } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, [token, statusFilter, sourceFilter, sortBy, sortOrder]);

  const fetchLeads = async () => {
    if (!token) return;

    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (sourceFilter) params.append('source', sourceFilter);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);

      const response = await apiClient.get<Lead[]>(`/api/leads?${params.toString()}`, token);
      if (response.success && response.data) {
        setLeads(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLeads = leads.filter((lead) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      lead.firstName.toLowerCase().includes(query) ||
      lead.lastName.toLowerCase().includes(query) ||
      lead.email.toLowerCase().includes(query) ||
      (lead.phone && lead.phone.includes(query))
    );
  });

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: 'success' | 'warning' | 'error' | 'info' | 'neutral'; label: string }> = {
      NEW: { variant: 'info', label: 'New' },
      CONTACTED: { variant: 'neutral', label: 'Contacted' },
      QUALIFIED: { variant: 'success', label: 'Qualified' },
      NURTURING: { variant: 'warning', label: 'Nurturing' },
      CONVERTED: { variant: 'success', label: 'Converted' },
      LOST: { variant: 'error', label: 'Lost' },
    };
    const statusInfo = statusMap[status] || { variant: 'neutral' as const, label: status };
    return <Badge variant={statusInfo.variant} size="sm">{statusInfo.label}</Badge>;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-secondary-600';
    if (score >= 50) return 'text-accent-600';
    return 'text-neutral-500';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-neutral-200 rounded w-32 animate-pulse"></div>
        <div className="h-96 bg-neutral-200 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Leads</h1>
          <p className="text-neutral-500 mt-1">{filteredLeads.length} total leads</p>
        </div>
        <Link href="/dashboard/leads/new">
          <Button icon={Plus}>Add Lead</Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <Card padding="md">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <Input
              placeholder="Search by name, email, or phone..."
              leftIcon={Search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter Toggle */}
          <Button
            variant="secondary"
            icon={Filter}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
            <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </Button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-neutral-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-base"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Source</label>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="input-base"
              >
                {sourceOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-base"
              >
                <option value="createdAt">Date Added</option>
                <option value="score">Score</option>
                <option value="lastName">Name</option>
                <option value="lastContactedAt">Last Contact</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Order</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="input-base"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
        )}
      </Card>

      {/* Leads Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 text-left">
              <tr>
                <th className="px-4 py-3">
                  <button
                    onClick={() => handleSort('lastName')}
                    className="flex items-center gap-1 text-xs font-medium text-neutral-500 uppercase tracking-wider hover:text-neutral-700"
                  >
                    Lead
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Contact</th>
                <th className="px-4 py-3">
                  <button
                    onClick={() => handleSort('score')}
                    className="flex items-center gap-1 text-xs font-medium text-neutral-500 uppercase tracking-wider hover:text-neutral-700"
                  >
                    Score
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Budget</th>
                <th className="px-4 py-3">
                  <button
                    onClick={() => handleSort('createdAt')}
                    className="flex items-center gap-1 text-xs font-medium text-neutral-500 uppercase tracking-wider hover:text-neutral-700"
                  >
                    Added
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredLeads.length > 0 ? (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-4">
                      <Link href={`/dashboard/leads/${lead.id}`} className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-medium flex-shrink-0">
                          {lead.firstName[0]}{lead.lastName[0]}
                        </div>
                        <div>
                          <p className="font-medium text-neutral-900 hover:text-primary-500">
                            {lead.firstName} {lead.lastName}
                          </p>
                          {lead.source && (
                            <p className="text-xs text-neutral-500">{lead.source}</p>
                          )}
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        <a href={`mailto:${lead.email}`} className="flex items-center gap-2 text-sm text-neutral-600 hover:text-primary-500">
                          <Mail className="h-4 w-4" />
                          {lead.email}
                        </a>
                        {lead.phone && (
                          <a href={`tel:${lead.phone}`} className="flex items-center gap-2 text-sm text-neutral-600 hover:text-primary-500">
                            <Phone className="h-4 w-4" />
                            {lead.phone}
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <Star className={`h-4 w-4 ${getScoreColor(lead.score)}`} />
                        <span className={`font-semibold ${getScoreColor(lead.score)}`}>{lead.score}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">{getStatusBadge(lead.status)}</td>
                    <td className="px-4 py-4 text-neutral-600">
                      {lead.budget ? formatCurrency(lead.budget) : '-'}
                    </td>
                    <td className="px-4 py-4 text-sm text-neutral-500">{formatDate(lead.createdAt)}</td>
                    <td className="px-4 py-4">
                      <button className="p-2 text-neutral-400 hover:text-neutral-600 rounded-lg hover:bg-neutral-100">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-neutral-500">
                    {searchQuery || statusFilter || sourceFilter ? (
                      <>
                        <p className="mb-2">No leads match your filters</p>
                        <button
                          onClick={() => {
                            setSearchQuery('');
                            setStatusFilter('');
                            setSourceFilter('');
                          }}
                          className="text-primary-500 hover:text-primary-600"
                        >
                          Clear filters
                        </button>
                      </>
                    ) : (
                      <>
                        <p className="mb-2">No leads yet</p>
                        <Link href="/dashboard/leads/new" className="text-primary-500 hover:text-primary-600">
                          Add your first lead
                        </Link>
                      </>
                    )}
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
