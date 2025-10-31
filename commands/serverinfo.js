module.exports = {
  name: 'serverinfo',
  description: 'Mostra informações sobre o servidor',
  async execute(message) {
    const { guild } = message;
    
    const embed = {
      color: 0x00ff00,
      title: `📊 Informações do Servidor`,
      thumbnail: {
        url: guild.iconURL({ dynamic: true })
      },
      fields: [
        {
          name: '🏷️ Nome',
          value: guild.name,
          inline: true
        },
        {
          name: '🆔 ID',
          value: guild.id,
          inline: true
        },
        {
          name: '👑 Dono',
          value: `<@${guild.ownerId}>`,
          inline: true
        },
        {
          name: '👥 Membros',
          value: guild.memberCount.toString(),
          inline: true
        },
        {
          name: '📅 Criado em',
          value: guild.createdAt.toLocaleDateString('pt-BR'),
          inline: true
        },
        {
          name: '🎭 Roles',
          value: guild.roles.cache.size.toString(),
          inline: true
        }
      ],
      timestamp: new Date()
    };

    await message.reply({ embeds: [embed] });
  }
};
