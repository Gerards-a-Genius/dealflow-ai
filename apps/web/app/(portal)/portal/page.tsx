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
  MessageSquare,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

interface Transaction {
  id: string;
  propertyAddress: string;
  status: string;
  price: number;
  closingDate?: string;
  milestones?: {
    id: string;
    name: string;
    completed: boolean;
    dueDate?: string;
  }[];
}

interface Message {
  id: string;
  content: string;
  createdAt: string;
  isFromAgent: boolean;
}

export default function PortalOverviewPage() {
  const { token, user } = useAuth();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    if (!token) return;

    try {
      // Fetch client's transaction
      const transactionRes = await apiClient.get<Transaction[]>('/api/transactions?limit=1', token);
      if (transactionRes.success && transactionRes.data && transactionRes.data.length > 0) {
        setTransaction(transactionRes.data[0]);
      }

      // Fetch recent messages
      const messagesRes = await apiClient.get<Message[]>('/api/messages?limit=3', token);
      if (messagesRes.success && messagesRes.data) {
        setMessages(messagesRes.data);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
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

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      ACTIVE: 'Active',
      UNDER_CONTRACT: 'Under Contract',
      PENDING: 'Pending Close',
      CLOSED: 'Closed',
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-neutral-200 rounded w-48 animate-pulse"></div>
        <div className="h-64 bg-neutral-200 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-8 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.firstName}!</h1>
        <p className="text-primary-100">
          {transaction
            ? `Your transaction is ${getMilestoneProgress()}% complete.`
            : "We're working on finding you the perfect property."}
        </p>
      </div>

      {transaction ? (
        <>
          {/* Transaction Overview */}
          <Card>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary-100 rounded-lg">
                  <Home className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900">{transaction.propertyAddress}</h2>
                  <p className="text-neutral-500">{formatCurrency(transaction.price)}</p>
                </div>
              </div>
              <Badge variant="info" size="sm">
                {getStatusLabel(transaction.status)}
              </Badge>
            </div>

            {/* Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-neutral-700">Transaction Progress</span>
                <span className="text-sm font-bold text-primary-600">{getMilestoneProgress()}%</span>
              </div>
              <div className="h-3 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-secondary-500 to-secondary-400 rounded-full transition-all duration-500"
                  style={{ width: `${getMilestoneProgress()}%` }}
                ></div>
              </div>
            </div>

            {/* Closing Date */}
            {transaction.closingDate && (
              <div className="flex items-center gap-3 p-4 bg-accent-50 rounded-lg">
                <Calendar className="h-5 w-5 text-accent-600" />
                <div>
                  <p className="text-sm text-accent-600">Estimated Closing Date</p>
                  <p className="font-semibold text-neutral-900">{formatDate(transaction.closingDate)}</p>
                </div>
              </div>
            )}

            <div className="mt-4">
              <Link href="/portal/transaction">
                <Button variant="secondary" icon={ArrowRight} iconPosition="right">
                  View Full Details
                </Button>
              </Link>
            </div>
          </Card>

          {/* Milestones */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-900">Milestones</h3>
              <Link href="/portal/transaction" className="text-sm text-primary-500 hover:text-primary-600">
                View all
              </Link>
            </div>

            <div className="space-y-3">
              {transaction.milestones?.slice(0, 5).map((milestone) => (
                <div
                  key={milestone.id}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    milestone.completed ? 'bg-secondary-50' : 'bg-neutral-50'
                  }`}
                >
                  {milestone.completed ? (
                    <CheckCircle className="h-5 w-5 text-secondary-600 flex-shrink-0" />
                  ) : (
                    <Circle className="h-5 w-5 text-neutral-400 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p
                      className={`font-medium ${
                        milestone.completed ? 'text-neutral-500' : 'text-neutral-900'
                      }`}
                    >
                      {milestone.name}
                    </p>
                    {milestone.dueDate && !milestone.completed && (
                      <p className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3" />
                        Due {formatDate(milestone.dueDate)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      ) : (
        <Card className="text-center py-12">
          <Sparkles className="h-12 w-12 text-primary-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">No Active Transaction</h2>
          <p className="text-neutral-500 mb-6">
            Once your agent sets up a transaction, you&apos;ll be able to track its progress here.
          </p>
          <Link href="/portal/messages">
            <Button icon={MessageSquare}>Message Your Agent</Button>
          </Link>
        </Card>
      )}

      {/* Recent Messages */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-900">Recent Messages</h3>
          <Link href="/portal/messages" className="text-sm text-primary-500 hover:text-primary-600">
            View all
          </Link>
        </div>

        {messages.length > 0 ? (
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`p-3 rounded-lg ${message.isFromAgent ? 'bg-primary-50' : 'bg-neutral-50'}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-neutral-500">
                    {message.isFromAgent ? 'Your Agent' : 'You'}
                  </span>
                  <span className="text-xs text-neutral-400">
                    {formatDate(message.createdAt)}
                  </span>
                </div>
                <p className="text-neutral-700 text-sm">{message.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-neutral-500">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 text-neutral-300" />
            <p>No messages yet</p>
          </div>
        )}

        <div className="mt-4">
          <Link href="/portal/messages">
            <Button variant="secondary" icon={MessageSquare} fullWidth>
              Send a Message
            </Button>
          </Link>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/portal/transaction">
          <Card hover className="text-center cursor-pointer">
            <FileText className="h-8 w-8 text-primary-500 mx-auto mb-2" />
            <p className="font-medium text-neutral-900">View Documents</p>
            <p className="text-sm text-neutral-500">Access all your files</p>
          </Card>
        </Link>
        <Link href="/portal/messages">
          <Card hover className="text-center cursor-pointer">
            <MessageSquare className="h-8 w-8 text-secondary-500 mx-auto mb-2" />
            <p className="font-medium text-neutral-900">Contact Agent</p>
            <p className="text-sm text-neutral-500">Send a message</p>
          </Card>
        </Link>
        <Link href="/portal/profile">
          <Card hover className="text-center cursor-pointer">
            <Calendar className="h-8 w-8 text-accent-500 mx-auto mb-2" />
            <p className="font-medium text-neutral-900">My Profile</p>
            <p className="text-sm text-neutral-500">Update your info</p>
          </Card>
        </Link>
      </div>
    </div>
  );
}
