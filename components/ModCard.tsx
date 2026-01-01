
import React, { useState, useEffect, useRef } from 'react';
import { Mod } from '../types';
import { Loader2, ArrowUpRight, Copy, Check, Zap, ShieldCheck } from 'lucide-react';

interface ModCardProps {
  mod: Mod;
}

const CATEGORY_COLORS: Record<string, string> = {
  optimization: '#a3e635',
  dimensions: '#c084fc',
  structures: '#fb923c',
  combat: '#f87171',
  rpg: '#facc15',
  visual: '#f472b6',
  tech: '#22d3ee',
  utility: '#60a5fa',
  storage: '#818cf8',
  library: '#94a3b8',
  misc: '#ffffff'
};

type ModData = { icon: string | null; wiki: string };
const CACHE_KEY = 'MNF_MOD_CACHE_V22';
const pendingQueue = new Set<string>();
const callbacks: Record<string, ((data: ModData) => void)[]> = {};
let isProcessing = false;

const processQueue = async () => {
  if (isProcessing || pendingQueue.size === 0) return;
  isProcessing = true;
  const batch = Array.from(pendingQueue).slice(0, 10);
  batch.forEach(id => pendingQueue.delete(id));
  try {
    const response = await fetch(`https://api.modrinth.com/v2/projects?ids=[${batch.map(id => `"${id}"`).join(',')}]`);
    if (response.ok) {
      const projects = await response.json();
      const results: Record<string, ModData> = {};
      projects.forEach((p: any) => {
        const d = { icon: p.icon_url || null, wiki: p.wiki_url || p.source_url || `https://modrinth.com/mod/${p.slug}` };
        results[p.slug] = d; results[p.id] = d;
        localStorage.setItem(`${CACHE_KEY}_${p.slug}`, JSON.stringify(d));
      });
      batch.forEach(id => {
        const d = results[id] || { icon: null, wiki: `https://modrinth.com/mod/${id}` };
        callbacks[id]?.forEach(cb => cb(d));
        delete callbacks[id];
      });
    }
  } catch (err) { console.error("API error", err); }
  finally {
    isProcessing = false;
    if (pendingQueue.size > 0) setTimeout(processQueue, 1000);
  }
};

const requestModData = (id: string, cb: (data: ModData) => void) => {
  const cached = localStorage.getItem(`${CACHE_KEY}_${id}`);
  if (cached) return cb(JSON.parse(cached));
  if (!callbacks[id]) callbacks[id] = [];
  callbacks[id].push(cb);
  pendingQueue.add(id);
  if (!isProcessing) setTimeout(processQueue, 100);
};

const ModCard: React.FC<ModCardProps> = ({ mod }) => {
  const [data, setData] = useState<ModData>(() => {
    const cached = localStorage.getItem(`${CACHE_KEY}_${mod.slug}`);
    return cached ? JSON.parse(cached) : { icon: null, wiki: mod.wiki };
  });

  const [loading, setLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if(e.isIntersecting) { setIsVisible(true); obs.disconnect(); } }, { threshold: 0.1 });
    if (cardRef.current) obs.observe(cardRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || data.icon || !mod.slug) return;
    setLoading(true);
    requestModData(mod.slug, (newData) => { setData(newData); setLoading(false); });
  }, [isVisible, mod.slug]);

  const tagColor = CATEGORY_COLORS[mod.category] || CATEGORY_COLORS.misc;

  return (
    <div 
      ref={cardRef}
      className={`group relative bg-[#0d0d0d] border border-white/10 rounded-[1.5rem] p-5 md:p-8 transition-all duration-300 hover:border-white/40 hover:bg-[#111111] flex flex-col h-full overflow-hidden shadow-2xl ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
    >
      <div className="flex gap-4 items-start mb-6 relative z-10">
        <div className="w-14 h-14 md:w-16 md:h-16 bg-black border border-white/10 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden transition-all group-hover:border-white/30 group-hover:scale-105">
          {data.icon ? (
            <img 
              src={data.icon} 
              alt={mod.name} 
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageLoaded(false)}
              className={`w-full h-full object-cover transition-opacity duration-700 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/5 to-transparent">
              <span className="mono text-xl font-black text-white/20 uppercase">{mod.name.charAt(0)}</span>
            </div>
          )}
        </div>

        <div className="flex-grow min-w-0 pt-0.5">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="text-sm md:text-base font-black text-white truncate uppercase tracking-tight">
              {mod.name}
            </h3>
            <button 
              onClick={(e) => { e.preventDefault(); navigator.clipboard.writeText(mod.name); setCopied(true); setTimeout(() => setCopied(false), 2000); }} 
              className="p-1.5 rounded-lg text-white/10 hover:text-white/80 hover:bg-white/5 transition-all flex-shrink-0"
            >
              {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span 
              className="mono text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md border"
              style={{ borderColor: `${tagColor}33`, color: tagColor, backgroundColor: `${tagColor}08` }}
            >
              {mod.category}
            </span>
            {mod.isLibrary && (
              <span className="mono text-[7px] font-black text-yellow-500/40 uppercase bg-yellow-500/5 px-1.5 py-0.5 rounded-md border border-yellow-500/10">LIB</span>
            )}
          </div>
        </div>
      </div>

      <p className="text-[12px] md:text-[13px] leading-relaxed text-white/40 line-clamp-3 mb-8 flex-grow group-hover:text-white/70 transition-colors">
        {mod.description || "Sector analysis complete. Data ready for retrieval."}
      </p>

      <div className="mt-auto pt-5 border-t border-white/5 flex items-center gap-3">
        <a 
          href={data.wiki} 
          target="_blank" 
          rel="noreferrer"
          className="relative flex-grow flex items-center justify-center gap-2.5 mono text-[10px] font-black text-white/50 bg-white/[0.04] px-4 py-3.5 rounded-xl border border-white/5 shadow-xl active:scale-[0.97] flex-shrink-0 whitespace-nowrap min-h-[44px] transition-all duration-300 hover:bg-white/20 hover:border-white/40 hover:text-white hover:shadow-[0_5px_15px_rgba(255,255,255,0.1)]"
        >
          <span className="relative z-10">VIEW_WIKI_PROTOCOL</span>
          <ArrowUpRight size={14} className="relative z-10 transition-transform duration-300 hover:translate-x-1 hover:-translate-y-1" />
        </a>
      </div>
    </div>
  );
};

export default ModCard;
