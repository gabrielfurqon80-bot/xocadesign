import React, { useState } from 'react';
import { 
  Instagram, Dribbble, Mail, Github, Sparkles, Send, 
  Eye, Calendar, Briefcase, User, Layers, ArrowRight, 
  X, Check, Lock, ShieldAlert, Heart
} from 'lucide-react';
import { PortfolioData, PortfolioItem, ThemeConfig } from '../types';

interface PortfolioViewProps {
  data: PortfolioData;
  onEnterAdmin: () => void;
}

export default function PortfolioView({ data, onEnterAdmin }: PortfolioViewProps) {
  const { headline, about, theme, items } = data;
  
  // States
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeItem, setActiveItem] = useState<PortfolioItem | null>(null);
  
  // Contact Form States
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Extract and combine categories from config and items
  const categoriesConfig = data.categories || [];
  const itemCategories = Array.from(new Set(items.map(item => item.category)));
  const combinedCategories = [...categoriesConfig];
  itemCategories.forEach(catName => {
    if (!combinedCategories.some(c => c.name.toLowerCase() === catName.toLowerCase())) {
      combinedCategories.push({ name: catName });
    }
  });

  const [categorySearch, setCategorySearch] = useState('');

  // Extract all categories for filtering in gallery (mapped as UPPERCASE list)
  const categories = ['ALL', ...Array.from(new Set(combinedCategories.map(c => c.name.toUpperCase())))];

  // Filters items
  const filteredItems = selectedCategory === 'ALL' 
    ? items 
    : items.filter(item => item.category.toUpperCase() === selectedCategory);

  // Helper theme functions
  const getFontClass = (font: string) => {
    switch(font) {
      case 'sans': return 'font-sans';
      case 'mono': return 'font-mono';
      case 'serif': return 'font-serif';
      case 'grotesk': return 'font-grotesk';
      default: return 'font-sans';
    }
  };

  const getHeaderFontClass = (isItalic = false) => {
    if (theme.fontFamily === 'serif') {
      return `font-serif ${isItalic ? 'italic' : ''}`;
    }
    if (theme.fontFamily === 'grotesk') {
      return 'font-grotesk font-bold';
    }
    return `font-sans font-extrabold tracking-tight ${isItalic ? 'italic' : ''}`;
  };

  const getBorderClass = (style: string) => {
    switch(style) {
      case 'sharp': return 'rounded-none';
      case 'rounded': return 'rounded-2xl';
      case 'pill': return 'rounded-[32px]';
      default: return 'rounded-2xl';
    }
  };

  const getInnerBorderClass = (style: string) => {
    switch(style) {
      case 'sharp': return 'rounded-none';
      case 'rounded': return 'rounded-xl';
      case 'pill': return 'rounded-2xl';
      default: return 'rounded-xl';
    }
  };

  const getBgColor = (variant: string) => {
    switch(variant) {
      case 'midnight': return '#0b0f19';
      case 'obsidian': return '#050505';
      case 'charcoal': return '#121620';
      case 'nord': return '#0f141d';
      default: return '#0b0f19';
    }
  };

  // Styles object
  const customStyles = {
    '--primary-color': theme.primaryColor,
    '--accent-color': theme.accentColor,
    backgroundColor: getBgColor(theme.bgVariant),
    color: '#f3f4f6',
  } as React.CSSProperties;

  // Contact Form Submission
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) {
      setSubmitError('Nama, Email, dan Pesan wajib diisi.');
      return;
    }

    setSubmitError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contactName,
          email: contactEmail,
          subject: contactSubject,
          message: contactMessage
        })
      });

      const resData = await response.json();
      if (response.ok && resData.success) {
        setSubmitSuccess(true);
        // Reset fields
        setContactName('');
        setContactEmail('');
        setContactSubject('');
        setContactMessage('');
        setTimeout(() => setSubmitSuccess(false), 5000);
      } else {
        setSubmitError(resData.error || 'Terjadi kesalahan sistem.');
      }
    } catch {
      setSubmitError('Gagal mengirim pesan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Smooth Scroll Helper
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div 
      style={customStyles} 
      className={`min-h-screen ${getFontClass(theme.fontFamily)} ${theme.bgVariant === 'obsidian' ? '' : 'grid-pattern'} transition-colors duration-500`}
    >
      {/* Decorative Blur Spheres (removed/reduced to preserve pure matte black look, or kept extremely subtle) */}
      {theme.bgVariant !== 'obsidian' && (
        <>
          <div 
            className="fixed top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full opacity-[0.05] pointer-events-none blur-[120px]"
            style={{ backgroundColor: theme.primaryColor }}
          ></div>
          <div 
            className="fixed bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full opacity-[0.05] pointer-events-none blur-[120px]"
            style={{ backgroundColor: theme.accentColor }}
          ></div>
        </>
      )}

      {/* Navigation Header */}
      <header className="sticky top-4 z-30 bg-[#050505]/45 backdrop-blur-lg border border-white/10 mx-4 sm:mx-6 md:mx-12 my-4 px-6 md:px-8 py-4 flex items-center justify-between transition-all rounded-2xl shadow-lg shadow-black/25">
        <button 
          onClick={() => scrollToSection('hero')}
          className="flex flex-col text-left group cursor-pointer focus:outline-none"
        >
          <span className="text-[8px] uppercase tracking-[0.3em] text-white/30 mb-1">
            Visual Designer Portfolio
          </span>
          <span className={`text-xl ${getHeaderFontClass(true)} tracking-tighter text-[#F0F0F0] group-hover:text-white transition-colors`}>
            {about.name}.
          </span>
        </button>

        <nav className="hidden md:flex items-center gap-8 text-[10px] uppercase tracking-[0.2em] font-semibold text-white/40">
          <button onClick={() => scrollToSection('hero')} className="hover:text-white transition-colors cursor-pointer">Utama</button>
          <button onClick={() => scrollToSection('categories-hub')} className="hover:text-white transition-colors cursor-pointer">Kategori Poster</button>
          <button onClick={() => scrollToSection('gallery')} className="hover:text-white transition-colors cursor-pointer">Galeri Poster</button>
          <button onClick={() => scrollToSection('about')} className="hover:text-white transition-colors cursor-pointer">Tentang Saya</button>
          <button onClick={() => scrollToSection('contact')} className="hover:text-white transition-colors cursor-pointer">Hubungi Kami</button>
        </nav>

        <div className="flex items-center gap-4">
          {/* Dot decorator from Design HTML */}
          <div className="hidden lg:flex w-8 h-8 rounded-full border border-white/20 items-center justify-center cursor-pointer hover:border-white transition-colors">
            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
          </div>
          
          <button
            id="header-admin-portal-btn"
            onClick={onEnterAdmin}
            className="text-[10px] font-bold uppercase tracking-[0.2em] border border-white/20 hover:border-white px-4 py-2 hover:bg-white hover:text-black transition-all text-white/85 rounded-xl cursor-pointer flex items-center gap-1.5 backdrop-blur-md bg-white/5"
          >
            <Lock className="h-3 w-3" /> Admin
          </button>
        </div>
      </header>

      {/* Hero Landing Area */}
      <section id="hero" className="relative min-h-[85vh] flex items-center justify-center px-6 md:px-12 py-16">
        <div className="w-full max-w-5xl text-center space-y-8">
          
          {/* Status Badge */}
          {headline.badgeText && (
            <div className="inline-block px-3.5 py-1.5 border border-white/20 rounded-full text-[9px] uppercase tracking-[0.25em] text-white/60">
              <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              {headline.badgeText}
            </div>
          )}

          {/* Welcome Greeting */}
          {headline.greeting && (
            <h3 className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-1 font-mono">
              {headline.greeting}
            </h3>
          )}

          {/* Majestic Heading Title */}
          {headline.title && (
            <h1 className={`text-4xl sm:text-5xl md:text-8xl ${getHeaderFontClass()} leading-[0.95] tracking-tighter text-white max-w-4xl mx-auto font-normal`}>
              {headline.title.split(' ').map((word, i) => {
                const isSpecial = ['visual', 'karya', 'gagasan', 'spektakuler', 'creative', 'digital', 'poetry', 'seni'].includes(word.toLowerCase().replace(/[^a-z]/g, ''));
                if (isSpecial) {
                  return <span key={i} className="italic text-white/40 font-light">{word} </span>;
                }
                return <span key={i}>{word} </span>;
              })}
            </h1>
          )}

          {/* Elegant Sub-Headline */}
          {headline.subtitle && (
            <p className="text-sm md:text-base text-white/50 max-w-xl mx-auto leading-relaxed">
              {headline.subtitle}
            </p>
          )}

          {/* Button Group */}
          <div className="pt-6 flex flex-wrap justify-center gap-4">
            <button
              id="view-gallery-btn"
              onClick={() => scrollToSection('categories-hub')}
              className="px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] bg-white text-black hover:bg-white/90 transition-all cursor-pointer active:scale-95 duration-200"
              style={{ 
                borderRadius: theme.borderStyle === 'sharp' ? '0' : '14px',
              }}
            >
              Kategori Poster &rarr;
            </button>

            <button
              id="talk-design-btn"
              onClick={() => scrollToSection('contact')}
              className="px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] border border-white/20 hover:bg-white hover:text-black transition-all cursor-pointer active:scale-95 duration-200 bg-white/5 backdrop-blur-md text-white"
              style={{ 
                borderRadius: theme.borderStyle === 'sharp' ? '0' : '14px'
              }}
            >
              Hubungi Devin
            </button>
          </div>
        </div>
      </section>

      {/* Dynamic Category Hub Section */}
      <section id="categories-hub" className="py-24 px-6 md:px-12 border-t border-white/10 bg-white/[0.01]">
        <div className="w-full max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-[10px] uppercase tracking-[0.3em] text-purple-400 font-semibold">Hub Kategori Desain</span>
            <h2 className={`text-3xl md:text-5xl ${getHeaderFontClass(true)} text-[#F0F0F0]`}>
              Kategori Project Poster
            </h2>
            <p className="text-xs text-white/50 leading-relaxed">
              Temukan seluruh gaya, genre, dan aliran seni visual yang saya rancang. Kami mendukung lebih dari 100 kategori desain yang dikonfigurasi secara fleksibel melalui panel admin.
            </p>

            {/* Category Search bar */}
            <div className="pt-4 max-w-md mx-auto">
              <input
                type="text"
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                placeholder="Cari aliran seni atau kategori poster..."
                className="w-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md py-3 px-5 text-xs text-white focus:border-purple-500 focus:outline-none transition-all placeholder-white/30"
              />
            </div>
          </div>

          {/* Grid of Category cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {combinedCategories
              .filter(cat => cat.name.toLowerCase().includes(categorySearch.toLowerCase()))
              .map((cat, idx) => {
                const count = items.filter(item => item.category.toLowerCase() === cat.name.toLowerCase()).length;
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedCategory(cat.name.toUpperCase());
                      scrollToSection('gallery');
                    }}
                    className="group relative bg-white/[0.03] backdrop-blur-md border border-white/10 p-6 hover:bg-white/[0.07] hover:border-white/30 transition-all duration-300 flex flex-col justify-between gap-5 cursor-pointer hover:shadow-lg hover:shadow-purple-500/5 select-none"
                    style={{
                      borderRadius: theme.borderStyle === 'sharp' ? '0' : '20px'
                    }}
                  >
                    <div className="space-y-3">
                      <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:bg-purple-500 group-hover:text-black transition-all">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      
                      <div>
                        <h4 className="font-bold text-sm text-slate-100 group-hover:text-white transition-colors">
                          {cat.name}
                        </h4>
                        <p className="text-[10px] text-white/40 font-mono mt-0.5">
                          {count} {count === 1 ? 'Karya' : 'Karya Desain'}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-white/5 pt-4 flex items-center justify-between text-[10px] text-white/40 group-hover:text-white transition-all">
                      <span>
                        {cat.maxUploads !== undefined ? `Maks: ${cat.maxUploads}` : 'Tanpa Batas'}
                      </span>
                      <span className="underline group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                        Lihat <ArrowRight className="h-2.5 w-2.5" />
                      </span>
                    </div>
                  </div>
                );
              })}

            {combinedCategories.filter(cat => cat.name.toLowerCase().includes(categorySearch.toLowerCase())).length === 0 && (
              <div className="col-span-full py-16 text-center border border-dashed border-white/10 rounded-2xl text-white/40">
                Kategori "{categorySearch}" tidak ditemukan.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Dynamic Gallery Section */}
      <section id="gallery" className="py-24 px-6 md:px-12 border-t border-white/10">
        <div className="w-full max-w-7xl mx-auto space-y-16">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-[0.25em] text-white/40 block">Galeri Portofolio</span>
              <h2 className={`text-3xl md:text-4xl ${getHeaderFontClass(true)} text-[#F0F0F0]`}>Karya Seni Visual Pilihan</h2>
            </div>

            {/* Dynamic Categories Filter buttons */}
            <div className="flex flex-wrap gap-2.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] transition-all cursor-pointer duration-200 ${
                    selectedCategory === cat 
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' 
                      : 'bg-white/5 border border-white/10 text-white/50 hover:text-white hover:border-white/30 backdrop-blur-md'
                  }`}
                  style={{
                    borderRadius: theme.borderStyle === 'sharp' ? '0' : '9999px'
                  }}
                >
                  {cat === 'ALL' ? 'All Projects' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Responsive Gallery Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item, idx) => (
              <div
                key={item.id}
                id={`portfolio-item-${item.id}`}
                onClick={() => setActiveItem(item)}
                className="group cursor-pointer bg-white/[0.02] border border-white/10 overflow-hidden transition-all duration-500 relative flex flex-col hover:border-white/30 backdrop-blur-sm"
                style={{ 
                  borderRadius: theme.borderStyle === 'sharp' ? '0' : '24px' 
                }}
              >
                {/* Poster Photo wrapper */}
                <div className="aspect-[4/5] w-full overflow-hidden bg-black relative">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="h-full w-full object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-white/10 font-serif text-6xl">
                      P0{idx + 1}
                    </div>
                  )}
                  
                  {/* Subtle Elegant Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-300"></div>
                  
                  {/* Bottom Text inside the poster space matching the Design HTML style */}
                  <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-col">
                    <span className="text-[9px] uppercase tracking-[0.2em] text-white/40 mb-1 font-mono">
                      Project 0{idx + 1} &bull; {item.category}
                    </span>
                    <h3 className={`text-xl ${getHeaderFontClass(true)} text-[#F0F0F0] group-hover:text-white transition-colors`}>
                      {item.title}
                    </h3>
                  </div>

                  {/* Top-Right category overlay badge */}
                  <span className="absolute top-4 right-4 bg-[#050505]/45 backdrop-blur text-[8px] text-white/60 font-bold px-2.5 py-1 tracking-widest uppercase border border-white/10 rounded-full">
                    {item.category}
                  </span>

                  {/* Elegant eye-icon indicator on hover */}
                  <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center border border-white/10 backdrop-blur-md">
                      <Eye className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </div>

                {/* Sub-Card Details (Minimal details footer matching Aruna Visuals) */}
                <div className="p-5 flex items-center justify-between gap-4 border-t border-white/10 bg-black/20 backdrop-blur-md">
                  <div>
                    <h4 className={`text-sm ${getHeaderFontClass(true)} text-white/80 group-hover:text-white transition-colors`}>
                      {item.title}
                    </h4>
                    <p className="text-[9px] uppercase tracking-widest text-white/30 mt-1 font-mono">
                      {item.client || "Personal Project"} &bull; {item.year || "2026"}
                    </p>
                  </div>
                  <div className="h-8 w-8 shrink-0 border border-white/10 rounded-full flex items-center justify-center text-white/40 group-hover:text-white group-hover:bg-white/10 group-hover:border-white/30 transition-all backdrop-blur-sm">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>
            ))}

            {filteredItems.length === 0 && (
              <div className="col-span-full py-20 text-center border border-dashed border-white/10">
                <p className="text-sm text-white/40 font-serif italic">Belum ada karya desain dengan kategori ini.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Lightbox / Detail Interactive Modal */}
      {activeItem && (
        <div 
          id="gallery-lightbox"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={() => setActiveItem(null)}
        >
          <div 
            className="w-full max-w-5xl bg-[#050505]/90 border border-white/10 overflow-hidden shadow-2xl transition-all max-h-[90vh] flex flex-col md:flex-row backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
            style={{ borderRadius: theme.borderStyle === 'sharp' ? '0' : '24px' }}
          >
            {/* Left Column: Image Area */}
            <div className="md:flex-1 bg-black flex items-center justify-center relative overflow-hidden max-h-[50vh] md:max-h-[90vh]">
              <img 
                src={activeItem.imageUrl} 
                alt={activeItem.title} 
                className="w-full h-full object-contain max-h-[50vh] md:max-h-[90vh]"
                referrerPolicy="no-referrer"
              />
              <button
                id="lightbox-close-mobile-btn"
                onClick={() => setActiveItem(null)}
                className="absolute top-4 right-4 md:hidden p-2 rounded-full bg-black/60 text-white border border-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Right Column: Information Area */}
            <div className="w-full md:w-[380px] p-8 border-t md:border-t-0 md:border-l border-white/10 flex flex-col justify-between gap-6 overflow-y-auto max-h-[40vh] md:max-h-[90vh] bg-[#0d0d0d]">
              <div className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[9px] font-bold tracking-[0.2em] bg-white/5 border border-white/10 text-white/60 px-3 py-1 uppercase rounded-full">
                    {activeItem.category}
                  </span>
                  <button
                    id="lightbox-close-desktop-btn"
                    onClick={() => setActiveItem(null)}
                    className="hidden md:flex p-2 hover:bg-white/5 border border-white/10 hover:border-white text-white/40 hover:text-white transition-all cursor-pointer rounded-xl"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  <span className="text-[9px] uppercase tracking-widest text-white/40">Detail Project</span>
                  <h2 className={`text-3xl ${getHeaderFontClass(true)} text-[#F0F0F0] leading-tight`}>{activeItem.title}</h2>
                  <p className="text-[9px] text-white/40 font-mono uppercase tracking-widest flex items-center gap-2">
                    <span>Client: {activeItem.client || "Personal Project"}</span>
                    <span>&bull;</span>
                    <span>Tahun: {activeItem.year || "2026"}</span>
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[9px] uppercase tracking-[0.2em] text-white/40 font-bold">Tentang Karya Ini</h4>
                  <p className="text-xs text-white/60 leading-relaxed font-sans">{activeItem.description}</p>
                </div>

                <div className="space-y-2 pt-2">
                  <h4 className="text-[9px] uppercase tracking-[0.2em] text-white/40 font-bold">Tags Karya</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {activeItem.tags.map((tag, idx) => (
                      <span key={idx} className="text-[9px] border border-white/10 text-white/50 px-2.5 py-1 rounded-full uppercase tracking-wider bg-white/5 backdrop-blur-sm">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10">
                <button
                  id="lightbox-inquiry-btn"
                  onClick={() => {
                    setContactSubject(`Tanya terkait karya: ${activeItem.title}`);
                    setActiveItem(null);
                    scrollToSection('contact');
                  }}
                  className="w-full py-3.5 bg-white text-black hover:bg-white/95 text-[10px] font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 cursor-pointer duration-200"
                  style={{
                    borderRadius: theme.borderStyle === 'sharp' ? '0' : '14px'
                  }}
                >
                  Ajukan Penawaran Terkait Karya
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* About Me Section */}
      <section id="about" className="py-24 px-6 md:px-12 border-t border-white/10">
        <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-16 items-center">
          
          {/* Profile Picture Frame Left */}
          <div className="md:col-span-5 flex justify-center">
            <div className="relative group max-w-xs w-full">
              <div 
                className="relative overflow-hidden aspect-[3/4] border border-white/10 p-3 bg-white/[0.02]"
                style={{ borderRadius: theme.borderStyle === 'sharp' ? '0' : '24px' }}
              >
                <img 
                  src={about.avatarUrl} 
                  alt={about.name} 
                  className="h-full w-full object-cover filter grayscale contrast-[1.1] hover:grayscale-0 transition-all duration-700"
                  style={{ borderRadius: theme.borderStyle === 'sharp' ? '0' : '16px' }}
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>

          {/* About Me Story Right */}
          <div className="md:col-span-7 space-y-8">
            <div className="space-y-2">
              <span className="text-[9px] uppercase tracking-[0.3em] text-white/40 block font-mono">Siapa Saya?</span>
              <h2 className={`text-4xl ${getHeaderFontClass()} text-[#F0F0F0] tracking-tighter`}>
                {about.name}
              </h2>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-mono">
                {about.role}
              </p>
            </div>

            <p className="text-sm text-white/60 leading-relaxed font-sans whitespace-pre-line">
              {about.bio}
            </p>

            {/* List of Skills */}
            <div className="space-y-4">
              <h4 className="text-[9px] uppercase tracking-[0.2em] text-white/40 font-bold">Keahlian Spesialisasi</h4>
              <div className="flex flex-wrap gap-2">
                {about.skills.map((skill, idx) => (
                  <span 
                    key={idx} 
                    className="text-[10px] uppercase tracking-[0.1em] border border-white/10 hover:border-white/20 text-white/60 px-4 py-2 bg-transparent transition-all"
                    style={{ borderRadius: theme.borderStyle === 'sharp' ? '0' : '12px' }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Social Channels and Coordinates */}
            <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-white/10">
              {about.socials.instagram && (
                <a 
                  href={about.socials.instagram} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="h-10 w-10 border border-white/10 hover:bg-white hover:text-black text-white/50 transition-colors flex items-center justify-center rounded-xl"
                >
                  <Instagram className="h-4 w-4" />
                </a>
              )}
              {about.socials.behance && (
                <a 
                  href={about.socials.behance} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="h-10 w-10 border border-white/10 hover:bg-white hover:text-black text-white/50 transition-colors flex items-center justify-center rounded-xl"
                >
                  <Layers className="h-4 w-4" />
                </a>
              )}
              {about.socials.dribbble && (
                <a 
                  href={about.socials.dribbble} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="h-10 w-10 border border-white/10 hover:bg-white hover:text-black text-white/50 transition-colors flex items-center justify-center rounded-xl"
                >
                  <Dribbble className="h-4 w-4" />
                </a>
              )}
              {about.socials.github && (
                <a 
                  href={about.socials.github} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="h-10 w-10 border border-white/10 hover:bg-white hover:text-black text-white/50 transition-colors flex items-center justify-center rounded-xl"
                >
                  <Github className="h-4 w-4" />
                </a>
              )}
              {about.socials.email && (
                <a 
                  href={`mailto:${about.socials.email}`} 
                  className="h-10 w-10 border border-white/10 hover:bg-white hover:text-black text-white/50 transition-colors flex items-center justify-center rounded-xl"
                >
                  <Mail className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Accessible Contact Form Section */}
      <section id="contact" className="py-24 px-6 md:px-12 border-t border-white/10 bg-[#050505]">
        <div className="w-full max-w-4xl mx-auto space-y-12">
          
          <div className="text-center space-y-2">
            <span className="text-[9px] uppercase tracking-[0.3em] text-white/40 font-mono block">Mulai Kolaborasi</span>
            <h2 className={`text-3xl ${getHeaderFontClass(true)} text-[#F0F0F0]`}>Kirimkan Surat Penawaran</h2>
            <p className="text-xs text-white/40 max-w-md mx-auto">Ada gagasan kreatif yang ingin diwujudkan bersama? Silakan isi formulir kontak yang responsif di bawah ini.</p>
          </div>

          {/* Form Box */}
          <div 
            className="bg-white/[0.02] p-8 border border-white/10 backdrop-blur-md shadow-lg shadow-black/10"
            style={{ borderRadius: theme.borderStyle === 'sharp' ? '0' : '24px' }}
          >
            {submitSuccess && (
              <div 
                className="absolute inset-0 bg-[#050505]/95 backdrop-blur-md z-10 flex flex-col items-center justify-center text-center p-6 rounded-2xl"
              >
                <div 
                  className="h-16 w-16 border border-white/20 rounded-full flex items-center justify-center text-white mb-4"
                >
                  <Check className="h-8 w-8 stroke-[1.5]" />
                </div>
                <h3 className="text-xl font-serif italic text-white">Pesan Berhasil Terkirim!</h3>
                <p className="text-xs text-white/40 max-w-sm mt-2 leading-relaxed">Terima kasih atas minat Anda. Surat penawaran kolaborasi telah tersimpan di panel admin, Devin akan segera meninjau pesan Anda.</p>
                <button
                  type="button"
                  onClick={() => setSubmitSuccess(false)}
                  className="mt-6 text-xs text-white/60 hover:text-white underline cursor-pointer"
                >
                  Kirim pesan baru
                </button>
              </div>
            )}

            <form onSubmit={handleContactSubmit} className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="block text-[9px] uppercase tracking-widest text-white/40 font-bold">Nama Lengkap</label>
                  <input
                    id="contact-name-input"
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Masukkan nama lengkap Anda"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs text-white placeholder-white/25 focus:border-purple-500 focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[9px] uppercase tracking-widest text-white/40 font-bold">Alamat Email</label>
                  <input
                    id="contact-email-input"
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs text-white placeholder-white/25 focus:border-purple-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[9px] uppercase tracking-widest text-white/40 font-bold">Subjek / Topik Project</label>
                <input
                  id="contact-subject-input"
                  type="text"
                  value={contactSubject}
                  onChange={(e) => setContactSubject(e.target.value)}
                  placeholder="Contoh: Penawaran Project Branding atau Kerjasama Seni"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs text-white placeholder-white/25 focus:border-purple-500 focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[9px] uppercase tracking-widest text-white/40 font-bold">Deskripsi Pesan</label>
                <textarea
                  id="contact-message-input"
                  required
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="Ceritakan dengan singkat rencana project, deadline, serta budget estimasi Anda..."
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs text-white placeholder-white/25 focus:border-purple-500 focus:outline-none transition-all resize-none"
                />
              </div>

              {submitError && (
                <div id="contact-form-error" className="text-xs text-red-400 border border-red-500/20 p-3 flex items-center gap-2 rounded-xl bg-red-500/5">
                  <ShieldAlert className="h-4 w-4" /> {submitError}
                </div>
              )}

              <button
                id="contact-submit-btn"
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] bg-white text-black hover:bg-white/95 transition-all cursor-pointer text-center duration-200"
                style={{ 
                  borderRadius: theme.borderStyle === 'sharp' ? '0' : '14px',
                }}
              >
                {isSubmitting ? 'Sedang Mengirim...' : 'Kirim Penawaran Kolaborasi'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer Area */}
      <footer className="flex flex-col md:flex-row justify-between items-center py-8 px-6 md:px-12 border-t border-white/10 text-[9px] uppercase tracking-widest text-white/30 bg-[#050505] gap-4">
        <div>
          &copy; {new Date().getFullYear()} {about.name.toUpperCase()} - ALL RIGHTS RESERVED
        </div>
        
        <div className="flex gap-8">
          {about.socials.instagram && <a href={about.socials.instagram} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Instagram</a>}
          {about.socials.behance && <a href={about.socials.behance} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Behance</a>}
          {about.socials.dribbble && <a href={about.socials.dribbble} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Dribbble</a>}
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span>System Connected: DB_V1_STABLE</span>
          </div>
          <span>&bull;</span>
          <button
            id="footer-admin-btn"
            onClick={onEnterAdmin}
            className="hover:text-white transition-colors cursor-pointer uppercase font-semibold"
          >
            Admin
          </button>
        </div>
      </footer>
    </div>
  );
}
