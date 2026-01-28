
import React, { useState, useEffect } from 'react';
import { Database, Table as TableIcon, Search, Plus, Filter, Download, MoreHorizontal, ChevronRight, ShieldCheck, Key, Lock, Eye, Code, ExternalLink, Info } from 'lucide-react';

interface Column {
  name: string;
  type: string;
  isPk?: boolean;
  isNullable: boolean;
  defaultValue?: string;
  isSystem?: boolean;
}

interface TableMetadata {
  name: string;
  rows: number;
  exposed: boolean;
  columns: Column[];
}

const INITIAL_TABLES: TableMetadata[] = [
  { 
    name: 'users', 
    rows: 1249, 
    exposed: true,
    columns: [
      { name: 'id', type: 'uuid', isPk: true, isNullable: false, isSystem: true },
      { name: 'tenant_id', type: 'uuid', isNullable: false, isSystem: true },
      { name: 'email', type: 'text', isNullable: false },
      { name: 'full_name', type: 'text', isNullable: true },
      { name: 'role', type: 'text', isNullable: false, defaultValue: 'member' },
      { name: 'created_at', type: 'timestamptz', isNullable: false, isSystem: true }
    ]
  },
  { 
    name: 'followups', 
    rows: 432, 
    exposed: true,
    columns: [
      { name: 'id', type: 'uuid', isPk: true, isNullable: false, isSystem: true },
      { name: 'user_id', type: 'uuid', isNullable: true },
      { name: 'subject', type: 'text', isNullable: false },
      { name: 'status', type: 'text', isNullable: false, defaultValue: 'pending' },
      { name: 'followup_date', type: 'timestamptz', isNullable: true }
    ]
  },
  { 
    name: 'daily_activity', 
    rows: 8902, 
    exposed: true,
    columns: [
      { name: 'id', type: 'uuid', isPk: true, isNullable: false, isSystem: true },
      { name: 'type', type: 'text', isNullable: true },
      { name: 'location', type: 'text', isNullable: true },
      { name: 'activity_date', type: 'date', isNullable: false }
    ]
  },
  { 
    name: 'audit_logs', 
    rows: 45210, 
    exposed: false, // Hidden by default as per Phase 8.2.1 metadata rule
    columns: []
  }
];

const DatabaseView: React.FC<{ initialTable?: string }> = ({ initialTable = 'users' }) => {
  const [selectedTable, setSelectedTable] = useState(initialTable);
  const [activeSubView, setActiveSubView] = useState<'data' | 'schema'>('data');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);

  const visibleTables = INITIAL_TABLES.filter(t => t.exposed);
  const currentTable = INITIAL_TABLES.find(t => t.name === selectedTable) || visibleTables[0];

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [selectedTable]);

  return (
    <div className="h-full flex animate-fadeIn overflow-hidden">
      {/* Table Sidebar */}
      <aside className="w-64 border-r border-[#2e2e2e] bg-[#1c1c1c] flex flex-col shrink-0">
        <div className="p-4 border-b border-[#2e2e2e]">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-[#444]" size={14} />
            <input 
              type="text" 
              placeholder="Filter tables..."
              className="w-full bg-[#0f0f0f] border border-[#2e2e2e] rounded-md py-2 pl-9 pr-4 text-xs outline-none focus:border-[#3ecf8e] transition-colors"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5 custom-scrollbar">
            <div className="px-3 py-2 text-[10px] font-black text-[#444] uppercase tracking-widest">Public Tables</div>
            {visibleTables.map(table => (
                <button
                    key={table.name}
                    onClick={() => { setSelectedTable(table.name); setSelectedRow(null); }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs transition-all ${
                        selectedTable === table.name 
                        ? 'bg-[#3ecf8e]/10 text-[#3ecf8e] font-semibold' 
                        : 'text-[#9b9b9b] hover:bg-[#2e2e2e] hover:text-white'
                    }`}
                >
                    <div className="flex items-center gap-2.5">
                        <TableIcon size={14} className={selectedTable === table.name ? 'text-[#3ecf8e]' : 'text-[#444]'} />
                        <span>{table.name}</span>
                    </div>
                    <span className="text-[10px] opacity-40 font-mono">{table.rows.toLocaleString()}</span>
                </button>
            ))}
        </div>
        <div className="p-4 bg-[#161616] border-t border-[#2e2e2e]">
            <div className="flex items-center gap-2 text-[#444]">
                <Lock size={12} />
                <span className="text-[9px] font-black uppercase tracking-widest">Isolation Active</span>
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0f0f0f]">
        <header className="h-14 border-b border-[#2e2e2e] flex items-center justify-between px-6 bg-[#161616] shrink-0">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                    <TableIcon size={16} className="text-[#3ecf8e]" />
                    <span>{selectedTable}</span>
                    <ShieldCheck size={14} className="text-[#3ecf8e]" />
                </div>
                <div className="flex items-center bg-[#1c1c1c] border border-[#2e2e2e] rounded-lg p-0.5">
                    <button 
                        onClick={() => setActiveSubView('data')}
                        className={`px-3 py-1 rounded-md text-[10px] font-black uppercase transition-all ${activeSubView === 'data' ? 'bg-[#2e2e2e] text-white shadow-sm' : 'text-[#444] hover:text-[#9b9b9b]'}`}
                    >
                        Browse Data
                    </button>
                    <button 
                        onClick={() => setActiveSubView('schema')}
                        className={`px-3 py-1 rounded-md text-[10px] font-black uppercase transition-all ${activeSubView === 'schema' ? 'bg-[#2e2e2e] text-white shadow-sm' : 'text-[#444] hover:text-[#9b9b9b]'}`}
                    >
                        Schema
                    </button>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#2e2e2e] border border-[#444] opacity-50 cursor-not-allowed">
                    <Plus size={12} className="text-[#9b9b9b]" />
                    <span className="text-[10px] font-black text-[#9b9b9b] uppercase">Insert Row</span>
                </div>
                <button className="text-xs text-[#9b9b9b] hover:text-white px-3 py-1.5 rounded-lg border border-[#2e2e2e] transition-colors flex items-center gap-2">
                    <Download size={14} /> Export
                </button>
            </div>
        </header>

        <div className="flex-1 overflow-hidden relative flex">
            {isLoading && (
                <div className="absolute inset-0 bg-[#0f0f0f]/50 backdrop-blur-[2px] z-50 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-[#3ecf8e] border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}
            
            <div className={`flex-1 overflow-auto custom-scrollbar ${activeSubView === 'schema' ? 'p-8' : ''}`}>
                {activeSubView === 'data' ? (
                    <table className="w-full text-left border-collapse table-fixed">
                        <thead className="sticky top-0 bg-[#1c1c1c] z-20 border-b border-[#2e2e2e]">
                            <tr>
                                <th className="w-10 px-4 py-3"><input type="checkbox" className="rounded border-[#2e2e2e] bg-transparent" disabled /></th>
                                {currentTable.columns.map(col => (
                                    <th key={col.name} className="px-4 py-3 text-[10px] font-black text-[#444] uppercase tracking-widest truncate">
                                        <div className="flex items-center gap-2">
                                            {col.isPk && <Key size={10} className="text-[#3ecf8e]" />}
                                            {col.name}
                                            <span className="text-[8px] font-mono lowercase text-[#333] tracking-tighter">[{col.type}]</span>
                                        </div>
                                    </th>
                                ))}
                                <th className="w-10 px-4 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2e2e2e]">
                            {[...Array(25)].map((_, i) => (
                                <tr 
                                    key={i} 
                                    onClick={() => setSelectedRow({ id: `uuid_${i}`, index: i })}
                                    className={`hover:bg-[#161616] group transition-colors cursor-pointer ${selectedRow?.index === i ? 'bg-[#3ecf8e]/5' : ''}`}
                                >
                                    <td className="px-4 py-3"><input type="checkbox" className="rounded border-[#2e2e2e] bg-transparent" /></td>
                                    {currentTable.columns.map((col, ci) => (
                                        <td key={ci} className="px-4 py-3 text-xs text-[#ededed] whitespace-nowrap truncate font-mono">
                                            {col.isPk || col.name.includes('_id') ? (
                                                <span className="text-[#3ecf8e]/70">uuid_{i + 100}</span>
                                            ) : col.name === 'email' ? (
                                                <span className="text-[#ededed]">user_{i}@nuvabase.dev</span>
                                            ) : col.type === 'timestamptz' ? (
                                                <span className="text-[#444]">2024-05-13T14:20:01</span>
                                            ) : (
                                                `value_${i}`
                                            )}
                                        </td>
                                    ))}
                                    <td className="px-4 py-3 text-right">
                                        <button className="text-[#2e2e2e] group-hover:text-white transition-colors">
                                            <MoreHorizontal size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    /* Phase 8.2.2 Schema Viewer */
                    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black text-white tracking-tight">Table Schema</h3>
                                <p className="text-xs text-[#9b9b9b] mt-1">Definition of columns and data constraints for {selectedTable}.</p>
                            </div>
                            <div className="p-4 bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl flex items-center gap-3">
                                <Info size={16} className="text-[#3ecf8e]" />
                                <span className="text-[10px] font-black uppercase text-[#444] tracking-widest leading-none">Security: Only exposed columns visible</span>
                            </div>
                        </div>

                        <div className="bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl overflow-hidden shadow-2xl">
                            <table className="w-full text-left">
                                <thead className="bg-[#161616] border-b border-[#2e2e2e]">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-black text-[#444] uppercase tracking-widest">Name</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-[#444] uppercase tracking-widest">Type</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-[#444] uppercase tracking-widest">Nullable</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-[#444] uppercase tracking-widest">Default</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#2e2e2e]">
                                    {currentTable.columns.map(col => (
                                        <tr key={col.name} className="hover:bg-[#1f1f1f] transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs font-bold text-white">{col.name}</span>
                                                    {col.isPk && <span className="px-1.5 py-0.5 bg-[#3ecf8e]/10 text-[#3ecf8e] text-[8px] font-black uppercase rounded border border-[#3ecf8e]/20">Primary Key</span>}
                                                    {col.isSystem && <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-500 text-[8px] font-black uppercase rounded border border-blue-500/20">System</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-xs text-[#9b9b9b]">{col.type}</td>
                                            <td className="px-6 py-4">
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${col.isNullable ? 'text-[#444]' : 'text-orange-500'}`}>
                                                    {col.isNullable ? 'YES' : 'NO'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-xs text-[#444]">{col.defaultValue || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Phase 8.2.3 Row Details Panel */}
            {selectedRow && activeSubView === 'data' && (
                <div className="w-80 border-l border-[#2e2e2e] bg-[#1c1c1c] flex flex-col shrink-0 animate-slideRight">
                    <header className="h-12 border-b border-[#2e2e2e] flex items-center justify-between px-4 bg-[#161616]">
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Row Details</span>
                        <button onClick={() => setSelectedRow(null)} className="text-[#444] hover:text-white transition-colors text-xs font-bold">Close</button>
                    </header>
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                        <div className="space-y-4">
                            {currentTable.columns.map(col => (
                                <div key={col.name} className="space-y-1.5">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[9px] font-black text-[#444] uppercase tracking-widest">{col.name}</label>
                                        <button className="text-[8px] font-bold text-[#3ecf8e] hover:underline uppercase">Copy</button>
                                    </div>
                                    <div className="bg-[#0f0f0f] border border-[#2e2e2e] p-2.5 rounded-lg text-xs font-mono text-[#ededed] break-all leading-relaxed">
                                        {col.isPk ? selectedRow.id : `value_${selectedRow.index}`}
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="pt-6 border-t border-[#2e2e2e]">
                            <label className="text-[10px] font-black text-[#444] uppercase tracking-widest block mb-3">JSON Raw Preview</label>
                            <div className="bg-[#0f0f0f] border border-[#2e2e2e] p-4 rounded-xl">
                                <pre className="text-[10px] font-mono text-[#3ecf8e]/80">
                                    {JSON.stringify({ id: selectedRow.id, metadata: { shard: 'us-east-1' } }, null, 2)}
                                </pre>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 bg-[#161616] border-t border-[#2e2e2e] flex gap-2">
                        <div className="flex-1 text-center py-2 rounded-lg bg-[#2e2e2e] text-[#444] text-[10px] font-black uppercase opacity-50 cursor-not-allowed">
                            Edit Locked
                        </div>
                    </div>
                </div>
            )}
        </div>

        <footer className="h-10 border-t border-[#2e2e2e] bg-[#1c1c1c] px-6 flex items-center justify-between text-[10px] font-bold text-[#444] uppercase tracking-widest shrink-0">
            <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5"><Database size={12} className="text-[#3ecf8e]" /> SHARD: sh-x82k91</span>
                <span className="text-[#2e2e2e]">|</span>
                <span>Active Table: {selectedTable}</span>
                <span className="text-[#2e2e2e]">|</span>
                <span>ROWS: {currentTable.rows.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-[#3ecf8e]/60">
                    <ShieldCheck size={12} />
                    <span>Read-Only Session</span>
                </div>
            </div>
        </footer>
      </div>
    </div>
  );
};

export default DatabaseView;
