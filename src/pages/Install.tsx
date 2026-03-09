import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function Install() {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Detect iOS
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setIsInstalled(true);
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="font-display text-2xl text-primary tracking-wider uppercase">S-Rank Level System</h1>
        <p className="text-xs text-muted-foreground">Instala la app en tu dispositivo</p>
      </div>

      <div className="w-20 h-20 rounded-2xl overflow-hidden border border-primary/30 shadow-lg shadow-primary/20">
        <img src="/pwa-192x192.png" alt="App icon" className="w-full h-full object-cover" />
      </div>

      {isInstalled ? (
        <div className="rpg-panel-glow p-6 w-full max-w-sm text-center space-y-3">
          <span className="text-3xl">✅</span>
          <h2 className="font-display text-sm text-accent uppercase">¡Ya instalada!</h2>
          <p className="text-xs text-muted-foreground">La app ya está en tu dispositivo.</p>
          <button
            onClick={() => navigate('/')}
            className="w-full py-2 font-display text-[10px] uppercase tracking-[0.2em] border border-primary/40 text-primary hover:bg-primary/10 transition-all"
          >
            Abrir App
          </button>
        </div>
      ) : deferredPrompt ? (
        <div className="rpg-panel-glow p-6 w-full max-w-sm text-center space-y-4">
          <span className="text-3xl">📲</span>
          <h2 className="font-display text-sm text-foreground uppercase">Instalación rápida</h2>
          <p className="text-xs text-muted-foreground">
            Instala la app directamente en tu teléfono. Sin tienda de apps, sin esperas.
          </p>
          <button
            onClick={handleInstall}
            className="w-full py-3 font-display text-xs uppercase tracking-[0.2em] bg-primary text-primary-foreground hover:bg-primary/90 transition-all rounded"
          >
            ⚡ Instalar App
          </button>
        </div>
      ) : isIOS ? (
        <div className="rpg-panel-glow p-6 w-full max-w-sm text-center space-y-4">
          <span className="text-3xl">🍎</span>
          <h2 className="font-display text-sm text-foreground uppercase">Instalar en iPhone</h2>
          <div className="text-xs text-muted-foreground space-y-2 text-left">
            <p>1. Toca el botón <strong className="text-foreground">Compartir</strong> (📤) en Safari</p>
            <p>2. Selecciona <strong className="text-foreground">"Añadir a pantalla de inicio"</strong></p>
            <p>3. Toca <strong className="text-foreground">"Añadir"</strong></p>
          </div>
        </div>
      ) : (
        <div className="rpg-panel-glow p-6 w-full max-w-sm text-center space-y-4">
          <span className="text-3xl">📱</span>
          <h2 className="font-display text-sm text-foreground uppercase">Instalar App</h2>
          <div className="text-xs text-muted-foreground space-y-2 text-left">
            <p>1. Abre esta página en <strong className="text-foreground">Chrome</strong></p>
            <p>2. Toca el menú <strong className="text-foreground">⋮</strong> (tres puntos)</p>
            <p>3. Selecciona <strong className="text-foreground">"Instalar aplicación"</strong></p>
          </div>
        </div>
      )}

      <button
        onClick={() => navigate('/')}
        className="text-[10px] text-muted-foreground hover:text-primary transition-colors font-display uppercase tracking-wider"
      >
        ← Volver al inicio
      </button>
    </div>
  );
}
