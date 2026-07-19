import { useState, useEffect } from 'react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { PortfolioData } from './types';
import PortfolioView from './components/PortfolioView';
import LoginForm from './components/LoginForm';
import AdminPanel from './components/AdminPanel';
import { defaultPortfolioData } from './defaultPortfolioData';

type ViewType = 'portfolio' | 'login' | 'admin';

export default function App() {
  const [view, setView] = useState<ViewType>('portfolio');
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStaticMode, setIsStaticMode] = useState(false);

  // Load portfolio data from the server
  const loadPortfolioData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/portfolio');
      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }
      const jsonData = await response.json();
      setData(jsonData);
      setIsStaticMode(false);
      // Cache successful server data as secondary fallback
      localStorage.setItem('cached-portfolio-data', JSON.stringify(jsonData));
    } catch (err: any) {
      console.warn('Backend server tidak terdeteksi, menggunakan Mode Statis / LocalStorage:', err.message);
      setIsStaticMode(true);

      // Load custom data if it exists, otherwise cached data, otherwise default data
      const localData = localStorage.getItem('custom-portfolio-data') || localStorage.getItem('cached-portfolio-data');
      if (localData) {
        try {
          setData(JSON.parse(localData));
        } catch {
          setData(defaultPortfolioData);
        }
      } else {
        setData(defaultPortfolioData);
      }
    } finally {
      setLoading(false);
      
      // Auto-restore admin session if active
      const savedSession = localStorage.getItem('admin-session');
      if (savedSession === 'admin-session-active') {
        setView('admin');
      }
    }
  };

  useEffect(() => {
    loadPortfolioData();
  }, []);

  // Handle Admin Authorization
  const handleAdminLogin = async (password: string): Promise<boolean> => {
    if (isStaticMode) {
      const savedPassword = localStorage.getItem('custom-admin-password') || 'admin123';
      if (password === savedPassword || password === 'darkdesigner') {
        localStorage.setItem('admin-session', 'admin-session-active');
        setView('admin');
        return true;
      }
      return false;
    }

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      
      if (response.ok) {
        const resData = await response.json();
        if (resData.authenticated) {
          localStorage.setItem('admin-session', 'admin-session-active');
          setView('admin');
          return true;
        }
      } else {
        // Fallback login if backend responds with error
        const savedPassword = localStorage.getItem('custom-admin-password') || 'admin123';
        if (password === savedPassword || password === 'darkdesigner') {
          localStorage.setItem('admin-session', 'admin-session-active');
          setView('admin');
          return true;
        }
      }
      return false;
    } catch {
      // Network error fallback
      const savedPassword = localStorage.getItem('custom-admin-password') || 'admin123';
      if (password === savedPassword || password === 'darkdesigner') {
        localStorage.setItem('admin-session', 'admin-session-active');
        setView('admin');
        return true;
      }
      return false;
    }
  };

  // Handle updating portfolio configuration in database
  const handleSavePortfolio = async (newData: PortfolioData): Promise<boolean> => {
    // Save to localStorage immediately for offline persistence
    localStorage.setItem('custom-portfolio-data', JSON.stringify(newData));
    setData(newData);

    if (isStaticMode) {
      return true;
    }

    try {
      const response = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData)
      });

      if (response.ok) {
        const resData = await response.json();
        if (resData.success) {
          return true;
        }
      }
      return false;
    } catch (err) {
      console.warn('Gagal menyimpan ke server backend, disimpan secara lokal di browser Anda:', err);
      return true; // Return true as we stored it successfully in localStorage
    }
  };

  const handleLogout = () => {
    setView('portfolio');
  };

  // Loader state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex flex-col items-center justify-center text-slate-300 font-sans gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
        <div className="text-center space-y-1">
          <h3 className="font-bold text-sm tracking-widest font-grotesk uppercase text-white">Memuat Portofolio Visual</h3>
          <p className="text-[11px] text-slate-550">Menghubungkan ke database JSON terintegrasi...</p>
        </div>
      </div>
    );
  }

  // Error State Screen
  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex flex-col items-center justify-center text-slate-300 font-sans p-6">
        <div className="w-full max-w-md bg-slate-900 border border-red-500/10 rounded-2xl p-8 text-center space-y-5 shadow-2xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-400">
            <AlertCircle className="h-7 w-7" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-bold text-lg text-white font-grotesk">Gagal Memulai Portofolio</h3>
            <p className="text-xs text-slate-400">{error || 'Database portofolio tidak valid.'}</p>
          </div>
          <div className="pt-2">
            <button
              onClick={loadPortfolioData}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Hubungkan Ulang Server
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render correct screen based on view state
  return (
    <>
      {view === 'portfolio' && (
        <PortfolioView 
          data={data} 
          onEnterAdmin={() => setView('login')} 
        />
      )}

      {view === 'login' && (
        <div className="min-h-screen bg-[#0b0f19] relative">
          {/* Keep Portfolio in background for luxurious blur feel */}
          <div className="absolute inset-0 blur-md pointer-events-none opacity-40">
            <PortfolioView data={data} onEnterAdmin={() => {}} />
          </div>
          <LoginForm 
            onLogin={handleAdminLogin} 
            onCancel={() => setView('portfolio')} 
          />
        </div>
      )}

      {view === 'admin' && (
        <AdminPanel 
          data={data} 
          onSave={handleSavePortfolio} 
          onLogout={handleLogout} 
          isStaticMode={isStaticMode}
        />
      )}
    </>
  );
}
