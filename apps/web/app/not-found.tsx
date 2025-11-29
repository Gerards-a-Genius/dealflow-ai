'use client';

import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="text-9xl font-bold text-neutral-200">404</div>
        </div>

        <h1 className="text-2xl font-bold text-neutral-900 mb-3">Page not found</h1>
        <p className="text-neutral-600 mb-8">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved or doesn&apos;t exist.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 border-2 border-neutral-300 text-neutral-700 rounded-lg font-medium hover:bg-neutral-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </div>

        <div className="mt-12 pt-8 border-t border-neutral-200">
          <p className="text-sm text-neutral-500 mb-4">Looking for something specific?</p>
          <div className="flex gap-4 justify-center text-sm">
            <Link href="/dashboard" className="text-primary-500 hover:text-primary-600">
              Dashboard
            </Link>
            <Link href="/dashboard/leads" className="text-primary-500 hover:text-primary-600">
              Leads
            </Link>
            <Link href="/dashboard/transactions" className="text-primary-500 hover:text-primary-600">
              Transactions
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
