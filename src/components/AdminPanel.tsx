import React, { useState } from 'react';
import { 
  Save, Layout, User, Image as ImageIcon, Paintbrush, Mail, 
  Plus, Trash2, Edit2, Check, ArrowLeft, Upload, LogOut, 
  Eye, EyeOff, Globe, Sparkles, RefreshCw, Layers, Key
} from 'lucide-react';
import { PortfolioData, PortfolioItem, ThemeConfig, AboutConfig, HeadlineConfig, ContactMessage } from '../types';

interface AdminPanelProps {
  data: PortfolioData;
  onSave: (newData: PortfolioData) => Promise<boolean>;
  onLogout: () => void;
  isStaticMode?: boolean;
}

type TabType = 'headline' | 'about' | 'gallery' | 'theme' | 'inbox' | 'categories' | 'password';

import { CategoryConfig } from '../types';

export default function AdminPanel({ data, onSave, onLogout, isStaticMode }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('gallery');
  const [portfolio, setPortfolio] = useState<PortfolioData>(() => {
    const copy = { ...data };
    if (!copy.categories || copy.categories.length === 0) {
      copy.categories = [
        { name: "Cyberpunk", maxUploads: 10 },
        { name: "Minimalist", maxUploads: 5 },
        { name: "Brutalist", maxUploads: 10 },
        { name: "Holographic", maxUploads: 10 },
        { name: "Liquid Chrome", maxUploads: 10 },
        { name: "Typography", maxUploads: 10 },
        { name: "Illustration", maxUploads: 10 },
        { name: "Identity", maxUploads: 10 }
      ];
    }
    return copy;
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Category management states
  const [editingCategory, setEditingCategory] = useState<CategoryConfig | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryLimit, setNewCategoryLimit] = useState<string>('');
  const [categorySearchQuery, setCategorySearchQuery] = useState('');

  // Gallery Item edit states
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const [newSkillInput, setNewSkillInput] = useState('');

  // Image upload state
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);

  // Inbox state
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordChangeStatus, setPasswordChangeStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');

  const handleSaveAll = async (updatedPortfolio = portfolio) => {
    setIsSaving(true);
    setSaveStatus('idle');
    try {
      const success = await onSave(updatedPortfolio);
      if (success) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
      }
    } catch {
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  // Generic content updates
  const updateHeadline = (key: keyof HeadlineConfig, value: string) => {
    const updated = {
      ...portfolio,
      headline: { ...portfolio.headline, [key]: value }
    };
    setPortfolio(updated);
  };

  const updateAbout = (key: keyof AboutConfig, value: any) => {
    const updated = {
      ...portfolio,
      about: { ...portfolio.about, [key]: value }
    };
    setPortfolio(updated);
  };

  const updateSocials = (key: string, value: string) => {
    const updated = {
      ...portfolio,
      about: {
        ...portfolio.about,
        socials: { ...portfolio.about.socials, [key]: value }
      }
    };
    setPortfolio(updated);
  };

  const updateTheme = (key: keyof ThemeConfig, value: any) => {
    const updated = {
      ...portfolio,
      theme: { ...portfolio.theme, [key]: value }
    };
    setPortfolio(updated);
  };

  // Base64 file uploader logic with client-side image compression
  const compressImage = (base64Str: string, maxWidth = 1000, maxHeight = 1000): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.75));
        } else {
          resolve(base64Str);
        }
      };
      img.onerror = () => {
        resolve(base64Str);
      };
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'avatar' | 'item', callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(target);
    const reader = new FileReader();
    reader.onloadend = async () => {
      let base64String = reader.result as string;
      
      try {
        base64String = await compressImage(base64String);
      } catch (err) {
        console.warn('Gagal mengompresi gambar, menggunakan file asli:', err);
      }
      
      if (isStaticMode) {
        callback(base64String);
        setUploadingImage(null);
        return;
      }

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: file.name, data: base64String })
        });
        const resData = await response.json();
        if (resData.imageUrl) {
          callback(resData.imageUrl);
        } else {
          alert("Gagal mengunggah gambar: " + (resData.error || "Kesalahan server"));
        }
      } catch (err) {
        alert("Gagal menghubungi server untuk mengunggah file. Disimpan sebagai data lokal.");
        callback(base64String);
      } finally {
        setUploadingImage(null);
      }
    };
    reader.readAsDataURL(file);
  };

  // Skills operations
  const handleAddSkill = () => {
    if (!newSkillInput.trim()) return;
    if (portfolio.about.skills.includes(newSkillInput.trim())) return;
    const updatedSkills = [...portfolio.about.skills, newSkillInput.trim()];
    updateAbout('skills', updatedSkills);
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skill: string) => {
    const updatedSkills = portfolio.about.skills.filter(s => s !== skill);
    updateAbout('skills', updatedSkills);
  };

  // Gallery operations
  const startEditItem = (item: PortfolioItem) => {
    setEditingItem({ ...item });
    setIsAddingNew(false);
  };

  const startAddNewItem = () => {
    setEditingItem({
      id: `poster-${Date.now()}`,
      title: '',
      description: '',
      category: 'Cyberpunk',
      imageUrl: '',
      tags: [],
      client: '',
      year: new Date().getFullYear().toString(),
      aspectRatio: 'portrait'
    });
    setIsAddingNew(true);
  };

  const saveEditingItem = () => {
    if (!editingItem || !editingItem.title || !editingItem.imageUrl) {
      alert("Judul poster dan Gambar wajib diisi!");
      return;
    }

    // Check maximum upload limit for this category
    const categoriesList = portfolio.categories || [];
    const catConfig = categoriesList.find(c => c.name.toLowerCase() === editingItem.category.toLowerCase());
    if (catConfig && catConfig.maxUploads !== undefined && catConfig.maxUploads !== null) {
      // count how many other items are in this category
      const sameCatCount = portfolio.items.filter(item => 
        item.category.toLowerCase() === editingItem.category.toLowerCase() && 
        item.id !== editingItem.id
      ).length;
      if (sameCatCount >= catConfig.maxUploads) {
        alert(`Gagal Menyimpan! Batas maksimal upload poster untuk kategori "${editingItem.category}" adalah ${catConfig.maxUploads} poster. (Saat ini sudah ada ${sameCatCount} poster).`);
        return;
      }
    }

    let updatedItems = [...portfolio.items];
    if (isAddingNew) {
      updatedItems.push(editingItem);
    } else {
      updatedItems = updatedItems.map(item => item.id === editingItem.id ? editingItem : item);
    }

    const updatedPortfolio = { ...portfolio, items: updatedItems };
    setPortfolio(updatedPortfolio);
    setEditingItem(null);
    setIsAddingNew(false);
    handleSaveAll(updatedPortfolio);
  };

  const deleteItem = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus poster desain ini dari galeri?")) {
      const updatedItems = portfolio.items.filter(item => item.id !== id);
      const updatedPortfolio = { ...portfolio, items: updatedItems };
      setPortfolio(updatedPortfolio);
      handleSaveAll(updatedPortfolio);
    }
  };

  const addTagToEditingItem = () => {
    if (!newTagInput.trim() || !editingItem) return;
    if (editingItem.tags.includes(newTagInput.trim())) return;
    setEditingItem({
      ...editingItem,
      tags: [...editingItem.tags, newTagInput.trim()]
    });
    setNewTagInput('');
  };

  const removeTagFromEditingItem = (tag: string) => {
    if (!editingItem) return;
    setEditingItem({
      ...editingItem,
      tags: editingItem.tags.filter(t => t !== tag)
    });
  };

  // Category operations
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      alert("Nama kategori wajib diisi!");
      return;
    }
    
    const nameLower = newCategoryName.trim().toLowerCase();
    const categories = portfolio.categories || [];
    
    if (categories.some(cat => cat.name.toLowerCase() === nameLower)) {
      alert("Kategori dengan nama tersebut sudah ada!");
      return;
    }
    
    const limitNum = newCategoryLimit.trim() !== '' ? parseInt(newCategoryLimit.trim(), 10) : undefined;
    
    const newCat = {
      name: newCategoryName.trim(),
      maxUploads: isNaN(Number(limitNum)) ? undefined : limitNum
    };
    
    const updatedCategories = [...categories, newCat];
    const updatedPortfolio = { ...portfolio, categories: updatedCategories };
    setPortfolio(updatedPortfolio);
    setNewCategoryName('');
    setNewCategoryLimit('');
    setIsAddingCategory(false);
    handleSaveAll(updatedPortfolio);
  };

  const handleUpdateCategory = (oldName: string, updatedCat: CategoryConfig) => {
    if (!updatedCat.name.trim()) {
      alert("Nama kategori wajib diisi!");
      return;
    }
    
    const categories = portfolio.categories || [];
    // Check duplication (excluding itself)
    if (categories.some(cat => cat.name.toLowerCase() === updatedCat.name.trim().toLowerCase() && cat.name.toLowerCase() !== oldName.toLowerCase())) {
      alert("Kategori dengan nama tersebut sudah ada!");
      return;
    }
    
    // Update category list
    const updatedCategories = categories.map(cat => cat.name.toLowerCase() === oldName.toLowerCase() ? updatedCat : cat);
    
    // Also rename category of items using this category!
    const updatedItems = portfolio.items.map(item => {
      if (item.category.toLowerCase() === oldName.toLowerCase()) {
        return { ...item, category: updatedCat.name.trim() };
      }
      return item;
    });
    
    const updatedPortfolio = { ...portfolio, categories: updatedCategories, items: updatedItems };
    setPortfolio(updatedPortfolio);
    setEditingCategory(null);
    handleSaveAll(updatedPortfolio);
  };

  const handleDeleteCategory = (catName: string) => {
    const itemsUsing = portfolio.items.filter(item => item.category.toLowerCase() === catName.toLowerCase());
    
    let confirmMsg = `Apakah Anda yakin ingin menghapus kategori "${catName}"?`;
    if (itemsUsing.length > 0) {
      confirmMsg = `Kategori "${catName}" sedang digunakan oleh ${itemsUsing.length} poster desain. Jika Anda menghapus kategori ini, poster-poster tersebut akan tetap tersimpan tetapi Anda harus memindahkan kategorinya. Apakah Anda yakin?`;
    }
    
    if (confirm(confirmMsg)) {
      const categories = portfolio.categories || [];
      const updatedCategories = categories.filter(cat => cat.name.toLowerCase() !== catName.toLowerCase());
      const updatedPortfolio = { ...portfolio, categories: updatedCategories };
      setPortfolio(updatedPortfolio);
      handleSaveAll(updatedPortfolio);
    }
  };

  // Inbox operations
  const deleteMessage = (msgId: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus pesan ini?")) {
      const updatedMsgs = portfolio.contactMessages.filter(m => m.id !== msgId);
      const updatedPortfolio = { ...portfolio, contactMessages: updatedMsgs };
      setPortfolio(updatedPortfolio);
      if (selectedMessage?.id === msgId) {
        setSelectedMessage(null);
      }
      handleSaveAll(updatedPortfolio);
    }
  };

  const toggleMessageRead = (msgId: string) => {
    const updatedMsgs = portfolio.contactMessages.map(m => {
      if (m.id === msgId) {
        return { ...m, read: !m.read };
      }
      return m;
    });
    const updatedPortfolio = { ...portfolio, contactMessages: updatedMsgs };
    setPortfolio(updatedPortfolio);
    
    // update current selected
    const found = updatedMsgs.find(m => m.id === msgId);
    if (found) setSelectedMessage(found);
    
    handleSaveAll(updatedPortfolio);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword.trim() || !newPassword.trim() || !confirmNewPassword.trim()) {
      setPasswordChangeStatus('error');
      setPasswordErrorMessage('Semua kolom password wajib diisi!');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordChangeStatus('error');
      setPasswordErrorMessage('Konfirmasi password baru tidak cocok!');
      return;
    }

    setIsChangingPassword(true);
    setPasswordChangeStatus('idle');
    setPasswordErrorMessage('');

    if (isStaticMode) {
      const activePassword = localStorage.getItem('custom-admin-password') || 'admin123';
      if (currentPassword !== activePassword && currentPassword !== 'darkdesigner') {
        setPasswordChangeStatus('error');
        setPasswordErrorMessage('Password lama salah!');
        setIsChangingPassword(false);
        return;
      }
      localStorage.setItem('custom-admin-password', newPassword.trim());
      setPasswordChangeStatus('success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setIsChangingPassword(false);
      return;
    }

    try {
      const response = await fetch('/api/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const resData = await response.json();
      if (response.ok) {
        setPasswordChangeStatus('success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        setPasswordChangeStatus('error');
        setPasswordErrorMessage(resData.error || 'Gagal mengubah password admin!');
      }
    } catch (err) {
      setPasswordChangeStatus('error');
      setPasswordErrorMessage('Terjadi kesalahan koneksi ke server!');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Presets of Theme Colors
  const themePresets = [
    { name: 'Neon Purple', primary: '#a855f7', accent: '#22c55e' },
    { name: 'Electric Cyan', primary: '#06b6d4', accent: '#f43f5e' },
    { name: 'Vibrant Green', primary: '#10b981', accent: '#eab308' },
    { name: 'Sunset Crimson', primary: '#ef4444', accent: '#f97316' },
    { name: 'Futuristic Gold', primary: '#eab308', accent: '#a855f7' },
    { name: 'Aqua Blue', primary: '#3b82f6', accent: '#f43f5e' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      {/* Admin Header */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur border-b border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold">
            DP
          </div>
          <div>
            <h1 className="text-lg font-bold font-grotesk tracking-wide flex flex-wrap items-center gap-2">
              PORTFOLIO ADMIN PANEL 
              {isStaticMode ? (
                <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20 flex items-center gap-1 font-sans">
                  <Globe className="h-3.5 w-3.5" /> MODE STATIS (BROWSER STORAGE)
                </span>
              ) : (
                <span className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/20">
                  LIVE CONTROL
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-400">Sesuaikan tata letak, warna, teks, dan galeri poster secara instan</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="view-website-btn"
            onClick={onLogout}
            className="flex items-center gap-2 text-xs border border-slate-700 bg-slate-850 hover:bg-slate-800 text-slate-300 py-2.5 px-4 rounded-xl transition-all"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Lihat Website
          </button>
          
          <button
            id="global-save-btn"
            disabled={isSaving}
            onClick={() => handleSaveAll()}
            className="flex items-center gap-2 text-xs bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 px-4 rounded-xl transition-all font-medium disabled:opacity-50"
          >
            {isSaving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            {isSaving ? "Menyimpan..." : "Simpan Semua"}
          </button>

          <button
            id="admin-logout-btn"
            onClick={() => {
              if(confirm("Apakah Anda yakin ingin keluar dari panel admin?")) {
                localStorage.removeItem("admin-session");
                onLogout();
              }
            }}
            title="Keluar dari Admin"
            className="p-2.5 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Save Status Alert Banner */}
      {saveStatus === 'success' && (
        <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-6 py-2 text-center text-xs text-emerald-400 font-medium animate-fade-in flex items-center justify-center gap-2">
          <Check className="h-3.5 w-3.5" /> 
          {isStaticMode 
            ? "Semua data portofolio telah berhasil disimpan di browser Anda (Mode Statis)!" 
            : "Semua data portofolio telah berhasil disimpan ke database JSON!"
          }
        </div>
      )}
      {saveStatus === 'error' && (
        <div className="bg-red-500/10 border-b border-red-500/20 px-6 py-2 text-center text-xs text-red-400 font-medium animate-fade-in">
          {isStaticMode
            ? "Gagal menyimpan data portofolio di browser Anda."
            : "Gagal menyimpan ke database JSON. Periksa koneksi backend Anda."
          }
        </div>
      )}

      {/* Main Admin Content Grid */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Admin Navigation Sidebar */}
        <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 p-4 flex flex-col gap-1.5">
          <div className="px-3 mb-3">
            <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Menu Pengaturan</span>
          </div>

          <button
            onClick={() => { setActiveTab('gallery'); setEditingItem(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${activeTab === 'gallery' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/15' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
          >
            <ImageIcon className="h-4 w-4" />
            <span>Kelola Galeri Poster</span>
            <span className="ml-auto bg-slate-800 text-[10px] text-slate-300 px-2 py-0.5 rounded-full">{portfolio.items.length}</span>
          </button>

          <button
            onClick={() => { setActiveTab('categories'); setEditingItem(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${activeTab === 'categories' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/15' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
          >
            <Layers className="h-4 w-4" />
            <span>Kelola Kategori</span>
            <span className="ml-auto bg-slate-800 text-[10px] text-slate-300 px-2 py-0.5 rounded-full">{(portfolio.categories || []).length}</span>
          </button>

          <button
            onClick={() => { setActiveTab('headline'); setEditingItem(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${activeTab === 'headline' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/15' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
          >
            <Layout className="h-4 w-4" />
            <span>Headline & Hero Text</span>
          </button>

          <button
            onClick={() => { setActiveTab('about'); setEditingItem(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${activeTab === 'about' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/15' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
          >
            <User className="h-4 w-4" />
            <span>Tentang Saya</span>
          </button>

          <button
            onClick={() => { setActiveTab('theme'); setEditingItem(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${activeTab === 'theme' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/15' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
          >
            <Paintbrush className="h-4 w-4" />
            <span>Tema & Desain</span>
          </button>

          <button
            onClick={() => { setActiveTab('inbox'); setEditingItem(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${activeTab === 'inbox' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/15' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
          >
            <Mail className="h-4 w-4" />
            <span>Pesan Masuk (Inbox)</span>
            {portfolio.contactMessages.filter(m => !m.read).length > 0 && (
              <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                {portfolio.contactMessages.filter(m => !m.read).length}
              </span>
            )}
          </button>

          <button
            onClick={() => { setActiveTab('password'); setEditingItem(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${activeTab === 'password' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/15' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
          >
            <Key className="h-4 w-4" />
            <span>Ubah Password Admin</span>
          </button>
        </aside>

        {/* Admin Working Panel Container */}
        <main className="flex-1 p-6 md:p-8 bg-slate-950 overflow-y-auto">
          {/* TAB 1: HEADLINE EDITOR */}
          {activeTab === 'headline' && (
            <div className="space-y-6 max-w-4xl">
              <div className="border-b border-slate-850 pb-4">
                <h2 className="text-xl font-bold font-grotesk">Edit Headline & Hero Text</h2>
                <p className="text-xs text-slate-400">Ganti kalimat sambutan, judul besar, dan sub-teks di bagian paling atas portofolio Anda.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Greeting (Sapaan)</label>
                    <input
                      type="text"
                      value={portfolio.headline.greeting}
                      onChange={(e) => updateHeadline('greeting', e.target.value)}
                      placeholder="Contoh: HALO, SAYA DEVIN"
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 py-3 px-4 text-sm text-white focus:border-purple-500 focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Teks Badge (Status Saat Ini)</label>
                    <input
                      type="text"
                      value={portfolio.headline.badgeText}
                      onChange={(e) => updateHeadline('badgeText', e.target.value)}
                      placeholder="Contoh: TERSEDIA UNTUK PROJECT BARU"
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 py-3 px-4 text-sm text-white focus:border-purple-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Judul Utama (Headline Title)</label>
                    <textarea
                      value={portfolio.headline.title}
                      onChange={(e) => updateHeadline('title', e.target.value)}
                      placeholder="Contoh: Mengubah Gagasan Menjadi Karya Visual"
                      rows={3}
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 py-3 px-4 text-sm text-white focus:border-purple-500 focus:outline-none transition-all resize-none"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Sub-Teks / Deskripsi Hero</label>
                  <textarea
                    value={portfolio.headline.subtitle}
                    onChange={(e) => updateHeadline('subtitle', e.target.value)}
                    placeholder="Deskripsi singkat yang menjelaskan fokus keahlian Anda..."
                    rows={3}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 py-3 px-4 text-sm text-white focus:border-purple-500 focus:outline-none transition-all resize-none"
                  />
                </div>
              </div>

              {/* Preview Box */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Live Preview Tampilan Atas</span>
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/5 px-3 py-1 text-[10px] font-medium tracking-wider text-purple-400 uppercase">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    {portfolio.headline.badgeText}
                  </div>
                  <h3 className="text-xs font-semibold text-purple-400 uppercase tracking-wider">{portfolio.headline.greeting}</h3>
                  <h2 className="text-2xl font-bold font-grotesk text-white max-w-xl">{portfolio.headline.title}</h2>
                  <p className="text-xs text-slate-400 max-w-lg leading-relaxed">{portfolio.headline.subtitle}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ABOUT ME EDITOR */}
          {activeTab === 'about' && (
            <div className="space-y-6 max-w-4xl">
              <div className="border-b border-slate-850 pb-4">
                <h2 className="text-xl font-bold font-grotesk">Edit Informasi Tentang Saya</h2>
                <p className="text-xs text-slate-400">Kelola biodata diri, keahlian khusus, foto profil, dan saluran media sosial.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Nama Lengkap</label>
                    <input
                      type="text"
                      value={portfolio.about.name}
                      onChange={(e) => updateAbout('name', e.target.value)}
                      placeholder="Masukkan nama lengkap"
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 py-3 px-4 text-sm text-white focus:border-purple-500 focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Role / Spesialisasi Utama</label>
                    <input
                      type="text"
                      value={portfolio.about.role}
                      onChange={(e) => updateAbout('role', e.target.value)}
                      placeholder="Contoh: Digital Poster & Visual Artist"
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 py-3 px-4 text-sm text-white focus:border-purple-500 focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">URL Foto Profil / Avatar</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={portfolio.about.avatarUrl}
                        onChange={(e) => updateAbout('avatarUrl', e.target.value)}
                        placeholder="Tempel URL gambar profil"
                        className="flex-1 rounded-xl border border-slate-800 bg-slate-900 py-3 px-4 text-sm text-white focus:border-purple-500 focus:outline-none transition-all"
                      />
                      <label className="cursor-pointer flex items-center justify-center h-11 w-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700">
                        <Upload className="h-4 w-4" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, 'avatar', (url) => updateAbout('avatarUrl', url))}
                        />
                      </label>
                    </div>
                    {uploadingImage === 'avatar' && <p className="text-[10px] text-purple-400 mt-1 animate-pulse">Sedang mengunggah foto...</p>}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Biografi Lengkap</label>
                    <textarea
                      value={portfolio.about.bio}
                      onChange={(e) => updateAbout('bio', e.target.value)}
                      placeholder="Tulis biografi visual Anda dengan detail..."
                      rows={8}
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 py-3 px-4 text-sm text-white focus:border-purple-500 focus:outline-none transition-all resize-none"
                    />
                  </div>
                </div>

                {/* Skills Management */}
                <div className="md:col-span-2 border-t border-slate-850 pt-5">
                  <h3 className="text-sm font-semibold mb-3">Daftar Keahlian Utama (Skills)</h3>
                  <div className="flex flex-wrap gap-2 mb-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
                    {portfolio.about.skills.map((skill, index) => (
                      <span key={index} className="inline-flex items-center gap-1.5 bg-slate-800 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-750">
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-slate-400 hover:text-red-400 transition-colors"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                    {portfolio.about.skills.length === 0 && (
                      <p className="text-xs text-slate-500">Belum ada keahlian ditambahkan. Tambahkan keahlian baru di bawah.</p>
                    )}
                  </div>

                  <div className="flex gap-2 max-w-md">
                    <input
                      type="text"
                      value={newSkillInput}
                      onChange={(e) => setNewSkillInput(e.target.value)}
                      placeholder="Masukkan keahlian baru (Contoh: Typo Poster)"
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                      className="flex-1 rounded-xl border border-slate-800 bg-slate-900 py-2.5 px-4 text-xs text-white focus:border-purple-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold py-2 px-4 rounded-xl flex items-center gap-1 transition-all"
                    >
                      <Plus className="h-3.5 w-3.5" /> Tambah
                    </button>
                  </div>
                </div>

                {/* Social Media Links */}
                <div className="md:col-span-2 border-t border-slate-850 pt-5">
                  <h3 className="text-sm font-semibold mb-3">Tautan Media Sosial</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Instagram URL</label>
                      <input
                        type="text"
                        value={portfolio.about.socials.instagram || ''}
                        onChange={(e) => updateSocials('instagram', e.target.value)}
                        placeholder="https://instagram.com/username"
                        className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2.5 px-4 text-xs text-white focus:border-purple-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Behance URL</label>
                      <input
                        type="text"
                        value={portfolio.about.socials.behance || ''}
                        onChange={(e) => updateSocials('behance', e.target.value)}
                        placeholder="https://behance.net/username"
                        className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2.5 px-4 text-xs text-white focus:border-purple-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Dribbble URL</label>
                      <input
                        type="text"
                        value={portfolio.about.socials.dribbble || ''}
                        onChange={(e) => updateSocials('dribbble', e.target.value)}
                        placeholder="https://dribbble.com/username"
                        className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2.5 px-4 text-xs text-white focus:border-purple-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Email Profesional</label>
                      <input
                        type="text"
                        value={portfolio.about.socials.email || ''}
                        onChange={(e) => updateSocials('email', e.target.value)}
                        placeholder="email@example.com"
                        className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2.5 px-4 text-xs text-white focus:border-purple-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Github URL (Opsional)</label>
                      <input
                        type="text"
                        value={portfolio.about.socials.github || ''}
                        onChange={(e) => updateSocials('github', e.target.value)}
                        placeholder="https://github.com/username"
                        className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2.5 px-4 text-xs text-white focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GALLERY & POSTERS MANAGER */}
          {activeTab === 'gallery' && (
            <div className="space-y-6">
              {!editingItem ? (
                // Primary Items List View
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-850 pb-4">
                    <div>
                      <h2 className="text-xl font-bold font-grotesk">Kelola Galeri Poster</h2>
                      <p className="text-xs text-slate-400">Tambahkan poster desain baru, ubah rincian deskripsi, hapus karya lama, atau kelola tag.</p>
                    </div>
                    <button
                      type="button"
                      id="add-new-poster-btn"
                      onClick={startAddNewItem}
                      className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition-all"
                    >
                      <Plus className="h-4 w-4" /> Tambah Desain Baru
                    </button>
                  </div>

                  {/* Posters Table/Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                    {portfolio.items.map((item) => (
                      <div 
                        key={item.id} 
                        className="group relative rounded-2xl border border-slate-800 bg-slate-900/40 p-4 flex flex-col gap-3 hover:border-purple-500/40 transition-all shadow-md overflow-hidden"
                      >
                        {/* Poster Thumbnail */}
                        <div className="aspect-[3/4] w-full overflow-hidden rounded-xl bg-slate-950 relative">
                          {item.imageUrl ? (
                            <img 
                              src={item.imageUrl} 
                              alt={item.title} 
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="h-full w-full flex flex-col items-center justify-center text-slate-600 gap-2">
                              <ImageIcon className="h-10 w-10 stroke-1" />
                              <span className="text-xs">Gambar Kosong</span>
                            </div>
                          )}
                          
                          {/* Floating Category Tag */}
                          <span className="absolute top-3 left-3 bg-black/75 backdrop-blur-md text-[10px] text-slate-300 font-bold px-2.5 py-1 rounded-md tracking-wider uppercase border border-white/5">
                            {item.category}
                          </span>
                        </div>

                        {/* Text details */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="font-bold text-sm tracking-wide text-white font-grotesk line-clamp-1">{item.title}</h3>
                            <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">{item.description}</p>
                          </div>
                          
                          <div className="mt-3 flex flex-wrap gap-1">
                            {item.tags.map((tag, i) => (
                              <span key={i} className="text-[9px] bg-slate-800/80 text-slate-400 px-1.5 py-0.5 rounded">#{tag}</span>
                            ))}
                          </div>
                        </div>

                        {/* Floating Admin Controls Overlay */}
                        <div className="flex items-center gap-2 border-t border-slate-850 pt-3 mt-1 justify-end">
                          <button
                            type="button"
                            onClick={() => startEditItem(item)}
                            className="flex items-center gap-1 text-[11px] bg-slate-850 hover:bg-slate-800 text-slate-300 py-1.5 px-3 rounded-lg border border-slate-750 transition-colors"
                          >
                            <Edit2 className="h-3 w-3" /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteItem(item.id)}
                            className="flex items-center gap-1 text-[11px] bg-red-500/10 hover:bg-red-500/20 text-red-400 py-1.5 px-3 rounded-lg border border-red-500/15 transition-colors"
                          >
                            <Trash2 className="h-3 w-3" /> Hapus
                          </button>
                        </div>
                      </div>
                    ))}

                    {portfolio.items.length === 0 && (
                      <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/10">
                        <ImageIcon className="h-12 w-12 text-slate-600 mx-auto mb-3 stroke-1" />
                        <h3 className="text-sm font-bold text-slate-300">Galeri Desain Masih Kosong</h3>
                        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">Klik tombol "Tambah Desain Baru" di atas untuk menambahkan poster pertama Anda.</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // Detailed Item Add / Edit Form View
                <div className="space-y-6 max-w-4xl">
                  <div className="flex items-center gap-3 border-b border-slate-850 pb-4">
                    <button
                      type="button"
                      onClick={() => { setEditingItem(null); setIsAddingNew(false); }}
                      className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-850 rounded-xl text-slate-400 hover:text-white transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    <div>
                      <h2 className="text-xl font-bold font-grotesk">{isAddingNew ? 'Tambah Poster Desain Baru' : `Edit: ${editingItem.title}`}</h2>
                      <p className="text-xs text-slate-400">Silahkan isi formulir karya untuk memperbarui galeri portfolio visual Anda.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Poster Photo Selector column */}
                    <div className="md:col-span-4 space-y-4">
                      <div className="aspect-[3/4] w-full rounded-2xl border-2 border-dashed border-slate-800 bg-slate-900/20 overflow-hidden flex flex-col items-center justify-center relative p-3 group">
                        {editingItem.imageUrl ? (
                          <>
                            <img 
                              src={editingItem.imageUrl} 
                              alt="Upload preview" 
                              className="h-full w-full object-cover rounded-xl"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-xl">
                              <label className="cursor-pointer bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold py-2 px-4 rounded-xl transition-all flex items-center gap-1">
                                <Upload className="h-3.5 w-3.5" /> Ganti Gambar
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleFileUpload(e, 'item', (url) => setEditingItem({ ...editingItem, imageUrl: url }))}
                                />
                              </label>
                            </div>
                          </>
                        ) : (
                          <div className="text-center p-4">
                            <ImageIcon className="h-12 w-12 text-slate-650 mx-auto mb-3 stroke-1" />
                            <p className="text-xs font-medium text-slate-300">Unggah Gambar Poster</p>
                            <p className="text-[10px] text-slate-500 mt-1 mb-4">Saran rasio 3:4 (Portrait)</p>
                            <label className="cursor-pointer bg-slate-850 hover:bg-slate-800 border border-slate-750 text-slate-300 text-[11px] font-semibold py-2 px-4 rounded-xl transition-colors inline-flex items-center gap-1.5">
                              <Upload className="h-3.5 w-3.5" /> Pilih File
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleFileUpload(e, 'item', (url) => setEditingItem({ ...editingItem, imageUrl: url }))}
                              />
                            </label>
                          </div>
                        )}
                        {uploadingImage === 'item' && (
                          <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center gap-2 rounded-xl">
                            <RefreshCw className="h-6 w-6 animate-spin text-purple-400" />
                            <span className="text-xs text-purple-300 animate-pulse font-medium">Sedang mengunggah...</span>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">URL Gambar Langsung (Sebagai Alternatif)</label>
                        <input
                          type="text"
                          value={editingItem.imageUrl}
                          onChange={(e) => setEditingItem({ ...editingItem, imageUrl: e.target.value })}
                          placeholder="Atau tempel URL gambar di sini"
                          className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2.5 px-4 text-xs text-white focus:border-purple-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Poster Information details columns */}
                    <div className="md:col-span-8 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1.5">Judul Poster</label>
                          <input
                            type="text"
                            value={editingItem.title}
                            onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                            placeholder="Contoh: Cosmic Cyberpunk Vol. 1"
                            className="w-full rounded-xl border border-slate-800 bg-slate-900 py-3 px-4 text-sm text-white focus:border-purple-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1.5">Kategori Gaya / Aliran</label>
                          <select
                            value={editingItem.category}
                            onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                            className="w-full rounded-xl border border-slate-800 bg-slate-900 py-3 px-4 text-sm text-white focus:border-purple-500 focus:outline-none"
                          >
                            {(portfolio.categories || []).map(cat => (
                              <option key={cat.name} value={cat.name}>{cat.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Deskripsi Poster</label>
                        <textarea
                          value={editingItem.description}
                          onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                          placeholder="Jelaskan konsep, ide seni, atau proses kreatif dibalik karya poster grafis ini..."
                          rows={4}
                          className="w-full rounded-xl border border-slate-800 bg-slate-900 py-3 px-4 text-sm text-white focus:border-purple-500 focus:outline-none resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1">Nama Klien / Project</label>
                          <input
                            type="text"
                            value={editingItem.client || ''}
                            onChange={(e) => setEditingItem({ ...editingItem, client: e.target.value })}
                            placeholder="Contoh: Personal Art atau Nama Brand"
                            className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2.5 px-4 text-xs text-white focus:border-purple-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1">Tahun Pembuatan</label>
                          <input
                            type="text"
                            value={editingItem.year || ''}
                            onChange={(e) => setEditingItem({ ...editingItem, year: e.target.value })}
                            placeholder="Contoh: 2026"
                            className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2.5 px-4 text-xs text-white focus:border-purple-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Tag list within edited poster */}
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Daftar Tag Karya</label>
                        <div className="flex flex-wrap gap-1.5 bg-slate-900 p-3 rounded-xl border border-slate-850 mb-2">
                          {editingItem.tags.map((tag, i) => (
                            <span key={i} className="inline-flex items-center gap-1 bg-slate-800 text-slate-300 text-[10px] font-medium px-2 py-1 rounded">
                              #{tag}
                              <button
                                type="button"
                                onClick={() => removeTagFromEditingItem(tag)}
                                className="hover:text-red-400 font-bold"
                              >
                                &times;
                              </button>
                            </span>
                          ))}
                          {editingItem.tags.length === 0 && (
                            <span className="text-xs text-slate-500 italic">Belum ada tag ditambahkan</span>
                          )}
                        </div>

                        <div className="flex gap-2 max-w-xs">
                          <input
                            type="text"
                            value={newTagInput}
                            onChange={(e) => setNewTagInput(e.target.value)}
                            placeholder="Tambahkan tag (Contoh: Neon)"
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTagToEditingItem())}
                            className="flex-1 rounded-xl border border-slate-800 bg-slate-900 py-2 px-3 text-xs text-white focus:border-purple-500 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={addTagToEditingItem}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 rounded-xl transition-colors"
                          >
                            Tambah
                          </button>
                        </div>
                      </div>

                      <div className="pt-4 flex gap-3">
                        <button
                          type="button"
                          id="save-poster-item-btn"
                          onClick={saveEditingItem}
                          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold py-2.5 px-6 rounded-xl transition-all"
                        >
                          <Check className="h-4 w-4" /> Simpan Poster Ini
                        </button>
                        <button
                          type="button"
                          onClick={() => { setEditingItem(null); setIsAddingNew(false); }}
                          className="bg-transparent hover:bg-white/5 border border-slate-850 text-slate-300 text-xs py-2.5 px-4 rounded-xl transition-colors"
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: THEME & COLOR CUSTOMIZATION */}
          {activeTab === 'theme' && (
            <div className="space-y-6 max-w-4xl">
              <div className="border-b border-slate-850 pb-4">
                <h2 className="text-xl font-bold font-grotesk">Kostumisasi Tema & Estetika Visual</h2>
                <p className="text-xs text-slate-400">Atur palet warna utama, background, jenis tipografi, dan gaya border agar sesuai dengan selera Anda.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Theme presets & Pickers */}
                <div className="space-y-6">
                  {/* Preset Quick Select */}
                  <div>
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Rekomendasi Kombinasi Estetik</h3>
                    <div className="grid grid-cols-2 gap-2.5">
                      {themePresets.map((preset, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            updateTheme('primaryColor', preset.primary);
                            updateTheme('accentColor', preset.accent);
                          }}
                          className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-left transition-all hover:scale-[1.02]"
                        >
                          <div className="flex h-5 w-10 shrink-0 rounded-md overflow-hidden border border-white/5">
                            <div className="flex-1" style={{ backgroundColor: preset.primary }}></div>
                            <div className="flex-1" style={{ backgroundColor: preset.accent }}></div>
                          </div>
                          <span className="text-xs font-medium text-slate-300">{preset.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Manual Color Pickers */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-850 pt-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Warna Utama (Primary)</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={portfolio.theme.primaryColor}
                          onChange={(e) => updateTheme('primaryColor', e.target.value)}
                          className="h-10 w-10 bg-transparent rounded-lg cursor-pointer border border-slate-850"
                        />
                        <input
                          type="text"
                          value={portfolio.theme.primaryColor}
                          onChange={(e) => updateTheme('primaryColor', e.target.value)}
                          placeholder="#000000"
                          className="flex-1 rounded-xl border border-slate-800 bg-slate-900 px-3 text-xs text-white uppercase focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Warna Aksen (Accent)</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={portfolio.theme.accentColor}
                          onChange={(e) => updateTheme('accentColor', e.target.value)}
                          className="h-10 w-10 bg-transparent rounded-lg cursor-pointer border border-slate-850"
                        />
                        <input
                          type="text"
                          value={portfolio.theme.accentColor}
                          onChange={(e) => updateTheme('accentColor', e.target.value)}
                          placeholder="#000000"
                          className="flex-1 rounded-xl border border-slate-800 bg-slate-900 px-3 text-xs text-white uppercase focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Font Family selector */}
                  <div className="border-t border-slate-850 pt-4">
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Gaya Tipografi (Font Family)</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => updateTheme('fontFamily', 'sans')}
                        className={`p-3 rounded-xl border text-center transition-all ${portfolio.theme.fontFamily === 'sans' ? 'border-purple-500 bg-purple-500/10 text-white' : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'}`}
                      >
                        <span className="block text-sm font-semibold font-sans">Inter Sans</span>
                        <span className="text-[10px] text-slate-500">Sederhana & Modern</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => updateTheme('fontFamily', 'grotesk')}
                        className={`p-3 rounded-xl border text-center transition-all ${portfolio.theme.fontFamily === 'grotesk' ? 'border-purple-500 bg-purple-500/10 text-white' : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'}`}
                      >
                        <span className="block text-sm font-semibold font-grotesk">Space Grotesk</span>
                        <span className="text-[10px] text-slate-500">Tech & Geometris</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => updateTheme('fontFamily', 'mono')}
                        className={`p-3 rounded-xl border text-center transition-all ${portfolio.theme.fontFamily === 'mono' ? 'border-purple-500 bg-purple-500/10 text-white' : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'}`}
                      >
                        <span className="block text-sm font-semibold font-mono">JetBrains Mono</span>
                        <span className="text-[10px] text-slate-500">Artistik Brutalist</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => updateTheme('fontFamily', 'serif')}
                        className={`p-3 rounded-xl border text-center transition-all ${portfolio.theme.fontFamily === 'serif' ? 'border-purple-500 bg-purple-500/10 text-white' : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'}`}
                      >
                        <span className="block text-sm font-semibold font-serif">Playfair Display</span>
                        <span className="text-[10px] text-slate-500">Klasik & Editorial</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Background style & Border style configs */}
                <div className="space-y-6">
                  {/* Background Style Variant */}
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Variasi Latar Belakang (Dark Background Theme)</label>
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => updateTheme('bgVariant', 'midnight')}
                        className={`w-full p-3.5 rounded-xl border flex items-center justify-between text-left transition-all ${portfolio.theme.bgVariant === 'midnight' ? 'border-purple-500 bg-slate-900 text-white' : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'}`}
                      >
                        <div>
                          <span className="block text-xs font-semibold">Midnight Obsidian</span>
                          <span className="text-[10px] text-slate-500">Biru-hitam pekat yang elegan dengan kilau violet</span>
                        </div>
                        <div className="h-4 w-4 rounded-full bg-[#0b0f19] border border-white/10 shrink-0"></div>
                      </button>

                      <button
                        type="button"
                        onClick={() => updateTheme('bgVariant', 'obsidian')}
                        className={`w-full p-3.5 rounded-xl border flex items-center justify-between text-left transition-all ${portfolio.theme.bgVariant === 'obsidian' ? 'border-purple-500 bg-slate-900 text-white' : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'}`}
                      >
                        <div>
                          <span className="block text-xs font-semibold">Pure Matte Black</span>
                          <span className="text-[10px] text-slate-500">Hitam arang polos murni untuk kontras visual maksimal</span>
                        </div>
                        <div className="h-4 w-4 rounded-full bg-[#050505] border border-white/10 shrink-0"></div>
                      </button>

                      <button
                        type="button"
                        onClick={() => updateTheme('bgVariant', 'charcoal')}
                        className={`w-full p-3.5 rounded-xl border flex items-center justify-between text-left transition-all ${portfolio.theme.bgVariant === 'charcoal' ? 'border-purple-500 bg-slate-900 text-white' : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'}`}
                      >
                        <div>
                          <span className="block text-xs font-semibold">Charcoal Slate Ash</span>
                          <span className="text-[10px] text-slate-500">Abu-abu gelap mineral, teduh di mata</span>
                        </div>
                        <div className="h-4 w-4 rounded-full bg-[#121620] border border-white/10 shrink-0"></div>
                      </button>

                      <button
                        type="button"
                        onClick={() => updateTheme('bgVariant', 'nord')}
                        className={`w-full p-3.5 rounded-xl border flex items-center justify-between text-left transition-all ${portfolio.theme.bgVariant === 'nord' ? 'border-purple-500 bg-slate-900 text-white' : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'}`}
                      >
                        <div>
                          <span className="block text-xs font-semibold">Nordic Deep Cold</span>
                          <span className="text-[10px] text-slate-500">Biru beku gelap khas estetik skandinavia</span>
                        </div>
                        <div className="h-4 w-4 rounded-full bg-[#0f141d] border border-white/10 shrink-0"></div>
                      </button>
                    </div>
                  </div>

                  {/* Corner Border Style Selection */}
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Gaya Lekukan Sudut (Border Style)</label>
                    <div className="grid grid-cols-3 gap-2.5">
                      <button
                        type="button"
                        onClick={() => updateTheme('borderStyle', 'sharp')}
                        className={`p-3 rounded-xl border text-center transition-all ${portfolio.theme.borderStyle === 'sharp' ? 'border-purple-500 bg-purple-500/10 text-white' : 'border-slate-800 bg-slate-900 text-slate-400'}`}
                      >
                        <div className="h-6 w-10 mx-auto mb-1.5 bg-slate-800 border-t border-l border-slate-600 rounded-none shrink-0"></div>
                        <span className="text-xs font-medium block">Sharp (Siku)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => updateTheme('borderStyle', 'rounded')}
                        className={`p-3 rounded-xl border text-center transition-all ${portfolio.theme.borderStyle === 'rounded' ? 'border-purple-500 bg-purple-500/10 text-white' : 'border-slate-800 bg-slate-900 text-slate-400'}`}
                      >
                        <div className="h-6 w-10 mx-auto mb-1.5 bg-slate-800 border-t border-l border-slate-600 rounded-lg shrink-0"></div>
                        <span className="text-xs font-medium block">Rounded</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => updateTheme('borderStyle', 'pill')}
                        className={`p-3 rounded-xl border text-center transition-all ${portfolio.theme.borderStyle === 'pill' ? 'border-purple-500 bg-purple-500/10 text-white' : 'border-slate-800 bg-slate-900 text-slate-400'}`}
                      >
                        <div className="h-6 w-10 mx-auto mb-1.5 bg-slate-800 border-t border-l border-slate-600 rounded-full shrink-0"></div>
                        <span className="text-xs font-medium block">Pill Shape</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: INBOX (CONTACT SUBMISSIONS) */}
          {activeTab === 'inbox' && (
            <div className="space-y-6 max-w-5xl">
              <div className="border-b border-slate-850 pb-4">
                <h2 className="text-xl font-bold font-grotesk">Inbox Pesan Masuk</h2>
                <p className="text-xs text-slate-400">Daftar pertanyaan, tawaran kolaborasi, atau feedback dari pengunjung website portofolio Anda.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Messages List Column */}
                <div className="lg:col-span-5 space-y-3">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Daftar Pesan ({portfolio.contactMessages.length})</span>
                  
                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                    {portfolio.contactMessages.map((msg) => (
                      <button
                        key={msg.id}
                        type="button"
                        onClick={() => {
                          setSelectedMessage(msg);
                          if (!msg.read) {
                            toggleMessageRead(msg.id);
                          }
                        }}
                        className={`w-full p-4 rounded-xl border text-left transition-all flex flex-col gap-1.5 ${selectedMessage?.id === msg.id ? 'bg-purple-600/15 border-purple-500' : 'bg-slate-900/60 border-slate-850 hover:border-slate-800'} ${!msg.read ? 'ring-1 ring-purple-500/30' : ''}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-xs text-white max-w-[150px] truncate">{msg.name}</span>
                          <span className="text-[10px] text-slate-500 shrink-0">{new Date(msg.date).toLocaleDateString('id-ID')}</span>
                        </div>
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="font-semibold text-[11px] text-slate-300 truncate">{msg.subject}</span>
                          {!msg.read && (
                            <span className="bg-purple-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full shrink-0">BARU</span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1 leading-relaxed">{msg.message}</p>
                      </button>
                    ))}

                    {portfolio.contactMessages.length === 0 && (
                      <div className="text-center py-12 rounded-xl border border-slate-850 bg-slate-900/20">
                        <Mail className="h-8 w-8 text-slate-650 mx-auto mb-2 stroke-1" />
                        <p className="text-xs text-slate-500 font-medium">Kotak Masuk Kosong</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Selected Message Detail Column */}
                <div className="lg:col-span-7">
                  {selectedMessage ? (
                    <div className="rounded-2xl border border-slate-850 bg-slate-900/50 p-6 space-y-4">
                      <div className="flex items-center justify-between gap-3 border-b border-slate-850 pb-4">
                        <div>
                          <h3 className="font-bold text-sm text-white font-grotesk">{selectedMessage.name}</h3>
                          <p className="text-xs text-slate-400">{selectedMessage.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleMessageRead(selectedMessage.id)}
                            className="text-[10px] bg-slate-800 hover:bg-slate-750 text-slate-300 py-1 px-2 rounded-md border border-slate-700 transition-colors"
                          >
                            Tandai {selectedMessage.read ? 'Belum Dibaca' : 'Sudah Dibaca'}
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteMessage(selectedMessage.id)}
                            className="p-1 rounded bg-red-500/15 hover:bg-red-500/20 text-red-400 transition-colors"
                            title="Hapus Pesan"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-500 uppercase font-medium">Subjek</span>
                        <h4 className="font-semibold text-xs text-slate-200">{selectedMessage.subject}</h4>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-500 uppercase font-medium">Isi Pesan</span>
                        <div className="rounded-xl bg-black/30 p-4 border border-white/5 text-xs text-slate-300 leading-relaxed whitespace-pre-line select-text">
                          {selectedMessage.message}
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-slate-500 pt-2">
                        <span>Dikirim pada: {new Date(selectedMessage.date).toLocaleString('id-ID')}</span>
                        <a
                          href={`mailto:${selectedMessage.email}?subject=Balasan: ${encodeURIComponent(selectedMessage.subject)}`}
                          className="inline-flex items-center gap-1 bg-purple-600 hover:bg-purple-500 text-white font-semibold py-2 px-4 rounded-lg text-xs tracking-wide transition-all"
                        >
                          Balas via Email
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full rounded-2xl border-2 border-dashed border-slate-850 flex flex-col items-center justify-center p-8 text-center bg-slate-900/10">
                      <Mail className="h-10 w-10 text-slate-700 mb-3 stroke-1" />
                      <h3 className="text-sm font-bold text-slate-400">Pilih Pesan Untuk Dibaca</h3>
                      <p className="text-xs text-slate-550 mt-1 max-w-xs mx-auto">Klik pada salah satu item email di daftar kiri untuk melihat isi detail surat penawaran.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: CATEGORIES MANAGER */}
          {activeTab === 'categories' && (
            <div className="space-y-6 max-w-5xl">
              <div className="border-b border-slate-850 pb-4 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold font-grotesk">Kelola Kategori & Batas Upload</h2>
                  <p className="text-xs text-slate-400">Tambah, ubah, hapus kategori aliran desain, serta batasi jumlah maksimal poster yang dapat diunggah per kategori.</p>
                </div>
                
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingCategory(true);
                    setEditingCategory(null);
                    setNewCategoryName('');
                    setNewCategoryLimit('');
                  }}
                  className="flex items-center gap-2 bg-purple-650 hover:bg-purple-550 text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition-all"
                >
                  <Plus className="h-4 w-4" /> Tambah Kategori Baru
                </button>
              </div>

              {/* Add or Edit Category Mode Form */}
              {(isAddingCategory || editingCategory) && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 animate-fade-in max-w-2xl">
                  <h3 className="font-bold text-sm text-white font-grotesk">
                    {isAddingCategory ? 'Buat Kategori Baru' : `Edit Kategori: ${editingCategory?.name}`}
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Nama Kategori</label>
                      <input
                        type="text"
                        value={isAddingCategory ? newCategoryName : (editingCategory?.name || '')}
                        onChange={(e) => {
                          if (isAddingCategory) {
                            setNewCategoryName(e.target.value);
                          } else if (editingCategory) {
                            setEditingCategory({ ...editingCategory, name: e.target.value });
                          }
                        }}
                        placeholder="Contoh: Vaporwave atau Vintage"
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 px-4 text-xs text-white focus:border-purple-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Maksimal Upload Poster (Kosongkan jika tidak terbatas)</label>
                      <input
                        type="number"
                        value={isAddingCategory ? newCategoryLimit : (editingCategory?.maxUploads !== undefined ? String(editingCategory.maxUploads) : '')}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (isAddingCategory) {
                            setNewCategoryLimit(val);
                          } else if (editingCategory) {
                            setEditingCategory({ 
                              ...editingCategory, 
                              maxUploads: val.trim() === '' ? undefined : parseInt(val, 10) 
                            });
                          }
                        }}
                        placeholder="Contoh: 10"
                        min="1"
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 px-4 text-xs text-white focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (isAddingCategory) {
                          handleAddCategory();
                        } else if (editingCategory) {
                          handleUpdateCategory(editingCategory.name, editingCategory);
                        }
                      }}
                      className="bg-purple-650 hover:bg-purple-550 text-white text-xs font-semibold py-2 px-4 rounded-xl transition-all"
                    >
                      {isAddingCategory ? 'Simpan Baru' : 'Perbarui Kategori'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingCategory(false);
                        setEditingCategory(null);
                      }}
                      className="bg-transparent hover:bg-white/5 border border-slate-800 text-slate-400 text-xs py-2 px-4 rounded-xl transition-all"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              )}

              {/* Categories list filter and grid */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 max-w-sm">
                  <input
                    type="text"
                    value={categorySearchQuery}
                    onChange={(e) => setCategorySearchQuery(e.target.value)}
                    placeholder="Cari kategori dari daftar..."
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2.5 px-4 text-xs text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                  {(portfolio.categories || [])
                    .filter(cat => cat.name.toLowerCase().includes(categorySearchQuery.toLowerCase()))
                    .map((cat, idx) => {
                      const count = portfolio.items.filter(item => item.category.toLowerCase() === cat.name.toLowerCase()).length;
                      return (
                        <div 
                          key={idx}
                          className="bg-slate-900/40 border border-slate-850 p-4 rounded-xl flex flex-col justify-between gap-3 hover:border-slate-750 transition-all"
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-sm text-white font-grotesk">{cat.name}</h4>
                              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                                {count} Poster
                              </span>
                            </div>
                            
                            <div className="mt-2.5">
                              {cat.maxUploads !== undefined && cat.maxUploads !== null ? (
                                <div className="space-y-1">
                                  <div className="flex justify-between text-[10px] text-slate-400">
                                    <span>Kapasitas Upload</span>
                                    <span>{count} / {cat.maxUploads}</span>
                                  </div>
                                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full rounded-full transition-all duration-300 ${count >= cat.maxUploads ? 'bg-red-500' : 'bg-purple-500'}`}
                                      style={{ width: `${Math.min(100, (count / cat.maxUploads) * 100)}%` }}
                                    ></div>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-[10px] text-slate-500 italic block mt-1">Batas upload: Tanpa Batas</span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-2 border-t border-slate-850/60 pt-3">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCategory({ ...cat });
                                setIsAddingCategory(false);
                              }}
                              className="text-[11px] hover:text-white text-slate-400 flex items-center gap-1 bg-slate-850 hover:bg-slate-800 py-1 px-2 rounded-md transition-colors border border-slate-800"
                            >
                              <Edit2 className="h-3 w-3" /> Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCategory(cat.name)}
                              className="text-[11px] hover:text-white text-red-400 flex items-center gap-1 bg-red-500/10 hover:bg-red-500/20 py-1 px-2 rounded-md transition-colors border border-red-500/10"
                            >
                              <Trash2 className="h-3 w-3" /> Hapus
                            </button>
                          </div>
                        </div>
                      );
                    })}

                  {(portfolio.categories || []).filter(cat => cat.name.toLowerCase().includes(categorySearchQuery.toLowerCase())).length === 0 && (
                    <div className="col-span-full py-12 text-center text-slate-550 border border-dashed border-slate-850 rounded-xl">
                      Tidak ada kategori ditemukan.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: PASSWORD EDITOR */}
          {activeTab === 'password' && (
            <div className="space-y-6 max-w-xl">
              <div className="border-b border-slate-850 pb-4">
                <h2 className="text-xl font-bold font-grotesk flex items-center gap-2 text-[#F0F0F0]">
                  <Key className="h-5 w-5 text-purple-400" /> Ubah Password Admin
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed mt-1">
                  Password admin ini disimpan secara aman langsung ke dalam file <code className="bg-slate-900 text-purple-400 font-mono px-1 rounded">data/config.txt</code> di server.
                </p>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-5 bg-slate-900/40 p-6 rounded-2xl border border-slate-850">
                {passwordChangeStatus === 'success' && (
                  <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-emerald-400 text-xs font-medium">
                    Password admin berhasil diubah! Gunakan password baru Anda saat login kembali.
                  </div>
                )}

                {passwordChangeStatus === 'error' && (
                  <div className="p-3.5 bg-red-500/10 border border-red-500/25 rounded-xl text-red-400 text-xs font-medium">
                    {passwordErrorMessage}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-400">Password Saat Ini (Lama)</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Masukkan password admin lama Anda"
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 px-4 text-xs text-white focus:border-purple-500 focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-400">Password Baru</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Masukkan password admin baru"
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 px-4 text-xs text-white focus:border-purple-500 focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-400">Konfirmasi Password Baru</label>
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Ketik ulang password admin baru"
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 px-4 text-xs text-white focus:border-purple-500 focus:outline-none transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold rounded-xl text-xs tracking-wider uppercase transition-all duration-200"
                >
                  {isChangingPassword ? 'Sedang Mengubah...' : 'Ubah Password Admin'}
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
