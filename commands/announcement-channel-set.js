import {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ChannelType,
} from "discord.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.join(__dirname, "..", "data", "announcement-channels.json");

// Criar pasta data se não existir
const dataDir = path.join(__dirname, "..", "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Criar ficheiro se não existir
if (!fs.existsSync(dataPath)) {
  fs.writeFileSync(dataPath, JSON.stringify([], null, 2));
}

function loadChannels() {
  const data = fs.readFileSync(dataPath, "utf-8");
  return JSON.parse(data);
}

function saveChannels(channels) {
  fs.writeFileSync(dataPath, JSON.stringify(channels, null, 2));
}

export default {
  data: new SlashCommandBuilder()
    .setName("announcement-channel-set")
    .setDescription("Set the announcement channel")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The channel for birthday announcements")
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText)
    ),

  async execute(interaction, client) {
    // Verificar permissão
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({
        content: "❌ You don't have permission to use this command!",
        flags: 64,
      });
    }

    const channel = interaction.options.getChannel("channel");
    const channels = loadChannels();

    // Verificar se já existe configuração para esta guild
    const existingIndex = channels.findIndex(
      (c) => c.guildId === interaction.guild.id
    );

    if (existingIndex !== -1) {
      // Atualizar canal existente
      channels[existingIndex] = {
        guildId: interaction.guild.id,
        channelId: channel.id,
        updatedAt: new Date().toISOString(),
        updatedBy: interaction.user.id,
      };
    } else {
      // Adicionar novo
      channels.push({
        guildId: interaction.guild.id,
        channelId: channel.id,
        createdAt: new Date().toISOString(),
        createdBy: interaction.user.id,
      });
    }

    saveChannels(channels);

    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setDescription(
        `✅ Announcement channel set to ${channel}\n\nAll birthday announcements will now be sent to this channel.`
      )
      .setFooter({
        text: `Set by ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};