import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("serverinfo")
    .setDescription("Shows information about the server"),

  async execute(interaction, client) {
    const guild = interaction.guild;

    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle("📊 Server Information")
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .addFields(
        { name: "🏷️ Name", value: guild.name, inline: true },
        { name: "🆔 ID", value: guild.id, inline: true },
        { name: "👑 Owner", value: `<@${guild.ownerId}>`, inline: true },
        {
          name: "👥 Members",
          value: guild.memberCount.toString(),
          inline: true,
        },
        {
          name: "📅 Created",
          value: guild.createdAt.toLocaleDateString("en-US"),
          inline: true,
        },
        {
          name: "🎭 Roles",
          value: guild.roles.cache.size.toString(),
          inline: true,
        },
        {
          name: "💬 Channels",
          value: guild.channels.cache.size.toString(),
          inline: true,
        },
        {
          name: "😀 Emojis",
          value: guild.emojis.cache.size.toString(),
          inline: true,
        },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
