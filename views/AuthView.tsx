import React, { useState } from 'react';

interface AuthViewProps {
  onLogin: (email: string, password: string) => Promise<void>;
}

const AuthView: React.FC<AuthViewProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await onLogin(email, password);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-10">
            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center font-black text-black text-2xl mb-4 shadow-2xl shadow-emerald-500/20">N</div>
            {/* Fix: Changed 'class' to 'className' to resolve React property error */}
            <h1 className="text-2xl font-black text-white">Sign in to Nuvabase</h1>
            <p className="text-[#8b949e] text-sm mt-2">Manage your sharded infrastructure</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#1c2128] border border-[#30363d] rounded-[2rem] p-8 shadow-2xl space-y-6">
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs font-bold animate-fadeIn">
                    {error}
                </div>
            )}
            
            <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#484f58] mb-2 px-1">Email Address</label>
                <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                    placeholder="admin@example.com" 
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-white"
                />
            </div>

            <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#484f58] mb-2 px-1">Password</label>
                <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                    placeholder="••••••••" 
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-white"
                />
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-black py-4 rounded-2xl transition-all shadow-xl shadow-emerald-500/20 active:scale-[0.98]"
            >
                {loading ? 'Authenticating...' : 'Sign In'}
            </button>
            
            <div className="text-center pt-2">
                <p className="text-xs text-[#8b949e]">New to Nuvabase? <a href="#" className="text-emerald-500 font-bold hover:underline">Create a workspace</a></p>
            </div>
        </form>
      </div>
    </div>
  );
};

export default AuthView;