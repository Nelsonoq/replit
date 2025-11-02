// import {
//   SlashCommandBuilder,
//   EmbedBuilder,
//   PermissionFlagsBits,
//   ChannelType,
// } from "discord.js";
// import { addVoiceRole } from "../utils/voice-role-manager.js";

// export default {
//   data: new SlashCommandBuilder()
//     .setName("voice-role-add")
//     .setDescription("Add auto-role for a voice channel")
//     .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
//     .addChannelOption((option) =>
//       option
//         .setName("channel")
//         .setDescription("Voice channel")
//         .setRequired(true)
//         .addChannelTypes(ChannelType.GuildVoice),
//     )
//     .addRoleOption((option) =>
//       option
//         .setName("role")
//         .setDescription("Role to give when user joins")
//         .setRequired(true),
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

//     // Verificar se o bot pode dar a role
//     const botMember = await interaction.guild.members.fetchMe();
//     if (role.position >= botMember.roles.highest.position) {
//       return interaction.reply({
//         content: `❌ I can't manage ${role} because it's higher than or equal to my highest role!`,
//         flags: 64,
//       });
//     }

//     const success = addVoiceRole(interaction.guild.id, channel.id, role.id);

//     if (!success) {
//       return interaction.reply({
//         content: `❌ Auto-role already exists for ${channel} → ${role}`,
//         flags: 64,
//       });
//     }

//     const embed = new EmbedBuilder()
//       .setColor(0x00ff00)
//       .setTitle("✅ Voice Auto-Role Added")
//       .setDescription(
//         `Users who join ${channel} will automatically receive ${role}.\n\n` +
//           `The role will be removed when they leave the channel.`,
//       )
//       .setFooter({
//         text: `Added by ${interaction.user.tag}`,
//         iconURL: interaction.user.displayAvatarURL(),
//       })
//       .setTimestamp();

//     await interaction.reply({ embeds: [embed] });
//   },
// };
