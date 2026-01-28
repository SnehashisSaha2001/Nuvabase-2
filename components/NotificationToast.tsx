
import React from 'react';

interface Notification {
  id: string;
  message: string;
  traceId?: string;
  type?: 'info' | 'warn' | 'error';
}

interface NotificationToastProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ notifications, onRemove }) => {
  return (
    <div className="fixed bottom-8 right-8 z-[200] space-y-3 pointer-events-none">
      {notifications.map((n) => (
        <div 
          key={n.id}
          className={`bg-[#1c2128] border border-[#30363d] text-white px-6 py-4 rounded-2xl shadow-2xl flex flex-col min-w-[320px] animate-slideIn pointer-events-auto relative overflow-hidden group`}
        >
          {/* Status Indicator Bar */}
          <div className={`absolute top-0 left-0 bottom-0 w-1 ${
              n.type === 'error' ? 'bg-red-500' : n.type === 'warn' ? 'bg-yellow-500' : 'bg-emerald-500'
          }`}></div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-1.5 h-1.5 rounded-full ${
                  n.type === 'error' ? 'bg-red-500' : n.type === 'warn' ? 'bg-yellow-500' : 'bg-emerald-500'
              } animate-pulse`}></div>
              <span className="text-sm font-bold tracking-tight">{n.message}</span>
            </div>
            <button 
              onClick={() => onRemove(n.id)}
              className="ml-4 text-[#484f58] hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
          
          {n.traceId && (
            <div className="mt-2 flex items-center justify-between pt-2 border-t border-[#30363d]">
                <span className="text-[9px] font-black text-[#484f58] uppercase tracking-widest">Trace ID</span>
                <code className="text-[9px] font-mono text-[#8b949e] bg-[#0d1117] px-1.5 py-0.5 rounded border border-[#30363d] group-hover:text-emerald-500 transition-colors">
                    {n.traceId}
                </code>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default NotificationToast;
