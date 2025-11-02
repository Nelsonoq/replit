import {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} from "discord.js";
import { loadTournaments } from "../utils/tournament-manager.js";

export default {
  data: new SlashCommandBuilder()
    .setName("tournament-list")
    .setDescription("List all tournaments on this server")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction, client) {
    if (
      !interaction.member.permissions.has(PermissionFlagsBits.Administrator)
    ) {
      return interaction.reply({
        content: "❌ You don't have permission to use this command!",
        flags: 64,
      });
    }

    const tournaments = loadTournaments().filter(
      (t) => t.guildId === interaction.guild.id,
    );

    if (tournaments.length === 0) {
      return interaction.reply({
        content: "📭 No tournaments found on this server!",
        flags: 64,
      });
    }

    const statusIcons = {
      registration_open: "🟢",
      registration_closed: "🟡",
      in_progress: "🔵",
      completed: "⚫",
    };

    const typeNames = {
      single_elimination: "Single Elim",
      double_elimination: "Double Elim",
      round_robin: "Round Robin",
      swiss: "Swiss",
    };

    const active = tournaments.filter((t) => t.status !== "completed");
    const completed = tournaments.filter((t) => t.status === "completed");

    let description = "";

    if (active.length > 0) {
      description += "**🔴 Active Tournaments**\n";
      active.forEach((t) => {
        description += `${statusIcons[t.status]} **${t.name}**\n`;
        description += `  ├ ID: \`${t.id}\` | Type: ${typeNames[t.type]}\n`;
        description += `  └ Players: ${t.players.length}${t.maxPlayers ? `/${t.maxPlayers}` : ""}\n\n`;
      });
    }

    if (completed.length > 0) {
      description += "\n**⚫ Completed Tournaments**\n";
      completed.forEach((t) => {
        description += `⚫ **${t.name}** - \`${t.id}\` (${t.players.length} players)\n`;
      });
    }

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(`🏆 Tournaments - ${interaction.guild.name}`)
      .setDescription(description.substring(0, 4000))
      .setFooter({ text: `Total: ${tournaments.length} tournament(s)` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
