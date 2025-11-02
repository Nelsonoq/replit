// import {
//   SlashCommandBuilder,
//   EmbedBuilder,
//   PermissionFlagsBits,
//   ChannelType,
// } from "discord.js";
// import { removeVoiceRole } from "../utils/voice-role-manager.js";

// export default {
//   data: new SlashCommandBuilder()
//     .setName("voice-role-remove")
//     .setDescription("Remove auto-role from a voice channel")
//     .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
//     .addChannelOption((option) =>
//       option
//         .setName("channel")
//         .setDescription("Voice channel")
//         .setRequired(true)
//         .addChannelTypes(ChannelType.GuildVoice),
//     )
//     .addRoleOption((option) =>
//       option.setName("role").setDescription("Role to remove").setRequired(true),
//     ),

//   async execute(interaction, client) {
//     if (
//       !interaction.member.permissions.has(PermissionFlagsBits.Administrator)
//     ) {
//       return interaction.reply({
//         content: "❌ You don't have permission to use this command!",
//         flags: 64,
//       });
//     }

//     const channel = interaction.options.getChannel("channel");
//     const role = interaction.options.getRole("role");

//     const success = removeVoiceRole(interaction.guild.id, channel.id, role.id);

//     if (!success) {
//       return interaction.reply({
//         content: `❌ No auto-role found for ${channel} → ${role}`,
//         flags: 64,
//       });
//     }

//     const embed = new EmbedBuilder()
//       .setColor(0xff0000)
//       .setDescription(`🗑️ Removed auto-role: ${channel} → ${role}`)
//       .setFooter({
//         text: `Removed by ${interaction.user.tag}`,
//         iconURL: interaction.user.displayAvatarURL(),
//       })
//       .setTimestamp();

//     await interaction.reply({ embeds: [embed] });
//   },
// };
