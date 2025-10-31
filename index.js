require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
});

client.commands = new Collection();

const PREFIX = process.env.PREFIX || '!';

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  
  if ('name' in command && 'execute' in command) {
    client.commands.set(command.name, command);
    
    if (command.aliases && Array.isArray(command.aliases)) {
      for (const alias of command.aliases) {
        client.commands.set(alias, command);
      }
    }
    
    console.log(`✅ Comando carregado: ${command.name}`);
  } else {
    console.log(`⚠️ Comando em ${file} está faltando "name" ou "execute"`);
  }
}

client.once('ready', () => {
  console.log(`✅ Bot online como ${client.user.tag}`);
  console.log(`🔧 Prefixo: ${PREFIX}`);
  console.log(`📊 Servidores: ${client.guilds.cache.size}`);
  console.log(`🎮 Comandos carregados: ${client.commands.size}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName);

  if (!command) return;

  try {
    await command.execute(message, args, client, PREFIX);
  } catch (error) {
    console.error(`❌ Erro ao executar comando ${commandName}:`, error);
    
    try {
      await message.reply('❌ Houve um erro ao executar este comando!');
    } catch (replyError) {
      console.error('❌ Não foi possível enviar mensagem de erro:', replyError);
    }
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`❌ Comando ${interaction.commandName} não encontrado!`);
    return;
  }

  try {
    await command.execute(interaction, [], client, PREFIX);
  } catch (error) {
    console.error(`❌ Erro ao executar comando slash ${interaction.commandName}:`, error);
    
    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: '❌ Houve um erro ao executar este comando!', ephemeral: true });
      } else {
        await interaction.reply({ content: '❌ Houve um erro ao executar este comando!', ephemeral: true });
      }
    } catch (replyError) {
      console.error('❌ Não foi possível enviar mensagem de erro:', replyError);
    }
  }
});

const token = process.env.DISCORD_TOKEN;

if (!token) {
  console.error('❌ ERRO: Token do Discord não encontrado!');
  console.error('📝 Configure a variável de ambiente DISCORD_TOKEN');
  process.exit(1);
}

client.login(token).catch(err => {
  console.error('❌ Erro ao fazer login:', err.message);
  process.exit(1);
});
