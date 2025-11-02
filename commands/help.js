import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Shows the list of available commands"),

  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle("📚 Command List")
      .setDescription("Use `/` to execute the commands below:")
      .addFields(
        {
          name: "/ping",
          value: "Check the bot's latency",
          inline: false,
        },
        {
          name: "/help",
          value: "Shows this help message",
          inline: false,
        },
        {
          name: "/serverinfo",
          value: "Shows information about the server",
          inline: false,
        },
        {
          name: "/userinfo [user]",
          value: "Shows information about a user",
          inline: false,
        },
        {
          name: "/say <message>",
          value: "Makes the bot repeat a message",
          inline: false,
        },
        {
          name: "/set-birthday",
          value: "Set up your birthday on the server",
          inline: false,
        },
        {
          name: "/remove-birthday",
          value: "Remove your birthday from the server",
          inline: false,
        },
        {
          name: "/list-birthdays",
          value: "List all birthdays on the server",
          inline: false,
        },
      )
      .setTimestamp()
      .setFooter({
        text: `Requested by ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL(),
      });

    await interaction.reply({ embeds: [embed] });
  },
};
