const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  name: 'ping',
  description: 'Verifica a latência do bot',
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Verifica a latência do bot'),
  async execute(interaction, args, client) {
    const isSlash = interaction.isCommand?.();
    
    if (isSlash) {
      const sent = await interaction.reply({ content: '🏓 Calculando...', fetchReply: true });
      const latency = sent.createdTimestamp - interaction.createdTimestamp;
      const apiLatency = Math.round(client.ws.ping);
      
      await interaction.editReply(`🏓 Pong!\n📡 Latência: ${latency}ms\n💓 API: ${apiLatency}ms`);
    } else {
      const sent = await interaction.reply('🏓 Calculando...');
      const latency = sent.createdTimestamp - interaction.createdTimestamp;
      const apiLatency = Math.round(client.ws.ping);
      
      await sent.edit(`🏓 Pong!\n📡 Latência: ${latency}ms\n💓 API: ${apiLatency}ms`);
    }
  }
};
