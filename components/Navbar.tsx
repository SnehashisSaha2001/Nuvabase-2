
import React from 'react';
import { ChevronRight, Search, Command, HelpCircle, Lightbulb, Share2 } from 'lucide-react';

interface NavbarProps {
  user: any;
  onLogout: () => void;
  onConnectClick: () => void;
  projectContext?: string;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout, onConnectClick, projectContext }) => {
  return (
    <header className="h-12 border-b border-[#2e2e2e] bg-[#161616] flex items-center justify-between px-4 shrink-0 z-40">
      <div className="flex items-center gap-2 text-sm font-medium">
        <div className="flex items-center gap-1.5 cursor-pointer hover:text-white text-[#9b9b9b] transition-colors">
          <img src="https://supabase.com/dashboard/img/supabase-logo.svg" className="h-4 w-4 mr-1" alt="Logo" />
          <span>Nuvabase</span>
        </div>
        <ChevronRight size={14} className="text-[#333]" />
        <span className="text-[#9b9b9b] hover:text-white cursor-pointer transition-colors">{user?.company_id || 'Personal'}</span>
        
        {projectContext && (
          <>
            <ChevronRight size={14} className="text-[#333]" />
            <span className="text-white font-semibold">{projectContext}</span>
          </>
        )}
      </div>
      
      <div className="flex items-center gap-4">
        {/* Search Bar - Command K Pattern */}
        <button className="hidden md:flex items-center gap-2 bg-[#1c1c1c] border border-[#2e2e2e] hover:border-[#444] rounded-full px-3 py-1 text-[#9b9b9b] transition-all group">
          <Search size={14} className="group-hover:text-white" />
          <span className="text-xs pr-4">Search...</span>
          <div className="flex items-center gap-0.5 bg-[#2e2e2e] px-1.5 py-0.5 rounded text-[10px] border border-[#444]">
            <Command size={10} />
            <span>K</span>
          </div>
        </button>

        <div className="flex items-center gap-1.5">
          <button className="p-1.5 text-[#9b9b9b] hover:text-white hover:bg-[#2e2e2e] rounded-full transition-all">
            <HelpCircle size={18} />
          </button>
          <button className="p-1.5 text-[#9b9b9b] hover:text-white hover:bg-[#2e2e2e] rounded-full transition-all">
            <Lightbulb size={18} />
          </button>
        </div>

        <div className="h-6 w-px bg-[#2e2e2e]"></div>

        <button 
          onClick={onConnectClick}
          className="bg-emerald-500 hover:bg-emerald-400 text-black px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/10"
        >
          <Share2 size={12} />
          Connect
        </button>

        <div className="relative group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#3ecf8e] to-[#2e2e2e] border border-[#2e2e2e] cursor-pointer"></div>
          <div className="absolute right-0 top-10 w-48 bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all p-2">
            <div className="px-3 py-2 border-b border-[#2e2e2e] mb-1">
              <p className="text-xs font-bold text-white">{user?.full_name}</p>
              <p className="text-[10px] text-[#9b9b9b] truncate">{user?.email}</p>
            </div>
            <button className="w-full text-left px-3 py-2 text-xs text-[#9b9b9b] hover:text-white hover:bg-[#2e2e2e] rounded-lg transition-colors">Account Settings</button>
            <button onClick={onLogout} className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">Sign out</button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
