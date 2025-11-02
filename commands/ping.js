import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Check the bot's latency"),

  async execute(interaction, client) {
    const sent = await interaction.reply({
      content: "🏓 Calculating...",
      fetchReply: true,
    });

    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    const apiLatency = Math.round(client.ws.ping);

    await interaction.editReply(
      `🏓 Pong!\n📡 Latency: **${latency}ms**\n💓 API: **${apiLatency}ms**`,
    );
  },
};
