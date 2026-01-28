
import React, { useState } from 'react';
import { Plus, Search, Filter, Grid3X3, List as ListIcon, Database, Activity, ShieldCheck, Globe } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  ref: string;
  region: string;
  status: 'active' | 'paused';
  env: 'prod' | 'dev' | 'staging';
  health: number;
}

interface ProjectListProps {
  onSelectProject: (p: Project) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ onSelectProject }) => {
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');

  const projects: Project[] = [
    { id: '1', name: 'Production-Core', ref: 'sh-x82k91', region: 'us-east-1', status: 'active', env: 'prod', health: 99.9 },
    { id: '2', name: 'Staging-Mirror', ref: 'sh-p22l00', region: 'us-west-2', status: 'active', env: 'staging', health: 100 },
    { id: '3', name: 'Archive-v1', ref: 'sh-z99a12', region: 'eu-west-1', status: 'paused', env: 'dev', health: 0 }
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-[#161616] p-8 lg:p-12">
      <div className="max-w-6xl mx-auto space-y-10 animate-fadeIn">
        <header className="flex justify-between items-end">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-white tracking-tight">Projects</h1>
            <p className="text-[#9b9b9b] text-sm">Select a sharded instance to manage infrastructure via NovaBase Console.</p>
          </div>
          <button className="bg-[#3ecf8e] hover:bg-[#3ecf8e]/90 text-black font-bold px-5 py-2 rounded-lg text-sm transition-all flex items-center gap-2 active:scale-95">
            <Plus size={18} /> New project
          </button>
        </header>

        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#2e2e2e] pb-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-2.5 text-[#444]" />
                <input 
                  type="text" 
                  placeholder="Filter projects..."
                  className="bg-[#1c1c1c] border border-[#2e2e2e] rounded-lg py-2 pl-9 pr-4 text-xs w-64 outline-none focus:border-[#3ecf8e] transition-colors"
                />
              </div>
              <button className="p-2 border border-[#2e2e2e] text-[#444] hover:text-white rounded-lg transition-colors">
                <Filter size={14} />
              </button>
            </div>
            
            <div className="flex items-center bg-[#1c1c1c] p-1 rounded-lg border border-[#2e2e2e]">
              <button 
                onClick={() => setViewType('grid')}
                className={`p-1.5 rounded-md transition-all ${viewType === 'grid' ? 'bg-[#2e2e2e] text-[#3ecf8e]' : 'text-[#444]'}`}
              >
                <Grid3X3 size={14} />
              </button>
              <button 
                onClick={() => setViewType('list')}
                className={`p-1.5 rounded-md transition-all ${viewType === 'list' ? 'bg-[#2e2e2e] text-[#3ecf8e]' : 'text-[#444]'}`}
              >
                <ListIcon size={14} />
              </button>
            </div>
          </div>

          <div className={`grid gap-5 ${viewType === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {projects.map((project) => (
              <div 
                key={project.id}
                onClick={() => onSelectProject(project)}
                className="group relative bg-[#1c1c1c] border border-[#2e2e2e] hover:border-[#3ecf8e]/30 hover:bg-[#1e1e1e] rounded-xl p-6 transition-all cursor-pointer overflow-hidden active:scale-[0.99] shadow-sm hover:shadow-emerald-500/5"
              >
                <div className="flex flex-col gap-5">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white group-hover:text-[#3ecf8e] transition-colors">{project.name}</h3>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${
                          project.env === 'prod' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                          project.env === 'staging' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 
                          'bg-blue-500/10 text-blue-500 border-blue-500/20'
                        }`}>
                          {project.env}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#444] font-mono tracking-tight">{project.ref}</p>
                    </div>
                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${
                      project.status === 'active' ? 'bg-[#3ecf8e]/10 text-[#3ecf8e]' : 'bg-[#2e2e2e] text-[#444]'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${project.status === 'active' ? 'bg-[#3ecf8e] animate-pulse' : 'bg-[#444]'}`}></div>
                      <span className="text-[9px] font-black uppercase">{project.status}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-[#2e2e2e]">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-[10px] text-[#9b9b9b] font-medium">
                        <Globe size={12} className="text-[#444]" />
                        <span>{project.region}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-[#9b9b9b] font-medium">
                        <Activity size={12} className="text-[#444]" />
                        <span>{project.health}% health</span>
                      </div>
                    </div>
                    <ShieldCheck size={14} className="text-[#3ecf8e] opacity-40 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </div>
            ))}
            
            <button className="border-2 border-dashed border-[#2e2e2e] hover:border-[#3ecf8e]/40 hover:bg-[#3ecf8e]/5 rounded-xl p-6 flex flex-col items-center justify-center gap-2 text-[#444] hover:text-[#3ecf8e] transition-all group">
               <Plus size={24} className="group-hover:scale-110 transition-transform" />
               <span className="text-[10px] font-black uppercase tracking-widest">New Project</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectList;
