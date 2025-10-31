const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  name: 'userinfo',
  description: 'Mostra informações sobre um usuário',
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Mostra informações sobre um usuário')
    .addUserOption(option =>
      option.setName('usuario')
        .setDescription('O usuário para ver informações')
        .setRequired(false)),
  async execute(interaction) {
    const isSlash = interaction.isCommand?.();
    
    let user, member;
    
    if (isSlash) {
      user = interaction.options.getUser('usuario') || interaction.user;
      member = interaction.guild.members.cache.get(user.id);
    } else {
      user = interaction.mentions.users.first() || interaction.author;
      member = interaction.guild.members.cache.get(user.id);
    }

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

    await interaction.reply({ embeds: [embed] });
  }
};
