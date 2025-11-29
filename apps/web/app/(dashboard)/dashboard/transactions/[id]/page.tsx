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
  Home,
  User,
  DollarSign,
  Calendar,
  FileText,
  CheckCircle,
  Circle,
  Edit,
  Trash2,
  Clock,
  MapPin,
} from 'lucide-react';
import Link from 'next/link';

interface Milestone {
  id: string;
  name: string;
  dueDate?: string;
  completed: boolean;
  completedAt?: string;
}

interface Document {
  id: string;
  name: string;
  type: string;
  status: string;
  uploadedAt: string;
}

interface Transaction {
  id: string;
  propertyAddress: string;
  status: string;
  type: string;
  price: number;
  closingDate?: string;
  listingDate?: string;
  notes?: string;
  client?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  milestones?: Milestone[];
  documents?: Document[];
  createdAt: string;
}

const statusOptions = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'UNDER_CONTRACT', label: 'Under Contract' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'CLOSED', label: 'Closed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export default function TransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchTransaction();
  }, [params.id, token]);

  const fetchTransaction = async () => {
    if (!token || !params.id) return;

    try {
      const response = await apiClient.get<Transaction>(`/api/transactions/${params.id}`, token);
      if (response.success && response.data) {
        setTransaction(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch transaction:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!token || !transaction) return;
    if (!confirm('Are you sure you want to delete this transaction?')) return;

    setDeleting(true);
    try {
      await apiClient.delete(`/api/transactions/${transaction.id}`, token);
      router.push('/dashboard/transactions');
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      setDeleting(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!token || !transaction) return;

    try {
      const response = await apiClient.patch<Transaction>(
        `/api/transactions/${transaction.id}`,
        { status: newStatus },
        token
      );
      if (response.success && response.data) {
        setTransaction(response.data);
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleMilestoneToggle = async (milestoneId: string, completed: boolean) => {
    if (!token || !transaction) return;

    try {
      const response = await apiClient.patch<Transaction>(
        `/api/transactions/${transaction.id}/milestones/${milestoneId}`,
        { completed },
        token
      );
      if (response.success) {
        fetchTransaction();
      }
    } catch (error) {
      console.error('Failed to update milestone:', error);
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: 'success' | 'warning' | 'error' | 'info' | 'neutral'; label: string }> = {
      ACTIVE: { variant: 'info', label: 'Active' },
      UNDER_CONTRACT: { variant: 'warning', label: 'Under Contract' },
      PENDING: { variant: 'warning', label: 'Pending' },
      CLOSED: { variant: 'success', label: 'Closed' },
      CANCELLED: { variant: 'error', label: 'Cancelled' },
    };
    const statusInfo = statusMap[status] || { variant: 'neutral' as const, label: status };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const getDocStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: 'success' | 'warning' | 'error' | 'info' | 'neutral'; label: string }> = {
      PENDING: { variant: 'warning', label: 'Pending' },
      SIGNED: { variant: 'success', label: 'Signed' },
      APPROVED: { variant: 'success', label: 'Approved' },
      REJECTED: { variant: 'error', label: 'Rejected' },
    };
    const statusInfo = statusMap[status] || { variant: 'neutral' as const, label: status };
    return <Badge variant={statusInfo.variant} size="sm">{statusInfo.label}</Badge>;
  };

  const getMilestoneProgress = () => {
    if (!transaction?.milestones || transaction.milestones.length === 0) return 0;
    const completed = transaction.milestones.filter((m) => m.completed).length;
    return Math.round((completed / transaction.milestones.length) * 100);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-neutral-200 rounded w-48 animate-pulse"></div>
        <div className="h-64 bg-neutral-200 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-500 mb-4">Transaction not found</p>
        <Link href="/dashboard/transactions">
          <Button variant="secondary">Back to Transactions</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/transactions">
            <Button variant="ghost" size="sm" icon={ArrowLeft}>
              Back
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-neutral-900">{transaction.propertyAddress}</h1>
              {getStatusBadge(transaction.status)}
            </div>
            <p className="text-neutral-500 mt-1">
              {transaction.type === 'BUYER' ? 'Buyer' : transaction.type === 'SELLER' ? 'Seller' : 'Dual Agency'} Transaction
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link href={`/dashboard/transactions/${transaction.id}/edit`}>
            <Button variant="secondary" icon={Edit}>
              Edit
            </Button>
          </Link>
          <Button variant="danger" icon={Trash2} onClick={handleDelete} loading={deleting}>
            Delete
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <Card>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-neutral-700">Transaction Progress</span>
          <span className="text-sm text-neutral-500">{getMilestoneProgress()}% Complete</span>
        </div>
        <div className="h-3 bg-neutral-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-secondary-500 rounded-full transition-all duration-500"
            style={{ width: `${getMilestoneProgress()}%` }}
          ></div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Property Details */}
          <Card>
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Property Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-neutral-100 rounded-lg">
                  <MapPin className="h-5 w-5 text-neutral-600" />
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Address</p>
                  <p className="text-neutral-900">{transaction.propertyAddress}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-neutral-100 rounded-lg">
                  <DollarSign className="h-5 w-5 text-neutral-600" />
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Price</p>
                  <p className="text-neutral-900 font-semibold">{formatCurrency(transaction.price)}</p>
                </div>
              </div>
              {transaction.listingDate && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-neutral-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-neutral-600" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Listed</p>
                    <p className="text-neutral-900">{formatDate(transaction.listingDate)}</p>
                  </div>
                </div>
              )}
              {transaction.closingDate && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-neutral-100 rounded-lg">
                    <Clock className="h-5 w-5 text-neutral-600" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Closing Date</p>
                    <p className="text-neutral-900">{formatDate(transaction.closingDate)}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Client Info */}
          {transaction.client && (
            <Card>
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Client</h2>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-medium">
                  {transaction.client.firstName[0]}
                  {transaction.client.lastName[0]}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-neutral-900">
                    {transaction.client.firstName} {transaction.client.lastName}
                  </p>
                  <p className="text-sm text-neutral-500">{transaction.client.email}</p>
                  {transaction.client.phone && (
                    <p className="text-sm text-neutral-500">{transaction.client.phone}</p>
                  )}
                </div>
                <Link href={`/dashboard/leads/${transaction.client.id}`}>
                  <Button variant="secondary" size="sm">
                    View Profile
                  </Button>
                </Link>
              </div>
            </Card>
          )}

          {/* Milestones */}
          <Card>
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Milestones</h2>
            {transaction.milestones && transaction.milestones.length > 0 ? (
              <div className="space-y-3">
                {transaction.milestones.map((milestone) => (
                  <div
                    key={milestone.id}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      milestone.completed ? 'bg-secondary-50' : 'bg-neutral-50'
                    }`}
                  >
                    <button
                      onClick={() => handleMilestoneToggle(milestone.id, !milestone.completed)}
                      className="flex-shrink-0"
                    >
                      {milestone.completed ? (
                        <CheckCircle className="h-5 w-5 text-secondary-600" />
                      ) : (
                        <Circle className="h-5 w-5 text-neutral-400 hover:text-neutral-600" />
                      )}
                    </button>
                    <div className="flex-1">
                      <p
                        className={`font-medium ${
                          milestone.completed ? 'text-neutral-500 line-through' : 'text-neutral-900'
                        }`}
                      >
                        {milestone.name}
                      </p>
                      {milestone.dueDate && !milestone.completed && (
                        <p className="text-xs text-neutral-500">Due {formatDate(milestone.dueDate)}</p>
                      )}
                      {milestone.completedAt && (
                        <p className="text-xs text-secondary-600">
                          Completed {formatDate(milestone.completedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-neutral-500 text-center py-4">No milestones defined</p>
            )}
          </Card>

          {/* Documents */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-neutral-900">Documents</h2>
              <Button variant="secondary" size="sm" icon={FileText}>
                Upload
              </Button>
            </div>
            {transaction.documents && transaction.documents.length > 0 ? (
              <div className="space-y-2">
                {transaction.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-neutral-400" />
                      <div>
                        <p className="font-medium text-neutral-900">{doc.name}</p>
                        <p className="text-xs text-neutral-500">{doc.type}</p>
                      </div>
                    </div>
                    {getDocStatusBadge(doc.status)}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-neutral-500 text-center py-4">No documents uploaded</p>
            )}
          </Card>

          {/* Notes */}
          {transaction.notes && (
            <Card>
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Notes</h2>
              <p className="text-neutral-600 whitespace-pre-wrap">{transaction.notes}</p>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <Card>
            <h3 className="font-semibold text-neutral-900 mb-3">Update Status</h3>
            <div className="space-y-2">
              {statusOptions.map((status) => (
                <button
                  key={status.value}
                  onClick={() => handleStatusChange(status.value)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    transaction.status === status.value
                      ? 'bg-primary-100 text-primary-700 font-medium'
                      : 'hover:bg-neutral-100 text-neutral-600'
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </Card>

          {/* Quick Stats */}
          <Card>
            <h3 className="font-semibold text-neutral-900 mb-3">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-neutral-500">Days Active</span>
                <span className="font-medium text-neutral-900">
                  {Math.floor(
                    (Date.now() - new Date(transaction.createdAt).getTime()) / (1000 * 60 * 60 * 24)
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Milestones</span>
                <span className="font-medium text-neutral-900">
                  {transaction.milestones?.filter((m) => m.completed).length || 0}/
                  {transaction.milestones?.length || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Documents</span>
                <span className="font-medium text-neutral-900">
                  {transaction.documents?.length || 0}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
