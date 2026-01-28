
import React, { useState, useEffect, useRef } from 'react';
import { 
  Wifi, 
  Zap, 
  Users, 
  Database, 
  Radio, 
  Terminal, 
  Activity, 
  ChevronRight, 
  Send,
  ShieldCheck,
  Pause,
  Play,
  Trash2,
  Clock
} from 'lucide-react';

interface RealtimeEvent {
  id: string;
  type: 'INSERT' | 'UPDATE' | 'DELETE' | 'BROADCAST' | 'PRESENCE';
  source: string;
  payload: any;
  timestamp: string;
  latency: string;
}

interface PresenceUser {
  id: string;
  name: string;
  status: 'online' | 'away';
  lastSeen: string;
}

const RealtimeView: React.FC = () => {
  const [events, setEvents] = useState<RealtimeEvent[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [activeChannel, setActiveChannel] = useState('public:global');
  const [broadcastPayload, setBroadcastPayload] = useState('{"message": "Hello Nuvabase!"}');
  const [presence, setPresence] = useState<PresenceUser[]>([
    { id: '1', name: 'dev_alex', status: 'online', lastSeen: 'Just now' },
    { id: '2', name: 'system_monitor', status: 'online', lastSeen: '2s ago' },
    { id: '3', name: 'client_app_ios', status: 'away', lastSeen: '5m ago' },
  ]);

  const eventEndRef = useRef<HTMLDivElement>(null);

  // Simulate incoming events
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      const types: RealtimeEvent['type'][] = ['INSERT', 'UPDATE', 'DELETE', 'BROADCAST'];
      const sources = ['users', 'followups', 'client_web', 'api_gateway'];
      
      const newEvent: RealtimeEvent = {
        id: Math.random().toString(36).substr(2, 9),
        type: types[Math.floor(Math.random() * types.length)],
        source: sources[Math.floor(Math.random() * sources.length)],
        payload: {
          id: Math.floor(Math.random() * 1000),
          data: "sharded_payload_" + Math.random().toString(36).substr(2, 4),
          meta: { region: "us-east-1", shard: "node-24" }
        },
        timestamp: new Date().toLocaleTimeString(),
        latency: Math.floor(Math.random() * 50 + 10) + 'ms'
      };

      setEvents(prev => [newEvent, ...prev].slice(0, 50));
    }, 3000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const handleSendBroadcast = () => {
    try {
      const parsed = JSON.parse(broadcastPayload);
      const newEvent: RealtimeEvent = {
        id: 'b-' + Date.now(),
        type: 'BROADCAST',
        source: 'dashboard_admin',
        payload: parsed,
        timestamp: new Date().toLocaleTimeString(),
        latency: '8ms'
      };
      setEvents(prev => [newEvent, ...prev]);
      setBroadcastPayload('{"message": "Sent at ' + new Date().toLocaleTimeString() + '"}');
    } catch (e) {
      alert("Invalid JSON payload");
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'INSERT': return 'text-emerald-400';
      case 'UPDATE': return 'text-blue-400';
      case 'DELETE': return 'text-red-400';
      case 'BROADCAST': return 'text-purple-400';
      default: return 'text-white';
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#161616] animate-fadeIn">
      {/* Realtime Header */}
      <header className="h-14 border-b border-[#2e2e2e] bg-[#1c1c1c] flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-emerald-500/10 rounded text-[#3ecf8e]">
            <Wifi size={16} />
          </div>
          <div className="flex flex-col">
            <h2 className="text-sm font-bold text-white tracking-tight">Realtime Inspector</h2>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[9px] font-black text-[#444] uppercase tracking-widest">Connected to WebSocket Mesh</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
            <button 
                onClick={() => setIsPaused(!isPaused)}
                className="text-xs text-[#9b9b9b] hover:text-white flex items-center gap-2 px-3 py-1.5 rounded bg-[#2e2e2e] transition-colors"
            >
                {isPaused ? <Play size={14} /> : <Pause size={14} />}
                {isPaused ? 'Resume Stream' : 'Pause Stream'}
            </button>
            <button 
                onClick={() => setEvents([])}
                className="text-xs text-[#9b9b9b] hover:text-red-400 flex items-center gap-2 px-3 py-1.5 rounded transition-colors"
            >
                <Trash2 size={14} /> Clear
            </button>
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        {/* Left Sidebar: Presence & Channels */}
        <aside className="w-64 border-r border-[#2e2e2e] bg-[#1c1c1c] flex flex-col shrink-0">
          <div className="p-4 border-b border-[#2e2e2e] space-y-4">
            <div>
              <label className="text-[10px] font-black text-[#444] uppercase tracking-widest block mb-2">Active Channel</label>
              <div className="flex items-center gap-2 bg-[#0f0f0f] border border-[#2e2e2e] rounded-lg px-3 py-2">
                <Radio size={12} className="text-emerald-500" />
                <span className="text-xs text-white font-mono">{activeChannel}</span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <label className="text-[10px] font-black text-[#444] uppercase tracking-widest flex items-center gap-2">
                  <Users size={12} /> Presence
                </label>
                <span className="text-[9px] bg-[#2e2e2e] px-1.5 py-0.5 rounded text-[#9b9b9b]">{presence.length}</span>
              </div>
              
              <div className="space-y-1">
                {presence.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-[#2e2e2e] transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${user.status === 'online' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-orange-500'}`}></div>
                      <span className="text-xs text-[#ededed] group-hover:text-white transition-colors">{user.name}</span>
                    </div>
                    <span className="text-[9px] text-[#444]">{user.lastSeen}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-[#2e2e2e]">
              <label className="text-[10px] font-black text-[#444] uppercase tracking-widest flex items-center gap-2 mb-4">
                <Database size={12} /> DB Subscriptions
              </label>
              <div className="space-y-3">
                {['users', 'followups', 'daily_activity'].map(table => (
                  <div key={table} className="flex items-center justify-between">
                    <span className="text-xs text-[#9b9b9b] font-mono">{table}</span>
                    <div className="w-8 h-4 bg-emerald-500/20 rounded-full relative p-0.5 cursor-pointer border border-emerald-500/30">
                      <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full absolute right-1"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 bg-[#161616] border-t border-[#2e2e2e]">
             <div className="flex items-center gap-3 mb-2">
                <Activity size={14} className="text-emerald-500" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Global Throughput</span>
             </div>
             <div className="text-[11px] text-[#444] flex justify-between font-mono">
                <span>Egress: 4.2 MB/s</span>
                <span>Ingress: 1.1 MB/s</span>
             </div>
          </div>
        </aside>

        {/* Main Event Stream */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#0f0f0f]">
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar flex flex-col-reverse">
                <div ref={eventEndRef} />
                {events.map((event) => (
                    <div key={event.id} className="bg-[#161616] border border-[#2e2e2e] rounded-xl overflow-hidden animate-slideIn">
                        <div className="px-4 py-2 border-b border-[#2e2e2e] flex items-center justify-between bg-[#1c1c1c]">
                            <div className="flex items-center gap-3">
                                <span className={`text-[10px] font-black uppercase tracking-widest ${getEventColor(event.type)}`}>
                                    {event.type}
                                </span>
                                <span className="text-[#444] text-[10px]">/</span>
                                <span className="text-xs text-[#9b9b9b] font-mono">{event.source}</span>
                            </div>
                            <div className="flex items-center gap-3 text-[10px] text-[#444] font-mono">
                                <span className="flex items-center gap-1"><Clock size={10} /> {event.timestamp}</span>
                                <span className="flex items-center gap-1"><Zap size={10} /> {event.latency}</span>
                            </div>
                        </div>
                        <div className="p-4">
                            <pre className="text-[11px] font-mono text-emerald-500/80 overflow-x-auto">
                                {JSON.stringify(event.payload, null, 2)}
                            </pre>
                        </div>
                    </div>
                ))}

                {events.length === 0 && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center opacity-20">
                      <Terminal size={48} className="mb-4" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Listening for events...</p>
                  </div>
                )}
            </div>

            {/* Broadcast Controls */}
            <div className="p-6 bg-[#161616] border-t border-[#2e2e2e] shrink-0">
                <div className="flex items-center gap-2 mb-3">
                    <Radio size={14} className="text-purple-400" />
                    <span className="text-[10px] font-black text-[#9b9b9b] uppercase tracking-widest">Simulate Broadcast</span>
                </div>
                <div className="flex gap-4">
                    <input 
                        type="text" 
                        value={broadcastPayload}
                        onChange={(e) => setBroadcastPayload(e.target.value)}
                        className="flex-1 bg-[#0f0f0f] border border-[#2e2e2e] rounded-xl px-4 py-2 text-xs font-mono text-[#ededed] outline-none focus:border-purple-500 transition-colors"
                        placeholder='{"event": "test", "data": {}}'
                    />
                    <button 
                        onClick={handleSendBroadcast}
                        className="bg-purple-500 hover:bg-purple-400 text-black font-bold px-6 py-2 rounded-xl text-xs flex items-center gap-2 transition-all active:scale-95"
                    >
                        <Send size={14} /> Send
                    </button>
                </div>
            </div>
        </main>
      </div>

      {/* Footer Info */}
      <footer className="h-10 border-t border-[#2e2e2e] bg-[#1c1c1c] px-6 flex items-center justify-between text-[10px] font-bold text-[#444] uppercase tracking-widest shrink-0">
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
                <ShieldCheck size={12} className="text-emerald-500" />
                <span>End-to-End Encryption Enabled</span>
            </div>
            <span className="text-[#2e2e2e]">|</span>
            <span>Edge Cluster: lhr-1 (London)</span>
        </div>
        <div className="flex items-center gap-4">
            <span>Protocol: v4.1 (Binary/JSON)</span>
        </div>
      </footer>
    </div>
  );
};

export default RealtimeView;
