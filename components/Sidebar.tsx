
import React from 'react';
import { Home, Database, Code, Shield, Box, Settings, Play, Layout, Wifi, Layers, History } from 'lucide-react';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  onOrgHome: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, onOrgHome }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'database', label: 'Table Editor', icon: Database },
    { id: 'sql', label: 'SQL Editor', icon: Code },
    { id: 'schema', label: 'Schema Visualizer', icon: Layout },
    { id: 'auth', label: 'Authentication', icon: Shield },
    { id: 'storage', label: 'Storage', icon: Box },
    { id: 'realtime', label: 'Realtime', icon: Wifi },
    { id: 'logs', label: 'Audit Logs', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="w-16 h-screen bg-[#1c1c1c] border-r border-[#2e2e2e] flex flex-col items-center py-4 shrink-0 z-[100]">
      <div className="mb-8">
        <button 
          onClick={onOrgHome}
          className="w-9 h-9 bg-[#3ecf8e] rounded-xl flex items-center justify-center font-black text-black text-sm shadow-lg shadow-emerald-500/10 hover:scale-105 active:scale-95 transition-all"
        >
          N
        </button>
      </div>

      <button
        onClick={onOrgHome}
        title="Organization Home"
        className="p-2.5 rounded-xl transition-all group relative flex items-center justify-center text-[#555] hover:text-[#ededed] hover:bg-[#2e2e2e] mb-4"
      >
        <Layers size={18} />
        <span className="absolute left-14 bg-black/90 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-[-10px] group-hover:translate-x-0 whitespace-nowrap z-50 border border-[#2e2e2e] shadow-2xl">
          Org Home
        </span>
      </button>

      <div className="h-px w-6 bg-[#2e2e2e] mb-4"></div>
      
      <div className="flex flex-col gap-3 flex-1 w-full px-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              title={item.label}
              className={`p-2.5 rounded-xl transition-all group relative flex items-center justify-center ${
                isActive 
                  ? 'bg-[#3ecf8e]/10 text-[#3ecf8e]' 
                  : 'text-[#555] hover:text-[#ededed] hover:bg-[#2e2e2e]'
              }`}
            >
              {isActive && (
                <div className="absolute left-[-8px] w-1 h-6 bg-[#3ecf8e] rounded-r-full animate-fadeIn" />
              )}
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className="transition-transform group-active:scale-90" />
              
              {/* Tooltip */}
              <span className="absolute left-14 bg-black/90 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-[-10px] group-hover:translate-x-0 whitespace-nowrap z-50 border border-[#2e2e2e] shadow-2xl">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-auto pb-4">
        <button className="p-2.5 text-[#444] hover:text-white rounded-xl hover:bg-[#2e2e2e] transition-all active:scale-90">
          <Play size={18} />
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;
