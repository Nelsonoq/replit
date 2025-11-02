import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.join(__dirname, "..", "data", "voice-xp.json");

// Criar pasta data se não existir
const dataDir = path.join(__dirname, "..", "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Criar ficheiro se não existir
if (!fs.existsSync(dataPath)) {
  fs.writeFileSync(dataPath, JSON.stringify([], null, 2));
}

export function loadVoiceXP() {
  try {
    const data = fs.readFileSync(dataPath, "utf-8");
    if (!data || data.trim() === "") {
      return [];
    }
    return JSON.parse(data);
  } catch (err) {
    console.error("❌ Error loading voice-xp.json:", err);
    return [];
  }
}

export function saveVoiceXP(data) {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("❌ Error saving voice-xp.json:", err);
  }
}

export function getUserXP(guildId, userId) {
  const data = loadVoiceXP();
  const user = data.find((u) => u.guildId === guildId && u.userId === userId);
  return user || { guildId, userId, xp: 0, timeInVoice: 0, lastJoin: null };
}

export function addXP(guildId, userId, xpAmount, timeAmount) {
  const data = loadVoiceXP();
  const index = data.findIndex(
    (u) => u.guildId === guildId && u.userId === userId,
  );

  if (index !== -1) {
    data[index].xp += xpAmount;
    data[index].timeInVoice += timeAmount;
  } else {
    data.push({
      guildId,
      userId,
      xp: xpAmount,
      timeInVoice: timeAmount,
      lastJoin: null,
    });
  }

  saveVoiceXP(data);
}

export function getLeaderboard(guildId, limit = 10) {
  const data = loadVoiceXP();
  return data
    .filter((u) => u.guildId === guildId)
    .sort((a, b) => b.xp - a.xp)
    .slice(0, limit);
}

export function getRoleLeaderboard(guildId, roleId, members, limit = 10) {
  const data = loadVoiceXP();
  const usersWithRole = members
    .filter((m) => m.roles.cache.has(roleId))
    .map((m) => m.user.id);

  return data
    .filter((u) => u.guildId === guildId && usersWithRole.includes(u.userId))
    .sort((a, b) => b.xp - a.xp)
    .slice(0, limit);
}

export function calculateLevel(xp) {
  // 100 XP = Level 1, 300 XP = Level 2, 600 XP = Level 3, etc.
  return Math.floor(Math.sqrt(xp / 100));
}

export function getXPForNextLevel(level) {
  return (level + 1) * (level + 1) * 100;
}
