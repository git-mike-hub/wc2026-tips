import { createClient } from "@supabase/supabase-js";

export const SUPABASE_URL = "https://ydiunjgokejzcvpohjrc.supabase.co";
export const SUPABASE_KEY = "sb_publishable_FG_g9WZEq1ipejUrWYHIRw_PzmGdR1k";
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const FLAGS = {
  Mexico: "🇲🇽", "South Africa": "🇿🇦", "South Korea": "🇰🇷", "Czech Republic": "🇨🇿",
  Canada: "🇨🇦", "Bosnia & Herz.": "🇧🇦", Qatar: "🇶🇦", Switzerland: "🇨🇭",
  Brazil: "🇧🇷", Morocco: "🇲🇦", Haiti: "🇭🇹", Scotland: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  USA: "🇺🇸", Paraguay: "🇵🇾", Australia: "🇦🇺", Turkey: "🇹🇷",
  Germany: "🇩🇪", Curacao: "🇨🇼", "Ivory Coast": "🇨🇮", Ecuador: "🇪🇨",
  Netherlands: "🇳🇱", Japan: "🇯🇵", Sweden: "🇸🇪", Tunisia: "🇹🇳",
  Belgium: "🇧🇪", Egypt: "🇪🇬", Iran: "🇮🇷", "New Zealand": "🇳🇿",
  Spain: "🇪🇸", "Cape Verde": "🇨🇻", "Saudi Arabia": "🇸🇦", Uruguay: "🇺🇾",
  France: "🇫🇷", Senegal: "🇸🇳", Iraq: "🇮🇶", Norway: "🇳🇴",
  Argentina: "🇦🇷", Algeria: "🇩🇿", Austria: "🇦🇹", Jordan: "🇯🇴",
  Portugal: "🇵🇹", "DR Congo": "🇨🇩", Uzbekistan: "🇺🇿", Colombia: "🇨🇴",
  England: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", Croatia: "🇭🇷", Ghana: "🇬🇭", Panama: "🇵🇦",
};

export const tf = (name) => `${FLAGS[name] || "🏳"} ${name}`;

export const TEAM_CODES = {
  Mexico: "MEX", "South Africa": "RSA", "South Korea": "KOR", "Czech Republic": "CZE",
  Canada: "CAN", "Bosnia & Herz.": "BIH", Qatar: "QAT", Switzerland: "SUI",
  Brazil: "BRA", Morocco: "MAR", Haiti: "HAI", Scotland: "SCO",
  USA: "USA", Paraguay: "PAR", Australia: "AUS", Turkey: "TUR",
  Germany: "GER", Curacao: "CUW", "Ivory Coast": "CIV", Ecuador: "ECU",
  Netherlands: "NED", Japan: "JPN", Sweden: "SWE", Tunisia: "TUN",
  Belgium: "BEL", Egypt: "EGY", Iran: "IRN", "New Zealand": "NZL",
  Spain: "ESP", "Cape Verde": "CPV", "Saudi Arabia": "KSA", Uruguay: "URU",
  France: "FRA", Senegal: "SEN", Iraq: "IRQ", Norway: "NOR",
  Argentina: "ARG", Algeria: "ALG", Austria: "AUT", Jordan: "JOR",
  Portugal: "POR", "DR Congo": "COD", Uzbekistan: "UZB", Colombia: "COL",
  England: "ENG", Croatia: "CRO", Ghana: "GHA", Panama: "PAN",
};

export const tc = (name) => TEAM_CODES[name] || name.slice(0, 3).toUpperCase();

export async function hashPIN(pin) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(pin));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
