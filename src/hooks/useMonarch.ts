import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface MonarchStatus {
  status: 'inactive' | 'pending' | 'active' | 'blocked';
  penalty_amount?: number;
  blocked_until?: string | null;
}

export function useMonarch() {
  const { user, session } = useAuth();
  const [monarchStatus, setMonarchStatus] = useState<MonarchStatus>({ status: 'inactive' });
  const [loading, setLoading] = useState(false);

  const checkStatus = async () => {
    if (!session) return;
    try {
      const { data, error } = await supabase.functions.invoke('mercadopago', {
        body: { action: 'check_status' },
      });
      if (error) throw error;
      setMonarchStatus(data);
    } catch (e) {
      console.error('Error checking monarch status:', e);
    }
  };

  useEffect(() => {
    if (session) checkStatus();
  }, [session]);

  const createSubscription = async (penaltyAmount: number, payerEmail: string) => {
    if (!session) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('mercadopago', {
        body: {
          action: 'create_subscription',
          penalty_amount: penaltyAmount,
          payer_email: payerEmail,
          back_url: window.location.origin,
        },
      });
      if (error) throw error;
      if (data.init_point) {
        window.open(data.init_point, '_blank');
        toast.info('Completa el pago en Mercado Pago');
      }
    } catch (e: any) {
      toast.error(e.message || 'Error al crear suscripción');
    } finally {
      setLoading(false);
    }
  };

  const simulatePayment = async (penaltyAmount: number, payerEmail: string) => {
    if (!session) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('mercadopago', {
        body: { action: 'simulate_payment', penalty_amount: penaltyAmount, payer_email: payerEmail },
      });
      if (error) throw error;
      setMonarchStatus({ status: 'active', penalty_amount: penaltyAmount });
      toast.success('¡Pago simulado! Modo Monarca activado');
    } catch (e: any) {
      toast.error(e.message || 'Error al simular pago');
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async () => {
    if (!session) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('mercadopago', {
        body: { action: 'cancel' },
      });
      if (error) throw error;
      setMonarchStatus({ status: 'inactive' });
      toast.success('Ruta del Monarca cancelada');
    } catch (e: any) {
      toast.error(e.message || 'Error al cancelar');
    } finally {
      setLoading(false);
    }
  };

  return { monarchStatus, loading, createSubscription, cancelSubscription, checkStatus, simulatePayment };
}
