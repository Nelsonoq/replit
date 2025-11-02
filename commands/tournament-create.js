import {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} from "discord.js";
import {
  loadTournaments,
  saveTournaments,
  generateTournamentId,
} from "../utils/tournament-manager.js";
// import { updateTournamentTab } from "../utils/google-sheets-manager.js";

export default {
  data: new SlashCommandBuilder()
    .setName("tournament-create")
    .setDescription("Create a new tournament")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("Tournament name")
        .setRequired(true)
        .setMaxLength(100),
    )
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("Tournament type")
        .setRequired(true)
        .addChoices(
          { name: "Single Elimination", value: "single_elimination" },
          { name: "Double Elimination", value: "double_elimination" },
          { name: "Round Robin", value: "round_robin" },
          { name: "Swiss", value: "swiss" },
        ),
    )
    .addIntegerOption((option) =>
      option
        .setName("max-players")
        .setDescription("Maximum number of players (leave empty for unlimited)")
        .setRequired(false)
        .setMinValue(2)
        .setMaxValue(128),
    )
    .addStringOption((option) =>
      option
        .setName("description")
        .setDescription("Tournament description")
        .setRequired(false)
        .setMaxLength(500),
    ),

  async execute(interaction, client) {
    if (
      !interaction.member.permissions.has(PermissionFlagsBits.Administrator)
    ) {
      return interaction.reply({
        content: "❌ You don't have permission to use this command!",
        flags: 64,
      });
    }

    const name = interaction.options.getString("name");
    const type = interaction.options.getString("type");
    const maxPlayers = interaction.options.getInteger("max-players");
    const description =
      interaction.options.getString("description") || "No description provided";

    const tournaments = loadTournaments();

    const existing = tournaments.find(
      (t) =>
        t.guildId === interaction.guild.id &&
        t.name.toLowerCase() === name.toLowerCase() &&
        t.status !== "completed",
    );

    if (existing) {
      return interaction.reply({
        content: `❌ A tournament with the name "**${name}**" already exists!\nUse \`/tournament-delete ${existing.id}\` to remove it first.`,
        flags: 64,
      });
    }

    const tournamentId = generateTournamentId();

    const typeNames = {
      single_elimination: "Single Elimination",
      double_elimination: "Double Elimination",
      round_robin: "Round Robin",
      swiss: "Swiss",
    };

    const tournament = {
      id: tournamentId,
      guildId: interaction.guild.id,
      channelId: interaction.channel.id,
      name: name,
      type: type,
      description: description,
      maxPlayers: maxPlayers || null,
      players: [],
      status: "registration_open",
      bracket: null,
      createdAt: new Date().toISOString(),
      createdBy: interaction.user.id,
    };

    tournaments.push(tournament);
    saveTournaments(tournaments);

    // Atualizar Google Sheet
    // try {
    //   await updateTournamentTab(
    //     interaction.guild.id,
    //     interaction.guild.name,
    //     tournament,
    //   );
    // } catch (err) {
    //   console.error("❌ Error updating Google Sheet:", err);
    // }

    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle(`🏆 Tournament Created: ${name}`)
      .setDescription(description)
      .addFields(
        { name: "🆔 ID", value: `\`${tournamentId}\``, inline: true },
        { name: "🎮 Type", value: typeNames[type], inline: true },
        {
          name: "👥 Max Players",
          value: maxPlayers ? maxPlayers.toString() : "Unlimited",
          inline: true,
        },
        { name: "📊 Status", value: "🟢 Registration Open", inline: true },
        { name: "👤 Registered", value: "0 players", inline: true },
        {
          name: "📅 Created",
          value: `<t:${Math.floor(Date.now() / 1000)}:R>`,
          inline: true,
        },
      )
      .setFooter({
        text: `Created by ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    const registerEmbed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(`🏆 ${name} - Registration Open!`)
      .setDescription(
        `${description}\n\n**Tournament ID:** \`${tournamentId}\`\n**Type:** ${typeNames[type]}\n**Max Players:** ${maxPlayers || "Unlimited"}\n\nUse \`/tournament-register\` to join!`,
      )
      .setThumbnail(interaction.guild.iconURL())
      .setTimestamp();

    await interaction.channel.send({ embeds: [registerEmbed] });
  },
};
