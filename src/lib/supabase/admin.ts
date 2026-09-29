import { createClient } from "@supabase/supabase-js";

// Client à privilèges complets (contourne les règles RLS). Réservé au serveur,
// pour les écritures que l'utilisateur ne doit pas pouvoir faire lui-même,
// comme l'enregistrement de son abonnement par le webhook Stripe.
export function creerClientAdmin() {
  const cle = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!cle) throw new Error("SUPABASE_SERVICE_ROLE_KEY manquante.");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, cle, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
