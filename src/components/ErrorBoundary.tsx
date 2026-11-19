import { Component, type ErrorInfo, type ReactNode } from 'react';

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught render error', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="flex h-dvh w-full flex-col items-center justify-center gap-3 bg-[#fbe3cb] px-6 text-center text-amber-950"
        >
          <span className="text-4xl">😿</span>
          <h1 className="font-display text-base font-black">Oli got tangled in yarn!</h1>
          <p className="max-w-xs text-xs font-semibold text-amber-900/80">
            Something unexpected happened. Reload to bring Oli right back.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-1 rounded-full bg-amber-600 px-5 py-2.5 text-xs font-black text-white shadow-sm active:scale-95 hover:bg-amber-500"
          >
            Reload Ravioli
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
