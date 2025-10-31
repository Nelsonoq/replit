# Bot do Discord em Node.js

## 📋 Visão Geral
Bot do Discord desenvolvido em Node.js usando a biblioteca discord.js. O bot possui um sistema de comandos modular que suporta tanto comandos com prefixo quanto comandos slash (/) nativos do Discord.

## 🎯 Status Atual
- ✅ Configuração básica do bot
- ✅ Sistema de comandos modulares e escalável
- ✅ Comandos básicos implementados
- ✅ Handler de eventos para mensagens
- ✅ Suporte a comandos slash (/)
- ✅ Compatibilidade com comandos de prefixo e slash

## 🚀 Funcionalidades MVP

### Comandos Disponíveis
Todos os comandos funcionam tanto com prefixo `!` quanto com slash `/`:

- **!ping** ou **/ping** - Verifica a latência do bot e da API do Discord
- **!ajuda** ou **/ajuda** - Exibe a lista de comandos disponíveis
- **!serverinfo** ou **/serverinfo** - Mostra informações detalhadas sobre o servidor
- **!userinfo [@usuário]** ou **/userinfo [usuário]** - Mostra informações sobre um usuário

## 🔧 Configuração

### Variáveis de Ambiente Necessárias
- `DISCORD_TOKEN` - Token do bot do Discord (obrigatório)
- `CLIENT_ID` - ID da aplicação do Discord (obrigatório para comandos slash)
- `PREFIX` - Prefixo dos comandos (padrão: !)

### Como Obter o Token e Client ID
1. Acesse o [Discord Developer Portal](https://discord.com/developers/applications)
2. Crie uma nova aplicação ou selecione uma existente
3. Em **"General Information"**, copie o **"APPLICATION ID"** (este é o CLIENT_ID)
4. Vá para a seção **"Bot"** no menu lateral
5. Clique em "Reset Token" ou "Copy" para copiar o token
6. Configure as variáveis de ambiente no Replit:
   - `DISCORD_TOKEN` com o token do bot
   - `CLIENT_ID` com o Application ID

### Permissões Necessárias
O bot precisa das seguintes permissões:
- Ler Mensagens
- Enviar Mensagens
- Inserir Links
- Anexar Arquivos
- Ler Histórico de Mensagens
- Usar Emojis Externos

### Intents Necessárias
No Discord Developer Portal, ative estas intents:
- **MESSAGE CONTENT INTENT** (obrigatório para ler conteúdo de mensagens)
- Presence Intent (opcional)
- Server Members Intent (opcional)

## 📦 Dependências
- `discord.js` - Biblioteca oficial do Discord para Node.js
- `dotenv` - Gerenciamento de variáveis de ambiente

## 🎨 Arquitetura

### Estrutura do Projeto
```
discord-bot/
├── commands/           # Pasta com todos os comandos do bot
│   ├── ping.js         # Comando de latência
│   ├── ajuda.js        # Comando de ajuda
│   ├── serverinfo.js   # Informações do servidor
│   └── userinfo.js     # Informações de usuário
├── index.js            # Arquivo principal do bot
├── deploy-commands.js  # Script para registrar comandos slash
├── package.json        # Configuração do projeto e dependências
├── .env.example        # Exemplo de variáveis de ambiente
├── .gitignore          # Arquivos ignorados pelo git
└── replit.md           # Documentação do projeto
```

### Sistema de Comandos Modular e Híbrido
O bot utiliza um sistema de comandos escalável que suporta tanto prefixo quanto slash:
- Comandos são carregados automaticamente da pasta `commands/`
- Cada comando tem `name`, `description`, `data` (SlashCommandBuilder), `execute()` e opcionalmente `aliases`
- Novos comandos podem ser adicionados simplesmente criando um novo arquivo na pasta `commands/`
- Suporte a aliases permite múltiplos nomes para o mesmo comando (apenas prefixo)
- Comandos funcionam tanto com mensagens de texto quanto com interactions

### Fluxo de Funcionamento
1. Bot inicia e carrega todos os comandos da pasta `commands/`
2. Armazena comandos em uma Collection do discord.js
3. Conecta ao Discord e escuta eventos de mensagens e interactions
4. **Para comandos de prefixo:**
   - Verifica se a mensagem começa com o prefixo
   - Busca o comando na Collection (usando nome ou alias)
   - Executa o comando com a mensagem
5. **Para comandos slash:**
   - Detecta interaction do tipo comando
   - Busca o comando na Collection pelo nome
   - Executa o comando com a interaction
6. Responde ao usuário com a informação solicitada

## ⚡ Como Ativar Comandos Slash

Para usar os comandos slash (/), você precisa registrá-los na API do Discord:

### 1️⃣ Configure as Variáveis de Ambiente
Certifique-se de ter configurado:
- `DISCORD_TOKEN` - Token do bot
- `CLIENT_ID` - Application ID do Discord Developer Portal

### 2️⃣ Registre os Comandos Slash
Execute o script de deploy uma única vez:
```bash
node deploy-commands.js
```

Você verá a mensagem:
```
✅ Comando slash preparado: ping
✅ Comando slash preparado: ajuda
✅ Comando slash preparado: serverinfo
✅ Comando slash preparado: userinfo
✅ 4 comandos slash registrados com sucesso!
```

### 3️⃣ Pronto!
Agora você pode usar os comandos slash no Discord:
- Digite `/` no chat e você verá os comandos do bot aparecerem com autocompletar
- Escolha um comando e ele mostrará as opções disponíveis

**Observações:**
- Você só precisa registrar os comandos uma vez (ou quando adicionar novos comandos)
- Comandos slash podem demorar até 1 hora para aparecer globalmente
- Para aparecer instantaneamente em um servidor específico, use comandos de guild (veja deploy-commands.js)

## 🔄 Próximas Funcionalidades (Fase 2)
- [ ] Sistema de moderação (kick, ban, mute)
- [ ] Comandos de utilidade (avatar, roleinfo)
- [ ] Sistema de logs para ações do servidor
- [ ] Comandos de diversão (8ball, dado, piada)
- [ ] Sistema de configuração por servidor

## 📝 Mudanças Recentes
**31 de Outubro de 2025**
- Configuração inicial do projeto
- Implementação do sistema de comandos modulares e escalável
- Criação dos comandos: ping, ajuda, serverinfo, userinfo
- Configuração do workflow para execução do bot
- Refatoração para arquitetura modular com pasta commands/
- Sistema de carregamento dinâmico de comandos
- Suporte a aliases de comandos
- Tratamento robusto de erros em comandos
- **Implementação de comandos slash (/) nativos do Discord**
- **Sistema híbrido: comandos funcionam com prefixo ! e slash /**
- **Script de registro automático de comandos slash**

## 🎓 Como Usar

### Configuração Inicial
1. Configure as variáveis de ambiente:
   - `DISCORD_TOKEN` - Token do bot
   - `CLIENT_ID` - Application ID
   - `PREFIX` (opcional) - Prefixo personalizado (padrão: !)
2. Ative o **MESSAGE CONTENT INTENT** no Discord Developer Portal
3. Convide o bot para seu servidor Discord
4. (Opcional) Registre os comandos slash executando: `node deploy-commands.js`
5. Execute o bot clicando no botão "Run"

### Usando os Comandos
- **Comandos de prefixo:** Digite `!ping`, `!ajuda`, etc.
- **Comandos slash:** Digite `/ping`, `/ajuda`, etc. (após registrar)

## ⚠️ Observações Importantes
- O bot precisa da intent MESSAGE CONTENT habilitada no Discord Developer Portal
- Sem o token configurado, o bot não conseguirá iniciar
- O prefixo padrão é "!" mas pode ser alterado na variável de ambiente PREFIX
