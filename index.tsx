import React, { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <Suspense fallback={
        <div className="h-screen w-screen bg-[#161616] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#3ecf8e] border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
        <App />
      </Suspense>
    </React.StrictMode>
  );
}