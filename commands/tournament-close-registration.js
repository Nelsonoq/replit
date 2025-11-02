import {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} from "discord.js";
import {
  loadTournaments,
  saveTournaments,
} from "../utils/tournament-manager.js";
import { updateTournamentTab } from "../utils/google-sheets-manager.js";

export default {
  data: new SlashCommandBuilder()
    .setName("tournament-close-registration")
    .setDescription("Close registration for a tournament")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((option) =>
      option
        .setName("tournament")
        .setDescription("Select tournament")
        .setRequired(true)
        .setAutocomplete(true),
    ),

  async autocomplete(interaction) {
    const tournaments = loadTournaments();

    const openTournaments = tournaments.filter(
      (t) =>
        t.guildId === interaction.guild.id && t.status === "registration_open",
    );

    const focusedValue = interaction.options.getFocused().toLowerCase();

    const filtered = openTournaments
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
        content: `❌ Registration is already closed for **${tournament.name}**!`,
        flags: 64,
      });
    }

    if (tournament.players.length < 2) {
      return interaction.reply({
        content: `❌ Cannot close registration - need at least 2 players! Current: ${tournament.players.length}`,
        flags: 64,
      });
    }

    tournament.status = "registration_closed";
    tournaments[tournamentIndex] = tournament;
    saveTournaments(tournaments);

    // Atualizar Google Sheet
    try {
      await updateTournamentTab(
        interaction.guild.id,
        interaction.guild.name,
        tournament,
      );
    } catch (err) {
      console.error("❌ Error updating Google Sheet:", err);
    }

    const embed = new EmbedBuilder()
      .setColor(0xffa500)
      .setTitle(`🔒 Registration Closed: ${tournament.name}`)
      .setDescription(
        `Registration has been closed.\n\n` +
          `**Final Player Count:** ${tournament.players.length}\n` +
          `**Next Step:** Use \`/tournament-generate-bracket ${tournament.id}\` to create the bracket.`,
      )
      .setFooter({
        text: `Closed by ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
