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

      if (!amount || amount < 1) {
        return new Response(JSON.stringify({ error: 'Monto inválido' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const mpResponse = await fetch(`${MP_API}/v1/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
          'X-Idempotency-Key': `dp_${userId}_${package_id}_${Date.now()}`,
        },
        body: JSON.stringify({
          transaction_amount: amount,
          description: `Dark Points - ${dark_points} DP`,
          payment_method_id: 'account_money',
          payer: { email: user.email },
          external_reference: `dp_${userId}_${package_id}`,
          back_urls: {
            success: back_url || 'https://srank-level-system.lovable.app/shop',
            failure: back_url || 'https://srank-level-system.lovable.app/shop',
          },
          auto_return: 'approved',
        }),
      });

      // For now use preference-based checkout
      const prefResponse = await fetch(`${MP_API}/checkout/preferences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          items: [{
            title: `Dark Points - ${dark_points} DP`,
            quantity: 1,
            unit_price: amount,
            currency_id: 'MXN',
          }],
          payer: { email: user.email },
          external_reference: `dp_${userId}_${package_id}_${dark_points}`,
          back_urls: {
            success: (back_url || 'https://srank-level-system.lovable.app/shop') + '?dp_success=true',
            failure: (back_url || 'https://srank-level-system.lovable.app/shop') + '?dp_fail=true',
          },
          auto_return: 'approved',
        }),
      });

      const prefData = await prefResponse.json();
      if (!prefResponse.ok) {
        console.error('MP preference error:', prefData);
        throw new Error(`MercadoPago error [${prefResponse.status}]: ${JSON.stringify(prefData)}`);
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

      if (!amount || amount < 1) {
        return new Response(JSON.stringify({ error: 'Monto inválido' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const prefResponse = await fetch(`${MP_API}/checkout/preferences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          items: [{
            title: `T-Points - ${t_points} TP`,
            quantity: 1,
            unit_price: amount,
            currency_id: 'MXN',
          }],
          payer: { email: user.email },
          external_reference: `tp_${userId}_${package_id}_${t_points}`,
          back_urls: {
            success: (back_url || 'https://srank-level-system.lovable.app/shop') + '?tp_success=true',
            failure: (back_url || 'https://srank-level-system.lovable.app/shop') + '?tp_fail=true',
          },
          auto_return: 'approved',
        }),
      });

      const prefData = await prefResponse.json();
      if (!prefResponse.ok) {
        console.error('MP TP preference error:', prefData);
        throw new Error(`MercadoPago error [${prefResponse.status}]: ${JSON.stringify(prefData)}`);
      }

      return new Response(JSON.stringify({
        init_point: prefData.init_point,
        preference_id: prefData.id,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // --- CONFIRM TP PURCHASE (webhook or manual) ---
    if (action === 'confirm_tp_purchase') {
      const { t_points: tpAmount } = params;
      const adminSupabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      );

      const { data: existing } = await adminSupabase
        .from('t_points')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (existing) {
        await adminSupabase.from('t_points').update({
          balance: existing.balance + tpAmount,
          total_earned: existing.total_earned + tpAmount,
          updated_at: new Date().toISOString(),
        }).eq('user_id', userId);
      } else {
        await adminSupabase.from('t_points').insert({
          user_id: userId,
          balance: tpAmount,
          total_earned: tpAmount,
          total_spent: 0,
        });
      }

      await adminSupabase.from('tp_transactions').insert({
        user_id: userId,
        amount: tpAmount,
        type: 'purchase',
        description: `Compra de ${tpAmount} T-Points`,
      });

      return new Response(JSON.stringify({ success: true, new_balance: (existing?.balance || 0) + tpAmount }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // --- CONFIRM DP PURCHASE (webhook or manual) ---
    if (action === 'confirm_dp_purchase') {
      const { dark_points: dpAmount } = params;
      const adminSupabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      );

      // Upsert dark_points balance
      const { data: existing } = await adminSupabase
        .from('dark_points')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (existing) {
        await adminSupabase.from('dark_points').update({
          balance: existing.balance + dpAmount,
          total_earned: existing.total_earned + dpAmount,
          updated_at: new Date().toISOString(),
        }).eq('user_id', userId);
      } else {
        await adminSupabase.from('dark_points').insert({
          user_id: userId,
          balance: dpAmount,
          total_earned: dpAmount,
          total_spent: 0,
        });
      }

      // Log transaction
      await adminSupabase.from('dp_transactions').insert({
        user_id: userId,
        amount: dpAmount,
        type: 'purchase',
        description: `Compra de ${dpAmount} Dark Points`,
      });

      return new Response(JSON.stringify({ success: true, new_balance: (existing?.balance || 0) + dpAmount }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // --- SIMULATE PAYMENT (dev/test only) ---
    if (action === 'simulate_payment') {
      const { penalty_amount, payer_email } = params;
      const adminSupabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      );
      await adminSupabase.from('monarch_subscriptions').upsert({
        user_id: userId,
        status: 'active',
        penalty_amount: penalty_amount || 10,
        mp_preapproval_id: `sim_${Date.now()}`,
        mp_payer_email: payer_email || user.email || 'test@test.com',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

      return new Response(JSON.stringify({ status: 'active', simulated: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'create_subscription') {
      const { penalty_amount, payer_email, back_url } = params;

      if (!penalty_amount || penalty_amount < 5 || penalty_amount > 100) {
        return new Response(JSON.stringify({ error: 'Monto de penalización inválido (5-100 MXN)' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Create Mercado Pago preapproval (subscription without plan)
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
          back_url: back_url || 'https://srank-level-system.lovable.app/',
          status: 'pending',
        }),
      });

      const mpData = await mpResponse.json();
      if (!mpResponse.ok) {
        console.error('MP error:', mpData);
        throw new Error(`Mercado Pago error [${mpResponse.status}]: ${JSON.stringify(mpData)}`);
      }

      // Save subscription to DB
      const { error: dbError } = await supabase.from('monarch_subscriptions').upsert({
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
      // Check subscription status from Mercado Pago
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

      const mpResponse = await fetch(`${MP_API}/preapproval/${sub.mp_preapproval_id}`, {
        headers: { 'Authorization': `Bearer ${MP_ACCESS_TOKEN}` },
      });

      const mpData = await mpResponse.json();

      let newStatus = sub.status;
      if (mpData.status === 'authorized') newStatus = 'active';
      else if (mpData.status === 'cancelled') newStatus = 'inactive';
      else if (mpData.status === 'pending') newStatus = 'pending';

      if (newStatus !== sub.status) {
        await supabase.from('monarch_subscriptions')
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
        await fetch(`${MP_API}/preapproval/${sub.mp_preapproval_id}`, {
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
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
