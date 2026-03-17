import { Component, type ErrorInfo, type ReactNode } from 'react';

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Keep this in console for early production debugging until remote logging is wired.
    console.error('Unhandled UI error', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="flex min-h-screen items-center justify-center px-4">
          <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-8 text-center">
            <p className="text-sm font-medium text-primary">Unexpected Error</p>
            <h1 className="mt-2 text-2xl font-semibold">The page crashed.</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Refresh the page or return home. If this keeps happening, contact support.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <a
                href="/"
                className="inline-flex h-10 items-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground"
              >
                Go Home
              </a>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex h-10 items-center rounded-xl border border-border px-4 text-sm font-medium"
              >
                Reload
              </button>
            </div>
          </div>
        </section>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
