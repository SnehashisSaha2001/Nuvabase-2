import React from 'react';
import { User } from '../types.ts';

interface ApiDocsProps {
  user: User | null;
}

const ApiDocs: React.FC<ApiDocsProps> = () => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">API Documentation</h1>
      <p className="text-[#8b949e]">Reference documentation for NovaBase services.</p>
    </div>
  );
};

export default ApiDocs;