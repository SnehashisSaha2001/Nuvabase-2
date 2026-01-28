
import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  ChevronDown, 
  ExternalLink, 
  AlertCircle, 
  Terminal, 
  Database, 
  Globe, 
  Cpu,
  Key as KeyIcon,
  ChevronRight
} from 'lucide-react';

interface ConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectRef: string;
}

type TabType = 'Connection String' | 'App Frameworks' | 'ORMs' | 'API Keys' | 'MCP';

const ConnectModal: React.FC<ConnectModalProps> = ({ isOpen, onClose, projectRef }) => {
  const [activeTab, setActiveTab] = useState<TabType>('Connection String');
  const [copied, setCopied] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const tabs: TabType[] = ['Connection String', 'App Frameworks', 'ORMs', 'API Keys', 'MCP'];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Connection String':
        const uri = `postgresql://postgres:[YOUR-PASSWORD]@${projectRef}.nuvabase.dev:5432/postgres`;
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-black text-[#444] uppercase tracking-widest">Type</span>
                <div className="flex items-center gap-2 bg-[#1c1c1c] border border-[#2e2e2e] px-3 py-1.5 rounded-lg cursor-pointer hover:border-[#444] transition-colors">
                  <span className="text-xs text-white">URI</span>
                  <ChevronDown size={14} className="text-[#444]" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-black text-[#444] uppercase tracking-widest">Source</span>
                <div className="flex items-center gap-2 bg-[#1c1c1c] border border-[#2e2e2e] px-3 py-1.5 rounded-lg cursor-pointer hover:border-[#444] transition-colors">
                  <span className="text-xs text-white">Primary Database</span>
                  <ChevronDown size={14} className="text-[#444]" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-black text-[#444] uppercase tracking-widest">Method</span>
                <div className="flex items-center gap-2 bg-[#1c1c1c] border border-[#2e2e2e] px-3 py-1.5 rounded-lg cursor-pointer hover:border-[#444] transition-colors">
                  <span className="text-xs text-white">Direct connection</span>
                  <ChevronDown size={14} className="text-[#444]" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-[#9b9b9b]">
              <Database size={14} className="text-[#3ecf8e]" />
              <span>Learn how to connect to your Postgres databases.</span>
              <a href="#" className="text-[#3ecf8e] hover:underline flex items-center gap-1 font-bold">
                Read docs <ExternalLink size={10} />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-4 space-y-2">
                <h4 className="text-xs font-bold text-white">Direct connection</h4>
                <p className="text-xs text-[#9b9b9b] leading-relaxed">
                  Ideal for applications with persistent and long-lived connections, such as those running on virtual machines or long-standing containers.
                </p>
              </div>
              <div className="md:col-span-8 space-y-4">
                <div className="bg-[#0f0f0f] border border-[#2e2e2e] rounded-xl overflow-hidden group">
                  <div className="p-4 relative">
                    <pre className="text-[11px] font-mono text-[#ededed] whitespace-pre-wrap break-all leading-relaxed">
                      {uri}
                    </pre>
                    <button 
                      onClick={() => handleCopy(uri, 'uri')}
                      className="absolute top-3 right-3 p-2 bg-[#1c1c1c] border border-[#2e2e2e] rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:border-[#3ecf8e] text-[#9b9b9b] hover:text-white"
                    >
                      {copied === 'uri' ? <Check size={14} className="text-[#3ecf8e]" /> : <Copy size={14} />}
                    </button>
                  </div>
                  <div className="px-4 py-2 bg-[#161616] border-t border-[#2e2e2e] flex items-center gap-2 cursor-pointer hover:bg-[#1c1c1c] transition-colors">
                    <ChevronRight size={14} className="text-[#444]" />
                    <span className="text-[10px] font-black text-[#444] uppercase tracking-widest">View parameters</span>
                  </div>
                </div>

                <div className="bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl p-4 flex gap-4 items-start border-l-orange-500/50 border-l-4">
                  <div className="p-1.5 bg-orange-500/10 rounded-lg text-orange-500">
                    <AlertCircle size={16} />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <h4 className="text-xs font-bold text-white">Not IPv4 compatible</h4>
                      <p className="text-[11px] text-[#9b9b9b]">Use Session Pooler if on a IPv4 network or purchase IPv4 add-on</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="text-[10px] font-bold text-white px-3 py-1.5 rounded-lg border border-[#2e2e2e] hover:bg-[#2e2e2e] transition-colors">IPv4 add-on</button>
                      <button className="text-[10px] font-bold text-white px-3 py-1.5 rounded-lg border border-[#2e2e2e] hover:bg-[#2e2e2e] transition-colors">Pooler settings</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'App Frameworks':
        const code = `import { createClient } from '@nuvabase/nuvabase-js'\n\nconst nuvabase = createClient(\n  'https://${projectRef}.nuvabase.dev',\n  process.env.NUVABASE_ANON_KEY\n)`;
        return (
          <div className="space-y-6 animate-fadeIn">
             <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {['Next.js', 'React', 'Nuxt', 'Svelte', 'Solid', 'Flutter'].map(fw => (
                   <div key={fw} className="flex flex-col items-center justify-center p-4 bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl hover:border-[#3ecf8e] transition-all cursor-pointer group">
                      <div className="w-8 h-8 bg-[#2e2e2e] rounded-lg mb-2 flex items-center justify-center text-[#444] group-hover:text-[#3ecf8e] transition-colors">
                        <Terminal size={16} />
                      </div>
                      <span className="text-[10px] font-bold text-white uppercase">{fw}</span>
                   </div>
                ))}
             </div>
             <div className="bg-[#0f0f0f] border border-[#2e2e2e] rounded-xl overflow-hidden group">
                <div className="px-4 py-2 bg-[#161616] border-b border-[#2e2e2e] flex justify-between items-center">
                    <span className="text-[10px] font-black text-[#444] uppercase tracking-widest">Initialization Example</span>
                    <button onClick={() => handleCopy(code, 'fw_code')} className="text-[#444] hover:text-white transition-colors">
                        {copied === 'fw_code' ? <Check size={14} className="text-[#3ecf8e]" /> : <Copy size={14} />}
                    </button>
                </div>
                <div className="p-4 overflow-x-auto">
                    <pre className="text-[11px] font-mono text-emerald-500/80 leading-relaxed">
                        {code}
                    </pre>
                </div>
             </div>
          </div>
        );

      case 'API Keys':
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="space-y-4">
              <div className="p-4 bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl">
                 <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                       <KeyIcon size={14} className="text-emerald-500" />
                       <span className="text-xs font-bold text-white">Anon Public Key</span>
                    </div>
                    <span className="text-[9px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded border border-emerald-500/20 font-black">CLIENT-SAFE</span>
                 </div>
                 <div className="flex gap-2">
                    <input readOnly value="nova_pk_live_sh82...z91" className="flex-1 bg-[#0f0f0f] border border-[#2e2e2e] rounded-lg px-3 py-2 text-xs font-mono text-[#9b9b9b] focus:outline-none" />
                    <button onClick={() => handleCopy("nova_pk_live_sh82...z91", 'pk_anon')} className="bg-[#2e2e2e] hover:bg-[#333] p-2 rounded-lg transition-colors">
                       {copied === 'pk_anon' ? <Check size={14} className="text-[#3ecf8e]" /> : <Copy size={14} />}
                    </button>
                 </div>
              </div>
              <div className="p-4 bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl">
                 <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                       <KeyIcon size={14} className="text-red-500" />
                       <span className="text-xs font-bold text-white">Service Role Key</span>
                    </div>
                    <span className="text-[9px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded border border-red-500/20 font-black">SECRET / SERVER ONLY</span>
                 </div>
                 <div className="flex gap-2">
                    <input type="password" readOnly value="nova_sk_live_sh82_secret" className="flex-1 bg-[#0f0f0f] border border-[#2e2e2e] rounded-lg px-3 py-2 text-xs font-mono text-[#9b9b9b] focus:outline-none" />
                    <button onClick={() => handleCopy("nova_sk_live_sh82_secret", 'pk_secret')} className="bg-[#2e2e2e] hover:bg-[#333] p-2 rounded-lg transition-colors">
                       {copied === 'pk_secret' ? <Check size={14} className="text-[#3ecf8e]" /> : <Copy size={14} />}
                    </button>
                 </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="py-12 flex flex-col items-center justify-center text-center opacity-30">
            <Cpu size={48} className="mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest">Module Loading...</p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-md animate-fadeIn" 
        onClick={onClose}
      />
      <div className="relative bg-[#161616] border border-[#2e2e2e] w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slideUp">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-[#2e2e2e] flex justify-between items-start bg-[#1c1c1c]">
          <div>
            <h3 className="text-lg font-bold text-white">Connect to your project</h3>
            <p className="text-sm text-[#9b9b9b] mt-1">Get the connection strings and environment variables for your app.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-[#444] hover:text-white hover:bg-[#2e2e2e] rounded-lg transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="px-6 border-b border-[#2e2e2e] bg-[#1c1c1c] flex gap-6 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 text-[11px] font-black uppercase tracking-widest transition-all relative whitespace-nowrap ${
                activeTab === tab ? 'text-white' : 'text-[#444] hover:text-[#9b9b9b]'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3ecf8e] rounded-t-full shadow-[0_-2px_8px_rgba(62,207,142,0.4)]" />
              )}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-[#0f0f0f]">
          {renderTabContent()}
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-[#2e2e2e] bg-[#161616] flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-white">Reset your database password</h4>
            <p className="text-[10px] text-[#9b9b9b]">
              You may reset your database password in your project's {' '}
              <a href="#" className="text-[#3ecf8e] hover:underline font-bold">Database Settings</a>
            </p>
          </div>
          <div className="flex gap-3">
             <button className="text-[10px] font-black text-[#444] uppercase tracking-widest hover:text-white transition-colors">
                Support
             </button>
             <button 
               onClick={onClose}
               className="bg-[#3ecf8e] hover:bg-[#3ecf8e]/90 text-black font-black px-6 py-2 rounded-xl text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/10 active:scale-95"
             >
                Done
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectModal;
