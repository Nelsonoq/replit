import {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} from "discord.js";
import {
  loadTournaments,
  saveTournaments,
} from "../utils/tournament-manager.js";

function generateSingleElimination(players) {
  const shuffled = [...players].sort(() => Math.random() - 0.5);
  const nextPowerOf2 = Math.pow(2, Math.ceil(Math.log2(shuffled.length)));

  const bracket = { rounds: [] };
  const round1 = [];
  let playerIndex = 0;

  for (let i = 0; i < nextPowerOf2 / 2; i++) {
    const match = {
      matchId: `R1-M${i + 1}`,
      player1: shuffled[playerIndex] || null,
      player2: shuffled[playerIndex + 1] || null,
      winner: null,
    };

    if (!match.player2 && match.player1) {
      match.winner = match.player1.userId;
    }

    round1.push(match);
    playerIndex += 2;
  }

  bracket.rounds.push({ roundName: "Round 1", matches: round1 });

  let roundNumber = 2;
  let previousRound = round1;

  while (previousRound.length > 1) {
    const currentRound = [];

    for (let i = 0; i < previousRound.length; i += 2) {
      currentRound.push({
        matchId: `R${roundNumber}-M${currentRound.length + 1}`,
        player1: null,
        player2: null,
        winner: null,
      });
    }

    const roundName =
      currentRound.length === 1 ? "Final" : `Round ${roundNumber}`;
    bracket.rounds.push({ roundName, matches: currentRound });
    previousRound = currentRound;
    roundNumber++;
  }

  return bracket;
}

function generateRoundRobin(players) {
  const matches = [];
  let matchId = 1;

  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      matches.push({
        matchId: `M${matchId}`,
        player1: players[i],
        player2: players[j],
        winner: null,
      });
      matchId++;
    }
  }

  return {
    type: "round_robin",
    matches,
    standings: players.map((p) => ({
      userId: p.userId,
      username: p.username,
      wins: 0,
      losses: 0,
    })),
  };
}

export default {
  data: new SlashCommandBuilder()
    .setName("tournament-generate-bracket")
    .setDescription("Generate tournament bracket")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((option) =>
      option
        .setName("tournament")
        .setDescription("Select tournament")
        .setRequired(true)
        .setAutocomplete(true),
    ),

  async autocomplete(interaction) {
    const tournaments = loadTournaments();

    const closedTournaments = tournaments.filter(
      (t) =>
        t.guildId === interaction.guild.id &&
        t.status === "registration_closed",
    );

    const focusedValue = interaction.options.getFocused().toLowerCase();

    const filtered = closedTournaments
      .filter(
        (t) =>
          t.name.toLowerCase().includes(focusedValue) ||
          t.id.toLowerCase().includes(focusedValue),
      )
      .slice(0, 25);

    await interaction.respond(
      filtered.map((t) => ({
        name: `${t.name} (${t.players.length} players) - ${t.id}`,
        value: t.id,
      })),
    );
  },

  async execute(interaction, client) {
    if (
      !interaction.member.permissions.has(PermissionFlagsBits.Administrator)
    ) {
      return interaction.reply({
        content: "❌ You don't have permission to use this command!",
        flags: 64,
      });
    }

    await interaction.deferReply();

    const tournamentId = interaction.options.getString("tournament");
    const tournaments = loadTournaments();

    const tournamentIndex = tournaments.findIndex(
      (t) => t.id === tournamentId && t.guildId === interaction.guild.id,
    );

    if (tournamentIndex === -1) {
      return interaction.editReply({ content: "❌ Tournament not found!" });
    }

    const tournament = tournaments[tournamentIndex];

    if (tournament.status !== "registration_closed") {
      return interaction.editReply({
        content: `❌ Cannot generate bracket - registration is not closed for **${tournament.name}**!`,
      });
    }

    if (tournament.bracket) {
      return interaction.editReply({
        content: `❌ Bracket already generated for **${tournament.name}**!`,
      });
    }

    let bracket;

    switch (tournament.type) {
      case "single_elimination":
        bracket = generateSingleElimination(tournament.players);
        break;
      case "round_robin":
        bracket = generateRoundRobin(tournament.players);
        break;
      case "double_elimination":
        return interaction.editReply({
          content:
            "❌ Double Elimination is not yet implemented! Use Single Elimination or Round Robin for now.",
        });
      case "swiss":
        return interaction.editReply({
          content:
            "❌ Swiss is not yet implemented! Use Single Elimination or Round Robin for now.",
        });
      default:
        return interaction.editReply({
          content: "❌ Invalid tournament type!",
        });
    }

    tournament.bracket = bracket;
    tournament.status = "in_progress";
    tournaments[tournamentIndex] = tournament;
    saveTournaments(tournaments);

    let bracketText = "";

    if (tournament.type === "single_elimination") {
      bracket.rounds.forEach((round) => {
        bracketText += `\n**${round.roundName}**\n`;
        round.matches.forEach((match) => {
          const p1 = match.player1 ? match.player1.username : "BYE";
          const p2 = match.player2 ? match.player2.username : "BYE";
          const winner = match.winner ? " ✅" : "";
          bracketText += `${match.matchId}: ${p1} vs ${p2}${winner}\n`;
        });
      });
    } else if (tournament.type === "round_robin") {
      bracketText += `\n**All Matches**\n`;
      bracket.matches.forEach((match) => {
        bracketText += `${match.matchId}: ${match.player1.username} vs ${match.player2.username}\n`;
      });
    }

    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle(`🏆 Bracket Generated: ${tournament.name}`)
      .setDescription(
        `The tournament bracket has been generated!\n\n${bracketText.substring(0, 2000)}`,
      )
      .addFields(
        { name: "📊 Status", value: "🔵 In Progress", inline: true },
        {
          name: "👥 Players",
          value: tournament.players.length.toString(),
          inline: true,
        },
        {
          name: "🎮 Type",
          value:
            tournament.type === "single_elimination"
              ? "Single Elimination"
              : "Round Robin",
          inline: true,
        },
      )
      .setFooter({
        text: `Generated by ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
