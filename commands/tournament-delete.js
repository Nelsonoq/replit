import {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} from "discord.js";
import {
  loadTournaments,
  deleteTournament,
} from "../utils/tournament-manager.js";
// import { removeTournamentTab } from "../utils/google-sheets-manager.js";

export default {
  data: new SlashCommandBuilder()
    .setName("tournament-delete")
    .setDescription("Delete a tournament")
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

    const guildTournaments = tournaments.filter(
      (t) => t.guildId === interaction.guild.id,
    );

    const focusedValue = interaction.options.getFocused().toLowerCase();

    const filtered = guildTournaments
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

    const tournamentId = interaction.options.getString("tournament");
    const tournaments = loadTournaments();

    const tournament = tournaments.find(
      (t) => t.id === tournamentId && t.guildId === interaction.guild.id,
    );

    if (!tournament) {
      return interaction.reply({
        content: "❌ Tournament not found!",
        flags: 64,
      });
    }

    const confirmButton = new ButtonBuilder()
      .setCustomId("confirm_delete")
      .setLabel("Yes, delete tournament")
      .setStyle(ButtonStyle.Danger);

    const cancelButton = new ButtonBuilder()
      .setCustomId("cancel_delete")
      .setLabel("Cancel")
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder().addComponents(
      confirmButton,
      cancelButton,
    );

    const embed = new EmbedBuilder()
      .setColor(0xff0000)
      .setTitle("⚠️ Delete Tournament")
      .setDescription(
        `Are you sure you want to delete **${tournament.name}**?\n\n` +
          `**Tournament ID:** \`${tournament.id}\`\n` +
          `**Players:** ${tournament.players.length}\n` +
          `**Status:** ${tournament.status}\n\n` +
          `⚠️ **This action cannot be undone!**`,
      )
      .setTimestamp();

    const message = await interaction.reply({
      embeds: [embed],
      components: [row],
      fetchReply: true,
    });

    const collector = message.createMessageComponentCollector({ time: 30000 });

    collector.on("collect", async (i) => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({
          content: "❌ Only the command user can use these buttons!",
          flags: 64,
        });
      }

      if (i.customId === "confirm_delete") {
        deleteTournament(tournamentId, interaction.guild.id);

        // try {
        //   await removeTournamentTab(interaction.guild.id, tournamentId);
        // } catch (err) {
        //   console.error("❌ Error removing Google Sheet tab:", err);
        // }

        const successEmbed = new EmbedBuilder()
          .setColor(0x00ff00)
          .setDescription(
            `✅ Tournament **${tournament.name}** has been deleted successfully!`,
          )
          .setFooter({
            text: `Deleted by ${interaction.user.tag}`,
            iconURL: interaction.user.displayAvatarURL(),
          })
          .setTimestamp();

        await i.update({ embeds: [successEmbed], components: [] });
        collector.stop();
      } else if (i.customId === "cancel_delete") {
        const cancelEmbed = new EmbedBuilder()
          .setColor(0x808080)
          .setDescription("❌ Deletion cancelled.")
          .setTimestamp();

        await i.update({ embeds: [cancelEmbed], components: [] });
        collector.stop();
      }
    });

    collector.on("end", (collected, reason) => {
      if (reason === "time") {
        const timeoutEmbed = new EmbedBuilder()
          .setColor(0x808080)
          .setDescription("⏱️ Deletion cancelled - timed out after 30 seconds.")
          .setTimestamp();

        interaction.editReply({ embeds: [timeoutEmbed], components: [] });
      }
    });
  },
};
