import React, { useState, useEffect } from 'react';
import { Instagram, AtSign, Globe, Plus, X, BriefcaseBusiness, Loader2 } from 'lucide-react';
import { Category, Creative } from './types';

// Mock Data for the immediate AI Studio preview (not connected to GAS)
const INITIAL_DATA: Creative[] = [
  { id: '1', name: 'Ivan Visuals', category: 'Photographer', bio: 'Specialist in street aesthetics and modern documentary wedding photography. Capturing the authentic vibe of Surabaya.', ig: 'https://instagram.com/visualivan', threads: '', web: '', photo: 'https://images.unsplash.com/photo-1554046920-90dcac824af0?auto=format&fit=crop&w=800&q=80' },
  { id: '2', name: 'Alfi Soundworks', category: 'Sound Engineer', bio: 'Freelance mixing and mastering engineer. I make sure your tracks sound punchy across all streaming platforms.', ig: 'https://instagram.com/alfi_sound', threads: 'https://threads.net/@alfi', web: 'https://alfi.audio', photo: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80' },
  { id: '3', name: 'Surabaya Canvas Project', category: 'Mural Art', bio: 'Collective of urban muralists painting walls and transforming commercial spaces into visual landmarks.', ig: '', threads: '', web: 'https://canvasproject.id', photo: 'https://images.unsplash.com/photo-1563212046-6b2a0c4f8069?auto=format&fit=crop&w=800&q=80' },
  { id: '4', name: 'Lintang Motion', category: 'Animator', bio: '2D & 3D motion designer focused on bold, colorful, and engaging explainer videos.', ig: 'https://instagram.com/lintang.fx', threads: '', web: '', photo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80' }
];

const CATEGORIES: Category[] = ['Semua', 'Photographer', 'Mural Art', 'Sound Engineer', 'Video Director', 'Graphic Designer', 'Animator'];

const CatColors: Record<string, string> = {
  'Photographer': 'bg-[#E8F0E8] text-[#4A6D4A]',
  'Mural Art': 'bg-[#FDE8E8] text-[#A64A4A]',
  'Sound Engineer': 'bg-[#F2E8FD] text-[#7A4AA6]',
  'Video Director': 'bg-[#E8EBFD] text-[#4A5BA6]',
  'Graphic Designer': 'bg-[#E8F8FD] text-[#4A99A6]',
  'Animator': 'bg-[#FDF8E8] text-[#A68F4A]',
};

export default function App() {
  const [data, setData] = useState<Creative[]>([]);
  const [filter, setFilter] = useState<Category>('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({ name: '', category: '', bio: '', photo: '', ig: '', threads: '', web: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

const ENDPOINT_API = import.meta.env.VITE_GAS_ENDPOINT_URL;

  useEffect(() => {
    if (ENDPOINT_API) {
      setIsLoading(true);
      // Fetch dari Google Apps Script API
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
      // Simulate fetching data for local AI Studio preview
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
          body: JSON.stringify(formData),
          // mode: 'no-cors' bisa dicoba jika Anda mengalami isu preflight headers di browser.
          // Tapi pastikan file Code.gs Anda memiliki fungsi doOptions ya!
        });
        
        // Optimistic Update: Tambahkan state sementara tanpa nunggu refresh dari server
        const newEntry: Creative = {
          id: Date.now().toString(),
          ...formData
        } as Creative;
        setData((prev) => [newEntry, ...prev]);
        
        setIsModalOpen(false);
        setFormData({ name: '', category: '', bio: '', photo: '', ig: '', threads: '', web: '' });
        setFilter('Semua');
      } catch (error) {
        console.error("Gagal simpan:", error);
        alert("Gagal menyimpan data ke Google Sheets.");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Simulate GAS save operation
      setTimeout(() => {
        const newEntry: Creative = {
          id: Date.now().toString(),
          ...formData
        } as Creative;
        
        setData((prev) => [newEntry, ...prev]);
        setIsSubmitting(false);
        setIsModalOpen(false);
        setFormData({ name: '', category: '', bio: '', photo: '', ig: '', threads: '', web: '' });
        setFilter('Semua');
      }, 1200);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] flex flex-col font-sans text-[#424235] antialiased selection:bg-[#E6E6DF] selection:text-[#2A2A1A]">
      
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-[#E6E6DF] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 sm:h-20 items-center">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#5A5A40] flex items-center justify-center text-white font-bold text-shadow text-sm sm:text-base">NT</div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#2A2A1A]">Nong<span className="text-[#8E9280]">TKI</span></h1>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-[#5A5A40] hover:bg-[#4A4A35] text-white px-4 py-2 sm:px-6 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold shadow-sm flex items-center gap-2 transition-all active:scale-95"
            >
              <BriefcaseBusiness className="w-3.5 h-3.5 sm:w-4 sm:h-4 hidden sm:block" />
              <span className="sm:hidden">Daftar</span>
              <span className="hidden sm:inline">Daftar Direktori</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto pb-12 sm:py-12 w-full">
        <div className="text-center px-4 pt-8 pb-6 sm:mb-12">
          <div className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-[#E8F0E8] text-[#4A6D4A] font-medium text-xs mb-4 border border-[#E6E6DF]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8CA48C] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4A6D4A]"></span>
            </span>
            Direktori Para Penggerak dan pelaku Kreatif Surabaya
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3 sm:mb-4 text-[#2A2A1A]">Nongkrong Tenaga Kerja Indie</h2>
          <p className="max-w-xl mx-auto text-[#6B6B5B] font-inter text-sm sm:text-lg">
            Temukan dan mulai kolaborasi dengan talenta-talenta kreatif terbaik dari ranah visual, audio, hingga desain.
          </p>
        </div>

        {/* Filter Categories */}
        <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-6 sm:mb-10 px-4 sm:px-0 sm:justify-center snap-x pb-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`whitespace-nowrap px-4 py-1.5 sm:px-5 sm:py-2 flex-shrink-0 snap-center rounded-full text-xs sm:text-sm font-medium transition-all ${
                filter === cat 
                  ? 'bg-[#5A5A40] text-white shadow-md sm:scale-105' 
                  : 'bg-white text-[#5A5A40] border border-[#E6E6DF] hover:bg-[#F5F5F0] hover:text-[#2A2A1A]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid Area */}
        {isLoading ? (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1.5 sm:gap-6 px-1.5 sm:px-0">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-square sm:aspect-[3/4] lg:aspect-[4/5] bg-slate-200 rounded-xl sm:rounded-[32px] animate-pulse"></div>
            ))}
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-[#E6E6DF] mx-1.5 sm:mx-0">
             <div className="text-5xl mb-4 opacity-50">📭</div>
             <h3 className="text-xl font-bold text-[#2A2A1A]">Tidak Ada Data</h3>
             <p className="text-[#6B6B5B] font-inter mt-2">Belum ada pekerja kreatif yang terdaftar di kategori ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1.5 sm:gap-6 px-1.5 sm:px-0">
            {filteredData.map((person) => {
              return (
                <div key={person.id} className="group relative aspect-square sm:aspect-[3/4] lg:aspect-[4/5] rounded-xl sm:rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-black/5 bg-[#E6E6DF] transform hover:-translate-y-1">
                  <img 
                    src={person.photo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'} 
                    alt={person.name} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    loading="lazy"
                  />
                  
                  {/* Glass Overlay Card */}
                  <div className="absolute inset-x-1 bottom-1 sm:inset-x-3 sm:bottom-3 bg-white/60 hover:bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.08)] rounded-lg sm:rounded-2xl p-2 sm:p-5 flex flex-col transition-colors duration-300">
                    <h3 className="text-[10px] sm:text-lg lg:text-xl font-bold text-[#2A2A1A] leading-tight truncate px-0.5">{person.name}</h3>
                    <p className="text-[8px] sm:text-xs lg:text-sm font-semibold text-[#5A5A40] truncate sm:mt-1 px-0.5">{person.category}</p>
                    
                    <p className="hidden sm:-webkit-box text-sm text-[#424235] line-clamp-3 mt-3 leading-relaxed">
                      {person.bio}
                    </p>
                    
                    <div className="flex items-center gap-1.5 sm:gap-2 mt-1.5 sm:mt-4">
                      {person.ig && (
                        <a href={person.ig} target="_blank" rel="noreferrer" className="flex items-center justify-center w-6 h-6 sm:w-9 sm:h-9 rounded-full bg-white/60 hover:bg-white/90 text-[#2A2A1A] transition-all shadow-sm">
                          <Instagram className="w-3 h-3 sm:w-4 sm:h-4" />
                        </a>
                      )}
                      {person.threads && (
                        <a href={person.threads} target="_blank" rel="noreferrer" className="flex items-center justify-center w-6 h-6 sm:w-9 sm:h-9 rounded-full bg-white/60 hover:bg-white/90 text-[#2A2A1A] transition-all shadow-sm">
                          <AtSign className="w-3 h-3 sm:w-4 sm:h-4" />
                        </a>
                      )}
                      {person.web && (
                        <a href={person.web} target="_blank" rel="noreferrer" className="flex items-center justify-center w-6 h-6 sm:w-9 sm:h-9 rounded-full bg-white/60 hover:bg-white/90 text-[#2A2A1A] transition-all shadow-sm">
                          <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      <footer className="border-t border-[#E6E6DF] bg-white py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-[10px] uppercase tracking-[0.2em] font-bold text-[#8E9280] font-inter block sm:flex sm:items-center sm:justify-center gap-1">
          NongTKI &copy; 2026. <span className="hidden sm:inline">•</span> <span className="block sm:inline mt-1 sm:mt-0">From Surabaya with ❤️</span>
        </div>
      </footer>

      {/* Registration Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2A2A1A]/60 backdrop-blur-sm transition-opacity">
          <div className="relative w-full max-w-lg bg-[#F5F5F0] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <form onSubmit={handleSubmit}>
              <div className="flex items-center justify-between px-6 py-5 border-b border-[#E6E6DF] bg-white">
                <h3 className="text-lg font-bold text-[#2A2A1A]">Form Kreator Baru</h3>
                <button type="button" onClick={() => setIsModalOpen(false)} className="text-[#8E9280] hover:text-[#5A5A40] bg-[#F5F5F0] rounded-full p-2 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto font-inter text-sm sidebar-scroll bg-white">
                <div>
                  <label className="block font-medium text-[#424235] mb-1.5">Nama / Nama Bisnis</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} type="text" className="w-full rounded-lg border border-[#E6E6DF] px-3 py-2.5 focus:border-[#5A5A40] focus:outline-none focus:ring-1 focus:ring-[#5A5A40] transition-all placeholder:text-[#8E9280]" placeholder="Cth: Lintang Motion Studio" />
                </div>
                <div>
                  <label className="block font-medium text-[#424235] mb-1.5">Spesialisasi</label>
                  <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full rounded-lg border border-[#E6E6DF] px-3 py-2.5 focus:border-[#5A5A40] focus:outline-none focus:ring-1 focus:ring-[#5A5A40] bg-white shadow-sm text-[#424235]">
                    <option value="" disabled>Pilih spesialisasi utama...</option>
                    {CATEGORIES.filter(c => c !== 'Semua').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-[#424235] mb-1.5">Bio / Deskripsi Profil</label>
                  <textarea required value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} rows={3} className="w-full rounded-lg border border-[#E6E6DF] px-3 py-2.5 focus:border-[#5A5A40] focus:outline-none focus:ring-1 focus:ring-[#5A5A40] placeholder:text-[#8E9280] resize-none" placeholder="Ceritakan gaya eksekusi, pengalaman, atau apa yang membedakan karyamu..."></textarea>
                </div>
                <div>
                  <label className="block font-medium text-[#424235] mb-1.5">URL Foto Profil / Cover</label>
                  <input required value={formData.photo} onChange={e => setFormData({...formData, photo: e.target.value})} type="url" className="w-full rounded-lg border border-[#E6E6DF] px-3 py-2.5 focus:border-[#5A5A40] focus:outline-none focus:ring-1 focus:ring-[#5A5A40] placeholder:text-[#8E9280]" placeholder="https://unsplash.com/..." />
                </div>
                <div className="border-t border-[#E6E6DF] pt-5">
                  <p className="font-semibold text-[#2A2A1A] mb-4">Link Sosial & Portofolio</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-medium text-[#6B6B5B] mb-1 flex items-center gap-1.5">
                         <Instagram className="w-3.5 h-3.5" /> Instagram
                      </label>
                      <input value={formData.ig} onChange={e => setFormData({...formData, ig: e.target.value})} type="url" className="w-full rounded-lg border border-[#E6E6DF] px-3 py-2 focus:border-[#5A5A40] focus:outline-none placeholder:text-[#8E9280]" placeholder="https://..." />
                    </div>
                    <div>
                      <label className="block font-medium text-[#6B6B5B] mb-1 flex items-center gap-1.5">
                         <AtSign className="w-3.5 h-3.5" /> Threads
                      </label>
                      <input value={formData.threads} onChange={e => setFormData({...formData, threads: e.target.value})} type="url" className="w-full rounded-lg border border-[#E6E6DF] px-3 py-2 focus:border-[#5A5A40] focus:outline-none placeholder:text-[#8E9280]" placeholder="https://..." />
                    </div>
                    <div className="col-span-2 mt-1">
                      <label className="block font-medium text-[#6B6B5B] mb-1 flex items-center gap-1.5">
                         <Globe className="w-3.5 h-3.5" /> Website / Behance / Dribbble
                      </label>
                      <input value={formData.web} onChange={e => setFormData({...formData, web: e.target.value})} type="url" className="w-full rounded-lg border border-[#E6E6DF] px-3 py-2 focus:border-[#5A5A40] focus:outline-none placeholder:text-[#8E9280]" placeholder="https://..." />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-[#F5F5F0] px-6 py-4 flex flex-row-reverse gap-3 items-center border-t border-[#E6E6DF]">
                <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto inline-flex justify-center items-center gap-2 rounded-full bg-[#5A5A40] px-6 py-2.5 font-medium text-white hover:bg-[#4A4A35] focus:ring-4 focus:ring-[#E6E6DF] transition-all disabled:opacity-70">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>Simpan Profil</span>
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="w-full sm:w-auto text-center px-4 py-2.5 font-medium text-[#6B6B5B] hover:text-[#2A2A1A] transition-colors">
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
