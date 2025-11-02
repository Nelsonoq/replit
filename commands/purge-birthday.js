import {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} from "discord.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.join(__dirname, "..", "data", "birthdays.json");

function loadBirthdays() {
  if (!fs.existsSync(dataPath)) return [];
  const data = fs.readFileSync(dataPath, "utf-8");
  return JSON.parse(data);
}

function saveBirthdays(birthdays) {
  fs.writeFileSync(dataPath, JSON.stringify(birthdays, null, 2));
}

export default {
  data: new SlashCommandBuilder()
    .setName("purge-birthday")
    .setDescription("Purge a user's configured birthday on this server")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user whose birthday to remove")
        .setRequired(true),
    ),

  async execute(interaction, client) {
    // Verificar se tem permissão (dupla verificação)
    if (
      !interaction.member.permissions.has(PermissionFlagsBits.Administrator)
    ) {
      return interaction.reply({
        content: "❌ You don't have permission to use this command!",
        flags: 64,
      });
    }

    const targetUser = interaction.options.getUser("user");
    const birthdays = loadBirthdays();

    const index = birthdays.findIndex(
      (b) => b.userId === targetUser.id && b.guildId === interaction.guild.id,
    );

    if (index === -1) {
      return interaction.reply({
        content: `❌ ${targetUser} doesn't have a birthday set on this server!`,
        flags: 64,
      });
    }

    birthdays.splice(index, 1);
    saveBirthdays(birthdays);

    const embed = new EmbedBuilder()
      .setColor(0xff0000)
      .setDescription(
        `🗑️ Successfully purged ${targetUser}'s birthday from this server.`,
      )
      .setFooter({
        text: `Purged by ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
