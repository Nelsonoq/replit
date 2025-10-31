# Bot do Discord em Node.js

## 📋 Visão Geral
Bot do Discord desenvolvido em Node.js usando a biblioteca discord.js. O bot possui um sistema de comandos com prefixo personalizável e funcionalidades básicas de informação e utilidade.

## 🎯 Status Atual
- ✅ Configuração básica do bot
- ✅ Sistema de comandos com prefixo
- ✅ Comandos básicos implementados
- ✅ Handler de eventos para mensagens

## 🚀 Funcionalidades MVP

### Comandos Disponíveis
- **!ping** - Verifica a latência do bot e da API do Discord
- **!ajuda** ou **!help** - Exibe a lista de comandos disponíveis
- **!serverinfo** - Mostra informações detalhadas sobre o servidor
- **!userinfo [@usuário]** - Mostra informações sobre um usuário (mencione ou deixe em branco para ver suas próprias informações)

## 🔧 Configuração

### Variáveis de Ambiente Necessárias
- `DISCORD_TOKEN` - Token do bot do Discord (obrigatório)
- `PREFIX` - Prefixo dos comandos (padrão: !)

### Como Obter o Token do Bot
1. Acesse o [Discord Developer Portal](https://discord.com/developers/applications)
2. Crie uma nova aplicação ou selecione uma existente
3. Vá para a seção "Bot" no menu lateral
4. Clique em "Reset Token" ou "Copy" para copiar o token
5. Configure a variável de ambiente `DISCORD_TOKEN` no Replit

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
├── commands/         # Pasta com todos os comandos do bot
│   ├── ping.js       # Comando de latência
│   ├── ajuda.js      # Comando de ajuda
│   ├── serverinfo.js # Informações do servidor
│   └── userinfo.js   # Informações de usuário
├── index.js          # Arquivo principal do bot
├── package.json      # Configuração do projeto e dependências
├── .env.example      # Exemplo de variáveis de ambiente
├── .gitignore        # Arquivos ignorados pelo git
└── replit.md         # Documentação do projeto
```

### Sistema de Comandos Modular
O bot utiliza um sistema de comandos escalável onde cada comando é um módulo independente:
- Comandos são carregados automaticamente da pasta `commands/`
- Cada comando tem sua própria estrutura com `name`, `description`, `execute()` e opcionalmente `aliases`
- Novos comandos podem ser adicionados simplesmente criando um novo arquivo na pasta `commands/`
- Suporte a aliases permite múltiplos nomes para o mesmo comando

### Fluxo de Funcionamento
1. Bot inicia e carrega todos os comandos da pasta `commands/`
2. Armazena comandos em uma Collection do discord.js
3. Conecta ao Discord e escuta eventos de mensagens
4. Verifica se a mensagem começa com o prefixo
5. Busca o comando na Collection (usando nome ou alias)
6. Executa o comando encontrado com tratamento de erros
7. Responde ao usuário com a informação solicitada

## 🔄 Próximas Funcionalidades (Fase 2)
- [ ] Comandos slash (/) nativos do Discord
- [ ] Sistema de moderação (kick, ban, mute)
- [ ] Comandos de utilidade (avatar, roleinfo)
- [ ] Sistema de logs para ações do servidor
- [ ] Comandos de diversão (8ball, dado, piada)

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

## 🎓 Como Usar
1. Configure o token do bot nas variáveis de ambiente
2. Convide o bot para seu servidor Discord
3. Execute o bot clicando no botão "Run"
4. Use os comandos no chat do Discord com o prefixo !

## ⚠️ Observações Importantes
- O bot precisa da intent MESSAGE CONTENT habilitada no Discord Developer Portal
- Sem o token configurado, o bot não conseguirá iniciar
- O prefixo padrão é "!" mas pode ser alterado na variável de ambiente PREFIX
