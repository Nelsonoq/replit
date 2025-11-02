// import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// const dataPath = path.join(__dirname, "..", "data", "birthdays.json");

// function loadBirthdays() {
//   if (!fs.existsSync(dataPath)) return [];
//   const data = fs.readFileSync(dataPath, "utf-8");
//   return JSON.parse(data);
// }

// function saveBirthdays(birthdays) {
//   fs.writeFileSync(dataPath, JSON.stringify(birthdays, null, 2));
// }

// export default {
//   data: new SlashCommandBuilder()
//     .setName("remove-birthday")
//     .setDescription("Remove your birthday from the server"),

//   async execute(interaction, client) {
//     const user = interaction.user;
//     const birthdays = loadBirthdays();

//     const index = birthdays.findIndex(
//       (b) => b.userId === user.id && b.guildId === interaction.guild.id
//     );

//     if (index === -1) {
//       return interaction.reply({
//         content: "❌ You don't have a birthday set on this server!",
//         flags: 64,
//       });
//     }

//     birthdays.splice(index, 1);
//     saveBirthdays(birthdays);

//     // Embed bonito
//     const embed = new EmbedBuilder()
//       .setColor(0x00ff00)
//       .setDescription(
//         `✅ ${user}, your birthday setup has been removed from this server!`
//       )
//       .setTimestamp();

//     await interaction.reply({ embeds: [embed] });
//   },
// };