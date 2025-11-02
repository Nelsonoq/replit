import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
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

export default {
  data: new SlashCommandBuilder()
    .setName("list-birthdays")
    .setDescription("List all birthdays saved on this server"),

  async execute(interaction, client) {
    const birthdays = loadBirthdays().filter(
      (b) => b.guildId === interaction.guild.id,
    );

    if (birthdays.length === 0) {
      return interaction.reply({
        content: "📭 No birthdays saved on this server yet!",
        flags: 64,
      });
    }

    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // Ordenar por mês e dia
    birthdays.sort((a, b) => {
      if (a.month !== b.month) return a.month - b.month;
      return a.day - b.day;
    });

    const embed = new EmbedBuilder()
      .setColor(0xff69b4)
      .setTitle("🎂 Server Birthdays")
      .setDescription(
        birthdays
          .map(
            (b) =>
              `<@${b.userId}> - **${b.day} ${months[b.month - 1]}** ${b.ping ? "🔔" : "🔕"}`,
          )
          .join("\n"),
      )
      .setFooter({ text: `Total: ${birthdays.length}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
