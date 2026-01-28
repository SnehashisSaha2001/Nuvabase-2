
import React from 'react';
import { User as UserIcon, Shield, Key, Clock, MoreVertical, Search, Filter, ShieldCheck, Mail, Lock } from 'lucide-react';
import { User } from '../types.ts';

interface UserManagementProps {
  companyUsers: User[];
}

const UserManagement: React.FC<UserManagementProps> = ({ companyUsers }) => {
  return (
    <div className="flex-1 overflow-y-auto bg-[#161616] p-8 lg:p-12">
      <div className="max-w-6xl mx-auto space-y-10 animate-fadeIn">
        <header className="flex justify-between items-end">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-white tracking-tight">Authentication</h1>
            <p className="text-[#9b9b9b] text-sm">Identity and access control for your project's user base.</p>
          </div>
          <button className="bg-[#2e2e2e] hover:bg-[#333] text-white font-bold px-6 py-2.5 rounded-lg text-xs transition-all flex items-center gap-2 opacity-50 cursor-not-allowed">
            <Mail size={16} /> Invite User
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
                // Fix: Changed 'icon: User' to 'icon: UserIcon' to avoid conflict with the User type
                { label: 'Total Users', value: '1,249', icon: UserIcon },
                { label: 'Verified', value: '1,102', icon: ShieldCheck },
                { label: 'Last 24h Sign-ins', value: '42', icon: Clock }
            ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                    <div key={i} className="bg-[#1c1c1c] border border-[#2e2e2e] p-6 rounded-xl flex items-center gap-5">
                        <div className="p-3 bg-[#3ecf8e]/5 rounded-xl text-[#3ecf8e]">
                            <Icon size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-[#444] uppercase tracking-widest">{stat.label}</p>
                            <p className="text-xl font-bold text-white">{stat.value}</p>
                        </div>
                    </div>
                );
            })}
        </div>

        <div className="bg-[#1c1c1c] border border-[#2e2e2e] rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-[#2e2e2e] bg-[#1c1c1c]/50 flex justify-between items-center gap-4">
            <div className="flex-1 relative max-w-sm">
                <Search size={14} className="absolute left-3 top-2.5 text-[#444]" />
                <input type="text" placeholder="Search users by email or ID..." className="w-full bg-[#0f0f0f] border border-[#2e2e2e] rounded-lg py-2 pl-9 pr-4 text-xs text-white outline-none focus:border-[#3ecf8e]" />
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black text-[#444] uppercase">
                <Lock size={12} className="text-[#3ecf8e]" /> Read-Only Console
            </div>
          </div>
          
          <table className="w-full text-left">
            <thead className="bg-[#161616] border-b border-[#2e2e2e]">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-[#444] uppercase tracking-widest">User ID</th>
                <th className="px-6 py-4 text-[10px] font-black text-[#444] uppercase tracking-widest">Email</th>
                <th className="px-6 py-4 text-[10px] font-black text-[#444] uppercase tracking-widest">Role</th>
                <th className="px-6 py-4 text-[10px] font-black text-[#444] uppercase tracking-widest">Last Sign-in</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2e2e2e]">
              {companyUsers.map(user => (
                <tr key={user.user_id} className="hover:bg-[#1f1f1f] transition-colors group">
                  <td className="px-6 py-4 font-mono text-[10px] text-[#444] group-hover:text-[#3ecf8e] transition-colors">{user.user_id}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-white">{user.email}</span>
                        <span className="text-[10px] text-[#444]">{user.full_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded bg-[#2e2e2e] text-[#9b9b9b] border border-[#444]">{user.role}</span>
                  </td>
                  <td className="px-6 py-4 text-[10px] text-[#444] font-medium tracking-wide flex items-center gap-2">
                     <Clock size={12} /> Just now
                  </td>
                  <td className="px-6 py-4 text-right">
                     <button className="p-2 text-[#2e2e2e] hover:text-white transition-colors" title="User Actions">
                        <MoreVertical size={16} />
                     </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-6 bg-[#1c1c1c]/30 rounded-2xl border border-[#2e2e2e] flex items-start gap-4">
            <Shield className="text-[#3ecf8e] shrink-0" size={20} />
            <div className="space-y-1">
                <p className="text-xs font-bold text-white uppercase tracking-tight">Access Control (RBAC)</p>
                <p className="text-[11px] text-[#9b9b9b] leading-relaxed">Roles are enforced via PostgreSQL Row Level Security. Authenticated requests from clients are automatically filtered based on their identity token. Role modifications must be performed via the Management API.</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
