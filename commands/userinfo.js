import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("Shows information about a user")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to view information about")
        .setRequired(false),
    ),

  async execute(interaction, client) {
    const user = interaction.options.getUser("user") || interaction.user;
    const member = interaction.guild.members.cache.get(user.id);

    const roles =
      member && member.roles.cache.size > 1
        ? member.roles.cache
            .filter((role) => role.id !== interaction.guild.id)
            .map((role) => role.toString())
            .join(", ")
        : "None";

    const embed = new EmbedBuilder()
      .setColor(0xff00ff)
      .setTitle("👤 User Information")
      .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
      .addFields(
        { name: "👤 Name", value: user.tag, inline: true },
        { name: "🆔 ID", value: user.id, inline: true },
        { name: "🤖 Bot", value: user.bot ? "Yes" : "No", inline: true },
        {
          name: "📅 Account Created",
          value: user.createdAt.toLocaleDateString("en-US"),
          inline: false,
        },
        {
          name: "📥 Joined Server",
          value: member
            ? member.joinedAt.toLocaleDateString("en-US")
            : "Not available",
          inline: false,
        },
        {
          name: "🎭 Roles",
          value: roles.length > 1024 ? "Too many roles to display" : roles,
          inline: false,
        },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
