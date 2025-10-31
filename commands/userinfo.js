module.exports = {
  name: 'userinfo',
  description: 'Mostra informações sobre um usuário',
  async execute(message) {
    const user = message.mentions.users.first() || message.author;
    const member = message.guild.members.cache.get(user.id);

    const embed = {
      color: 0xff00ff,
      title: '👤 Informações do Usuário',
      thumbnail: {
        url: user.displayAvatarURL({ dynamic: true, size: 256 })
      },
      fields: [
        {
          name: '👤 Nome',
          value: user.tag,
          inline: true
        },
        {
          name: '🆔 ID',
          value: user.id,
          inline: true
        },
        {
          name: '🤖 Bot',
          value: user.bot ? 'Sim' : 'Não',
          inline: true
        },
        {
          name: '📅 Conta criada em',
          value: user.createdAt.toLocaleDateString('pt-BR'),
          inline: false
        },
        {
          name: '📥 Entrou no servidor em',
          value: member ? member.joinedAt.toLocaleDateString('pt-BR') : 'Não disponível',
          inline: false
        }
      ],
      timestamp: new Date()
    };

    await message.reply({ embeds: [embed] });
  }
};
