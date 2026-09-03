import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_FOOTBALL_KEY;
const SEASON = process.env.SEASON || "2026";

const API_URL = "https://v3.football.api-sports.io";

async function apiFootball(endpoint) {
  if (!API_KEY) {
    throw new Error("API_FOOTBALL_KEY is missing");
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      "x-apisports-key": API_KEY
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "API request failed");
  }

  if (data.errors && Object.keys(data.errors).length > 0) {
    throw new Error(JSON.stringify(data.errors));
  }

  return data;
}

// جلب ID الدوري الجزائري تلقائياً
async function getAlgeriaLeagueId() {
  const data = await apiFootball("/leagues?country=Algeria");

  if (!data.response || data.response.length === 0) {
    throw new Error("Algeria league not found");
  }

  // نبحث عن الرابطة الأولى الجزائرية
  const league = data.response.find(
    item =>
      item.league &&
      (
        item.league.name.toLowerCase().includes("ligue 1") ||
        item.league.name.toLowerCase().includes("championnat")
      )
  );

  if (!league) {
    throw new Error("Algerian Ligue 1 not found");
  }

  return league.league.id;
}

// نخزن ID باش ما نعاودوش البحث في كل طلب
let LEAGUE_ID = null;

async function getLeagueId() {
  if (LEAGUE_ID) {
    return LEAGUE_ID;
  }

  LEAGUE_ID = await getAlgeriaLeagueId();

  console.log(`Algerian League ID: ${LEAGUE_ID}`);

  return LEAGUE_ID;
}

app.get("/", (req, res) => {
  res.json({
    ok: true,
    service: "Mustatil Akhdar Backend"
  });
});

app.get("/matches", async (req, res) => {
  try {
    const leagueId = await getLeagueId();

    const data = await apiFootball(
      `/fixtures?league=${leagueId}&season=${SEASON}`
    );

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/standings", async (req, res) => {
  try {
    const leagueId = await getLeagueId();

    const data = await apiFootball(
      `/standings?league=${leagueId}&season=${SEASON}`
    );

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/teams", async (req, res) => {
  try {
    const leagueId = await getLeagueId();

    const data = await apiFootball(
      `/teams?league=${leagueId}&season=${SEASON}`
    );

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/topscorers", async (req, res) => {
  try {
    const leagueId = await getLeagueId();

    const data = await apiFootball(
      `/players/topscorers?league=${leagueId}&season=${SEASON}`
    );

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/live", async (req, res) => {
  try {
    const leagueId = await getLeagueId();

    const data = await apiFootball(
      `/fixtures?live=${leagueId}`
    );

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Mustatil Akhdar backend running on port ${PORT}`);
});
