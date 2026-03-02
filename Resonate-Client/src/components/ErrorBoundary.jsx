import React from 'react';

/**
 * Error Boundary component that catches JavaScript errors in child components.
 * Prevents the entire app from crashing and displays a fallback UI.
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render shows the fallback UI
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log the error to an error reporting service
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({ error, errorInfo });

        // You could also log to an external service here
        // logErrorToService(error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
                    <div className="max-w-md w-full text-center">
                        {/* Error icon */}
                        <div className="mx-auto w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
                            <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>

                        <h1 className="text-2xl font-bold text-slate-50 mb-2">
                            Oops! Something went wrong
                        </h1>

                        <p className="text-slate-400 mb-6">
                            We're sorry, but something unexpected happened. Please try again or refresh the page.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={this.handleRetry}
                                className="px-6 py-3 bg-gradient-to-r from-primary to-emerald-500 text-slate-950 
                         font-bold rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all"
                            >
                                Try Again
                            </button>

                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-3 bg-slate-800 text-slate-300 font-semibold rounded-xl 
                         hover:bg-slate-700 transition-all"
                            >
                                Refresh Page
                            </button>
                        </div>

                        {/* Show error details in development */}
                        {import.meta.env.DEV && this.state.error && (
                            <details className="mt-8 text-left bg-slate-900 rounded-xl p-4 border border-slate-800">
                                <summary className="text-red-400 cursor-pointer font-medium mb-2">
                                    Error Details (Dev Only)
                                </summary>
                                <pre className="text-xs text-slate-400 overflow-auto max-h-40">
                                    {this.state.error.toString()}
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;


/**
 * Hook-based error boundary wrapper for functional components.
 * Usage: <ErrorBoundaryWrapper><YourComponent /></ErrorBoundaryWrapper>
 */
export function ErrorBoundaryWrapper({ children, fallback }) {
    return (
        <ErrorBoundary fallback={fallback}>
            {children}
        </ErrorBoundary>
    );
}

