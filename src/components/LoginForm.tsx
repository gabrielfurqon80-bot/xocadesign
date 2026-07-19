import React, { useState } from 'react';
import { Shield, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

interface LoginFormProps {
  onLogin: (password: string) => Promise<boolean>;
  onCancel: () => void;
}

export default function LoginForm({ onLogin, onCancel }: LoginFormProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Password tidak boleh kosong');
      return;
    }
    setError('');
    setLoading(true);
    
    try {
      const success = await onLogin(password);
      if (!success) {
        setError('Password Admin salah! Coba "admin123" atau "darkdesigner"');
      }
    } catch (err) {
      setError('Terjadi kesalahan jaringan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="login-container" className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md px-4">
      <div 
        id="login-card"
        className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-slate-900/90 p-8 shadow-2xl transition-all"
        style={{ boxShadow: '0 0 40px rgba(0,0,0,0.5)' }}
      >
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-purple-500/10 text-purple-400">
            <Shield className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white font-grotesk">Panel Administrasi</h2>
          <p className="mt-1 text-sm text-slate-400">Masukkan sandi khusus untuk mengedit portofolio Anda</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1.5">Sandi Admin</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                <Lock className="h-4 w-4" />
              </span>
              <input
                id="admin-password-input"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="Masukkan sandi (Default: admin123)"
                className="w-full rounded-xl border border-white/10 bg-black/40 py-3 pl-10 pr-10 text-sm text-white placeholder-slate-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
              />
              <button
                id="toggle-password-btn"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div id="login-error-alert" className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400">
              {error}
            </div>
          )}

          <div className="pt-2 flex flex-col gap-2">
            <button
              id="submit-login-btn"
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 py-3 px-4 text-sm font-medium text-white shadow-lg shadow-purple-600/25 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Memverifikasi...
                </>
              ) : (
                'Masuk ke Dashboard'
              )}
            </button>
            <button
              id="cancel-login-btn"
              type="button"
              onClick={onCancel}
              className="w-full rounded-xl border border-white/10 bg-transparent hover:bg-white/5 py-3 text-sm font-medium text-slate-300 transition-colors"
            >
              Kembali ke Portfolio
            </button>
          </div>
        </form>

        <div className="mt-6 border-t border-white/5 pt-4 text-center">
          <p className="text-[11px] text-slate-500">
            Sandi bawaan untuk pameran ini adalah <span className="font-mono text-slate-400">admin123</span> atau <span className="font-mono text-slate-400">darkdesigner</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
