module.exports = {
  name: 'ping',
  description: 'Verifica a latência do bot',
  async execute(message, args, client) {
    const sent = await message.reply('🏓 Calculando...');
    const latency = sent.createdTimestamp - message.createdTimestamp;
    const apiLatency = Math.round(client.ws.ping);
    
    await sent.edit(`🏓 Pong!\n📡 Latência: ${latency}ms\n💓 API: ${apiLatency}ms`);
  }
};
