'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Star,
  Edit,
  Trash2,
  Send,
  Brain,
  Clock,
  DollarSign,
  Home,
  User,
  Activity,
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
  preApproved?: boolean;
  notes?: string;
  createdAt: string;
  lastContactedAt?: string;
  activities?: Activity[];
}

interface Activity {
  id: string;
  type: string;
  description: string;
  createdAt: string;
}

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchLead();
  }, [params.id, token]);

  const fetchLead = async () => {
    if (!token || !params.id) return;

    try {
      const response = await apiClient.get<Lead>(`/api/leads/${params.id}`, token);
      if (response.success && response.data) {
        setLead(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch lead:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!token || !lead) return;
    if (!confirm('Are you sure you want to delete this lead?')) return;

    setDeleting(true);
    try {
      await apiClient.delete(`/api/leads/${lead.id}`, token);
      router.push('/dashboard/leads');
    } catch (error) {
      console.error('Failed to delete lead:', error);
      setDeleting(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!token || !lead) return;

    try {
      const response = await apiClient.patch<Lead>(`/api/leads/${lead.id}`, { status: newStatus }, token);
      if (response.success && response.data) {
        setLead(response.data);
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
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
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-secondary-600 bg-secondary-100';
    if (score >= 50) return 'text-accent-600 bg-accent-100';
    return 'text-neutral-600 bg-neutral-100';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-neutral-200 rounded w-48 animate-pulse"></div>
        <div className="h-64 bg-neutral-200 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-500 mb-4">Lead not found</p>
        <Link href="/dashboard/leads">
          <Button variant="secondary">Back to Leads</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/leads">
            <Button variant="ghost" size="sm" icon={ArrowLeft}>
              Back
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-neutral-900">
                {lead.firstName} {lead.lastName}
              </h1>
              {getStatusBadge(lead.status)}
            </div>
            <p className="text-neutral-500 mt-1">Added {formatDate(lead.createdAt)}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link href={`/dashboard/ai?type=email&leadId=${lead.id}`}>
            <Button variant="secondary" icon={Brain}>
              AI Email
            </Button>
          </Link>
          <Link href={`/dashboard/leads/${lead.id}/edit`}>
            <Button variant="secondary" icon={Edit}>
              Edit
            </Button>
          </Link>
          <Button variant="danger" icon={Trash2} onClick={handleDelete} loading={deleting}>
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Card */}
          <Card>
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-neutral-100 rounded-lg">
                  <Mail className="h-5 w-5 text-neutral-600" />
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Email</p>
                  <a href={`mailto:${lead.email}`} className="text-neutral-900 hover:text-primary-500">
                    {lead.email}
                  </a>
                </div>
              </div>
              {lead.phone && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-neutral-100 rounded-lg">
                    <Phone className="h-5 w-5 text-neutral-600" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Phone</p>
                    <a href={`tel:${lead.phone}`} className="text-neutral-900 hover:text-primary-500">
                      {lead.phone}
                    </a>
                  </div>
                </div>
              )}
              {lead.source && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-neutral-100 rounded-lg">
                    <User className="h-5 w-5 text-neutral-600" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Source</p>
                    <p className="text-neutral-900">{lead.source}</p>
                  </div>
                </div>
              )}
              {lead.lastContactedAt && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-neutral-100 rounded-lg">
                    <Clock className="h-5 w-5 text-neutral-600" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Last Contacted</p>
                    <p className="text-neutral-900">{formatDate(lead.lastContactedAt)}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Property Interest */}
          <Card>
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Property Interest</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {lead.propertyInterest && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-neutral-100 rounded-lg">
                    <Home className="h-5 w-5 text-neutral-600" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Property Type</p>
                    <p className="text-neutral-900">{lead.propertyInterest}</p>
                  </div>
                </div>
              )}
              {lead.budget && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-neutral-100 rounded-lg">
                    <DollarSign className="h-5 w-5 text-neutral-600" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Budget</p>
                    <p className="text-neutral-900">{formatCurrency(lead.budget)}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-neutral-100 rounded-lg">
                  <Activity className="h-5 w-5 text-neutral-600" />
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Pre-Approved</p>
                  <p className="text-neutral-900">{lead.preApproved ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Notes */}
          {lead.notes && (
            <Card>
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Notes</h2>
              <p className="text-neutral-600 whitespace-pre-wrap">{lead.notes}</p>
            </Card>
          )}

          {/* Activity Timeline */}
          <Card>
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Activity</h2>
            {lead.activities && lead.activities.length > 0 ? (
              <div className="space-y-4">
                {lead.activities.map((activity) => (
                  <div key={activity.id} className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <Activity className="h-4 w-4 text-primary-600" />
                    </div>
                    <div className="flex-1 pb-4 border-b border-neutral-100 last:border-0">
                      <p className="text-neutral-900">{activity.description}</p>
                      <p className="text-xs text-neutral-500 mt-1">{formatDate(activity.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-neutral-500 text-center py-4">No activity recorded yet</p>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Score Card */}
          <Card>
            <div className="text-center">
              <p className="text-sm text-neutral-500 mb-2">Lead Score</p>
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${getScoreColor(lead.score)}`}>
                <span className="text-3xl font-bold">{lead.score}</span>
              </div>
              <p className="text-xs text-neutral-500 mt-2">
                {lead.score >= 80 ? 'Hot lead - prioritize!' : lead.score >= 50 ? 'Warm lead' : 'Needs nurturing'}
              </p>
            </div>
          </Card>

          {/* Status Actions */}
          <Card>
            <h3 className="font-semibold text-neutral-900 mb-3">Update Status</h3>
            <div className="space-y-2">
              {['NEW', 'CONTACTED', 'QUALIFIED', 'NURTURING', 'CONVERTED', 'LOST'].map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    lead.status === status
                      ? 'bg-primary-100 text-primary-700 font-medium'
                      : 'hover:bg-neutral-100 text-neutral-600'
                  }`}
                >
                  {status.charAt(0) + status.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card>
            <h3 className="font-semibold text-neutral-900 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <a
                href={`mailto:${lead.email}`}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-neutral-600 hover:bg-neutral-100 transition-colors"
              >
                <Mail className="h-4 w-4" />
                Send Email
              </a>
              {lead.phone && (
                <a
                  href={`tel:${lead.phone}`}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-neutral-600 hover:bg-neutral-100 transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  Call
                </a>
              )}
              <Link
                href={`/dashboard/showings/new?leadId=${lead.id}`}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-neutral-600 hover:bg-neutral-100 transition-colors"
              >
                <Calendar className="h-4 w-4" />
                Schedule Showing
              </Link>
              <Link
                href={`/dashboard/transactions/new?leadId=${lead.id}`}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-neutral-600 hover:bg-neutral-100 transition-colors"
              >
                <Send className="h-4 w-4" />
                Convert to Transaction
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
