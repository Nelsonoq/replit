// import {
//   SlashCommandBuilder,
//   EmbedBuilder,
//   PermissionFlagsBits,
// } from "discord.js";
// import { getVoiceRoles } from "../utils/voice-role-manager.js";

// export default {
//   data: new SlashCommandBuilder()
//     .setName("voice-role-list")
//     .setDescription("List all voice channel auto-roles")
//     .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

//   async execute(interaction, client) {
//     if (
//       !interaction.member.permissions.has(PermissionFlagsBits.Administrator)
//     ) {
//       return interaction.reply({
//         content: "❌ You don't have permission to use this command!",
//         flags: 64,
//       });
//     }

//     const voiceRoles = getVoiceRoles(interaction.guild.id);

//     if (voiceRoles.length === 0) {
//       return interaction.reply({
//         content: "📭 No voice auto-roles configured on this server!",
//         flags: 64,
//       });
//     }

//     let description = "";

//     for (const vr of voiceRoles) {
//       const channel = interaction.guild.channels.cache.get(vr.channelId);
//       const role = interaction.guild.roles.cache.get(vr.roleId);

//       const channelName = channel
//         ? channel.name
//         : `Unknown Channel (${vr.channelId})`;
//       const roleName = role ? role.toString() : `Unknown Role (${vr.roleId})`;

//       description += `🎤 **${channelName}** → ${roleName}\n`;
//     }

//     const embed = new EmbedBuilder()
//       .setColor(0x5865f2)
//       .setTitle(`🎭 Voice Auto-Roles - ${interaction.guild.name}`)
//       .setDescription(description)
//       .setFooter({ text: `Total: ${voiceRoles.length} auto-role(s)` })
//       .setTimestamp();

//     await interaction.reply({ embeds: [embed] });
//   },
// };
