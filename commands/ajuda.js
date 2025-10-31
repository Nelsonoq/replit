const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  name: 'ajuda',
  aliases: ['help'],
  description: 'Mostra a lista de comandos disponíveis',
  data: new SlashCommandBuilder()
    .setName('ajuda')
    .setDescription('Mostra a lista de comandos disponíveis'),
  async execute(interaction, args, client, PREFIX = '!') {
    const isSlash = interaction.isCommand?.();
    const user = isSlash ? interaction.user : interaction.author;
    
    const embed = {
      color: 0x0099ff,
      title: '📚 Lista de Comandos',
      description: isSlash 
        ? 'Você pode usar comandos com `/` (slash) ou com prefixo `!`'
        : `Prefixo: \`${PREFIX}\``,
      fields: [
        {
          name: isSlash ? '/ping' : `${PREFIX}ping`,
          value: 'Verifica a latência do bot',
          inline: false
        },
        {
          name: isSlash ? '/ajuda' : `${PREFIX}ajuda`,
          value: 'Mostra esta mensagem de ajuda',
          inline: false
        },
        {
          name: isSlash ? '/serverinfo' : `${PREFIX}serverinfo`,
          value: 'Mostra informações sobre o servidor',
          inline: false
        },
        {
          name: isSlash ? '/userinfo' : `${PREFIX}userinfo`,
          value: 'Mostra informações sobre um usuário',
          inline: false
        }
      ],
      timestamp: new Date(),
      footer: {
        text: `Solicitado por ${user.tag}`,
        icon_url: user.displayAvatarURL()
      }
    };

    await interaction.reply({ embeds: [embed] });
  }
};
