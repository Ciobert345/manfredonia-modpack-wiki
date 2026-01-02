
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Package, Cpu, Palette, Sword, Map, Wrench, Star, 
  Layers, Zap, Shield, Hexagon, Box, Command, Check,
  Menu, X, Eye, EyeOff, Search, Target, LayoutGrid
} from 'lucide-react';
import { ALL_MODS } from './data/modData';
import { Mod, ModCategory, CategoryInfo } from './types';
import ModCard from './components/ModCard';

const CATEGORIES: CategoryInfo[] = [
  { id: 'all', label: 'DATABASE_ROOT', icon: 'Package', color: '#ffffff' },
  { id: 'optimization', label: 'PERF_OPTIM', icon: 'Zap', color: '#a3e635' },
  { id: 'dimensions', label: 'WORLD_NODES', icon: 'Map', color: '#c084fc' },
  { id: 'structures', label: 'CONSTRUCTS', icon: 'Layers', color: '#fb923c' },
  { id: 'combat', label: 'COMBAT_SYS', icon: 'Sword', color: '#f87171' },
  { id: 'rpg', label: 'RPG_MODULES', icon: 'Star', color: '#facc15' },
  { id: 'visual', label: 'VISUAL_CORE', icon: 'Palette', color: '#f472b6' },
  { id: 'tech', label: 'INDUSTRIAL', icon: 'Cpu', color: '#22d3ee' },
  { id: 'utility', label: 'SYSTEM_UTIL', icon: 'Wrench', color: '#60a5fa' },
  { id: 'storage', label: 'LOGISTICS', icon: 'Box', color: '#818cf8' },
  { id: 'library', label: 'LIBRARIES', icon: 'Shield', color: '#94a3b8' },
  { id: 'misc', label: 'MISC_QUERY', icon: 'Command', color: '#ffffff' }
];

const IconMapper: Record<string, any> = {
  Package, Zap, Map, Sword, Star, Palette, Cpu, Wrench, Layers, Box, Shield, Command
};

const App: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ModCategory>('all');
  const [showLibraries, setShowLibraries] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(timer);
    };
  }, []);

  const filteredMods = useMemo(() => {
    return ALL_MODS.filter(mod => {
      const matchesSearch = mod.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || mod.category === selectedCategory;
      const matchesLibraryFilter = showLibraries || !mod.isLibrary;
      return matchesSearch && matchesCategory && matchesLibraryFilter;
    });
  }, [searchTerm, selectedCategory, showLibraries]);

  const currentCategory = CATEGORIES.find(c => c.id === selectedCategory) || CATEGORIES[0];

  return (
    <div className="min-h-screen flex flex-col md:flex-row text-white font-['Inter'] bg-transparent relative selection:bg-white selection:text-black">
      
      {/* DESKTOP SIDEBAR - EVOLVED HUD STYLE */}
      <aside className="hidden md:flex flex-col w-[310px] shrink-0 h-screen sticky top-0 bg-black/40 backdrop-blur-3xl border-r border-white/10 z-[110] shadow-[inset_-20px_0_40px_rgba(0,0,0,0.4)]">
        {/* LOGO AREA */}
        <div className="p-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white/10" />
          <div className="flex items-center gap-5 mb-8 relative z-10">
            <div className="relative group">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.2)] group-hover:scale-105 transition-transform duration-500">
                <img src="/icon.png" alt="MNF" className="w-8 h-8 object-cover" />
              </div>
              <div className="absolute -inset-2 bg-white/5 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <h1 className="text-[15px] font-black tracking-tighter uppercase leading-none">MNF_INTEL</h1>
              <span className="mono text-[8px] text-white/30 tracking-[0.3em] uppercase mt-2 block font-bold">STABLE_V4.6.2</span>
            </div>
          </div>
          <div className="h-px w-full bg-gradient-to-r from-white/20 to-transparent" />
        </div>

        {/* NAVIGATION */}
        <div className="flex-grow overflow-y-auto no-scrollbar px-6 py-4">
          <nav className="space-y-2 pb-12">
            <div className="mono text-[8px] text-white/10 font-black tracking-[0.4em] mb-4 pl-4 uppercase">Sector_Clusters</div>
            {CATEGORIES.map((cat, idx) => {
              const Icon = IconMapper[cat.icon] || Package;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full relative flex items-center gap-4 px-5 py-4 text-[11px] rounded-2xl transition-all duration-500 group overflow-hidden ${
                    isActive 
                      ? 'bg-white text-black font-black shadow-[0_10px_25px_rgba(255,255,255,0.1)]' 
                      : 'text-white/40 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  {/* Status Indicator */}
                  <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 rounded-full transition-all duration-500 ${
                    isActive ? 'bg-black' : 'bg-transparent group-hover:bg-white/20'
                  }`} />
                  
                  <Icon size={18} className="transition-transform duration-500 group-hover:scale-110" style={{ color: isActive ? 'black' : cat.color }} />
                  <div className="flex flex-col items-start min-w-0">
                    <span className="truncate tracking-widest uppercase font-bold text-left w-full">{cat.label}</span>
                    <span className={`mono text-[7px] mt-0.5 opacity-30 group-hover:opacity-60 transition-opacity ${isActive ? 'text-black/60' : ''}`}>
                      SEC_ID_0x{idx.toString(16).padStart(2, '0')}
                    </span>
                  </div>
                  
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* BOTTOM UTILITY */}
        <div className="p-8 border-t border-white/10 bg-black/20">
           <button 
             onClick={() => setShowLibraries(!showLibraries)}
             className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border transition-all duration-500 ${
               showLibraries 
                ? 'bg-white/5 border-white/20 text-white shadow-inner' 
                : 'border-white/5 text-white/10 hover:border-white/10 hover:text-white/30'
             }`}
           >
             <div className="flex items-center gap-3">
               {showLibraries ? <Eye size={16} className="text-white" /> : <EyeOff size={16} />}
               <span className="mono text-[10px] font-black uppercase tracking-widest">Library_Lnk</span>
             </div>
             <div className={`w-2 h-2 rounded-full transition-all duration-500 ${
               showLibraries 
                ? 'bg-green-500 shadow-[0_0_12px_#22c55e]' 
                : 'bg-white/5 shadow-none'
             }`} />
           </button>
           <div className="mt-6 flex justify-between items-center opacity-20">
              <div className="mono text-[7px] font-black tracking-widest uppercase">Encryption: Active</div>
              <div className="flex gap-1">
                <div className="w-1 h-1 bg-white rounded-full animate-ping" />
                <div className="w-1 h-1 bg-white rounded-full" />
              </div>
           </div>
        </div>
      </aside>

      {/* MAIN AREA */}
      <main className="flex-grow flex flex-col relative min-w-0">
        {/* HEADER - REMAINS LARGE & IMPACTFUL */}
        <header className={`sticky top-0 z-[1000] transition-all duration-500 ${isScrolled || isMenuOpen ? 'bg-black/40 backdrop-blur-3xl border-b border-white/10 py-4 shadow-[0_4px_30px_rgba(0,0,0,0.1)]' : 'bg-transparent py-6 md:py-12'}`}>
          <div className="px-6 md:px-12 flex items-center gap-5">
            
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`md:hidden w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 active:scale-95 transition-all duration-300 ${isMenuOpen ? 'bg-white text-black rotate-90' : 'bg-white/5 border border-white/10 text-white'}`}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            
            <div className="relative flex-grow">
              <div className={`flex items-center backdrop-blur-md border rounded-2xl transition-all duration-500 ${searchTerm ? 'bg-black/40 border-white/40 shadow-[0_0_30px_rgba(255,255,255,0.05)]' : 'bg-black/20 border-white/10 hover:bg-black/40'}`}>
                <div className="pl-5 text-white/20">
                  <Search size={18} />
                </div>
                <input 
                  type="text"
                  placeholder="START_SYSTEM_QUERY..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full py-4 md:py-5 px-4 bg-transparent text-[15px] md:text-[16px] text-white focus:outline-none placeholder:text-white/10 mono tracking-wider"
                />
              </div>
            </div>

            <div className="md:hidden w-14 h-14 bg-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-2xl overflow-hidden">
              <img src="/icon.png" alt="MNF" className="w-10 h-10 object-cover" />
            </div>
          </div>
        </header>

        {/* MOBILE MENU OVERLAY - MOVED OUTSIDE HEADER FOR CORRECT STACKING */}
        <div className={`md:hidden fixed inset-0 z-[999] bg-black/60 backdrop-blur-3xl transition-all duration-500 flex flex-col pt-28 px-4 pb-6 overflow-y-auto ${isMenuOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
          
          <div className="mono text-[9px] text-white/30 uppercase font-black tracking-[0.4em] mb-4 pl-1 border-b border-white/10 pb-2 flex justify-between items-end">
            <span>System_Navigation</span>
            <span className="text-[7px] opacity-50 tracking-normal">SEC_01</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map(cat => {
              const Icon = IconMapper[cat.icon] || Package;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat.id); setIsMenuOpen(false); }}
                  className={`relative w-full flex items-center gap-3 px-3 py-3 rounded-xl border transition-all duration-300 group overflow-hidden ${
                    isActive 
                      ? 'bg-white text-black border-white shadow-[0_4px_20px_rgba(255,255,255,0.2)]' 
                      : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:text-white hover:border-white/20'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-black/10' : 'bg-white/5 group-hover:bg-white/10'}`}>
                    <Icon size={16} style={{ color: isActive ? 'black' : cat.color }} />
                  </div>
                  <div className="flex flex-col items-start text-left min-w-0 z-10">
                    <span className="text-[12px] font-bold tracking-wider uppercase truncate w-full">{cat.label}</span>
                  </div>
                  
                  {isActive && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-gray-200 opacity-50" />
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-black animate-pulse flex-shrink-0 z-10" />
                    </>
                  )}
                </button>
              );
            })}
          </div>
          
          <div className="mt-auto pt-6 border-t border-white/10 space-y-3">
              <button 
              onClick={() => { setShowLibraries(!showLibraries); setIsMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-300 ${
                showLibraries 
                  ? 'bg-white/10 border-white/20 text-white shadow-inner backdrop-blur-md' 
                  : 'bg-transparent border-white/5 text-white/30 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                {showLibraries ? <Eye size={16} /> : <EyeOff size={16} />}
                <span className="mono text-[10px] font-black uppercase tracking-widest">Library_Modules</span>
              </div>
              <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${showLibraries ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-white/10'}`} />
            </button>

            <div className="flex justify-between items-center px-2 opacity-30">
              <span className="mono text-[9px] uppercase tracking-widest">System_Time</span>
              <span className="mono text-[9px] font-bold">{currentTime}</span>
            </div>
          </div>
        </div>

        {/* CONTENT - LARGE AND BOLD */}
        <div className="p-6 md:p-12 lg:p-16 w-full mx-auto max-w-[1600px] relative z-10">
          <div className="mb-12 md:mb-24">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
              <div className="relative">
                <div className="mono text-[9px] md:text-[10px] text-white/20 tracking-[0.5em] uppercase mb-3 px-1">SECTOR_ACCESS_NODE: 0x41F_15E</div>
                <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter italic leading-none text-white drop-shadow-2xl selection:bg-white selection:text-black">
                  {currentCategory.label}
                </h2>
                <div className="mt-8 flex items-center gap-5">
                   <div className="flex items-center gap-3 px-4 py-2.5 md:px-6 md:py-3 bg-white text-black rounded-2xl shadow-[0_15px_35px_rgba(255,255,255,0.1)]">
                     <span className="mono text-[10px] md:text-[13px] font-black uppercase tracking-[0.2em]">
                       {filteredMods.length} Modules_Sync
                     </span>
                   </div>
                   <div className="hidden sm:block w-px h-8 bg-white/10" />
                   <div className="hidden sm:block mono text-[10px] text-white/10 uppercase tracking-[0.4em] animate-pulse">
                     Encryption_Stable
                   </div>
                </div>
              </div>
            </div>
          </div>

          {filteredMods.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 md:gap-12">
              {filteredMods.map((mod, i) => (
                <ModCard key={`${mod.name}-${i}`} mod={mod} />
              ))}
            </div>
          ) : (
            <div className="py-32 flex flex-col items-center justify-center border border-white/5 rounded-[3rem] bg-black/40 backdrop-blur-md text-center px-8 shadow-inner">
              <Package size={64} className="text-white/5 mb-8" />
              <h3 className="text-2xl font-black uppercase tracking-[0.3em] text-white/20">Sector_Locked</h3>
              <p className="mono text-[11px] text-white/10 uppercase tracking-[0.4em] mt-3">No neural signatures detected in this coordinate.</p>
            </div>
          )}
        </div>

        <footer className="mt-auto p-12 md:p-24 border-t border-white/10 bg-black/40 backdrop-blur-2xl">
           <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-inner group">
                  <Hexagon size={28} className="text-white/20 group-hover:text-white/40 transition-colors" />
                </div>
                <div>
                  <div className="mono text-[11px] font-black tracking-[0.4em] text-white/40 uppercase">MNF_DATABASE_ARCHIVE</div>
                  <div className="mono text-[8px] text-white/10 uppercase mt-1">v4.6.2 // Sector_Stable // Build_2025_02</div>
                </div>
              </div>
              <div className="flex flex-col items-center md:items-end gap-2">
                <div className="mono text-[10px] font-black uppercase tracking-[0.5em] text-white/10 text-center md:text-right">
                  Authorized access only // Location: Manfredonia_Cluster
                </div>
                <div className="flex gap-2">
                  <div className="w-8 h-1 bg-white/5 rounded-full" />
                  <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="w-1/2 h-full bg-white/20 animate-[loading_2s_ease-in-out_infinite]" />
                  </div>
                </div>
              </div>
           </div>
        </footer>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}} />
    </div>
  );
};

export default App;
