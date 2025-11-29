'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import {
  Home,
  Calendar,
  FileText,
  CheckCircle,
  Circle,
  Clock,
  Download,
  Eye,
  DollarSign,
  MapPin,
  User,
} from 'lucide-react';

interface Milestone {
  id: string;
  name: string;
  description?: string;
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
  url?: string;
}

interface Transaction {
  id: string;
  propertyAddress: string;
  status: string;
  type: string;
  price: number;
  closingDate?: string;
  listingDate?: string;
  agent?: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  milestones?: Milestone[];
  documents?: Document[];
}

export default function PortalTransactionPage() {
  const { token } = useAuth();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'overview' | 'milestones' | 'documents'>('overview');

  useEffect(() => {
    fetchTransaction();
  }, [token]);

  const fetchTransaction = async () => {
    if (!token) return;

    try {
      const response = await apiClient.get<Transaction[]>('/api/transactions?limit=1', token);
      if (response.success && response.data && response.data.length > 0) {
        setTransaction(response.data[0]);
      }
    } catch (error) {
      console.error('Failed to fetch transaction:', error);
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getMilestoneProgress = () => {
    if (!transaction?.milestones || transaction.milestones.length === 0) return 0;
    const completed = transaction.milestones.filter((m) => m.completed).length;
    return Math.round((completed / transaction.milestones.length) * 100);
  };

  const getDocStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: 'success' | 'warning' | 'error' | 'info' | 'neutral'; label: string }> = {
      PENDING: { variant: 'warning', label: 'Pending Review' },
      APPROVED: { variant: 'success', label: 'Approved' },
      SIGNED: { variant: 'success', label: 'Signed' },
      REJECTED: { variant: 'error', label: 'Needs Attention' },
    };
    const statusInfo = statusMap[status] || { variant: 'neutral' as const, label: status };
    return <Badge variant={statusInfo.variant} size="sm">{statusInfo.label}</Badge>;
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
      <Card className="text-center py-12">
        <Home className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-neutral-900 mb-2">No Active Transaction</h2>
        <p className="text-neutral-500">
          Once your agent creates a transaction for you, all the details will appear here.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Property Header */}
      <Card className="bg-gradient-to-r from-primary-500 to-primary-600 text-white border-0">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Home className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{transaction.propertyAddress}</h1>
              <p className="text-primary-100 mt-1">{formatCurrency(transaction.price)}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-primary-200">Progress</p>
            <p className="text-3xl font-bold">{getMilestoneProgress()}%</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${getMilestoneProgress()}%` }}
            ></div>
          </div>
        </div>
      </Card>

      {/* Section Tabs */}
      <div className="flex gap-2 bg-neutral-100 p-1 rounded-lg">
        {[
          { id: 'overview' as const, label: 'Overview' },
          { id: 'milestones' as const, label: 'Milestones' },
          { id: 'documents' as const, label: 'Documents' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeSection === tab.id
                ? 'bg-white shadow-sm text-neutral-900'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Section */}
      {activeSection === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Transaction Details */}
          <Card>
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Transaction Details</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-neutral-100 rounded-lg">
                  <MapPin className="h-5 w-5 text-neutral-600" />
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Property Address</p>
                  <p className="font-medium text-neutral-900">{transaction.propertyAddress}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-neutral-100 rounded-lg">
                  <DollarSign className="h-5 w-5 text-neutral-600" />
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Purchase Price</p>
                  <p className="font-medium text-neutral-900">{formatCurrency(transaction.price)}</p>
                </div>
              </div>

              {transaction.closingDate && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-neutral-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-neutral-600" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Expected Closing</p>
                    <p className="font-medium text-neutral-900">{formatDate(transaction.closingDate)}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Your Agent */}
          {transaction.agent && (
            <Card>
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Your Agent</h2>
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-xl font-bold">
                  {transaction.agent.firstName[0]}{transaction.agent.lastName[0]}
                </div>
                <div>
                  <p className="font-semibold text-neutral-900">
                    {transaction.agent.firstName} {transaction.agent.lastName}
                  </p>
                  <p className="text-sm text-neutral-500">{transaction.agent.email}</p>
                  {transaction.agent.phone && (
                    <p className="text-sm text-neutral-500">{transaction.agent.phone}</p>
                  )}
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Button variant="secondary" size="sm" fullWidth>
                  Send Email
                </Button>
                <Button variant="secondary" size="sm" fullWidth>
                  Call
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Milestones Section */}
      {activeSection === 'milestones' && (
        <Card>
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Transaction Milestones</h2>
          {transaction.milestones && transaction.milestones.length > 0 ? (
            <div className="space-y-4">
              {transaction.milestones.map((milestone, index) => (
                <div
                  key={milestone.id}
                  className={`relative pl-8 pb-4 ${
                    index !== transaction.milestones!.length - 1 ? 'border-l-2 border-neutral-200 ml-2.5' : 'ml-2.5'
                  }`}
                >
                  <div
                    className={`absolute left-0 top-0 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center ${
                      milestone.completed ? 'bg-secondary-500' : 'bg-neutral-200'
                    }`}
                  >
                    {milestone.completed ? (
                      <CheckCircle className="h-4 w-4 text-white" />
                    ) : (
                      <Circle className="h-4 w-4 text-neutral-400" />
                    )}
                  </div>
                  <div className={`${milestone.completed ? 'opacity-75' : ''}`}>
                    <p className="font-medium text-neutral-900">{milestone.name}</p>
                    {milestone.description && (
                      <p className="text-sm text-neutral-500 mt-1">{milestone.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-neutral-500">
                      {milestone.dueDate && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Due: {formatDate(milestone.dueDate)}
                        </span>
                      )}
                      {milestone.completedAt && (
                        <span className="flex items-center gap-1 text-secondary-600">
                          <CheckCircle className="h-3 w-3" />
                          Completed: {formatDate(milestone.completedAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-neutral-500 text-center py-8">No milestones set up yet</p>
          )}
        </Card>
      )}

      {/* Documents Section */}
      {activeSection === 'documents' && (
        <Card>
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Documents</h2>
          {transaction.documents && transaction.documents.length > 0 ? (
            <div className="space-y-3">
              {transaction.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-neutral-400" />
                    <div>
                      <p className="font-medium text-neutral-900">{doc.name}</p>
                      <p className="text-xs text-neutral-500">
                        {doc.type} • Uploaded {formatDate(doc.uploadedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getDocStatusBadge(doc.status)}
                    <div className="flex gap-1">
                      <button className="p-2 text-neutral-400 hover:text-neutral-600 rounded-lg hover:bg-neutral-100">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-neutral-400 hover:text-neutral-600 rounded-lg hover:bg-neutral-100">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-neutral-500 text-center py-8">No documents uploaded yet</p>
          )}
        </Card>
      )}
    </div>
  );
}
