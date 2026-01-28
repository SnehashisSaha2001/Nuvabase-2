
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Database, Key, Diamond, Shield, ExternalLink, ZoomIn, ZoomOut, Maximize, MousePointer2, Plus, Grab } from 'lucide-react';

interface Column {
  name: string;
  type: string;
  isPk?: boolean;
  isFk?: boolean;
  isUnique?: boolean;
  refTable?: string;
}

interface TableSchema {
  id: string;
  name: string;
  columns: Column[];
}

interface Point {
  x: number;
  y: number;
}

const NUVABASE_SCHEMA: TableSchema[] = [
  {
    id: 'users',
    name: 'users',
    columns: [
      { name: 'user_id', type: 'text', isPk: true },
      { name: 'name', type: 'text' },
      { name: 'email', type: 'text', isUnique: true },
      { name: 'mobile_no', type: 'text' },
      { name: 'role', type: 'text' },
      { name: 'manager_id', type: 'text', isFk: true, refTable: 'users' },
      { name: 'photo_url', type: 'text' },
      { name: 'is_online', type: 'bool' },
      { name: 'last_sync', type: 'timestamptz' },
      { name: 'password', type: 'text' },
      { name: 'created_at', type: 'timestamptz' },
      { name: 'updated_at', type: 'timestamptz' },
      { name: 'is_tracking_active', type: 'bool' },
    ]
  },
  {
    id: 'followups',
    name: 'followups',
    columns: [
      { name: 'id', type: 'int8', isPk: true },
      { name: 'user_id', type: 'text', isFk: true, refTable: 'users' },
      { name: 'client_id', type: 'text' },
      { name: 'subject', type: 'text' },
      { name: 'notes', type: 'text' },
      { name: 'followup_date', type: 'timestamptz' },
      { name: 'status', type: 'text' },
      { name: 'created_at', type: 'timestamptz' },
      { name: 'updated_at', type: 'timestamptz' },
    ]
  },
  {
    id: 'daily_activity',
    name: 'daily_activity',
    columns: [
      { name: 'id', type: 'int8', isPk: true },
      { name: 'user_id', type: 'text', isFk: true, refTable: 'users' },
      { name: 'activity_date', type: 'date' },
      { name: 'type', type: 'text' },
      { name: 'location', type: 'text' },
      { name: 'latitude', type: 'numeric' },
      { name: 'longitude', type: 'numeric' },
      { name: 'description', type: 'text' },
      { name: 'details', type: 'text' },
      { name: 'created_at', type: 'timestamptz' },
      { name: 'updated_at', type: 'timestamptz' },
      { name: 'name', type: 'text' },
    ]
  }
];

const SchemaVisualizer: React.FC = () => {
  const [zoom, setZoom] = useState(1);
  const [tablePositions, setTablePositions] = useState<Record<string, Point>>({
    'users': { x: 700, y: 50 },
    'followups': { x: 50, y: 50 },
    'daily_activity': { x: 380, y: 300 }
  });
  
  const [draggingTable, setDraggingTable] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent, tableId: string) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    // Offset needs to be scaled by zoom to maintain mouse position relative to card top-left
    setDragOffset({
      x: (e.clientX - rect.left) / zoom,
      y: (e.clientY - rect.top) / zoom
    });
    setDraggingTable(tableId);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!draggingTable || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    
    // Calculate new position in the coordinate space of the canvas
    const newX = (e.clientX - containerRect.left) / zoom - dragOffset.x;
    const newY = (e.clientY - containerRect.top) / zoom - dragOffset.y;

    setTablePositions(prev => ({
      ...prev,
      [draggingTable]: { x: newX, y: newY }
    }));
  }, [draggingTable, dragOffset, zoom]);

  const handleMouseUp = useCallback(() => {
    setDraggingTable(null);
  }, []);

  useEffect(() => {
    if (draggingTable) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingTable, handleMouseMove, handleMouseUp]);

  const renderConnectors = () => {
    return NUVABASE_SCHEMA.map(table => {
      const startPos = tablePositions[table.id];
      if (!startPos) return null;

      return table.columns.filter(col => col.isFk && col.refTable).map((col, idx) => {
        const targetTableId = col.refTable!;
        const endPos = tablePositions[targetTableId];
        if (!endPos) return null;

        // Visual logic for line anchors
        // We assume 256px width (w-64) for tables
        const tableWidth = 256;
        const columnHeight = 24; // Approximation
        const headerHeight = 36;
        
        // Find column index for vertical offset
        const colIdx = table.columns.findIndex(c => c.name === col.name);
        
        const startX = startPos.x + tableWidth;
        const startY = startPos.y + headerHeight + (colIdx * columnHeight) + (columnHeight / 2);
        
        // Target is always the header of the target table for simplicity, or left side
        const endX = endPos.x;
        const endY = endPos.y + 20;

        const controlPointDistance = Math.abs(endX - startX) / 2;

        return (
          <g key={`${table.id}-${col.name}`}>
            <path
              d={`M ${startX} ${startY} C ${startX + controlPointDistance} ${startY}, ${endX - controlPointDistance} ${endY}, ${endX} ${endY}`}
              fill="none"
              stroke={draggingTable === table.id || draggingTable === targetTableId ? "#3ecf8e" : "#2e2e2e"}
              strokeWidth={draggingTable === table.id || draggingTable === targetTableId ? "2" : "1.5"}
              strokeDasharray={draggingTable ? "0" : "4 4"}
              className="transition-all duration-300 opacity-60 hover:opacity-100 hover:stroke-[#3ecf8e]"
            />
            {/* Connection end circle */}
            <circle cx={endX} cy={endY} r="3" fill="#3ecf8e" className="opacity-80" />
          </g>
        );
      });
    });
  };

  return (
    <div className="h-full w-full bg-[#0f0f0f] relative overflow-hidden flex flex-col animate-fadeIn select-none">
      {/* Visualizer Header */}
      <header className="h-14 border-b border-[#2e2e2e] bg-[#161616] flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-[#2e2e2e] rounded text-[#3ecf8e]">
            <Database size={16} />
          </div>
          <div className="flex flex-col">
            <h2 className="text-sm font-bold text-white tracking-tight">Interactive Schema Explorer</h2>
            <span className="text-[9px] text-[#444] font-black uppercase tracking-widest">PostgreSQL Entity Relationship Diagram</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
            <div className="flex bg-[#1c1c1c] border border-[#2e2e2e] rounded-md p-1">
                <button onClick={() => setZoom(z => Math.max(0.3, z - 0.1))} className="p-1.5 text-[#9b9b9b] hover:text-white hover:bg-[#2e2e2e] rounded transition-colors" title="Zoom Out"><ZoomOut size={14}/></button>
                <div className="px-2 text-[10px] font-mono text-[#444] flex items-center">{Math.round(zoom * 100)}%</div>
                <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="p-1.5 text-[#9b9b9b] hover:text-white hover:bg-[#2e2e2e] rounded transition-colors" title="Zoom In"><ZoomIn size={14}/></button>
            </div>
            <button onClick={() => setZoom(1)} className="p-2 text-[#9b9b9b] hover:text-white transition-colors" title="Reset Zoom"><Maximize size={16}/></button>
            <div className="h-4 w-px bg-[#2e2e2e] mx-2"></div>
            <button className="sb-button-primary flex items-center gap-2 h-8 py-0">
                <Plus size={14} /> New Table
            </button>
        </div>
      </header>

      {/* Drawing Canvas */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto bg-[#0f0f0f] relative custom-scrollbar scroll-smooth"
      >
        <div 
          style={{ 
            transform: `scale(${zoom})`, 
            transformOrigin: '0 0',
            width: '3000px',
            height: '3000px',
            cursor: draggingTable ? 'grabbing' : 'default'
          }}
          className="relative transition-transform duration-75"
        >
          {/* SVG Connector Layer */}
          <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#3ecf8e" />
              </marker>
            </defs>
            {renderConnectors()}
          </svg>

          {/* Table Cards */}
          {NUVABASE_SCHEMA.map(table => {
            const pos = tablePositions[table.id] || { x: 0, y: 0 };
            const isActive = draggingTable === table.id;

            return (
              <div 
                key={table.id}
                onMouseDown={(e) => handleMouseDown(e, table.id)}
                className={`absolute w-64 bg-[#1c1c1c] border rounded-lg shadow-2xl overflow-hidden transition-all duration-150 ${
                  isActive 
                  ? 'border-[#3ecf8e] shadow-[0_0_30px_rgba(62,207,142,0.15)] z-50 scale-[1.02]' 
                  : 'border-[#2e2e2e] hover:border-[#444] z-10'
                }`}
                style={{ left: pos.x, top: pos.y, cursor: isActive ? 'grabbing' : 'grab' }}
              >
                <div className={`px-4 py-2 border-b flex items-center justify-between ${
                  isActive ? 'bg-[#242424] border-[#3ecf8e]/30' : 'bg-[#1a1a1a] border-[#2e2e2e]'
                }`}>
                  <div className="flex items-center gap-2">
                    <Database size={14} className={isActive ? "text-[#3ecf8e]" : "text-[#9b9b9b]"} />
                    <span className="text-xs font-bold text-white tracking-tight">{table.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Grab size={12} className="text-[#444] opacity-0 group-hover:opacity-100" />
                    <button className="text-[#444] hover:text-[#3ecf8e] transition-colors">
                      <ExternalLink size={12} />
                    </button>
                  </div>
                </div>

                <div className="py-1 bg-[#161616]">
                  {table.columns.map(col => (
                    <div key={col.name} className="px-4 py-1.5 flex items-center justify-between hover:bg-[#2e2e2e]/50 transition-colors cursor-default group">
                      <div className="flex items-center gap-2">
                        <div className="w-4 flex justify-center">
                          {col.isPk && <Key size={10} className="text-[#3ecf8e]" />}
                          {col.isFk && <Diamond size={10} className="text-blue-400" />}
                          {col.isUnique && <Shield size={10} className="text-orange-400" />}
                        </div>
                        <span className={`text-[11px] ${col.isPk ? 'text-white font-bold' : 'text-[#ededed]'}`}>{col.name}</span>
                      </div>
                      <span className="text-[9px] font-mono text-[#444] group-hover:text-[#9b9b9b] uppercase tracking-tighter">
                          {col.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Infinite Grid Background */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
             style={{ 
               backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
               backgroundSize: `${40 * zoom}px ${40 * zoom}px`
             }}>
        </div>
      </div>

      <footer className="h-10 border-t border-[#2e2e2e] bg-[#161616] px-6 flex items-center justify-between text-[10px] font-bold text-[#444] uppercase tracking-widest z-20">
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#3ecf8e]"></div>
                <span>Sync Active</span>
            </div>
            <div className="flex items-center gap-1.5">
                <MousePointer2 size={12} />
                <span>Drag tables to organize sharded schema</span>
            </div>
        </div>
        <div className="flex items-center gap-4">
            <span>Coordinate Space: 3000x3000px</span>
            <span className="text-[#2e2e2e]">|</span>
            <span>{NUVABASE_SCHEMA.length} Entities mapped</span>
        </div>
      </footer>
    </div>
  );
};

export default SchemaVisualizer;
