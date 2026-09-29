import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 m-4 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 rounded-xl shadow-md text-center max-w-lg mx-auto my-12">
          <div className="w-12 h-12 bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertTriangle size={24} />
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
            Something went wrong
          </h2>
          <p className="text-xs text-rose-600 dark:text-rose-400 font-mono bg-rose-50 dark:bg-rose-950/40 p-3 rounded-lg border border-rose-100 dark:border-rose-900/40 mb-4 overflow-x-auto text-left leading-relaxed">
            {this.state.error?.toString() || "An unexpected rendering error occurred."}
          </p>
          <button
            onClick={this.handleReload}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#2563EB] hover:bg-[#1d4ed8] text-white rounded-lg text-xs font-semibold transition cursor-pointer"
          >
            <RefreshCw size={14} />
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
