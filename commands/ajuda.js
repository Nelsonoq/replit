module.exports = {
  name: 'ajuda',
  aliases: ['help'],
  description: 'Mostra a lista de comandos disponíveis',
  async execute(message, args, client, PREFIX) {
    const embed = {
      color: 0x0099ff,
      title: '📚 Lista de Comandos',
      description: `Prefixo: \`${PREFIX}\``,
      fields: [
        {
          name: `${PREFIX}ping`,
          value: 'Verifica a latência do bot',
          inline: false
        },
        {
          name: `${PREFIX}ajuda`,
          value: 'Mostra esta mensagem de ajuda',
          inline: false
        },
        {
          name: `${PREFIX}serverinfo`,
          value: 'Mostra informações sobre o servidor',
          inline: false
        },
        {
          name: `${PREFIX}userinfo [@usuário]`,
          value: 'Mostra informações sobre um usuário',
          inline: false
        }
      ],
      timestamp: new Date(),
      footer: {
        text: `Solicitado por ${message.author.tag}`,
        icon_url: message.author.displayAvatarURL()
      }
    };

    await message.reply({ embeds: [embed] });
  }
};
