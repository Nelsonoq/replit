// import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
// import {
//   getLeaderboard,
//   getRoleLeaderboard,
//   getUserXP,
//   calculateLevel,
//   getXPForNextLevel,
// } from "../utils/voice-xp-manager.js";

// export default {
//   data: new SlashCommandBuilder()
//     .setName("top")
//     .setDescription("View voice XP rankings")
//     .addMentionableOption((option) =>
//       option
//         .setName("target")
//         .setDescription("User or Role (leave empty for server top 10)")
//         .setRequired(false),
//     ),

//   async execute(interaction, client) {
//     const target = interaction.options.getMentionable("target");

//     // Caso 1: /top (sem nada) - Top 10 do servidor
//     if (!target) {
//       const leaderboard = getLeaderboard(interaction.guild.id, 10);

//       if (leaderboard.length === 0) {
//         return interaction.reply({
//           content: "📭 No voice activity recorded yet!",
//           flags: 64,
//         });
//       }

//       let description = "";

//       for (let i = 0; i < leaderboard.length; i++) {
//         const userData = leaderboard[i];
//         const member = await interaction.guild.members
//           .fetch(userData.userId)
//           .catch(() => null);

//         if (!member) continue;

//         const level = calculateLevel(userData.xp);
//         const rank = i + 1;

//         // Emoji de posição
//         const rankEmoji =
//           rank === 1
//             ? "🥇"
//             : rank === 2
//               ? "🥈"
//               : rank === 3
//                 ? "🥉"
//                 : `${rank}.`;

//         description += `${rankEmoji} ${member} • **Level ${level}** • ${userData.xp.toLocaleString()} XP\n`;
//       }

//       const embed = new EmbedBuilder()
//         .setColor(0xffd700)
//         .setTitle(`🏆 Top Voice XP - ${interaction.guild.name}`)
//         .setDescription(description || "No data available")
//         .setFooter({ text: `Showing top ${leaderboard.length} users` })
//         .setTimestamp();

//       return interaction.reply({ embeds: [embed] });
//     }

//     // Caso 2: /top @user - XP de um user específico
//     if (target.user) {
//       const userXP = getUserXP(interaction.guild.id, target.id);

//       if (userXP.xp === 0) {
//         return interaction.reply({
//           content: `${target} has no voice activity recorded yet!`,
//           flags: 64,
//         });
//       }

//       const level = calculateLevel(userXP.xp);
//       const nextLevelXP = getXPForNextLevel(level);
//       const currentLevelXP = level * level * 100;
//       const xpProgress = userXP.xp - currentLevelXP;
//       const xpNeeded = nextLevelXP - currentLevelXP;
//       const progressPercent = Math.floor((xpProgress / xpNeeded) * 100);

//       const hours = (userXP.timeInVoice / (1000 * 60 * 60)).toFixed(1);

//       // Barra de progresso
//       const barLength = 20;
//       const filledBars = Math.floor((progressPercent / 100) * barLength);
//       const emptyBars = barLength - filledBars;
//       const progressBar = "█".repeat(filledBars) + "░".repeat(emptyBars);

//       // Calcular posição no leaderboard
//       const allUsers = getLeaderboard(interaction.guild.id, 1000);
//       const userRank = allUsers.findIndex((u) => u.userId === target.id) + 1;

//       const embed = new EmbedBuilder()
//         .setColor(0x5865f2)
//         .setAuthor({
//           name: target.user.username,
//           iconURL: target.user.displayAvatarURL(),
//         })
//         .setDescription(
//           `**Level ${level}** • ${userXP.xp.toLocaleString()} XP\n` +
//             `Rank: **#${userRank}**\n\n` +
//             `${progressBar} ${progressPercent}%\n` +
//             `${xpProgress.toLocaleString()} / ${xpNeeded.toLocaleString()} XP to Level ${level + 1}\n\n` +
//             `⏱️ **${hours}h** in voice channels`,
//         )
//         .setThumbnail(target.user.displayAvatarURL({ size: 128 }))
//         .setTimestamp();

//       return interaction.reply({ embeds: [embed] });
//     }

//     // Caso 3: /top @role - Top users de uma role específica
//     if (target.members) {
//       await interaction.deferReply();

//       // Fetch todos os membros
//       await interaction.guild.members.fetch();

//       const roleLeaderboard = getRoleLeaderboard(
//         interaction.guild.id,
//         target.id,
//         interaction.guild.members.cache,
//         10,
//       );

//       if (roleLeaderboard.length === 0) {
//         return interaction.editReply({
//           content: `📭 No voice activity recorded for users with ${target}!`,
//         });
//       }

//       let description = "";

//       for (let i = 0; i < roleLeaderboard.length; i++) {
//         const userData = roleLeaderboard[i];
//         const member = await interaction.guild.members
//           .fetch(userData.userId)
//           .catch(() => null);

//         if (!member) continue;

//         const level = calculateLevel(userData.xp);
//         const rank = i + 1;

//         const rankEmoji =
//           rank === 1
//             ? "🥇"
//             : rank === 2
//               ? "🥈"
//               : rank === 3
//                 ? "🥉"
//                 : `${rank}.`;

//         description += `${rankEmoji} ${member} • **Level ${level}** • ${userData.xp.toLocaleString()} XP\n`;
//       }

//       const embed = new EmbedBuilder()
//         .setColor(target.color || 0x5865f2)
//         .setTitle(`🏆 Top Voice XP - ${target.name}`)
//         .setDescription(description || "No data available")
//         .setFooter({
//           text: `Showing top ${roleLeaderboard.length} users with this role`,
//         })
//         .setTimestamp();

//       return interaction.editReply({ embeds: [embed] });
//     }

//     // Caso não seja nem user nem role
//     return interaction.reply({
//       content: "❌ Invalid target! Please mention a user or role.",
//       flags: 64,
//     });
//   },
// };
