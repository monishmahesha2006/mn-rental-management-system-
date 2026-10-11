import { Component, type ErrorInfo, type ReactNode } from "react";
interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
  error: Error | null;
}
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("App error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#0A0E1A] text-[#F5F1EB] p-6">
          <div className="max-w-md w-full rounded-2xl border border-amber-500/30 bg-[#151922]/90 p-8 text-center">
            <h1 className="text-xl font-semibold text-amber-400 mb-2">Something went wrong</h1>
            <p className="text-sm text-slate-400 mb-4">
              {this.state.error.message || "An unexpected error occurred."}
            </p>
            <button
              type="button"
              onClick={() => window.location.href = "/"}
              className="rounded-xl bg-amber-500/20 text-amber-300 px-4 py-2 text-sm font-medium hover:bg-amber-500/30 transition"
            >
              Go to Login
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}