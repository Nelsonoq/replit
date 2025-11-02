import {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} from "discord.js";
import { getSheetUrl } from "../utils/google-sheets-manager.js";

export default {
  data: new SlashCommandBuilder()
    .setName("tournament-sheet-link")
    .setDescription("Get the Google Sheets link for tournaments")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction, client) {
    if (
      !interaction.member.permissions.has(PermissionFlagsBits.Administrator)
    ) {
      return interaction.reply({
        content: "❌ You don't have permission to use this command!",
        flags: 64,
      });
    }

    try {
      await interaction.deferReply();

      const { url, existed } = await getSheetUrl(
        interaction.guild.id,
        interaction.guild.name,
      );

      const embed = new EmbedBuilder()
        .setColor(0x00ff00)
        .setTitle("📊 Tournament Google Sheet")
        .setDescription(
          existed
            ? "Here's your tournament tracking sheet!"
            : "A new Google Sheet has been created for your server!",
        )
        .addFields({
          name: "🔗 Link",
          value: `[Click here to open](${url})`,
          inline: false,
        })
        .setFooter({
          text: "This sheet updates automatically in real-time!",
        })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error("❌ Error getting Google Sheet link:", err);
      await interaction.editReply({
        content:
          "❌ Error getting Google Sheet link! Make sure google-credentials.json is configured correctly.",
      });
    }
  },
};
