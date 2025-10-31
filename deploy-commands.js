require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  
  if ('data' in command) {
    commands.push(command.data.toJSON());
    console.log(`✅ Comando slash preparado: ${command.data.name}`);
  }
}

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;

if (!token || !clientId) {
  console.error('❌ ERRO: DISCORD_TOKEN ou CLIENT_ID não encontrado!');
  console.error('📝 Configure as variáveis de ambiente');
  process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log(`🔄 Registrando ${commands.length} comandos slash...`);

    const data = await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands },
    );

    console.log(`✅ ${data.length} comandos slash registrados com sucesso!`);
  } catch (error) {
    console.error('❌ Erro ao registrar comandos:', error);
  }
})();
