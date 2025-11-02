import "dotenv/config";
import {
  Client,
  GatewayIntentBits,
  Collection,
  REST,
  Routes,
} from "discord.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize bot
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates, // ✅ Para Voice System
  ],
});
client.commands = new Collection();

// Load commands from /commands folder
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((f) => f.endsWith(".js"));

const commands = [];

console.log("📂 Loading commands...");
for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const commandModule = await import(`file://${filePath}`);
  const command = commandModule.default;

  if (!command?.data) {
    console.log(`⚠️ Ignoring ${file} (no SlashCommandBuilder)`);
    continue;
  }

  client.commands.set(command.data.name, command);
  commands.push(command.data.toJSON());
  console.log(`✅ Command loaded: ${command.data.name}`);
}

// Register commands
const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

try {
  console.log("\n⏳ Clearing old commands...");

  // Clear global commands
  await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
    body: [],
  });

  // Clear guild commands
  if (process.env.GUILD_ID) {
    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID,
      ),
      { body: [] },
    );
    console.log("✅ Old commands cleared!");
  }

  // Wait 2 seconds
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Register commands to GUILD (instant) or GLOBALLY
  if (process.env.GUILD_ID) {
    console.log("\n⏳ Registering guild commands (instant)...");
    const data = await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID,
      ),
      { body: commands },
    );
    console.log(
      `✅ ${data.length} commands registered to guild successfully! (available NOW)`,
    );
  } else {
    console.log("\n⏳ Registering global commands...");
    const data = await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands },
    );
    console.log(`✅ ${data.length} global commands registered!`);
    console.log("⚠️ Note: Global commands may take up to 1 hour to appear.\n");
  }
} catch (err) {
  console.error("❌ Error registering commands:", err);
}

// Event when bot comes online
client.once("clientReady", async () => {
  console.log(`\n🤖 ${client.user.tag} is online!`);
  console.log(`📊 ${client.commands.size} commands loaded`);
  console.log(`🌐 Present in ${client.guilds.cache.size} server(s)\n`);

  // Verify registered commands (diagnostic)
  if (process.env.GUILD_ID) {
    try {
      const guildCommands = await rest.get(
        Routes.applicationGuildCommands(
          process.env.CLIENT_ID,
          process.env.GUILD_ID,
        ),
      );
      console.log(`🔍 Guild commands: ${guildCommands.length}`);
      guildCommands.forEach((cmd) => console.log(`   /${cmd.name}`));
      console.log("");
    } catch (err) {
      console.error("❌ Error verifying commands:", err);
    }
  }
});

// Execute slash commands
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) {
    console.log(`⚠️ Command not found: ${interaction.commandName}`);
    return;
  }

  try {
    console.log(
      `🔧 Executing /${interaction.commandName} - by ${interaction.user.tag}`,
    );
    await command.execute(interaction, client);
  } catch (err) {
    console.error(`❌ Error executing /${interaction.commandName}:`, err);

    const errorMessage = {
      content: "❌ An error occurred while executing this command!",
      flags: 64,
    };

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(errorMessage);
    } else {
      await interaction.reply(errorMessage);
    }
  }
});

// Handler para autocomplete
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isAutocomplete()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command || !command.autocomplete) return;

  try {
    await command.autocomplete(interaction);
  } catch (err) {
    console.error(
      `❌ Error in autocomplete for ${interaction.commandName}:`,
      err,
    );
  }
});

// ===== SISTEMA DE XP POR VOICE CHANNEL =====
import { addXP } from "./utils/voice-xp-manager.js";

// Tracking de users em voice channels
const voiceTracker = new Map(); // userId -> { joinTime, guildId }

// ===== SISTEMA DE AUTO-ROLE POR VOICE CHANNEL =====
import { getRolesForChannel } from "./utils/voice-role-manager.js";

// Event handler para Voice State Updates
client.on("voiceStateUpdate", async (oldState, newState) => {
  const member = newState.member;
  const userId = member.user.id;
  const guildId = newState.guild.id;

  // ===== User entrou num voice channel =====
  if (!oldState.channelId && newState.channelId) {
    // XP System: Iniciar tracking
    voiceTracker.set(userId, {
      joinTime: Date.now(),
      guildId: guildId,
    });
    console.log(
      `🎤 ${member.user.tag} joined voice channel: ${newState.channel.name}`,
    );

    // Auto-Role System: Adicionar roles
    const roles = getRolesForChannel(guildId, newState.channelId);
    for (const roleId of roles) {
      try {
        await member.roles.add(roleId);
        console.log(
          `✅ Added role ${roleId} to ${member.user.tag} (joined ${newState.channel.name})`,
        );
      } catch (err) {
        console.error(`❌ Error adding role ${roleId}:`, err);
      }
    }
  }

  // ===== User saiu de um voice channel =====
  if (oldState.channelId && !newState.channelId) {
    // XP System: Calcular e dar XP
    const tracker = voiceTracker.get(userId);
    if (tracker) {
      const timeInVoice = Date.now() - tracker.joinTime;
      const minutesInVoice = Math.floor(timeInVoice / 60000);
      const xpEarned = minutesInVoice * 10; // 10 XP por minuto

      if (xpEarned > 0) {
        addXP(guildId, userId, xpEarned, timeInVoice);
        console.log(
          `✅ ${member.user.tag} earned ${xpEarned} XP (${minutesInVoice} minutes in voice)`,
        );
      }

      voiceTracker.delete(userId);
    }

    // Auto-Role System: Remover roles
    const roles = getRolesForChannel(guildId, oldState.channelId);
    for (const roleId of roles) {
      try {
        await member.roles.remove(roleId);
        console.log(
          `🗑️ Removed role ${roleId} from ${member.user.tag} (left ${oldState.channel.name})`,
        );
      } catch (err) {
        console.error(`❌ Error removing role ${roleId}:`, err);
      }
    }
  }

  // ===== User mudou de voice channel =====
  if (
    oldState.channelId &&
    newState.channelId &&
    oldState.channelId !== newState.channelId
  ) {
    console.log(
      `🔄 ${member.user.tag} moved from ${oldState.channel.name} to ${newState.channel.name}`,
    );

    // XP System: Manter o tracking (não reseta o tempo)
    // O tempo continua a contar desde que entrou no primeiro canal

    // Auto-Role System: Trocar roles
    // Remover roles do canal antigo
    const oldRoles = getRolesForChannel(guildId, oldState.channelId);
    for (const roleId of oldRoles) {
      try {
        await member.roles.remove(roleId);
        console.log(`🗑️ Removed role ${roleId} from ${member.user.tag}`);
      } catch (err) {
        console.error(`❌ Error removing role ${roleId}:`, err);
      }
    }

    // Adicionar roles do novo canal
    const newRoles = getRolesForChannel(guildId, newState.channelId);
    for (const roleId of newRoles) {
      try {
        await member.roles.add(roleId);
        console.log(`✅ Added role ${roleId} to ${member.user.tag}`);
      } catch (err) {
        console.error(`❌ Error adding role ${roleId}:`, err);
      }
    }
  }
});

// Guardar XP de users ainda em voice quando o bot desliga
process.on("SIGINT", () => {
  console.log("\n🔴 Bot shutting down...");

  // Processar users ainda em voice
  voiceTracker.forEach((tracker, userId) => {
    const timeInVoice = Date.now() - tracker.joinTime;
    const minutesInVoice = Math.floor(timeInVoice / 60000);
    const xpEarned = minutesInVoice * 10;

    if (xpEarned > 0) {
      addXP(tracker.guildId, userId, xpEarned, timeInVoice);
      console.log(`💾 Saved ${xpEarned} XP for user ${userId}`);
    }
  });

  console.log("✅ All voice XP saved!");
  process.exit(0);
});

// ===== SISTEMA DE ANIVERSÁRIOS =====
import { EmbedBuilder } from "discord.js";

// Function to check birthdays
async function checkBirthdays(client) {
  try {
    const dataPath = path.join(__dirname, "data", "birthdays.json");
    if (!fs.existsSync(dataPath)) return;

    const birthdays = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

    // Store IDs already notified today (to avoid duplicates)
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const notifiedPath = path.join(__dirname, "data", "notified.json");

    let notifiedToday = {};
    if (fs.existsSync(notifiedPath)) {
      notifiedToday = JSON.parse(fs.readFileSync(notifiedPath, "utf-8"));

      // Clear notifications from previous days
      if (notifiedToday.date !== today) {
        notifiedToday = { date: today, users: [] };
      }
    } else {
      notifiedToday = { date: today, users: [] };
    }

    for (const bday of birthdays) {
      try {
        // Create unique key for this birthday
        const uniqueKey = `${bday.guildId}-${bday.userId}`;

        // If already notified today, skip
        if (notifiedToday.users.includes(uniqueKey)) {
          continue;
        }

        // Convert to birthday timezone
        const dateInTimezone = new Date(
          new Date().toLocaleString("en-US", { timeZone: bday.timezone }),
        );

        const currentDay = dateInTimezone.getDate();
        const currentMonth = dateInTimezone.getMonth() + 1;
        const currentHour = dateInTimezone.getHours();

        // Check if it's the birthday and if it's between 00:00 and 00:59
        if (
          bday.day === currentDay &&
          bday.month === currentMonth &&
          currentHour === 0
        ) {
          // Verificar se existe canal de anúncios configurado
          const announcementChannelsPath = path.join(
            __dirname,
            "data",
            "announcement-channels.json",
          );
          let channel;

          if (fs.existsSync(announcementChannelsPath)) {
            const announcementChannels = JSON.parse(
              fs.readFileSync(announcementChannelsPath, "utf-8"),
            );
            const announcementConfig = announcementChannels.find(
              (ac) => ac.guildId === bday.guildId,
            );

            if (announcementConfig) {
              channel = await client.channels.fetch(
                announcementConfig.channelId,
              );
            }
          }

          if (!channel) {
            channel = await client.channels.fetch(bday.channelId);
          }

          if (!channel) continue;

          const guild = await client.guilds.fetch(bday.guildId);
          const member = await guild.members.fetch(bday.userId);

          // Embed com imagem de aniversário
          const embed = new EmbedBuilder()
            .setColor(0xff69b4)
            .setTitle("🎂 Member Birthday")
            .setDescription(
              bday.ping
                ? `Happy birthday ${member}! 🎂🎉`
                : `Happy birthday **${member.user.username}**! 🎂🎉`,
            )
            .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
            .setImage("https://i.imgur.com/AfFp7pu.png")
            .setTimestamp();

          await channel.send({ embeds: [embed] });

          // Marca como notificado
          notifiedToday.users.push(uniqueKey);
          fs.writeFileSync(
            notifiedPath,
            JSON.stringify(notifiedToday, null, 2),
          );

          console.log(
            `🎂 Birthday sent for ${bday.userId} at ${currentHour}:${String(dateInTimezone.getMinutes()).padStart(2, "0")} (${bday.timezone})`,
          );
        }
      } catch (err) {
        console.error(`❌ Error processing birthday for ${bday.userId}:`, err);
      }
    }
  } catch (err) {
    console.error("❌ Error checking birthdays:", err);
  }
}

// Birthday verification system - checks every hour
setInterval(
  () => {
    checkBirthdays(client);
  },
  60 * 60 * 1000,
); // 1 hour

// Check 1 minute after starting
setTimeout(() => {
  checkBirthdays(client);
}, 60 * 1000);

// Web server to keep Replit alive
const app = express();
app.get("/", (req, res) => {
  res.send("🤖 Discord Bot Online! 🚀");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 Web server active on port ${PORT}`);
});

// Login
client.login(process.env.DISCORD_TOKEN);
