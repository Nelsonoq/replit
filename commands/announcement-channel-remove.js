import {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} from "discord.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.join(__dirname, "..", "data", "announcement-channels.json");

function loadChannels() {
  if (!fs.existsSync(dataPath)) return [];
  const data = fs.readFileSync(dataPath, "utf-8");
  return JSON.parse(data);
}

function saveChannels(channels) {
  fs.writeFileSync(dataPath, JSON.stringify(channels, null, 2));
}

export default {
  data: new SlashCommandBuilder()
    .setName("announcement-channel-remove")
    .setDescription("Remove the configured announcement channel")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction, client) {
    // Verificar permissão
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({
        content: "❌ You don't have permission to use this command!",
        flags: 64,
      });
    }

    const channels = loadChannels();

    const index = channels.findIndex(
      (c) => c.guildId === interaction.guild.id
    );

    if (index === -1) {
      return interaction.reply({
        content: "❌ No announcement channel is configured for this server!",
        flags: 64,
      });
    }

    const removedChannelId = channels[index].channelId;
    channels.splice(index, 1);
    saveChannels(channels);

    const embed = new EmbedBuilder()
      .setColor(0xff0000)
      .setDescription(
        `🗑️ Announcement channel <#${removedChannelId}> has been removed.\n\nBirthday announcements will now be sent to the channel where the birthday was set up.`
      )
      .setFooter({
        text: `Removed by ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};