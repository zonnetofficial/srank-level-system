import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import VictorianFrame from '@/components/VictorianFrame';
import { useMonarch } from '@/hooks/useMonarch';
import { useGameState } from '@/hooks/useGameState';
import { useAuth } from '@/hooks/useAuth';

const MonarchMode = () => {
  const navigate = useNavigate();
  const { monarchStatus, loading, createSubscription, cancelSubscription, checkStatus, simulatePayment } = useMonarch();
  const { state } = useGameState();
  const { user } = useAuth();
  const [penaltyAmount, setPenaltyAmount] = useState(10);
  const [payerEmail, setPayerEmail] = useState(user?.email || '');
  const [showConfirm, setShowConfirm] = useState(false);

  const canEnter = state.currentStreak >= 3;
  const isBlocked = monarchStatus.status === 'blocked' && monarchStatus.blocked_until;

  const handleActivate = () => {
    if (!canEnter) return;
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    await createSubscription(penaltyAmount, payerEmail || user?.email || '');
    setShowConfirm(false);
  };

  return (
    <VictorianFrame>
      <button
        onClick={() => navigate('/')}
        className="text-muted-foreground hover:text-foreground text-xs font-display uppercase tracking-wider mb-4 flex items-center gap-1 transition-colors"
      >
        ← Volver
      </button>

      <div className="text-center mb-6">
        <h1 className="font-display text-xl font-bold text-accent text-glow-accent">
          👑 Ruta del Monarca de las Sombras
        </h1>
        <p className="text-xs text-muted-foreground font-body mt-2">
          Modo de alta exigencia con penalización real por fallo
        </p>
      </div>

      {/* Status */}
      <div className="rpg-panel p-4 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-display uppercase tracking-wider text-muted-foreground">Estado</span>
          <span className={`text-sm font-display font-bold ${
            monarchStatus.status === 'active' ? 'text-accent' :
            monarchStatus.status === 'pending' ? 'text-primary' :
            monarchStatus.status === 'blocked' ? 'text-destructive' :
            'text-muted-foreground'
          }`}>
            {monarchStatus.status === 'active' ? '🔥 Activo' :
             monarchStatus.status === 'pending' ? '⏳ Pendiente' :
             monarchStatus.status === 'blocked' ? '🚫 Bloqueado' :
             '💀 Inactivo'}
          </span>
        </div>
        {monarchStatus.status === 'active' && (
          <div className="mt-2 text-xs text-muted-foreground">
            Penalización: <span className="text-accent font-bold">${monarchStatus.penalty_amount} MXN</span> por fallo
          </div>
        )}
        {isBlocked && (
          <div className="mt-2 text-xs text-destructive">
            Bloqueado hasta: {monarchStatus.blocked_until}
          </div>
        )}
      </div>

      {/* Benefits */}
      <div className="rpg-panel p-4 mb-4 space-y-2">
        <h2 className="text-xs font-display uppercase tracking-wider text-muted-foreground mb-2">Beneficios</h2>
        <div className="text-xs font-body text-foreground space-y-1">
          <p>⚡ +25% XP bonus en todas las misiones</p>
          <p>👑 Títulos exclusivos por racha de supervivencia</p>
          <p>🔥 Tabla de clasificación del Monarca</p>
        </div>
      </div>

      {/* Rules */}
      <div className="rpg-panel p-4 mb-4 space-y-2">
        <h2 className="text-xs font-display uppercase tracking-wider text-muted-foreground mb-2">Reglas</h2>
        <div className="text-xs font-body text-muted-foreground space-y-1">
          <p>💰 Elige penalización: $5 - $100 MXN por día fallido</p>
          <p>⏰ Cobro automático a las 00:00 si fallas la misión</p>
          <p>📊 50% se pierde, 50% se dona a una causa</p>
          <p>🚪 Salida voluntaria sin reembolso</p>
          <p>🚫 Fallo de pago = expulsión + bloqueo 7 días</p>
        </div>
      </div>

      {/* Actions */}
      {monarchStatus.status === 'inactive' && !isBlocked && (
        <>
          {!canEnter && (
            <div className="text-center text-xs text-destructive font-body mb-4">
              Necesitas racha de 3+ días en Ruta Personal para entrar (actual: {state.currentStreak})
            </div>
          )}

          {!showConfirm ? (
            <button
              onClick={handleActivate}
              disabled={!canEnter || loading}
              className="w-full py-3 bg-accent text-accent-foreground font-display text-sm uppercase tracking-wider rounded hover:brightness-110 transition disabled:opacity-40"
            >
              ⚔️ Activar Ruta del Monarca
            </button>
          ) : (
            <div className="rpg-panel p-4 space-y-4">
              <h3 className="text-xs font-display uppercase tracking-wider text-accent text-center">
                Configurar Penalización
              </h3>

              <div>
                <label className="text-xs font-display text-muted-foreground">
                  Monto (${penaltyAmount} MXN / día fallido)
                </label>
                <input
                  type="range"
                  min={5}
                  max={100}
                  step={5}
                  value={penaltyAmount}
                  onChange={e => setPenaltyAmount(Number(e.target.value))}
                  className="w-full mt-1 accent-accent"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>$5</span><span>$50</span><span>$100</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-display text-muted-foreground">Email de Mercado Pago</label>
                <input
                  type="email"
                  value={payerEmail}
                  onChange={e => setPayerEmail(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-secondary border border-border rounded text-foreground font-body text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="tu@email.com"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-2 border border-border text-muted-foreground font-display text-xs uppercase rounded hover:text-foreground transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={loading || !payerEmail}
                  className="flex-1 py-2 bg-accent text-accent-foreground font-display text-xs uppercase rounded hover:brightness-110 transition disabled:opacity-40"
                >
                  {loading ? '...' : 'Confirmar'}
                </button>
              </div>
              <button
                onClick={() => simulatePayment(penaltyAmount, payerEmail || user?.email || '')}
                disabled={loading}
                className="w-full mt-2 py-2 border border-primary/50 text-primary font-display text-[10px] uppercase tracking-wider rounded hover:bg-primary/10 transition disabled:opacity-40"
              >
                {loading ? '...' : '🧪 Simular Pago (Dev)'}
              </button>
            </div>
          )}
        </>
      )}

      {monarchStatus.status === 'pending' && (
        <div className="text-center space-y-3">
          <p className="text-xs text-muted-foreground font-body">
            Completa el pago en Mercado Pago para activar el modo
          </p>
          <button
            onClick={checkStatus}
            disabled={loading}
            className="py-2 px-6 border border-primary text-primary font-display text-xs uppercase rounded hover:bg-primary/10 transition"
          >
            Verificar estado
          </button>
        </div>
      )}

      {monarchStatus.status === 'active' && (
        <button
          onClick={cancelSubscription}
          disabled={loading}
          className="w-full py-2 border border-destructive/50 text-destructive font-display text-xs uppercase tracking-wider rounded hover:bg-destructive/10 transition"
        >
          {loading ? '...' : '🚪 Salir de la Ruta del Monarca'}
        </button>
      )}
    </VictorianFrame>
  );
};

export default MonarchMode;
