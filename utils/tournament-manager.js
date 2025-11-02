import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.join(__dirname, "..", "data", "tournaments.json");

// Criar pasta data se não existir
const dataDir = path.join(__dirname, "..", "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Garantir que o ficheiro existe
if (!fs.existsSync(dataPath)) {
  fs.writeFileSync(dataPath, JSON.stringify([], null, 2));
}

export function loadTournaments() {
  try {
    const data = fs.readFileSync(dataPath, "utf-8");

    // Verificar se o ficheiro está vazio
    if (!data || data.trim() === "") {
      console.log("⚠️ tournaments.json is empty, initializing...");
      saveTournaments([]);
      return [];
    }

    return JSON.parse(data);
  } catch (err) {
    console.error("❌ Error loading tournaments.json:", err);

    // Criar backup se houver erro
    if (fs.existsSync(dataPath)) {
      const backupPath = dataPath.replace(
        ".json",
        `-backup-${Date.now()}.json`,
      );
      try {
        fs.copyFileSync(dataPath, backupPath);
        console.log(`📦 Backup created: ${backupPath}`);
      } catch (backupErr) {
        console.error("❌ Error creating backup:", backupErr);
      }
    }

    // Reinicializar ficheiro
    saveTournaments([]);
    return [];
  }
}

export function saveTournaments(tournaments) {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(tournaments, null, 2));
  } catch (err) {
    console.error("❌ Error saving tournaments.json:", err);
  }
}

export function generateTournamentId() {
  return `T-${Date.now().toString(36).toUpperCase()}`;
}

export function getTournamentById(tournamentId, guildId) {
  const tournaments = loadTournaments();
  return tournaments.find(
    (t) => t.id === tournamentId && t.guildId === guildId,
  );
}

export function updateTournament(tournamentId, guildId, updates) {
  const tournaments = loadTournaments();
  const index = tournaments.findIndex(
    (t) => t.id === tournamentId && t.guildId === guildId,
  );

  if (index === -1) {
    return null;
  }

  tournaments[index] = { ...tournaments[index], ...updates };
  saveTournaments(tournaments);
  return tournaments[index];
}

export function deleteTournament(tournamentId, guildId) {
  const tournaments = loadTournaments();
  const filtered = tournaments.filter(
    (t) => !(t.id === tournamentId && t.guildId === guildId),
  );
  saveTournaments(filtered);
  return filtered.length < tournaments.length;
}
