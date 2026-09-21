import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, RotateCcw } from 'lucide-react';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  onReset?: () => void;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error internally for debugging without exposing raw stack trace to users
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  handleReload = (): void => {
    window.location.reload();
  };

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      const title = this.props.fallbackTitle || 'Something went wrong';
      const message =
        this.props.fallbackMessage ||
        'An unexpected error occurred while rendering this section. You can try refreshing the component or reloading the page.';

      return (
        <div className="flex-1 flex items-center justify-center p-6 min-h-[350px] animate-in fade-in duration-200">
          <div className="max-w-md w-full rounded-2xl bg-surface-container p-6 sm:p-8 border border-surface-container-highest/60 shadow-xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-error/10 border border-error/20 flex items-center justify-center mx-auto text-error shadow-sm">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg sm:text-xl font-bold text-on-surface">
                {title}
              </h3>
              <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                {message}
              </p>
            </div>

            {/* Action Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-medium text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Page</span>
              </button>

              <button
                type="button"
                onClick={this.handleReset}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-surface-container-highest hover:bg-surface-bright text-on-surface font-medium text-xs sm:text-sm transition-colors border border-surface-container-highest flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Try Again</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
