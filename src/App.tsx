import React, { useState, useEffect } from 'react';
import { Instagram, AtSign, Globe, Plus, X, BriefcaseBusiness, Loader2, Moon, Sun } from 'lucide-react';
import { Category, Creative } from './types';

// Mock Data for the immediate AI Studio preview (not connected to GAS)
const INITIAL_DATA: Creative[] = [
  { id: '1', name: 'Ivan Visuals', category: 'Photographer', bio: 'Specialist in street aesthetics and modern documentary wedding photography. Capturing the authentic vibe of Surabaya.', ig: 'https://instagram.com/visualivan', customLink: '', web: '', photo: 'https://images.unsplash.com/photo-1554046920-90dcac824af0?auto=format&fit=crop&w=800&q=80' },
  { id: '2', name: 'Alfi Soundworks', category: 'Sound Engineer', bio: 'Freelance mixing and mastering engineer. I make sure your tracks sound punchy across all streaming platforms.', ig: 'https://instagram.com/alfi_sound', customLink: 'https://linktr.ee/alfi', web: 'https://alfi.audio', photo: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80' },
  { id: '3', name: 'Surabaya Canvas Project', category: 'Mural Art', bio: 'Collective of urban muralists painting walls and transforming commercial spaces into visual landmarks.', ig: '', customLink: '', web: 'https://canvasproject.id', photo: 'https://images.unsplash.com/photo-1563212046-6b2a0c4f8069?auto=format&fit=crop&w=800&q=80' },
  { id: '4', name: 'Lintang Motion', category: 'Animator', bio: '2D & 3D motion designer focused on bold, colorful, and engaging explainer videos.', ig: 'https://instagram.com/lintang.fx', customLink: '', web: '', photo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80' }
];

const CatColors: Record<string, string> = {
  'Photographer': 'bg-teal-50/80 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300 border border-teal-200 dark:border-teal-500/30',
  'Mural Art': 'bg-emerald-50/80 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30',
  'Sound Engineer': 'bg-cyan-50/80 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/30',
  'Video Director': 'bg-sky-50/80 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300 border border-sky-200 dark:border-sky-500/30',
  'Graphic Designer': 'bg-indigo-50/80 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30',
  'Animator': 'bg-blue-50/80 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30',
};

const getColorForCategory = (cat: string) => {
  if (CatColors[cat]) return CatColors[cat];
  const colors = [
    'bg-teal-50/80 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300 border border-teal-200 dark:border-teal-500/30',
    'bg-emerald-50/80 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30',
    'bg-cyan-50/80 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/30',
    'bg-sky-50/80 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300 border border-sky-200 dark:border-sky-500/30',
    'bg-indigo-50/80 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30',
    'bg-blue-50/80 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30',
  ];
  const hash = cat.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

const getDisplayImage = (person: Creative) => {
  if (person.photo && person.photo.trim() !== '') return person.photo;
  
  if (person.ig && person.ig.trim() !== '') {
    const match = person.ig.match(/(?:instagram\.com|ig\.me)\/([^/?]+)/i);
    if (match && match[1]) {
      return `https://unavatar.io/instagram/${match[1]}?fallback=` + encodeURIComponent(`https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&background=0D8B93&color=fff&size=512`);
    }
  }
  
  if (person.web && person.web.trim() !== '') {
    return `https://image.thum.io/get/width/600/crop/800/${person.web}`;
  }
  
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&background=0D8B93&color=fff&size=512`;
};

export default function App() {
  const [data, setData] = useState<Creative[]>(INITIAL_DATA);
  const [filter, setFilter] = useState<string>('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Creative | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') || window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const dynamicCategories = ['Semua', ...Array.from(new Set(data.map(item => item.category)))];

  // Form State
  const [formData, setFormData] = useState({ name: '', category: '', bio: '', photo: '', ig: '', customLink: '', web: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ENDPOINT_API = import.meta.env.VITE_GAS_ENDPOINT_URL;

  useEffect(() => {
    if (ENDPOINT_API) {
      setIsLoading(true);
      fetch(ENDPOINT_API)
        .then(res => res.json())
        .then(data => {
          setData(data);
          setIsLoading(false);
        })
        .catch(err => {
          console.error("Gagal mengambil data:", err);
          setIsLoading(false);
        });
    } else {
      setTimeout(() => {
        setData(INITIAL_DATA);
        setIsLoading(false);
      }, 800);
    }
  }, [ENDPOINT_API]);

  const filteredData = filter === 'Semua' ? data : data.filter((c) => c.category === filter);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (ENDPOINT_API) {
      try {
        await fetch(ENDPOINT_API, {
          method: "POST",
          mode: 'no-cors',
          headers: {
            "Content-Type": "text/plain;charset=utf-8",
          },
          body: JSON.stringify(formData),
        });
        
        const newEntry: Creative = {
          id: Date.now().toString(),
          ...formData
        } as Creative;
        setData((prev) => [newEntry, ...prev]);
        
        setIsModalOpen(false);
        setFormData({ name: '', category: '', bio: '', photo: '', ig: '', customLink: '', web: '' });
        setFilter('Semua');
      } catch (error) {
        console.error("Gagal simpan:", error);
        alert("Gagal menyimpan data.");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setTimeout(() => {
        const newEntry: Creative = {
          id: Date.now().toString(),
          ...formData
        } as Creative;
        
        setData((prev) => [newEntry, ...prev]);
        setIsSubmitting(false);
        setIsModalOpen(false);
        setFormData({ name: '', category: '', bio: '', photo: '', ig: '', customLink: '', web: '' });
        setFilter('Semua');
      }, 1200);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col font-sans transition-colors duration-300 bg-slate-50 text-slate-800 dark:bg-[#0B1215] dark:text-slate-200 z-0">
      
      {/* Tosca/Glassmorphism Background Elements */}
      <div className="absolute inset-0 z-[-1] pointer-events-none overflow-hidden transition-opacity duration-500 opacity-60 dark:opacity-30">
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-tr from-teal-400/30 to-transparent blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-bl from-emerald-400/20 to-transparent blur-[120px]"></div>
        <div className="absolute top-[20%] right-[10%] w-[35vw] h-[35vw] rounded-full bg-gradient-to-b from-cyan-300/30 to-transparent blur-[100px]"></div>
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")" }}></div>
      </div>

      {/* Navigation */}
      <nav className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border-b border-teal-100/50 dark:border-white/5 sticky top-0 z-30 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-teal-600 dark:bg-teal-500 flex items-center justify-center text-white shadow-lg shadow-teal-500/20 text-sm font-bold">NT</div>
              <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Nong<span className="text-teal-600 dark:text-teal-400">TKI</span></h1>
            </div>
            
            <div className="flex items-center gap-2.5 sm:gap-4">
              <button 
                onClick={toggleDarkMode} 
                className="p-2 cursor-pointer rounded-full bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 transition-colors shadow-sm"
                aria-label="Toggle Dark Mode"
              >
                {isDarkMode ? <Sun className="w-4 h-4 sm:w-4 sm:h-4" /> : <Moon className="w-4 h-4 sm:w-4 sm:h-4" />}
              </button>

              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white px-4 py-2 sm:px-5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all shadow-md shadow-teal-600/20 active:scale-95 flex items-center gap-2"
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                <span className="hidden sm:inline">Daftar Direktori</span>
                <span className="sm:hidden">Daftar</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto pb-12 sm:py-12 w-full">
        <div className="text-center px-4 pt-10 pb-8 sm:mb-10">
          <div className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-300 font-medium text-xs mb-6 border border-teal-200/50 dark:border-teal-500/20 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
            </span>
            Direktori Para Penggerak & Pelaku Kreatif Surabaya
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-5 text-slate-900 dark:text-white leading-[1.1]">Nongkrong Tenaga<br/>Kerja Indie</h2>
          <p className="max-w-xl mx-auto text-slate-600 dark:text-slate-400 font-inter text-sm sm:text-base leading-relaxed">
            Temukan dan mulai kolaborasi dengan talenta-talenta kreatif terbaik dari ranah visual, audio, hingga desain di ekosistem lokal.
          </p>
        </div>

        {/* Filter Categories */}
        <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-8 sm:mb-12 px-4 sm:px-0 sm:justify-center snap-x pb-4">
          {dynamicCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`whitespace-nowrap px-4 py-2 flex-shrink-0 snap-center rounded-full text-xs sm:text-sm font-medium transition-all ${
                filter === cat 
                  ? 'bg-teal-600 dark:bg-teal-500 text-white shadow-md shadow-teal-600/20 scale-105' 
                  : 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-md text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white shadow-sm'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid Area */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 px-4 sm:px-0">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="aspect-square sm:aspect-[4/5] bg-slate-200/50 dark:bg-slate-800/50 rounded-2xl sm:rounded-[32px] animate-pulse"></div>
            ))}
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white/50 dark:bg-slate-800/30 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-slate-700/50 mx-4 sm:mx-0">
             <div className="text-5xl mb-4 text-slate-300 dark:text-slate-600">📭</div>
             <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Tidak Ada Data</h3>
             <p className="text-slate-500 dark:text-slate-400 font-inter text-sm mt-2">Belum ada pekerja kreatif yang terdaftar di kategori ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 px-4 sm:px-0">
            {filteredData.map((person) => {
              const catClass = getColorForCategory(person.category);
              return (
                <div key={person.id} onClick={() => setSelectedPerson(person)} className="cursor-pointer group relative p-4 sm:p-5 lg:p-6 rounded-2xl sm:rounded-[32px] overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 shadow-sm hover:shadow-xl dark:shadow-none hover:shadow-teal-500/10 transition-all duration-500 transform hover:-translate-y-1 flex flex-col h-full min-h-[200px] sm:min-h-[220px]">
                  <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <img 
                      src={getDisplayImage(person)} 
                      alt={person.name} 
                      className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full object-cover border-2 border-slate-100 dark:border-slate-800 shadow-sm shrink-0" 
                      loading="lazy"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (!target.src.includes('ui-avatars.com')) {
                          target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&background=0D8B93&color=fff&size=512`;
                        }
                      }}
                    />
                    <div className="flex flex-col pt-0 sm:pt-1">
                      <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 dark:text-white leading-tight break-words line-clamp-2">{person.name}</h3>
                      <div className="mt-1.5 sm:mt-2 text-left">
                        <span className={`inline-block px-2 py-0.5 sm:py-1 rounded text-[9px] sm:text-[10px] lg:text-xs font-semibold border ${catClass}`}>
                          {person.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-inter line-clamp-3 lg:line-clamp-4 leading-relaxed flex-1 pt-2 border-t border-slate-100 dark:border-slate-800/50">
                    {person.bio}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/50 backdrop-blur-lg py-8 mt-auto z-10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 text-center text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold text-slate-500 dark:text-slate-400 font-inter block sm:flex sm:items-center sm:justify-center gap-2">
          NONGTKI &copy; 2026. <span className="hidden sm:inline">&bull;</span> <span className="block sm:inline mt-1 sm:mt-0">FROM SURABAYA WITH ❤️</span>
        </div>
      </footer>

      {/* Detail Modal Overlay */}
      {selectedPerson && (
        <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setSelectedPerson(null)}>
          <div className="relative w-full h-[90vh] sm:h-auto sm:max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl sm:rounded-3xl rounded-t-3xl flex flex-col max-h-[95vh] sm:max-h-[90vh] overflow-hidden transform scale-100 transition-transform p-0" onClick={e => e.stopPropagation()}>
             <div className="relative h-32 sm:h-40 bg-teal-600 dark:bg-teal-900 overflow-hidden shrink-0">
               <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")" }}></div>
               <button onClick={() => setSelectedPerson(null)} className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-2 transition-colors z-10">
                  <X className="w-5 h-5" />
               </button>
             </div>
             <div className="px-6 pb-8 pt-0 relative flex-1 overflow-y-auto hide-scrollbar">
               <img src={getDisplayImage(selectedPerson)} className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white dark:border-slate-900 shadow-lg mx-auto -mt-12 sm:-mt-14 relative z-10 bg-white" />
               <div className="text-center mt-3 mb-6">
                 <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-tight">{selectedPerson.name}</h2>
                 <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold border ${getColorForCategory(selectedPerson.category)}`}>
                   {selectedPerson.category}
                 </span>
               </div>
               <div className="space-y-6">
                 <div>
                   <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Tentang</h4>
                   <p className="text-slate-700 dark:text-slate-300 font-inter text-sm leading-relaxed">{selectedPerson.bio}</p>
                 </div>
                 
                 {(selectedPerson.ig || selectedPerson.web || selectedPerson.customLink) && (
                   <div>
                     <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">Hubungi / Portofolio</h4>
                     <div className="flex flex-col gap-3">
                       {selectedPerson.ig && (
                         <a href={selectedPerson.ig} target="_blank" rel="noreferrer" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors shadow-sm border border-slate-200 dark:border-slate-700 font-medium text-sm">
                           <Instagram className="w-5 h-5 text-pink-600 dark:text-pink-400" /> Instagram
                         </a>
                       )}
                       {selectedPerson.web && (
                         <a href={selectedPerson.web} target="_blank" rel="noreferrer" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors shadow-sm border border-slate-200 dark:border-slate-700 font-medium text-sm">
                           <Globe className="w-5 h-5 text-teal-600 dark:text-teal-400" /> Website / Behance
                         </a>
                       )}
                       {selectedPerson.customLink && (
                         <a href={selectedPerson.customLink} target="_blank" rel="noreferrer" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors shadow-sm border border-slate-200 dark:border-slate-700 font-medium text-sm">
                           <AtSign className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Link Lainnya
                         </a>
                       )}
                     </div>
                   </div>
                 )}
               </div>
             </div>
          </div>
        </div>
      )}

      {/* Registration Modal Overlay - Sleek Glassmorphism */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="relative w-full h-[90vh] sm:h-auto sm:max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl sm:rounded-2xl rounded-t-3xl flex flex-col max-h-[95vh] sm:max-h-[90vh] overflow-hidden transform scale-100 transition-transform">
            
            <div className="flex justify-between items-center px-5 py-4 sm:px-6 sm:py-5 border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shrink-0">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">Jadilah Bagian Direktori!</h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto bg-slate-50/50 dark:bg-[#0B1215]/50 font-inter flex-1 hide-scrollbar">
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 flex flex-col h-full">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5 text-xs">Nama Lengkap / Studio</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} type="text" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none transition-all placeholder:text-slate-400 dark:text-white" placeholder="Cth: Lintang Motion Studio" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5 text-xs">Spesialisasi (Kategori Kustom)</label>
                  <input required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} list="category-suggestions" type="text" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none transition-all placeholder:text-slate-400 dark:text-white" placeholder="Cth: Video Editor, Muralist..." />
                  <datalist id="category-suggestions">
                    {dynamicCategories.filter(c => c !== 'Semua').map(cat => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5 text-xs">Bio / Deskripsi Profil</label>
                  <textarea required value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} rows={3} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none transition-all placeholder:text-slate-400 dark:text-white resize-none" placeholder="Ceritakan singkat tentang gaya karyamu..."></textarea>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5 text-xs flex items-center gap-1.5">
                    URL Foto Wajah / Logo <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded text-[10px] font-medium border border-slate-200 dark:border-slate-700">Opsional</span>
                  </label>
                  <input value={formData.photo} onChange={e => setFormData({...formData, photo: e.target.value})} type="url" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none transition-all placeholder:text-slate-400 dark:text-white" placeholder="https://unsplash.com/..." />
                </div>
                
                <div className="border-t border-slate-200 dark:border-slate-800 pt-5 mt-2">
                  <p className="font-semibold text-slate-600 dark:text-slate-400 mb-4 text-xs">Link Sosial & Portofolio (Opsional)</p>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block font-medium text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5 text-[10px] sm:text-xs">
                         <Instagram className="w-3.5 h-3.5" /> Instagram
                      </label>
                      <input value={formData.ig} onChange={e => setFormData({...formData, ig: e.target.value})} type="url" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm focus:border-teal-500 focus:outline-none dark:text-white transition-colors placeholder:text-slate-400" placeholder="https://..." />
                    </div>
                    <div>
                      <label className="block font-medium text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5 text-[10px] sm:text-xs">
                         <AtSign className="w-3.5 h-3.5" /> Custom Link
                      </label>
                      <input value={formData.customLink} onChange={e => setFormData({...formData, customLink: e.target.value})} type="url" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm focus:border-teal-500 focus:outline-none dark:text-white transition-colors placeholder:text-slate-400" placeholder="https://..." />
                    </div>
                    <div className="col-span-2 mt-1">
                      <label className="block font-medium text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5 text-[10px] sm:text-xs">
                         <Globe className="w-3.5 h-3.5" /> Website / Behance
                      </label>
                      <input value={formData.web} onChange={e => setFormData({...formData, web: e.target.value})} type="url" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm focus:border-teal-500 focus:outline-none dark:text-white transition-colors placeholder:text-slate-400" placeholder="https://..." />
                    </div>
                  </div>
                </div>

                <div className="pt-2 pb-6 sm:pb-2 shrink-0">
                  <button 
                    disabled={isSubmitting}
                    type="submit" 
                    className={`w-full py-3.5 sm:py-3.5 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all ${isSubmitting ? 'bg-slate-400 dark:bg-slate-700' : 'bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 shadow-md shadow-teal-500/20 active:scale-[0.98]'}`}
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : 'Simpan Profil'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}