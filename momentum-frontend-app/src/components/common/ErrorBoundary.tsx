import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { Button } from "../ui/Button";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught app boundary error:", error, errorInfo);
  }

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background text-on-background flex flex-col items-center justify-center p-8 select-none">
          <div className="max-w-md w-full text-center space-y-6">
            <h1 className="text-headline-lg font-bold text-error m-0 uppercase tracking-widest">
              System Fault
            </h1>
            <p className="text-body-sm text-on-surface-variant leading-relaxed">
              An unexpected runtime error has occurred. The system logs have captured the incident.
            </p>
            {this.state.error && (
              <pre className="text-left bg-surface-container-low border border-white/5 p-4 rounded-xl text-[12px] font-mono text-error overflow-auto max-h-40">
                {this.state.error.stack || this.state.error.message}
              </pre>
            )}
            <div className="flex gap-4 justify-center">
              <Button
                variant="primary"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
              >
                Reload App
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
