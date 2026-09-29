import type { SupabaseClient } from "@supabase/supabase-js";

// Tant que le paiement n'est pas branché, le paywall reste éteint : tout le
// monde garde l'accès complet.
export const PAYWALL_ACTIF = process.env.NEXT_PUBLIC_PAYWALL_ACTIF === "true";

const STATUTS_ACTIFS = ["active", "trialing"];

export async function aAccesComplet(supabase: SupabaseClient, userId: string) {
  if (!PAYWALL_ACTIF) return true;
  const { data } = await supabase
    .from("abonnements")
    .select("statut")
    .eq("user_id", userId)
    .maybeSingle();
  return !!data && STATUTS_ACTIFS.includes(data.statut);
}
