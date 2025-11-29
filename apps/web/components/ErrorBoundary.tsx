'use client';

import React, { Component, ReactNode } from 'react';
import Button from './ui/Button';
import Card from './ui/Card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <Card className="max-w-md text-center">
            <div className="p-2">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
              <h2 className="text-xl font-semibold text-neutral-900 mb-2">Something went wrong</h2>
              <p className="text-neutral-600 mb-6">
                We encountered an unexpected error. Please try refreshing the page or go back to the dashboard.
              </p>
              {this.state.error && (
                <details className="mb-6 text-left">
                  <summary className="text-sm text-neutral-500 cursor-pointer hover:text-neutral-700">
                    Technical details
                  </summary>
                  <pre className="mt-2 p-3 bg-neutral-100 rounded text-xs text-neutral-600 overflow-auto max-h-32">
                    {this.state.error.message}
                  </pre>
                </details>
              )}
              <div className="flex gap-3 justify-center">
                <Button variant="secondary" icon={RefreshCw} onClick={this.handleReset}>
                  Try Again
                </Button>
                <Link href="/dashboard">
                  <Button icon={Home}>Go to Dashboard</Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional wrapper for easier use
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}
