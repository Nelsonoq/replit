// import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
// import { loadTournaments } from "../utils/tournament-manager.js";

// export default {
//   data: new SlashCommandBuilder()
//     .setName("tournament-view")
//     .setDescription("View tournament details")
//     .addStringOption((option) =>
//       option
//         .setName("tournament")
//         .setDescription("Select tournament")
//         .setRequired(true)
//         .setAutocomplete(true),
//     ),

//   async autocomplete(interaction) {
//     const tournaments = loadTournaments();

//     const guildTournaments = tournaments.filter(
//       (t) => t.guildId === interaction.guild.id,
//     );

//     const focusedValue = interaction.options.getFocused().toLowerCase();

//     const filtered = guildTournaments
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

//     const tournament = tournaments.find(
//       (t) => t.id === tournamentId && t.guildId === interaction.guild.id,
//     );

//     if (!tournament) {
//       return interaction.reply({
//         content: "❌ Tournament not found!",
//         flags: 64,
//       });
//     }

//     const typeNames = {
//       single_elimination: "Single Elimination",
//       double_elimination: "Double Elimination",
//       round_robin: "Round Robin",
//       swiss: "Swiss",
//     };

//     const statusNames = {
//       registration_open: "🟢 Registration Open",
//       registration_closed: "🟡 Registration Closed",
//       in_progress: "🔵 In Progress",
//       completed: "⚫ Completed",
//     };

//     let playersList = "";
//     if (tournament.players.length > 0) {
//       tournament.players.forEach((p, i) => {
//         playersList += `${i + 1}. <@${p.userId}>\n`;
//       });
//     } else {
//       playersList = "No players registered yet";
//     }

//     const embed = new EmbedBuilder()
//       .setColor(0x5865f2)
//       .setTitle(`🏆 ${tournament.name}`)
//       .setDescription(tournament.description)
//       .addFields(
//         {
//           name: "🆔 Tournament ID",
//           value: `\`${tournament.id}\``,
//           inline: true,
//         },
//         { name: "🎮 Type", value: typeNames[tournament.type], inline: true },
//         {
//           name: "📊 Status",
//           value: statusNames[tournament.status],
//           inline: true,
//         },
//         {
//           name: "👥 Players",
//           value: `${tournament.players.length}${tournament.maxPlayers ? `/${tournament.maxPlayers}` : ""}`,
//           inline: true,
//         },
//         {
//           name: "📅 Created",
//           value: new Date(tournament.createdAt).toLocaleDateString("en-GB"),
//           inline: true,
//         },
//         {
//           name: "👤 Created By",
//           value: `<@${tournament.createdBy}>`,
//           inline: true,
//         },
//         {
//           name: "📋 Registered Players",
//           value: playersList.substring(0, 1024),
//           inline: false,
//         },
//       )
//       .setTimestamp();

//     await interaction.reply({ embeds: [embed] });
//   },
// };
