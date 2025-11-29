'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Plus, Calendar, Clock, MapPin, User, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface Showing {
  id: string;
  propertyAddress: string;
  scheduledAt: string;
  status: string;
  notes?: string;
  feedback?: string;
  lead?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

export default function ShowingsPage() {
  const { token } = useAuth();
  const [showings, setShowings] = useState<Showing[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'list' | 'calendar'>('list');

  useEffect(() => {
    fetchShowings();
  }, [token]);

  const fetchShowings = async () => {
    if (!token) return;

    try {
      const response = await apiClient.get<Showing[]>('/api/showings', token);
      if (response.success && response.data) {
        setShowings(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch showings:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: 'success' | 'warning' | 'error' | 'info' | 'neutral'; label: string }> = {
      SCHEDULED: { variant: 'info', label: 'Scheduled' },
      COMPLETED: { variant: 'success', label: 'Completed' },
      CANCELLED: { variant: 'error', label: 'Cancelled' },
      NO_SHOW: { variant: 'warning', label: 'No Show' },
    };
    const statusInfo = statusMap[status] || { variant: 'neutral' as const, label: status };
    return <Badge variant={statusInfo.variant} size="sm">{statusInfo.label}</Badge>;
  };

  const upcomingShowings = showings
    .filter((s) => new Date(s.scheduledAt) >= new Date() && s.status === 'SCHEDULED')
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

  const pastShowings = showings
    .filter((s) => new Date(s.scheduledAt) < new Date() || s.status !== 'SCHEDULED')
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-neutral-200 rounded w-32 animate-pulse"></div>
        <div className="h-64 bg-neutral-200 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Showings</h1>
          <p className="text-neutral-500 mt-1">
            {upcomingShowings.length} upcoming, {pastShowings.length} past
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-neutral-100 rounded-lg p-1">
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                view === 'list' ? 'bg-white shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                view === 'calendar' ? 'bg-white shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              Calendar
            </button>
          </div>
          <Link href="/dashboard/showings/new">
            <Button icon={Plus}>Schedule Showing</Button>
          </Link>
        </div>
      </div>

      {view === 'list' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming */}
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Upcoming</h2>
            <div className="space-y-3">
              {upcomingShowings.length > 0 ? (
                upcomingShowings.map((showing) => (
                  <Card key={showing.id} hover className="cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-neutral-400 mt-0.5" />
                          <p className="font-medium text-neutral-900">{showing.propertyAddress}</p>
                        </div>
                        {showing.lead && (
                          <div className="flex items-center gap-2 text-sm text-neutral-600">
                            <User className="h-4 w-4" />
                            {showing.lead.firstName} {showing.lead.lastName}
                          </div>
                        )}
                        <div className="flex items-center gap-4 text-sm text-neutral-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(showing.scheduledAt)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formatTime(showing.scheduledAt)}
                          </div>
                        </div>
                      </div>
                      {getStatusBadge(showing.status)}
                    </div>
                  </Card>
                ))
              ) : (
                <Card>
                  <div className="text-center py-8 text-neutral-500">
                    <Calendar className="h-8 w-8 mx-auto mb-2 text-neutral-300" />
                    <p>No upcoming showings</p>
                    <Link href="/dashboard/showings/new" className="text-primary-500 hover:text-primary-600 text-sm">
                      Schedule one now
                    </Link>
                  </div>
                </Card>
              )}
            </div>
          </div>

          {/* Past */}
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Past Showings</h2>
            <div className="space-y-3">
              {pastShowings.length > 0 ? (
                pastShowings.slice(0, 10).map((showing) => (
                  <Card key={showing.id} className="opacity-75">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-neutral-400 mt-0.5" />
                          <p className="font-medium text-neutral-900">{showing.propertyAddress}</p>
                        </div>
                        {showing.lead && (
                          <div className="flex items-center gap-2 text-sm text-neutral-600">
                            <User className="h-4 w-4" />
                            {showing.lead.firstName} {showing.lead.lastName}
                          </div>
                        )}
                        <div className="flex items-center gap-4 text-sm text-neutral-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(showing.scheduledAt)}
                          </div>
                        </div>
                        {showing.feedback && (
                          <p className="text-sm text-neutral-600 italic">&quot;{showing.feedback}&quot;</p>
                        )}
                      </div>
                      {getStatusBadge(showing.status)}
                    </div>
                  </Card>
                ))
              ) : (
                <Card>
                  <div className="text-center py-8 text-neutral-500">
                    <p>No past showings</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Calendar View */
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-neutral-900">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
                className="p-2 hover:bg-neutral-100 rounded-lg"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1 text-sm hover:bg-neutral-100 rounded-lg"
              >
                Today
              </button>
              <button
                onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
                className="p-2 hover:bg-neutral-100 rounded-lg"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Simple calendar grid placeholder */}
          <div className="grid grid-cols-7 gap-px bg-neutral-200 rounded-lg overflow-hidden">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="bg-neutral-50 p-2 text-center text-xs font-medium text-neutral-500">
                {day}
              </div>
            ))}
            {Array.from({ length: 35 }, (_, i) => {
              const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
              const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
              const day = i - firstDay + 1;
              const isValidDay = day > 0 && day <= daysInMonth;
              const dateStr = isValidDay
                ? new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString()
                : '';
              const dayShowings = showings.filter(
                (s) => new Date(s.scheduledAt).toDateString() === dateStr
              );
              const isToday = isValidDay && dateStr === new Date().toDateString();

              return (
                <div
                  key={i}
                  className={`bg-white p-2 min-h-[80px] ${isValidDay ? '' : 'bg-neutral-50'}`}
                >
                  {isValidDay && (
                    <>
                      <span
                        className={`text-sm ${
                          isToday
                            ? 'bg-primary-500 text-white w-6 h-6 rounded-full flex items-center justify-center'
                            : 'text-neutral-900'
                        }`}
                      >
                        {day}
                      </span>
                      <div className="mt-1 space-y-1">
                        {dayShowings.slice(0, 2).map((showing) => (
                          <div
                            key={showing.id}
                            className="text-xs p-1 bg-primary-100 text-primary-700 rounded truncate"
                          >
                            {formatTime(showing.scheduledAt)}
                          </div>
                        ))}
                        {dayShowings.length > 2 && (
                          <div className="text-xs text-neutral-500">+{dayShowings.length - 2} more</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
