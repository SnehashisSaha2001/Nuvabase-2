
import React, { useState, useEffect } from 'react';
import { Database, Shield, Box, Activity, Zap, Sparkles, RefreshCw, ChevronRight } from 'lucide-react';
import geminiService from '../services/geminiService.ts';

interface DashboardProps {
  users: any[];
  projects: any[];
  tasks: any[];
  onCreateProject: (name: string, region: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ users, projects }) => {
  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const capabilities = [
    { title: 'Database', desc: 'Managed PostgreSQL with RLS and real-time extensions.', icon: Database, color: '#3ecf8e' },
    { title: 'Authentication', desc: 'Secure user management and social OAuth providers.', icon: Shield, color: '#3ecf8e' },
    { title: 'Storage', desc: 'Object storage for images, videos, and static files.', icon: Box, color: '#3ecf8e' },
    { title: 'Edge Functions', desc: 'Deploy Typescript functions globally at the edge.', icon: Zap, color: '#3ecf8e' }
  ];

  const fetchAiAdvice = async () => {
    setIsLoadingAi(true);
    try {
      const advice = await geminiService.getInsights("Provide 3 quick optimization tips for a Nuvabase project with high user growth.");
      setAiAdvice(advice);
    } catch (err) {
      console.error(err);
      setAiAdvice("Failed to connect to AI consultant. Check your API connectivity.");
    } finally {
      setIsLoadingAi(false);
    }
  };

  useEffect(() => {
    fetchAiAdvice();
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10">
      <header className="flex justify-between items-start animate-slideUp">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Production-Core</h1>
          <p className="text-[#9b9b9b] text-sm mt-1">Project reference: <code className="text-[#3ecf8e] font-mono bg-[#3ecf8e]/10 px-2 py-0.5 rounded ml-1">sh-x82k91</code></p>
        </div>
        <button 
          onClick={fetchAiAdvice}
          className="flex items-center gap-2 text-[10px] font-black text-[#3ecf8e] uppercase tracking-widest hover:bg-[#3ecf8e]/10 px-4 py-2 rounded-lg border border-[#3ecf8e]/20 transition-all active:scale-95"
        >
          <RefreshCw size={12} className={isLoadingAi ? 'animate-spin' : ''} />
          Refresh Insights
        </button>
      </header>

      {/* AI Insights Panel */}
      <section 
        className="bg-gradient-to-br from-[#1c1c1c] to-[#0f0f0f] border border-[#3ecf8e]/20 rounded-2xl p-8 shadow-2xl relative overflow-hidden animate-slideUp"
        style={{ animationDelay: '0.1s' }}
      >
        <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
            <Sparkles size={160} className="text-[#3ecf8e]" />
        </div>
        <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-[#3ecf8e]/10 rounded-xl">
                  <Sparkles size={20} className="text-[#3ecf8e]" />
                </div>
                <h2 className="text-xs font-black text-white uppercase tracking-widest">AI Consultant Insights</h2>
            </div>
            {isLoadingAi ? (
                <div className="space-y-4 animate-pulse">
                    <div className="h-4 bg-[#2e2e2e] rounded-full w-3/4"></div>
                    <div className="h-4 bg-[#2e2e2e] rounded-full w-1/2"></div>
                </div>
            ) : (
                <div className="text-sm text-[#ededed] leading-relaxed max-w-none grid gap-4">
                    {aiAdvice.split('\n').filter(l => l.trim()).map((line, i) => (
                        <div key={i} className="flex gap-4 items-start bg-[#161616]/50 p-4 rounded-xl border border-white/5 hover:border-[#3ecf8e]/20 transition-colors">
                            <ChevronRight size={14} className="shrink-0 mt-1 text-[#3ecf8e]" />
                            <p className="text-[13px]">{line.replace(/^(\d+\.|-|\*)\s*/, '')}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </section>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            label: 'Project Usage',
            icon: Activity,
            content: (
              <div className="space-y-4 mt-4">
                <div>
                  <div className="flex justify-between text-[11px] mb-2 font-bold uppercase tracking-wider">
                    <span className="text-[#9b9b9b]">Database Size</span>
                    <span className="text-white">1.2 GB / 5 GB</span>
                  </div>
                  <div className="w-full bg-[#2e2e2e] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#3ecf8e] h-full shadow-[0_0_8px_rgba(62,207,142,0.5)] transition-all duration-1000" style={{ width: '24%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] mb-2 font-bold uppercase tracking-wider">
                    <span className="text-[#9b9b9b]">Storage Egress</span>
                    <span className="text-white">450 MB / 1 GB</span>
                  </div>
                  <div className="w-full bg-[#2e2e2e] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#3ecf8e] h-full shadow-[0_0_8px_rgba(62,207,142,0.5)] transition-all duration-1000" style={{ width: '45%' }}></div>
                  </div>
                </div>
              </div>
            )
          },
          {
            label: 'Infrastructure',
            icon: Zap,
            content: (
              <div className="flex flex-col justify-between h-full pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#3ecf8e] animate-pulse shadow-[0_0_12px_rgba(62,207,142,0.6)]"></div>
                  <p className="text-sm font-bold text-white">All systems operational</p>
                </div>
                <div className="text-[10px] text-[#444] font-black uppercase tracking-widest leading-relaxed mt-6">
                  PostgreSQL 15.1 · sh-x82k91<br/>AWS us-east-1 (N. Virginia)
                </div>
              </div>
            )
          },
          {
            label: 'Security Status',
            icon: Shield,
            content: (
              <div className="pt-4 h-full flex flex-col justify-between">
                <p className="text-[12px] text-[#9b9b9b] leading-relaxed">
                  Row Level Security is enforced at the kernel. 1,249 unauthorized leak attempts blocked this week.
                </p>
                <button className="text-[11px] font-black uppercase tracking-widest text-[#3ecf8e] hover:text-white transition-colors mt-4 text-left">
                  Audit Logs →
                </button>
              </div>
            )
          }
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="sb-card p-6 animate-slideUp" style={{ animationDelay: `${0.2 + (i * 0.1)}s` }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black text-[#444] uppercase tracking-widest">{stat.label}</span>
                <Icon size={14} className="text-[#3ecf8e]/40" />
              </div>
              {stat.content}
            </div>
          );
        })}
      </div>

      {/* Capabilities Section */}
      <section className="animate-slideUp" style={{ animationDelay: '0.5s' }}>
        <h2 className="text-xs font-black text-[#444] uppercase tracking-widest mb-6">Capabilities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {capabilities.map((cap, i) => {
            const Icon = cap.icon;
            return (
              <div key={i} className="sb-card p-8 hover:bg-[#212121] transition-all cursor-pointer group">
                <div className="p-3 bg-[#2e2e2e] rounded-xl w-fit mb-6 group-hover:bg-[#3ecf8e]/10 group-hover:text-[#3ecf8e] transition-all">
                  <Icon size={24} className="group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="text-sm font-bold text-white mb-2">{cap.title}</h3>
                <p className="text-[12px] text-[#9b9b9b] leading-relaxed">{cap.desc}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
