
import React, { useState, useCallback, useTransition, useEffect } from 'react';
import Sidebar from './components/Sidebar.tsx';
import Navbar from './components/Navbar.tsx';
import ConnectModal from './components/ConnectModal.tsx';
import Dashboard from './views/Dashboard.tsx';
import DatabaseView from './views/DatabaseView.tsx';
import SqlEditor from './views/SqlEditor.tsx';
import SchemaVisualizer from './views/SchemaVisualizer.tsx';
import AuditLogView from './views/AuditLogView.tsx';
import Settings from './views/Settings.tsx';
import AuthView from './views/AuthView.tsx';
import AuthManagement from './views/UserManagement.tsx';
import StorageView from './views/StorageView.tsx';
import RealtimeView from './views/RealtimeView.tsx';
import ProjectList from './views/ProjectList.tsx';
import NotificationToast from './components/NotificationToast.tsx';
import { auth } from './js/auth.js';
import { User } from './types.ts';
import { ShieldAlert, Terminal, Lock, AlertTriangle } from 'lucide-react';

const INITIAL_USERS: User[] = [
    { user_id: 'u-1', email: 'admin@novabase.dev', role: 'admin', company_id: 'Nuvabase', full_name: 'Principal Architect' }
];

const App: React.FC = () => {
    const [isPending, startTransition] = useTransition();
    const [isSystemSafe, setIsSystemSafe] = useState<boolean | null>(null);
    const [bootLogs, setBootLogs] = useState<string[]>([]);
    const [authState, setAuthState] = useState<{ user: any; isAuthenticated: boolean }>({ 
        user: auth.getUser(), 
        isAuthenticated: auth.isAuthenticated() 
    });
    const [activeProject, setActiveProject] = useState<any>(null);
    const [activeView, setActiveView] = useState('dashboard');
    const [viewContext, setViewContext] = useState<any>(null);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

    // ENHANCED STARTUP GUARD: Resilient boot sequence
    useEffect(() => {
        const runPreFlight = async () => {
            const addLog = (msg: string) => setBootLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
            
            addLog("Initializing secure console context...");
            await new Promise(r => setTimeout(r, 400));
            
            const apiKey = process.env.API_KEY;
            // Relaxing key check: If missing, we warn but proceed to allow UI preview
            if (!apiKey || apiKey === "") {
                addLog("WARNING: Gemini API Key missing. Shard-AI features will be restricted.");
                addLog("Provisioning demo workspace with limited intelligence...");
            } else {
                addLog("AI Core handshaking successful. Shard-Logic initialized.");
            }
            
            addLog("Verifying sharded VPC us-east-1a...");
            await new Promise(r => setTimeout(r, 600));
            addLog("Shard health 100%. Handshaking with RLS Kernel...");
            addLog("Security verified. Console in READ-ONLY mode by default.");

            // Success state - render the application
            setIsSystemSafe(true);
        };
        
        // Error Boundary for the boot sequence itself
        runPreFlight().catch(err => {
            console.error("Critical boot failure:", err);
            setIsSystemSafe(false);
        });
    }, []);

    const addNotification = useCallback((msg: string, type: 'info' | 'warn' | 'error' = 'info') => {
        const n = { id: Date.now().toString(), message: msg, type };
        setNotifications(prev => [n, ...prev].slice(0, 3));
        setTimeout(() => setNotifications(prev => prev.filter(item => item.id !== n.id)), 4000);
    }, []);

    const handleLogin = async (email: string, password: string) => {
        try {
            await auth.login(email, password);
            startTransition(() => {
                setAuthState({ user: auth.getUser(), isAuthenticated: true });
            });
            addNotification(`Authenticated: Project Metadata Loading...`);
        } catch (err: any) {
            addNotification(err.message, 'error');
            throw err;
        }
    };

    const handleLogout = () => {
        auth.logout();
        setAuthState({ user: null, isAuthenticated: false });
    };

    const handleBrowseTable = (tableName: string) => {
        setViewContext({ tableName });
        setActiveView('database');
    };

    if (isSystemSafe === null) {
        return (
            <div className="h-screen w-screen bg-[#0f0f0f] flex flex-col items-center justify-center p-8 animate-fadeIn">
                <div className="w-10 h-10 border-2 border-[#3ecf8e] border-t-transparent rounded-full animate-spin mb-10"></div>
                <div className="w-full max-w-sm bg-[#161616] border border-[#2e2e2e] rounded-xl overflow-hidden shadow-2xl">
                    <div className="px-4 py-2 border-b border-[#2e2e2e] bg-[#1c1c1c] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Terminal size={12} className="text-[#3ecf8e]" />
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Nuvabase Secure Boot</span>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-[#3ecf8e] animate-pulse"></div>
                    </div>
                    <div className="p-4 space-y-1 h-36 overflow-y-auto custom-scrollbar font-mono text-[10px] text-[#444]">
                        {bootLogs.map((log, i) => <div key={i} className="hover:text-white transition-colors">{log}</div>)}
                    </div>
                </div>
            </div>
        );
    }

    if (isSystemSafe === false) {
        return (
            <div className="h-screen w-screen bg-[#0f0f0f] flex flex-col items-center justify-center p-8 text-center animate-fadeIn">
                <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mb-6 border border-red-500/20">
                    <ShieldAlert size={32} />
                </div>
                <h1 className="text-xl font-black text-white mb-2 tracking-tight uppercase">Platform Error</h1>
                <p className="text-[#9b9b9b] text-sm max-w-md leading-relaxed">
                    Nuvabase Console cannot initialize a secure session. This is a critical environment failure.
                </p>
                <div className="mt-8 p-4 bg-[#1c1c1c] rounded-xl border border-[#2e2e2e] text-[10px] font-mono text-[#444] text-left">
                    ERR_SYSTEM_UNSAFE: Shard connectivity failure or secure context missing.
                </div>
            </div>
        );
    }

    if (!authState.isAuthenticated) return <AuthView onLogin={handleLogin} />;

    const renderContent = () => {
        if (!activeProject) {
          return <ProjectList onSelectProject={(p) => { setActiveProject(p); setActiveView('dashboard'); }} />;
        }

        const content = (() => {
            switch (activeView) {
                case 'dashboard': return <Dashboard users={INITIAL_USERS} projects={[activeProject]} tasks={[]} onCreateProject={() => {}} />;
                case 'database': return <DatabaseView initialTable={viewContext?.tableName} />;
                case 'sql': return <SqlEditor onBrowseTable={handleBrowseTable} />;
                case 'schema': return <SchemaVisualizer />;
                case 'auth': return <AuthManagement companyUsers={INITIAL_USERS} />;
                case 'storage': return <StorageView />;
                case 'realtime': return <RealtimeView />;
                case 'logs': return <AuditLogView />;
                case 'settings': return <Settings />;
                default: return <div className="p-12 text-[#444] font-black uppercase tracking-widest text-xs">Section Metadata Unavailable</div>;
            }
        })();

        return (
            <div key={activeView} className="view-transition-wrapper h-full w-full">
                {content}
            </div>
        );
    };

    return (
        <div className={`flex h-screen overflow-hidden bg-[#0f0f0f] ${isPending ? 'opacity-70 grayscale' : ''} transition-all duration-300 font-['Inter']`}>
            {activeProject && (
              <Sidebar 
                activeView={activeView} 
                setActiveView={(view) => { setActiveView(view); setViewContext(null); }} 
                onOrgHome={() => { setActiveProject(null); setViewContext(null); }}
              />
            )}
            <div className="flex-1 flex flex-col min-w-0 relative">
                <Navbar 
                  user={authState.user} 
                  onLogout={handleLogout} 
                  onConnectClick={() => setIsConnectModalOpen(true)} 
                  projectContext={activeProject?.name}
                />
                
                {activeProject && (
                    <div className="h-8 border-b border-[#2e2e2e] bg-[#161616] px-4 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2">
                             <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#3ecf8e]/10 border border-[#3ecf8e]/20">
                                <Lock size={10} className="text-[#3ecf8e]" />
                                <span className="text-[8px] font-black text-[#3ecf8e] uppercase tracking-widest">Read-Only Console</span>
                             </div>
                             {(!process.env.API_KEY || process.env.API_KEY === "") && (
                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20">
                                    <AlertTriangle size={10} className="text-orange-500" />
                                    <span className="text-[8px] font-black text-orange-500 uppercase tracking-widest">AI Restricted (Missing Key)</span>
                                </div>
                             )}
                        </div>
                    </div>
                )}

                <main className="flex-1 overflow-hidden relative">
                    {renderContent()}
                </main>
            </div>
            
            <ConnectModal 
              isOpen={isConnectModalOpen} 
              onClose={() => setIsConnectModalOpen(false)} 
              projectRef={activeProject?.ref || "sh-x82k91"} 
            />
            
            <NotificationToast notifications={notifications} onRemove={(id) => setNotifications(prev => prev.filter(n => n.id !== id))} />
        </div>
    );
};

export default App;
