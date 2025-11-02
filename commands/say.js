import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("say")
    .setDescription("Makes the bot repeat a message")
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("The text for the bot to say")
        .setRequired(true)
    ),

  async execute(interaction, client) {
    const text = interaction.options.getString("message");

    // Envia a mensagem no canal
    await interaction.channel.send(text);

    // Responde e apaga após 3 segundos
    const reply = await interaction.reply({
      content: "✅ Message sent!",
      fetchReply: true,
    });

    setTimeout(() => {
      reply.delete().catch(() => {});
    }, 3000);
  },
};