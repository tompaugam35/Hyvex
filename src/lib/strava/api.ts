const URL_AUTORISATION = "https://www.strava.com/oauth/authorize";
const URL_JETON = "https://www.strava.com/oauth/token";
const URL_ACTIVITES = "https://www.strava.com/api/v3/athlete/activities";

export interface JetonStrava {
  access_token: string;
  refresh_token: string;
  expires_at: number; // epoch secondes
  athlete?: { id: number };
}

export interface ActiviteStrava {
  id: number;
  name: string;
  sport_type: string;
  distance: number; // mètres
  moving_time: number; // secondes
  start_date_local: string; // ISO
}

export function urlAutorisationStrava(redirectUri: string) {
  const params = new URLSearchParams({
    client_id: process.env.STRAVA_CLIENT_ID!,
    response_type: "code",
    redirect_uri: redirectUri,
    approval_prompt: "auto",
    scope: "read,activity:read_all",
  });
  return `${URL_AUTORISATION}?${params.toString()}`;
}

export async function echangerCodeContreJeton(code: string): Promise<JetonStrava> {
  const reponse = await fetch(URL_JETON, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
    }),
  });
  if (!reponse.ok) throw new Error("Échange du code Strava échoué");
  return reponse.json();
}

export async function rafraichirJetonStrava(refreshToken: string): Promise<JetonStrava> {
  const reponse = await fetch(URL_JETON, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  if (!reponse.ok) throw new Error("Rafraîchissement du jeton Strava échoué");
  return reponse.json();
}

// Ne remonte que les activités de course (le MVP ne gère pas les autres sports Strava).
export async function recupererActivitesDeCourse(
  accessToken: string,
  apres: number
): Promise<ActiviteStrava[]> {
  const params = new URLSearchParams({ after: String(apres), per_page: "50" });
  const reponse = await fetch(`${URL_ACTIVITES}?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!reponse.ok) throw new Error("Récupération des activités Strava échouée");
  const activites: ActiviteStrava[] = await reponse.json();
  return activites.filter((a) => a.sport_type === "Run" || a.sport_type === "TrailRun");
}
