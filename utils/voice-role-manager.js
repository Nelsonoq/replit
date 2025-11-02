import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.join(__dirname, "..", "data", "voice-roles.json");

// Criar pasta data se não existir
const dataDir = path.join(__dirname, "..", "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Criar ficheiro se não existir
if (!fs.existsSync(dataPath)) {
  fs.writeFileSync(dataPath, JSON.stringify([], null, 2));
}

export function loadVoiceRoles() {
  try {
    const data = fs.readFileSync(dataPath, "utf-8");
    if (!data || data.trim() === "") {
      return [];
    }
    return JSON.parse(data);
  } catch (err) {
    console.error("❌ Error loading voice-roles.json:", err);
    return [];
  }
}

export function saveVoiceRoles(data) {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("❌ Error saving voice-roles.json:", err);
  }
}

export function addVoiceRole(guildId, channelId, roleId) {
  const data = loadVoiceRoles();

  // Verificar se já existe
  const existing = data.find(
    (vr) =>
      vr.guildId === guildId &&
      vr.channelId === channelId &&
      vr.roleId === roleId,
  );

  if (existing) {
    return false;
  }

  data.push({
    guildId,
    channelId,
    roleId,
    createdAt: new Date().toISOString(),
  });

  saveVoiceRoles(data);
  return true;
}

export function removeVoiceRole(guildId, channelId, roleId) {
  const data = loadVoiceRoles();
  const filtered = data.filter(
    (vr) =>
      !(
        vr.guildId === guildId &&
        vr.channelId === channelId &&
        vr.roleId === roleId
      ),
  );

  if (filtered.length === data.length) {
    return false; // Não encontrou
  }

  saveVoiceRoles(filtered);
  return true;
}

export function getVoiceRoles(guildId) {
  const data = loadVoiceRoles();
  return data.filter((vr) => vr.guildId === guildId);
}

export function getRolesForChannel(guildId, channelId) {
  const data = loadVoiceRoles();
  return data
    .filter((vr) => vr.guildId === guildId && vr.channelId === channelId)
    .map((vr) => vr.roleId);
}
