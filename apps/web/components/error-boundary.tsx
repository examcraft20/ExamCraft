"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Card, Button } from "@examcraft/ui";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card padding="lg" className="max-w-2xl mx-auto mt-20">
          <div className="space-y-6 text-center">
            <div className="text-red-400">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">
                Something went wrong
              </h2>
              <p className="text-zinc-400 text-sm">
                {this.state.error?.message || "An unexpected error occurred"}
              </p>
            </div>
            <Button onClick={this.handleReset} variant="primary">
              Try Again
            </Button>
          </div>
        </Card>
      );
    }

    return this.props.children;
  }
}
