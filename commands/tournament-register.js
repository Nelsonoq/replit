import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import {
  loadTournaments,
  saveTournaments,
} from "../utils/tournament-manager.js";
import { updateTournamentTab } from "../utils/google-sheets-manager.js";

export default {
  data: new SlashCommandBuilder()
    .setName("tournament-register")
    .setDescription("Register for a tournament")
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
        name: `${t.name} (${t.players.length}${t.maxPlayers ? `/${t.maxPlayers}` : ""} players) - ${t.id}`,
        value: t.id,
      })),
    );
  },

  async execute(interaction, client) {
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
        content: `❌ Registration is closed for **${tournament.name}**!`,
        flags: 64,
      });
    }

    if (tournament.players.some((p) => p.userId === interaction.user.id)) {
      return interaction.reply({
        content: `❌ You're already registered for **${tournament.name}**!`,
        flags: 64,
      });
    }

    if (
      tournament.maxPlayers &&
      tournament.players.length >= tournament.maxPlayers
    ) {
      return interaction.reply({
        content: `❌ **${tournament.name}** is full! (${tournament.maxPlayers}/${tournament.maxPlayers} players)`,
        flags: 64,
      });
    }

    tournament.players.push({
      userId: interaction.user.id,
      username: interaction.user.username,
      registeredAt: new Date().toISOString(),
    });

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
      .setColor(0x00ff00)
      .setTitle(`✅ Registration Successful!`)
      .setDescription(
        `You've been registered for **${tournament.name}**!\n\n` +
          `**Players Registered:** ${tournament.players.length}${tournament.maxPlayers ? `/${tournament.maxPlayers}` : ""}\n` +
          `**Tournament ID:** \`${tournament.id}\``,
      )
      .setThumbnail(interaction.user.displayAvatarURL())
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
