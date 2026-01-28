import React from 'react';
import { Project } from '../types.ts';

interface ProjectDetailViewProps {
  project: Project;
  onBack: () => void;
}

const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({ project, onBack }) => {
  return (
    <div className="p-8">
      <button onClick={onBack} className="text-sm text-[#8b949e] mb-4 hover:text-white">&larr; Back to Dashboard</button>
      <h1 className="text-2xl font-bold">{project.name}</h1>
      <p className="text-emerald-500 font-mono text-sm">{project.ref_id}</p>
    </div>
  );
};

export default ProjectDetailView;