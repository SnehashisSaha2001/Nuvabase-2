
import React, { useState } from 'react';
// Fix: Added ChevronRight to the lucide-react imports to resolve "Cannot find name 'ChevronRight'" error on line 84.
import { History, ShieldCheck, Search, Filter, Download, User, Clock, Terminal, ChevronRight } from 'lucide-react';

const AuditLogView: React.FC = () => {
  const [logs] = useState([
    { id: 'l-1', user: 'admin@novabase.dev', action: 'CREATE', table: 'users', record: 'u-102', time: '2024-05-13 14:20:01', ip: '192.168.1.42' },
    { id: 'l-2', user: 'admin@novabase.dev', action: 'UPDATE', table: 'followups', record: 'f-92', time: '2024-05-13 14:15:32', ip: '192.168.1.42' },
    { id: 'l-3', user: 'system', action: 'RLS_FILTER', table: 'users', record: 'n/a', time: '2024-05-13 14:10:05', ip: '10.0.4.12' },
    { id: 'l-4', user: 'dev_alex', action: 'LOGIN', table: 'auth', record: 'u-12', time: '2024-05-13 13:55:20', ip: '172.16.0.5' },
  ]);

  return (
    <div className="h-full flex flex-col bg-[#161616] animate-fadeIn">
      <header className="h-14 border-b border-[#2e2e2e] bg-[#1c1c1c] flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-[#3ecf8e]/10 rounded text-[#3ecf8e]">
            <History size={16} />
          </div>
          <h2 className="text-sm font-bold text-white">Audit Ledger</h2>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <ShieldCheck size={10} className="text-emerald-500" />
            <span className="text-[9px] font-black text-emerald-500 uppercase">Immutable logs</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <button className="text-xs text-[#9b9b9b] hover:text-white px-3 py-1.5 rounded transition-colors flex items-center gap-2">
                <Download size={14} /> Export CSV
            </button>
        </div>
      </header>

      <div className="p-6 border-b border-[#2e2e2e] bg-[#161616]">
        <div className="flex gap-4">
           <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 text-[#444]" size={14} />
              <input type="text" placeholder="Filter by user or table..." className="w-full bg-[#0f0f0f] border border-[#2e2e2e] rounded-lg py-2 pl-9 pr-4 text-xs outline-none focus:border-[#3ecf8e]" />
           </div>
           <button className="px-4 py-2 bg-[#2e2e2e] text-white rounded-lg text-xs font-bold hover:bg-[#333] transition-all flex items-center gap-2">
              <Filter size={14} /> Add Filter
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar bg-[#0f0f0f]">
        <table className="w-full text-left">
          <thead className="sticky top-0 bg-[#1c1c1c] border-b border-[#2e2e2e] z-10">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black text-[#444] uppercase tracking-widest">Timestamp</th>
              <th className="px-4 py-4 text-[10px] font-black text-[#444] uppercase tracking-widest">Actor</th>
              <th className="px-4 py-4 text-[10px] font-black text-[#444] uppercase tracking-widest">Action</th>
              <th className="px-4 py-4 text-[10px] font-black text-[#444] uppercase tracking-widest">Resource</th>
              <th className="px-4 py-4 text-[10px] font-black text-[#444] uppercase tracking-widest">IP Address</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2e2e2e]">
            {logs.map(log => (
              <tr key={log.id} className="hover:bg-[#161616] group transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                   <div className="flex items-center gap-2 text-xs text-[#444]">
                      <Clock size={12} />
                      {log.time}
                   </div>
                </td>
                <td className="px-4 py-4">
                   <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-[#2e2e2e] rounded-full flex items-center justify-center text-[#9b9b9b]">
                         <User size={10} />
                      </div>
                      <span className="text-xs text-[#ededed]">{log.user}</span>
                   </div>
                </td>
                <td className="px-4 py-4">
                   <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                     log.action === 'RLS_FILTER' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-[#2e2e2e] text-[#9b9b9b]'
                   }`}>
                      {log.action}
                   </span>
                </td>
                <td className="px-4 py-4">
                   <div className="flex items-center gap-1 text-xs">
                      <span className="text-white font-mono">{log.table}</span>
                      <ChevronRight size={10} className="text-[#444]" />
                      <span className="text-[#444] font-mono">{log.record}</span>
                   </div>
                </td>
                <td className="px-4 py-4 text-xs font-mono text-[#444]">
                   {log.ip}
                </td>
                <td className="px-6 py-4 text-right">
                   <button className="p-1.5 text-[#444] hover:text-white transition-colors">
                      <Terminal size={14} />
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogView;
