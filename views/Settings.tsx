
import React, { useState, useEffect } from 'react';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  status: 'active' | 'revoked';
  createdAt: string;
  expiresAt?: string;
}

const Settings: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    { id: 'ak-1', name: 'Production Web App', key: 'nova_sk_live_72k8...91xz', status: 'active', createdAt: '2023-10-12' },
    { id: 'ak-2', name: 'CLI Tooling', key: 'nova_sk_test_11p2...00ab', status: 'active', createdAt: '2023-11-05', expiresAt: '2025-12-31' }
  ]);
  const [isCreating, setIsCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyExpiration, setNewKeyExpiration] = useState('');
  const [editingKeyId, setEditingKeyId] = useState<string | null>(null);
  const [editExpiration, setEditExpiration] = useState('');

  // Check for expired keys every minute and on mount
  useEffect(() => {
    const checkExpiration = () => {
      const now = new Date();
      setApiKeys(prevKeys => 
        prevKeys.map(key => {
          if (key.status === 'active' && key.expiresAt && new Date(key.expiresAt) < now) {
            return { ...key, status: 'revoked' };
          }
          return key;
        })
      );
    };

    checkExpiration();
    const interval = setInterval(checkExpiration, 60000);
    return () => clearInterval(interval);
  }, []);

  const generateKey = () => {
    if (!newKeyName.trim()) return;
    const newKey: ApiKey = {
      id: `ak-${Date.now()}`,
      name: newKeyName,
      key: `nova_sk_live_${Math.random().toString(36).substring(2, 8)}...${Math.random().toString(36).substring(2, 6)}`,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      expiresAt: newKeyExpiration || undefined
    };
    setApiKeys([newKey, ...apiKeys]);
    setNewKeyName('');
    setNewKeyExpiration('');
    setIsCreating(false);
  };

  const updateExpiration = (id: string) => {
    setApiKeys(apiKeys.map(k => k.id === id ? { ...k, expiresAt: editExpiration || undefined } : k));
    setEditingKeyId(null);
    setEditExpiration('');
  };

  const revokeKey = (id: string) => {
    setApiKeys(apiKeys.map(k => k.id === id ? { ...k, status: 'revoked' } : k));
  };

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fadeIn space-y-10">
      <header>
        <h1 className="text-3xl font-black tracking-tight mb-2">Workspace Settings</h1>
        <p className="text-[#8b949e]">Configure your sharded infrastructure and developer access.</p>
      </header>

      {/* API Key Management Section */}
      <section className="bg-[#1c2128] border border-[#30363d] rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-[#30363d] flex justify-between items-center bg-[#0d1117]/30">
          <div>
            <h2 className="text-lg font-bold text-white mb-1">API Keys</h2>
            <p className="text-xs text-[#8b949e]">These keys allow programmatic access to your projects via the NovaBase SDK.</p>
          </div>
          <button 
            onClick={() => setIsCreating(true)}
            className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded-xl font-bold text-xs transition-all shadow-lg shadow-emerald-500/10"
          >
            Create New Key
          </button>
        </div>

        {isCreating && (
          <div className="p-6 bg-[#21262d] border-b border-[#30363d] animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[10px] font-black text-[#8b949e] uppercase tracking-widest mb-2">Key Label</label>
                <input 
                  type="text" 
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g. My Website API Key"
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-[#8b949e] uppercase tracking-widest mb-2">Expiration Date (Optional)</label>
                <input 
                  type="date" 
                  value={newKeyExpiration}
                  onChange={(e) => setNewKeyExpiration(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 [color-scheme:dark]"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setIsCreating(false)}
                className="text-[#8b949e] hover:text-white text-xs font-bold px-4"
              >
                Cancel
              </button>
              <button 
                onClick={generateKey}
                className="bg-white text-black px-6 py-2 rounded-xl font-bold text-xs hover:bg-gray-200 transition-colors"
              >
                Generate Key
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#0d1117]/50 border-b border-[#30363d]">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-[#484f58] uppercase tracking-widest">Name</th>
                <th className="px-6 py-4 text-[10px] font-black text-[#484f58] uppercase tracking-widest">Secret Key</th>
                <th className="px-6 py-4 text-[10px] font-black text-[#484f58] uppercase tracking-widest">Expires</th>
                <th className="px-6 py-4 text-[10px] font-black text-[#484f58] uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-[#484f58] uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#30363d]">
              {apiKeys.map(apiKey => (
                <tr key={apiKey.id} className="hover:bg-[#21262d]/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-sm text-[#c9d1d9]">{apiKey.name}</div>
                    <div className="text-[10px] text-[#484f58] mt-0.5">Created {apiKey.createdAt}</div>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-xs bg-[#0d1117] px-2 py-1 rounded-lg border border-[#30363d] text-emerald-500/80 font-mono">
                      {apiKey.key}
                    </code>
                  </td>
                  <td className="px-6 py-4 text-xs text-[#8b949e]">
                    {editingKeyId === apiKey.id ? (
                      <div className="flex items-center gap-2">
                        <input 
                          type="date" 
                          value={editExpiration}
                          onChange={(e) => setEditExpiration(e.target.value)}
                          className="bg-[#0d1117] border border-[#30363d] rounded px-2 py-1 text-xs text-white [color-scheme:dark]"
                        />
                        <button onClick={() => updateExpiration(apiKey.id)} className="text-emerald-500 hover:text-emerald-400">✓</button>
                        <button onClick={() => setEditingKeyId(null)} className="text-red-500 hover:text-red-400">✕</button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span>{apiKey.expiresAt || 'Never'}</span>
                        {apiKey.status === 'active' && (
                          <button 
                            onClick={() => {
                              setEditingKeyId(apiKey.id);
                              setEditExpiration(apiKey.expiresAt || '');
                            }}
                            className="opacity-0 group-hover:opacity-100 text-[10px] text-emerald-500 underline transition-opacity"
                          >
                            Edit
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${
                      apiKey.status === 'active' 
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                        : 'bg-red-500/10 text-red-500 border-red-500/20'
                    }`}>
                      {apiKey.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {apiKey.status === 'active' && (
                      <button 
                        onClick={() => revokeKey(apiKey.id)}
                        className="text-red-400 hover:text-red-300 text-[10px] font-black uppercase tracking-widest transition-colors"
                      >
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-[#0d1117]/30 border-t border-[#30363d]">
          <p className="text-[10px] text-[#484f58] font-medium leading-relaxed">
            <span className="text-yellow-500/70 font-bold mr-1">SECURITY WARNING:</span> 
            Never commit your secret keys to public repositories. Revoke compromised keys immediately.
          </p>
        </div>
      </section>

      {/* Global Configuration Section */}
      <section className="bg-[#1c2128] border border-[#30363d] rounded-2xl p-6 shadow-xl">
        <h2 className="text-lg font-bold text-white mb-4">Regional Routing</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-[#0d1117] rounded-xl border border-[#30363d]">
            <div>
              <p className="text-sm font-bold">Auto-Scale Shards</p>
              <p className="text-xs text-[#8b949e]">Automatically spin up new database shards when latency exceeds 50ms.</p>
            </div>
            <div className="w-10 h-5 bg-emerald-500 rounded-full relative p-1 cursor-pointer">
              <div className="w-3 h-3 bg-black rounded-full absolute right-1"></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Settings;
