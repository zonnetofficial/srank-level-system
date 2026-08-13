import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type OAuthNamespace = {
  getAuthorizationDetails: (id: string) => Promise<{ data: any; error: any }>;
  approveAuthorization: (id: string) => Promise<{ data: any; error: any }>;
  denyAuthorization: (id: string) => Promise<{ data: any; error: any }>;
};

const oauth = (supabase.auth as unknown as { oauth: OAuthNamespace }).oauth;

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) return setError("Falta authorization_id");
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        window.location.href = "/auth?next=" + encodeURIComponent(next);
        return;
      }
      const { data, error } = await oauth.getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (error) return setError(error.message);
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data);
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    setBusy(true);
    const { data, error } = approve
      ? await oauth.approveAuthorization(authorizationId)
      : await oauth.denyAuthorization(authorizationId);
    if (error) {
      setBusy(false);
      return setError(error.message);
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      return setError("El servidor de autorización no devolvió una redirección.");
    }
    window.location.href = target;
  }

  const clientName = details?.client?.name ?? "la aplicación";

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm rpg-panel p-6 space-y-5 text-center">
        <h1 className="font-display text-xl font-bold text-primary text-glow-primary uppercase tracking-wider">
          Autorizar acceso
        </h1>

        {error ? (
          <p className="text-sm font-body text-destructive">No se pudo cargar la solicitud: {error}</p>
        ) : !details ? (
          <p className="text-sm font-body text-muted-foreground animate-pulse">Cargando…</p>
        ) : (
          <>
            <p className="text-sm font-body text-muted-foreground">
              <span className="text-foreground">{clientName}</span> quiere acceder a tu cuenta de S-Rank System y
              actuar en tu nombre.
            </p>
            <div className="flex gap-3">
              <button
                disabled={busy}
                onClick={() => decide(false)}
                className="flex-1 py-2.5 bg-secondary border border-border text-foreground font-display text-xs uppercase tracking-wider rounded hover:brightness-110 transition disabled:opacity-50"
              >
                Rechazar
              </button>
              <button
                disabled={busy}
                onClick={() => decide(true)}
                className="flex-1 py-2.5 bg-primary text-primary-foreground font-display text-xs uppercase tracking-wider rounded hover:brightness-110 transition disabled:opacity-50"
              >
                Aprobar
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
