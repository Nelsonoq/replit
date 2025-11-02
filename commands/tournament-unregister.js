// import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
// import {
//   loadTournaments,
//   saveTournaments,
// } from "../utils/tournament-manager.js";
// // import { updateTournamentTab } from "../utils/google-sheets-manager.js";

// export default {
//   data: new SlashCommandBuilder()
//     .setName("tournament-unregister")
//     .setDescription("Unregister from a tournament")
//     .addStringOption((option) =>
//       option
//         .setName("tournament")
//         .setDescription("Select tournament")
//         .setRequired(true)
//         .setAutocomplete(true),
//     ),

//   async autocomplete(interaction) {
//     const tournaments = loadTournaments();

//     const myTournaments = tournaments.filter(
//       (t) =>
//         t.guildId === interaction.guild.id &&
//         t.status === "registration_open" &&
//         t.players.some((p) => p.userId === interaction.user.id),
//     );

//     const focusedValue = interaction.options.getFocused().toLowerCase();

//     const filtered = myTournaments
//       .filter(
//         (t) =>
//           t.name.toLowerCase().includes(focusedValue) ||
//           t.id.toLowerCase().includes(focusedValue),
//       )
//       .slice(0, 25);

//     await interaction.respond(
//       filtered.map((t) => ({
//         name: `${t.name} - ${t.id}`,
//         value: t.id,
//       })),
//     );
//   },

//   async execute(interaction, client) {
//     const tournamentId = interaction.options.getString("tournament");
//     const tournaments = loadTournaments();

//     const tournamentIndex = tournaments.findIndex(
//       (t) => t.id === tournamentId && t.guildId === interaction.guild.id,
//     );

//     if (tournamentIndex === -1) {
//       return interaction.reply({
//         content: "❌ Tournament not found!",
//         flags: 64,
//       });
//     }

//     const tournament = tournaments[tournamentIndex];

//     const playerIndex = tournament.players.findIndex(
//       (p) => p.userId === interaction.user.id,
//     );

//     if (playerIndex === -1) {
//       return interaction.reply({
//         content: `❌ You're not registered for **${tournament.name}**!`,
//         flags: 64,
//       });
//     }

//     if (tournament.status !== "registration_open") {
//       return interaction.reply({
//         content: `❌ Cannot unregister from **${tournament.name}** - registration is closed!`,
//         flags: 64,
//       });
//     }

//     tournament.players.splice(playerIndex, 1);
//     tournaments[tournamentIndex] = tournament;
//     saveTournaments(tournaments);

//     // Atualizar Google Sheet
//     // try {
//     //   await updateTournamentTab(
//     //     interaction.guild.id,
//     //     interaction.guild.name,
//     //     tournament,
//     //   );
//     // } catch (err) {
//     //   console.error("❌ Error updating Google Sheet:", err);
//     // }

//     const embed = new EmbedBuilder()
//       .setColor(0xff0000)
//       .setDescription(
//         `🗑️ You've been unregistered from **${tournament.name}**.\n\n` +
//           `**Players Remaining:** ${tournament.players.length}${tournament.maxPlayers ? `/${tournament.maxPlayers}` : ""}`,
//       )
//       .setTimestamp();

//     await interaction.reply({ embeds: [embed] });
//   },
// };
