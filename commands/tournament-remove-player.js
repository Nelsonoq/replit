import {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} from "discord.js";
import {
  loadTournaments,
  saveTournaments,
} from "../utils/tournament-manager.js";
// import { updateTournamentTab } from "../utils/google-sheets-manager.js";

export default {
  data: new SlashCommandBuilder()
    .setName("tournament-remove-player")
    .setDescription("Remove a player from a tournament")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((option) =>
      option
        .setName("tournament")
        .setDescription("Select tournament")
        .setRequired(true)
        .setAutocomplete(true),
    )
    .addUserOption((option) =>
      option
        .setName("player")
        .setDescription("Player to remove")
        .setRequired(true),
    ),

  async autocomplete(interaction) {
    const tournaments = loadTournaments();

    const guildTournaments = tournaments.filter(
      (t) =>
        t.guildId === interaction.guild.id && t.status === "registration_open",
    );

    const focusedValue = interaction.options.getFocused().toLowerCase();

    const filtered = guildTournaments
      .filter(
        (t) =>
          t.name.toLowerCase().includes(focusedValue) ||
          t.id.toLowerCase().includes(focusedValue),
      )
      .slice(0, 25);

    await interaction.respond(
      filtered.map((t) => ({
        name: `${t.name} (${t.players.length} players) - ${t.id}`,
        value: t.id,
      })),
    );
  },

  async execute(interaction, client) {
    if (
      !interaction.member.permissions.has(PermissionFlagsBits.Administrator)
    ) {
      return interaction.reply({
        content: "❌ You don't have permission to use this command!",
        flags: 64,
      });
    }

    const tournamentId = interaction.options.getString("tournament");
    const player = interaction.options.getUser("player");
    const tournaments = loadTournaments();

    const tournamentIndex = tournaments.findIndex(
      (t) => t.id === tournamentId && t.guildId === interaction.guild.id,
    );

    if (tournamentIndex === -1) {
      return interaction.reply({
        content: "❌ Tournament not found!",
        flags: 64,
      });
    }

    const tournament = tournaments[tournamentIndex];

    if (tournament.status !== "registration_open") {
      return interaction.reply({
        content: `❌ Cannot remove players - registration is closed for **${tournament.name}**!`,
        flags: 64,
      });
    }

    const playerIndex = tournament.players.findIndex(
      (p) => p.userId === player.id,
    );

    if (playerIndex === -1) {
      return interaction.reply({
        content: `❌ ${player} is not registered for **${tournament.name}**!`,
        flags: 64,
      });
    }

    tournament.players.splice(playerIndex, 1);
    tournaments[tournamentIndex] = tournament;
    saveTournaments(tournaments);

    // try {
    //   await updateTournamentTab(
    //     interaction.guild.id,
    //     interaction.guild.name,
    //     tournament,
    //   );
    // } catch (err) {
    //   console.error("❌ Error updating Google Sheet:", err);
    // }

    const embed = new EmbedBuilder()
      .setColor(0xff0000)
      .setDescription(
        `🗑️ ${player} has been removed from **${tournament.name}**.\n\n` +
          `**Players Remaining:** ${tournament.players.length}${tournament.maxPlayers ? `/${tournament.maxPlayers}` : ""}`,
      )
      .setFooter({
        text: `Removed by ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
