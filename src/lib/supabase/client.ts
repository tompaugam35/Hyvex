import { createBrowserClient } from "@supabase/ssr";

export function creerClientNavigateur() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        // Flux "implicite" : la session arrive directement dans l'URL du lien
        // email, sans dépendre d'un cookie posé par le navigateur d'origine.
        // Indispensable ici car le lien est souvent ouvert dans une autre
        // app/navigateur que celui où la demande a été faite.
        flowType: "implicit",
      },
    }
  );
}
