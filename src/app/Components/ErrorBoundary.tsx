// components/ErrorBoundary.tsx
"use client";
import React, { ReactNode, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion"; // For animations

// Props interface
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode; // Custom fallback UI
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void; // Callback for custom error handling
  resetKey?: string | number; // Optional key to reset the boundary externally
}

// Modern ErrorBoundary component
export const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({
  children,
  fallback,
  onError,
  resetKey,
}) => {
  const [errorState, setErrorState] = useState<{
    hasError: boolean;
    error: Error | null;
  }>({ hasError: false, error: null });

  // Reset the error state when resetKey changes
  useEffect(() => {
    setErrorState({ hasError: false, error: null });
  }, [resetKey]);

  // Error catching logic
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    setErrorState({ hasError: true, error });
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    if (onError) onError(error, errorInfo); // Call custom handler if provided
  };

  // Reset handler
  const handleReset = () => {
    setErrorState({ hasError: false, error: null });
  };

  // Component error boundary wrapper
  const ErrorBoundaryWrapper: React.FC<{ children: ReactNode }> = ({ children }) => {
    try {
      return <>{children}</>;
    } catch (error) {
      handleError(error as Error, { componentStack: "" });
      return null;
    }
  };

  // Default stylish fallback UI
  const DefaultFallback = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center min-h-[200px] p-6 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-950/30 border border-red-200 dark:border-red-800 rounded-xl shadow-lg max-w-md mx-auto"
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl text-red-600 dark:text-red-400">⚠️</span>
        <h3 className="text-xl font-semibold text-red-700 dark:text-red-300">
          Oops! Something Broke
        </h3>
      </div>
      <p className="text-sm text-red-600 dark:text-red-400 text-center mb-6">
        {errorState.error?.message || "An unexpected error occurred."}
      </p>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleReset}
        className="px-4 py-2 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
      >
        Try Again
      </motion.button>
    </motion.div>
  );

  if (errorState.hasError) {
    return (
      <AnimatePresence mode="wait">
        {fallback ? fallback : <DefaultFallback />}
      </AnimatePresence>
    );
  }

  return (
    <ErrorBoundaryWrapper>
      {children}
    </ErrorBoundaryWrapper>
  );
};

// Optional: Higher-order component to wrap components with ErrorBoundary
export const withErrorBoundary = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: ReactNode
) => {
  const WithErrorBoundary: React.FC<P> = (props) => (
    <ErrorBoundary fallback={fallback}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );
  WithErrorBoundary.displayName = `WithErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name || "Component"})`;
  return WithErrorBoundary;
};