import {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
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
    .setName("purge-birthdays")
    .setDescription(
      "Purge configured birthdays for members no longer on this server",
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction, client) {
    // Verificar se tem permissão
    if (
      !interaction.member.permissions.has(PermissionFlagsBits.Administrator)
    ) {
      return interaction.reply({
        content: "❌ You don't have permission to use this command!",
        flags: 64,
      });
    }

    await interaction.deferReply();

    const birthdays = loadBirthdays();
    const guildBirthdays = birthdays.filter(
      (b) => b.guildId === interaction.guild.id,
    );

    if (guildBirthdays.length === 0) {
      return interaction.editReply({
        content: "❌ No birthdays configured on this server!",
      });
    }

    // Verificar quais users já não estão no servidor
    const toRemove = [];

    for (const birthday of guildBirthdays) {
      try {
        await interaction.guild.members.fetch(birthday.userId);
        // User ainda está no servidor, não remove
      } catch (err) {
        // User já não está no servidor
        toRemove.push(birthday);
      }
    }

    if (toRemove.length === 0) {
      const embed = new EmbedBuilder()
        .setColor(0x00ff00)
        .setDescription(
          `✅ All configured birthdays (${guildBirthdays.length}) belong to current server members!\n\nNo birthdays need to be purged.`,
        )
        .setTimestamp();

      return interaction.editReply({ embeds: [embed] });
    }

    // Criar botões de confirmação
    const confirmButton = new ButtonBuilder()
      .setCustomId("confirm_purge")
      .setLabel(
        `Yes, purge ${toRemove.length} birthday${toRemove.length > 1 ? "s" : ""}`,
      )
      .setStyle(ButtonStyle.Danger);

    const cancelButton = new ButtonBuilder()
      .setCustomId("cancel_purge")
      .setLabel("Cancel")
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder().addComponents(
      confirmButton,
      cancelButton,
    );

    const embed = new EmbedBuilder()
      .setColor(0xffa500)
      .setTitle("⚠️ Purge Birthdays")
      .setDescription(
        `Found **${toRemove.length}** birthday${toRemove.length > 1 ? "s" : ""} from users no longer on this server.\n\n` +
          `**Total birthdays on server:** ${guildBirthdays.length}\n` +
          `**To be removed:** ${toRemove.length}\n` +
          `**Will remain:** ${guildBirthdays.length - toRemove.length}\n\n` +
          `Do you want to proceed?`,
      )
      .setFooter({ text: "This action cannot be undone!" })
      .setTimestamp();

    const message = await interaction.editReply({
      embeds: [embed],
      components: [row],
    });

    // Coletor de botões (aguarda 30 segundos)
    const collector = message.createMessageComponentCollector({
      time: 30000,
    });

    collector.on("collect", async (i) => {
      // Verificar se quem clicou foi quem usou o comando
      if (i.user.id !== interaction.user.id) {
        return i.reply({
          content: "❌ Only the command user can use these buttons!",
          flags: 64,
        });
      }

      if (i.customId === "confirm_purge") {
        // Remover os aniversários
        const updatedBirthdays = birthdays.filter(
          (b) =>
            !(
              b.guildId === interaction.guild.id &&
              toRemove.some((tr) => tr.userId === b.userId)
            ),
        );

        saveBirthdays(updatedBirthdays);

        const successEmbed = new EmbedBuilder()
          .setColor(0x00ff00)
          .setDescription(
            `✅ Successfully purged **${toRemove.length}** birthday${toRemove.length > 1 ? "s" : ""} from users no longer on this server!`,
          )
          .setFooter({
            text: `Purged by ${interaction.user.tag}`,
            iconURL: interaction.user.displayAvatarURL(),
          })
          .setTimestamp();

        await i.update({ embeds: [successEmbed], components: [] });
        collector.stop();
      } else if (i.customId === "cancel_purge") {
        const cancelEmbed = new EmbedBuilder()
          .setColor(0x808080)
          .setDescription("❌ Purge cancelled.")
          .setTimestamp();

        await i.update({ embeds: [cancelEmbed], components: [] });
        collector.stop();
      }
    });

    collector.on("end", (collected, reason) => {
      if (reason === "time") {
        const timeoutEmbed = new EmbedBuilder()
          .setColor(0x808080)
          .setDescription("⏱️ Purge cancelled - timed out after 30 seconds.")
          .setTimestamp();

        interaction.editReply({ embeds: [timeoutEmbed], components: [] });
      }
    });
  },
};
