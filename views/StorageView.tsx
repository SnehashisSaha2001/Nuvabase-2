
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Plus, 
  Search, 
  MoreHorizontal, 
  File, 
  Image as ImageIcon, 
  FileText, 
  Music, 
  Video, 
  Trash2, 
  Download, 
  Globe, 
  Lock, 
  ChevronRight,
  Folder,
  ArrowLeft,
  Upload,
  ExternalLink,
  Shield,
  HardDrive
} from 'lucide-react';

interface Bucket {
  id: string;
  name: string;
  isPublic: boolean;
  fileCount: number;
  size: string;
}

interface StorageObject {
  id: string;
  name: string;
  type: string;
  size: string;
  updatedAt: string;
}

const StorageView: React.FC = () => {
  const [buckets, setBuckets] = useState<Bucket[]>([
    { id: 'b-1', name: 'avatars', isPublic: true, fileCount: 124, size: '42.5 MB' },
    { id: 'b-2', name: 'project-assets', isPublic: false, fileCount: 8, size: '1.2 GB' },
    { id: 'b-3', name: 'compliance-docs', isPublic: false, fileCount: 32, size: '150 KB' }
  ]);

  const [selectedBucket, setSelectedBucket] = useState<Bucket | null>(buckets[0]);
  const [objects, setObjects] = useState<StorageObject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingBucket, setIsCreatingBucket] = useState(false);
  const [newBucketName, setNewBucketName] = useState('');
  const [newBucketPublic, setNewBucketPublic] = useState(false);

  // Mock fetching objects for a bucket
  useEffect(() => {
    if (selectedBucket) {
      setIsLoading(true);
      setTimeout(() => {
        const mockObjects: StorageObject[] = [
          { id: 'obj-1', name: 'profile_hero.png', type: 'image/png', size: '2.4 MB', updatedAt: '2024-05-12 14:20' },
          { id: 'obj-2', name: 'user_terms.pdf', type: 'application/pdf', size: '120 KB', updatedAt: '2024-05-10 09:15' },
          { id: 'obj-3', name: 'onboarding_video.mp4', type: 'video/mp4', size: '15.8 MB', updatedAt: '2024-05-11 18:30' },
          { id: 'obj-4', name: 'api_config.yaml', type: 'text/yaml', size: '1.2 KB', updatedAt: '2024-05-12 11:00' },
        ];
        setObjects(mockObjects);
        setIsLoading(false);
      }, 500);
    }
  }, [selectedBucket]);

  const handleCreateBucket = () => {
    if (!newBucketName) return;
    const newB: Bucket = {
      id: `b-${Date.now()}`,
      name: newBucketName,
      isPublic: newBucketPublic,
      fileCount: 0,
      size: '0 B'
    };
    setBuckets([...buckets, newB]);
    setNewBucketName('');
    setIsCreatingBucket(false);
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon size={16} className="text-emerald-400" />;
    if (type.startsWith('video/')) return <Video size={16} className="text-blue-400" />;
    if (type.startsWith('audio/')) return <Music size={16} className="text-purple-400" />;
    if (type.includes('pdf') || type.includes('text')) return <FileText size={16} className="text-orange-400" />;
    return <File size={16} className="text-gray-400" />;
  };

  return (
    <div className="h-full flex flex-col bg-[#161616] animate-fadeIn">
      {/* Storage Header */}
      <header className="h-14 border-b border-[#2e2e2e] bg-[#1c1c1c] flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-[#2e2e2e] rounded text-[#3ecf8e]">
            <Box size={16} />
          </div>
          <h2 className="text-sm font-bold text-white tracking-tight">Storage Explorer</h2>
        </div>
        
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <Shield size={10} className="text-emerald-500" />
                <span className="text-[9px] font-black text-emerald-500 uppercase">S3-Compatible</span>
            </div>
            <button 
                onClick={() => setIsCreatingBucket(true)}
                className="sb-button-primary flex items-center gap-2 h-8 py-0"
            >
                <Plus size={14} /> New Bucket
            </button>
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        {/* Bucket Sidebar */}
        <aside className="w-64 border-r border-[#2e2e2e] bg-[#1c1c1c] flex flex-col shrink-0">
          <div className="p-4 border-b border-[#2e2e2e]">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-[#444]" size={14} />
              <input 
                type="text" 
                placeholder="Search buckets..."
                className="w-full bg-[#0f0f0f] border border-[#2e2e2e] rounded-md py-2 pl-9 pr-4 text-xs outline-none focus:border-[#3ecf8e] transition-colors"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-0.5 custom-scrollbar">
              <div className="px-3 py-2 text-[10px] font-black text-[#444] uppercase tracking-widest">All Buckets</div>
              {buckets.map(bucket => (
                  <button
                      key={bucket.id}
                      onClick={() => setSelectedBucket(bucket)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs transition-all ${
                          selectedBucket?.id === bucket.id 
                          ? 'bg-[#3ecf8e]/10 text-[#3ecf8e] font-semibold' 
                          : 'text-[#9b9b9b] hover:bg-[#2e2e2e] hover:text-white'
                      }`}
                  >
                      <div className="flex items-center gap-2.5">
                          <Folder size={16} className={selectedBucket?.id === bucket.id ? 'text-[#3ecf8e]' : 'text-[#444]'} />
                          <span>{bucket.name}</span>
                      </div>
                      {bucket.isPublic ? <Globe size={12} className="opacity-40" /> : <Lock size={12} className="opacity-40" />}
                  </button>
              ))}
          </div>
          <div className="p-4 bg-[#161616] border-t border-[#2e2e2e]">
            <div className="flex items-center gap-3">
                <HardDrive size={14} className="text-[#444]" />
                <div className="flex-1">
                    <div className="flex justify-between text-[10px] text-[#9b9b9b] uppercase font-black mb-1">
                        <span>Cluster Storage</span>
                        <span>1.4 GB / 10 GB</span>
                    </div>
                    <div className="w-full h-1 bg-[#2e2e2e] rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: '14%' }}></div>
                    </div>
                </div>
            </div>
          </div>
        </aside>

        {/* Object Explorer */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#0f0f0f]">
            {selectedBucket ? (
                <>
                    <div className="h-12 border-b border-[#2e2e2e] bg-[#161616] flex items-center justify-between px-6">
                        <div className="flex items-center gap-2 text-xs">
                            <span className="text-[#444]">Buckets</span>
                            <ChevronRight size={14} className="text-[#444]" />
                            <span className="text-white font-bold">{selectedBucket.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="text-xs text-[#9b9b9b] hover:text-white px-3 py-1.5 rounded transition-colors flex items-center gap-2">
                                <Download size={14} /> Download All
                            </button>
                            <button className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-4 py-1.5 rounded-lg text-xs flex items-center gap-2 transition-all">
                                <Upload size={14} /> Upload Object
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto relative custom-scrollbar">
                        {isLoading ? (
                            <div className="absolute inset-0 bg-[#0f0f0f]/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                                <div className="w-6 h-6 border-2 border-[#3ecf8e] border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead className="sticky top-0 bg-[#161616] z-10 border-b border-[#2e2e2e]">
                                    <tr>
                                        <th className="w-10 px-6 py-4"><input type="checkbox" className="rounded border-[#2e2e2e] bg-transparent" /></th>
                                        <th className="px-4 py-4 text-[10px] font-black text-[#444] uppercase tracking-widest">Name</th>
                                        <th className="px-4 py-4 text-[10px] font-black text-[#444] uppercase tracking-widest">Size</th>
                                        <th className="px-4 py-4 text-[10px] font-black text-[#444] uppercase tracking-widest">MIME Type</th>
                                        <th className="px-4 py-4 text-[10px] font-black text-[#444] uppercase tracking-widest">Last Modified</th>
                                        <th className="w-10 px-6 py-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#2e2e2e]">
                                    {objects.map((obj, i) => (
                                        <tr key={obj.id} className="hover:bg-[#161616] group transition-colors cursor-pointer">
                                            <td className="px-6 py-4"><input type="checkbox" className="rounded border-[#2e2e2e] bg-transparent" /></td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    {getFileIcon(obj.type)}
                                                    <span className="text-xs text-white font-medium group-hover:text-emerald-400 transition-colors">{obj.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-xs text-[#9b9b9b]">{obj.size}</td>
                                            <td className="px-4 py-4 text-xs font-mono text-[#444]">{obj.type}</td>
                                            <td className="px-4 py-4 text-xs text-[#444]">{obj.updatedAt}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="text-[#444] hover:text-white transition-colors">
                                                    <MoreHorizontal size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {objects.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="py-24 text-center">
                                                <div className="flex flex-col items-center justify-center opacity-20">
                                                    <Box size={48} className="mb-4" />
                                                    <p className="text-[10px] font-black uppercase tracking-widest">This bucket is empty</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-[#444] p-12 text-center">
                    <Box size={64} className="mb-6 opacity-20" />
                    <h3 className="text-lg font-bold text-white mb-2">No Bucket Selected</h3>
                    <p className="text-sm max-w-xs mb-8">Select a bucket from the sidebar to view its objects or create a new sharded container.</p>
                    <button 
                        onClick={() => setIsCreatingBucket(true)}
                        className="sb-button-primary"
                    >
                        <Plus size={16} /> Create Bucket
                    </button>
                </div>
            )}
        </main>
      </div>

      {/* Create Bucket Modal */}
      {isCreatingBucket && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsCreatingBucket(false)}></div>
            <div className="relative bg-[#1c1c1c] border border-[#2e2e2e] w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-slideUp">
                <div className="p-6 border-b border-[#2e2e2e] flex justify-between items-center bg-[#161616]">
                    <h3 className="text-sm font-black uppercase tracking-widest text-white">Create New Bucket</h3>
                    <button onClick={() => setIsCreatingBucket(false)} className="text-[#444] hover:text-white">✕</button>
                </div>
                <div className="p-8 space-y-6">
                    <div className="space-y-1.5">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-[#444]">Bucket Name</label>
                        <input 
                            type="text" 
                            value={newBucketName}
                            onChange={(e) => setNewBucketName(e.target.value)}
                            placeholder="e.g. project-assets"
                            className="w-full bg-[#0f0f0f] border border-[#2e2e2e] rounded-lg px-4 py-2.5 text-sm text-white focus:border-[#3ecf8e] focus:outline-none transition-colors"
                        />
                        <p className="text-[10px] text-[#444]">Allowed: lowercase, numbers, and hyphens.</p>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-[#161616] rounded-xl border border-[#2e2e2e]">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-[#2e2e2e] rounded text-emerald-500">
                                {newBucketPublic ? <Globe size={16} /> : <Lock size={16} />}
                            </div>
                            <div>
                                <p className="text-xs font-bold text-white">Public Bucket</p>
                                <p className="text-[10px] text-[#444]">Allow anonymous read access.</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setNewBucketPublic(!newBucketPublic)}
                            className={`w-10 h-5 rounded-full relative transition-colors ${newBucketPublic ? 'bg-emerald-500' : 'bg-[#2e2e2e]'}`}
                        >
                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${newBucketPublic ? 'right-1' : 'left-1'}`}></div>
                        </button>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button 
                            onClick={() => setIsCreatingBucket(false)}
                            className="flex-1 bg-[#2e2e2e] hover:bg-[#333] text-white font-bold py-2.5 rounded-lg text-xs transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleCreateBucket}
                            disabled={!newBucketName}
                            className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-bold py-2.5 rounded-lg text-xs transition-all"
                        >
                            Create Bucket
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Footer Info */}
      <footer className="h-10 border-t border-[#2e2e2e] bg-[#1c1c1c] px-6 flex items-center justify-between text-[10px] font-bold text-[#444] uppercase tracking-widest shrink-0">
        <div className="flex items-center gap-4">
            <span>Shard: sh-storage-01</span>
            <span className="text-[#2e2e2e]">|</span>
            <span>Objects: {objects.length}</span>
        </div>
        <div className="flex items-center gap-4">
            <span className="text-emerald-500/50 italic">Storage Engine: v1.2.4-stable</span>
        </div>
      </footer>
    </div>
  );
};

export default StorageView;
