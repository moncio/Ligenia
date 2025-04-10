import React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';
import { ErrorBoundary } from 'react-error-boundary';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Simple fallback component to display when errors occur
const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary: () => void }) => {
  console.error("Application error:", error);
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
        <h2 className="mb-4 text-xl font-bold text-red-600">¡Algo salió mal!</h2>
        <p className="mb-4 text-gray-700">La aplicación encontró un error inesperado.</p>
        <pre className="p-3 mb-4 overflow-auto text-sm bg-gray-100 rounded">
          {error.message}
        </pre>
        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 font-bold text-white bg-blue-600 rounded hover:bg-blue-700"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
};

const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error("Error crítico: Elemento root no encontrado en el DOM");
} else {
  const root = createRoot(rootElement);
  
  try {
    root.render(
      <React.StrictMode>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <App />
        </ErrorBoundary>
      </React.StrictMode>
    );
    console.log("Aplicación renderizada correctamente");
  } catch (error) {
    console.error("Error al renderizar la aplicación:", error);
  }
}
