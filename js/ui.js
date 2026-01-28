import { auth } from './auth.js';

/**
 * Common UI Library
 * Injects the platform shell into target elements.
 */
export const ui = {
    init(activePageId) {
        this.renderSidebar(activePageId);
        this.renderNavbar();
    },

    renderSidebar(activePageId) {
        const target = document.getElementById('sidebar-target');
        if (!target) return;

        const menuItems = [
            { id: 'dashboard', label: 'Dashboard', icon: '📊' },
            { id: 'tables', label: 'Table Editor', icon: '💾' },
            { id: 'auth', label: 'Auth Users', icon: '👥' },
            { id: 'settings', label: 'Settings', icon: '⚙️' }
        ];

        target.innerHTML = `
            <aside class="w-64 bg-[#1c2128] border-r border-[#30363d] flex flex-col h-screen fixed left-0 top-0">
                <div class="p-6">
                    <div class="flex items-center gap-3 mb-10">
                        <div class="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-black text-black">N</div>
                        <span class="text-xl font-black text-white tracking-tighter">Nuvabase</span>
                    </div>
                    
                    <nav class="space-y-1">
                        ${menuItems.map(item => `
                            <a href="${item.id}.html" class="sidebar-item ${activePageId === item.id ? 'sidebar-item-active' : ''}">
                                <span class="text-lg">${item.icon}</span>
                                ${item.label}
                            </a>
                        `).join('')}
                    </nav>
                </div>
                
                <div class="mt-auto p-6 border-t border-[#30363d]">
                    <div class="bg-[#0d1117] p-4 rounded-xl border border-[#30363d]">
                        <p class="text-[10px] font-black text-[#484f58] uppercase mb-2">Usage Plan</p>
                        <div class="flex justify-between items-end mb-1">
                            <span class="text-xs font-bold text-white">Pro Cluster</span>
                            <span class="text-[10px] text-emerald-500">85% full</span>
                        </div>
                        <div class="w-full bg-[#30363d] h-1 rounded-full overflow-hidden">
                            <div class="bg-emerald-500 h-full w-[85%]"></div>
                        </div>
                    </div>
                </div>
            </aside>
            <div class="w-64 h-screen shrink-0"></div> <!-- Placeholder for fixed sidebar -->
        `;
    },

    renderNavbar() {
        const target = document.getElementById('navbar-target');
        if (!target) return;

        const user = auth.getUser();

        target.innerHTML = `
            <header class="h-16 border-b border-[#30363d] bg-[#0d1117]/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-50">
                <div class="flex items-center gap-4 text-[10px] font-black tracking-widest text-[#484f58] uppercase">
                    <span>Shard /</span>
                    <span class="text-white">US-EAST-1</span>
                </div>
                
                <div class="flex items-center gap-6">
                    <div class="flex items-center gap-3">
                        <div class="text-right hidden sm:block">
                            <div class="text-xs font-black text-white">${user.full_name || 'Admin User'}</div>
                            <div class="text-[9px] text-[#8b949e] uppercase font-bold tracking-widest">${user.role || 'OWNER'}</div>
                        </div>
                        <div class="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-black border border-[#30363d]">
                            ${(user.full_name || 'A')[0]}
                        </div>
                    </div>
                    <button id="logout-btn" class="text-[#8b949e] hover:text-red-400 text-xs font-bold transition-colors">Sign Out</button>
                </div>
            </header>
        `;

        document.getElementById('logout-btn').onclick = () => auth.logout();
    }
};