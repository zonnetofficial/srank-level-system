import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MP_API = 'https://api.mercadopago.com';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const MP_ACCESS_TOKEN = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    if (!MP_ACCESS_TOKEN) throw new Error('MERCADOPAGO_ACCESS_TOKEN not configured');

    // Verify auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }
    const userId = user.id;

    const { action, ...params } = await req.json();

    // --- BUY DARK POINTS ---
    if (action === 'buy_dark_points') {
      const { package_id, dark_points, amount, back_url } = params;

      if (!amount || typeof amount !== 'number' || amount < 1 || amount > 100000) {
        return new Response(JSON.stringify({ error: 'Monto inválido' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (!package_id || typeof package_id !== 'string') {
        return new Response(JSON.stringify({ error: 'Package ID inválido' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const sanitizedBackUrl = sanitizeBackUrl(back_url);

      const prefResponse = await fetch(`${MP_API}/checkout/preferences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          items: [{
            title: `Dark Points - ${Number(dark_points) || 0} DP`,
            quantity: 1,
            unit_price: amount,
            currency_id: 'MXN',
          }],
          payer: { email: user.email },
          external_reference: `dp_${userId}_${package_id}_${dark_points}`,
          back_urls: {
            success: sanitizedBackUrl + '?dp_success=true',
            failure: sanitizedBackUrl + '?dp_fail=true',
          },
          auto_return: 'approved',
        }),
      });

      const prefData = await prefResponse.json();
      if (!prefResponse.ok) {
        console.error('MP preference error:', prefData);
        throw new Error('Error al crear preferencia de pago');
      }

      return new Response(JSON.stringify({
        init_point: prefData.init_point,
        preference_id: prefData.id,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // --- BUY T-POINTS ---
    if (action === 'buy_t_points') {
      const { package_id, t_points, amount, back_url } = params;

      if (!amount || typeof amount !== 'number' || amount < 1 || amount > 100000) {
        return new Response(JSON.stringify({ error: 'Monto inválido' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (!package_id || typeof package_id !== 'string') {
        return new Response(JSON.stringify({ error: 'Package ID inválido' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const sanitizedBackUrl = sanitizeBackUrl(back_url);

      const prefResponse = await fetch(`${MP_API}/checkout/preferences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          items: [{
            title: `T-Points - ${Number(t_points) || 0} TP`,
            quantity: 1,
            unit_price: amount,
            currency_id: 'MXN',
          }],
          payer: { email: user.email },
          external_reference: `tp_${userId}_${package_id}_${t_points}`,
          back_urls: {
            success: sanitizedBackUrl + '?tp_success=true',
            failure: sanitizedBackUrl + '?tp_fail=true',
          },
          auto_return: 'approved',
        }),
      });

      const prefData = await prefResponse.json();
      if (!prefResponse.ok) {
        console.error('MP TP preference error:', prefData);
        throw new Error('Error al crear preferencia de pago');
      }

      return new Response(JSON.stringify({
        init_point: prefData.init_point,
        preference_id: prefData.id,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // --- WEBHOOK: Verify payment with MercadoPago before crediting ---
    if (action === 'webhook_payment') {
      const { payment_id } = params;

      if (!payment_id || typeof payment_id !== 'string') {
        return new Response(JSON.stringify({ error: 'Payment ID requerido' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Verify payment with MercadoPago API
      const mpResponse = await fetch(`${MP_API}/v1/payments/${encodeURIComponent(payment_id)}`, {
        headers: { 'Authorization': `Bearer ${MP_ACCESS_TOKEN}` },
      });

      if (!mpResponse.ok) {
        return new Response(JSON.stringify({ error: 'No se pudo verificar el pago' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const paymentData = await mpResponse.json();

      if (paymentData.status !== 'approved') {
        return new Response(JSON.stringify({ error: 'Pago no aprobado', status: paymentData.status }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const externalRef = paymentData.external_reference as string;
      if (!externalRef) {
        return new Response(JSON.stringify({ error: 'Referencia externa no encontrada' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const adminSupabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      );

      // Idempotency: check if this payment was already processed
      const paymentIdStr = String(payment_id);

      if (externalRef.startsWith('dp_')) {
        // Parse: dp_{userId}_{packageId}_{darkPoints}
        const parts = externalRef.split('_');
        const refUserId = parts[1];
        const dpAmount = parseInt(parts[3]) || 0;

        if (refUserId !== userId) {
          return new Response(JSON.stringify({ error: 'Usuario no coincide' }), {
            status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Check idempotency
        const { data: existingTx } = await adminSupabase
          .from('dp_transactions')
          .select('id')
          .eq('reference_id', paymentIdStr)
          .single();

        if (existingTx) {
          return new Response(JSON.stringify({ success: true, already_processed: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Credit dark points
        const { data: existing } = await adminSupabase
          .from('dark_points')
          .select('*')
          .eq('user_id', refUserId)
          .single();

        if (existing) {
          await adminSupabase.from('dark_points').update({
            balance: existing.balance + dpAmount,
            total_earned: existing.total_earned + dpAmount,
            updated_at: new Date().toISOString(),
          }).eq('user_id', refUserId);
        } else {
          await adminSupabase.from('dark_points').insert({
            user_id: refUserId,
            balance: dpAmount,
            total_earned: dpAmount,
            total_spent: 0,
          });
        }

        await adminSupabase.from('dp_transactions').insert({
          user_id: refUserId,
          amount: dpAmount,
          type: 'purchase',
          description: `Compra de ${dpAmount} Dark Points (pago ${paymentIdStr})`,
          reference_id: paymentIdStr,
        });

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      } else if (externalRef.startsWith('tp_')) {
        // Parse: tp_{userId}_{packageId}_{tPoints}
        const parts = externalRef.split('_');
        const refUserId = parts[1];
        const tpAmount = parseInt(parts[3]) || 0;

        if (refUserId !== userId) {
          return new Response(JSON.stringify({ error: 'Usuario no coincide' }), {
            status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Check idempotency
        const { data: existingTx } = await adminSupabase
          .from('tp_transactions')
          .select('id')
          .eq('reference_id', paymentIdStr)
          .single();

        if (existingTx) {
          return new Response(JSON.stringify({ success: true, already_processed: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { data: existing } = await adminSupabase
          .from('t_points')
          .select('*')
          .eq('user_id', refUserId)
          .single();

        if (existing) {
          await adminSupabase.from('t_points').update({
            balance: existing.balance + tpAmount,
            total_earned: existing.total_earned + tpAmount,
            updated_at: new Date().toISOString(),
          }).eq('user_id', refUserId);
        } else {
          await adminSupabase.from('t_points').insert({
            user_id: refUserId,
            balance: tpAmount,
            total_earned: tpAmount,
            total_spent: 0,
          });
        }

        await adminSupabase.from('tp_transactions').insert({
          user_id: refUserId,
          amount: tpAmount,
          type: 'purchase',
          description: `Compra de ${tpAmount} T-Points (pago ${paymentIdStr})`,
          reference_id: paymentIdStr,
        });

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ error: 'Referencia no reconocida' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'create_subscription') {
      const { penalty_amount, payer_email, back_url } = params;

      if (!penalty_amount || typeof penalty_amount !== 'number' || penalty_amount < 5 || penalty_amount > 100) {
        return new Response(JSON.stringify({ error: 'Monto de penalización inválido (5-100 MXN)' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (!payer_email || typeof payer_email !== 'string' || !payer_email.includes('@')) {
        return new Response(JSON.stringify({ error: 'Email inválido' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const sanitizedBackUrl = sanitizeBackUrl(back_url);

      const mpResponse = await fetch(`${MP_API}/preapproval`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          reason: 'Ruta del Monarca - Penalización diaria',
          external_reference: `monarch_${userId}`,
          payer_email: payer_email,
          auto_recurring: {
            frequency: 1,
            frequency_type: 'days',
            transaction_amount: penalty_amount,
            currency_id: 'MXN',
          },
          back_url: sanitizedBackUrl,
          status: 'pending',
        }),
      });

      const mpData = await mpResponse.json();
      if (!mpResponse.ok) {
        console.error('MP error:', mpData);
        throw new Error('Error al crear suscripción');
      }

      const monarchAdmin = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      );
      const { error: dbError } = await monarchAdmin.from('monarch_subscriptions').upsert({
        user_id: userId,
        status: 'pending',
        penalty_amount: penalty_amount,
        mp_preapproval_id: mpData.id,
        mp_payer_email: payer_email,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

      if (dbError) {
        console.error('DB error:', dbError);
      }

      return new Response(JSON.stringify({
        init_point: mpData.init_point,
        preapproval_id: mpData.id,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'check_status') {
      const { data: sub } = await supabase
        .from('monarch_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!sub || !sub.mp_preapproval_id) {
        return new Response(JSON.stringify({ status: 'inactive' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const mpResponse = await fetch(`${MP_API}/preapproval/${encodeURIComponent(sub.mp_preapproval_id)}`, {
        headers: { 'Authorization': `Bearer ${MP_ACCESS_TOKEN}` },
      });

      const mpData = await mpResponse.json();

      let newStatus = sub.status;
      if (mpData.status === 'authorized') newStatus = 'active';
      else if (mpData.status === 'cancelled') newStatus = 'inactive';
      else if (mpData.status === 'pending') newStatus = 'pending';

      if (newStatus !== sub.status) {
        const statusAdmin = createClient(
          Deno.env.get('SUPABASE_URL')!,
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
        );
        await statusAdmin.from('monarch_subscriptions')
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .eq('id', sub.id);
      }

      return new Response(JSON.stringify({
        status: newStatus,
        penalty_amount: sub.penalty_amount,
        blocked_until: sub.blocked_until,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'cancel') {
      const { data: sub } = await supabase
        .from('monarch_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (sub?.mp_preapproval_id) {
        await fetch(`${MP_API}/preapproval/${encodeURIComponent(sub.mp_preapproval_id)}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
          },
          body: JSON.stringify({ status: 'cancelled' }),
        });
      }

      await supabase.from('monarch_subscriptions')
        .update({ status: 'inactive', mp_preapproval_id: null, updated_at: new Date().toISOString() })
        .eq('user_id', userId);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Sanitize back_url to only allow known domains
function sanitizeBackUrl(url: string | undefined): string {
  const defaultUrl = 'https://srank-level-system.lovable.app/shop';
  if (!url || typeof url !== 'string') return defaultUrl;
  try {
    const parsed = new URL(url);
    const allowedHosts = ['srank-level-system.lovable.app', 'localhost'];
    if (allowedHosts.some(h => parsed.hostname === h || parsed.hostname.endsWith('.lovable.app'))) {
      return parsed.origin + parsed.pathname;
    }
  } catch {
    // invalid URL
  }
  return defaultUrl;
}
