import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_FOOTBALL_KEY;
const LEAGUE_ID = process.env.LEAGUE_ID;
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

  return data;
}

app.get("/", (req, res) => {
  res.json({
    ok: true,
    service: "Mustatil Akhdar Backend"
  });
});

app.get("/matches", async (req, res) => {
  try {
    const data = await apiFootball(
      `/fixtures?league=${LEAGUE_ID}&season=${SEASON}`
    );
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/standings", async (req, res) => {
  try {
    const data = await apiFootball(
      `/standings?league=${LEAGUE_ID}&season=${SEASON}`
    );
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/teams", async (req, res) => {
  try {
    const data = await apiFootball(
      `/teams?league=${LEAGUE_ID}&season=${SEASON}`
    );
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/topscorers", async (req, res) => {
  try {
    const data = await apiFootball(
      `/players/topscorers?league=${LEAGUE_ID}&season=${SEASON}`
    );
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/live", async (req, res) => {
  try {
    const data = await apiFootball(
      `/fixtures?live=${LEAGUE_ID}`
    );
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Mustatil Akhdar backend running on port ${PORT}`);
});
