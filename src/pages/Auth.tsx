import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName || 'Cazador' },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast.success('Revisa tu correo para confirmar tu cuenta');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm rpg-panel p-6 space-y-6">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold text-primary text-glow-primary">
            ⚔️ S-Rank System
          </h1>
          <p className="text-xs font-display text-muted-foreground uppercase tracking-wider mt-2">
            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="text-xs font-display uppercase tracking-wider text-muted-foreground">
                Nombre de Cazador
              </label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-secondary border border-border rounded text-foreground font-body text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Tu nombre de cazador"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-display uppercase tracking-wider text-muted-foreground">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full mt-1 px-3 py-2 bg-secondary border border-border rounded text-foreground font-body text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div>
            <label className="text-xs font-display uppercase tracking-wider text-muted-foreground">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full mt-1 px-3 py-2 pr-10 bg-secondary border border-border rounded text-foreground font-body text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 mt-0.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-primary text-primary-foreground font-display text-sm uppercase tracking-wider rounded hover:brightness-110 transition disabled:opacity-50"
          >
            {loading ? '...' : isLogin ? 'Entrar' : 'Registrarse'}
          </button>
        </form>

        <button
          onClick={() => setIsLogin(!isLogin)}
          className="w-full text-center text-xs text-muted-foreground hover:text-primary transition font-body"
        >
          {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
        </button>
      </div>
    </div>
  );
};

export default Auth;
