'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Plus, LayoutGrid, List, DollarSign, Calendar, User, Home } from 'lucide-react';
import Link from 'next/link';

interface Transaction {
  id: string;
  propertyAddress: string;
  status: string;
  type: string;
  price: number;
  closingDate?: string;
  client?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  milestones?: {
    id: string;
    name: string;
    completed: boolean;
  }[];
  createdAt: string;
}

const statusColumns = [
  { id: 'ACTIVE', label: 'Active', color: 'bg-blue-500' },
  { id: 'UNDER_CONTRACT', label: 'Under Contract', color: 'bg-accent-500' },
  { id: 'PENDING', label: 'Pending', color: 'bg-purple-500' },
  { id: 'CLOSED', label: 'Closed', color: 'bg-secondary-500' },
];

export default function TransactionsPage() {
  const { token } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  useEffect(() => {
    fetchTransactions();
  }, [token]);

  const fetchTransactions = async () => {
    if (!token) return;

    try {
      const response = await apiClient.get<Transaction[]>('/api/transactions', token);
      if (response.success && response.data) {
        setTransactions(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (transactionId: string, newStatus: string) => {
    if (!token) return;

    try {
      const response = await apiClient.patch<Transaction>(
        `/api/transactions/${transactionId}`,
        { status: newStatus },
        token
      );
      if (response.success) {
        fetchTransactions();
      }
    } catch (error) {
      console.error('Failed to update transaction:', error);
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
      month: 'short',
      day: 'numeric',
    });
  };

  const getTransactionsByStatus = (status: string) => {
    return transactions.filter((t) => t.status === status);
  };

  const getMilestoneProgress = (transaction: Transaction) => {
    if (!transaction.milestones || transaction.milestones.length === 0) return 0;
    const completed = transaction.milestones.filter((m) => m.completed).length;
    return Math.round((completed / transaction.milestones.length) * 100);
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      BUYER: 'Buyer',
      SELLER: 'Seller',
      DUAL: 'Dual Agency',
    };
    return types[type] || type;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-neutral-200 rounded w-48 animate-pulse"></div>
        <div className="flex gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-1 h-96 bg-neutral-200 rounded-lg animate-pulse"></div>
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
          <h1 className="text-2xl font-bold text-neutral-900">Transactions</h1>
          <p className="text-neutral-500 mt-1">{transactions.length} total transactions</p>
        </div>
        <div className="flex gap-3">
          {/* View Toggle */}
          <div className="flex bg-neutral-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'kanban' ? 'bg-white shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-white shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          <Link href="/dashboard/transactions/new">
            <Button icon={Plus}>New Transaction</Button>
          </Link>
        </div>
      </div>

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {statusColumns.map((column) => {
            const columnTransactions = getTransactionsByStatus(column.id);
            const totalValue = columnTransactions.reduce((sum, t) => sum + t.price, 0);

            return (
              <div key={column.id} className="flex-shrink-0 w-80">
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${column.color}`}></div>
                    <h3 className="font-semibold text-neutral-900">{column.label}</h3>
                    <span className="text-sm text-neutral-500">({columnTransactions.length})</span>
                  </div>
                  <span className="text-xs text-neutral-500">{formatCurrency(totalValue)}</span>
                </div>

                {/* Column Content */}
                <div className="space-y-3 min-h-[400px] bg-neutral-100 rounded-lg p-3">
                  {columnTransactions.length > 0 ? (
                    columnTransactions.map((transaction) => (
                      <Link key={transaction.id} href={`/dashboard/transactions/${transaction.id}`}>
                        <Card hover className="cursor-pointer">
                          <div className="space-y-3">
                            {/* Property */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start gap-2">
                                <Home className="h-4 w-4 text-neutral-400 mt-0.5 flex-shrink-0" />
                                <p className="font-medium text-neutral-900 text-sm line-clamp-2">
                                  {transaction.propertyAddress}
                                </p>
                              </div>
                              <Badge variant="neutral" size="sm">
                                {getTypeLabel(transaction.type)}
                              </Badge>
                            </div>

                            {/* Client */}
                            {transaction.client && (
                              <div className="flex items-center gap-2 text-sm text-neutral-600">
                                <User className="h-3.5 w-3.5" />
                                {transaction.client.firstName} {transaction.client.lastName}
                              </div>
                            )}

                            {/* Price & Date */}
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-1 text-neutral-900 font-medium">
                                <DollarSign className="h-3.5 w-3.5" />
                                {formatCurrency(transaction.price)}
                              </div>
                              {transaction.closingDate && (
                                <div className="flex items-center gap-1 text-neutral-500">
                                  <Calendar className="h-3.5 w-3.5" />
                                  {formatDate(transaction.closingDate)}
                                </div>
                              )}
                            </div>

                            {/* Progress */}
                            {transaction.milestones && transaction.milestones.length > 0 && (
                              <div>
                                <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
                                  <span>Progress</span>
                                  <span>{getMilestoneProgress(transaction)}%</span>
                                </div>
                                <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-secondary-500 rounded-full transition-all"
                                    style={{ width: `${getMilestoneProgress(transaction)}%` }}
                                  ></div>
                                </div>
                              </div>
                            )}
                          </div>
                        </Card>
                      </Link>
                    ))
                  ) : (
                    <div className="h-32 flex items-center justify-center text-neutral-400 text-sm">
                      No transactions
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 text-left">
                <tr>
                  <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Property</th>
                  <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Client</th>
                  <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Price</th>
                  <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Progress</th>
                  <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Closing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {transactions.length > 0 ? (
                  transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-neutral-50">
                      <td className="px-4 py-4">
                        <Link
                          href={`/dashboard/transactions/${transaction.id}`}
                          className="font-medium text-neutral-900 hover:text-primary-500"
                        >
                          {transaction.propertyAddress}
                        </Link>
                      </td>
                      <td className="px-4 py-4 text-neutral-600">
                        {transaction.client
                          ? `${transaction.client.firstName} ${transaction.client.lastName}`
                          : '-'}
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant="neutral" size="sm">
                          {getTypeLabel(transaction.type)}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 font-medium text-neutral-900">
                        {formatCurrency(transaction.price)}
                      </td>
                      <td className="px-4 py-4">
                        <select
                          value={transaction.status}
                          onChange={(e) => handleStatusChange(transaction.id, e.target.value)}
                          className="text-sm border-0 bg-transparent focus:ring-0 cursor-pointer"
                        >
                          {statusColumns.map((col) => (
                            <option key={col.id} value={col.id}>
                              {col.label}
                            </option>
                          ))}
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-secondary-500 rounded-full"
                              style={{ width: `${getMilestoneProgress(transaction)}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-neutral-500">
                            {getMilestoneProgress(transaction)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-neutral-500">
                        {transaction.closingDate ? formatDate(transaction.closingDate) : 'TBD'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-neutral-500">
                      No transactions yet.{' '}
                      <Link href="/dashboard/transactions/new" className="text-primary-500 hover:text-primary-600">
                        Create your first transaction
                      </Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
