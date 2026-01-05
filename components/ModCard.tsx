
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
const CACHE_KEY = 'MNF_ICON_CACHE_V15';
const WIKI_CACHE_KEY = 'MNF_WIKI_CACHE_V13';

const modrinthQueue = new Set<string>();
const modrinthCallbacks: Record<string, ((data: { icon: string | null; wiki: string | null }) => void)[]> = {};
let isModrinthProcessing = false;

const CF_CACHE_PREFIX = 'MNF_CF_ICON_V15';
const CF_WIKI_CACHE_PREFIX = 'MNF_CF_WIKI_V13';
const cfCallbacks: Record<string, ((data: { icon: string | null; wiki: string | null }) => void)[]> = {};
const pendingCf = new Set<string>();

const ModrinthLogo = () => (
  <svg viewBox="0 0 512 514" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
    <path fill="#1bd96a" d="M503.16 323.56c11.39-42.09 12.16-87.65.04-132.8C466.49 54.23 324.51-26.48 187.98 10.24S-30.22 189.34 6.49 325.86c36.72 136.53 178.7 216.23 315.22 179.5 51.87-13.96 97.03-46.39 128.41-90.62-12.08 2.87-24.57 4.42-37.29 4.42-89.74 0-162.49-72.75-162.49-162.49 0-89.75 72.75-162.5 162.49-162.5 62.2 0 116.26 34.93 143.6 86.24 3.59 22.59 2.09 45.94-6.27 67.65z" />
    <path fill="#1bd96a" d="M321.99 429.01c-56.95 16.22-115.23-5.72-151.71-50.09 19.1-43.69 62.25-74.31 112.67-74.31 44.16 0 82.85 23.27 104.52 58.26-14.34 25.18-36.61 47.88-65.48 66.14z" />
  </svg>
);

const isNameSimilar = (name1: string, name2: string): boolean => {
  const getTokens = (s: string) => s.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\bmod\b/g, '')
    .replace(/\bfabric\b/g, '')
    .replace(/\bforge\b/g, '')
    .replace(/\bquilt\b/g, '')
    .replace(/\bapi\b/g, '')
    .replace(/\bplugin\b/g, '')
    .replace(/\bremastered\b/g, '')
    .replace(/\bsupport\b/g, '')
    .replace(/\bvanilla\b/g, '')
    .split(/\s+/)
    .filter(t => t.length > 2);

  const t1 = getTokens(name1);
  const t2 = getTokens(name2);

  if (t1.length === 0 || t2.length === 0) {
    // Fallback to basic normalized comparison if tokens are too short
    const n1 = name1.toLowerCase().replace(/[^\w]/g, '');
    const n2 = name2.toLowerCase().replace(/[^\w]/g, '');
    return n1 === n2 || n1.includes(n2) || n2.includes(n1);
  }

  // Subset check: one name's core words are all present in the other
  const tokensMatch = (list1: string[], list2: string[]) =>
    list1.every(t => list2.some(o => o.includes(t) || t.includes(o)));

  if (tokensMatch(t1, t2) || tokensMatch(t2, t1)) return true;

  // Intersection check: at least 60% of words match
  const matches = t1.filter(t => t2.some(o => o.includes(t) || t.includes(o)));
  if (matches.length / Math.max(t1.length, t2.length) >= 0.6) return true;

  return false;
};

const CurseForgeLogo = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
    <path fill="#f16436" d="M1.27 6.7l.51 3.91h3.3c-.06.56-.09 1.13-.09 1.71 0 4.35 2.36 8.13 5.87 10.16l1.07-2.96a8.04 8.04 0 0 1-4.18-7.2c0-.59.07-1.17.18-1.73h5.22l.51-3.91H1.27zm17.95 5.53h2.24l.51-3.91H11.34l-.51 3.91h3.33c.99 3.21 3.99 5.53 7.56 5.53.46 0 .91-.04 1.35-.11l.36-2.77a6.04 6.04 0 0 1-1.71.26c-1.86 0-3.47-1.08-4.23-2.64l1.73-.27z" />
  </svg>
);

const processModrinthQueue = async () => {
  if (isModrinthProcessing || modrinthQueue.size === 0) return;
  isModrinthProcessing = true;
  const batch = Array.from(modrinthQueue).slice(0, 10);
  batch.forEach(id => modrinthQueue.delete(id));
  try {
    const response = await fetch(`https://api.modrinth.com/v2/projects?ids=[${batch.map(id => `"${id}"`).join(',')}]`);
    if (response.ok) {
      const projects = await response.json();
      batch.forEach((requestKey) => {
        const p = projects.find((proj: any) => proj.id === requestKey || proj.slug === requestKey);
        if (p) {
          const wiki = p.wiki_url || p.source_url || null;
          const data = { icon: p.icon_url || null, wiki };
          modrinthCallbacks[requestKey]?.forEach(cb => cb(data));
          if (p.icon_url) {
            localStorage.setItem(`${CACHE_KEY}_${requestKey}`, p.icon_url);
            if (p.slug !== requestKey) localStorage.setItem(`${CACHE_KEY}_${p.slug}`, p.icon_url);
          }
          if (wiki) localStorage.setItem(`${WIKI_CACHE_KEY}_${requestKey}`, wiki);
        } else {
          modrinthCallbacks[requestKey]?.forEach(cb => cb({ icon: null, wiki: null }));
        }
        delete modrinthCallbacks[requestKey];
      });
    }
  } catch (err) {
    batch.forEach(id => {
      modrinthCallbacks[id]?.forEach(cb => cb({ icon: null, wiki: null }));
      delete modrinthCallbacks[id];
    });
  }
  finally {
    isModrinthProcessing = false;
    if (modrinthQueue.size > 0) setTimeout(processModrinthQueue, 2000);
  }
};

const searchModrinthByName = async (name: string, callback: (data: { icon: string | null; wiki: string | null }) => void) => {
  // Random jitter to avoid concurrent hits
  await new Promise(r => setTimeout(r, Math.random() * 2000));
  try {
    const query = name.replace(/ Mod$/i, '').replace(/[^\w\s]/g, ' ').trim();
    if (!query) return callback({ icon: null, wiki: null });

    const endpoints = [
      `https://api.modrinth.com/v2/search?query=${encodeURIComponent(query)}&limit=5&facets=[["categories:fabric"]]`,
      `https://api.modrinth.com/v2/search?query=${encodeURIComponent(query)}&limit=5`
    ];

    for (const url of endpoints) {
      const response = await fetch(url);
      if (response.ok) {
        const { hits } = await response.json();
        if (hits && hits.length > 0) {
          const hit = hits.find((h: any) => isNameSimilar(h.title, name) || isNameSimilar(h.slug, name));
          if (hit) {
            // Found a potential match, now enqueue to get full project details (including wiki)
            if (!modrinthCallbacks[hit.slug]) modrinthCallbacks[hit.slug] = [];
            modrinthCallbacks[hit.slug].push(callback);
            modrinthQueue.add(hit.slug);
            if (!isModrinthProcessing) setTimeout(processModrinthQueue, 100);
            return;
          }
        }
      }
    }
    callback({ icon: null, wiki: null });
  } catch (err) {
    callback({ icon: null, wiki: null });
  }
};

const fetchCfIcon = async (slug: string, fallbackSlug?: string | null, modName?: string) => {
  if (pendingCf.has(slug)) return;
  pendingCf.add(slug);

  const resolve = (data: { icon: string | null; wiki: string | null }) => {
    cfCallbacks[slug]?.forEach(cb => cb(data));
    delete cfCallbacks[slug];
    pendingCf.delete(slug);
  };

  try {
    const response = await fetch(`https://api.cfwidget.com/minecraft/mc-mods/${slug}`);
    if (response.ok) {
      const project = await response.json();
      const icon = project.thumbnail || project.logo?.url || null;
      const wiki = project.urls?.wiki || project.urls?.source || null;

      if (icon) localStorage.setItem(`${CF_CACHE_PREFIX}${slug}`, icon);
      if (wiki) localStorage.setItem(`${CF_WIKI_CACHE_PREFIX}${slug}`, wiki);

      resolve({ icon, wiki });
    } else if (response.status === 404 || response.status === 403 || response.status === 429) {
      if (fallbackSlug) {
        if (!modrinthCallbacks[fallbackSlug]) modrinthCallbacks[fallbackSlug] = [];
        modrinthCallbacks[fallbackSlug].push(resolve);
        modrinthQueue.add(fallbackSlug);
        if (!isModrinthProcessing) setTimeout(processModrinthQueue, 100);
      } else if (modName) {
        searchModrinthByName(modName, resolve);
      } else {
        resolve({ icon: null, wiki: null });
      }
    } else {
      resolve({ icon: null, wiki: null });
    }
  } catch (err) {
    if (fallbackSlug) {
      if (!modrinthCallbacks[fallbackSlug]) modrinthCallbacks[fallbackSlug] = [];
      modrinthCallbacks[fallbackSlug].push(resolve);
      modrinthQueue.add(fallbackSlug);
      if (!isModrinthProcessing) setTimeout(processModrinthQueue, 100);
    } else if (modName) {
      searchModrinthByName(modName, resolve);
    } else {
      resolve({ icon: null, wiki: null });
    }
  }
};

const getModrinthSlug = (url: string) => {
  if (!url) return null;
  try {
    const parts = url.split('/').filter(Boolean);
    const modIdx = parts.findIndex(p => p === 'mod' || p === 'project');
    const slug = modIdx !== -1 ? parts[modIdx + 1] : parts[parts.length - 1];
    return slug?.split(/[?#]/)[0] || null;
  } catch { return null; }
};

const getCurseForgeSlug = (url: string) => {
  if (!url) return null;
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname;
    const parts = path.split('/').filter(Boolean);

    // Explicit exclusions for common non-slug segments
    const EXCLUDED = ['mc-mods', 'projects', 'minecraft', 'files', 'screenshots', 'relations', 'search'];

    const modIdx = parts.findIndex(p => p === 'mc-mods' || p === 'projects');
    if (modIdx !== -1 && parts[modIdx + 1] && parts[modIdx + 1].toLowerCase() !== 'search') {
      return parts[modIdx + 1].split(/[?#]/)[0];
    }

    // Fallback: search for first non-excluded part that doesn't look like a category or search
    const slug = parts.reverse().find(p => !EXCLUDED.includes(p.toLowerCase()) && p.length > 2);
    return slug?.split(/[?#]/)[0] || null;
  } catch {
    const parts = url.split('/').filter(p => p && !['discord', 'curseforge', 'minecraft', 'mc-mods', 'external', 'search'].includes(p.toLowerCase()));
    return parts[parts.length - 1]?.split(/[?#]/)[0] || null;
  }
};

const ModCard: React.FC<ModCardProps> = ({ mod }) => {
  const isCF = mod.wiki.includes('curseforge.com') || mod.url?.includes('curseforge.com') || mod.curseSlug;
  const isMN = mod.wiki.includes('modrinth.com') || mod.url?.includes('modrinth.com') || mod.slug;

  // Priority: 1. Extract from URL (usually most accurate), 2. Explicit slug field
  const urlCfSlug = isCF ? getCurseForgeSlug(mod.url || mod.wiki) : null;
  const cfSlug = mod.curseSlug || urlCfSlug || (isCF ? mod.slug : null);

  const urlMnSlug = isMN ? getModrinthSlug(mod.url || mod.wiki) : null;
  const mnSlug = urlMnSlug || mod.slug || (!isCF ? mod.slug : null);

  const [icon, setIcon] = useState<string | null>(() => {
    if (mod.icon) return mod.icon;
    if (isCF && cfSlug) return localStorage.getItem(`${CF_CACHE_PREFIX}${cfSlug}`);
    if (mnSlug) return localStorage.getItem(`${CACHE_KEY}_${mnSlug}`);
    return null;
  });

  const [wikiUrl, setWikiUrl] = useState<string>(() => {
    if (mod.wiki) {
      if (isCF && cfSlug) {
        const cached = localStorage.getItem(`${CF_WIKI_CACHE_PREFIX}${cfSlug}`);
        if (cached && cached !== mod.wiki) return cached;
      }
      if (mnSlug) {
        const cached = localStorage.getItem(`${WIKI_CACHE_KEY}_${mnSlug}`);
        if (cached && cached !== mod.wiki) return cached;
      }
      return mod.wiki;
    }
    return '';
  });

  const [imageLoaded, setImageLoaded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setIsVisible(true);
        obs.disconnect();
      }
    }, { threshold: 0.1 });

    if (cardRef.current) obs.observe(cardRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || mod.icon) return;

    const onData = (data: { icon: string | null; wiki: string | null }) => {
      if (data.icon) {
        setIcon(data.icon);
      }

      const newWiki = data.wiki || (mnSlug && !wikiUrl ? `https://modrinth.com/mod/${mnSlug}` : null);
      if (newWiki && newWiki !== wikiUrl) {
        setWikiUrl(newWiki);
        if (isCF && cfSlug) localStorage.setItem(`${CF_WIKI_CACHE_PREFIX}${cfSlug}`, newWiki);
        else if (mnSlug) localStorage.setItem(`${WIKI_CACHE_KEY}_${mnSlug}`, newWiki);
      }

      // Final icon discovery check
      const currentIcon = data.icon || icon;
      if (!currentIcon && mod.name) {
        const searchKey = `MNF_SEARCH_DONE_V15_${mod.name}`;
        if (!localStorage.getItem(searchKey)) {
          searchModrinthByName(mod.name, (final) => {
            if (final.icon) {
              setIcon(final.icon);
            }
            if (final.wiki && (!wikiUrl || wikiUrl.includes('search'))) setWikiUrl(final.wiki);
            localStorage.setItem(searchKey, 'true');
          });
        }
      }
    };

    if (isCF && cfSlug) {
      const hasIcon = localStorage.getItem(`${CF_CACHE_PREFIX}${cfSlug}`);
      const hasWiki = localStorage.getItem(`${CF_WIKI_CACHE_PREFIX}${cfSlug}`);

      if (!cfCallbacks[cfSlug]) cfCallbacks[cfSlug] = [];
      cfCallbacks[cfSlug].push(onData);
      setTimeout(() => fetchCfIcon(cfSlug, mnSlug || mod.slug, mod.name), 100);

      if (!hasIcon && mod.name) {
        // Parallel Modrinth discovery for CF mods
        onData({ icon: null, wiki: null });
      }
    } else if (mnSlug) {
      const hasIcon = localStorage.getItem(`${CACHE_KEY}_${mnSlug}`);
      const hasWiki = localStorage.getItem(`${WIKI_CACHE_KEY}_${mnSlug}`);
      if (hasIcon && hasWiki) return;
      if (!modrinthCallbacks[mnSlug]) modrinthCallbacks[mnSlug] = [];
      modrinthCallbacks[mnSlug].push(onData);
      modrinthQueue.add(mnSlug);
      if (!isModrinthProcessing) setTimeout(processModrinthQueue, 100);
    } else if (mod.name) {
      // Direct search if no slug available
      const searchKey = `MNF_SEARCH_DONE_${mod.name}`;
      if (localStorage.getItem(searchKey)) return;
      searchModrinthByName(mod.name, (data) => {
        onData(data);
        if (data.icon) localStorage.setItem(searchKey, 'true');
      });
    }
  }, [isVisible, cfSlug, mnSlug, mod.wiki, mod.icon, isCF, mod.name, mod.slug]);


  const tagColor = CATEGORY_COLORS[mod.category] || CATEGORY_COLORS.misc;

  return (
    <div
      ref={cardRef}
      className={`group relative bg-[#0d0d0d] border border-white/10 rounded-[1.5rem] p-5 md:p-8 transition-all duration-300 hover:border-white/40 hover:bg-[#111111] flex flex-col h-full overflow-hidden shadow-2xl ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
    >
      <div className="flex gap-4 items-start mb-6 relative z-10">
        <div className="relative flex-shrink-0">
          <div className="w-14 h-14 md:w-16 md:h-16 bg-black border border-white/10 rounded-xl flex items-center justify-center overflow-hidden transition-all group-hover:border-white/30 group-hover:scale-105">
            {icon ? (
              <img
                src={icon}
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
          <div className="absolute -bottom-1 -right-1 flex gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
            {isCF ? <CurseForgeLogo /> : isMN ? <ModrinthLogo /> : null}
          </div>
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

      <div className="mt-auto pt-5 border-t border-white/5 flex items-center justify-between gap-3">
        <a
          href={wikiUrl}
          target="_blank"
          rel="noreferrer"
          className="relative flex-grow flex items-center justify-center gap-2.5 mono text-[10px] font-black text-white/50 bg-white/[0.04] px-4 py-3.5 rounded-xl border border-white/5 shadow-xl active:scale-[0.97] transition-all duration-300 hover:bg-white hover:text-black hover:border-white hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] group/btn"
        >
          <span className="relative z-10">VIEW_WIKI_PROTOCOL</span>
          <ArrowUpRight size={14} className="relative z-10 transition-transform duration-300 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" />
        </a>
      </div>
    </div>
  );
};

export default ModCard;
